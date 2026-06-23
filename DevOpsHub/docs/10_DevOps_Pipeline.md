# Task 10: DevOps Pipeline

This document explains the CI/CD and Infrastructure pipeline used to build and deploy **DevOpsHub itself**.

---

## 1. Git Workflow & Branching Strategy
- **`main` branch:** Production code. Only accepts Pull Requests (PRs). Deployments to the EC2 server happen automatically from here.
- **`develop` branch:** Staging/Integration. All feature branches merge here first.
- **Feature branches:** Naming convention `feat/login-page`, `fix/docker-crash`.

## 2. Infrastructure Automation (Terraform & Ansible)
Before deploying code, the server must exist.

### **Terraform (`main.tf`)**
Provisions the AWS Free Tier architecture:
- Creates a VPC, Subnet, and Internet Gateway.
- Creates a Security Group allowing Inbound traffic on ports 22 (SSH), 80 (HTTP), 443 (HTTPS), 3000 (React), and 4000 (Node API).
- Provisions a `t2.micro` EC2 Instance using the Ubuntu 22.04 AMI.

### **Ansible (`playbook.yml`)**
Configures the EC2 instance immediately after creation:
- Updates `apt` packages.
- Installs Docker and Docker Compose.
- Installs Nginx.
- Installs PostgreSQL client.
- Sets up swap memory (vital for `t2.micro` instances compiling Node apps).

## 3. Continuous Integration (CI)
Triggered on every PR to `main` or `develop`. Uses **GitHub Actions**.

**Pipeline Steps:**
1. Checkout Code.
2. Setup Node.js v18.
3. Install dependencies (`npm ci`).
4. Run Linter (`eslint`).
5. Run Unit Tests (`jest`).
6. Build React Frontend.
*If any step fails, the PR cannot be merged.*

## 4. Continuous Deployment (CD)
Triggered on successful merge to `main`.

**Pipeline Steps:**
1. Login to DockerHub (using GitHub Secrets).
2. Build Docker images for `devopshub-frontend` and `devopshub-backend`.
3. Push images to DockerHub.
4. SSH into the AWS EC2 instance (using GitHub Secrets: `EC2_HOST`, `EC2_SSH_KEY`).
5. Execute deployment script on the server:
   ```bash
   cd /opt/devopshub
   docker-compose pull
   docker-compose up -d
   ```

## 5. Backups & Rollbacks
- **Database Backups:** A cron job on the EC2 server dumps the Postgres database every 24 hours and syncs it to an AWS S3 bucket using the AWS CLI.
- **Code Rollback:** If the new Docker image crashes the platform, we manually SSH into the server and run `docker-compose up -d {previous_image_tag}`.
