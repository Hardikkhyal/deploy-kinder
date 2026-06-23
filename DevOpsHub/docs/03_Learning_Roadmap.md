# Task 3: YouTube Resources & Learning Roadmap

To build DevOpsHub, you need to master several complex topics. This document curates the best YouTube tutorials and provides a logical learning roadmap to avoid tutorial hell and focus strictly on what you need for this MVP.

---

## 1. Learning Roadmap (Watch Order)

Follow this order to build your foundational knowledge logically:
1. **Docker & Docker Compose:** You cannot build a PaaS without deeply understanding containers.
2. **Linux & Nginx:** You need to understand how reverse proxies work to route traffic to your containers.
3. **Node.js API & JWT:** Building the backend engine that will execute commands.
4. **React Admin Dashboard:** Building the UI.
5. **Prometheus & Grafana:** Adding observability.
6. **GitHub Actions & CI/CD:** Automating your own project's deployment.
7. **Infrastructure Automation (Terraform & Ansible/AWS):** Provisioning the cloud server where DevOpsHub will live.

---

## 2. YouTube Resources

### 1. Docker & Docker Compose
* **Title:** Docker Tutorial for Beginners [FULL COURSE in 3 Hours]
* **Channel:** TechWorld with Nana
* **Duration:** 3 hours
* **Difficulty:** Beginner to Intermediate
* **Topics:** Containers, Images, Port Mapping, Docker Compose, Volumes, Networks.
* **Reason to Watch:** Nana is the industry standard for DevOps concepts. This explains how to write the `docker-compose.yml` files that DevOpsHub will generate.
* **Learning Outcome:** You will be able to containerize any application and link it to a database.

### 2. AWS EC2 & Linux Basics
* **Title:** AWS EC2 Tutorial For Beginners
* **Channel:** Simplilearn or TechWorld with Nana
* **Duration:** ~1 hour
* **Difficulty:** Beginner
* **Topics:** Launching EC2 instances, SSH keys, Security Groups (Firewalls), Elastic IPs.
* **Reason to Watch:** You must deploy DevOpsHub on an AWS Free Tier EC2 instance. You need to know how to open ports (80, 443, 3000) for the dashboard.
* **Learning Outcome:** You can confidently spin up and SSH into an Ubuntu server on AWS.

### 3. Nginx Reverse Proxy
* **Title:** NGINX Tutorial | Beginner to Advanced
* **Channel:** Hussein Nasser
* **Duration:** 1 hour 30 mins
* **Difficulty:** Intermediate
* **Topics:** Layer 4 vs Layer 7 load balancing, Reverse Proxy, SSL termination.
* **Reason to Watch:** DevOpsHub will use Nginx to route traffic (e.g., `app1.devopshub.com` to container on port 8001). Hussein explains backend networking better than anyone.
* **Learning Outcome:** You will understand how to write and reload `nginx.conf` files.

### 4. Node.js & Docker APIs
* **Title:** Automate Docker with Node.js
* **Channel:** (Search for "Node.js Dockerode Tutorial")
* **Duration:** ~30 mins
* **Difficulty:** Advanced
* **Topics:** `dockerode` NPM package, Docker Socket, streaming logs.
* **Reason to Watch:** This is the core engine of DevOpsHub. You need to know how to start/stop containers from an Express API.
* **Learning Outcome:** Writing JavaScript that controls the underlying Linux Docker daemon.

### 5. JWT Authentication (Node.js)
* **Title:** Node.js Authentication & Authorization
* **Channel:** Web Dev Simplified
* **Duration:** ~45 mins
* **Difficulty:** Intermediate
* **Topics:** Access Tokens, Refresh Tokens, bcrypt, middleware.
* **Reason to Watch:** DevOpsHub requires secure login. You cannot let unauthorized users trigger deployments.
* **Learning Outcome:** Securing your API endpoints.

### 6. React Admin Dashboard
* **Title:** Build & Deploy a React Admin Dashboard App With Theming, Tables, Charts
* **Channel:** JavaScript Mastery
* **Duration:** 3+ hours
* **Difficulty:** Intermediate
* **Topics:** Material UI / Tailwind, Recharts/Chart.js, Sidebar navigation, Dark mode.
* **Reason to Watch:** DevOpsHub needs a beautiful, professional UI. This video provides a ready-to-use template structure.
* **Learning Outcome:** Building the visual layer of your PaaS.

### 7. Prometheus & Grafana
* **Title:** Prometheus and Grafana Tutorial
* **Channel:** TechWorld with Nana
* **Duration:** ~1 hour
* **Difficulty:** Intermediate
* **Topics:** Node Exporter, PromQL, Grafana Dashboards.
* **Reason to Watch:** DevOpsHub MVP includes a monitoring page. You will learn how to extract CPU/RAM metrics from the server.
* **Learning Outcome:** Setting up observability for the AWS server.

### 8. GitHub Actions (CI/CD)
* **Title:** GitHub Actions Tutorial - Basic Concepts and CI/CD Pipeline with Docker
* **Channel:** TechWorld with Nana
* **Duration:** ~1 hour
* **Difficulty:** Intermediate
* **Topics:** Workflows, Secrets, building and pushing Docker images.
* **Reason to Watch:** You will use this to automate the deployment of DevOpsHub itself.
* **Learning Outcome:** Writing `.github/workflows/deploy.yml`.

### 9. Terraform & Ansible (Infrastructure Automation)
* **Title:** Terraform Course - Automate your AWS cloud infrastructure
* **Channel:** freeCodeCamp.org
* **Duration:** 2+ hours
* **Difficulty:** Advanced
* **Topics:** Providers, Resources, State files, EC2 provisioning.
* **Reason to Watch:** While you could manually click through AWS to create your server, using Terraform proves to your professors/interviewers that you understand Infrastructure as Code (IaC).
* **Learning Outcome:** Writing `main.tf` to spin up your AWS Free Tier environment automatically.

---

## Action Item Summary
**Do not watch these back-to-back without coding.**
1. Watch Docker -> Build a simple Node app and Dockerize it.
2. Watch AWS -> Put that app on an EC2 instance manually.
3. Watch Node/Dockerode -> Write a script that lists containers on your PC.
4. Watch React -> Build a static UI showing fake containers.
5. *Then tie them all together.*
