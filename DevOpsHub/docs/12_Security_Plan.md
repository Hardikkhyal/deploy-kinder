# Task 12: Security Planning & Best Practices

Because DevOpsHub interacts directly with the Linux shell and the Docker Daemon, security is the highest priority. A compromised backend grants the attacker root access to the host server.

---

## 1. Authentication & Authorization
- **JWT (JSON Web Tokens):** Used for session management. Tokens have a short expiration (1 hour) and require re-authentication.
- **Password Hashing:** Passwords are NEVER stored in plaintext. `bcrypt` with a minimum salt rounds of 10 is used before writing to PostgreSQL.
- **Single Admin Principle:** For the MVP, registration is disabled after the first admin account is created. No public sign-ups are allowed.

## 2. Server & Network Security (AWS)
- **Security Groups:** AWS firewalls are configured so only the Load Balancer/Nginx is accessible from the internet (Ports 80/443).
- **SSH Access:** Port 22 is strictly limited to the Administrator's IP address. SSH password authentication is disabled; only RSA/ED25519 key pairs are allowed.
- **HTTPS/SSL:** All traffic is encrypted using Let's Encrypt certificates managed by Nginx or Certbot.

## 3. Application Security (OWASP Top 10)
- **SQL Injection:** Completely prevented by using Prisma ORM, which automatically parameterizes all SQL queries.
- **XSS (Cross-Site Scripting):** React inherently sanitizes variables before rendering them to the DOM.
- **CSRF (Cross-Site Request Forgery):** If using cookies for JWT, we will implement `SameSite=Strict` and anti-CSRF tokens. Alternatively, storing JWT in memory/local storage with strict Authorization headers mitigates basic CSRF.
- **Rate Limiting:** Implemented via `express-rate-limit` to prevent brute-force attacks on the `/api/auth/login` endpoint (e.g., max 5 requests per 15 minutes).

## 4. Docker Security (CRITICAL)
- **The Docker Socket:** Exposing `/var/run/docker.sock` to a container gives that container root access to the host.
  - *Mitigation:* The backend container mounts the socket read-write, but the backend application code meticulously sanitizes all inputs before passing them to the `dockerode` library.
- **Container Isolation:** User applications are deployed on a separate Docker network (`user-apps-network`) from the core platform (`devopshub-network`). User apps cannot communicate directly with the PostgreSQL database holding DevOpsHub data.
- **Privilege Escalation:** User applications are started with the `--security-opt=no-new-privileges` flag to prevent them from acquiring new root permissions.

## 5. Secrets Management
- No API keys, JWT secrets, or database passwords will be hardcoded in the source code.
- All secrets are injected via a `.env` file on the host server.
- The `.env` file is excluded from version control via `.gitignore`.
- In CI/CD, secrets are securely managed inside **GitHub Actions Secrets**.
