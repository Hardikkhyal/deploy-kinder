# DevOpsHub — Installation Guide

A complete step-by-step guide to install and run DevOpsHub on your own machine or server.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start (Local Development)](#quick-start-local-development)
3. [Docker Deployment (Recommended for Production)](#docker-deployment)
4. [Manual Setup (Without Docker)](#manual-setup-without-docker)
5. [Environment Variables Reference](#environment-variables-reference)
6. [Generating Secrets](#generating-secrets)
7. [First Login](#first-login)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Make sure the following are installed on your machine **before** you begin:

| Tool | Minimum Version | Check Command |
|------|----------------|---------------|
| [Node.js](https://nodejs.org/) | v18 or higher | `node -v` |
| [npm](https://www.npmjs.com/) | v9 or higher | `npm -v` |
| [Git](https://git-scm.com/) | v2.30 or higher | `git --version` |
| [Docker](https://www.docker.com/) | v20 or higher | `docker -v` |
| [Docker Compose](https://docs.docker.com/compose/) | v2 or higher | `docker compose version` |

> **Note:** Docker is required only if you want to use the Docker deployment method.  
> For local development (manual setup), only Node.js, npm, and Git are needed.

---

## Quick Start (Local Development)

The fastest way to get DevOpsHub running on your local machine.

### 1. Clone the repository

```bash
git clone https://github.com/Hardikkhyal/deploy-kinder.git
cd deploy-kinder/DevOpsHub
```

### 2. Set up the backend

```bash
cd backend

# Copy the example environment file
cp .env.example .env
```

Open `.env` in any text editor and fill in the required values (see [Environment Variables Reference](#environment-variables-reference) below).

At minimum, you must set:
- `JWT_SECRET` — a long random string (see [Generating Secrets](#generating-secrets))
- `ENCRYPTION_KEY` — a 32-byte hex key (see [Generating Secrets](#generating-secrets))

```bash
# Install dependencies
npm install

# Run Prisma database migration (creates the SQLite database)
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Start the backend development server
npm run dev
```

The backend will start at: **http://localhost:4000**

### 3. Set up the frontend (in a new terminal)

```bash
cd DevOpsHub/frontend

# Install dependencies
npm install

# Start the frontend development server
npm run dev
```

The frontend will open at: **http://localhost:5173**

---

## Docker Deployment

The recommended method for a production or server deployment.

### 1. Clone the repository

```bash
git clone https://github.com/Hardikkhyal/deploy-kinder.git
cd deploy-kinder/DevOpsHub
```

### 2. Configure environment variables

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and fill in all required values (especially `JWT_SECRET` and `ENCRYPTION_KEY`).

### 3. Build and start with Docker Compose

```bash
# Go back to the DevOpsHub root
cd ..

# Build and start all services
docker compose up -d

# Check that the container is running
docker compose ps

# View logs
docker compose logs -f
```

The API will be available at: **http://localhost:4000**

### 4. Stop the services

```bash
docker compose down
```

---

## Manual Setup (Without Docker)

If you cannot use Docker, follow these steps to run both frontend and backend without containers.

### Backend

```bash
cd DevOpsHub/backend

# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your values

# 3. Set up the database
npx prisma migrate deploy
npx prisma generate

# 4. Build TypeScript
npm run build

# 5. Start the server
npm start
```

### Frontend

```bash
cd DevOpsHub/frontend

# 1. Install dependencies
npm install

# 2. (Optional) Set the backend URL if it's not on localhost
# Create a .env.local file:
echo "VITE_API_URL=http://YOUR_SERVER_IP:4000/api" > .env.local
echo "VITE_WS_URL=http://YOUR_SERVER_IP:4000" >> .env.local

# 3. Build for production
npm run build

# 4. Serve the built files (using any static server)
npm run preview
# OR serve with nginx, apache, etc. pointing to the /dist folder
```

---

## Environment Variables Reference

All environment variables live in `backend/.env`. Copy from `backend/.env.example` and fill in your values.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `4000` | The port the backend server listens on |
| `NODE_ENV` | No | `development` | Set to `production` for production deployments |
| `JWT_SECRET` | **Yes** | — | A long random secret for signing JWT tokens. **Never use a simple value in production.** |
| `ENCRYPTION_KEY` | **Yes** | — | A 32-byte hex-encoded key for AES-256 encryption of stored SSH keys and credentials |
| `DATABASE_URL` | No | `file:./dev.db` | Path to the SQLite database file |
| `FRONTEND_URL` | No | `http://localhost:5173` | The URL of your frontend app. Used for CORS in production. |
| `SMTP_HOST` | No | — | SMTP server hostname (e.g. `smtp.gmail.com`) |
| `SMTP_PORT` | No | `587` | SMTP server port |
| `SMTP_USER` | No | — | SMTP username / email address |
| `SMTP_PASS` | No | — | SMTP password or app-specific password |
| `SMTP_SECURE` | No | `false` | Set to `true` for port 465 (SSL), `false` for 587 (TLS) |

> **SMTP is optional for local development.** If `SMTP_USER` is not set, the app will store OTPs in the database. You can retrieve your OTP using Prisma Studio (`npx prisma studio`) during local testing.

---

## Generating Secrets

Never use weak or guessable values. Run these commands to generate cryptographically secure values:

### Generate JWT_SECRET

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Generate ENCRYPTION_KEY

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste it into your `.env` file.

**Example `.env` after filling in values:**

```env
PORT=4000
NODE_ENV=production
JWT_SECRET=a3f9c2e1d8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2
ENCRYPTION_KEY=7f3a9b2c4d6e8f1a3c5e7b9d2f4a6c8e0b1d3f5a7c9e1b3d5f7a9c1e3b5d7f9
DATABASE_URL="file:./dev.db"
FRONTEND_URL=http://localhost:5173
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_SECURE=false
```

---

## First Login

1. Open the frontend in your browser: **http://localhost:5173**
2. Enter your email address on the login page and click **Send Code**
3. If SMTP is configured, check your email inbox for the 6-digit code
4. If SMTP is **not** configured (local dev), open Prisma Studio to get the code:
   ```bash
   cd DevOpsHub/backend
   npx prisma studio
   ```
   Go to the `OtpVerification` table and read the `code` column.
5. Enter the code and you're logged in.

---

## Troubleshooting

### `Error: JWT_SECRET must be configured`
**Cause:** `JWT_SECRET` is not set in your `.env` file.  
**Fix:** Generate a secret using the command in [Generating Secrets](#generating-secrets) and add it to `.env`.

---

### `Error: Cannot open database file`
**Cause:** The SQLite database file doesn't exist yet.  
**Fix:** Run the migration command:
```bash
npx prisma migrate deploy
```

---

### `Error: SSH Authentication failed`
**Cause:** The SSH private key saved for your server is incorrect, or the server's firewall blocks port 22.  
**Fix:**
- Verify the private key matches the public key on the server
- Check that port 22 is open in your server's firewall / security group
- Make sure the SSH username matches the server user (e.g. `ubuntu` for AWS EC2)

---

### `Port 4000 already in use`
**Cause:** Another process is using port 4000.  
**Fix:** Change the `PORT` value in your `.env` file:
```env
PORT=4001
```

---

### `Docker container keeps restarting`
**Fix:** Check the container logs for the real error:
```bash
docker compose logs backend
```

---

### Reset everything and start fresh

```bash
# Delete the database
rm DevOpsHub/backend/prisma/dev.db

# Re-run migrations
cd DevOpsHub/backend && npx prisma migrate deploy
```

---

## Getting Help

If you run into an issue not listed here, please [open a GitHub Issue](https://github.com/Hardikkhyal/deploy-kinder/issues) with:
- Your OS and Node.js version
- The exact error message
- Which step in this guide you were on
