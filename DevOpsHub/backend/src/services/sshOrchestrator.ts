import { Client } from 'ssh2';
import { Logger } from '../utils/logger';
import { ErrorClassifier, ClassifiedError } from '../utils/errorClassifier';

export interface SshConfig {
  host: string;
  username: string;
  privateKey: string;
}

export class SshOrchestrator {
  private static runCommandOnClient(
    conn: Client,
    command: string,
    onLogLine: (line: string) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      conn.exec(command, (err, stream) => {
        if (err) return reject(err);

        stream.on('close', (code: any) => {
          if (code !== 0 && code !== undefined && code !== null) {
            reject(new Error(`Command exited with code ${code}`));
          } else {
            resolve();
          }
        });

        stream.on('data', (data: Buffer) => {
          const lines = data.toString('utf8').split('\n');
          lines.forEach((line) => {
            if (line.trim()) onLogLine(line);
          });
        });

        stream.stderr.on('data', (data: Buffer) => {
          const lines = data.toString('utf8').split('\n');
          lines.forEach((line) => {
            if (line.trim()) onLogLine(`[STDERR] ${line}`);
          });
        });
      });
    });
  }

  private static connectSsh(config: SshConfig, maxRetries = 3): Promise<Client> {
    let attempt = 0;
    let host = config.host;
    let port = 22;

    if (host.includes(':')) {
      const parts = host.split(':');
      host = parts[0];
      const parsedPort = parseInt(parts[1], 10);
      if (!isNaN(parsedPort)) {
        port = parsedPort;
      }
    }

    const tryConnect = (): Promise<Client> => {
      attempt++;
      return new Promise((resolve, reject) => {
        const conn = new Client();
        conn
          .on('ready', () => {
            Logger.info(`SSH Connection established to ${host}:${port} on attempt ${attempt}`);
            resolve(conn);
          })
          .on('error', async (err) => {
            conn.end();
            const classified = ErrorClassifier.classify(err.message);
            if (classified.canRetry && attempt < maxRetries) {
              const backoff = attempt * 2000;
              Logger.warn(`SSH connection attempt ${attempt} failed: ${err.message}. Retrying in ${backoff}ms...`);
              await new Promise((r) => setTimeout(r, backoff));
              tryConnect().then(resolve).catch(reject);
            } else {
              reject(err);
            }
          })
          .connect({
            host: host,
            port: port,
            username: config.username,
            privateKey: config.privateKey,
            readyTimeout: 30000,
            keepaliveInterval: 10000,
            keepaliveCountMax: 10,
          });
      });
    };

    return tryConnect();
  }

  public static async provisionAndDeploy(
    config: SshConfig,
    projectId: string,
    repoUrl: string,
    branch: string,
    appPort: number,
    githubToken: string | undefined,
    onLogLine: (stage: string, line: string) => void,
    onStageUpdate: (stage: string, status: string, errorObj?: ClassifiedError & { rawError?: string }) => Promise<void>
  ): Promise<void> {
    let conn: Client | null = null;

    // 1. Stage: Validating Configuration
    await onStageUpdate('Validating Configuration', 'RUNNING');
    try {
      onLogLine('Validating Configuration', '[SYSTEM] Validating project inputs and git configurations...');
      const gitUrlRegex = /^https:\/\/[a-zA-Z0-9\.\-_@\:]+\/[a-zA-Z0-9\.\-_]+\/[a-zA-Z0-9\.\-_]+(?:\.git)?\/?$/;
      if (!gitUrlRegex.test(repoUrl)) {
        throw new Error(`Invalid Git repository URL format: ${repoUrl}`);
      }
      const branchRegex = /^[a-zA-Z0-9_\-\/\.]+$/;
      if (!branchRegex.test(branch)) {
        throw new Error(`Invalid branch name format: ${branch}`);
      }
      if (!config.privateKey || config.privateKey.trim().length === 0) {
        throw new Error('SSH private key is missing or corrupted.');
      }
      onLogLine('Validating Configuration', '[SYSTEM] Input parameters validated successfully.');
      await onStageUpdate('Validating Configuration', 'SUCCESS');
    } catch (err: any) {
      const errorObj = ErrorClassifier.classify(err.message || String(err));
      await onStageUpdate('Validating Configuration', 'FAILED', { ...errorObj, rawError: err.message });
      throw err;
    }

    // 2. Stage: SSH Authentication
    await onStageUpdate('SSH Authentication', 'RUNNING');
    try {
      onLogLine('SSH Authentication', `[SYSTEM] Connecting to target host ${config.host} using SSH...`);
      conn = await this.connectSsh(config, 3);
      onLogLine('SSH Authentication', '[SYSTEM] SSH Handshake and Authentication completed successfully.');
      await onStageUpdate('SSH Authentication', 'SUCCESS');
    } catch (err: any) {
      const errorObj = ErrorClassifier.classify(err.message || String(err));
      await onStageUpdate('SSH Authentication', 'FAILED', { ...errorObj, rawError: err.message });
      throw err;
    }

    // 3. Stage: Checking Server Environment
    await onStageUpdate('Checking Server Environment', 'RUNNING');
    try {
      onLogLine('Checking Server Environment', '[SYSTEM] Running target server optimization check...');
      
      // SSH reverse DNS optimization
      const optimizeCmd = `if grep -q "^UseDNS" /etc/ssh/sshd_config; then sudo sed -i 's/^UseDNS.*/UseDNS no/' /etc/ssh/sshd_config; else echo "UseDNS no" | sudo tee -a /etc/ssh/sshd_config > /dev/null; fi && (sudo systemctl reload ssh &>/dev/null || sudo systemctl restart ssh &>/dev/null || true)`;
      await this.runCommandOnClient(conn, optimizeCmd, (line) => onLogLine('Checking Server Environment', line)).catch(() => {});

      // Git install check
      onLogLine('Checking Server Environment', '[SYSTEM] Checking Git installation...');
      const checkGitCmd = `if ! command -v git &> /dev/null; then echo "[SYSTEM] Git missing. Installing..."; sudo apt-get update && sudo apt-get install -y git; else echo "[SYSTEM] Git is installed."; fi`;
      await this.runCommandOnClient(conn, checkGitCmd, (line) => onLogLine('Checking Server Environment', line));

      // Docker engine install check
      onLogLine('Checking Server Environment', '[SYSTEM] Checking Docker Engine...');
      const checkDockerCmd = `if ! command -v docker &> /dev/null; then echo "[SYSTEM] Docker Engine missing. Installing..."; sudo apt-get update && sudo apt-get install -y docker.io && sudo systemctl start docker && sudo systemctl enable docker && sudo usermod -aG docker ${config.username} || true; else echo "[SYSTEM] Docker is installed."; fi`;
      await this.runCommandOnClient(conn, checkDockerCmd, (line) => onLogLine('Checking Server Environment', line));

      // Docker Compose V2 check
      onLogLine('Checking Server Environment', '[SYSTEM] Checking Docker Compose plugin...');
      const checkComposeCmd = `mkdir -p ~/.docker/cli-plugins && if ! docker compose version &> /dev/null; then echo "[SYSTEM] Docker Compose V2 plugin missing. Downloading CLI plugin..."; curl -SL "https://github.com/docker/compose/releases/download/v2.26.0/docker-compose-linux-x86_64" -o ~/.docker/cli-plugins/docker-compose && chmod +x ~/.docker/cli-plugins/docker-compose; else echo "[SYSTEM] Docker Compose plugin is active."; fi`;
      await this.runCommandOnClient(conn, checkComposeCmd, (line) => onLogLine('Checking Server Environment', line));

      // Disk space pre-check (requires 500MB free)
      onLogLine('Checking Server Environment', '[SYSTEM] Checking server available disk space...');
      const diskCheckCmd = `FREE_KB=$(df -k / | awk 'NR==2 {print $4}'); if [ "$FREE_KB" -lt 500000 ]; then echo "Disk space too low: $((FREE_KB/1024))MB remaining"; exit 2; else echo "Available disk space: $((FREE_KB/1024))MB"; fi`;
      await this.runCommandOnClient(conn, diskCheckCmd, (line) => onLogLine('Checking Server Environment', line));

      // Port collision release (self-healing)
      onLogLine('Checking Server Environment', `[SYSTEM] Verifying port ${appPort} availability...`);
      const portConflictCmd = `CONFLICT_CONTAINERS=$(docker ps -a -q --filter publish=${appPort}); if [ -n "$CONFLICT_CONTAINERS" ]; then echo "[SELF-HEALING] Port ${appPort} is occupied. Stopping and removing conflicting container(s)..."; docker stop $CONFLICT_CONTAINERS || true; docker rm $CONFLICT_CONTAINERS || true; else echo "[SYSTEM] Port is free."; fi`;
      await this.runCommandOnClient(conn, portConflictCmd, (line) => onLogLine('Checking Server Environment', line));

      await onStageUpdate('Checking Server Environment', 'SUCCESS');
    } catch (err: any) {
      const errorObj = ErrorClassifier.classify(err.message || String(err));
      await onStageUpdate('Checking Server Environment', 'FAILED', { ...errorObj, rawError: err.message });
      if (conn) conn.end();
      throw err;
    }

    // 4. Stage: Preparing Workspace
    await onStageUpdate('Preparing Workspace', 'RUNNING');
    try {
      onLogLine('Preparing Workspace', `[SYSTEM] Creating workspace directory ~/deployments/${projectId}...`);
      await this.runCommandOnClient(conn, `mkdir -p ~/deployments/${projectId}`, (line) => onLogLine('Preparing Workspace', line));
      await onStageUpdate('Preparing Workspace', 'SUCCESS');
    } catch (err: any) {
      const errorObj = ErrorClassifier.classify(err.message || String(err));
      await onStageUpdate('Preparing Workspace', 'FAILED', { ...errorObj, rawError: err.message });
      if (conn) conn.end();
      throw err;
    }

    // 5. Stage: Cloning Repository
    await onStageUpdate('Cloning Repository', 'RUNNING');
    let authenticatedRepoUrl = repoUrl;
    if (githubToken && repoUrl.startsWith('https://github.com/')) {
      authenticatedRepoUrl = repoUrl.replace('https://github.com/', `https://${githubToken}@github.com/`);
    }

    const runCloneSequence = async (useFreshClone = false): Promise<void> => {
      if (useFreshClone) {
        onLogLine('Cloning Repository', '[SELF-HEALING] Retrying with a clean workspace clone...');
        await this.runCommandOnClient(conn!, `rm -rf ~/deployments/${projectId} && mkdir -p ~/deployments/${projectId}`, (line) => onLogLine('Cloning Repository', line));
      }

      const gitScript = `
        cd ~/deployments/${projectId}
        if [ -d ".git" ]; then
          echo "[SYSTEM] Repository workspace already exists. Fetching updates..."
          git fetch origin || exit 11
          git reset --hard origin/${branch} || exit 12
        else
          echo "[SYSTEM] Cloning fresh repository branch: ${branch}..."
          git clone -b ${branch} ${authenticatedRepoUrl} . || exit 13
        fi
      `;
      await this.runCommandOnClient(conn!, gitScript, (line) => onLogLine('Cloning Repository', line));
    };

    try {
      await runCloneSequence(false);
      await onStageUpdate('Cloning Repository', 'SUCCESS');
    } catch (err: any) {
      // Self-healing: if fetch/reset or clone fails, clear the directory and try a fresh clone
      onLogLine('Cloning Repository', `[SYSTEM] Git operation encountered error: ${err.message}. Triggering self-healing...`);
      try {
        await runCloneSequence(true);
        await onStageUpdate('Cloning Repository', 'SUCCESS');
      } catch (retryErr: any) {
        // Map exits to clean errors
        let errorMsg = retryErr.message;
        if (errorMsg.includes('code 11') || errorMsg.includes('code 13')) {
          errorMsg = 'Check repository permission or access token. Repository is private or requires authorization.';
        } else if (errorMsg.includes('code 12')) {
          errorMsg = `Failed to reset to branch ${branch}. Verify the branch exists on remote.`;
        }
        const errorObj = ErrorClassifier.classify(errorMsg);
        await onStageUpdate('Cloning Repository', 'FAILED', { ...errorObj, rawError: errorMsg });
        if (conn) conn.end();
        throw new Error(errorMsg);
      }
    }

    // 6. Stage: Detecting Framework
    await onStageUpdate('Detecting Framework', 'RUNNING');
    try {
      onLogLine('Detecting Framework', '[SYSTEM] Analysing workspace files for framework detection...');
      const detectScript = `
        cd ~/deployments/${projectId}
        if [ -f "docker-compose.yml" ] || [ -f "compose.yml" ]; then
          echo "[SYSTEM] Found docker-compose config. Skipping generation."
        elif [ -f "index.html" ]; then
          echo "[SYSTEM] Detected static website. Generating Dockerfile and docker-compose.yml..."
          cat << 'EOF' > Dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
EOF
          cat << EOF > docker-compose.yml
version: '3'
services:
  web:
    build: .
    ports:
      - "${appPort}:80"
EOF
        elif [ -f "package.json" ]; then
          echo "[SYSTEM] Detected Node.js app. Generating Dockerfile and docker-compose.yml..."
          cat << 'EOF' > Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production || npm install
COPY . .
EXPOSE 8080
CMD ["npm", "start"]
EOF
          cat << EOF > docker-compose.yml
version: '3'
services:
  web:
    build: .
    ports:
      - "${appPort}:8080"
EOF
        else
          echo "[SYSTEM] Unknown framework. Generating landing page fallback..."
          echo "<h1>DevOpsHub Automated Deployment</h1><p>Your repository was successfully cloned and deployed but no launch configuration was found in the project root.</p>" > index.html
          cat << 'EOF' > Dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
EOF
          cat << EOF > docker-compose.yml
version: '3'
services:
  web:
    build: .
    ports:
      - "${appPort}:80"
EOF
        fi
      `;
      await this.runCommandOnClient(conn, detectScript, (line) => onLogLine('Detecting Framework', line));
      await onStageUpdate('Detecting Framework', 'SUCCESS');
    } catch (err: any) {
      const errorObj = ErrorClassifier.classify(err.message || String(err));
      await onStageUpdate('Detecting Framework', 'FAILED', { ...errorObj, rawError: err.message });
      if (conn) conn.end();
      throw err;
    }

    // 7. Stage: Building Docker Image
    await onStageUpdate('Building Docker Image', 'RUNNING');
    const runBuildSequence = async (): Promise<void> => {
      const buildScript = `
        cd ~/deployments/${projectId}
        if docker compose version &> /dev/null; then
          docker compose build
        else
          docker-compose build
        fi
      `;
      await this.runCommandOnClient(conn!, buildScript, (line) => onLogLine('Building Docker Image', line));
    };

    try {
      await runBuildSequence();
      await onStageUpdate('Building Docker Image', 'SUCCESS');
    } catch (err: any) {
      // Self-healing: if disk is full or cache is corrupt, run system prune and rebuild
      const classified = ErrorClassifier.classify(err.message || String(err));
      if (classified.reason === 'Target Disk Full') {
        onLogLine('Building Docker Image', '[SELF-HEALING] Disk is full. Running docker system prune...');
        try {
          await this.runCommandOnClient(conn, 'docker system prune -af --volumes', (line) => onLogLine('Building Docker Image', line));
          await runBuildSequence();
          await onStageUpdate('Building Docker Image', 'SUCCESS');
          return;
        } catch (retryErr: any) {
          // Fall through
        }
      }
      
      const errorObj = ErrorClassifier.classify(err.message || String(err));
      await onStageUpdate('Building Docker Image', 'FAILED', { ...errorObj, rawError: err.message });
      if (conn) conn.end();
      throw err;
    }

    // 8. Stage: Starting Container
    await onStageUpdate('Starting Container', 'RUNNING');
    const runStartSequence = async (): Promise<void> => {
      const startScript = `
        cd ~/deployments/${projectId}
        if docker compose version &> /dev/null; then
          docker compose up -d
        else
          docker-compose up -d
        fi
      `;
      await this.runCommandOnClient(conn!, startScript, (line) => onLogLine('Starting Container', line));
    };

    try {
      await runStartSequence();
      await onStageUpdate('Starting Container', 'SUCCESS');
    } catch (err: any) {
      // Self-healing: Prune networks/orphans on compose start failure
      onLogLine('Starting Container', `[SYSTEM] Launch failed: ${err.message}. Running docker network prune...`);
      try {
        await this.runCommandOnClient(conn, 'docker network prune -f', (line) => onLogLine('Starting Container', line));
        await runStartSequence();
        await onStageUpdate('Starting Container', 'SUCCESS');
      } catch (retryErr: any) {
        const errorObj = ErrorClassifier.classify(retryErr.message || String(retryErr));
        await onStageUpdate('Starting Container', 'FAILED', { ...errorObj, rawError: retryErr.message });
        if (conn) conn.end();
        throw retryErr;
      }
    }

    // 9. Stage: Health Check
    await onStageUpdate('Health Check', 'RUNNING');
    try {
      onLogLine('Health Check', '[SYSTEM] Verification sequence initiated. Waiting 5 seconds...');
      
      const healthCheckScript = `
        sleep 5
        echo "[SYSTEM] Checking container running state..."
        if ! docker ps --filter publish=${appPort} --format "{{.Status}}" | grep -q "Up"; then
          echo "[SYSTEM ERROR] Container failed to start or crashed immediately after launch."
          exit 101
        fi
        
        echo "[SYSTEM] Verifying port ${appPort} listener connection..."
        if ! (timeout 5 bash -c "cat < /dev/null > /dev/tcp/127.0.0.1/${appPort}" &>/dev/null || curl -s -I http://localhost:${appPort} &>/dev/null || wget -q --spider http://localhost:${appPort} &>/dev/null); then
          echo "[SYSTEM ERROR] Port ${appPort} is not accepting connections. Your app inside the container might be listening on a different port or crashed."
          exit 102
        fi
      `;
      
      await this.runCommandOnClient(conn, healthCheckScript, (line) => onLogLine('Health Check', line));
      onLogLine('Health Check', '[SYSTEM] Health check successfully completed! Site is online.');
      await onStageUpdate('Health Check', 'SUCCESS');
    } catch (err: any) {
      // If health check fails, retrieve container logs to help diagnose
      let detailMsg = err.message;
      if (detailMsg.includes('code 101')) {
        detailMsg = 'Container failed to start or crashed immediately after launch.';
      } else if (detailMsg.includes('code 102')) {
        detailMsg = `Port ${appPort} is not accepting connections. Your app inside the container might be listening on a different port or crashed.`;
      }
      
      onLogLine('Health Check', '[SYSTEM ERROR] Health check failed. Retrieving container crash logs...');
      const fetchLogsScript = `
        cd ~/deployments/${projectId}
        if docker compose version &> /dev/null; then
          docker compose logs --tail=50 || true
        else
          docker-compose logs --tail=50 || true
        fi
      `;
      await this.runCommandOnClient(conn, fetchLogsScript, (line) => onLogLine('Health Check', `[CONTAINER LOG] ${line}`)).catch(() => {});

      const errorObj = ErrorClassifier.classify(detailMsg);
      await onStageUpdate('Health Check', 'FAILED', { ...errorObj, rawError: detailMsg });
      if (conn) conn.end();
      throw new Error(detailMsg);
    }

    if (conn) {
      conn.end();
    }
  }

  public static async stopDeployment(config: SshConfig, projectId: string): Promise<void> {
    const stopCommands = [
      `cd ~/deployments/${projectId} || exit 0`,
      `if docker compose version &> /dev/null; then`,
      `  docker compose down || true`,
      `else`,
      `  docker-compose down || true`,
      `fi`
    ];
    const conn = await this.connectSsh(config, 1).catch(() => null);
    if (!conn) return;
    await this.runCommandOnClient(conn, stopCommands.join('\n'), () => {}).catch(() => {});
    conn.end();
  }
}
