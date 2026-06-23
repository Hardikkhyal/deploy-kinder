# Deployment Guide (Production)

This guide details how to deploy DevOpsHub itself onto an AWS EC2 instance.

## Prerequisites
- An AWS Account.
- AWS CLI installed and configured locally.
- Terraform installed locally.

---

## 1. Provision Infrastructure with Terraform
Navigate to the `infrastructure/terraform` folder.

```bash
cd infrastructure/terraform
terraform init
terraform plan
terraform apply -auto-approve
```
*Note the outputted Public IP address of your new EC2 instance.*

## 2. Configure the Server with Ansible
Navigate to the `infrastructure/ansible` folder. Update your `hosts.ini` file with the EC2 Public IP.

```bash
cd ../ansible
ansible-playbook -i hosts.ini playbook.yml
```
This playbook installs Docker, Docker Compose, Nginx, and configures a 2GB Swap file.

## 3. Deploy DevOpsHub via Docker Compose
SSH into your server:
```bash
ssh -i your-key.pem ubuntu@<EC2_PUBLIC_IP>
```

Clone the repository and spin up the production stack:
```bash
git clone https://github.com/yourusername/devopshub.git /opt/devopshub
cd /opt/devopshub
```

Create the production `.env` file securely, then start the platform:
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

## 4. Map Your Domain
Point your domain's A-Record (e.g., `hub.yourdomain.com`) to the EC2 Public IP. DevOpsHub is now live!
