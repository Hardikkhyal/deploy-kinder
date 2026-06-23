# Task 15: Interview Preparation Questions

When presenting DevOpsHub in an interview, hiring managers will grill you on the architecture. Here are the questions you must be prepared to answer.

---

### Q1: How did you allow a Node.js API to run Docker commands? (Docker)
**Ideal Answer:** 
"I didn't use `child_process.exec('docker build')` because that's insecure and hard to track. Instead, I mounted the host machine's `/var/run/docker.sock` into the backend container. I used the `dockerode` library to interact directly with the Docker Daemon via its REST API. This gave me precise control over container states and allowed me to safely stream build logs back to the client using EventEmitters."

### Q2: What happens if a user deploys a malicious app that tries to read your server files? (Security)
**Ideal Answer:**
"I implemented strict container isolation. User applications are placed on a separate Docker Bridge Network and cannot communicate with the DevOpsHub core network. Furthermore, containers are run as non-root users where possible, and I use the `--security-opt=no-new-privileges` flag to prevent privilege escalation."

### Q3: How do you handle routing? If I deploy 'App A' and 'App B', how does traffic know where to go? (Networking/Linux)
**Ideal Answer:**
"I use Nginx as a reverse proxy on the host machine. When a deployment succeeds, the Node.js backend dynamically writes an Nginx configuration file mapping a subdomain (e.g., `appa.domain.com`) to the specific port that Docker mapped for that container. The backend then issues a `systemctl reload nginx` command to apply the changes without dropping existing traffic."

### Q4: Why did you choose PostgreSQL over MongoDB for this project? (Database)
**Ideal Answer:**
"A deployment platform is highly relational. A `Deployment` belongs to a `Project`, which belongs to a `User`. Tracking state changes (Pending -> Building -> Success) and maintaining ACID compliance is critical so we don't end up with phantom deployments. PostgreSQL handles these relations perfectly, whereas MongoDB's document structure would require manual data synchronization."

### Q5: How did you provision the AWS server? Did you click through the console? (Terraform/AWS)
**Ideal Answer:**
"No, I used Infrastructure as Code. I wrote Terraform scripts to define the VPC, Subnets, Security Groups, and the EC2 instance itself. This makes the infrastructure reproducible. If the server is destroyed, I can run `terraform apply` and have the entire environment back up in minutes."

### Q6: If your EC2 instance only has 1GB of RAM, how do you prevent it from crashing during a heavy `docker build`? (Architecture/Linux)
**Ideal Answer:**
"This was a major challenge. 1GB of RAM is often not enough for Webpack or Vite builds. I solved this by configuring a 2GB Swap file on the Ubuntu OS using Ansible during the provisioning phase. While swap is slower because it uses disk I/O, it prevents the Linux Out-Of-Memory (OOM) killer from terminating the build process."

### Q7: Explain your CI/CD pipeline. How is DevOpsHub deployed? (CI/CD / GitHub Actions)
**Ideal Answer:**
"I use GitHub Actions. On every push to the main branch, a workflow triggers. It runs ESLint and Jest tests. If they pass, it builds the Docker image and pushes it to Docker Hub. Finally, the action SSHes into the EC2 instance and runs `docker-compose pull && docker-compose up -d` to achieve zero-downtime deployment."
