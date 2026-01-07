# Operational Procedures Specification

**Feature**: Kubernetes Deployment - Operations Guide
**Created**: 2026-01-08
**Status**: Implementation Ready
**Constitution**: Phase IV (v4.0.0)

## Overview

This document specifies operational procedures for deploying, monitoring, troubleshooting, and maintaining the Todo AI System on Kubernetes. All procedures follow Spec-Driven Development principles and use kagent/kubectl-ai where applicable.

---

## 1. Initial Deployment

### Prerequisites

```bash
# Verify tools are installed
minikube version
kubectl version --client
helm version
docker version

# Verify system resources
# Minimum: 4 CPU, 8GB RAM, 20GB disk
```

### Step 1: Start Minikube

```bash
# Start Minikube with appropriate resources
minikube start \
  --cpus=4 \
  --memory=8192 \
  --disk-size=20g \
  --driver=docker

# Verify cluster is running
kubectl cluster-info
kubectl get nodes

# Enable required addons
minikube addons enable ingress
minikube addons enable metrics-server

# Verify addons
minikube addons list | grep -E "ingress|metrics-server"
```

### Step 2: Configure Local Environment

```bash
# Point Docker CLI to Minikube's Docker daemon
eval $(minikube docker-env)

# Verify Docker context
docker context ls
```

### Step 3: Build Container Images

```bash
# Build all images locally
cd /path/to/todo-ai
./scripts/build-all.sh v1.0.0

# Verify images are available
docker images | grep todo-
```

### Step 4: Create Namespace

```bash
# Create namespace
kubectl create namespace todo-ai

# Set as default namespace
kubectl config set-context --current --namespace=todo-ai

# Verify namespace
kubectl get namespace todo-ai
```

### Step 5: Create Secrets

```bash
# Generate secure database password
DB_PASSWORD=$(openssl rand -base64 32)

# Create database secret
kubectl create secret generic database-secret \
  --from-literal=POSTGRES_USER=todo_user \
  --from-literal=POSTGRES_PASSWORD=$DB_PASSWORD \
  --from-literal=DATABASE_URL=postgresql://todo_user:$DB_PASSWORD@database-service.todo-ai.svc.cluster.local:5432/todo_db \
  -n todo-ai

# Create agent secret (replace with your OpenAI API key)
kubectl create secret generic agent-secret \
  --from-literal=OPENAI_API_KEY=sk-your-openai-api-key-here \
  -n todo-ai

# Verify secrets
kubectl get secrets -n todo-ai
```

### Step 6: Install Helm Chart

```bash
# Install with development values
helm install todo-ai ./helm/todo-ai \
  -n todo-ai \
  -f helm/todo-ai/values-dev.yaml

# Watch deployment progress
kubectl get pods -n todo-ai -w

# Wait for all pods to be ready (Ctrl+C to stop watching)
```

### Step 7: Configure Ingress

```bash
# Get Minikube IP
MINIKUBE_IP=$(minikube ip)

# Add to /etc/hosts (requires sudo)
echo "$MINIKUBE_IP todo-ai.local" | sudo tee -a /etc/hosts

# Verify Ingress
kubectl get ingress -n todo-ai
kubectl describe ingress todo-ai-ingress -n todo-ai
```

### Step 8: Verify Deployment

```bash
# Check all pods are running
kubectl get pods -n todo-ai

# Check all services
kubectl get services -n todo-ai

# Check ingress
kubectl get ingress -n todo-ai

# Test health endpoints
curl http://todo-ai.local/api/health
curl http://todo-ai.local/api/health

# Access application
open http://todo-ai.local
open http://todo-ai.local/chat
```

### Step 9: Run Database Migrations

```bash
# Get backend pod name
BACKEND_POD=$(kubectl get pods -n todo-ai -l app=backend -o jsonpath='{.items[0].metadata.name}')

# Run migrations
kubectl exec -it $BACKEND_POD -n todo-ai -- alembic upgrade head

# Verify migrations
kubectl exec -it $BACKEND_POD -n todo-ai -- alembic current
```

---

## 2. Monitoring and Observability

### View Logs

```bash
# View logs for specific pod
kubectl logs -f <pod-name> -n todo-ai

# View logs for deployment
kubectl logs -f deployment/backend -n todo-ai

# View logs with label selector
kubectl logs -l app=backend -n todo-ai --tail=100

# View logs from all containers in namespace
kubectl logs -n todo-ai --all-containers=true --tail=50

# Stream logs from multiple pods
kubectl logs -f -l app=backend -n todo-ai --max-log-requests=10
```

### View Resource Usage

```bash
# View pod resource usage
kubectl top pods -n todo-ai

# View node resource usage
kubectl top nodes

# View detailed pod metrics
kubectl describe pod <pod-name> -n todo-ai | grep -A 10 "Limits\|Requests"
```

### Check Pod Status

```bash
# Get all pods
kubectl get pods -n todo-ai

# Get pods with more details
kubectl get pods -n todo-ai -o wide

# Describe specific pod
kubectl describe pod <pod-name> -n todo-ai

# Get pod events
kubectl get events -n todo-ai --sort-by='.lastTimestamp'
```

### Check Service Endpoints

```bash
# Get all services
kubectl get services -n todo-ai

# Get endpoints for service
kubectl get endpoints -n todo-ai

# Describe service
kubectl describe service backend-service -n todo-ai
```

### Health Checks

```bash
# Check backend health
kubectl exec -it deployment/backend -n todo-ai -- wget -qO- http://localhost:8000/health

# Check frontend health
kubectl exec -it deployment/frontend -n todo-ai -- wget -qO- http://localhost:3000/api/health

# Check database health
kubectl exec -it statefulset/database -n todo-ai -- pg_isready -U todo_user -d todo_db
```

---

## 3. Rolling Updates

### Update Single Component

```bash
# Update backend image
helm upgrade todo-ai ./helm/todo-ai \
  -n todo-ai \
  --set backend.image.tag=v1.1.0 \
  --reuse-values

# Watch rollout
kubectl rollout status deployment/backend -n todo-ai

# Verify new pods
kubectl get pods -n todo-ai -l app=backend
```

### Update All Components

```bash
# Update all images
helm upgrade todo-ai ./helm/todo-ai \
  -n todo-ai \
  --set backend.image.tag=v1.1.0 \
  --set frontend.image.tag=v1.1.0 \
  --set chatui.image.tag=v1.1.0 \
  --set agent.image.tag=v1.1.0 \
  --set mcpServer.image.tag=v1.1.0 \
  --reuse-values

# Watch all rollouts
kubectl get pods -n todo-ai -w
```

### Monitor Rollout

```bash
# Check rollout status
kubectl rollout status deployment/backend -n todo-ai

# View rollout history
kubectl rollout history deployment/backend -n todo-ai

# Pause rollout (if issues detected)
kubectl rollout pause deployment/backend -n todo-ai

# Resume rollout
kubectl rollout resume deployment/backend -n todo-ai
```

---

## 4. Rollback Procedures

### Rollback Helm Release

```bash
# View release history
helm history todo-ai -n todo-ai

# Rollback to previous version
helm rollback todo-ai -n todo-ai

# Rollback to specific revision
helm rollback todo-ai 2 -n todo-ai

# Verify rollback
kubectl get pods -n todo-ai
```

### Rollback Specific Deployment

```bash
# Rollback deployment
kubectl rollout undo deployment/backend -n todo-ai

# Rollback to specific revision
kubectl rollout undo deployment/backend --to-revision=2 -n todo-ai

# Verify rollback
kubectl rollout status deployment/backend -n todo-ai
```

---

## 5. Scaling

### Manual Scaling

```bash
# Scale backend deployment
kubectl scale deployment/backend --replicas=3 -n todo-ai

# Verify scaling
kubectl get pods -n todo-ai -l app=backend

# Scale via Helm
helm upgrade todo-ai ./helm/todo-ai \
  -n todo-ai \
  --set backend.replicaCount=3 \
  --reuse-values
```

### Horizontal Pod Autoscaling (HPA)

```bash
# Enable autoscaling in values.yaml
# backend.autoscaling.enabled: true

# Upgrade with autoscaling
helm upgrade todo-ai ./helm/todo-ai \
  -n todo-ai \
  --set backend.autoscaling.enabled=true \
  --reuse-values

# View HPA status
kubectl get hpa -n todo-ai

# Describe HPA
kubectl describe hpa backend-hpa -n todo-ai
```

---

## 6. Backup and Restore

### Database Backup

```bash
# Create backup
kubectl exec -it statefulset/database -n todo-ai -- \
  pg_dump -U todo_user -d todo_db > backup-$(date +%Y%m%d-%H%M%S).sql

# Verify backup
ls -lh backup-*.sql
```

### Database Restore

```bash
# Copy backup to pod
kubectl cp backup-20260108-120000.sql \
  todo-ai/database-0:/tmp/backup.sql

# Restore database
kubectl exec -it statefulset/database -n todo-ai -- \
  psql -U todo_user -d todo_db -f /tmp/backup.sql

# Verify restore
kubectl exec -it statefulset/database -n todo-ai -- \
  psql -U todo_user -d todo_db -c "SELECT COUNT(*) FROM tasks;"
```

### PersistentVolume Snapshot

```bash
# Create VolumeSnapshot (requires VolumeSnapshot CRD)
kubectl apply -f - <<EOF
apiVersion: snapshot.storage.k8s.io/v1
kind: VolumeSnapshot
metadata:
  name: database-snapshot-$(date +%Y%m%d)
  namespace: todo-ai
spec:
  volumeSnapshotClassName: standard
  source:
    persistentVolumeClaimName: database-storage-database-0
EOF

# List snapshots
kubectl get volumesnapshots -n todo-ai
```

---

## 7. Troubleshooting

### Pod Not Starting

**Symptoms**: Pod stuck in `Pending`, `CrashLoopBackOff`, or `ImagePullBackOff`

**Diagnosis**:
```bash
# Describe pod
kubectl describe pod <pod-name> -n todo-ai

# Check events
kubectl get events -n todo-ai --sort-by='.lastTimestamp' | grep <pod-name>

# Check logs
kubectl logs <pod-name> -n todo-ai --previous
```

**Common Solutions**:
```bash
# Insufficient resources
kubectl top nodes
minikube start --cpus=6 --memory=12288

# Image pull error
eval $(minikube docker-env)
./scripts/build-all.sh v1.0.0

# Missing secret
kubectl get secrets -n todo-ai
kubectl create secret generic <secret-name> ...

# Failed health check
kubectl describe pod <pod-name> -n todo-ai | grep -A 10 "Liveness\|Readiness"
```

### Service Not Accessible

**Symptoms**: Cannot access service via Ingress or ClusterIP

**Diagnosis**:
```bash
# Check ingress
kubectl get ingress -n todo-ai
kubectl describe ingress todo-ai-ingress -n todo-ai

# Check service
kubectl get service <service-name> -n todo-ai
kubectl describe service <service-name> -n todo-ai

# Check endpoints
kubectl get endpoints <service-name> -n todo-ai

# Check pods
kubectl get pods -n todo-ai -l app=<app-name>
```

**Common Solutions**:
```bash
# Ingress controller not running
minikube addons enable ingress
kubectl get pods -n ingress-nginx

# DNS not configured
echo "$(minikube ip) todo-ai.local" | sudo tee -a /etc/hosts

# Service selector mismatch
kubectl get pods -n todo-ai --show-labels
kubectl describe service <service-name> -n todo-ai | grep Selector

# Pods not ready
kubectl get pods -n todo-ai
kubectl logs <pod-name> -n todo-ai
```

### Database Connection Errors

**Symptoms**: Backend cannot connect to database

**Diagnosis**:
```bash
# Check database pod
kubectl get pods -n todo-ai -l app=database

# Check database logs
kubectl logs statefulset/database -n todo-ai

# Check database secret
kubectl get secret database-secret -n todo-ai -o yaml

# Test connection from backend
BACKEND_POD=$(kubectl get pods -n todo-ai -l app=backend -o jsonpath='{.items[0].metadata.name}')
kubectl exec -it $BACKEND_POD -n todo-ai -- env | grep DATABASE
```

**Common Solutions**:
```bash
# Database not ready
kubectl rollout status statefulset/database -n todo-ai

# Incorrect credentials
kubectl delete secret database-secret -n todo-ai
kubectl create secret generic database-secret ...

# Network policy blocking
kubectl get networkpolicies -n todo-ai
kubectl describe networkpolicy <policy-name> -n todo-ai
```

### High Resource Usage

**Symptoms**: Pods being OOMKilled or throttled

**Diagnosis**:
```bash
# Check resource usage
kubectl top pods -n todo-ai

# Check resource limits
kubectl describe pod <pod-name> -n todo-ai | grep -A 5 "Limits\|Requests"

# Check events for OOMKilled
kubectl get events -n todo-ai | grep OOMKilled
```

**Common Solutions**:
```bash
# Increase resource limits
helm upgrade todo-ai ./helm/todo-ai \
  -n todo-ai \
  --set backend.resources.limits.memory=1Gi \
  --reuse-values

# Add more nodes (Minikube)
minikube start --cpus=6 --memory=12288

# Enable autoscaling
helm upgrade todo-ai ./helm/todo-ai \
  -n todo-ai \
  --set backend.autoscaling.enabled=true \
  --reuse-values
```

---

## 8. kagent and kubectl-ai Usage

### Using kagent

```bash
# Deploy from specification
kagent deploy --spec specs/004-k8s-deployment/spec.md

# Update deployment
kagent update --component backend --version v1.1.0

# Rollback deployment
kagent rollback --component backend

# Check status
kagent status --namespace todo-ai
```

### Using kubectl-ai

```bash
# Natural language queries
kubectl-ai "show me all pods in todo-ai namespace"
kubectl-ai "why is the backend pod crashing?"
kubectl-ai "scale backend to 3 replicas"
kubectl-ai "show logs for the last 10 minutes from backend"

# Troubleshooting
kubectl-ai "diagnose why frontend can't connect to backend"
kubectl-ai "check if database is healthy"
kubectl-ai "show resource usage for all pods"
```

---

## 9. Maintenance Tasks

### Update Secrets

```bash
# Rotate database password
NEW_PASSWORD=$(openssl rand -base64 32)

kubectl create secret generic database-secret \
  --from-literal=POSTGRES_USER=todo_user \
  --from-literal=POSTGRES_PASSWORD=$NEW_PASSWORD \
  --from-literal=DATABASE_URL=postgresql://todo_user:$NEW_PASSWORD@database-service.todo-ai.svc.cluster.local:5432/todo_db \
  -n todo-ai \
  --dry-run=client -o yaml | kubectl apply -f -

# Restart pods to pick up new secret
kubectl rollout restart deployment/backend -n todo-ai
```

### Clean Up Old Resources

```bash
# Delete completed jobs
kubectl delete jobs -n todo-ai --field-selector status.successful=1

# Delete old ReplicaSets
kubectl delete replicaset -n todo-ai --field-selector status.replicas=0

# Prune unused images (Minikube)
eval $(minikube docker-env)
docker image prune -a -f
```

### Update Kubernetes Version

```bash
# Check current version
minikube version

# Update Minikube
minikube stop
# Update Minikube binary
minikube start --kubernetes-version=v1.29.0

# Verify update
kubectl version
```

---

## 10. Disaster Recovery

### Complete System Backup

```bash
# Backup all resources
kubectl get all -n todo-ai -o yaml > backup-all-resources.yaml

# Backup ConfigMaps
kubectl get configmaps -n todo-ai -o yaml > backup-configmaps.yaml

# Backup Secrets (encrypted)
kubectl get secrets -n todo-ai -o yaml > backup-secrets.yaml

# Backup PersistentVolumeClaims
kubectl get pvc -n todo-ai -o yaml > backup-pvc.yaml

# Backup database
kubectl exec -it statefulset/database -n todo-ai -- \
  pg_dump -U todo_user -d todo_db > backup-database.sql
```

### Complete System Restore

```bash
# Restore namespace
kubectl create namespace todo-ai

# Restore secrets
kubectl apply -f backup-secrets.yaml

# Restore ConfigMaps
kubectl apply -f backup-configmaps.yaml

# Restore PVCs
kubectl apply -f backup-pvc.yaml

# Restore all resources
kubectl apply -f backup-all-resources.yaml

# Wait for database pod
kubectl wait --for=condition=ready pod -l app=database -n todo-ai --timeout=300s

# Restore database
kubectl cp backup-database.sql todo-ai/database-0:/tmp/backup.sql
kubectl exec -it statefulset/database -n todo-ai -- \
  psql -U todo_user -d todo_db -f /tmp/backup.sql

# Verify restoration
kubectl get all -n todo-ai
```

---

## 11. Cleanup and Teardown

### Uninstall Application

```bash
# Uninstall Helm release
helm uninstall todo-ai -n todo-ai

# Delete namespace (removes all resources)
kubectl delete namespace todo-ai

# Verify cleanup
kubectl get all -n todo-ai
```

### Stop Minikube

```bash
# Stop Minikube
minikube stop

# Delete Minikube cluster
minikube delete

# Verify deletion
minikube status
```

### Clean Up Local Environment

```bash
# Remove /etc/hosts entry
sudo sed -i '/todo-ai.local/d' /etc/hosts

# Clean Docker images
docker image prune -a -f

# Clean Docker volumes
docker volume prune -f
```

---

## 12. CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy to Kubernetes

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3

    - name: Build images
      run: ./scripts/build-all.sh ${{ github.sha }}

    - name: Push images
      run: ./scripts/push-all.sh ${{ github.sha }} ${{ secrets.REGISTRY_URL }}

    - name: Deploy with Helm
      run: |
        helm upgrade todo-ai ./helm/todo-ai \
          -n todo-ai \
          --set backend.image.tag=${{ github.sha }} \
          --set frontend.image.tag=${{ github.sha }} \
          --set chatui.image.tag=${{ github.sha }} \
          --set agent.image.tag=${{ github.sha }} \
          --set mcpServer.image.tag=${{ github.sha }} \
          --install \
          --wait
```

---

## Success Criteria

- ✅ All deployment procedures documented
- ✅ All monitoring procedures documented
- ✅ All troubleshooting procedures documented
- ✅ All backup/restore procedures documented
- ✅ All maintenance procedures documented
- ✅ kagent and kubectl-ai usage documented
- ✅ CI/CD integration documented
- ✅ Disaster recovery procedures documented

---

**Version**: 1.0.0
**Last Updated**: 2026-01-08
**Status**: Implementation Ready
