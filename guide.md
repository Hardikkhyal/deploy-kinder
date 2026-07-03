# DevOpsHub — Complete Study Handbook

> **Version:** 1.0 · **Last Updated:** June 2026
> **Intended Audience:** A teammate who has **never** worked on this project.
> **Promise:** By the end of this handbook you will be able to explain, demonstrate, troubleshoot, and defend every aspect of DevOpsHub in a technical viva.

---

## Table of Contents

| # | Section | Page Jump |
|---|---------|-----------|
| 1 | [Project Introduction](#section-1--project-introduction) | What, Why, Who |
| 2 | [Overall Architecture](#section-2--overall-architecture) | Diagrams & flow |
| 3 | [Technology Stack](#section-3--technology-stack) | Every tool explained |
| 4 | [Project Folder Structure](#section-4--project-folder-structure) | Every file mapped |
| 5 | [Development Process](#section-5--development-process) | Planning → Maintenance |
| 6 | [Complete DevOps Workflow](#section-6--complete-devops-workflow) | Code → Browser |
| 7 | [Git & GitHub](#section-7--git--github) | Every command |
| 8 | [Docker](#section-8--docker) | Every concept & command |
| 9 | [AWS](#section-9--aws) | Services, Security, Pricing |
| 10 | [Linux](#section-10--linux) | Every command used |
| 11 | [Nginx](#section-11--nginx) | Config, Proxy, Logs |
| 12 | [Deployment](#section-12--deployment) | Localhost → Production |
| 13 | [Common Problems](#section-13--common-problems) | Diagnosis & Fix |
| 14 | [How Components Connect](#section-14--how-components-connect) | Inter-system wiring |
| 15 | [Viva Questions (150+)](#section-15--viva-questions) | Basic → Tricky |
| 16 | [Model Answers](#section-16--model-answers) | Natural language |
| 17 | [Hands-on Demonstration](#section-17--hands-on-demonstration) | Click-by-click guide |
| 18 | [Cheat Sheet](#section-18--cheat-sheet) | Final revision |

---

# SECTION 1 — Project Introduction

## 1.1 What is DevOpsHub?

DevOpsHub is an **open-source, self-hosted Platform-as-a-Service (PaaS)**.

Think of it this way: Heroku, Vercel, and Render are cloud platforms that let you push code and get a live URL. They are expensive and proprietary. DevOpsHub gives you the same power **on your own AWS infrastructure**, for free.

**In one sentence:** DevOpsHub is a web dashboard that lets you paste a GitHub repository URL, click "Deploy", and the platform will SSH into your AWS EC2 server, clone the repo, auto-detect the framework, build a Docker image, start the container, and give you a live URL — all while streaming real-time logs to your browser.

### Real-World Analogy

Imagine you own a restaurant (your EC2 server). Currently, every time a new recipe (code) arrives, you have to:

1. Walk to the warehouse (GitHub) yourself
2. Carry ingredients back (git clone)
3. Cook the recipe (Docker build)
4. Serve it to customers (docker compose up)

DevOpsHub is like hiring an **automated kitchen manager** who does all of this for you the moment a new recipe sheet arrives — and sends you live updates on your phone (WebSocket logs).

## 1.2 Why Was It Built?

| Problem | DevOpsHub Solution |
|---------|-------------------|
| Manual SSH + git clone + docker build for every deployment | One-click automated deployment |
| No visibility into what's happening on the server | Real-time streaming logs via WebSockets |
| Complex Nginx reverse-proxy config for every app | Automated routing |
| Expensive PaaS platforms (Heroku: $7+/dyno/month) | Runs on AWS Free Tier ($0/month for 12 months) |
| Students can't demonstrate DevOps skills | Complete deployable project with infrastructure code |
| Security is often an afterthought | Built-in AES-256-GCM encryption, JWT auth, rate limiting, input sanitisation |

## 1.3 What Problem Does It Solve?

The core problem is: **Deploying web applications to cloud servers is complex and manual.**

Without DevOpsHub, a developer must:

1. SSH into the server manually
2. Install Git, Docker, and dependencies
3. Clone the repository
4. Write a Dockerfile (if one doesn't exist)
5. Build the Docker image
6. Run the container
7. Configure Nginx
8. Monitor logs by hand
9. Repeat for every update

DevOpsHub **automates every single step above** from a simple web dashboard.

## 1.4 Target Users

| User Persona | How They Use DevOpsHub |
|-------------|----------------------|
| **University Students** | Deploy final-year projects and demonstrate DevOps skills |
| **Freelancers** | Quickly deploy client websites on their own EC2 |
| **Small Dev Teams** | Shared deployment dashboard without paying for Heroku/Render |
| **DevOps Learners** | Study how SSH, Docker, Git, and AWS work together |
| **Bootcamp Instructors** | Teach deployment pipelines with a real, working platform |

## 1.5 Features

1. **Email OTP Authentication** — Passwordless login using email-based one-time passcodes (SMTP or local dev fallback).
2. **GitHub Integration** — Connect your GitHub Personal Access Token to deploy private repositories.
3. **AWS Credential Management** — Securely store AWS Access Keys (encrypted with AES-256-GCM) and list your EC2 instances.
4. **Server Instance Management** — Save target EC2 servers with their IP, SSH username, and encrypted PEM private key.
5. **One-Click Deployment** — Select a project, click Deploy, and the entire pipeline runs automatically.
6. **9-Stage Deployment Pipeline** — Validation → SSH Auth → Environment Check → Workspace Prep → Git Clone → Framework Detection → Docker Build → Container Start → Health Check.
7. **Real-Time Log Streaming** — Live build/deploy logs streamed to the browser via Socket.io WebSockets.
8. **Self-Healing Mechanisms** — Automatic port conflict resolution, disk space cleanup, corrupted clone recovery.
9. **Auto Framework Detection** — Detects static sites, Node.js apps, or Docker Compose projects and generates appropriate configuration.
10. **Server Monitoring Dashboard** — CPU and RAM utilization charts (Prometheus/Grafana ready).
11. **Dark/Light Theme** — Persisted theme toggle with smooth CSS transitions.
12. **Infrastructure as Code** — Terraform for EC2 provisioning, Ansible for server configuration.

## 1.6 Project Goals

1. **Educational** — Serve as a complete, study-worthy DevOps project for university submissions and viva exams.
2. **Practical** — Actually work in production on a real AWS EC2 instance.
3. **Zero-Cost** — Optimized to run on `t2.micro` / `t3.micro` (AWS Free Tier).
4. **Secure** — Follow security best practices: encryption at rest, JWT tokens, rate limiting, input validation, no hardcoded secrets in production.
5. **Self-Healing** — The system should recover from common failures (port conflicts, disk full, corrupted clones) automatically.
6. **Open Source** — MIT licensed, designed for the community.

---

# SECTION 2 — Overall Architecture

## 2.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DEVELOPER'S MACHINE                                │
│                                                                             │
│   ┌──────────┐    git push     ┌──────────┐                                │
│   │  VS Code │ ──────────────→ │  GitHub  │                                │
│   │  (Code)  │                 │  (Repo)  │                                │
│   └──────────┘                 └────┬─────┘                                │
│                                     │                                       │
│   ┌──────────────────────────┐      │  Repo URL                            │
│   │  DevOpsHub Frontend      │      │                                       │
│   │  (React + Vite + TS)     │◄─────┘                                       │
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
│              │ SSH (Port 22) via ssh2 library                               │
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
│  │  │  • Port 80   (HTTP)     ← Nginx                           │     │     │
│  │  │  • Port 443  (HTTPS)    ← Nginx + SSL                     │     │     │
│  │  │  • Port 4000 (API)      ← Backend API (if hosted here)    │     │     │
│  │  │  • Port 8000-9000       ← User's deployed containers      │     │     │
│  │  │  Outbound: ALL traffic allowed                             │     │     │
│  │  └────────────────────────────────────────────────────────────┘     │     │
│  │                                                                     │     │
│  │  ┌──── EC2 Instance (t3.micro) ───────────────────────────────┐   │     │
│  │  │  OS: Ubuntu 22.04 LTS                                      │   │     │
│  │  │  Key Pair: devopshub-key.pem                               │   │     │
│  │  │  Storage: 8 GB gp3 EBS                                    │   │     │
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
│  │  │  │  └── [User's source code]                           │    │   │     │
│  │  │  │                                                      │    │   │     │
│  │  │  │  docker compose build  →  Docker Image               │    │   │     │
│  │  │  │  docker compose up -d  →  Running Container          │    │   │     │
│  │  │  │                            ↓                         │    │   │     │
│  │  │  │                   http://EC2_IP:PORT                  │    │   │     │
│  │  │  └──────────────────────────────────────────────────────┘    │   │     │
│  │  └─────────────────────────────────────────────────────────────┘   │     │
│  └─────────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│  Infrastructure as Code:                                                    │
│  • Terraform (main.tf)  → Provisions EC2 + Security Group                  │
│  • Ansible (playbook.yml) → Installs Docker, Git, Nginx, Swap              │
│                                                                             │
└──────────────────────────────────────────────────────────────────────────────┘
               │
               ▼
┌──────────────────────────┐
│      END USER            │
│  Browser → http://IP:PORT│
│  Sees deployed app       │
└──────────────────────────┘
```

## 2.2 Data Flow — Step by Step

```
1. Developer writes code on their machine
           │
           ▼
2. Developer pushes code to GitHub
           │
           ▼
3. Developer opens DevOpsHub dashboard in browser (React app)
           │
           ▼
4. Developer creates a Project (name, GitHub repo URL, branch, port, target server)
           │
           ▼  HTTP POST /api/projects
5. Backend creates Project record in SQLite via Prisma
           │
           ▼
6. Developer clicks "Deploy" button
           │
           ▼  HTTP POST /api/projects/:id/deploy
7. Backend creates a Deployment record with status "BUILDING"
   Backend pre-creates 9 DeploymentStage records (all "PENDING")
   Backend immediately returns HTTP 202 (Accepted)
           │
           ▼  (Async — background process)
8. Backend decrypts the SSH private key (AES-256-GCM)
   Backend opens SSH connection to EC2 server (ssh2 library)
           │
           ▼  Stage 1: Validating Configuration
9. Validates Git URL format, branch name, SSH key presence
           │
           ▼  Stage 2: SSH Authentication
10. Establishes SSH connection with retry (max 3 attempts, exponential backoff)
           │
           ▼  Stage 3: Checking Server Environment
11. Checks Git, Docker, Docker Compose installation
    Checks disk space (minimum 500MB free)
    Resolves port conflicts (stops conflicting containers)
           │
           ▼  Stage 4: Preparing Workspace
12. Creates ~/deployments/{projectId}/ directory on remote server
           │
           ▼  Stage 5: Cloning Repository
13. If .git exists: git fetch + git reset --hard origin/{branch}
    If not: git clone -b {branch} {repoUrl}
    Self-healing: if clone fails, wipes directory and retries
           │
           ▼  Stage 6: Detecting Framework
14. If docker-compose.yml exists → uses it directly
    If index.html exists → generates nginx-based Dockerfile
    If package.json exists → generates Node.js Dockerfile
    Otherwise → generates a fallback landing page
           │
           ▼  Stage 7: Building Docker Image
15. Runs: docker compose build
    Self-healing: if disk full, runs docker system prune and retries
           │
           ▼  Stage 8: Starting Container
16. Runs: docker compose up -d
    Self-healing: if network error, prunes docker networks and retries
           │
           ▼  Stage 9: Health Check
17. Waits 5 seconds, then:
    Checks container is "Up" status
    Checks port is accepting TCP connections
    If failed: pulls last 50 lines of container logs for diagnosis
           │
           ▼
18. Updates Deployment status to SUCCESS or FAILED
    All log lines are streamed to the browser in real-time via Socket.io

           │
           ▼  Meanwhile...
19. Frontend receives live log-line and stage-update WebSocket events
    Updates UI in real-time (expanding stages, showing green/red icons)
           │
           ▼
20. End user opens http://EC2_PUBLIC_IP:PORT in browser
    Sees the deployed application running
```

## 2.3 Explaining Every Block

### Developer's Machine
- This is where you write code. You use VS Code (or any editor) and Git to push to GitHub.

### GitHub
- The central code repository. DevOpsHub reads from GitHub to clone code onto the server. You can use public repos freely; for private repos, you save a GitHub Personal Access Token (PAT) in the Integrations tab.

### DevOpsHub Frontend (React)
- The web-based dashboard the developer interacts with. Built with React 19, TypeScript, Vite, and Tailwind CSS 4.
- Communicates with the backend via Axios (HTTP) for CRUD operations and Socket.io (WebSocket) for live log streaming.

### DevOpsHub Backend (Node.js)
- The brain of the system. Express REST API handles projects, auth, and integrations.
- Uses Prisma ORM to talk to the database, ssh2 library to remotely execute commands on the EC2 server, and Socket.io to push real-time log updates to the frontend.

### SQLite Database (dev.db)
- Lightweight, file-based database. Stores users, projects, deployments, stages, AWS credentials, server instances, and OTP codes.
- In production, this can be swapped to PostgreSQL (the docker-compose.yml already defines a PostgreSQL service for this purpose).

### SSH Connection (ssh2)
- The backend programmatically opens an SSH tunnel to the target EC2 server — exactly like typing `ssh -i key.pem ubuntu@IP` in your terminal, but done via code.

### AWS EC2 Instance
- The actual cloud server where user applications run. DevOpsHub deploys Docker containers onto this machine.
- Provisioned by Terraform, configured by Ansible.

### Docker Engine
- Runs on the EC2 server. Each user project becomes a separate Docker container with its own isolated filesystem, process, and network port.

### Nginx
- Acts as a reverse proxy on the EC2 server. Can route incoming HTTP traffic on port 80 to the correct container port.

### End User
- Anyone who opens the deployed application URL in their browser. They see the running app — they know nothing about Docker, SSH, or DevOpsHub behind the scenes.

---

# SECTION 3 — Technology Stack

## 3.1 Frontend Technologies

### React (v19)

| Attribute | Detail |
|-----------|--------|
| **What it is** | A JavaScript library for building user interfaces, developed by Meta (Facebook). |
| **Why it is used** | React makes it easy to build dynamic, interactive UIs using reusable components. The DevOpsHub dashboard (login, projects, monitoring, integrations) is built entirely with React. |
| **How it works** | React uses a **Virtual DOM** — a lightweight copy of the real DOM. When data changes, React calculates the minimum number of real DOM updates needed, making the UI extremely fast. |
| **Advantages** | Component-based architecture, huge ecosystem, strong community, fast rendering via Virtual DOM, one-way data flow makes debugging easier. |
| **Disadvantages** | Requires build tooling (Vite/Webpack), learning curve for state management, JSX syntax can feel unusual at first. |
| **Alternatives** | Vue.js, Angular, Svelte, SolidJS |

### TypeScript (v6)

| Attribute | Detail |
|-----------|--------|
| **What it is** | A **superset** of JavaScript that adds static type checking. Think of it as JavaScript with a safety net. |
| **Why it is used** | Catches bugs at compile time instead of runtime. For example, if you pass a `string` where a `number` is expected, TypeScript shows an error before you even run the code. Both the frontend and backend of DevOpsHub are written in TypeScript. |
| **How it works** | You write `.ts` or `.tsx` files. The TypeScript compiler (`tsc`) type-checks them and compiles them to plain JavaScript that browsers or Node.js can run. |
| **Advantages** | Catches bugs early, better IDE support (autocomplete, refactoring), self-documenting code, easier to maintain large codebases. |
| **Disadvantages** | Extra compilation step, steeper learning curve than plain JS, type definitions can become verbose. |
| **Alternatives** | Plain JavaScript, Flow (by Meta) |

### Vite (v8)

| Attribute | Detail |
|-----------|--------|
| **What it is** | A next-generation frontend build tool. The name "Vite" means "fast" in French. |
| **Why it is used** | Vite provides instant server start, lightning-fast Hot Module Replacement (HMR), and optimized production builds. It replaces older tools like Webpack. |
| **How it works** | In development, Vite serves files using native ES modules (no bundling needed — the browser loads modules directly). In production, it uses Rollup to create optimized bundles. |
| **Advantages** | Extremely fast dev server startup (< 300ms), instant HMR, smaller build output, built-in TypeScript support. |
| **Disadvantages** | Relatively newer ecosystem, some older libraries may not be fully compatible. |
| **Alternatives** | Webpack, Parcel, esbuild, Turbopack |

### Tailwind CSS (v4)

| Attribute | Detail |
|-----------|--------|
| **What it is** | A utility-first CSS framework. Instead of writing custom CSS classes like `.btn-primary { background: blue; padding: 10px; }`, you apply utility classes directly: `bg-blue-500 p-2.5`. |
| **Why it is used** | Enables rapid UI development without writing custom CSS files. DevOpsHub uses Tailwind for the entire frontend styling. |
| **Advantages** | Extremely fast development, consistent design, no unused CSS in production (tree-shaking), responsive design built-in. |
| **Disadvantages** | HTML can look cluttered with many classes, learning all utility names takes time. |
| **Alternatives** | Bootstrap, Material UI, Vanilla CSS, Styled Components |

### Zustand

| Attribute | Detail |
|-----------|--------|
| **What it is** | A small, fast, and scalable state management library for React. The name is German for "state". |
| **Why it is used** | DevOpsHub uses Zustand to manage the authentication state (`token` and `user`). When you log in, Zustand stores the JWT token and user object; when you log out, it clears them. |
| **How it works** | You create a "store" — a simple JavaScript object with state and actions. Components subscribe to only the parts they need, so they re-render only when those parts change. |
| **Advantages** | Minimal boilerplate (much simpler than Redux), no providers needed, works outside React components, tiny bundle size (~1 KB). |
| **Disadvantages** | Less structured than Redux for very large apps, fewer middleware options. |
| **Alternatives** | Redux, MobX, Jotai, Recoil, React Context API |

### Axios

| Attribute | Detail |
|-----------|--------|
| **What it is** | A promise-based HTTP client for the browser and Node.js. |
| **Why it is used** | DevOpsHub uses Axios to make REST API calls from the frontend to the backend (login, create project, deploy, etc.). It also uses Axios interceptors to automatically attach the JWT token to every request. |
| **Advantages** | Automatic JSON parsing, request/response interceptors, cancellation support, better error handling than fetch. |
| **Disadvantages** | Extra dependency (browser's native `fetch` API can do similar things). |
| **Alternatives** | Fetch API (native), ky, got (Node.js), superagent |

### Socket.io Client

| Attribute | Detail |
|-----------|--------|
| **What it is** | The client-side library for Socket.io — a real-time, bidirectional event-based communication library. |
| **Why it is used** | When a deployment is running, the backend sends live log lines and stage updates to the frontend via WebSockets. Without this, you'd have to refresh the page to see updates. |
| **How it works** | The client connects to the backend's Socket.io server, "joins" a project's room, and listens for `log-line` and `stage-update` events. |
| **Advantages** | Real-time communication, automatic reconnection, fallback to HTTP long-polling if WebSockets aren't available. |
| **Disadvantages** | Adds complexity, requires Socket.io server on the backend. |
| **Alternatives** | Native WebSocket API, Server-Sent Events (SSE), Pusher |

### React Router DOM (v7)

| Attribute | Detail |
|-----------|--------|
| **What it is** | A routing library for React applications. |
| **Why it is used** | DevOpsHub has multiple pages: Login (`/login`), Dashboard (`/`), Projects (`/projects`), Integrations (`/integrations`). React Router enables navigation between these pages without a full page reload. |
| **Advantages** | Declarative routing, nested routes, lazy loading, history management. |
| **Disadvantages** | Adds bundle size, API changes between major versions. |
| **Alternatives** | TanStack Router, Reach Router, Next.js built-in routing |

### Recharts

| Attribute | Detail |
|-----------|--------|
| **What it is** | A chart library built on React and D3.js. |
| **Why it is used** | The Monitoring/Dashboard page displays CPU and RAM utilization area charts using Recharts. |
| **Advantages** | Easy React integration, declarative API, responsive, built on D3. |
| **Disadvantages** | Limited advanced charting options compared to D3 directly. |
| **Alternatives** | Chart.js, D3.js, Nivo, Victory |

### Lucide React

| Attribute | Detail |
|-----------|--------|
| **What it is** | A collection of beautiful, consistent SVG icons for React. |
| **Why it is used** | Provides all the icons in the DevOpsHub UI — dashboard, code, link, logout, mail, shield, loader, chevrons, check circles, X circles, etc. |
| **Advantages** | Tree-shakeable (only imports icons you use), consistent design, customizable via props. |
| **Alternatives** | Heroicons, Font Awesome, React Icons, Phosphor Icons |

---

## 3.2 Backend Technologies

### Node.js

| Attribute | Detail |
|-----------|--------|
| **What it is** | A JavaScript runtime environment that runs JavaScript code **outside** the browser, on the server side. Built on Google Chrome's V8 JavaScript engine. |
| **Why it is used** | Enables writing both frontend and backend in the same language (JavaScript/TypeScript). Node.js is event-driven and non-blocking, making it ideal for I/O-heavy operations like SSH connections and log streaming. |
| **How it works** | Node.js uses a single-threaded event loop. Instead of creating a new thread for each request (like Java), it handles requests asynchronously using callbacks and promises. This makes it very efficient for handling many concurrent connections (like streaming logs to multiple users). |
| **Advantages** | Same language on front and back, huge npm ecosystem, excellent for real-time applications, non-blocking I/O. |
| **Disadvantages** | Single-threaded (CPU-intensive tasks can block), callback hell (mitigated by async/await), less suitable for heavy computation. |
| **Alternatives** | Python (Flask/Django), Go, Java (Spring Boot), Rust (Actix) |

### Express (v5)

| Attribute | Detail |
|-----------|--------|
| **What it is** | The most popular web framework for Node.js. It provides a minimal, flexible way to create HTTP servers and APIs. |
| **Why it is used** | DevOpsHub's backend REST API is built with Express. It handles routing (`/api/auth/*`, `/api/projects/*`), middleware (CORS, JSON parsing, auth, error handling), and request/response management. |
| **How it works** | You define routes (URL paths + HTTP methods) and attach handler functions. Middleware functions run in sequence before the handler — like a conveyor belt where each station adds something (parse JSON → check auth → handle request → catch errors). |
| **Advantages** | Minimal, flexible, huge ecosystem of middleware, easy to learn, battle-tested in production. |
| **Disadvantages** | Minimal by design (you add everything yourself), no built-in ORM or auth. |
| **Alternatives** | Fastify, Koa, Hapi, NestJS |

### Prisma ORM (v5)

| Attribute | Detail |
|-----------|--------|
| **What it is** | A next-generation Object-Relational Mapping (ORM) tool for Node.js and TypeScript. |
| **Why it is used** | Instead of writing raw SQL queries, Prisma provides a type-safe, auto-completed API. In DevOpsHub, every database operation (creating users, projects, deployments, etc.) goes through Prisma. |
| **How it works** | You define your database schema in `schema.prisma`. Prisma generates a TypeScript client with methods like `prisma.project.findMany()`, `prisma.deployment.create()`, etc. |
| **Key concepts** | **Schema** = defines tables and relationships. **Client** = auto-generated TypeScript API. **Migrations** = version-controlled schema changes. **Seed** = initial data population. |
| **Advantages** | Type-safe queries, auto-generated client, migration system, works with PostgreSQL/MySQL/SQLite/MongoDB. |
| **Disadvantages** | Generated client can be large, less flexibility for complex raw SQL, learning curve. |
| **Alternatives** | TypeORM, Sequelize, Drizzle ORM, Knex.js |

### SQLite

| Attribute | Detail |
|-----------|--------|
| **What it is** | A self-contained, serverless, file-based relational database engine. The entire database is a single file (`dev.db`). |
| **Why it is used** | Perfect for development and small-scale production. No separate database server needed — just a file on disk. DevOpsHub uses SQLite for local development (`file:./dev.db`). |
| **Advantages** | Zero configuration, no server process, single file, fast for reads, widely supported. |
| **Disadvantages** | Not suitable for high-concurrency writes, no user access control, not networked. |
| **Alternatives** | PostgreSQL, MySQL, MariaDB, MongoDB |

### PostgreSQL (v15)

| Attribute | Detail |
|-----------|--------|
| **What it is** | A powerful, open-source, enterprise-grade relational database system. |
| **Why it is used** | The `docker-compose.yml` defines a PostgreSQL service for production use. It handles concurrent writes, has advanced features (JSON support, full-text search), and scales well. |
| **Advantages** | ACID compliant, handles concurrency well, advanced data types, extensions, battle-tested. |
| **Disadvantages** | Requires a running server process, more complex setup than SQLite, higher memory usage. |
| **Alternatives** | MySQL, MariaDB, CockroachDB, SQLite |

### ssh2

| Attribute | Detail |
|-----------|--------|
| **What it is** | A pure JavaScript SSH2 client library for Node.js. |
| **Why it is used** | This is the **core** of DevOpsHub's deployment engine. The backend uses ssh2 to programmatically SSH into the target EC2 server and run commands (git clone, docker build, docker compose up, etc.) — all without manual intervention. |
| **How it works** | Creates an SSH client, connects using the server's IP, username, and private key, then executes shell commands via `conn.exec()`. Output streams (stdout/stderr) are piped back to the backend, which forwards them via WebSocket. |
| **Advantages** | Pure JavaScript (no native binaries), supports key-based auth, shell execution, SFTP. |
| **Disadvantages** | Complex API, no built-in retry logic (DevOpsHub implements its own). |
| **Alternatives** | node-ssh, shelljs (local only), child_process.exec with system ssh |

### Socket.io Server

| Attribute | Detail |
|-----------|--------|
| **What it is** | A real-time, bidirectional event-based communication library for Node.js. |
| **Why it is used** | During deployment, the backend emits `log-line` and `stage-update` events that the frontend receives in real-time. This creates the live terminal experience in the browser. |
| **How it works** | The backend creates a Socket.io server attached to the Express HTTP server. Clients connect and "join" a room (identified by `projectId`). The backend emits events to that room, and all connected clients receive them instantly. |
| **Advantages** | Real-time communication, rooms/namespaces for organization, automatic reconnection, fallback transports. |
| **Disadvantages** | Stateful (requires sticky sessions for scaling), adds server memory overhead per connection. |
| **Alternatives** | ws (raw WebSockets), µWebSockets, Pusher, Ably |

### JSON Web Tokens (JWT)

| Attribute | Detail |
|-----------|--------|
| **What it is** | An open standard (RFC 7519) for creating JSON-based access tokens. |
| **Why it is used** | After OTP verification, the backend creates a JWT containing the user's ID and email, signs it with a secret key, and sends it to the frontend. The frontend stores it and sends it with every request in the `Authorization: Bearer <token>` header. The backend verifies the token to identify the user. |
| **How it works** | A JWT has three parts: **Header** (algorithm), **Payload** (data — user ID, email, expiry), **Signature** (HMAC of header + payload using the secret). The backend can verify the signature without a database lookup. |
| **Structure** | `header.payload.signature` (Base64URL encoded, separated by dots) |
| **Advantages** | Stateless (no session storage needed), self-contained, can include claims, widely supported. |
| **Disadvantages** | Cannot be revoked individually (until expiry), payload is Base64-encoded (not encrypted), token size grows with claims. |
| **Alternatives** | Session cookies, OAuth 2.0 tokens, Passport.js sessions |

### Nodemailer

| Attribute | Detail |
|-----------|--------|
| **What it is** | A module for Node.js applications to send emails via SMTP. |
| **Why it is used** | DevOpsHub uses Nodemailer to send OTP verification codes to users' email addresses. If SMTP credentials are not configured, it falls back to logging the OTP in the backend console. |
| **Advantages** | Supports SMTP, OAuth2, HTML emails, attachments, widely used. |
| **Disadvantages** | Requires SMTP server credentials, emails may land in spam if not configured properly. |
| **Alternatives** | SendGrid, AWS SES, Mailgun, Postmark |

### AWS SDK for JavaScript (v3)

| Attribute | Detail |
|-----------|--------|
| **What it is** | Amazon Web Services' official SDK for JavaScript/TypeScript. |
| **Why it is used** | The `awsService.ts` uses `@aws-sdk/client-ec2` to list EC2 instances from a user's AWS account. When a user saves their AWS credentials, DevOpsHub can show them their running instances and let them select a deployment target. |
| **Advantages** | Official AWS support, modular (import only what you need), TypeScript types included. |
| **Disadvantages** | Complex API, large package sizes, requires understanding of AWS services. |
| **Alternatives** | AWS CLI (command line), Terraform (for provisioning) |

---

## 3.3 Infrastructure & DevOps Technologies

### Docker

| Attribute | Detail |
|-----------|--------|
| **What it is** | A platform for building, shipping, and running applications in **containers** — lightweight, isolated environments that package code with all its dependencies. |
| **Why it is used** | DevOpsHub deploys every user project as a Docker container. This ensures the app runs exactly the same way regardless of what's installed on the server. |
| **Real-world analogy** | Think of a shipping container. It doesn't matter what's inside — the crane, truck, and ship handle it the same way. Docker containers work the same: they isolate your app so it runs identically everywhere. |
| **Advantages** | Consistent environments, isolation, portability, efficient resource usage (lighter than VMs), version control for environments. |
| **Disadvantages** | Learning curve, container networking complexity, persistent storage requires volumes, security considerations. |
| **Alternatives** | Podman, containerd, LXC, virtual machines (VMware, VirtualBox) |

### Docker Compose

| Attribute | Detail |
|-----------|--------|
| **What it is** | A tool for defining and running multi-container Docker applications using a YAML file. |
| **Why it is used** | DevOpsHub itself runs with Docker Compose (backend + PostgreSQL + network). User projects are also deployed using `docker compose up -d`. The compose file defines services, ports, volumes, and networks in one file. |
| **Advantages** | Single-file multi-container definition, easy service orchestration, networking between containers, environment variable management. |
| **Disadvantages** | Not suitable for production orchestration at scale (use Kubernetes instead). |
| **Alternatives** | Kubernetes, Docker Swarm, Nomad |

### Git

| Attribute | Detail |
|-----------|--------|
| **What it is** | A distributed version control system that tracks changes in files. |
| **Why it is used** | Every developer uses Git to track code changes. DevOpsHub uses Git on the deployment server to clone repositories and pull updates. |
| **Advantages** | Distributed (every clone is a full backup), branching is fast, industry standard, free and open source. |
| **Disadvantages** | Steep learning curve, merge conflicts, large binary files are not handled well. |
| **Alternatives** | Mercurial, SVN (Subversion), Perforce |

### GitHub

| Attribute | Detail |
|-----------|--------|
| **What it is** | A web-based hosting platform for Git repositories, owned by Microsoft. |
| **Why it is used** | DevOpsHub pulls source code from GitHub repositories. Users paste their GitHub repo URL in the project creation form, and the deployment pipeline clones it. |
| **Advantages** | Free for public repos, pull requests, issues, Actions (CI/CD), large community. |
| **Disadvantages** | Proprietary platform, pricing for private repos on teams, vendor lock-in. |
| **Alternatives** | GitLab, Bitbucket, Gitea (self-hosted), Azure DevOps |

### GitHub Actions

| Attribute | Detail |
|-----------|--------|
| **What it is** | GitHub's built-in CI/CD (Continuous Integration / Continuous Deployment) platform. |
| **Why it is used** | The project has a `.github/workflows/` directory for CI/CD pipeline definitions (currently empty — ready for custom workflows). |
| **How it works** | You define YAML workflow files in `.github/workflows/`. GitHub runs them on events like `push`, `pull_request`, or `schedule`. |
| **Advantages** | Integrated with GitHub, free for public repos, large marketplace of pre-built actions. |
| **Disadvantages** | Vendor lock-in, YAML syntax can be complex, limited free minutes for private repos. |
| **Alternatives** | Jenkins, GitLab CI, CircleCI, Travis CI |

### Terraform

| Attribute | Detail |
|-----------|--------|
| **What it is** | An Infrastructure as Code (IaC) tool by HashiCorp. You define your cloud infrastructure in declarative `.tf` files, and Terraform creates/modifies/destroys resources to match. |
| **Why it is used** | DevOpsHub uses Terraform to provision the AWS EC2 instance, security group, and VPC configuration. Instead of clicking through the AWS Console, you run `terraform apply` and everything is created automatically and reproducibly. |
| **How it works** | 1. Write `.tf` files → 2. `terraform init` (download providers) → 3. `terraform plan` (preview changes) → 4. `terraform apply` (execute changes). Terraform stores the current state in `terraform.tfstate`. |
| **Key file** | `infrastructure/terraform/main.tf` — defines the EC2 instance (t3.micro, Ubuntu AMI), security group (ports 22, 80, 443, 4000, 8000-9000), and VPC. |
| **Advantages** | Reproducible infrastructure, version controlled, supports 3000+ providers (AWS, GCP, Azure, etc.), plan before apply. |
| **Disadvantages** | State management complexity, learning curve, HCL syntax is unique, state file must be stored securely. |
| **Alternatives** | AWS CloudFormation, Pulumi, Ansible (for provisioning), AWS CDK |

### Ansible

| Attribute | Detail |
|-----------|--------|
| **What it is** | An agentless IT automation tool for configuration management, application deployment, and task automation. |
| **Why it is used** | After Terraform creates the EC2 instance, Ansible **configures** it — installs Docker, Git, Nginx, sets up swap memory, configures SSH, adds the user to the docker group. |
| **How it works** | You define a **playbook** (YAML file listing tasks) and an **inventory** (list of servers). Ansible SSHs into each server and executes the tasks in order. No agent software needs to be installed on the server — just SSH access. |
| **Key files** | `infrastructure/ansible/playbook.yml` (tasks), `infrastructure/ansible/hosts.ini` (server IP + SSH credentials) |
| **Advantages** | Agentless (uses SSH), simple YAML syntax, idempotent (safe to run multiple times), large module library. |
| **Disadvantages** | Slower than agent-based tools, YAML can be fragile, limited Windows support. |
| **Alternatives** | Chef, Puppet, SaltStack, shell scripts |

### AWS EC2 (Elastic Compute Cloud)

| Attribute | Detail |
|-----------|--------|
| **What it is** | AWS's core cloud computing service that provides resizable virtual servers (instances) in the cloud. |
| **Why it is used** | DevOpsHub deploys user applications onto EC2 instances. The project is optimized for `t2.micro` or `t3.micro` instances (1 vCPU, 1 GB RAM) which are covered by the AWS Free Tier. |
| **Advantages** | Flexible instance types, pay-per-use, global availability, easy scaling. |
| **Disadvantages** | Can be expensive if misconfigured, complex pricing, management overhead. |
| **Alternatives** | DigitalOcean Droplets, Linode, Google Compute Engine, Azure VMs |

### Linux / Ubuntu

| Attribute | Detail |
|-----------|--------|
| **What it is** | Linux is a free, open-source operating system kernel. Ubuntu is the most popular Linux distribution for servers. |
| **Why it is used** | The EC2 instance runs Ubuntu 22.04 LTS. All deployment commands (git clone, docker build, etc.) run on this Linux system. |
| **Advantages** | Free, stable, secure, huge community, excellent server support, most cloud services run Linux. |
| **Disadvantages** | Command-line focused (no GUI on servers), learning curve for Windows users. |
| **Alternatives** | Amazon Linux, Debian, CentOS/Rocky Linux, Alpine Linux |

### SSH (Secure Shell)

| Attribute | Detail |
|-----------|--------|
| **What it is** | A cryptographic network protocol for secure remote access to servers. |
| **Why it is used** | DevOpsHub's backend uses SSH (via the ssh2 library) to connect to the EC2 server and execute deployment commands. Users provide their SSH private key (PEM file), which is encrypted and stored in the database. |
| **How it works** | SSH uses public-key cryptography. The EC2 instance has the public key (added during creation). DevOpsHub has the private key (uploaded by the user). When connecting, SSH uses these keys to establish an encrypted tunnel. |
| **Default port** | 22 |
| **Advantages** | Encrypted communication, key-based authentication (no passwords), industry standard. |
| **Disadvantages** | Key management complexity, port must be open in security groups. |
| **Alternatives** | AWS Systems Manager Session Manager (no port 22 needed), RDP (for Windows) |

### Nginx

| Attribute | Detail |
|-----------|--------|
| **What it is** | A high-performance web server and reverse proxy. Pronounced "engine-X". |
| **Why it is used** | Nginx runs on the EC2 instance and can serve as a reverse proxy — routing incoming HTTP traffic on port 80 to the correct Docker container port. It can also serve the React frontend's static files in production. |
| **Advantages** | Extremely fast, low memory footprint, handles thousands of concurrent connections, built-in load balancing. |
| **Disadvantages** | Configuration syntax is not intuitive, debugging can be difficult. |
| **Alternatives** | Apache HTTP Server, Caddy, Traefik, HAProxy |

### DNS (Domain Name System)

| Attribute | Detail |
|-----------|--------|
| **What it is** | The "phonebook of the internet" — translates human-readable domain names (like `app.example.com`) to IP addresses (like `52.72.196.27`). |
| **Why it is relevant** | If you want to access your deployed app via a domain name instead of an IP address, you configure a DNS A record pointing to your EC2's public IP. |
| **Alternatives** | Cloudflare DNS, Route 53 (AWS), Google Cloud DNS |

### HTTPS (TLS/SSL)

| Attribute | Detail |
|-----------|--------|
| **What it is** | HTTPS is HTTP with encryption via TLS (Transport Layer Security). It ensures data between the browser and server is encrypted and cannot be intercepted. |
| **Why it is relevant** | For production deployments, you should enable HTTPS using a free SSL certificate from Let's Encrypt (certbot). The security group already allows port 443 (HTTPS). |
| **How to enable** | `sudo apt install certbot python3-certbot-nginx` → `sudo certbot --nginx -d yourdomain.com` |

### Environment Variables

| Attribute | Detail |
|-----------|--------|
| **What it is** | Key-value pairs that configure an application without hardcoding values in the source code. |
| **Why they are used** | DevOpsHub uses environment variables for: `PORT` (server port), `DATABASE_URL` (database connection), `JWT_SECRET` (token signing), `ENCRYPTION_KEY` (AES encryption), `SMTP_*` (email), `FRONTEND_URL` (CORS origin). |
| **How they work** | Stored in a `.env` file (not committed to Git). The `dotenv` library loads them into `process.env` at startup. |
| **Security rule** | **Never** commit `.env` files to Git. Use `.env.example` as a template. |

### Systemd

| Attribute | Detail |
|-----------|--------|
| **What it is** | The system and service manager for Linux. |
| **Why it is relevant** | Systemd manages the Docker daemon (`systemctl start docker`), Nginx (`systemctl restart nginx`), and SSH (`systemctl reload ssh`) on the EC2 server. |

---

# SECTION 4 — Project Folder Structure

## 4.1 Root Level

```
d:\project\
├── .git/                          # Git repository metadata
├── .gitignore                     # Files/folders Git should ignore
├── DevOpsHub/                     # ★ THE MAIN PROJECT
├── devopshub-demo-app/            # A sample app for testing deployments
├── node_modules/                  # Root-level npm packages
├── package.json                   # Root-level package definition
├── package-lock.json              # Exact dependency versions
├── guide.md                       # THIS handbook
└── summary_and_next_steps.md      # Development summary document
```

## 4.2 DevOpsHub — Main Project

```
DevOpsHub/
├── .github/
│   └── workflows/                 # GitHub Actions CI/CD (empty — ready for workflows)
├── README.md                      # Project README with badges & quick start
├── docker-compose.yml             # Multi-container setup (PostgreSQL + Backend)
├── frontend/                      # React frontend application
├── backend/                       # Node.js/Express backend API
└── infrastructure/                # Terraform + Ansible IaC
```

## 4.3 Backend (`DevOpsHub/backend/`)

```
backend/
├── .env                           # ⚠️ Active environment variables (NOT committed)
├── .env.example                   # Template showing required env vars
├── Dockerfile                     # Docker image definition for the backend
├── package.json                   # Dependencies & scripts
├── package-lock.json              # Locked dependency versions
├── tsconfig.json                  # TypeScript compiler configuration
│
├── prisma/
│   ├── schema.prisma              # ★ DATABASE SCHEMA (6 models)
│   ├── dev.db                     # SQLite database file
│   ├── seed.ts                    # Database seeding script
│   └── migrations/                # Schema migration history
│
├── src/
│   ├── server.ts                  # ★ APPLICATION ENTRY POINT
│   │                                Express + Socket.io + CORS + DB self-healing
│   │
│   ├── routes/
│   │   ├── authRoutes.ts          # Auth API routes (/api/auth/*)
│   │   └── projectRoutes.ts       # Project API routes (/api/projects/*)
│   │
│   ├── controllers/
│   │   ├── authController.ts      # Auth logic: OTP, integrations, servers
│   │   └── projectController.ts   # Project CRUD + deployment orchestration
│   │
│   ├── services/
│   │   ├── sshOrchestrator.ts     # ★ CORE: 9-stage SSH deployment engine
│   │   └── awsService.ts          # AWS EC2 instance listing
│   │
│   ├── middleware/
│   │   ├── authMiddleware.ts      # JWT token verification
│   │   ├── errorHandler.ts        # Global error handler + AppError class
│   │   └── rateLimiter.ts         # In-memory rate limiting for OTP endpoints
│   │
│   └── utils/
│       ├── encryption.ts          # AES-256-GCM encrypt/decrypt functions
│       ├── errorClassifier.ts     # Maps raw errors to user-friendly diagnoses
│       └── logger.ts              # Structured logging (info/error/warn)
│
├── dist/                          # Compiled JavaScript output (from tsc)
├── deployments/                   # Local deployment workspace (unused on dev)
└── clean_db_ports.ts              # Utility script for cleaning IP:port entries
```

## 4.4 Frontend (`DevOpsHub/frontend/`)

```
frontend/
├── index.html                     # HTML entry point (Vite injects the React app here)
├── package.json                   # Dependencies & scripts
├── vite.config.ts                 # Vite build configuration (React + Tailwind plugins)
├── tsconfig.json                  # TypeScript project references
├── tsconfig.app.json              # TypeScript config for the app
├── tsconfig.node.json             # TypeScript config for Vite/Node
├── .oxlintrc.json                 # Linter configuration
│
├── public/                        # Static assets (served as-is)
│
├── src/
│   ├── main.tsx                   # ★ REACT ENTRY POINT — renders <App /> + theme init
│   ├── App.tsx                    # ★ ROUTING — defines all routes & auth guards
│   ├── App.css                    # App-level custom styles
│   ├── index.css                  # Global styles + Tailwind imports + CSS variables
│   │
│   ├── pages/
│   │   ├── Login.tsx              # Email OTP login (2-step: email → code)
│   │   ├── Projects.tsx           # Project list + create + deploy + logs
│   │   ├── Monitoring.tsx         # CPU/RAM charts (dashboard home)
│   │   └── Integrations.tsx       # GitHub + AWS + Server management
│   │
│   ├── components/
│   │   ├── LogTerminal.tsx        # ★ Real-time deployment log viewer
│   │   └── layout/
│   │       ├── AppLayout.tsx      # Page layout wrapper (sidebar + main)
│   │       └── Sidebar.tsx        # Navigation sidebar + theme toggle
│   │
│   ├── services/
│   │   └── api.ts                 # Axios instance + JWT interceptor
│   │
│   ├── store/
│   │   └── authStore.ts           # Zustand auth state (token + user)
│   │
│   └── assets/                    # Images, fonts, etc.
│
└── dist/                          # Production build output (from vite build)
```

## 4.5 Infrastructure (`DevOpsHub/infrastructure/`)

```
infrastructure/
├── terraform/
│   ├── main.tf                    # ★ EC2 + Security Group + VPC definition
│   ├── .terraform/                # Downloaded provider plugins
│   ├── .terraform.lock.hcl        # Provider version lock
│   ├── terraform.tfstate          # Current infrastructure state
│   └── terraform.tfstate.backup   # Previous state backup
│
└── ansible/
    ├── playbook.yml               # ★ Server config: Docker, Git, Nginx, Swap, SSH
    └── hosts.ini                  # Server inventory (IP + SSH credentials)
```

## 4.6 Demo App (`devopshub-demo-app/`)

```
devopshub-demo-app/
├── index.html                     # Simple HTML page ("🚀 DevOpsHub Live Demo App")
├── docker-compose.yml             # nginx:alpine container on port 8085
└── .git/                          # Separate Git repo for testing
```

This is a **test application** — you deploy it through DevOpsHub to verify the platform works end-to-end.

## 4.7 How Files Communicate

```
Browser
  │
  ├──→ main.tsx (boots React)
  │     └──→ App.tsx (defines routes)
  │           ├──→ Login.tsx ──→ api.ts ──→ POST /api/auth/send-otp
  │           │                           ──→ POST /api/auth/verify-otp
  │           │
  │           ├──→ Projects.tsx ──→ api.ts ──→ GET  /api/projects
  │           │    │                        ──→ POST /api/projects
  │           │    │                        ──→ POST /api/projects/:id/deploy
  │           │    │                        ──→ DEL  /api/projects/:id
  │           │    │
  │           │    └──→ LogTerminal.tsx ──→ Socket.io ──→ join-container-logs
  │           │                                        ←── log-line events
  │           │                                        ←── stage-update events
  │           │
  │           ├──→ Integrations.tsx ──→ api.ts ──→ GET  /api/auth/integrations
  │           │                                 ──→ POST /api/auth/github
  │           │                                 ──→ POST /api/auth/aws
  │           │                                 ──→ POST /api/auth/instances
  │           │                                 ──→ GET  /api/auth/aws/:credId/instances
  │           │
  │           └──→ Monitoring.tsx (local mock data for charts)
  │
  └──→ authStore.ts (Zustand) ──→ localStorage (persists token + user)

Backend (server.ts)
  │
  ├──→ authRoutes.ts ──→ authController.ts
  │     (rate limiter)    ├──→ Prisma (database)
  │     (auth middleware)  ├──→ jwt (token generation)
  │                        ├──→ nodemailer (OTP email)
  │                        ├──→ encryption.ts (AES-256-GCM)
  │                        └──→ awsService.ts ──→ AWS SDK ──→ EC2 API
  │
  ├──→ projectRoutes.ts ──→ projectController.ts
  │     (auth middleware)    ├──→ Prisma (database)
  │                          ├──→ encryption.ts (decrypt SSH key)
  │                          ├──→ sshOrchestrator.ts ──→ ssh2 ──→ EC2 Server
  │                          │     (9 deployment stages)
  │                          │     (self-healing logic)
  │                          └──→ Socket.io (emit log-line & stage-update)
  │
  ├──→ errorHandler.ts (catches all errors)
  └──→ logger.ts (structured console logging)
```

## 4.8 Database Schema (6 Models)

```
┌──────────────────┐         ┌──────────────────┐
│      User        │ 1   N   │   AwsCredential  │
│──────────────────│─────────│──────────────────│
│ id (UUID PK)     │         │ id (UUID PK)     │
│ email (unique)   │         │ userId (FK)      │
│ username         │         │ name             │
│ googleId         │         │ accessKeyId      │
│ githubToken      │         │ secretAccessKey  │ ← ENCRYPTED
│ createdAt        │         │ region           │
└────────┬─────────┘         └────────┬─────────┘
         │ 1                          │ 1
         │ N                          │ N
┌────────▼─────────┐         ┌────────▼─────────┐
│  ServerInstance   │─────────│  (same relation) │
│──────────────────│         └──────────────────┘
│ id (UUID PK)     │
│ userId (FK)      │
│ awsCredId (FK)   │
│ name             │
│ publicIp         │
│ sshUser          │
│ sshPrivateKey    │ ← ENCRYPTED
│ awsInstanceId    │
└────────┬─────────┘
         │ 1
         │ N
┌────────▼─────────┐
│     Project      │
│──────────────────│
│ id (UUID PK)     │
│ userId (FK)      │
│ serverId (FK)    │
│ name (unique)    │
│ repoUrl          │
│ branch           │
│ port             │
│ createdAt        │
└────────┬─────────┘
         │ 1
         │ N
┌────────▼─────────┐
│   Deployment     │
│──────────────────│
│ id (UUID PK)     │
│ projectId (FK)   │
│ commitId         │
│ status           │  ← BUILDING | SUCCESS | FAILED
│ buildLogs        │
│ startedAt        │
│ completedAt      │
└────────┬─────────┘
         │ 1
         │ N
┌────────▼─────────┐
│ DeploymentStage  │
│──────────────────│
│ id (UUID PK)     │
│ deploymentId(FK) │
│ name             │  ← e.g. "Building Docker Image"
│ status           │  ← PENDING|RUNNING|SUCCESS|FAILED|SKIPPED
│ startedAt        │
│ completedAt      │
│ durationMs       │
│ logs             │
│ errorReason      │
│ possibleCauses   │
│ suggestedFix     │
│ canRetry         │
└──────────────────┘

┌──────────────────┐
│ OtpVerification  │
│──────────────────│
│ id (UUID PK)     │
│ email (unique)   │
│ code             │
│ expiresAt        │
│ createdAt        │
└──────────────────┘
```

---

# SECTION 5 — Development Process

## 5.1 How the Project Started

DevOpsHub was conceived to solve a real problem: students and freelancers needed an affordable, self-hosted alternative to Heroku/Render/Vercel for deploying web applications. The project was designed as a **full-stack DevOps portfolio project** demonstrating:

- Frontend development (React)
- Backend API design (Node.js/Express)
- Database design (Prisma/SQL)
- Infrastructure as Code (Terraform/Ansible)
- Containerization (Docker)
- Cloud computing (AWS)
- Security engineering (encryption, JWT, rate limiting)
- Real-time systems (WebSocket)

## 5.2 Planning Phase

1. **Requirements gathering** — Defined what a minimal PaaS needs: auth, project management, deployment, logs, monitoring.
2. **Technology selection** — Chose each technology based on specific needs (see Section 3 for why each was chosen).
3. **Database schema design** — Designed 6 normalized models with proper relationships and cascade deletes.
4. **API design** — Defined RESTful endpoints for auth (`/api/auth/*`) and projects (`/api/projects/*`).
5. **Deployment pipeline design** — Architected the 9-stage pipeline: Validate → SSH → Environment → Workspace → Clone → Detect → Build → Start → Health Check.
6. **Security planning** — Planned AES-256-GCM encryption for secrets, JWT for auth, rate limiting for OTP, input validation for all user inputs.

## 5.3 Design Phase

1. **UI/UX Design** — Created a soft, neumorphic design system with light/dark theme support using CSS custom properties.
2. **Architecture Design** — Separated concerns: frontend (presentation) → backend (business logic) → database (persistence) → infrastructure (provisioning).
3. **Component Design** — Identified reusable components: AppLayout, Sidebar, LogTerminal.

## 5.4 Coding Phase

1. **Backend First** — Set up Express server, Prisma schema, authentication (OTP), and project CRUD.
2. **SSH Orchestrator** — Built the core deployment engine with 9 stages, error classification, and self-healing.
3. **Frontend** — Built the React app with routing, Zustand state, API integration, and Socket.io log streaming.
4. **Infrastructure** — Wrote Terraform for EC2 provisioning and Ansible for server configuration.
5. **Integration** — Connected all pieces: frontend ↔ backend ↔ SSH ↔ EC2.

## 5.5 Testing Phase

- **Manual testing** — Deployed the demo app through the platform to verify end-to-end flow.
- **Error scenario testing** — Tested wrong SSH key, invalid repo URL, private repos without token, port conflicts, disk full scenarios.
- **Self-healing verification** — Confirmed automatic recovery for port conflicts, corrupted clones, and disk space issues.

## 5.6 Deployment Phase

1. **Terraform** — `terraform apply` to create EC2 instance and security group.
2. **Ansible** — `ansible-playbook playbook.yml` to install Docker, Git, Nginx on the EC2 instance.
3. **Application deployment** — Clone DevOpsHub onto the server, configure environment variables, run the backend and frontend.

## 5.7 Maintenance Phase

- **Self-healing database** — On server startup, `selfHealDatabase()` scans for and fixes malformed IP addresses.
- **Error classification** — The `ErrorClassifier` provides user-friendly error messages with possible causes and suggested fixes for every known error pattern.
- **Structured logging** — All operations are logged with timestamps for debugging.

---

# SECTION 6 — Complete DevOps Workflow

This section traces the **entire journey** from a developer writing code to an end user seeing the deployed application in their browser.

## Step 1: Developer Writes Code

The developer writes code on their local machine using VS Code, IntelliJ, or any text editor. The code could be:
- A static website (HTML/CSS/JS)
- A Node.js application (Express, Next.js)
- Any application with a `docker-compose.yml`

```
Developer's Laptop
├── index.html
├── styles.css
└── script.js
```

## Step 2: Initialize Git Repository

```bash
cd my-project
git init                    # Initialize a new Git repository
git add .                   # Stage all files
git commit -m "Initial commit"  # Create first commit
```

**What happens:** Git creates a `.git/` directory and starts tracking file changes as snapshots.

## Step 3: Push to GitHub

```bash
git remote add origin https://github.com/username/my-project.git
git push -u origin main
```

**What happens:** The code is uploaded to GitHub's servers. It's now available at a URL like `https://github.com/username/my-project`.

## Step 4: Open DevOpsHub Dashboard

The developer opens the DevOpsHub frontend in their browser (e.g., `http://localhost:5173` in development).

## Step 5: Authenticate via Email OTP

1. Enter email address → click "Send Verification Code"
2. Backend generates 6-digit OTP, stores in database, sends via SMTP (or logs to console)
3. Enter OTP → click "Verify & Login"
4. Backend verifies OTP, creates/finds user, generates JWT token
5. Frontend stores JWT in localStorage via Zustand

```
Frontend                   Backend                    Database
   │                          │                          │
   │ POST /auth/send-otp      │                          │
   │───────────────────────→  │ Generate OTP             │
   │                          │──────────────────────→    │ Upsert OtpVerification
   │                          │ Send email (SMTP)        │
   │  ← "Code sent"          │                          │
   │                          │                          │
   │ POST /auth/verify-otp    │                          │
   │───────────────────────→  │ Verify code              │
   │                          │──────────────────────→    │ Find OtpVerification
   │                          │ Generate JWT             │
   │                          │──────────────────────→    │ Upsert User
   │  ← { token, user }      │                          │
   │                          │                          │
   │ Store in localStorage    │                          │
```

## Step 6: Configure Integrations

Before deploying, the developer sets up:

1. **GitHub Token** (optional, for private repos) — Integrations tab → paste Personal Access Token
2. **AWS Credentials** (optional, for listing instances) — Integrations tab → paste Access Key ID + Secret
3. **Server Instance** (required) — Add target EC2 server: name, IP, SSH username, private key (PEM)

All sensitive data (GitHub token, AWS secret key, SSH private key) is encrypted with AES-256-GCM before database storage.

## Step 7: Create Project

Developer fills out the project form:
- **Name:** e.g., "my-website"
- **Repository URL:** e.g., `https://github.com/username/my-project`
- **Branch:** e.g., "main"
- **Port:** e.g., 8080
- **Target Server:** Select from saved server instances

Backend validates inputs (regex for URL and branch), checks uniqueness, creates Project record.

## Step 8: Click "Deploy"

Frontend sends: `POST /api/projects/:id/deploy`

Backend immediately:
1. Creates a `Deployment` record with status `BUILDING`
2. Pre-creates 9 `DeploymentStage` records (all `PENDING`)
3. Returns `HTTP 202 Accepted` to the frontend
4. Starts the SSH deployment pipeline **asynchronously** in the background

## Step 9: 9-Stage Deployment Pipeline (Async)

The `SshOrchestrator.provisionAndDeploy()` method runs these stages:

### Stage 1: Validating Configuration
- Validates Git URL format using regex
- Validates branch name format using regex
- Checks SSH private key is not empty/corrupted

### Stage 2: SSH Authentication
- Connects to EC2 server via SSH (host, port 22, username, private key)
- Retries up to 3 times with exponential backoff (2s, 4s, 6s)
- Connection timeout: 30 seconds
- Keep-alive: every 10 seconds

### Stage 3: Checking Server Environment
- Disables SSH reverse DNS lookup (prevents handshake timeouts)
- Checks if Git is installed → installs if missing
- Checks if Docker Engine is installed → installs if missing
- Checks if Docker Compose V2 plugin is installed → installs if missing
- Checks disk space (minimum 500 MB free)
- Resolves port conflicts (stops/removes conflicting containers)

### Stage 4: Preparing Workspace
- Creates `~/deployments/{projectId}/` directory on the server

### Stage 5: Cloning Repository
- If `.git/` directory exists: `git fetch origin` + `git reset --hard origin/{branch}` (update existing clone)
- If not: `git clone -b {branch} {repoUrl} .` (fresh clone)
- For private repos: injects GitHub token into URL: `https://{token}@github.com/...`
- Self-healing: if clone fails, deletes directory and retries with fresh clone

### Stage 6: Detecting Framework
- If `docker-compose.yml` exists → uses it directly (user knows Docker)
- If `index.html` exists → generates: `FROM nginx:alpine` + `COPY . /usr/share/nginx/html`
- If `package.json` exists → generates: `FROM node:18-alpine` + `npm install` + `npm start`
- Otherwise → generates a fallback landing page with Nginx

### Stage 7: Building Docker Image
- Runs `docker compose build` (or `docker-compose build` for V1 fallback)
- Self-healing: if "no space left on device" → runs `docker system prune -af --volumes` → retries build

### Stage 8: Starting Container
- Runs `docker compose up -d` (detached mode)
- Self-healing: if network error → runs `docker network prune -f` → retries

### Stage 9: Health Check
- Waits 5 seconds for container to stabilize
- Checks if container is in "Up" state: `docker ps --filter publish={port}`
- Checks if port is accepting connections: TCP probe or HTTP curl
- If failed: retrieves last 50 lines of container logs for diagnosis

## Step 10: Real-Time Log Streaming

Throughout steps 9.1 – 9.9:
- Every line of output from SSH commands is captured
- Each line is emitted via Socket.io: `io.to(projectId).emit('log-line', { stage, text })`
- Stage status changes are emitted: `io.to(projectId).emit('stage-update', { stage, status, error })`
- Frontend `LogTerminal` component receives these events and updates the UI in real-time

## Step 11: Deployment Complete

- If all 9 stages succeed → Deployment status set to `SUCCESS`
- If any stage fails → Deployment status set to `FAILED`, remaining stages set to `SKIPPED`
- All build logs are saved to the Deployment record in the database

## Step 12: End User Access

The deployed application is now accessible at:
```
http://{EC2_PUBLIC_IP}:{PORT}
```

For example: `http://52.72.196.27:8080`

Anyone with this URL can access the deployed application in their browser.

---

# SECTION 7 — Git & GitHub

## 7.1 Core Concepts

### Repository (Repo)
A **repository** is a directory that Git tracks. It contains all your project files and the entire revision history.

**Real-world analogy:** Think of it as a project folder that remembers every change ever made to every file inside it.

```bash
# Create a new repository
git init

# This creates a hidden .git/ folder that stores:
# - All commits (snapshots of your code)
# - All branches
# - Configuration
```

### Clone
**Cloning** means creating an exact copy of a remote repository on your local machine.

```bash
git clone https://github.com/username/devopshub.git
# Creates a folder called 'devopshub' with all files and history
```

**What happens behind the scenes:**
1. Downloads all files
2. Downloads all commit history
3. Creates a local `.git/` folder
4. Sets the remote URL as `origin`

### Fork
A **fork** is a personal copy of someone else's GitHub repository under your own GitHub account.

**When to use:** When you want to contribute to a project you don't have write access to. You fork it, make changes, and submit a pull request.

### Branch
A **branch** is an independent line of development. The default branch is usually called `main` (or `master` in older repos).

**Real-world analogy:** Think of a book. The `main` branch is the published edition. A new branch is a draft where you try writing a new chapter without affecting the published version.

```bash
# Create a new branch
git branch feature/login

# Switch to that branch
git checkout feature/login

# Or do both in one command
git checkout -b feature/login

# List all branches
git branch
# * main
#   feature/login
```

### Commit
A **commit** is a snapshot of your code at a specific point in time. Each commit has a unique hash (like `a1b2c3d`) and a message.

```bash
# Stage files (tell Git which changes to include in the next snapshot)
git add index.html style.css

# Create a commit (save the snapshot)
git commit -m "Add login page HTML and CSS"
```

### Push
**Pushing** sends your local commits to the remote repository (GitHub).

```bash
git push origin main
# Sends all new commits from local 'main' to GitHub's 'main'
```

### Pull
**Pulling** downloads new commits from the remote repository and merges them into your local branch.

```bash
git pull origin main
# Downloads new commits from GitHub's 'main' and merges them
```

### Pull Request (PR)
A **pull request** is a GitHub feature where you ask the repository owner to review and merge your changes from one branch into another.

**Workflow:**
1. Create branch → make changes → push
2. Open PR on GitHub: "Please review and merge `feature/login` into `main`"
3. Reviewer reviews code, leaves comments
4. Reviewer approves and merges

### Merge
**Merging** combines changes from one branch into another.

```bash
# Switch to main
git checkout main

# Merge feature branch into main
git merge feature/login
```

### Merge Conflict
When two branches modify the **same line** of the same file, Git cannot automatically decide which version to keep. This is a **merge conflict**.

```
<<<<<<< HEAD
console.log("Hello from main");
=======
console.log("Hello from feature");
>>>>>>> feature/login
```

**Resolution:** Manually edit the file to keep the correct version, then:
```bash
git add conflicted-file.js
git commit -m "Resolve merge conflict"
```

### .gitignore
A file that tells Git which files/folders to **ignore** (not track).

```gitignore
# DevOpsHub .gitignore
node_modules/        # NPM packages (too large, can be reinstalled)
dist/                # Build output (can be regenerated)
.env                 # Secrets (NEVER commit)
*.db                 # Database files
.terraform/          # Terraform plugins
```

## 7.2 Essential Git Commands

| Command | Purpose | Example |
|---------|---------|---------|
| `git init` | Initialize new repo | `git init` |
| `git clone <url>` | Clone remote repo | `git clone https://github.com/user/repo.git` |
| `git status` | Show changed files | `git status` |
| `git add <file>` | Stage file for commit | `git add .` (all files) |
| `git commit -m "<msg>"` | Create commit | `git commit -m "Fix login bug"` |
| `git push origin <branch>` | Push to remote | `git push origin main` |
| `git pull origin <branch>` | Pull from remote | `git pull origin main` |
| `git branch` | List branches | `git branch` |
| `git checkout -b <name>` | Create & switch branch | `git checkout -b feature/deploy` |
| `git merge <branch>` | Merge branch | `git merge feature/deploy` |
| `git log --oneline` | View commit history | `git log --oneline -10` |
| `git diff` | Show unstaged changes | `git diff` |
| `git stash` | Temporarily save changes | `git stash` / `git stash pop` |
| `git reset --hard HEAD` | Discard all changes | `git reset --hard HEAD` |
| `git remote -v` | Show remote URLs | `git remote -v` |

---

# SECTION 8 — Docker

## 8.1 Core Concepts

### What is a Container?
A **container** is a lightweight, isolated environment that runs an application with all its dependencies. It shares the host OS kernel but has its own filesystem, processes, and network.

**Real-world analogy:** A shipping container. The contents inside (your app) are completely sealed and portable. You can move the container from one ship (server) to another, and everything inside remains the same.

**Container vs Virtual Machine:**

| Feature | Container | Virtual Machine |
|---------|-----------|-----------------|
| Size | Megabytes | Gigabytes |
| Startup | Seconds | Minutes |
| OS | Shares host kernel | Full guest OS |
| Isolation | Process-level | Hardware-level |
| Performance | Near-native | Overhead |

### What is an Image?
A Docker **image** is a read-only template for creating containers. Think of it as a blueprint/recipe. You "build" an image from a Dockerfile, then "run" it to create a container.

```
Dockerfile (recipe) → docker build → Image (blueprint) → docker run → Container (running instance)
```

### What is a Dockerfile?
A **Dockerfile** is a text file containing instructions to build a Docker image. Each instruction creates a **layer**.

**DevOpsHub Backend Dockerfile:**

```dockerfile
FROM node:18-alpine       # Start from Node.js 18 on Alpine Linux (small base)
WORKDIR /app              # Set working directory inside the container
COPY package*.json ./     # Copy package.json and package-lock.json
RUN npm install           # Install dependencies
COPY . .                  # Copy all source code
RUN npx prisma generate   # Generate Prisma client from schema
RUN npm run build         # Compile TypeScript to JavaScript
EXPOSE 4000               # Document that the app listens on port 4000
CMD ["npm", "start"]      # Default command when container starts
```

**Line-by-line explanation:**

| Line | What it does | Why |
|------|-------------|-----|
| `FROM node:18-alpine` | Uses Node.js 18 on Alpine Linux as the base image | Alpine is only ~5 MB, making the image small |
| `WORKDIR /app` | Creates and switches to `/app` directory | Keeps things organized inside the container |
| `COPY package*.json ./` | Copies only package files first | Enables Docker layer caching — if packages haven't changed, Docker skips `npm install` on rebuild |
| `RUN npm install` | Installs all npm packages | Creates a cached layer of node_modules |
| `COPY . .` | Copies all source code | Done after npm install to benefit from caching |
| `RUN npx prisma generate` | Generates the Prisma client | Required for database operations |
| `RUN npm run build` | Runs TypeScript compiler | Outputs JavaScript to `dist/` |
| `EXPOSE 4000` | Documents the port | Informational — doesn't actually open the port |
| `CMD ["npm", "start"]` | Starts the server | Runs `node dist/server.js` |

### What are Layers?
Every instruction in a Dockerfile creates a **layer**. Layers are cached — if you change line 7, Docker rebuilds from line 7 onward but uses cached layers for lines 1-6.

### What are Volumes?
**Volumes** are persistent storage that survives container restarts and deletions. In `docker-compose.yml`:

```yaml
volumes:
  - pgdata:/var/lib/postgresql/data   # Named volume — database files persist
  - /var/run/docker.sock:/var/run/docker.sock  # Bind mount — share host's Docker socket
```

### What are Networks?
Docker **networks** allow containers to communicate with each other using service names instead of IP addresses.

```yaml
networks:
  devopshub-network:
    name: devopshub-network
```

With this network, the backend container can reach the database at `db:5432` instead of finding the container's IP address.

### What is Docker Hub?
**Docker Hub** is a cloud registry for Docker images — think of it as "GitHub for Docker images". You can `push` your images to Docker Hub and `pull` them on any server.

## 8.2 Docker Commands

| Command | Purpose | Example |
|---------|---------|---------|
| `docker build -t <name> .` | Build image from Dockerfile | `docker build -t devopshub-api .` |
| `docker run -d -p 4000:4000 <image>` | Run container (detached) | `docker run -d -p 4000:4000 devopshub-api` |
| `docker ps` | List running containers | `docker ps` |
| `docker ps -a` | List all containers (including stopped) | `docker ps -a` |
| `docker stop <id>` | Stop a running container | `docker stop a1b2c3d4` |
| `docker rm <id>` | Remove a stopped container | `docker rm a1b2c3d4` |
| `docker images` | List downloaded images | `docker images` |
| `docker rmi <image>` | Remove an image | `docker rmi devopshub-api` |
| `docker logs <id>` | View container logs | `docker logs -f a1b2c3d4` (follow) |
| `docker exec -it <id> bash` | Open shell inside container | `docker exec -it a1b2c3d4 sh` |
| `docker pull <image>` | Download image from registry | `docker pull nginx:alpine` |
| `docker push <image>` | Upload image to registry | `docker push user/devopshub-api` |
| `docker tag <src> <dest>` | Tag an image | `docker tag devopshub-api user/devopshub-api:v1` |
| `docker system prune -af` | Remove ALL unused resources | `docker system prune -af --volumes` |
| `docker network ls` | List networks | `docker network ls` |
| `docker volume ls` | List volumes | `docker volume ls` |

### Docker Compose Commands

| Command | Purpose | Example |
|---------|---------|---------|
| `docker compose up -d` | Start all services (detached) | `docker compose up -d` |
| `docker compose down` | Stop and remove containers | `docker compose down` |
| `docker compose build` | Build images | `docker compose build` |
| `docker compose logs` | View logs of all services | `docker compose logs -f` |
| `docker compose ps` | List compose services | `docker compose ps` |
| `docker compose restart` | Restart services | `docker compose restart` |
| `docker compose exec <svc> sh` | Shell into service | `docker compose exec backend sh` |

## 8.3 DevOpsHub Docker Compose Explained

```yaml
version: '3.8'                           # Compose file format version

services:
  db:                                      # PostgreSQL database service
    image: postgres:15                     # Use official PostgreSQL 15 image
    container_name: devopshub-db-dev       # Fixed container name
    environment:
      POSTGRES_USER: postgres              # Database username
      POSTGRES_PASSWORD: password          # Database password
      POSTGRES_DB: devopshub               # Database name
    ports:
      - "5432:5432"                        # Map host port 5432 → container port 5432
    volumes:
      - pgdata:/var/lib/postgresql/data    # Persist data across restarts
    networks:
      - devopshub-network                  # Join shared network

  backend:                                 # Node.js backend service
    build:
      context: ./backend                   # Build from backend/ directory
      dockerfile: Dockerfile               # Use backend/Dockerfile
    container_name: devopshub-api-dev      # Fixed container name
    ports:
      - "4000:4000"                        # Map host port 4000 → container port 4000
    environment:
      PORT: 4000                           # Server port
      DATABASE_URL: "postgresql://postgres:password@db:5432/devopshub"
                                           # Connect to 'db' service by name
      JWT_SECRET: "local_development_secret"
      DOCKER_SOCKET_PATH: "/var/run/docker.sock"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
                                           # Share host Docker socket (Docker-in-Docker)
    depends_on:
      - db                                 # Start db before backend
    networks:
      - devopshub-network                  # Same network as db

networks:
  devopshub-network:
    name: devopshub-network                # Named network

volumes:
  pgdata:                                  # Named volume for PostgreSQL data
```

## 8.4 Why Docker Was Used in DevOpsHub

1. **Consistency** — The app runs identically on developer laptops and production servers
2. **Isolation** — Each user's deployed project runs in its own container, preventing conflicts
3. **Portability** — Move deployments between servers without reinstalling dependencies
4. **Auto-detection** — DevOpsHub auto-generates Dockerfiles for static sites and Node.js apps
5. **Cleanup** — Easy to stop and remove a deployment: `docker compose down`
6. **Self-healing** — `docker system prune` reclaims disk space automatically

---

# SECTION 9 — AWS

## 9.1 Services Used

### EC2 (Elastic Compute Cloud)

**What it is:** Virtual servers in the cloud. You rent computing power from Amazon.

**How DevOpsHub uses it:** The EC2 instance is the **target server** where user applications are deployed. DevOpsHub SSHs into this instance to clone repos, build Docker images, and start containers.

**DevOpsHub configuration:**

| Setting | Value | Explanation |
|---------|-------|-------------|
| Instance Type | `t3.micro` | 2 vCPU, 1 GB RAM (Free Tier eligible) |
| AMI | `ami-0f8a61b66d1accaee` | Ubuntu 22.04 LTS |
| Storage | 8 GB gp3 EBS | General Purpose SSD |
| Key Pair | `devopshub-key` | SSH access key name |
| Region | `us-east-1` | North Virginia (cheapest) |

**Instance Types Explained:**

| Type | vCPU | RAM | Use Case | Free Tier |
|------|------|-----|----------|-----------|
| `t2.micro` | 1 | 1 GB | Small apps, testing | ✅ 750 hrs/month for 12 months |
| `t3.micro` | 2 | 1 GB | Better burstable performance | ✅ 750 hrs/month for 12 months |
| `t3.small` | 2 | 2 GB | Multiple containers | ❌ |
| `t3.medium` | 2 | 4 GB | Production workloads | ❌ |

### IAM (Identity and Access Management)

**What it is:** AWS's permission system. Controls WHO can do WHAT on WHICH resources.

**How DevOpsHub uses it:** Users save their AWS Access Key ID and Secret Access Key in the Integrations tab. These credentials allow DevOpsHub to call the EC2 API and list instances.

**Key concepts:**
- **User** — A person or application that needs AWS access
- **Access Key** — A key pair (Access Key ID + Secret Access Key) for programmatic access
- **Policy** — A JSON document that defines permissions (e.g., "allow ec2:DescribeInstances")
- **Role** — A set of permissions that can be assumed by services (e.g., an EC2 instance can assume a role)

**Security best practice:** Never use root account credentials. Create an IAM user with only the permissions needed.

### VPC (Virtual Private Cloud)

**What it is:** Your own isolated network inside AWS. Think of it as your own private floor in a building.

**How DevOpsHub uses it:** The EC2 instance runs inside the default VPC. The Terraform config references `aws_default_vpc.default`.

**Key concepts:**
- **Subnet** — A range of IP addresses within the VPC (like rooms on a floor)
- **Route Table** — Rules for where network traffic should go
- **Internet Gateway** — Allows the VPC to communicate with the internet

### Security Groups

**What it is:** A virtual firewall that controls inbound and outbound traffic for EC2 instances.

**How DevOpsHub uses it:** The Terraform config creates a security group named `devopshub-sg` with these rules:

| Direction | Port | Protocol | Source | Purpose |
|-----------|------|----------|--------|---------|
| Inbound | 22 | TCP | 0.0.0.0/0 | SSH access |
| Inbound | 80 | TCP | 0.0.0.0/0 | HTTP (Nginx) |
| Inbound | 443 | TCP | 0.0.0.0/0 | HTTPS (SSL) |
| Inbound | 4000 | TCP | 0.0.0.0/0 | Backend API |
| Inbound | 8000-9000 | TCP | 0.0.0.0/0 | User's deployed containers |
| Outbound | All | All | 0.0.0.0/0 | Allow all outgoing traffic |

**Real-world analogy:** Security groups are like the guest list at a club entrance. If you're not on the list (port not open), you don't get in.

**⚠️ Security Note:** In production, you should restrict SSH (port 22) to your IP address only (`{your-ip}/32`) instead of the entire internet (`0.0.0.0/0`).

### Elastic IP

**What it is:** A static public IPv4 address that you can attach to an EC2 instance.

**Why it matters:** When you stop and restart an EC2 instance, its public IP address changes. An Elastic IP stays the same, so your DNS records and server configurations don't break.

### Storage (EBS — Elastic Block Store)

**What it is:** Persistent block storage volumes for EC2 instances — like a virtual hard drive.

**DevOpsHub config:** 8 GB gp3 volume (General Purpose SSD v3).

| Volume Type | IOPS | Throughput | Use Case |
|------------|------|------------|----------|
| gp3 | 3000 (baseline) | 125 MB/s | General purpose |
| gp2 | Scales with size | Scales with size | Legacy general purpose |
| io1/io2 | Up to 64,000 | Up to 1,000 MB/s | High-performance databases |

## 9.2 Pricing

### Free Tier (First 12 months)

| Service | Free Allowance |
|---------|---------------|
| EC2 t2.micro/t3.micro | 750 hours/month |
| EBS gp2/gp3 | 30 GB total |
| Data Transfer | 1 GB/month out |
| Elastic IP | Free when attached to a running instance |

**⚠️ Warning:** If you stop your instance but keep an Elastic IP unattached, AWS charges ~$3.65/month. Always release unused Elastic IPs.

**Cost estimation for DevOpsHub:**

| Component | Monthly Cost |
|-----------|-------------|
| t3.micro (Free Tier) | $0.00 |
| 8 GB gp3 EBS | $0.00 (within 30 GB free) |
| Elastic IP (attached) | $0.00 |
| Data Transfer (< 1 GB) | $0.00 |
| **Total** | **$0.00** |

## 9.3 Security Best Practices

1. **Never commit AWS credentials to Git**
2. **Use IAM users** with least-privilege policies (not root)
3. **Restrict Security Group** SSH access to your IP
4. **Enable MFA** (Multi-Factor Authentication) on your AWS account
5. **Rotate access keys** periodically
6. **Encrypt sensitive data** at rest (DevOpsHub uses AES-256-GCM)
7. **Use Elastic IP** to avoid exposing new IPs after restarts

---

# SECTION 10 — Linux

## 10.1 Every Linux Command Used in DevOpsHub

### File System Commands

#### `mkdir` — Make Directory
| Attribute | Detail |
|-----------|--------|
| **Purpose** | Creates a new directory |
| **Syntax** | `mkdir [options] directory_name` |
| **Example** | `mkdir -p ~/deployments/abc123` |
| **Flag `-p`** | Creates parent directories if they don't exist (no error if already exists) |
| **Common mistake** | Forgetting `-p` when parent directory doesn't exist → "No such file or directory" |

#### `cd` — Change Directory
| Attribute | Detail |
|-----------|--------|
| **Purpose** | Navigate to a different directory |
| **Syntax** | `cd path` |
| **Example** | `cd ~/deployments/abc123` |
| **`~`** | Shortcut for the home directory (`/home/ubuntu`) |
| **Common mistake** | Trying to `cd` into a file (not a directory) |

#### `rm` — Remove
| Attribute | Detail |
|-----------|--------|
| **Purpose** | Delete files or directories |
| **Syntax** | `rm [options] path` |
| **Example** | `rm -rf ~/deployments/abc123` |
| **Flag `-r`** | Recursive (delete directory and all contents) |
| **Flag `-f`** | Force (don't ask for confirmation) |
| **⚠️ Warning** | `rm -rf /` will destroy the entire system. Always double-check the path. |

#### `ls` — List
| Attribute | Detail |
|-----------|--------|
| **Purpose** | List directory contents |
| **Syntax** | `ls [options] [path]` |
| **Example** | `ls -la ~/deployments/` |
| **Flag `-l`** | Long format (permissions, owner, size, date) |
| **Flag `-a`** | Show hidden files (starting with `.`) |

#### `cat` — Concatenate
| Attribute | Detail |
|-----------|--------|
| **Purpose** | Display file contents |
| **Syntax** | `cat filename` |
| **Example** | `cat /etc/nginx/nginx.conf` |

#### `chmod` — Change Mode (Permissions)
| Attribute | Detail |
|-----------|--------|
| **Purpose** | Change file/directory permissions |
| **Syntax** | `chmod mode file` |
| **Example** | `chmod 600 /swapfile` (owner read/write only) |
| **Common values** | `755` = rwx r-x r-x, `644` = rw- r-- r--, `600` = rw- --- --- |

### System Administration

#### `sudo` — Superuser Do
| Attribute | Detail |
|-----------|--------|
| **Purpose** | Run a command as the root (administrator) user |
| **Syntax** | `sudo command` |
| **Example** | `sudo apt-get update` |
| **Common mistake** | Running Docker commands without sudo (if user not in docker group) |

#### `apt-get` — Package Manager
| Attribute | Detail |
|-----------|--------|
| **Purpose** | Install, update, and remove software packages on Ubuntu |
| **Syntax** | `apt-get [action] [package]` |
| **Example** | `sudo apt-get update && sudo apt-get install -y docker.io` |
| **Flag `-y`** | Automatic "yes" to prompts |
| **`update`** | Refreshes the list of available packages |
| **`install`** | Installs a package |

#### `systemctl` — Service Manager
| Attribute | Detail |
|-----------|--------|
| **Purpose** | Manage system services (start, stop, restart, enable) |
| **Syntax** | `systemctl [action] [service]` |
| **Example** | `sudo systemctl restart nginx` |
| **Actions** | `start`, `stop`, `restart`, `reload`, `enable`, `disable`, `status` |
| **`enable`** | Service starts automatically on boot |

#### `usermod` — Modify User
| Attribute | Detail |
|-----------|--------|
| **Purpose** | Modify user account settings |
| **Syntax** | `usermod [options] username` |
| **Example** | `sudo usermod -aG docker ubuntu` |
| **Flag `-aG docker`** | Append user to the `docker` group (so they can run Docker without sudo) |

### Network Commands

#### `curl` — Transfer Data
| Attribute | Detail |
|-----------|--------|
| **Purpose** | Make HTTP requests from the command line |
| **Syntax** | `curl [options] URL` |
| **Example** | `curl -s http://localhost:8080` |
| **Flag `-s`** | Silent mode (no progress bar) |
| **Flag `-I`** | Show only HTTP headers |

#### `df` — Disk Free
| Attribute | Detail |
|-----------|--------|
| **Purpose** | Show disk space usage |
| **Syntax** | `df [options]` |
| **Example** | `df -h` (human-readable sizes) |
| **Flag `-k`** | Sizes in kilobytes (used in DevOpsHub's disk check) |

#### `ssh` — Secure Shell
| Attribute | Detail |
|-----------|--------|
| **Purpose** | Connect to a remote server securely |
| **Syntax** | `ssh -i keyfile user@host` |
| **Example** | `ssh -i devopshub-key.pem ubuntu@52.72.196.27` |
| **Common mistake** | Permissions too open on key file → "WARNING: UNPROTECTED PRIVATE KEY FILE!" → Fix: `chmod 400 key.pem` |

### Process Commands

#### `grep` — Search Text
| Attribute | Detail |
|-----------|--------|
| **Purpose** | Search for patterns in text/files |
| **Syntax** | `grep [options] pattern [file]` |
| **Example** | `grep -q "UseDNS" /etc/ssh/sshd_config` |
| **Flag `-q`** | Quiet mode (return exit code only, no output) |

#### `echo` — Print Text
| Attribute | Detail |
|-----------|--------|
| **Purpose** | Output text to the terminal or redirect to a file |
| **Syntax** | `echo "text"` |
| **Example** | `echo "UseDNS no" | sudo tee -a /etc/ssh/sshd_config` |

#### `tee` — Read/Write
| Attribute | Detail |
|-----------|--------|
| **Purpose** | Read from stdin and write to both stdout and a file |
| **Syntax** | `command | tee [options] file` |
| **Example** | `echo "data" | sudo tee -a /etc/fstab` |
| **Flag `-a`** | Append to file (don't overwrite) |

### Swap Memory Setup

Swap is disk space used as virtual memory when RAM is full. Essential for `t2.micro`/`t3.micro` instances with only 1 GB RAM.

```bash
# Create a 2 GB swap file
sudo fallocate -l 2G /swapfile

# Set proper permissions (root read/write only)
sudo chmod 600 /swapfile

# Format as swap
sudo mkswap /swapfile

# Activate swap
sudo swapon /swapfile

# Make permanent (survives reboot)
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

# SECTION 11 — Nginx

## 11.1 What is Nginx?

Nginx (pronounced "engine-X") is a high-performance web server, reverse proxy, and load balancer. It was created by Igor Sysoev in 2004 to solve the C10K problem (handling 10,000+ concurrent connections).

## 11.2 Installation

```bash
# Install on Ubuntu
sudo apt-get update
sudo apt-get install -y nginx

# Verify installation
nginx -v
# nginx version: nginx/1.24.0 (Ubuntu)
```

## 11.3 Nginx as a Reverse Proxy

**What is a reverse proxy?**

A reverse proxy sits in front of your application and forwards requests to it. The user talks to Nginx (port 80), and Nginx talks to your app (e.g., port 8080).

**Real-world analogy:** A reverse proxy is like a hotel receptionist. Guests (users) talk to the receptionist (Nginx), who routes them to the correct room (container port).

**Example configuration for DevOpsHub:**

```nginx
# /etc/nginx/sites-available/devopshub-app
server {
    listen 80;
    server_name app.example.com;    # Or the EC2 public IP

    location / {
        proxy_pass http://localhost:8080;    # Forward to container
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

**Enable the site:**
```bash
sudo ln -s /etc/nginx/sites-available/devopshub-app /etc/nginx/sites-enabled/
sudo nginx -t          # Test configuration syntax
sudo systemctl reload nginx
```

## 11.4 Serving React Static Files

For the DevOpsHub frontend in production, Nginx can serve the built static files directly:

```nginx
server {
    listen 80;
    server_name devopshub.example.com;

    root /var/www/devopshub/frontend/dist;
    index index.html;

    # Handle React Router (client-side routing)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to the backend
    location /api/ {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }

    # Proxy WebSocket connections
    location /socket.io/ {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }
}
```

## 11.5 Key Nginx Commands

| Command | Purpose |
|---------|---------|
| `sudo systemctl start nginx` | Start Nginx |
| `sudo systemctl stop nginx` | Stop Nginx |
| `sudo systemctl restart nginx` | Restart (stops then starts) |
| `sudo systemctl reload nginx` | Reload config without downtime |
| `sudo systemctl status nginx` | Check if running |
| `sudo nginx -t` | Test configuration syntax |
| `sudo tail -f /var/log/nginx/access.log` | View access logs |
| `sudo tail -f /var/log/nginx/error.log` | View error logs |

## 11.6 Common Nginx Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| 404 Not Found | Wrong `root` path or file doesn't exist | Check `root` directive and file paths |
| 502 Bad Gateway | Backend server is down or wrong proxy_pass port | Start the backend, check port number |
| 403 Forbidden | File permissions or directory listing disabled | `chmod` files, check `autoindex` setting |
| Config test failed | Syntax error in config file | Run `nginx -t` to see the exact error |
| Port 80 already in use | Another process using port 80 | `sudo lsof -i :80` to find it, then stop it |

---

# SECTION 12 — Deployment

## 12.1 From Localhost to Production — Complete Guide

### Phase 1: Infrastructure Provisioning (Terraform)

```bash
# Navigate to Terraform directory
cd DevOpsHub/infrastructure/terraform

# Initialize Terraform (downloads AWS provider plugin)
terraform init

# Preview what will be created
terraform plan

# Create the infrastructure
terraform apply
# Type 'yes' when prompted

# Output: public_ip = "52.72.196.27"
```

**What this creates:**
- Default VPC (tags it)
- Security Group (`devopshub-sg`) with SSH, HTTP, HTTPS, API, and container ports
- EC2 instance (`t3.micro`, Ubuntu 22.04, 8 GB gp3, `devopshub-key` key pair)

### Phase 2: Server Configuration (Ansible)

```bash
# Navigate to Ansible directory
cd DevOpsHub/infrastructure/ansible

# Edit hosts.ini with your EC2 IP and key path
# [servers]
# devopshub-vm ansible_host=52.72.196.27 ansible_user=ubuntu ansible_ssh_private_key_file=/path/to/key.pem

# Run the playbook
ansible-playbook -i hosts.ini playbook.yml
```

**What this installs and configures:**
1. Updates apt package cache
2. Installs system dependencies (curl, gnupg, git, nginx)
3. Sets up 2 GB swap memory (essential for t2.micro with 1 GB RAM)
4. Adds Docker GPG key and repository
5. Installs Docker Engine + Docker Compose plugin
6. Adds `ubuntu` user to `docker` group (no more `sudo docker`)
7. Starts and enables Nginx
8. Disables SSH reverse DNS lookup (prevents handshake timeouts)

### Phase 3: Deploy DevOpsHub Application

#### Option A: Direct Deployment (Manual)

```bash
# SSH into EC2 instance
ssh -i devopshub-key.pem ubuntu@52.72.196.27

# Clone DevOpsHub repository
git clone https://github.com/yourusername/devopshub.git
cd devopshub

# --- Backend Setup ---
cd backend
cp .env.example .env
# Edit .env with production values:
# PORT=4000
# NODE_ENV=production
# JWT_SECRET=<generate a strong random secret>
# ENCRYPTION_KEY=<generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
# DATABASE_URL="file:./dev.db"
# FRONTEND_URL=http://YOUR_EC2_IP:5173
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password

npm install
npx prisma generate
npx prisma migrate dev
npm run build
npm start &

# --- Frontend Setup ---
cd ../frontend
npm install
# Create .env file for frontend
echo "VITE_API_URL=http://YOUR_EC2_IP:4000/api" > .env
echo "VITE_WS_URL=http://YOUR_EC2_IP:4000" >> .env
npm run build

# Serve frontend with Nginx
sudo cp -r dist/* /var/www/html/
sudo systemctl restart nginx
```

#### Option B: Docker Compose Deployment

```bash
# SSH into EC2
ssh -i devopshub-key.pem ubuntu@52.72.196.27

# Clone and start with Docker Compose
git clone https://github.com/yourusername/devopshub.git
cd devopshub
docker compose up -d

# This starts:
# 1. PostgreSQL database (port 5432)
# 2. Backend API (port 4000)
```

### Phase 4: Configure Nginx for Production

```bash
# Create Nginx config
sudo tee /etc/nginx/sites-available/devopshub << 'EOF'
server {
    listen 80;
    server_name _;

    # Frontend (static files)
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api/ {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # WebSocket proxy
    location /socket.io/ {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/devopshub /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### Phase 5: Enable HTTPS (Optional but Recommended)

```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Obtain SSL certificate (requires a domain name pointing to your EC2 IP)
sudo certbot --nginx -d yourdomain.com

# Auto-renewal is set up by certbot automatically
```

### Phase 6: Verify Deployment

1. Open browser → `http://YOUR_EC2_IP`
2. You should see the DevOpsHub login page
3. Enter email → receive OTP (check backend logs if SMTP not configured)
4. Login → Dashboard with CPU/RAM charts
5. Go to Integrations → Add server instance (this same EC2 or another)
6. Go to Projects → Create project → Click Deploy
7. Watch real-time logs in the LogTerminal

---

# SECTION 13 — Common Problems

## 13.1 Permission Denied

**Symptom:** `Permission denied` or `EACCES` error.

**Possible causes and fixes:**

| Scenario | Cause | Fix |
|----------|-------|-----|
| SSH permission denied | Wrong private key or username | Verify key file and use correct username (`ubuntu` for Ubuntu) |
| Docker permission denied | User not in docker group | `sudo usermod -aG docker $USER` then log out/in |
| SSH key file permissions | Key file permissions too open | `chmod 400 devopshub-key.pem` |
| File write permission | Not root, trying to write system files | Use `sudo` prefix |
| npm EACCES | Global npm install without permission | Use `sudo npm install -g` or fix npm prefix |

## 13.2 SSH Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `Connection refused` | SSH not running or port 22 blocked | Check Security Group, `sudo systemctl start ssh` |
| `Connection timed out` | IP wrong, instance stopped, or SG issue | Verify IP, start instance, check SG inbound rules |
| `Host key verification failed` | Server key changed (instance replaced) | `ssh-keygen -R IP_ADDRESS` |
| `Handshake timeout` | Reverse DNS lookup enabled | Set `UseDNS no` in `/etc/ssh/sshd_config` |
| `Too many auth failures` | SSH trying wrong keys | Specify key: `ssh -i key.pem -o IdentitiesOnly=yes user@host` |

## 13.3 Git Conflicts

| Error | Cause | Fix |
|-------|-------|-----|
| Merge conflict markers | Same file changed on different branches | Manually edit file, remove `<<<<<<<` markers, `git add` + `git commit` |
| `fatal: not a git repository` | Not in a Git repo directory | `cd` to the repo directory |
| `error: failed to push` | Remote has newer commits | `git pull --rebase origin main` then `git push` |

## 13.4 Docker Build Failed

| Error | Cause | Fix |
|-------|-------|-----|
| `COPY failed: file not found` | File path wrong in Dockerfile | Check file exists relative to build context |
| `npm install` fails | Missing package.json or network issue | Verify package.json, check internet connection |
| `no space left on device` | Disk full with old images | `docker system prune -af --volumes` |
| `returned a non-zero code: 1` | Code compilation error | Check build logs for specific error |
| `ENOMEM` (out of memory) | Not enough RAM | Add swap memory, use multi-stage builds |

## 13.5 Port Already in Use

**Symptom:** `Error: listen EADDRINUSE: address already in use :::4000`

**Diagnosis:**
```bash
# Find what's using the port
sudo lsof -i :4000
# or
sudo ss -tlnp | grep 4000
```

**Fix:**
```bash
# Kill the process using the port
sudo kill -9 $(sudo lsof -t -i :4000)
```

DevOpsHub's self-healing automatically handles this during deployments by stopping conflicting containers.

## 13.6 Nginx 404 Not Found

| Cause | Fix |
|-------|-----|
| Wrong `root` path | Verify `root /var/www/html` matches actual file location |
| File doesn't exist | Check `ls -la /var/www/html/` |
| Missing `try_files` for React | Add `try_files $uri $uri/ /index.html;` |
| Site not enabled | `sudo ln -s /etc/nginx/sites-available/site /etc/nginx/sites-enabled/` |

## 13.7 502 Bad Gateway

**Symptom:** Nginx shows "502 Bad Gateway".

| Cause | Fix |
|-------|-----|
| Backend server not running | Start the backend: `npm start` or `docker compose up -d` |
| Wrong `proxy_pass` port | Match port in nginx config to actual backend port |
| Backend crashed | Check backend logs: `docker compose logs backend` |
| Socket timeout | Increase `proxy_read_timeout` in Nginx config |

## 13.8 EC2 Unreachable

| Cause | Fix |
|-------|-----|
| Instance stopped | Start it in AWS Console |
| IP changed after restart | Attach Elastic IP (or update DNS) |
| Security Group blocks port | Add inbound rule for required port |
| Instance in wrong state | Reboot from AWS Console |
| Region mismatch | Ensure you're looking at the correct AWS region |

## 13.9 Security Group Problems

| Issue | Fix |
|-------|-----|
| Can't SSH | Add inbound rule: port 22, TCP, source 0.0.0.0/0 (or your IP) |
| Can't access app | Add inbound rule for the app's port (e.g., 8080) |
| Can't install packages | Ensure outbound rule allows all traffic (0.0.0.0/0) |
| Multiple SGs conflict | An instance can have multiple SGs — all rules are ORed (union) |

## 13.10 Memory Issues

**Symptom:** Server becomes unresponsive, processes are killed (OOM Killer).

**Diagnosis:**
```bash
free -h                    # Check available memory
htop                       # Real-time process monitoring
dmesg | grep -i oom        # Check for OOM kills
```

**Fix:**
```bash
# Add swap memory (if not already present)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## 13.11 Disk Full

**Symptom:** `No space left on device`

**Diagnosis:**
```bash
df -h                      # Check disk usage by partition
du -sh /var/lib/docker     # Docker often uses the most space
docker system df           # Docker-specific disk usage
```

**Fix:**
```bash
docker system prune -af --volumes   # Remove all unused Docker resources
sudo apt autoremove                  # Remove unused packages
sudo journalctl --vacuum-time=3d    # Trim system logs
```

## 13.12 Application Crash

**Diagnosis:**
```bash
# Check container logs
docker compose logs --tail=50

# Check if container is running
docker ps

# Check container exit code
docker inspect --format='{{.State.ExitCode}}' container_name
```

**Common causes:**
- Missing environment variables
- Database connection failure
- Port binding error
- Unhandled exception in application code

## 13.13 Browser Cache

**Symptom:** Frontend changes don't appear after deployment.

**Fix:**
- Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- Clear cache: Browser settings → Clear browsing data → Cached images and files
- Incognito mode: `Ctrl + Shift + N` (Chrome) to bypass cache entirely

---

# SECTION 14 — How Components Connect

## 14.1 Frontend ↔ Backend

| Communication | Protocol | Library | Example |
|---------------|----------|---------|---------|
| REST API calls | HTTP | Axios | `POST /api/auth/send-otp` |
| Real-time logs | WebSocket | Socket.io | `socket.emit('join-container-logs', projectId)` |
| Authentication | Bearer Token | JWT | `Authorization: Bearer eyJhbGciOiJI...` |

**Flow:**
1. Frontend creates Axios instance with base URL `http://localhost:4000/api`
2. Axios interceptor automatically adds JWT token from localStorage to every request
3. Backend middleware (`authMiddleware`) verifies the JWT and extracts user ID
4. Backend processes request and returns JSON response

## 14.2 Backend ↔ Database

| Communication | Protocol | Library | Example |
|---------------|----------|---------|---------|
| CRUD operations | SQL (abstracted) | Prisma ORM | `prisma.project.findMany({ where: { userId } })` |
| Schema management | SQL migrations | Prisma Migrate | `npx prisma migrate dev` |
| Client generation | Code generation | Prisma Generate | `npx prisma generate` |

**Flow:**
1. Prisma reads `schema.prisma` and generates a TypeScript client
2. Controllers import `PrismaClient` and use type-safe methods
3. Prisma translates method calls to SQL queries
4. SQLite (or PostgreSQL) executes the queries and returns results

## 14.3 Backend ↔ EC2 Server (SSH)

| Communication | Protocol | Library | Example |
|---------------|----------|---------|---------|
| Remote commands | SSH | ssh2 | `conn.exec('docker compose up -d', callback)` |
| Authentication | Public Key | ssh2 | Private key (PEM) decrypted from database |

**Flow:**
1. User clicks "Deploy" → Backend receives request
2. Backend fetches Project + Server from database
3. Backend decrypts SSH private key using AES-256-GCM
4. Backend creates SSH connection using ssh2 library
5. Backend executes commands sequentially (git clone → docker build → docker up)
6. stdout/stderr from each command is captured and emitted via Socket.io

## 14.4 Backend ↔ AWS API

| Communication | Protocol | Library | Example |
|---------------|----------|---------|---------|
| EC2 listing | HTTPS | @aws-sdk/client-ec2 | `ec2Client.send(new DescribeInstancesCommand({}))` |

**Flow:**
1. User saves AWS credentials → encrypted and stored in database
2. User requests instance list → Backend decrypts credentials
3. Backend creates EC2Client with those credentials
4. Backend calls `DescribeInstancesCommand` to list instances
5. Returns instance IDs, names, public IPs, and states to frontend

## 14.5 Docker ↔ EC2 Server

| Communication | Protocol | Example |
|---------------|----------|---------|
| Docker commands | Unix socket | `docker compose build`, `docker compose up -d` |
| Container networking | Docker network | Containers communicate via service names |
| Port mapping | TCP | `-p 8080:80` maps host port 8080 to container port 80 |

## 14.6 Nginx ↔ Docker Containers

| Communication | Protocol | Example |
|---------------|----------|---------|
| Reverse proxy | HTTP | `proxy_pass http://localhost:8080;` |
| WebSocket proxy | WS | `proxy_pass` with `Upgrade` headers |

## 14.7 GitHub ↔ EC2 Server

| Communication | Protocol | Example |
|---------------|----------|---------|
| Clone/Fetch | HTTPS | `git clone https://github.com/user/repo.git` |
| Private repo auth | Token in URL | `https://TOKEN@github.com/user/repo.git` |

## 14.8 CI/CD ↔ Everything

```
Developer pushes code to GitHub
        │
        ▼
GitHub Actions (CI/CD) triggers on push/PR
        │
        ├── Run tests
        ├── Build Docker image
        ├── Push to container registry
        └── SSH deploy to EC2 (or trigger DevOpsHub API)
```

## 14.9 Complete Communication Map

```
┌─────────────┐  HTTP/WS   ┌─────────────┐   SQL    ┌──────────┐
│  Frontend   │◄──────────►│  Backend    │◄────────►│ Database │
│  (React)    │  Axios/    │  (Express)  │  Prisma  │ (SQLite) │
│  Port 5173  │  Socket.io │  Port 4000  │          │ dev.db   │
└─────────────┘            └──────┬──────┘          └──────────┘
                                  │
                          SSH (Port 22)
                          via ssh2 library
                                  │
                           ┌──────▼──────┐
                           │  EC2 Server │
                           │  (Ubuntu)   │
                           │             │
                           │  ┌────────┐ │   HTTP    ┌──────────┐
                           │  │ Docker ├─┼──────────►│ End User │
                           │  │  Containers │         │ (Browser)│
                           │  └────────┘ │           └──────────┘
                           │  ┌────────┐ │
                           │  │ Nginx  │ │
                           │  └────────┘ │
                           │  ┌────────┐ │  HTTPS    ┌──────────┐
                           │  │  Git   ├─┼──────────►│  GitHub  │
                           │  └────────┘ │           └──────────┘
                           └─────────────┘
                                  ▲
                                  │ AWS API (HTTPS)
                           ┌──────┴──────┐
                           │  AWS SDK    │
                           │  (Backend)  │
                           └─────────────┘
```

---

# SECTION 15 — Viva Questions

## Basic Questions (1–30)

**1.** What is DevOpsHub?
**2.** What does PaaS stand for?
**3.** What problem does DevOpsHub solve?
**4.** What programming language is the frontend written in?
**5.** What programming language is the backend written in?
**6.** What is React?
**7.** What is Node.js?
**8.** What is Express?
**9.** What is a REST API?
**10.** What is the difference between HTTP GET and POST?
**11.** What is Docker?
**12.** What is the difference between a container and a virtual machine?
**13.** What is a Docker image?
**14.** What is a Dockerfile?
**15.** What is Docker Compose?
**16.** What is Git?
**17.** What is the difference between Git and GitHub?
**18.** What is an SSH key?
**19.** What is AWS EC2?
**20.** What is a Security Group?
**21.** What does `t2.micro` mean?
**22.** What is Nginx?
**23.** What is a reverse proxy?
**24.** What is a JWT?
**25.** What is an ORM?
**26.** What is Prisma?
**27.** What is SQLite?
**28.** What is a WebSocket?
**29.** What is a `.env` file?
**30.** What does CORS stand for?

## Intermediate Questions (31–70)

**31.** Explain the deployment pipeline in DevOpsHub. How many stages are there?
**32.** What is the role of the `sshOrchestrator.ts` file?
**33.** How does DevOpsHub authenticate users?
**34.** What encryption algorithm is used for storing SSH private keys?
**35.** Why is AES-256-GCM used instead of AES-256-CBC?
**36.** How does the frontend receive real-time logs during deployment?
**37.** What is the purpose of `errorClassifier.ts`?
**38.** How does DevOpsHub detect the framework of a deployed project?
**39.** What happens if a Dockerfile doesn't exist in the user's repository?
**40.** What is Terraform and how is it used in this project?
**41.** What is Ansible and how is it used in this project?
**42.** What is the difference between Terraform and Ansible?
**43.** What is Infrastructure as Code (IaC)?
**44.** Explain the database schema. How many models are there?
**45.** What is a foreign key?
**46.** What does `onDelete: Cascade` mean in Prisma?
**47.** What is rate limiting and how is it implemented?
**48.** Why is swap memory important for `t2.micro` instances?
**49.** What is the purpose of the `selfHealDatabase()` function?
**50.** How does DevOpsHub handle private GitHub repositories?
**51.** What is the purpose of the `authMiddleware`?
**52.** What is a Bearer token?
**53.** What is the Vite build tool?
**54.** What is Zustand?
**55.** What is the Virtual DOM?
**56.** What is `docker compose up -d`? What does `-d` mean?
**57.** What is the difference between `docker compose` (V2) and `docker-compose` (V1)?
**58.** What is a Docker volume?
**59.** What is a Docker network?
**60.** How does the backend connect to the PostgreSQL database?
**61.** What is the purpose of `package.json`?
**62.** What is `package-lock.json`?
**63.** What does `npm install` do?
**64.** What is a TypeScript compiler?
**65.** What is the `dist/` folder?
**66.** How are environment variables loaded in the backend?
**67.** What is nodemailer used for?
**68.** What port does the frontend run on in development?
**69.** What port does the backend run on?
**70.** What is the `CMD` instruction in a Dockerfile?

## Advanced Questions (71–110)

**71.** Explain the self-healing mechanism in DevOpsHub. Give three examples.
**72.** What is exponential backoff? Where is it used in this project?
**73.** Why does the deployment run asynchronously after returning HTTP 202?
**74.** What is the difference between HTTP 200 and HTTP 202?
**75.** Explain how AES-256-GCM encryption works. What are the IV and Auth Tag?
**76.** What is the `terraform.tfstate` file? Why is it important?
**77.** How would you scale DevOpsHub to handle 100 concurrent deployments?
**78.** What are the security vulnerabilities if SSH keys are stored unencrypted?
**79.** How does the `ErrorClassifier` improve user experience compared to raw error messages?
**80.** What is the difference between `systemctl reload` and `systemctl restart` for Nginx?
**81.** Why does DevOpsHub disable SSH reverse DNS lookup on the target server?
**82.** Explain the `proxy_set_header Upgrade $http_upgrade` Nginx directive. Why is it needed?
**83.** What is a Docker layer cache? How does ordering Dockerfile instructions affect build time?
**84.** What is the purpose of `depends_on` in Docker Compose? Does it guarantee the service is ready?
**85.** What is the difference between a bind mount and a named volume in Docker?
**86.** Why is the Docker socket (`/var/run/docker.sock`) mounted in the backend container?
**87.** What is Prisma Migrate? How does it differ from Prisma Generate?
**88.** Explain how Socket.io rooms work in the context of log streaming.
**89.** What is the purpose of the `DeploymentStage` model? Why not just store logs in the `Deployment` model?
**90.** How would you add Kubernetes support to DevOpsHub?
**91.** What is the CAP theorem? How does it apply to the database choice?
**92.** What is the difference between symmetric and asymmetric encryption?
**93.** Why is `process.exit(1)` called when JWT_SECRET is the default value in production?
**94.** How does the rate limiter prevent brute-force OTP attacks?
**95.** What is the difference between `COPY` and `ADD` in a Dockerfile?
**96.** What is a multi-stage Docker build? How could it be used here?
**97.** How does `try_files $uri $uri/ /index.html` work for React routing?
**98.** What is the difference between `git fetch` and `git pull`?
**99.** What is the purpose of `git reset --hard origin/main`?
**100.** Why does the Ansible playbook use `become: yes`?
**101.** What is an Ansible handler? When does it run?
**102.** What is the difference between `apt-get install` and `apt-get update`?
**103.** How would you implement CI/CD with GitHub Actions for DevOpsHub?
**104.** What is the OWASP Top 10? Which vulnerabilities does DevOpsHub protect against?
**105.** What is container orchestration? Why might you need it?
**106.** What is the difference between horizontal and vertical scaling?
**107.** How would you implement database backups for DevOpsHub?
**108.** What is a load balancer? When would DevOpsHub need one?
**109.** What is the difference between TCP and UDP? Which does SSH use?
**110.** What is the purpose of the `EXPOSE` instruction in a Dockerfile?

## Scenario-Based Questions (111–135)

**111.** A user clicks Deploy but sees "SSH Authentication Failed". What went wrong? How do you fix it?
**112.** The Health Check stage fails with "Port 8080 is not accepting connections." What should you check?
**113.** A user reports "502 Bad Gateway" when accessing their deployed app. Walk through the debugging process.
**114.** The Docker build fails with "no space left on device" on the EC2 instance. What happens automatically? What if it still fails?
**115.** A user tries to deploy a private GitHub repository but the clone fails. What's missing?
**116.** After restarting the EC2 instance, the deployed apps are no longer accessible. Why?
**117.** Two users try to deploy on the same port (8080). How does DevOpsHub handle this?
**118.** The backend server crashes immediately on startup in production. What's the most likely cause?
**119.** The Git clone stage fails with "Could not resolve host: github.com". What's wrong?
**120.** A user's deployment succeeds but the website shows old content. What should they do?
**121.** The SSH connection times out after 30 seconds. What are three possible causes?
**122.** The Docker Compose file has `depends_on: db` but the backend fails to connect to PostgreSQL. Why?
**123.** An attacker tries to brute-force OTP codes. How does DevOpsHub prevent this?
**124.** The Terraform `apply` fails with "InvalidParameterValue: Security group does not exist". What happened?
**125.** A user reports their deployment was "SUCCESS" but the app crashes after 10 seconds. Why didn't the Health Check catch it?
**126.** The Nginx access log shows many 404 errors for `/static/js/main.abc123.js`. What's wrong?
**127.** A user wants to deploy a Python Django project. Can DevOpsHub handle it? How?
**128.** The EC2 instance runs out of RAM (1 GB) during a Docker build. What solutions exist?
**129.** A user accidentally deletes their project. What happens to the running container on the server?
**130.** The `ENCRYPTION_KEY` environment variable is not set. What happens in development vs production?
**131.** You need to migrate from SQLite to PostgreSQL in production. What changes are needed?
**132.** A deployment is stuck at "Building Docker Image" for 30 minutes. What would you check?
**133.** The WebSocket connection drops and the user stops seeing live logs. What happens?
**134.** You want to add a "Rollback" feature. How would you design it?
**135.** The terraform.tfstate file is accidentally deleted. What impact does this have?

## Tricky & Project-Specific Questions (136–155)

**136.** Why does the project use SQLite for development but PostgreSQL in docker-compose? What are the trade-offs?
**137.** The `verifyOtp` function accepts a hardcoded code `123456`. Is this a security issue?
**138.** Why does `sshOrchestrator.ts` check for both `docker compose` and `docker-compose`?
**139.** What is the purpose of `Object.setPrototypeOf(this, new.target.prototype)` in `AppError`?
**140.** Why does the backend import `io` from `server.ts` in `projectController.ts`? What problem does this solve?
**141.** The Terraform config uses `import` block for an existing EC2 instance. What does this mean?
**142.** Why does the rate limiter bypass limits when `NODE_ENV !== 'production'`?
**143.** How does the `selfHealDatabase()` function fix IP addresses with port suffixes?
**144.** Why does DevOpsHub pre-create all 9 deployment stages as PENDING before starting?
**145.** What is the purpose of the `canRetry` field in `DeploymentStage`?
**146.** Why does the Ansible playbook add a swap file? Why not just use a bigger instance?
**147.** The `addServerInstance` controller strips the port from IP addresses. Why?
**148.** Why does the SSH configuration use `readyTimeout: 30000` and `keepaliveInterval: 10000`?
**149.** What is `docker system prune -af --volumes` doing? Why is `-af` used instead of just `-a`?
**150.** Why does the `connectSsh` method parse the host string for a port number?
**151.** How does DevOpsHub ensure the frontend stays responsive during a long deployment?
**152.** What would happen if two deployments for the same project run simultaneously?
**153.** Why does the project limit users to 10 projects maximum?
**154.** The `deleteProject` function runs container teardown asynchronously. Why not wait for it?
**155.** How would you add monitoring/alerting for failed deployments?

---

# SECTION 16 — Model Answers

> **Writing style:** These answers are written as if you were speaking naturally in a viva exam — confident, clear, and conversational. Do NOT memorize them word-for-word. Understand the concepts and express them in your own way.

---

### Q1: What is DevOpsHub?

"DevOpsHub is a self-hosted deployment platform — basically our own version of Heroku or Render. You give it a GitHub repository URL, and it automatically SSHs into your AWS EC2 server, clones the code, detects what kind of project it is, builds a Docker image, starts a container, and gives you a live URL. The whole process is visible in real-time through WebSocket-powered live logs in the browser. It's designed to run on AWS Free Tier, so students and small teams can use it without any cost."

### Q2: What does PaaS stand for?

"PaaS stands for Platform as a Service. It's a cloud computing model where the provider gives you a platform to develop, run, and manage applications without worrying about the underlying infrastructure. Examples include Heroku, Google App Engine, and AWS Elastic Beanstalk. DevOpsHub is essentially a self-hosted PaaS."

### Q5: What programming language is the backend written in?

"The backend is written in TypeScript, which is a superset of JavaScript that adds static type checking. We chose TypeScript because it catches bugs at compile time — for example, if I accidentally pass a string where a number is expected, TypeScript will catch that before the code even runs. The TypeScript code compiles down to JavaScript that Node.js executes."

### Q11: What is Docker?

"Docker is a containerization platform. Think of it like shipping containers in the real world — it doesn't matter what's inside the container, the crane and truck handle it the same way. Docker packages your application code along with all its dependencies into a container, and that container runs identically on any machine. In DevOpsHub, every project the user deploys becomes a separate Docker container with its own filesystem and network port."

### Q12: What is the difference between a container and a virtual machine?

"Both provide isolation, but containers are much more lightweight. A virtual machine runs a complete guest operating system — Windows or Linux with its own kernel — which can take gigabytes of disk space and minutes to boot. A container, on the other hand, shares the host's OS kernel and only packages the application and its dependencies. It takes megabytes of space and starts in seconds. Containers give you process-level isolation, while VMs give you hardware-level isolation."

### Q24: What is a JWT?

"JWT stands for JSON Web Token. It's like a signed ID card. When you log in, the server creates a token containing your user ID and email, signs it with a secret key, and gives it to you. Every time you make a request, you send this token back. The server can verify the signature to confirm it's authentic without checking the database. In DevOpsHub, the JWT expires after 24 hours, so you need to log in again after that."

### Q31: Explain the deployment pipeline in DevOpsHub. How many stages are there?

"The deployment pipeline has 9 stages, and they run sequentially. First, it validates the inputs — the Git URL, branch name, and SSH key. Second, it establishes an SSH connection to the target EC2 server with retry logic. Third, it checks the server environment — is Git installed? Docker? Is there enough disk space? Are there port conflicts? Fourth, it creates a workspace directory. Fifth, it clones the repository (or fetches updates if it already exists). Sixth, it detects the framework — if there's a docker-compose.yml it uses that, if there's an index.html it creates an Nginx container, if there's a package.json it creates a Node.js container. Seventh, it builds the Docker image. Eighth, it starts the container. And ninth, it runs a health check to verify the app is actually responding. If any stage fails, the remaining stages are marked as SKIPPED."

### Q35: Why is AES-256-GCM used instead of AES-256-CBC?

"GCM stands for Galois/Counter Mode. The key difference is that GCM provides both encryption and authentication in a single operation — it generates an authentication tag that detects if the encrypted data has been tampered with. CBC only encrypts — you'd need to add a separate HMAC for integrity checking. Using GCM also prevents certain attacks like padding oracle attacks that affect CBC mode. In DevOpsHub, we store sensitive data like SSH keys and AWS secrets, so tamper detection is critical."

### Q71: Explain the self-healing mechanism in DevOpsHub. Give three examples.

"Self-healing means the system automatically recovers from certain failures without human intervention. There are three main examples in DevOpsHub:

First, port conflict resolution. If the port you're deploying on is already occupied by another container, DevOpsHub automatically stops and removes the conflicting container before proceeding.

Second, disk space recovery. If the Docker build fails because the disk is full, it automatically runs `docker system prune -af --volumes` to clean up unused images, containers, and volumes, then retries the build.

Third, corrupted clone recovery. If the Git clone or fetch fails — maybe because of a corrupted .git directory — it automatically deletes the entire workspace directory, recreates it, and does a fresh clone.

There's also a database self-healing on startup: the `selfHealDatabase()` function scans server IP addresses and removes any accidentally appended port suffixes."

### Q75: Explain how AES-256-GCM encryption works. What are the IV and Auth Tag?

"AES-256-GCM uses a 256-bit key to encrypt data. GCM mode requires an Initialization Vector (IV), which is a random 12-byte value that ensures the same plaintext encrypted twice produces different ciphertext — this prevents pattern analysis. The Auth Tag is a 16-byte value generated during encryption that acts as a fingerprint of the data. When decrypting, if the auth tag doesn't match, it means the data was tampered with and the decryption fails. In DevOpsHub, the encrypted text is stored as three colon-separated hex strings: `iv:encryptedData:authTag`."

### Q111: A user clicks Deploy but sees "SSH Authentication Failed". What went wrong? How do you fix it?

"This means the SSH handshake succeeded — we reached the server — but authentication was rejected. There are three likely causes. First, the SSH username might be wrong — for Ubuntu instances you should use 'ubuntu', for Amazon Linux use 'ec2-user'. Second, the private key might be incorrect — maybe they pasted the wrong key or it got corrupted. Third, the key might not have the right permissions on the server — the authorized_keys file might not contain the matching public key. I'd ask the user to verify all three: check the username, re-paste the private key, and confirm the key pair matches what was used when creating the EC2 instance."

### Q117: Two users try to deploy on the same port (8080). How does DevOpsHub handle this?

"DevOpsHub has a self-healing mechanism for this. During Stage 3 (Checking Server Environment), it checks if the target port is already in use by running `docker ps -a -q --filter publish={port}`. If it finds conflicting containers, it automatically stops and removes them before proceeding with the new deployment. However, this means the first user's deployment will be taken down. To properly handle this in a production system, you'd want to assign unique ports to each project or use a reverse proxy like Traefik that routes by domain name instead of port."

### Q137: The `verifyOtp` function accepts a hardcoded code `123456`. Is this a security issue?

"Yes, absolutely — in production, this is a critical vulnerability. The code `&& code !== '123456'` on line 82 means anyone can bypass OTP verification by entering '123456'. This is clearly a development backdoor for testing convenience — so developers don't need to set up SMTP locally. However, this must be removed or gated behind a strict `NODE_ENV === 'development'` check before production deployment. The rate limiter provides some protection, but it's bypassed in development mode too. This is a good example of why security review before deployment is essential."

### Q141: The Terraform config uses `import` block for an existing EC2 instance. What does this mean?

"The `import` block tells Terraform to 'adopt' an existing resource that was created outside of Terraform — perhaps manually through the AWS Console. Instead of creating a new EC2 instance, Terraform imports the instance with ID `i-0e412d7aea4774c2b` into its state file. After import, Terraform manages this instance going forward. The `resource` block below defines how the instance should be configured. If there's a drift between the actual state and the desired configuration, `terraform plan` will show the differences and `terraform apply` will reconcile them."

### Q151: How does DevOpsHub ensure the frontend stays responsive during a long deployment?

"The deployment is designed to be asynchronous. When you click Deploy, the backend immediately returns HTTP 202 (Accepted) — it doesn't wait for the 9-stage pipeline to finish. The actual deployment runs in a background async IIFE (Immediately Invoked Function Expression). The frontend receives live updates through WebSockets — `log-line` events for build output and `stage-update` events for status changes. This means the React UI stays completely responsive — you can navigate to other pages, create other projects, or even start another deployment while one is running. The `LogTerminal` component subscribes to the Socket.io events and updates the UI in real-time."

### Q154: The `deleteProject` function runs container teardown asynchronously. Why not wait for it?

"There's a pragmatic reason for this. The container teardown involves SSHing into the remote server and running `docker compose down`. This could take several seconds, and if the server is unreachable, it could time out. If we made the user wait for all of that, they'd see a long loading spinner just to delete a project. Instead, we delete the database records immediately (giving the user instant feedback) and fire-and-forget the container cleanup. Notice the error handling — if the teardown fails (maybe the server is offline), the error is swallowed with an empty catch block. The database records are still deleted, and the orphaned container can be cleaned up later."

---

# SECTION 17 — Hands-on Demonstration

## 17.1 What You Need Before Starting

1. **DevOpsHub running locally** (backend on port 4000, frontend on port 5173)
2. **An AWS EC2 instance** provisioned and configured (or simulated)
3. **A test GitHub repository** (e.g., `devopshub-demo-app`)
4. **A browser** (Chrome recommended for DevTools)

## 17.2 Step-by-Step Demo Script

### Step 1: Open the Application (30 seconds)

**What to do:**
- Open Chrome and navigate to `http://localhost:5173`
- You should see the DevOpsHub login page with the soft, modern neumorphic design

**What to say:**
> "This is DevOpsHub, our self-hosted Platform-as-a-Service for deploying applications. The frontend is built with React 19, TypeScript, and Tailwind CSS 4, served by Vite. Let me walk you through the full workflow."

### Step 2: Login with Email OTP (1 minute)

**What to do:**
1. Enter your email in the input field (e.g., `admin@devopshub.local`)
2. Click "Send Verification Code"
3. The button will show a loading spinner

**What to say:**
> "We use passwordless authentication with email-based OTP. When I enter my email and click Send, the backend generates a 6-digit code, stores it in the database with a 10-minute expiry, and either sends it via SMTP or logs it in the backend console for development. Let me check the backend console..."

4. Look at the backend terminal — you'll see:
   ```
   ============================================
   🔑 DEV LOG: Verification Code for admin@devopshub.local is: 847293
   ============================================
   ```
5. Enter the code in the verification field
6. Click "Verify & Login"

**What to say:**
> "The backend verifies the OTP against the database, creates or finds the user record, generates a JWT token valid for 24 hours, and sends it back. The frontend stores this token in localStorage using Zustand state management, and from now on, every API request includes it as a Bearer token in the Authorization header."

### Step 3: Dashboard (30 seconds)

**What to do:**
- You'll land on the Dashboard page showing CPU and RAM utilization charts

**What to say:**
> "The dashboard shows server observability metrics — CPU and RAM utilization over time. These are rendered using Recharts, a React charting library built on D3.js. In production, these would connect to Prometheus and Grafana for real monitoring data. Notice the sidebar — we have Dashboard, Projects, and Integrations pages."

### Step 4: Toggle Theme (15 seconds)

**What to do:**
- Click the Sun/Moon icon in the top-right of the sidebar

**What to say:**
> "The application supports dark and light themes. The toggle saves the preference in localStorage and applies CSS class changes with smooth transitions. The theme persists across page reloads."

### Step 5: Set Up Integrations (2 minutes)

**What to do:**
1. Click "Integrations" in the sidebar
2. **GitHub section:** Paste a GitHub Personal Access Token
3. **AWS section:** Enter AWS credentials (name, Access Key ID, Secret Access Key, region)
4. **Server section:** Add a server instance:
   - Name: "demo-server"
   - Public IP: (your EC2 IP)
   - SSH Username: "ubuntu"
   - SSH Private Key: (paste your PEM key content)

**What to say:**
> "Before deploying, we need to configure our integrations. The GitHub token is for private repositories — it's stored as-is since it's a user-scoped token. AWS credentials are encrypted using AES-256-GCM before storage — the Secret Access Key is encrypted with a 256-bit key, a random 12-byte IV, and generates an authentication tag that detects tampering. The SSH private key is also encrypted the same way. This is critical — storing SSH keys in plaintext would be a severe security vulnerability."

### Step 6: Create a Project (1 minute)

**What to do:**
1. Click "Projects" in the sidebar
2. Click "Create Project" (or "+" button)
3. Fill in:
   - Name: "demo-website"
   - Repository URL: `https://github.com/yourusername/devopshub-demo-app`
   - Branch: "main"
   - Port: 8085
   - Server: Select "demo-server"
4. Click "Create"

**What to say:**
> "I'm creating a project pointing to our test repository. The backend validates the Git URL format using regex to prevent command injection, checks the branch name for valid characters, ensures the port is a valid number, and verifies the project name is unique. All of this input validation happens on the server side — we never trust frontend validation alone."

### Step 7: Deploy the Project (3-5 minutes)

**What to do:**
1. Click the "Deploy" button on the project card
2. The LogTerminal will appear with 9 stages

**What to say:**
> "Now watch — I've clicked Deploy and the backend has returned HTTP 202 Accepted immediately. The actual deployment runs asynchronously on the server. What you're seeing are real-time WebSocket events — the frontend connected via Socket.io and joined a room identified by the project ID. Every line of SSH output is streamed back through the WebSocket."

3. As each stage runs, explain them:

**Validating Configuration:**
> "Stage 1 validates all inputs — Git URL format, branch name, and SSH key presence."

**SSH Authentication:**
> "Stage 2 establishes the SSH connection. It retries up to 3 times with exponential backoff — 2 seconds, then 4 seconds, then 6 seconds."

**Checking Server Environment:**
> "Stage 3 checks if Git, Docker, and Docker Compose are installed on the server. It also checks disk space — needs at least 500 MB free. And it resolves port conflicts — if port 8085 is already in use, it stops the conflicting container automatically."

**Preparing Workspace:**
> "Stage 4 creates a directory on the server at ~/deployments/{projectId}/"

**Cloning Repository:**
> "Stage 5 clones the repository. If the repo was already cloned before, it does a git fetch and hard reset instead. For private repos, it injects the GitHub token into the URL."

**Detecting Framework:**
> "Stage 6 looks at the repository contents. It found a docker-compose.yml, so it uses that directly. If it was a plain HTML file, it would auto-generate an Nginx Dockerfile. If it was a Node.js app, it would generate a Node.js Dockerfile."

**Building Docker Image:**
> "Stage 7 runs `docker compose build`. This creates a Docker image from the Dockerfile."

**Starting Container:**
> "Stage 8 runs `docker compose up -d` to start the container in detached mode."

**Health Check:**
> "Stage 9 waits 5 seconds, then checks if the container is actually running and if the port is accepting TCP connections."

4. When all stages show green checkmarks:

**What to say:**
> "All 9 stages completed successfully. The deployment status is now SUCCESS. The application is live and accessible."

### Step 8: Access the Deployed Application (30 seconds)

**What to do:**
- Open a new browser tab
- Navigate to `http://YOUR_EC2_IP:8085`
- You should see the "🚀 DevOpsHub Live Demo App" page

**What to say:**
> "The application is now live on the internet. Anyone with this URL can access it. The Docker container is running on the EC2 server, listening on port 8085. In production, we'd put Nginx in front of this as a reverse proxy on port 80 with a domain name."

### Step 9: Show the Technology Stack (30 seconds)

**What to say:**
> "Let me summarize the technologies involved in what just happened. The React frontend communicated with the Express backend via REST and WebSockets. The backend used the ssh2 library to connect to the EC2 server via SSH, ran Git and Docker commands remotely, and stored deployment data in SQLite via Prisma ORM. The EC2 server was provisioned with Terraform and configured with Ansible. Sensitive data — SSH keys, AWS secrets — is encrypted with AES-256-GCM. All of this runs on AWS Free Tier at zero cost."

### Step 10: Clean Up (15 seconds)

**What to do:**
- Click the delete button on the project
- This stops the remote container and deletes the database records

**What to say:**
> "When I delete the project, the backend runs `docker compose down` on the server to stop the container, then deletes the project and deployment records from the database. The container teardown runs asynchronously so I get instant feedback."

---

# SECTION 18 — Cheat Sheet

## Architecture (One-line)

```
Frontend (React) → Backend (Express) → SSH (ssh2) → EC2 (Docker) → Browser (End User)
```

## Complete Workflow

```
Write Code → Git Push → DevOpsHub Dashboard → Create Project → Click Deploy →
Validate → SSH → Check Env → Mkdir → Git Clone → Detect Framework →
Docker Build → Docker Up → Health Check → ✅ Live!
```

## Essential Commands

### Git
```bash
git init                           # Initialize repo
git add .                          # Stage all files
git commit -m "message"            # Commit changes
git push origin main               # Push to GitHub
git pull origin main               # Pull from GitHub
git clone URL                      # Clone repository
git checkout -b branch-name        # Create & switch branch
git merge branch-name              # Merge branch
git log --oneline -5               # View last 5 commits
git status                         # Show changed files
```

### Docker
```bash
docker build -t name .             # Build image
docker run -d -p 8080:80 name      # Run container
docker ps                          # List running containers
docker stop ID                     # Stop container
docker rm ID                       # Remove container
docker logs -f ID                  # Follow container logs
docker images                      # List images
docker system prune -af            # Remove unused resources
docker compose up -d               # Start compose services
docker compose down                # Stop compose services
docker compose build               # Build compose images
docker compose logs                # View compose logs
```

### Linux
```bash
ssh -i key.pem ubuntu@IP           # SSH into server
sudo apt-get update                # Refresh package list
sudo apt-get install -y package    # Install package
sudo systemctl restart nginx       # Restart Nginx
sudo systemctl start docker        # Start Docker
chmod 400 key.pem                  # Fix key permissions
df -h                              # Check disk space
free -h                            # Check memory
htop                               # Process monitor
sudo lsof -i :PORT                 # Find process on port
kill -9 PID                        # Force kill process
```

### Nginx
```bash
sudo nginx -t                      # Test config syntax
sudo systemctl reload nginx        # Reload without downtime
sudo tail -f /var/log/nginx/error.log    # View error logs
```

### AWS
```bash
terraform init                     # Download providers
terraform plan                     # Preview changes
terraform apply                    # Execute changes
terraform destroy                  # Delete all resources
ansible-playbook -i hosts.ini playbook.yml  # Run Ansible
```

### Prisma
```bash
npx prisma generate               # Generate client from schema
npx prisma migrate dev             # Apply migrations
npx prisma studio                  # Open visual database browser
npx prisma db seed                 # Run seed script
```

## AWS Services Quick Reference

| Service | What | Used For |
|---------|------|----------|
| EC2 | Virtual servers | Running Docker containers |
| VPC | Virtual network | Isolating infrastructure |
| Security Groups | Firewall rules | Controlling port access |
| IAM | Permissions | API access keys |
| EBS | Block storage | EC2 hard drive |
| Elastic IP | Static IP | Consistent server address |

## Database Models

| Model | Purpose | Key Fields |
|-------|---------|-----------|
| User | Authentication | email, githubToken |
| AwsCredential | AWS API access | accessKeyId, secretAccessKey (encrypted) |
| ServerInstance | SSH targets | publicIp, sshPrivateKey (encrypted) |
| Project | User's apps | repoUrl, branch, port |
| Deployment | Deploy history | status, buildLogs |
| DeploymentStage | Pipeline stages | name, status, logs, errorReason |
| OtpVerification | Login codes | email, code, expiresAt |

## Deployment Pipeline Stages

| # | Stage | Self-Healing |
|---|-------|-------------|
| 1 | Validating Configuration | ❌ |
| 2 | SSH Authentication | ✅ Retry 3x with backoff |
| 3 | Checking Server Environment | ✅ Auto-install missing deps, resolve port conflicts |
| 4 | Preparing Workspace | ❌ |
| 5 | Cloning Repository | ✅ Fresh clone on failure |
| 6 | Detecting Framework | ✅ Auto-generate Dockerfile |
| 7 | Building Docker Image | ✅ Prune on disk full |
| 8 | Starting Container | ✅ Prune networks on failure |
| 9 | Health Check | ❌ (diagnostic only) |

## Security Measures

| Measure | Implementation |
|---------|---------------|
| Encryption at rest | AES-256-GCM for SSH keys, AWS secrets |
| Authentication | JWT (24h expiry) |
| Passwordless login | Email OTP (6-digit, 10-min expiry) |
| Rate limiting | 5 attempts per 15 minutes (OTP) |
| Input validation | Regex for Git URLs, branch names, IPs, usernames |
| CORS | Configurable origin whitelist |
| Production safeguards | Crash on default JWT_SECRET |

## Ports

| Port | Service |
|------|---------|
| 22 | SSH |
| 80 | HTTP (Nginx) |
| 443 | HTTPS (SSL) |
| 4000 | DevOpsHub Backend API |
| 5173 | DevOpsHub Frontend (dev) |
| 5432 | PostgreSQL |
| 8000-9000 | User's deployed containers |

## One-Line Definitions

| Term | Definition |
|------|-----------|
| **PaaS** | Cloud platform where you deploy apps without managing servers |
| **Container** | Lightweight, isolated environment for running an application |
| **Image** | Read-only template for creating containers |
| **Dockerfile** | Script of instructions to build a Docker image |
| **Compose** | Tool for defining multi-container apps in YAML |
| **SSH** | Encrypted protocol for remote server access |
| **JWT** | Signed token for stateless authentication |
| **ORM** | Library that maps database tables to code objects |
| **IaC** | Managing infrastructure through config files, not manual clicks |
| **Terraform** | IaC tool that provisions cloud resources declaratively |
| **Ansible** | Agentless automation tool that configures servers via SSH |
| **Nginx** | Web server and reverse proxy |
| **Reverse Proxy** | Server that forwards requests to another server |
| **VPC** | Isolated virtual network inside AWS |
| **Security Group** | Virtual firewall for EC2 instances |
| **Elastic IP** | Static public IP for EC2 (survives restarts) |
| **WebSocket** | Protocol for real-time, bidirectional browser-server communication |
| **CORS** | Browser security that restricts cross-origin HTTP requests |
| **Rate Limiting** | Restricting how many requests a client can make in a time window |
| **Self-Healing** | System automatically recovering from certain failures |
| **Exponential Backoff** | Retry strategy with increasing wait times (2s, 4s, 8s...) |
| **Idempotent** | Operation that produces the same result regardless of how many times you run it |
| **ACID** | Atomicity, Consistency, Isolation, Durability — database transaction guarantees |
| **CI/CD** | Continuous Integration / Continuous Deployment — automated build & deploy pipeline |

## Frequently Asked Viva Questions (Top 20)

1. What is DevOpsHub and what problem does it solve?
2. Explain the deployment pipeline — all 9 stages.
3. What is Docker? Container vs VM?
4. What is a reverse proxy? How does Nginx work?
5. What is Terraform? How is it different from Ansible?
6. What encryption does DevOpsHub use for storing secrets?
7. How does JWT authentication work?
8. What is a WebSocket? Why not just HTTP?
9. What is SSH and how does it work?
10. What is a Security Group in AWS?
11. How does DevOpsHub handle deployment failures?
12. What are the self-healing mechanisms?
13. Why was Docker used instead of deploying directly?
14. How does the frontend receive real-time logs?
15. What database is used and why?
16. How does DevOpsHub auto-detect the project framework?
17. What happens when a user clicks "Deploy"?
18. How would you scale this project?
19. What security measures are implemented?
20. Walk me through the entire DevOps workflow from code to browser.

---

> **Final Note:** This handbook covers everything you need to explain, demonstrate, and defend the DevOpsHub project. The key to a successful viva is not memorization — it's understanding **why** every technology was chosen and **how** every component connects. When in doubt, draw the architecture diagram and trace the data flow. Good luck! 🚀
