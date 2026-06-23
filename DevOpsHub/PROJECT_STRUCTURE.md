# Project Structure

```text
devopshub/
├── .github/
│   └── workflows/          # CI/CD pipelines for DevOpsHub
├── backend/                # Node.js API
│   ├── prisma/             # Database schema and migrations
│   ├── src/
│   │   ├── controllers/    # API endpoint handlers
│   │   ├── middleware/     # JWT Auth, Error handling
│   │   ├── routes/         # Express routing
│   │   ├── services/       # Docker, Git, Nginx integrations
│   │   └── utils/          # Helpers (Loggers, Crypto)
│   ├── package.json
│   └── tsconfig.json
├── frontend/               # React Dashboard
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/     # Reusable UI (Buttons, Modals, Charts)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Login, Dashboard, Projects
│   │   ├── store/          # Zustand global state
│   │   └── App.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── infrastructure/         # Server Provisioning
│   ├── ansible/            # Playbooks for Docker/Nginx setup
│   └── terraform/          # AWS EC2 provisioning scripts
├── docs/                   # Detailed architectural documentation
├── docker-compose.yml      # Local development compose file
├── docker-compose.prod.yml # Production compose file
└── README.md
```
