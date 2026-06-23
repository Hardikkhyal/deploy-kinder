# Installation Guide (Local Development)

This guide covers setting up DevOpsHub on your local development machine (Windows, macOS, or Linux).

## Prerequisites
Ensure you have the following installed:
1. **Node.js** (v18 or higher)
2. **Docker Desktop** (or Docker Engine on Linux)
3. **Git**

---

## 1. Clone the Repository
```bash
git clone https://github.com/yourusername/devopshub.git
cd devopshub
```

## 2. Setup the Backend API
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
PORT=4000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/devopshub"
JWT_SECRET="local_development_secret"
DOCKER_SOCKET_PATH="/var/run/docker.sock" # Use //var/run/docker.sock on Windows
```

Start the local PostgreSQL database using Docker:
```bash
docker-compose -f docker-compose.db.yml up -d
```

Run Prisma migrations and start the server:
```bash
npx prisma migrate dev --name init
npm run dev
```

## 3. Setup the Frontend
```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL="http://localhost:4000/api"
VITE_WS_URL="ws://localhost:4000"
```

Start the React development server:
```bash
npm run dev
```

## 4. Access the Dashboard
Open your browser and navigate to `http://localhost:3000`. You can log in using the default admin credentials (created during the Prisma seed).
