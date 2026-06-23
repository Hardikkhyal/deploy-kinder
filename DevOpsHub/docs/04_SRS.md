# Task 4: Software Requirement Specification (SRS)

## 1. Introduction
### 1.1 Purpose
This Software Requirements Specification (SRS) describes the functions, non-functional requirements, constraints, and architecture of **DevOpsHub**. DevOpsHub is a self-hosted platform designed to simplify the deployment, management, and monitoring of web applications via Docker.

### 1.2 Scope
DevOpsHub will allow users to deploy applications directly from GitHub using automated Docker builds and Docker Compose. It will include a dashboard to monitor running containers, view logs, and track server resource utilization.

## 2. Problem Statement
Many beginner developers and small teams struggle with the manual process of deploying applications. The repetitive tasks of SSHing into servers, pulling code, building Docker images, configuring reverse proxies, and monitoring logs are time-consuming and error-prone. 

### 2.1 Current System Limitations
- Manual SSH access is required.
- No unified dashboard for logs and metrics.
- High learning curve for configuring Nginx and SSL.
- No automated history or rollback mechanism.

### 2.2 Proposed System
A web-based dashboard that automates:
1. Fetching code from GitHub.
2. Containerizing applications via Docker.
3. Exposing applications via an automated Nginx reverse proxy.
4. Monitoring system resources visually.

## 3. Functional Requirements
1. **Authentication:** 
   - Admins must log in using a secure username/password.
   - Sessions must be secured via JWT.
2. **Project Management:**
   - Create, edit, and delete deployment projects.
   - Link a project to a public or private GitHub repository URL.
   - Select specific branches to deploy.
3. **Deployment Engine:**
   - Execute a `git pull` based on the selected branch.
   - Execute `docker-compose up -d --build`.
   - Track deployment status (In Progress, Success, Failed).
   - Maintain a history of deployments with Commit IDs and timestamps.
4. **Container Management:**
   - List all running Docker containers.
   - Perform actions: Start, Stop, Restart, Delete.
   - View live standard output (stdout) and error (stderr) logs for any container.
5. **Monitoring Integration:**
   - Embed or link Grafana dashboards displaying Prometheus metrics (CPU, RAM, Disk).
6. **Rollback Mechanism:**
   - Allow users to deploy a previously successful commit ID.

## 4. Non-Functional Requirements
1. **Performance:** The UI should load in under 2 seconds. Deployment logs should stream in near real-time.
2. **Scalability:** The MVP is designed for a single AWS Free Tier EC2 instance (t2.micro / t3.micro). It must be lightweight enough to run alongside user applications.
3. **Security:**
   - All API endpoints must require a valid JWT.
   - Passwords must be hashed using `bcrypt`.
   - The Docker socket must not be exposed over public networks; the Node.js backend will securely interact with it locally.
4. **Availability:** The core management dashboard should remain online even if user deployments crash.

## 5. Actors
- **System Administrator (User):** The individual hosting DevOpsHub who has full control over the dashboard, deployments, and server configurations.

## 6. Use Cases & User Stories
| ID | User Story | Acceptance Criteria |
| :--- | :--- | :--- |
| US-01 | As an Admin, I want to log in securely so that unauthorized users cannot access my server. | Login page exists. JWT token is returned on success. Invalid credentials return 401. |
| US-02 | As an Admin, I want to add a GitHub repo link so that I can deploy its contents. | Project creation form accepts URL and Branch name. Saves to database. |
| US-03 | As an Admin, I want to click "Deploy" to build my app automatically. | Button triggers a backend job. The job clones code, builds Docker image, and starts it. |
| US-04 | As an Admin, I want to view container logs to debug application errors. | Clicking "Logs" on a container streams its Docker logs to the UI. |
| US-05 | As an Admin, I want to see my server's RAM usage to avoid crashing the server. | Dashboard displays a chart showing current memory consumption. |

## 7. Assumptions & Constraints
- **Budget:** ₹0. The entire stack must be built using open-source tools.
- **Infrastructure:** Target deployment is an AWS Free Tier EC2 instance.
- **Prerequisites:** The underlying server must have Docker, Docker Compose, and Nginx pre-installed.

## 8. Risk Analysis
- **Risk:** Server runs out of RAM during `docker build` (t2.micro only has 1GB RAM).
  - *Mitigation:* Implement swap space on the Ubuntu server. Enforce memory limits on containers.
- **Risk:** Security vulnerability allowing Remote Code Execution (RCE).
  - *Mitigation:* Strict validation of GitHub URLs. Ensure the backend executes shell commands safely without direct string interpolation of user input.

## 9. Success Metrics
- Successfully deploying a full-stack application (e.g., React + Node + Postgres) with one click from the dashboard.
- Zero manual SSH interventions required after initial setup.
- Container logs stream without crashing the browser.
