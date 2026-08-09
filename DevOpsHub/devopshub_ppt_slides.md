# 🚀 SelfHost: Self-Hosted Deployment Platform
## Presentation Slides (14 Slides Text & Presentation Guide)

---

### Slide 1: Title Slide
- **Slide Title:** SelfHost 🚀
- **Subtitle:** A Self-Hosted Deployment & Infrastructure Management Platform
- **Visual Layout:** Modern dark tech banner background with platform badges (React, Node.js, Docker, PostgreSQL).
- **Content:**
  - **Project Name:** SelfHost
  - **Category:** Self-Hosted Platform as a Service (PaaS) / Developer Tools
  - **Presented by:** [Your Name / Team Name]
  - **Degree/Department:** Bachelor of Technology / Master of Computer Applications
  - **Institution:** [Your College / University Name]
- **Speaker Notes:**
  > "Good morning/afternoon everyone. Today, I'm excited to present **SelfHost**, an open-source, lightweight, self-hosted Platform-as-a-Service designed to eliminate deployment friction for developers, students, and startups by bringing one-click GitHub deployments to your own cloud infrastructure."

---

### Slide 2: Problem Statement & Motivation
- **Slide Title:** The Deployment & Infrastructure Friction
- **Visual Layout:** 2-Column Comparison (Traditional Complex Setup vs. Pricey SaaS PaaS).
- **Content:**
  - ❌ **Complex Server Management:** Manual SSH, reverse proxy editing, and manual `docker` commands are error-prone and slow.
  - ❌ **"Works on My Machine" Syndrome:** Inconsistent environments between local dev machines and staging/production servers.
  - ❌ **Expensive SaaS Alternatives:** Commercial PaaS services (Render, Vercel, Heroku) become costly as bandwidth and build hours grow.
  - ❌ **Lack of Control:** Vendor lock-in and limited flexibility when hosting custom microservices or privacy-sensitive workloads.
- **Speaker Notes:**
  > "Small teams and individual developers face a tough choice: manually manage Linux servers with Nginx and SSL configs, or pay steep monthly bills for SaaS PaaS platforms. SelfHost bridges this gap by giving developers their own self-hosted deployment platform."

---

### Slide 3: Project Overview & Core Vision
- **Slide Title:** Introducing SelfHost
- **Visual Layout:** Central hub diagram showing GitHub connected to SelfHost Engine, which outputs running web services.
- **Content:**
  - 💡 **Self-Hosted PaaS:** A lightweight open-source alternative to Vercel/Render that runs on your own server (e.g., AWS EC2 free tier).
  - ⚡ **One-Click Deployments:** Connect any public/private GitHub repository and deploy instantly.
  - 🔄 **Automated Build & Proxy:** Automatically clones, builds Docker containers, and routes traffic via dynamic reverse proxy.
  - 📊 **Unified Dashboard:** Manage environments, view build logs, monitor CPU/RAM, and control app lifecycles in one UI.
- **Speaker Notes:**
  > "SelfHost turns any cheap virtual machine into an automated cloud platform. You simply paste a GitHub repo URL, click Deploy, and SelfHost handles building, containerizing, networking, and SSL routing under the hood."

---

### Slide 4: Key Platform Features
- **Slide Title:** Core Features & Capabilities
- **Visual Layout:** 4-Grid Card layout with feature icons.
- **Content:**
  - 🔗 **GitHub Integration:** Seamless repository selection, branch selection, and environment variable configuration.
  - 📡 **Real-time Terminal Logs:** Stream live build and container runtime logs via WebSockets & XTerm.js directly to the browser.
  - 🌐 **Dynamic Nginx Reverse Proxy:** Automated domain/subdomain routing and zero-downtime container updates.
  - 📈 **Server & App Observability:** Integrated Prometheus & Grafana telemetry for real-time memory and CPU resource tracking.
- **Speaker Notes:**
  > "Key highlights include live WebSocket log streaming using XTerm.js, so you see build stdout/stderr in real-time, plus automatic Nginx reverse proxy reloads whenever a container starts or updates."

---

### Slide 5: System Architecture & Workflow
- **Slide Title:** High-Level System Architecture
- **Visual Layout:** System Architecture Diagram (Client → React SPA → Node.js API → Docker Engine → Postgres & Nginx).
- **Content:**
  - 📱 **Frontend Layer:** React SPA with Zustand state management & XTerm.js interactive log viewer.
  - ⚙️ **Backend Control Plane:** Node.js/Express REST API communicating with Docker daemon via Dockerode.
  - 🗄️ **Data Layer:** PostgreSQL managed via Prisma ORM for storing projects, deployments, users, and secrets.
  - 📦 **Runtime Infrastructure:** Isolated Docker container network managed dynamically alongside an Nginx reverse proxy.
- **Speaker Notes:**
  > "Architecturally, SelfHost decouples the control plane from the app runtime. The Node backend uses Dockerode to talk to the local Docker socket, creating isolated bridge networks for each application while Nginx proxies incoming HTTP requests."

---

### Slide 6: Technology Stack Breakdown
- **Slide Title:** Technology Stack
- **Visual Layout:** 4 Columns grouped by layer (Frontend, Backend, Database, Infrastructure).
- **Content:**
  - **Frontend:** React, TypeScript, Vite, Tailwind CSS, Zustand, XTerm.js
  - **Backend:** Node.js, Express.js, Prisma ORM, Socket.io, Dockerode
  - **Database:** PostgreSQL (Relational persistence with strict ACID compliance)
  - **DevOps & Cloud:** Docker, Docker Compose, Nginx, AWS EC2, Ansible, GitHub Actions
- **Speaker Notes:**
  > "We selected modern TypeScript/React for rapid UI interactions, Node.js for non-blocking asynchronous event handling during long-running builds, and PostgreSQL with Prisma for reliable data integrity."

---

### Slide 7: Real-Time Build & Container Management
- **Slide Title:** Real-Time Log Streaming & Docker Orchestration
- **Visual Layout:** Flow diagram showing GitHub Webhook → Node.js Spawn → Socket.io Event Stream → Browser Terminal.
- **Content:**
  - 🛠️ **Automated Container Builds:** Programmatic invocation of Docker builds using custom multi-stage Dockerfiles.
  - 🔌 **Socket.io Streaming:** Direct pipe from Docker stdout/stderr stream to browser client via WebSockets.
  - 🖥️ **Interactive XTerm.js Terminal:** Emulates a native Linux terminal inside the React frontend dashboard.
  - 🛡️ **Container Isolation:** Every deployed user application runs inside an isolated Docker bridge network.
- **Speaker Notes:**
  > "One of our biggest engineering challenges was real-time feedback. By binding Docker container output streams directly to Socket.io WebSockets, developers get instant terminal feedback without refreshing."

---

### Slide 8: Data Model & Schema Design
- **Slide Title:** Database & Entity Relationship Model
- **Visual Layout:** ER Diagram summary showing key tables and relationships.
- **Content:**
  - 👤 **Users Table:** Handles user authentication, bcrypt hashed passwords, and role permissions.
  - 📁 **Projects Table:** Stores GitHub repository URL, branch, framework preset, build commands, and port mappings.
  - 🚀 **Deployments Table:** Historical audit log of every build, commit SHA, build duration, deployment status, and error logs.
  - 🔑 **Environment Variables Table:** Encrypted key-value store injected into containers during runtime.
- **Speaker Notes:**
  > "Our PostgreSQL database schema maintains clear foreign key relationships between Users, Projects, and Deployments. All sensitive environment variables are encrypted before storage."

---

### Slide 9: Automated CI/CD & IaC Pipeline
- **Slide Title:** CI/CD & Infrastructure Automation
- **Visual Layout:** Pipeline infographic (Code Commit → Lint & Test → Docker Image Build → Ansible Server Provisioning).
- **Content:**
  - 🔄 **Continuous Integration:** GitHub Actions automatically tests backend routes and frontend component syntax on every push.
  - 🏗️ **Infrastructure as Code (IaC):** Ansible playbooks automate server setup (Docker installation, Nginx configuration, security hardening).
  - 🚀 **Zero-Downtime Releases:** Automated graceful container swapping to ensure 100% uptime during redeployments.
  - 🛡️ **Idempotent Deployments:** Ansible playbooks ensure servers remain in the target state without drift.
- **Speaker Notes:**
  > "For platform maintenance itself, we utilize GitHub Actions and Ansible. Ansible playbooks ensure that any fresh EC2 instance can be provisioned into a production-ready SelfHost server in under 3 minutes."

---

### Slide 10: Security Architecture & DevSecOps Model
- **Slide Title:** Security Architecture & Best Practices
- **Visual Layout:** Security Shield icon with 4 key defense layers listed around it.
- **Content:**
  - 🔒 **Authentication:** JSON Web Tokens (JWT) with HTTP-only cookies and bcrypt password hashing.
  - 🌐 **Network Isolation:** Custom Docker bridge networks prevent deployed apps from accessing the host or database directly.
  - 🔐 **SSL Termination:** Automated HTTPS management via Nginx dynamic SSL configuration.
  - 🛡️ **Least Privilege Execution:** Non-root execution inside application containers to prevent privilege escalation.
- **Speaker Notes:**
  > "Security is built into every layer. Apps running on SelfHost cannot access the underlying host system or database containers thanks to strict Docker bridge isolation and non-root execution policies."

---

### Slide 11: System Observability & Monitoring
- **Slide Title:** Server & Container Telemetry
- **Visual Layout:** Mockup of Prometheus & Grafana dashboard graphs showing CPU, Memory, and Network I/O.
- **Content:**
  - 📊 **Prometheus Integration:** Collects real-time CPU, RAM, disk I/O, and network traffic metrics from container endpoints.
  - 📈 **Grafana Visualizations:** Embedded metric dashboards display resource utilization per deployed application.
  - 🚨 **Container Health Checks:** Automated restart policies for crashed or unresponsive applications.
  - ⏱️ **Uptime Tracking:** Tracks response latencies and server availability percentage.
- **Speaker Notes:**
  > "Developers need to know how their apps perform. We integrated Prometheus metrics and Grafana charts so users can inspect CPU and RAM consumption for each container in real-time."

---

### Slide 12: Cost Optimization & Resource Efficiency
- **Slide Title:** Optimized for AWS Free Tier (Zero-Cost Hosting)
- **Visual Layout:** AWS t2.micro specs box vs. SelfHost Memory Footprint comparison.
- **Content:**
  - 💵 **Zero Cloud Cost:** Engineered specifically to run within the constraints of an AWS Free Tier `t2.micro` instance (1 vCPU, 1 GB RAM).
  - ⚡ **Multi-Stage Docker Builds:** Standardized Dockerfiles reduce image sizes from ~1GB down to ~50MB.
  - 🧹 **Automatic Cleanup:** Automated prunes for dangling Docker images and build caches to preserve disk space.
  - 📉 **Low Idle Footprint:** Node.js backend and Nginx consume under 150MB RAM at idle.
- **Speaker Notes:**
  > "Efficiency was a major design constraint. By leveraging Alpine-based multi-stage Docker builds and efficient memory management, SelfHost comfortably runs on an AWS Free Tier t2.micro server without crashing."

---

### Slide 13: Live Demonstration & UI Walkthrough
- **Slide Title:** Application Interface Walkthrough
- **Visual Layout:** Screenshots of Landing Page, Project Dashboard, Live Terminal, and Settings.
- **Content:**
  - 🖥️ **Screen 1: Main Dashboard** – Overview of active projects, build statuses, and Quick Deploy button.
  - 🔗 **Screen 2: Project Setup** – Form for pasting repository URL, environment variables, and branch selection.
  - 📜 **Screen 3: Live Logs Screen** – Streaming build terminal powered by WebSockets and XTerm.js.
  - ⚙️ **Screen 4: Metrics & Controls** – Resource graphs, restart buttons, and custom domain configuration.
- **Speaker Notes:**
  > "Here you can see the platform in action. The UI features a dark, modern aesthetic with clear indicators for app health, one-click redeploy controls, and integrated log windows."

---

### Slide 14: Conclusion & Future Roadmap
- **Slide Title:** Conclusion & Future Scope
- **Visual Layout:** Roadmap Timeline (Current Capabilities vs. Future Enhancements).
- **Content:**
  - ✅ **Summary:** Successfully built a full-stack, self-hosted PaaS platform combining modern React/Node web dev with robust DevOps practices.
  - 🚀 **Future Enhancement 1:** Multi-Node Kubernetes (K8s) cluster orchestration for horizontal scaling.
  - 🔑 **Future Enhancement 2:** One-click automated SSL certificate generation via Let's Encrypt / Certbot integration.
  - 💾 **Future Enhancement 3:** One-click managed database provisioning (PostgreSQL, Redis, MongoDB as a Service).
  - 💬 **Questions & Answers:** Open floor for discussion.
- **Speaker Notes:**
  > "In summary, SelfHost demonstrates how combining Full-Stack web engineering with DevOps automation produces a scalable, self-hosted platform. Next, we plan to add native Kubernetes multi-node support and automated Let's Encrypt SSL certificates. Thank you! I am now happy to answer any questions."
