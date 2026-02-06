# DOKS Deployment Specifications

**Feature:** Phase V - Cloud-Native DOKS Deployment
**Component:** DigitalOcean Kubernetes Deployment
**Version:** 1.0.0
**Last Updated:** 2026-01-08

---

## Table of Contents

1. [Overview](#overview)
2. [Infrastructure Requirements](#infrastructure-requirements)
3. [Pre-Deployment Setup](#pre-deployment-setup)
4. [Infrastructure Provisioning](#infrastructure-provisioning)
5. [Container Registry Setup](#container-registry-setup)
6. [Kubernetes Cluster Deployment](#kubernetes-cluster-deployment)
7. [Managed Services Configuration](#managed-services-configuration)
8. [Application Deployment](#application-deployment)
9. [DNS and SSL Configuration](#dns-and-ssl-configuration)
10. [Monitoring and Observability](#monitoring-and-observability)
11. [Backup and Disaster Recovery](#backup-and-disaster-recovery)
12. [Cost Optimization](#cost-optimization)
13. [Troubleshooting](#troubleshooting)

---

## 1. Overview

This document specifies the complete deployment procedure for the Todo AI System to **DigitalOcean Kubernetes (DOKS)**. All infrastructure is provisioned using Infrastructure as Code principles with Terraform.

### 1.1 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    DigitalOcean Cloud                           │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │              Load Balancer (SSL/TLS)                      │ │
│  │  - Public IP: xxx.xxx.xxx.xxx                             │ │
│  │  - SSL Certificate (Let's Encrypt)                        │ │
│  │  - Domain: todo-ai.example.com                            │ │
│  └───────────────────────────────────────────────────────────┘ │
│                          │                                      │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │         DOKS Cluster (todo-ai-cluster)                    │ │
│  │  Region: nyc3                                             │ │
│  │  Version: 1.28.x                                          │ │
│  │                                                           │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │  Node Pool: standard-nodes                          │ │ │
│  │  │  - Size: s-4vcpu-8gb                                │ │ │
│  │  │  - Count: 3 nodes                                   │ │ │
│  │  │  - Auto-scaling: 3-6 nodes                          │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  │                                                           │ │
│  │  Namespaces:                                              │ │
│  │  - todo-ai (application)                                  │ │
│  │  - strimzi-operator (Kafka operator)                      │ │
│  │  - monitoring (Prometheus, Grafana)                       │ │
│  │  - dapr-system (Dapr control plane)                       │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │         Managed Kafka Cluster                             │ │
│  │  - 3 brokers                                              │ │
│  │  - Plan: kafka-3-node-2gb                                 │ │
│  │  - Storage: 100GB per broker                              │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │         Managed PostgreSQL Database                       │ │
│  │  - Plan: db-s-2vcpu-4gb                                   │ │
│  │  - Storage: 50GB                                          │ │
│  │  - High Availability: Enabled                             │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │         Container Registry                                │ │
│  │  - Name: todo-ai                                          │ │
│  │  - Plan: Professional                                     │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Cost Estimate

| Resource | Plan | Monthly Cost |
|----------|------|--------------|
| DOKS Cluster (3 nodes) | s-4vcpu-8gb | $144 |
| Managed Kafka | kafka-3-node-2gb | $180 |
| Managed PostgreSQL | db-s-2vcpu-4gb | $60 |
| Load Balancer | Standard | $12 |
| Container Registry | Professional | $20 |
| Block Storage (PVCs) | 200GB | $16 |
| **Total** | | **$432/month** |

---

## 2. Infrastructure Requirements

### 2.1 DigitalOcean Account

- Active DigitalOcean account
- API token with read/write permissions
- Payment method configured

### 2.2 Local Tools

```bash
# Install required tools
# doctl (DigitalOcean CLI)
brew install doctl  # macOS
# or
snap install doctl  # Linux

# kubectl
brew install kubectl

# Terraform
brew install terraform

# Helm
brew install helm

# Docker
# Install from https://docs.docker.com/get-docker/
```

### 2.3 Domain Name

- Domain name for the application (e.g., `todo-ai.example.com`)
- DNS management access
- SSL certificate (Let's Encrypt via cert-manager)

---

## 3. Pre-Deployment Setup

### 3.1 Authenticate with DigitalOcean

```bash
# Initialize doctl
doctl auth init

# Enter your API token when prompted

# Verify authentication
doctl account get
```

### 3.2 Create Terraform Configuration

**Directory Structure:**

```
terraform/
├── main.tf
├── variables.tf
├── outputs.tf
├── doks.tf
├── kafka.tf
├── database.tf
├── registry.tf
└── terraform.tfvars
```

### 3.3 Configure Terraform Variables

```hcl
# terraform/variables.tf
variable "do_token" {
  description = "DigitalOcean API token"
  type        = string
  sensitive   = true
}

variable "region" {
  description = "DigitalOcean region"
  type        = string
  default     = "nyc3"
}

variable "cluster_name" {
  description = "DOKS cluster name"
  type        = string
  default     = "todo-ai-cluster"
}

variable "node_size" {
  description = "Node droplet size"
  type        = string
  default     = "s-4vcpu-8gb"
}

variable "node_count" {
  description = "Number of nodes"
  type        = number
  default     = 3
}

variable "domain_name" {
  description = "Domain name for the application"
  type        = string
}
```

```hcl
# terraform/terraform.tfvars
do_token     = "your-digitalocean-api-token"
region       = "nyc3"
cluster_name = "todo-ai-cluster"
node_size    = "s-4vcpu-8gb"
node_count   = 3
domain_name  = "todo-ai.example.com"
```

---

## 4. Infrastructure Provisioning

### 4.1 Terraform Provider Configuration

```hcl
# terraform/main.tf
terraform {
  required_version = ">= 1.0"

  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.34"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.24"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.12"
    }
  }

  backend "local" {
    path = "terraform.tfstate"
  }
}

provider "digitalocean" {
  token = var.do_token
}

provider "kubernetes" {
  host  = digitalocean_kubernetes_cluster.todo_ai.endpoint
  token = digitalocean_kubernetes_cluster.todo_ai.kube_config[0].token
  cluster_ca_certificate = base64decode(
    digitalocean_kubernetes_cluster.todo_ai.kube_config[0].cluster_ca_certificate
  )
}

provider "helm" {
  kubernetes {
    host  = digitalocean_kubernetes_cluster.todo_ai.endpoint
    token = digitalocean_kubernetes_cluster.todo_ai.kube_config[0].token
    cluster_ca_certificate = base64decode(
      digitalocean_kubernetes_cluster.todo_ai.kube_config[0].cluster_ca_certificate
    )
  }
}
```

### 4.2 DOKS Cluster Configuration

```hcl
# terraform/doks.tf
resource "digitalocean_kubernetes_cluster" "todo_ai" {
  name    = var.cluster_name
  region  = var.region
  version = "1.28.2-do.0"

  node_pool {
    name       = "standard-nodes"
    size       = var.node_size
    node_count = var.node_count
    auto_scale = true
    min_nodes  = 3
    max_nodes  = 6
    tags       = ["todo-ai", "production"]
  }

  tags = ["todo-ai", "production"]
}

resource "digitalocean_kubernetes_node_pool" "monitoring" {
  cluster_id = digitalocean_kubernetes_cluster.todo_ai.id
  name       = "monitoring-nodes"
  size       = "s-2vcpu-4gb"
  node_count = 1
  auto_scale = false
  tags       = ["todo-ai", "monitoring"]

  labels = {
    workload = "monitoring"
  }
}
```

### 4.3 Managed Kafka Configuration

```hcl
# terraform/kafka.tf
resource "digitalocean_database_cluster" "kafka" {
  name       = "todo-ai-kafka"
  engine     = "kafka"
  version    = "3.6"
  size       = "db-s-2vcpu-4gb"
  region     = var.region
  node_count = 3

  tags = ["todo-ai", "kafka", "production"]
}

resource "digitalocean_database_kafka_topic" "tasks" {
  cluster_id         = digitalocean_database_cluster.kafka.id
  name               = "tasks"
  partition_count    = 6
  replication_factor = 3

  config {
    retention_ms           = 604800000  # 7 days
    segment_ms             = 3600000    # 1 hour
    compression_type       = "snappy"
    min_insync_replicas    = 2
    cleanup_policy         = "delete"
  }
}

resource "digitalocean_database_kafka_topic" "reminders" {
  cluster_id         = digitalocean_database_cluster.kafka.id
  name               = "reminders"
  partition_count    = 3
  replication_factor = 3

  config {
    retention_ms           = 604800000
    segment_ms             = 3600000
    compression_type       = "snappy"
    min_insync_replicas    = 2
    cleanup_policy         = "delete"
  }
}

resource "digitalocean_database_kafka_topic" "agent_actions" {
  cluster_id         = digitalocean_database_cluster.kafka.id
  name               = "agent-actions"
  partition_count    = 3
  replication_factor = 3

  config {
    retention_ms           = 604800000
    segment_ms             = 3600000
    compression_type       = "snappy"
    min_insync_replicas    = 2
    cleanup_policy         = "delete"
  }
}
```

### 4.4 Managed PostgreSQL Configuration

```hcl
# terraform/database.tf
resource "digitalocean_database_cluster" "postgres" {
  name       = "todo-ai-db"
  engine     = "pg"
  version    = "16"
  size       = "db-s-2vcpu-4gb"
  region     = var.region
  node_count = 2  # High availability

  tags = ["todo-ai", "database", "production"]
}

resource "digitalocean_database_db" "todo_ai" {
  cluster_id = digitalocean_database_cluster.postgres.id
  name       = "todo_ai"
}

resource "digitalocean_database_user" "app_user" {
  cluster_id = digitalocean_database_cluster.postgres.id
  name       = "todo_app"
}

resource "digitalocean_database_firewall" "postgres_firewall" {
  cluster_id = digitalocean_database_cluster.postgres.id

  rule {
    type  = "k8s"
    value = digitalocean_kubernetes_cluster.todo_ai.id
  }
}
```

### 4.5 Container Registry Configuration

```hcl
# terraform/registry.tf
resource "digitalocean_container_registry" "todo_ai" {
  name                   = "todo-ai"
  subscription_tier_slug = "professional"
  region                 = var.region
}

resource "digitalocean_container_registry_docker_credentials" "todo_ai" {
  registry_name = digitalocean_container_registry.todo_ai.name
}
```

### 4.6 Load Balancer Configuration

```hcl
# terraform/loadbalancer.tf
resource "digitalocean_loadbalancer" "todo_ai" {
  name   = "todo-ai-lb"
  region = var.region

  forwarding_rule {
    entry_port     = 443
    entry_protocol = "https"

    target_port     = 80
    target_protocol = "http"

    certificate_name = digitalocean_certificate.todo_ai.name
  }

  forwarding_rule {
    entry_port     = 80
    entry_protocol = "http"

    target_port     = 80
    target_protocol = "http"
  }

  healthcheck {
    port     = 80
    protocol = "http"
    path     = "/health"
  }

  droplet_tag = "todo-ai-ingress"
}

resource "digitalocean_certificate" "todo_ai" {
  name    = "todo-ai-cert"
  type    = "lets_encrypt"
  domains = [var.domain_name]
}
```

### 4.7 Terraform Outputs

```hcl
# terraform/outputs.tf
output "cluster_id" {
  value = digitalocean_kubernetes_cluster.todo_ai.id
}

output "cluster_endpoint" {
  value = digitalocean_kubernetes_cluster.todo_ai.endpoint
}

output "kafka_connection_string" {
  value     = digitalocean_database_cluster.kafka.private_uri
  sensitive = true
}

output "postgres_connection_string" {
  value     = digitalocean_database_cluster.postgres.private_uri
  sensitive = true
}

output "registry_endpoint" {
  value = digitalocean_container_registry.todo_ai.endpoint
}

output "loadbalancer_ip" {
  value = digitalocean_loadbalancer.todo_ai.ip
}
```

### 4.8 Provision Infrastructure

```bash
# Initialize Terraform
cd terraform
terraform init

# Plan infrastructure changes
terraform plan -out=tfplan

# Apply infrastructure
terraform apply tfplan

# Save outputs
terraform output -json > outputs.json
```

---

## 5. Container Registry Setup

### 5.1 Authenticate with Registry

```bash
# Get registry credentials
doctl registry login

# Verify authentication
docker info | grep Registry
```

### 5.2 Build and Push Images

```bash
# Set registry endpoint
export REGISTRY="registry.digitalocean.com/todo-ai"

# Build backend image
cd backend
docker build -t $REGISTRY/backend:v1.0.0 -f Dockerfile .
docker push $REGISTRY/backend:v1.0.0

# Build frontend image
cd ../frontend
docker build -t $REGISTRY/frontend:v1.0.0 -f Dockerfile .
docker push $REGISTRY/frontend:v1.0.0

# Build chat-ui image
cd ../chat-ui
docker build -t $REGISTRY/chat-ui:v1.0.0 -f Dockerfile .
docker push $REGISTRY/chat-ui:v1.0.0

# Build agent-runtime image
cd ../agent-runtime
docker build -t $REGISTRY/agent-runtime:v1.0.0 -f Dockerfile .
docker push $REGISTRY/agent-runtime:v1.0.0

# Build mcp-server image
cd ../mcp-server
docker build -t $REGISTRY/mcp-server:v1.0.0 -f Dockerfile .
docker push $REGISTRY/mcp-server:v1.0.0

# Build reminder-engine image
cd ../reminder-engine
docker build -t $REGISTRY/reminder-engine:v1.0.0 -f Dockerfile .
docker push $REGISTRY/reminder-engine:v1.0.0

# Verify images
doctl registry repository list-v2
```

---

## 6. Kubernetes Cluster Deployment

### 6.1 Configure kubectl

```bash
# Get kubeconfig
doctl kubernetes cluster kubeconfig save todo-ai-cluster

# Verify connection
kubectl cluster-info
kubectl get nodes
```

### 6.2 Create Namespaces

```bash
# Create application namespace
kubectl create namespace todo-ai

# Create monitoring namespace
kubectl create namespace monitoring

# Create Dapr namespace (will be created by Dapr installer)
# kubectl create namespace dapr-system
```

### 6.3 Configure Registry Access

```bash
# Create registry secret
kubectl create secret docker-registry regcred \
  --docker-server=registry.digitalocean.com \
  --docker-username=$(doctl registry docker-config --read-write | jq -r '.auths["registry.digitalocean.com"].username') \
  --docker-password=$(doctl registry docker-config --read-write | jq -r '.auths["registry.digitalocean.com"].password') \
  -n todo-ai
```

### 6.4 Install Dapr

```bash
# Install Dapr CLI
wget -q https://raw.githubusercontent.com/dapr/cli/master/install/install.sh -O - | /bin/bash

# Initialize Dapr on Kubernetes
dapr init -k --runtime-version 1.12

# Verify Dapr installation
dapr status -k
kubectl get pods -n dapr-system
```

### 6.5 Install cert-manager

```bash
# Install cert-manager for SSL certificates
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.3/cert-manager.yaml

# Verify installation
kubectl get pods -n cert-manager
```

---

## 7. Managed Services Configuration

### 7.1 Configure Database Connection

```bash
# Get database connection string from Terraform output
DB_CONNECTION=$(terraform output -raw postgres_connection_string)

# Create database secret
kubectl create secret generic database-secret \
  --from-literal=connection-string="$DB_CONNECTION" \
  -n todo-ai
```

### 7.2 Configure Kafka Connection

```bash
# Get Kafka connection details
KAFKA_BROKERS=$(terraform output -raw kafka_connection_string | cut -d'/' -f3)

# Create Kafka secret
kubectl create secret generic kafka-secret \
  --from-literal=brokers="$KAFKA_BROKERS" \
  -n todo-ai
```

### 7.3 Run Database Migrations

```bash
# Create migration job
kubectl apply -f - <<EOF
apiVersion: batch/v1
kind: Job
metadata:
  name: db-migration
  namespace: todo-ai
spec:
  template:
    spec:
      containers:
      - name: migration
        image: registry.digitalocean.com/todo-ai/backend:v1.0.0
        command: ["alembic", "upgrade", "head"]
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: connection-string
      restartPolicy: OnFailure
      imagePullSecrets:
      - name: regcred
EOF

# Wait for migration to complete
kubectl wait --for=condition=complete job/db-migration -n todo-ai --timeout=300s

# Check migration logs
kubectl logs job/db-migration -n todo-ai
```

---

## 8. Application Deployment

### 8.1 Deploy Dapr Components

```bash
# Apply Dapr pub/sub component
kubectl apply -f specs/005-cloud-native-doks/dapr-config.md  # Extract YAML sections

# Apply Dapr state store component
# Apply Dapr secret store component
# Apply Dapr resiliency policies
```

### 8.2 Deploy Application Services

```bash
# Deploy backend API
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml

# Deploy frontend
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml

# Deploy chat-ui
kubectl apply -f k8s/chat-ui-deployment.yaml
kubectl apply -f k8s/chat-ui-service.yaml

# Deploy agent-runtime
kubectl apply -f k8s/agent-runtime-deployment.yaml
kubectl apply -f k8s/agent-runtime-service.yaml

# Deploy mcp-server
kubectl apply -f k8s/mcp-server-deployment.yaml
kubectl apply -f k8s/mcp-server-service.yaml

# Deploy reminder-engine
kubectl apply -f k8s/reminder-engine-deployment.yaml
kubectl apply -f k8s/reminder-engine-service.yaml

# Verify deployments
kubectl get deployments -n todo-ai
kubectl get pods -n todo-ai
kubectl get services -n todo-ai
```

### 8.3 Deploy Ingress

```bash
# Install NGINX Ingress Controller
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.service.type=LoadBalancer

# Apply Ingress resource
kubectl apply -f k8s/ingress.yaml

# Get Ingress IP
kubectl get svc -n ingress-nginx ingress-nginx-controller
```

---

## 9. DNS and SSL Configuration

### 9.1 Configure DNS

```bash
# Get Load Balancer IP
LB_IP=$(kubectl get svc -n ingress-nginx ingress-nginx-controller -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

echo "Configure DNS A record:"
echo "  Name: todo-ai.example.com"
echo "  Type: A"
echo "  Value: $LB_IP"
echo "  TTL: 300"
```

### 9.2 Configure SSL Certificate

```bash
# Create ClusterIssuer for Let's Encrypt
kubectl apply -f - <<EOF
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@example.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF

# Update Ingress with TLS
kubectl apply -f - <<EOF
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: todo-ai-ingress
  namespace: todo-ai
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - todo-ai.example.com
    secretName: todo-ai-tls
  rules:
  - host: todo-ai.example.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend
            port:
              number: 8000
      - path: /chat
        pathType: Prefix
        backend:
          service:
            name: chat-ui
            port:
              number: 3001
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 3000
EOF

# Verify certificate
kubectl get certificate -n todo-ai
kubectl describe certificate todo-ai-tls -n todo-ai
```

---

## 10. Monitoring and Observability

### 10.1 Install Prometheus Stack

```bash
# Add Prometheus Helm repo
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install kube-prometheus-stack
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --set prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues=false \
  --set grafana.adminPassword=admin123

# Verify installation
kubectl get pods -n monitoring
```

### 10.2 Access Grafana

```bash
# Port-forward Grafana
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80

# Access at http://localhost:3000
# Username: admin
# Password: admin123
```

### 10.3 Import Dashboards

- Kubernetes Cluster Monitoring: Dashboard ID 7249
- Kafka Monitoring: Dashboard ID 11962
- Dapr Monitoring: Dashboard ID 15000

---

## 11. Backup and Disaster Recovery

### 11.1 Database Backups

```bash
# DigitalOcean Managed PostgreSQL includes automatic daily backups
# Verify backup schedule
doctl databases backups list $(terraform output -raw postgres_cluster_id)

# Create manual backup
doctl databases backups create $(terraform output -raw postgres_cluster_id)
```

### 11.2 Kubernetes Backups

```bash
# Install Velero for Kubernetes backups
helm repo add vmware-tanzu https://vmware-tanzu.github.io/helm-charts
helm repo update

helm install velero vmware-tanzu/velero \
  --namespace velero \
  --create-namespace \
  --set configuration.provider=digitalocean \
  --set configuration.backupStorageLocation.bucket=todo-ai-backups \
  --set configuration.backupStorageLocation.config.region=nyc3

# Create backup schedule
velero schedule create daily-backup --schedule="0 2 * * *"
```

---

## 12. Cost Optimization

### 12.1 Enable Auto-Scaling

```bash
# Auto-scaling is configured in Terraform (3-6 nodes)
# Monitor node utilization
kubectl top nodes

# Adjust if needed
doctl kubernetes cluster node-pool update todo-ai-cluster standard-nodes \
  --min-nodes 2 \
  --max-nodes 5
```

### 12.2 Resource Optimization

- Review pod resource requests/limits
- Use Horizontal Pod Autoscaling (HPA)
- Enable cluster autoscaling
- Use spot instances for non-critical workloads

---

## 13. Troubleshooting

### 13.1 Pod Not Starting

```bash
# Check pod status
kubectl get pods -n todo-ai

# Describe pod
kubectl describe pod <pod-name> -n todo-ai

# Check logs
kubectl logs <pod-name> -n todo-ai

# Check events
kubectl get events -n todo-ai --sort-by='.lastTimestamp'
```

### 13.2 Database Connection Issues

```bash
# Test database connectivity
kubectl run -it --rm debug --image=postgres:16 --restart=Never -- \
  psql "$DB_CONNECTION"

# Check secret
kubectl get secret database-secret -n todo-ai -o yaml
```

### 13.3 Ingress Not Working

```bash
# Check Ingress status
kubectl get ingress -n todo-ai
kubectl describe ingress todo-ai-ingress -n todo-ai

# Check NGINX controller logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/name=ingress-nginx

# Test backend connectivity
kubectl port-forward -n todo-ai svc/backend 8000:8000
curl http://localhost:8000/health
```

---

## Acceptance Criteria

- ✅ DOKS cluster provisioned with 3 nodes
- ✅ Managed Kafka cluster with 3 brokers
- ✅ Managed PostgreSQL with high availability
- ✅ Container registry configured
- ✅ All application services deployed
- ✅ Dapr components configured
- ✅ SSL/TLS certificate issued
- ✅ DNS configured
- ✅ Monitoring stack deployed
- ✅ Backups configured
- ✅ Application accessible at https://todo-ai.example.com

---

## Next Steps

1. **Run integration tests** - Test end-to-end functionality
2. **Configure CI/CD** - Set up GitHub Actions for automated deployments
3. **Set up alerting** - Configure Prometheus alerts and PagerDuty
4. **Performance testing** - Load test the application
5. **Security hardening** - Run security scans and implement policies

---

**Document Version:** 1.0.0
**Last Updated:** 2026-01-08
**Specification Phase:** Phase V - Cloud-Native DOKS Deployment
