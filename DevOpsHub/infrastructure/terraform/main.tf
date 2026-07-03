terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# AWS credentials are loaded from environment variables or ~/.aws/credentials
# Never hardcode access keys here.
# Set: AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in your shell,
# or configure: aws configure
provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  description = "AWS region to deploy resources in"
  type        = string
  default     = "us-east-1"
}

variable "key_name" {
  description = "Name of the AWS EC2 key pair to use for SSH access"
  type        = string
  # Set this in terraform.tfvars (which is gitignored) or pass via -var flag
}

variable "your_ip" {
  description = "Your public IP address for SSH access restriction (e.g. 1.2.3.4/32)"
  type        = string
  default     = "0.0.0.0/0" # Change to your IP for better security
}

# Use the existing default VPC
resource "aws_default_vpc" "default" {
  tags = {
    Name = "Default VPC"
  }
}

# Security group for DevOpsHub server
resource "aws_security_group" "sg" {
  name        = "devopshub-sg"
  description = "Allow ports for SSH, HTTP, HTTPS, API, and custom user containers"
  vpc_id      = aws_default_vpc.default.id

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.your_ip]
  }

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "DevOpsHub API"
    from_port   = 4000
    to_port     = 4000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "User app containers"
    from_port   = 8000
    to_port     = 9000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# EC2 Instance for DevOpsHub
resource "aws_instance" "server" {
  # Use a standard Ubuntu 22.04 LTS AMI for your chosen region
  # Find AMIs at: https://cloud-images.ubuntu.com/locator/ec2/
  ami                    = "ami-0f8a61b66d1accaee" # Ubuntu 22.04 LTS us-east-1 (update for your region)
  instance_type          = "t3.micro"
  vpc_security_group_ids = [aws_security_group.sg.id]
  key_name               = var.key_name

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  tags = {
    Name = "devopshub-server"
  }
}

output "public_ip" {
  description = "Public IP address of the DevOpsHub server"
  value       = aws_instance.server.public_ip
}

output "public_dns" {
  description = "Public DNS of the DevOpsHub server"
  value       = aws_instance.server.public_dns
}