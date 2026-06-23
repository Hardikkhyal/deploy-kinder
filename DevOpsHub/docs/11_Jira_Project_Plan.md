# Task 11: Jira Project Planning & Agile Methodology

To simulate a real-world enterprise environment, DevOpsHub development will be managed using Agile methodologies in Jira.

---

## 1. Epics (High-Level Features)
1. **Epic 1:** Authentication & Security Layer
2. **Epic 2:** Infrastructure & Cloud Provisioning
3. **Epic 3:** Backend Deployment Engine (Docker/Git)
4. **Epic 4:** Admin UI & Dashboard
5. **Epic 5:** Monitoring & Observability

## 2. Sprints & Timeline (2-Week Sprints)

### **Sprint 1: Foundation & Infrastructure**
* **Goal:** Have a running AWS server with a basic Node.js API and Database connected.
* **Backlog:**
  - [Task] Write Terraform scripts for AWS EC2.
  - [Task] Write Ansible playbook for Docker/Nginx installation.
  - [Task] Initialize Node.js/Express project.
  - [Task] Setup Prisma and PostgreSQL schema.
* **Story Points:** 15

### **Sprint 2: The Core Engine**
* **Goal:** Backend can successfully clone a GitHub repo and build a Docker image.
* **Backlog:**
  - [User Story] As an API, I can receive a GitHub URL and execute `git clone`.
  - [User Story] As an API, I can connect to `/var/run/docker.sock` and execute `docker build`.
  - [Task] Implement API endpoint for Project Creation.
  - [Task] Implement error handling for failed builds.
* **Story Points:** 20

### **Sprint 3: The Frontend & Integration**
* **Goal:** A working UI where users can trigger deployments visually.
* **Backlog:**
  - [Task] Scaffold React/Vite App with Tailwind CSS.
  - [User Story] As a User, I can view my projects on a grid layout.
  - [User Story] As a User, I can click "Deploy" and see a loading spinner.
  - [Task] Connect React frontend to Express backend API.
* **Story Points:** 18

### **Sprint 4: Observability & Polish**
* **Goal:** Monitoring is active, and the project is ready for presentation.
* **Backlog:**
  - [Task] Install Prometheus & Grafana on the host.
  - [User Story] As a User, I can view live RAM/CPU charts on the dashboard.
  - [Task] Write README and deployment documentation.
  - [Bug Fixes] Resolve UI alignment issues.
* **Story Points:** 12

## 3. Kanban Board Setup
Columns in Jira:
- **To Do:** Tasks scoped for the current sprint.
- **In Progress:** Developer is actively writing code.
- **Code Review:** PR is open on GitHub, awaiting review.
- **Testing:** Deployed to a local staging environment for validation.
- **Done:** Merged to `main` and deployed to AWS.

## 4. Definition of Done (DoD)
A ticket is only moved to "Done" when:
1. Code is written and commented.
2. Code is pushed to GitHub and CI pipeline passes (Linter + Unit Tests).
3. Feature is manually tested on the AWS server.
4. If it's an API change, `API.md` is updated.
