# Task 13: Development Roadmap

This roadmap breaks down the development of DevOpsHub into achievable weekly milestones for a single developer.

---

## Milestone 1: Server & Database Foundation (Week 1)
**Features:** AWS EC2 Provisioning, Node.js Setup, Prisma ORM.
**Estimated Hours:** 20 hours
**Difficulty:** Medium
**Deliverables:**
- Running Ubuntu 22.04 server on AWS with Nginx and Docker installed.
- Express API returning a `200 OK` health check.
- PostgreSQL running in a Docker container, connected to Prisma.
**Git Commits:**
- `feat: initialize express server and prisma schema`
- `chore: add terraform scripts for ec2`
**Testing:** Ensure you can query the database via the API using Postman.
**Expected Output:** A solid backend foundation ready to execute commands.

## Milestone 2: The Core Engine (Week 2)
**Features:** Authentication, Dockerode integration, Git cloning.
**Estimated Hours:** 25 hours
**Difficulty:** Hard
**Deliverables:**
- `/api/auth/login` endpoint issuing JWTs.
- Node.js script capable of cloning a public GitHub repository to the local disk.
- Node.js script capable of running `docker-compose up -d --build` on that cloned folder.
**Git Commits:**
- `feat: add jwt authentication middleware`
- `feat: implement git clone service`
- `feat: implement dockerode build service`
**Testing:** Trigger the endpoint via Postman and verify a new Docker container spins up on the host.
**Expected Output:** The hardest part is done. The backend can now deploy code.

## Milestone 3: Nginx Automation & Logging (Week 3)
**Features:** Dynamic Nginx configs, WebSocket logs.
**Estimated Hours:** 20 hours
**Difficulty:** Hard
**Deliverables:**
- Service that writes `nginx.conf` routing `appname.devopshub.local` to the exposed Docker port.
- WebSocket server streaming `docker logs -f` to a client.
**Git Commits:**
- `feat: dynamic nginx configuration generator`
- `feat: setup socket.io for real-time logs`
**Testing:** Deploy an app, modify your `/etc/hosts` file locally, and access the app in your browser.
**Expected Output:** Applications are now publicly accessible and debuggable.

## Milestone 4: Frontend UI Dashboard (Week 4)
**Features:** React SPA, Tailwind CSS, State Management.
**Estimated Hours:** 25 hours
**Difficulty:** Medium
**Deliverables:**
- Login Page.
- Dashboard showing active projects.
- "New Project" modal that POSTs to the backend.
**Git Commits:**
- `feat: initialize vite react app with tailwind`
- `feat: build projects dashboard UI`
- `feat: connect frontend to deployment API`
**Testing:** Click "Deploy" in the UI and watch the success notification appear.
**Expected Output:** A beautiful interface replacing Postman.

## Milestone 5: Observability & Polish (Week 5)
**Features:** Prometheus, Grafana, Final Testing.
**Estimated Hours:** 15 hours
**Difficulty:** Medium
**Deliverables:**
- Node Exporter running on the host.
- Embedded Grafana chart in the React Dashboard.
- Comprehensive README and Architecture docs written.
**Git Commits:**
- `feat: add prometheus and grafana docker-compose`
- `docs: complete README and installation guides`
**Testing:** Run a stress test (e.g., `stress-ng`) on a container and watch the CPU graph spike in the UI.
**Expected Output:** A complete, resume-ready DevOps product.
