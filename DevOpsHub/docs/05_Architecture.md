# Task 5: Software Architecture Design

This document details the architectural blueprints for DevOpsHub. It ensures a clear separation of concerns, scalability, and adherence to the ₹0 budget constraint.

---

## 1. High-Level Architecture (HLA)

DevOpsHub acts as a control plane sitting on the same server as the data plane (the user's deployed applications). 

```mermaid
graph TD
    User([Admin User]) -->|HTTPS| Nginx
    Nginx -->|Port 3000| Frontend[React UI]
    Nginx -->|Port 4000| Backend[Node.js + Express API]
    Nginx -->|Dynamic Ports| Apps[Deployed User Applications]
    
    Backend -->|TCP/Socket| Docker[Docker Daemon]
    Backend -->|Read/Write| DB[(PostgreSQL)]
    Backend -->|Git Clone| GitHub[(GitHub Repositories)]
    
    Docker -->|Metrics| Prometheus
    Prometheus --> Grafana
    Grafana -->|Embeds| Frontend
```

---

## 2. Low-Level Architecture (LLA)

### Application Flow (Deployment Execution)

When a user clicks "Deploy", the following sequence occurs internally:

```mermaid
sequenceDiagram
    participant User
    participant React UI
    participant Express API
    participant PostgreSQL
    participant File System
    participant Docker Daemon
    
    User->>React UI: Clicks "Deploy"
    React UI->>Express API: POST /api/deployments { projectId }
    Express API->>PostgreSQL: Create Deployment Record (Status: Pending)
    Express API->>File System: Ensure /deployments/{projectId} exists
    Express API->>Express API: Execute `git pull origin {branch}`
    Express API->>Docker Daemon: Execute `docker-compose up -d --build`
    loop Log Streaming
        Docker Daemon-->>Express API: Stream build logs
        Express API-->>PostgreSQL: Update deployment logs
    end
    Docker Daemon-->>Express API: Container Started successfully
    Express API->>PostgreSQL: Update Status (Success)
    Express API-->>React UI: Deployment Complete Notification
```

---

## 3. Deployment Architecture (AWS Free Tier)

DevOpsHub is designed to be hosted on a single AWS EC2 `t2.micro` or `t3.micro` instance (1 vCPU, 1GB RAM) running Ubuntu 22.04/24.04.

```mermaid
architecture-beta
    group aws(logos:aws)[AWS Cloud]

    service ec2(logos:aws-ec2)[Ubuntu EC2 Instance] in aws
    
    group devopshub(logos:docker)[DevOpsHub Core] in ec2
    service db(logos:postgresql)[PostgreSQL 15] in devopshub
    service api(logos:nodejs)[Express API] in devopshub
    service web(logos:react)[React Dashboard] in devopshub
    
    group apps(logos:docker)[User Apps] in ec2
    service app1(logos:nginx)[User App 1] in apps
    service app2(logos:nodejs)[User App 2] in apps

    service proxy(logos:nginx)[Nginx Host Reverse Proxy] in ec2

    proxy:B --> api:T
    proxy:B --> web:T
    proxy:B --> app1:T
    proxy:B --> app2:T
```

---

## 4. Docker Architecture

We utilize two conceptual networks within the Docker environment:
1. **`devopshub-network`**: Contains the core platform (Frontend, Backend, DB, Prometheus, Grafana). These services can talk to each other but are isolated from user apps.
2. **`user-apps-network`**: User deployments are placed here.

The Express API mounts the host machine's `/var/run/docker.sock`. This allows the Node container to spin up sibling containers on the host machine.

---

## 5. Monitoring & Data Flow Diagram

```mermaid
graph LR
    subgraph Host Server
        NodeExporter[Node Exporter]
        cAdvisor[cAdvisor]
    end
    
    subgraph DevOpsHub Core
        Prometheus[Prometheus Server]
        Grafana[Grafana Dashboard]
    end
    
    NodeExporter -->|Scrapes Host OS Metrics| Prometheus
    cAdvisor -->|Scrapes Container Metrics| Prometheus
    Prometheus -->|Provides Data Source| Grafana
```

---

## 6. CI/CD Architecture for DevOpsHub Itself

How do we deploy updates to the DevOpsHub code itself?
We use **GitHub Actions**.

```mermaid
graph TD
    Dev[Developer] -->|git push| GitHubRepo[GitHub Repo]
    GitHubRepo -->|Triggers| GHA[GitHub Actions]
    GHA -->|1. Run Tests| Tests[Jest & Supertest]
    Tests -->|2. Build Image| DockerHub[Docker Hub / GHCR]
    DockerHub -->|3. SSH & Deploy| AWS[AWS EC2]
    AWS -->|Pulls Image & Restarts| DevOpsHubCore
```

---

## 7. Rollback Flow Architecture

Rollbacks are handled by checking out previous Git commits.

1. User selects a previous successful deployment.
2. Backend queries the database for the `commit_id` of that deployment.
3. Backend runs:
   - `cd /deployments/{projectId}`
   - `git fetch`
   - `git checkout {commit_id}`
   - `docker-compose up -d --build`
4. Re-exposes the rolled-back container to Nginx.
