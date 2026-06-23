# Task 14: Testing Strategy

To ensure DevOpsHub is stable and does not break the host server, testing occurs at multiple layers.

---

## 1. Unit Testing
- **Tool:** Jest.
- **Scope:** Pure JavaScript functions (Utils, formatters).
- **Example:** Testing that the function generating the Nginx configuration string outputs the correct syntax.
  ```javascript
  test('generates valid nginx config', () => {
    const config = generateNginxConf('test-app', 8080);
    expect(config).toContain('proxy_pass http://localhost:8080;');
  });
  ```

## 2. Integration Testing & API Testing
- **Tool:** Supertest + Jest.
- **Scope:** Express endpoints and Database interactions.
- **Example:** Hitting `POST /api/projects` with fake data and verifying a `201 Created` status and a new row in the test PostgreSQL database.

## 3. Docker Testing (Crucial)
Because our app controls Docker, we must test it without destroying the host.
- **Strategy:** During tests, use `docker-in-docker` (dind) or mock the `dockerode` library using `jest.mock('dockerode')`.
- **Validation:** Ensure that triggering a deployment creates exactly one container and one network, leaving no dangling images.

## 4. Deployment Testing (E2E)
- **Tool:** Cypress or Playwright.
- **Scope:** Simulating a user clicking through the React UI.
- **Flow:**
  1. Login.
  2. Click "New Project".
  3. Enter `https://github.com/bradtraversy/node_api_design.git`.
  4. Click Deploy.
  5. Wait for the status to change from "BUILDING" to "SUCCESS".
  6. Assert that the log terminal contains "Server running on port...".

## 5. Performance & Load Testing
- **Tool:** Artillery or K6.
- **Scope:** Ensuring the backend doesn't crash if 10 deployments are triggered simultaneously.
- **Constraint:** Since we use an AWS `t2.micro`, we must ensure our API rate limits (`express-rate-limit`) block abusive requests before the server runs out of RAM.

## 6. Security Testing
- **Tool:** SonarQube (Static Analysis), OWASP ZAP (Dynamic Analysis).
- **Scope:** 
  - Scan dependencies for vulnerabilities (`npm audit`).
  - Attempt SQL Injection in the login form.
  - Attempt to pass malicious shell commands via the GitHub URL input (e.g., `https://github.com/repo.git; rm -rf /`). 
  - *Validation:* Ensure `exec()` strictly sanitizes inputs and does not execute the `rm -rf`.
