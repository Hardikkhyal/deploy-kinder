# Task 7: REST API Design

The backend uses a standard RESTful architecture. All requests (except login) require an `Authorization: Bearer <JWT>` header.

---

## 1. Authentication Endpoints

### `POST /api/auth/login`
* **Purpose:** Authenticate admin user and generate JWT.
* **Authentication:** None.
* **Request Body:**
  ```json
  {
    "email": "admin@devopshub.local",
    "password": "securepassword123"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1...",
    "user": { "id": "123", "username": "admin" }
  }
  ```
* **Errors:** `401 Unauthorized` (Invalid credentials).

---

## 2. Project Endpoints

### `GET /api/projects`
* **Purpose:** List all configured projects.
* **Authentication:** Required.
* **Response (200 OK):**
  ```json
  [
    {
      "id": "uuid",
      "name": "portfolio-frontend",
      "repo_url": "https://github.com/user/repo",
      "branch": "main",
      "status": "online"
    }
  ]
  ```

### `POST /api/projects`
* **Purpose:** Create a new project.
* **Authentication:** Required.
* **Request Body:**
  ```json
  {
    "name": "ecommerce-api",
    "repo_url": "https://github.com/user/ecommerce.git",
    "branch": "main"
  }
  ```
* **Validation:** Valid URL format, Unique Name.
* **Response (201 Created):** Returns created project object.

---

## 3. Deployment Endpoints

### `POST /api/projects/:id/deploy`
* **Purpose:** Trigger a new deployment (git pull + docker build).
* **Authentication:** Required.
* **Response (202 Accepted):** (Process runs in background).
  ```json
  {
    "message": "Deployment started",
    "deploymentId": "uuid"
  }
  ```

### `GET /api/projects/:id/deployments`
* **Purpose:** Get history of deployments for a project.
* **Authentication:** Required.
* **Response (200 OK):**
  ```json
  [
    {
      "id": "uuid",
      "commit_id": "8a7b6c5",
      "status": "SUCCESS",
      "started_at": "2024-05-20T10:00:00Z"
    }
  ]
  ```

### `GET /api/deployments/:deploymentId/logs`
* **Purpose:** Retrieve the build logs for a specific deployment.
* **Authentication:** Required.
* **Response (200 OK):**
  ```json
  {
    "logs": "Step 1/5: FROM node:18\nStep 2/5: WORKDIR /app\n..."
  }
  ```

---

## 4. Docker Container Endpoints

### `GET /api/containers`
* **Purpose:** List all running Docker containers on the host.
* **Authentication:** Required.
* **Response (200 OK):**
  ```json
  [
    {
      "id": "abc123def456",
      "name": "ecommerce-api-web",
      "state": "running",
      "status": "Up 2 hours"
    }
  ]
  ```

### `POST /api/containers/:containerId/action`
* **Purpose:** Start, Stop, or Restart a container.
* **Authentication:** Required.
* **Request Body:**
  ```json
  {
    "action": "restart" // ENUM: start, stop, restart
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "message": "Container restarted successfully."
  }
  ```

---

## 5. Standard Error Format
All 4xx and 5xx responses will follow this structure:
```json
{
  "error": "Not Found",
  "message": "Project with ID uuid does not exist."
}
```
