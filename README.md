# Portfolio

## Overview
A personal developer portfolio website with a React frontend, a Node.js/Express backend, and full AWS cloud infrastructure managed with Terraform. Serves profile info, projects, and a contact form backed by AWS SES.

## Problem It Solves
- Static portfolio sites cannot send emails or serve dynamic content (GitHub projects, blog posts) without a backend
- Deploying a personal site to production-grade cloud infrastructure typically involves manual console work
- Target users: developers who want a self-hosted, cloud-deployed portfolio they fully own and can extend

## Use Cases
1. A recruiter visits the portfolio, browses projects fetched live from the backend, and sends a message via the contact form — delivered to the owner's inbox through AWS SES
2. The developer pushes an update and re-runs `terraform apply` to redeploy the container to ECS Fargate with zero manual steps
3. A potential client reads the About and Skills sections, then follows links to specific GitHub projects

## Key Features
- **Dynamic project listing** — backend serves project data so the front page stays current without redeployment
- **Contact form with email delivery** — Node.js backend relays form submissions through AWS SES (SMTP)
- **Containerised backend** — Docker image deployed to ECS Fargate behind an Application Load Balancer
- **Infrastructure as code** — entire AWS stack (ECS, ALB, VPC, IAM, SES, DNS) defined in Terraform
- **Security hardened** — Helmet.js CSP headers, CORS restrictions, HTTPS enforced at the ALB level

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React + JSX, Vite |
| Backend | Node.js + Express |
| Email | AWS SES via Nodemailer |
| Container | Docker |
| Cloud | AWS ECS Fargate, ALB, VPC |
| IaC | Terraform (AWS provider ~5.0) |

## Getting Started

### Local development

```bash
# Start both services with Docker Compose
cp .env.example .env   # fill in SES_USER, SES_PASS, SES_REGION
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend (dev) | http://localhost:5173 |
| Backend | http://localhost:3000 |

### Deploy to AWS

#### Prerequisites
- Terraform >= 1.5
- AWS CLI configured with credentials
- Docker

```bash
cd aws/terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your domain, region, and SES settings

terraform init
terraform apply
```

Terraform provisions VPC, ECS cluster, ALB, IAM roles, and DNS records. The `aws/deploy.sh` script builds and pushes the Docker image to ECR before each deploy.
