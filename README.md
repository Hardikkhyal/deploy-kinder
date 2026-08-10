# DevOpsHub 🚀 — Complete Technical & User Guide

> **Version:** 1.0.0 · **Last Updated:** June 2026  
> **Platform Status:** Active / Production Ready  
> **Overview:** An open-source, self-hosted Platform-as-a-Service (PaaS) designed to automate full-stack application deployments directly from GitHub to AWS EC2 infrastructure with single-click orchestration and real-time log streaming.

---

## Table of Contents

| # | Section | Description |
|---|---------|-------------|
| 1 | [Project Introduction](#section-1--project-introduction) | What, Why, Target Users, Features & Goals |
| 2 | [Overall Architecture](#section-2--overall-architecture) | System Diagram, Data Flow & Component Wiring |
| 3 | [Technology Stack](#section-3--technology-stack) | In-depth breakdown of Frontend, Backend & Infrastructure |
| 4 | [Project Folder Structure](#section-4--project-folder-structure) | Repository layout, File Communication & Database Schema |
| 5 | [Complete DevOps & Deployment Workflow](#section-5--complete-devops--deployment-workflow) | End-to-End Walkthrough & 9-Stage Pipeline |
| 6 | [Infrastructure as Code (IaC)](#section-6--infrastructure-as-code-iac) | Terraform & Ansible configuration details |
| 7 | [Quick Start & Local Setup Guide](#section-7--quick-start--local-setup-guide) | Prerequisites, Environment Variables & Execution |
| 8 | [Common Problems & Troubleshooting](#section-8--common-problems--troubleshooting) | Diagnostic Matrix & Self-Healing mechanisms |
| 9 | [Security Model](#section-9--security-model) | AES-256-GCM, JWT Auth, Rate Limiting & Isolation |
| 10 | [Contributing & License](#section-10--contributing--license) | Guidelines & Licensing information |

---

# SECTION 1 — Project Introduction

## 1.1 What is DevOpsHub?

**DevOpsHub** is an **open-source, self-hosted Platform-as-a-Service (PaaS)**. 

Commercial cloud platforms like Heroku, Vercel, and Render provide seamless git-push deployments, but they are proprietary and can become prohibitively expensive as apps scale. DevOpsHub grants you that exact automated deployment experience on your **own AWS infrastructure** at zero additional platform cost.

> **In a nutshell:** DevOpsHub provides an intuitive web dashboard where you enter a GitHub repository URL and click **Deploy**. The platform securely SSHs into your remote AWS EC2 instance, clones the repository, auto-detects the project framework, builds an isolated Docker image, spins up the container, sets up routing, and provides a live access URL — while streaming real-time terminal build logs back to your browser via WebSockets.

### Real-World Analogy

Imagine managing a restaurant kitchen:
- **Without DevOpsHub:** Whenever a new recipe (code) arrives, you must manually walk to the market (GitHub), carry ingredients (git clone), assemble and cook everything by hand (Docker build), and place it on the dining table (`docker compose up`).
- **With DevOpsHub:** You hire an **automated executive chef**. As soon as a new recipe sheet is submitted, the chef handles sourcing, cooking, plating, and serving automatically while sending live video updates to your phone (WebSocket log terminal).

## 1.2 Why Was It Built?

| Challenge / Pain Point | DevOpsHub Solution |
|------------------------|-------------------|
| Manual SSH session, git cloning, and Docker command execution for every update | Automated single-click 9-stage deployment pipeline |
| Zero visibility into remote build processes and server failures | Real-time terminal log streaming using Socket.io |
| Complex Nginx reverse proxy and port mapping management | Automatic port assignment and containerized routing |
| High monthly costs on commercial PaaS services (Heroku $7+/dyno/month) | Designed specifically to run on AWS Free Tier (`t2.micro` / `t3.micro`) |
| Students and developers lacking end-to-end DevOps project experience | Full production-ready reference codebase with Terraform, Ansible, Docker & Express |
| Security vulnerabilities from unencrypted server credentials | AES-256-GCM key encryption, JWT session management, and rate-limited endpoints |

## 1.3 Target Users

| User Category | Use Case & Value Proposition |
|---------------|------------------------------|
| **University Students** | Host final-year capstone projects and showcase real-world cloud deployment & DevOps skills |
| **Freelancers & Consultants** | Rapidly deploy client websites and microservices to cost-effective dedicated EC2 instances |
| **Small Dev Teams** | Maintain a unified internal staging environment without paying recurring PaaS fees |
| **DevOps Enthusiasts** | Study how SSH automation, Docker containerization, and Infrastructure as Code interact |

## 1.4 Core Features

1. **Email OTP Passwordless Authentication:** Secure, passwordless login utilizing 6-digit One-Time Passcodes (via SMTP with local console fallback).
2. **GitHub Integration:** Store Personal Access Tokens (PAT) to seamlessly pull from public or private repositories.
3. **AWS Credential Manager:** Securely save AWS Access Keys (encrypted with AES-256-GCM) to fetch live EC2 instance details.
4. **Server Management:** Register remote servers with public IP, SSH username, and encrypted RSA/Ed25519 PEM keys.
5. **Single-Click Deployment:** Select a repository, target branch, and port to initiate automated server deployment.
6. **9-Stage Deployment Engine:** Validation → SSH Auth → Server Check → Workspace Prep → Git Clone → Framework Detection → Docker Build → Container Start → Health Check.
7. **Real-Time Terminal Streaming:** Live output streaming of build and deployment output using WebSockets.
8. **Automated Self-Healing:** Built-in automatic recovery for port collisions, disk space exhaustions (`docker prune`), and git sync corruption.
9. **Zero-Config Framework Detection:** Auto-detects static HTML, Node.js applications, or Docker Compose projects and generates runtime configurations.
10. **Resource Monitoring Dashboard:** Integrated telemetry views for tracking server CPU and RAM utilization metrics.
11. **Infrastructure as Code:** Provision AWS EC2 resources with Terraform and configure base server packages using Ansible.

---

# SECTION 2 — Overall Architecture

## 2.1 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DEVELOPER MACHINE / BROWSER                        │
│                                                                             │
│   ┌──────────┐    git push     ┌──────────┐                                │
│   │  VS Code │ ──────────────→ │  GitHub  │                                │
│   │  (Code)  │                 │  (Repo)  │                                │
│   └──────────┘                 └────┬─────┘                                │
│                                     │                                       │
│   ┌──────────────────────────┐      │ Repo URL                              │
│   │  DevOpsHub Frontend      │      │                                       │
│   │  (React 19 + Vite + TS)  │◄─────┘                                       │
│   │  Port 5173 (dev)         │                                              │
│   └──────────┬───────────────┘                                              │
│              │ HTTP REST (Axios)                                            │
│              │ WebSocket (Socket.io)                                        │
│              ▼                                                              │
│   ┌──────────────────────────┐                                              │
│   │  DevOpsHub Backend       │                                              │
│   │  (Node.js + Express + TS)│                                              │
│   │  Port 4000               │                                              │
│   │  ┌────────┐ ┌──────────┐ │                                              │
│   │  │Prisma  │ │Socket.io │ │                                              │
│   │  │  ORM   │ │ Server   │ │                                              │
│   │  └───┬────┘ └──────────┘ │                                              │
│   │      │                   │                                              │
│   │  ┌───▼────┐              │                                              │
│   │  │SQLite  │              │                                              │
│   │  │dev.db  │              │                                              │
│   │  └────────┘              │                                              │
│   └──────────┬───────────────┘                                              │
│              │ SSH Connection (Port 22) via ssh2 library                    │
└──────────────┼──────────────────────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                        AWS CLOUD (us-east-1)                                │
│                                                                             │
│  ┌─── VPC (Default) ──────────────────────────────────────────────────┐     │
│  │                                                                     │     │
│  │  ┌──── Security Group (devopshub-sg) ────────────────────────┐     │     │
│  │  │  Inbound Rules:                                            │     │     │
│  │  │  • Port 22   (SSH)      ← Backend SSH connection           │     │     │
│  │  │  • Port 80   (HTTP)     ← Nginx Reverse Proxy              │     │     │
│  │  │  • Port 443  (HTTPS)    ← Nginx SSL                        │     │     │
│  │  │  • Port 4000 (API)      ← DevOpsHub Backend                │     │     │
│  │  │  • Port 8000-9000       ← Deployed User Containers         │     │     │
│  │  └────────────────────────────────────────────────────────────┘     │     │
│  │                                                                     │     │
│  │  ┌──── EC2 Instance (t3.micro / Ubuntu 22.04 LTS) ────────────┐   │     │
│  │  │                                                             │   │     │
│  │  │  ┌───────────┐  ┌────────────────────┐  ┌──────────────┐  │   │     │
│  │  │  │  Docker   │  │  Nginx             │  │  Git         │  │   │     │
│  │  │  │  Engine   │  │  (Reverse Proxy)   │  │  (Cloning)   │  │   │     │
│  │  │  └─────┬─────┘  └────────────────────┘  └──────────────┘  │   │     │
│  │  │        │                                                    │   │     │
│  │  │  ┌─────▼──────────────────────────────────────────────┐    │   │     │
│  │  │  │  ~/deployments/{projectId}/                         │    │   │     │
│  │  │  │  ├── .git/                                          │    │   │     │
│  │  │  │  ├── Dockerfile  (auto-generated if missing)        │    │   │     │
│  │  │  │  ├── docker-compose.yml (auto-generated if missing) │    │   │     │
│  │  │  │  └── [User source code]                             │    │   │     │
│  │  │  │                                                      │    │   │     │
│  │  │  │  docker compose build  → Docker Image                │    │   │     │
│  │  │  │  docker compose up -d  → Running Container           │    │   │     │
│  │  │  │                            ↓                         │    │   │     │
│  │  │  │                   http://EC2_IP:PORT                  │    │   │     │
│  │  │  └──────────────────────────────────────────────────────┘    │   │     │
│  │  └─────────────────────────────────────────────────────────────┘   │     │
│  └─────────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│  Infrastructure Management:                                                 │
│  • Terraform (main.tf)  → Provisions EC2, Security Group & VPC             │
│  • Ansible (playbook.yml) → Installs Docker, Nginx, Git, Swap Space         │
└──────────────────────────────────────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────┐
│      END USER            │
│  Browser → http://IP:PORT│
│  Accesses live web app   │
└──────────────────────────┘
```

## 2.2 Data Flow Sequence

1. **Authentication:** User logs in with email OTP. Backend verifies code and issues a JWT token.
2. **Setup Credentials:** User saves encrypted GitHub PAT, AWS credentials, and SSH server keys via the Integrations view.
3. **Project Registration:** User creates a new project entry linked to a GitHub repo URL, target branch, host port, and server instance.
4. **Trigger Deployment:** User clicks "Deploy". Backend receives `POST /api/projects/:id/deploy`, records a new `Deployment` (status `BUILDING`), sets up 9 `DeploymentStage` records, and responds asynchronously (`202 Accepted`).
5. **SSH Execution:** Background `SshOrchestrator` decrypts the server key, connects to the EC2 server over SSH, and runs stage commands sequentially.
6. **Live Telemetry:** Output buffers from SSH commands are pushed to `Socket.io` rooms (`projectId`), rendering live lines in the frontend terminal interface.
7. **Containerization & Verification:** After building and starting containers, the pipeline conducts TCP/HTTP health probes.
8. **Final State:** The database record updates to `SUCCESS` or `FAILED`, and the app becomes accessible at `http://<SERVER_IP>:<PORT>`.

---

# SECTION 3 — Technology Stack

## 3.1 Frontend Stack

| Technology | Role & Usage in DevOpsHub | Key Features & Advantages |
|------------|---------------------------|---------------------------|
| **React (v19)** | UI view layer component hierarchy | Virtual DOM rendering, component modularity, hooks state management |
| **TypeScript (v6)** | Static typing across components & state | Early compile-time bug detection, IDE autocompletion, interface enforcement |
| **Vite (v8)** | Build tool & local dev server | Instant server spin-up (<300ms), fast Hot Module Replacement (HMR) |
| **Tailwind CSS (v4)**| Utility-first responsive styling | Rapid styling without custom CSS files, dark/light theme integration |
| **Zustand** | Global application state management | Lightweight store (~1KB) for authentication JWT tokens and user profiles |
| **Axios** | HTTP client for REST API requests | Request/response interceptors for attaching Authorization headers |
| **Socket.io Client** | Real-time WebSocket connection | Subscribes to live log events (`log-line`) and deployment stage updates |
| **React Router (v7)**| Client-side single-page app routing | Declarative routing across Login, Dashboard, Projects, and Integrations views |
| **Recharts** | Telemetry visualization charts | Interactive area/line charts for tracking server CPU and memory usage |
| **Lucide React** | Consistent UI Iconography | Tree-shakeable SVG icons throughout navigation and status components |

## 3.2 Backend Stack

| Technology | Role & Usage in DevOpsHub | Key Features & Advantages |
|------------|---------------------------|---------------------------|
| **Node.js (v18+)** | Asynchronous JavaScript runtime | Non-blocking event loop ideal for streaming logs and SSH connections |
| **Express (v5)** | Web application REST framework | Middleware routing, JSON body parsing, CORS management, error handling |
| **Prisma ORM (v5)**| Type-safe database interface | Schema migrations, auto-generated TypeScript queries, model relations |
| **SQLite / Postgres**| Persistent datastore | Lightweight zero-config SQLite (`dev.db`) for dev; PostgreSQL for production |
| **ssh2** | Remote server SSH execution | Programmatic SSH2 client for running git clone, docker, and system commands |
| **Socket.io Server**| Real-time WebSocket server | Room-based event dispatching for log lines and pipeline stage transitions |
| **JSON Web Token**| User session authorization | Stateless JWT token issuance and signature verification (`Bearer <token>`) |
| **Nodemailer** | SMTP email handler | Handles 6-digit OTP delivery to user email addresses |
| **AWS SDK (v3)** | EC2 cloud infrastructure client | Retrieves live EC2 instance lists using user AWS Access Keys |

## 3.3 Infrastructure & DevOps Stack

| Tool | Application | Details |
|------|-------------|---------|
| **Docker** | Containerization runtime | Runs user apps in isolated container environments |
| **Docker Compose** | Multi-container orchestration | Manages composite services via `docker-compose.yml` |
| **Git & GitHub** | Version control & source repository| Pulls code branches into target deployment servers |
| **Terraform** | Infrastructure as Code (IaC) | Declarative `.tf` configuration for EC2, VPC, & Security Groups |
| **Ansible** | Configuration Management | Agentless playbooks for installing Docker, Nginx, & Swap memory |
| **AWS EC2** | Cloud virtual server | Hosts deployed containers (`t3.micro` instance type) |
| **Nginx** | Web server & reverse proxy | Routes port 80/443 traffic to specific container ports |

---

# SECTION 4 — Project Folder Structure

## 4.1 Root Layout

```
d:\project\
├── .gitignore                     # Git exclusion rules
├── package.json                   # Root workspace manifest
├── guide.md                       # Complete technical study handbook
├── summary_and_next_steps.md      # Development milestone summary
├── report_generator/              # Automated document generation tools
├── devopshub-demo-app/            # Sample web app for testing deployments
└── DevOpsHub/                     # ★ MAIN PLATFORM SOURCE CODE
```

## 4.2 DevOpsHub Core Repository Structure

```
DevOpsHub/
├── README.md                      # Primary project documentation
├── INSTALLATION.md                # Deployment and setup guide
├── docker-compose.yml             # Local multi-container compose file
│
├── backend/                       # Node.js Express REST API
│   ├── Dockerfile                 # Backend container packaging
│   ├── package.json               # Backend dependencies
│   ├── tsconfig.json              # Backend TypeScript config
│   ├── .env.example               # Environment template
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema (6 models)
│   │   ├── dev.db                 # SQLite local database file
│   │   └── seed.ts                # Database seeder
│   └── src/
│       ├── server.ts              # Entry point (Express + Socket.io)
│       ├── controllers/           # Auth and Project request handlers
│       ├── routes/                # API router definitions
│       ├── services/              # SSH Orchestrator & AWS service modules
│       ├── middleware/            # JWT auth, Rate Limiter, Error handler
│       └── utils/                 # AES-256-GCM encryption & Error classifier
│
├── frontend/                      # React single-page application
│   ├── index.html                 # Main HTML template
│   ├── vite.config.ts             # Vite build configuration
│   └── src/
│       ├── main.tsx               # React application mounting
│       ├── App.tsx                # Client-side router & guards
│       ├── pages/                 # Login, Projects, Monitoring, Integrations
│       ├── components/            # LogTerminal, Navigation & Layout
│       ├── store/                 # Zustand authentication store
│       └── services/              # Axios HTTP client configuration
│
└── infrastructure/                # IaC provisioning scripts
    ├── terraform/                 # main.tf (EC2 & Security Group provisioning)
    └── ansible/                   # playbook.yml & hosts.ini (Server provisioning)
```

## 4.3 Database Schema (Prisma)

```
┌──────────────────┐         ┌──────────────────┐
│      User        │ 1     N │   AwsCredential  │
│──────────────────│─────────│──────────────────│
│ id (UUID)        │         │ id (UUID)        │
│ email (Unique)   │         │ userId (FK)      │
│ username         │         │ accessKeyId      │
│ githubToken      │         │ secretAccessKey  │ ← AES-256 Encrypted
└────────┬─────────┘         └────────┬─────────┘
         │ 1                          │ 1
         │ N                          │ N
┌────────▼─────────┐         ┌────────▼─────────┐
│  ServerInstance  │─────────│  AwsCredential   │
│──────────────────│         └──────────────────┘
│ id (UUID)        │
│ userId (FK)      │
│ publicIp         │
│ sshUser          │
│ sshPrivateKey    │ ← AES-256 Encrypted
└────────┬─────────┘
         │ 1
         │ N
┌────────▼─────────┐
│     Project      │
│──────────────────│
│ id (UUID)        │
│ userId (FK)      │
│ serverId (FK)    │
│ name (Unique)    │
│ repoUrl          │
│ branch           │
│ port             │
└────────┬─────────┘
         │ 1
         │ N
┌────────▼─────────┐
│   Deployment     │
│──────────────────│
│ id (UUID)        │
│ projectId (FK)   │
│ status           │ ← BUILDING | SUCCESS | FAILED
│ buildLogs        │
└────────┬─────────┘
         │ 1
         │ N
┌────────▼─────────┐
│ DeploymentStage  │
│──────────────────│
│ id (UUID)        │
│ deploymentId(FK) │
│ name             │ ← e.g. "Building Docker Image"
│ status           │ ← PENDING | RUNNING | SUCCESS | FAILED | SKIPPED
│ errorReason      │
│ suggestedFix     │
└──────────────────┘
```

---

# SECTION 5 — Complete DevOps & Deployment Workflow

## 5.1 The 9-Stage Deployment Engine

When a deployment is launched, `sshOrchestrator.ts` processes these 9 sequential stages:

```
[Stage 1: Validate Config] ──→ [Stage 2: SSH Connect] ──→ [Stage 3: Check Environment]
                                                                    │
[Stage 6: Detect Framework] ◄── [Stage 5: Git Clone] ◄── [Stage 4: Prepare Workspace]
        │
        ▼
[Stage 7: Docker Build]   ──→ [Stage 8: Start Container] ──→ [Stage 9: Health Check]
```

1. **Stage 1: Validation:** Validates repository URL formatting, target branch existence, and SSH key integrity.
2. **Stage 2: SSH Authentication:** Initiates SSH connection to the remote EC2 server with exponential backoff (retries up to 3 times).
3. **Stage 3: Server Environment Check:** Verifies Git, Docker, and Docker Compose installations. Checks available disk space (>500MB free required) and clears conflicting ports.
4. **Stage 4: Workspace Preparation:** Prepares directory path `~/deployments/{projectId}/` on the remote server.
5. **Stage 5: Repository Synchronization:** Performs `git clone` (or `git fetch` + `git reset --hard` if directory exists). Injects GitHub PAT for private repositories.
6. **Stage 6: Zero-Config Framework Detection:** Inspects files to locate or generate runtime configs:
   - Existing `docker-compose.yml` → Used directly.
   - `index.html` detected → Generates Nginx Alpine Dockerfile.
   - `package.json` detected → Generates Node.js 18 Alpine Dockerfile.
7. **Stage 7: Docker Build:** Executes `docker compose build`. If disk space is exhausted, triggers self-healing `docker system prune -af` and retries.
8. **Stage 8: Container Spin-up:** Runs `docker compose up -d`. If network errors occur, prunes Docker networks and retries.
9. **Stage 9: Verification & Health Check:** Probes host port via TCP/HTTP requests to ensure container status is healthy.

## 5.2 Automated Self-Healing Matrix

| Failure Trigger | Detection Mechanism | Automated Recovery Action |
|-----------------|---------------------|---------------------------|
| **Port Conflict** | Port binding error during Stage 3/8 | Identifies PID/container occupying port and stops conflicting container |
| **Disk Space Full** | `No space left on device` build error | Runs `docker system prune -af --volumes` to recover space, then resumes build |
| **Corrupted Clone** | Git tree corruption / sync failure | Removes remote deployment directory completely and performs fresh `git clone` |
| **SSH Handshake Delay** | SSH connection timeout | Disables SSH reverse DNS lookup (`UseDNS no`) to accelerate authentication |
| **DB IP Mismatch** | Database contains bad IP records | `selfHealDatabase()` cleans malformed entries on server start |

---

# SECTION 6 — Infrastructure as Code (IaC)

## 6.1 Terraform Provisioning (`infrastructure/terraform/main.tf`)

Terraform configures the underlying AWS resources automatically:
- **EC2 Instance:** Ubuntu 22.04 LTS (`t3.micro`).
- **Security Group Rules:**
  - Inbound Port 22 (SSH access for orchestrator)
  - Inbound Port 80 / 443 (HTTP/HTTPS proxy routing)
  - Inbound Port 4000 (Backend API access)
  - Inbound Ports 8000–9000 (Application deployment range)

```bash
# Provision infrastructure
cd DevOpsHub/infrastructure/terraform
terraform init
terraform plan
terraform apply -auto-approve
```

## 6.2 Ansible Configuration (`infrastructure/ansible/playbook.yml`)

Ansible provisions software dependencies on the newly created server:
- Updates package manager and installs Git, Curl, Unzip, and Nginx.
- Installs Docker Engine & Docker Compose plugin.
- Adds non-root user to `docker` group.
- Configures 1GB Swap file to prevent memory exhaustion on `t2.micro` instances.

```bash
# Execute server provisioning playbook
cd DevOpsHub/infrastructure/ansible
ansible-playbook -i hosts.ini playbook.yml
```

---

# SECTION 7 — Quick Start & Local Setup Guide

## 7.1 Prerequisites

- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **Docker & Docker Compose:** Installed and running locally
- **Git:** Version control CLI installed

## 7.2 Local Installation Steps

### 1. Clone the Repository
```bash
git clone https://github.com/Hardikkhyal/deploy-kinder.git
cd deploy-kinder/DevOpsHub
```

### 2. Configure Backend Environment
Create `DevOpsHub/backend/.env` based on `.env.example`:
```env
PORT=4000
DATABASE_URL="file:./dev.db"
JWT_SECRET="super_secret_jwt_key_change_in_production"
ENCRYPTION_KEY="0123456789abcdef0123456789abcdef"
FRONTEND_URL="http://localhost:5173"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

### 3. Install & Start Backend
```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run dev
```
Backend API will start at `http://localhost:4000`.

### 4. Install & Start Frontend
Open a second terminal window:
```bash
cd DevOpsHub/frontend
npm install
npm run dev
```
Frontend UI will start at `http://localhost:5173`.

### 5. Docker Compose Startup (Alternative Full Setup)
To launch the entire platform with PostgreSQL via Docker Compose:
```bash
cd DevOpsHub
docker compose up -d --build
```

---

# SECTION 8 — Common Problems & Troubleshooting

| Issue / Error | Likely Cause | Solution |
|---------------|--------------|----------|
| **SSH Authentication Failed** | Incorrect private key formatting or user | Ensure key includes `-----BEGIN RSA PRIVATE KEY-----` header and username is `ubuntu` |
| **Port Already in Use** | Another process is bound to the target port | Check running containers via `docker ps` or change port in project settings |
| **Build Timeout / Stalled** | Low system memory on `t2.micro` | Ensure Swap space is configured via Ansible (`playbook.yml`) |
| **OTP Email Not Received** | Invalid SMTP credentials | Check backend console logs; fallback OTP is printed directly in stdout |
| **Git Clone Denied** | Private repo missing GitHub PAT | Add your Personal Access Token under Integrations → GitHub |

---

# SECTION 9 — Security Model

DevOpsHub enforces defense-in-depth security principles:

1. **AES-256-GCM Secret Encryption:** All sensitive credentials (SSH private keys, AWS Secret Keys, GitHub PATs) are encrypted at rest using AES-256-GCM authenticated encryption before database insertion.
2. **Stateless JWT Authorization:** API endpoints require a valid `Bearer <token>` header signature. Tokens expire automatically and contain zero raw credential payloads.
3. **Rate Limiting Protection:** Sensitive authentication endpoints (such as OTP requests) feature memory-based rate limiters to prevent brute-force attacks.
4. **Isolated Container Execution:** Each deployed user application runs within its own containerized process space with strict host port limits.
5. **No Secret Code Commits:** Template files (`.env.example`) are provided while actual keys (`.env`, `dev.db`, `*.pem`) are strictly excluded via `.gitignore`.

---

# SECTION 10 — Contributing & License

## 10.1 Contributing Guidelines

Contributions are welcome! Follow these steps to submit changes:
1. Fork the repository on GitHub.
2. Create a feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to your branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request for review.

## 10.2 License

This project is open-source software licensed under the [MIT License](LICENSE).
