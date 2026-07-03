export interface ClassifiedError {
  reason: string;
  possibleCauses: string;
  suggestedFix: string;
  canRetry: boolean;
}

export class ErrorClassifier {
  public static classify(rawError: string): ClassifiedError {
    const errorText = rawError.toLowerCase();

    // 1. SSH Authentication
    if (
      errorText.includes('authentication failed') ||
      errorText.includes('permission denied (publickey)') ||
      errorText.includes('unauthorized') ||
      errorText.includes('all configured authentication methods failed')
    ) {
      return {
        reason: 'SSH Authentication Failed',
        possibleCauses: '1. Wrong SSH Username configured\n2. Incorrect Private PEM Key\n3. Private key lacks necessary target permissions',
        suggestedFix: 'Verify target server configuration. Make sure you use "ubuntu" for Ubuntu instances, "ec2-user" for Amazon Linux, and copy-paste the correct, decrypted SSH private key.',
        canRetry: false,
      };
    }

    // 2. SSH Connection Refused / Host Not Found
    if (
      errorText.includes('econnrefused') ||
      errorText.includes('getaddrinfo enotfound') ||
      errorText.includes('ehostunreach')
    ) {
      return {
        reason: 'SSH Connection Refused / Host Not Found',
        possibleCauses: '1. Incorrect IP Address or Hostname\n2. Target server is offline\n3. Target port 22 is blocked by AWS Security Group or firewall',
        suggestedFix: 'Verify target server IP address and make sure Port 22 is open to the public (0.0.0.0/0) in your AWS Security Group. Check if the server is online.',
        canRetry: true,
      };
    }

    // 3. SSH Connection Timeout
    if (
      errorText.includes('etimedout') ||
      errorText.includes('handshake timeout') ||
      errorText.includes('connection timeout') ||
      errorText.includes('timed out')
    ) {
      return {
        reason: 'SSH Connection Timeout',
        possibleCauses: '1. High network latency\n2. Server firewall dropping packets\n3. Slow Reverse DNS lookups (UseDNS)',
        suggestedFix: 'Retry deployment. Check if your target instance is overwhelmed, check network connectivity, or try later.',
        canRetry: true,
      };
    }

    // 4. Git Authentication / Private Repo
    if (
      errorText.includes('repository is private') ||
      errorText.includes('check repository permission') ||
      errorText.includes('terminal prompts disabled') ||
      errorText.includes('authentication failed for') ||
      errorText.includes('could not read from remote repository')
    ) {
      return {
        reason: 'Git Authentication Failed / Private Repository',
        possibleCauses: '1. Git repository is private\n2. Invalid or missing GitHub Access Token\n3. Wrong repository URL',
        suggestedFix: 'Connect your GitHub Access Token in the Integrations tab before deploying private repositories. Make sure the repository URL is correct.',
        canRetry: false,
      };
    }

    // 5. Git Branch missing
    if (
      errorText.includes('verify the branch exists') ||
      errorText.includes('failed to reset to branch') ||
      errorText.includes('did not match any file(s) known to git') ||
      errorText.includes('could not find branch')
    ) {
      return {
        reason: 'Git Branch Not Found',
        possibleCauses: '1. The specified branch does not exist in the repository\n2. The branch has not been pushed to GitHub yet',
        suggestedFix: 'Double-check your branch name (e.g. "main", "master", "dev") in project settings.',
        canRetry: false,
      };
    }

    // 6. Docker Daemon Stopped
    if (
      errorText.includes('docker daemon is not running') ||
      errorText.includes('cannot connect to the docker daemon') ||
      errorText.includes('docker.sock')
    ) {
      return {
        reason: 'Docker Daemon Stopped',
        possibleCauses: '1. Docker service is not active on target server\n2. Docker crashed due to memory exhaustion',
        suggestedFix: 'SSH into the server and run "sudo systemctl start docker" or wait for the self-healing worker to initialize it.',
        canRetry: true,
      };
    }

    // 7. Docker Disk Full
    if (
      errorText.includes('no space left on device') ||
      errorText.includes('disk full') ||
      errorText.includes('out of space')
    ) {
      return {
        reason: 'Target Disk Full',
        possibleCauses: '1. Server has too many orphaned images, volumes, and containers\n2. Low disk storage on small EC2 instance',
        suggestedFix: 'Clean up unused images on the server or run a prune. DevOpsHub will automatically attempt a "docker system prune -f" self-healing recovery and retry.',
        canRetry: true,
      };
    }

    // 8. Docker Build Failure
    if (
      errorText.includes('exited with code 1') ||
      errorText.includes('build failed') ||
      errorText.includes('returned a non-zero code') ||
      errorText.includes('npm run build') ||
      errorText.includes('error during build')
    ) {
      return {
        reason: 'Docker Image Build Failed',
        possibleCauses: '1. Code syntax or compilation error\n2. Missing NPM dependency or file\n3. failing build scripts',
        suggestedFix: 'Check compile errors in the Build Image logs. Verify npm run build succeeds locally, and make sure all modules are declared in package.json.',
        canRetry: false,
      };
    }

    // 9. Container Crash
    if (
      errorText.includes('container failed to start') ||
      errorText.includes('crashed immediately after launch') ||
      errorText.includes('container is not running') ||
      errorText.includes('status code 137')
    ) {
      return {
        reason: 'Application Container Crashed',
        possibleCauses: '1. Missing environment variables\n2. Application runtime exception (e.g., database connection failure on startup)\n3. Wrong launch command in CMD',
        suggestedFix: 'Verify your application\'s startup logs. Ensure that required environment variables are set and the application starts correctly without crashing.',
        canRetry: false,
      };
    }

    // 10. Port Connection Refused
    if (
      errorText.includes('port is not accepting connections') ||
      errorText.includes('not accepting connections') ||
      errorText.includes('never responded on port')
    ) {
      return {
        reason: 'Application Listening Port Mismatch',
        possibleCauses: '1. Application inside the container is configured to listen on a different port than the one mapped\n2. Application crashed right after TCP socket binding',
        suggestedFix: 'Make sure your application inside the container binds to the correct port (8080 for node, 80 for static nginx, or host mapped port) or double-check server listener configurations.',
        canRetry: false,
      };
    }

    // Default Fallback
    return {
      reason: 'Unknown Deployment Failure',
      possibleCauses: '1. Unexpected script exit\n2. Resource exhaustion or system process interruption',
      suggestedFix: 'Inspect the detailed deployment logs for the failed stage to identify the root cause.',
      canRetry: true,
    };
  }
}
