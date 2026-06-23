# DevOpsHub 🚀

![DevOpsHub Architecture](https://img.shields.io/badge/Architecture-Docker_Compose-blue)
![Tech Stack](https://img.shields.io/badge/Stack-React_%7C_Node.js_%7C_PostgreSQL-green)
![Status](https://img.shields.io/badge/Status-Development-orange)

**A Self-Hosted DevOps Deployment & Infrastructure Management Platform.**

DevOpsHub is an open-source, lightweight PaaS (Platform as a Service) designed for students, freelancers, and small development teams. It abstracts away the complexity of manual server management, allowing you to deploy full-stack applications directly from GitHub with a single click.

## 🌟 Features

- **GitHub Integration:** Connect any public/private repository.
- **One-Click Deployments:** Automated `git clone` and `docker build`.
- **Live Logs:** Stream Docker container logs directly to your browser via WebSockets.
- **Automated Routing:** Dynamic Nginx reverse proxy configuration.
- **Server Monitoring:** Built-in Prometheus & Grafana integration for CPU/RAM tracking.
- **Zero-Cost Design:** Optimized to run perfectly on an AWS Free Tier `t2.micro` instance.

## 📸 Dashboard Preview
*(Insert screenshot of the dashboard here)*

## 📚 Documentation
For deep-dive technical details, please refer to the documentation:

- [Installation Guide](INSTALLATION.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Software Architecture](docs/05_Architecture.md)
- [Database Schema](docs/06_Database_Design.md)
- [API Reference](docs/07_API_Design.md)
- [Security Model](docs/12_Security_Plan.md)
- [Project Structure](PROJECT_STRUCTURE.md)

## 🛠️ Tech Stack
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Zustand, XTerm.js
- **Backend:** Node.js, Express, Prisma ORM, Dockerode, Socket.io
- **Database:** PostgreSQL
- **Infrastructure:** AWS EC2, Docker, Docker Compose, Nginx, Terraform, Ansible

## 🚀 Quick Start (Local Development)
Please read `INSTALLATION.md` for detailed instructions.
```bash
git clone https://github.com/yourusername/devopshub.git
cd devopshub
docker-compose up -d
```

## 🤝 Contributing
Please see `CONTRIBUTING.md` for our code of conduct and pull request process.

## 📝 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
