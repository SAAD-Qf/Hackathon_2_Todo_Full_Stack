# Kubernetes Deployment for Minikube

This directory contains Kubernetes manifests for deploying the Todo Full-Stack application on Minikube.

## Prerequisites

- Minikube installed and running
- kubectl configured to use Minikube
- Docker installed (for building images)

## Quick Start

### 1. Start Minikube

```bash
minikube start --driver=docker
minikube addons enable ingress
```

### 2. Build Docker Images

Build images inside Minikube's Docker environment:

```bash
# Use Minikube's Docker daemon
eval $(minikube docker-env)

# Build backend image
cd backend
docker build -t todo-backend:latest .

# Build frontend image
cd ../frontend
docker build -t todo-frontend:latest .
```

### 3. Configure Secrets

Edit `k8s/secrets.yaml` and replace the DATABASE_URL with your actual Neon Postgres connection string:

```yaml
DATABASE_URL: "postgresql+asyncpg://user:password@your-neon-host/database"
```

For local development, you can use SQLite:

```yaml
DATABASE_URL: "sqlite+aiosqlite:///./todo.db"
```

### 4. Deploy to Kubernetes

Apply all manifests in order:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/ingress.yaml
```

Or apply all at once:

```bash
kubectl apply -f k8s/
```

### 5. Verify Deployment

Check pod status:

```bash
kubectl get pods -n todo-app
kubectl get services -n todo-app
kubectl get ingress -n todo-app
```

Wait for all pods to be Running:

```bash
kubectl wait --for=condition=ready pod -l app=todo-backend -n todo-app --timeout=120s
kubectl wait --for=condition=ready pod -l app=todo-frontend -n todo-app --timeout=120s
```

### 6. Access the Application

Get Minikube IP:

```bash
minikube ip
```

Add to your hosts file (Windows: `C:\Windows\System32\drivers\etc\hosts`):

```
<MINIKUBE_IP> todo.local
```

Access the application:

- **Frontend**: http://todo.local
- **Backend API**: http://todo.local/api/v1/tasks
- **API Docs**: http://todo.local/api/v1/docs

Or use NodePort directly:

```bash
minikube service todo-frontend -n todo-app
```

## Architecture

```
┌─────────────────────────────────────────┐
│           Ingress (todo.local)          │
│  /     → Frontend    /api → Backend     │
└─────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
┌───────▼────────┐    ┌────────▼────────┐
│   Frontend     │    │    Backend      │
│   Service      │    │    Service      │
│   (NodePort)   │    │   (ClusterIP)   │
└───────┬────────┘    └────────┬────────┘
        │                      │
┌───────▼────────┐    ┌────────▼────────┐
│   Frontend     │    │    Backend      │
│   Deployment   │    │   Deployment    │
│   (2 replicas) │    │   (2 replicas)  │
└────────────────┘    └─────────┬───────┘
                                │
                      ┌─────────▼─────────┐
                      │  Neon Postgres    │
                      │   (External)      │
                      └───────────────────┘
```

## Configuration

### ConfigMap (`configmap.yaml`)

Contains non-sensitive configuration:
- Environment settings
- CORS origins
- API URLs
- Log levels

### Secrets (`secrets.yaml`)

Contains sensitive data:
- Database connection string

**IMPORTANT**: Never commit real secrets to version control!

### Resource Limits

Each pod has resource requests and limits:
- **Requests**: 256Mi memory, 250m CPU
- **Limits**: 512Mi memory, 500m CPU

Adjust based on your workload.

## Scaling

Scale deployments:

```bash
# Scale backend
kubectl scale deployment todo-backend -n todo-app --replicas=3

# Scale frontend
kubectl scale deployment todo-frontend -n todo-app --replicas=3
```

## Monitoring

View logs:

```bash
# Backend logs
kubectl logs -f deployment/todo-backend -n todo-app

# Frontend logs
kubectl logs -f deployment/todo-frontend -n todo-app

# All pods
kubectl logs -f -l app=todo-backend -n todo-app
```

## Troubleshooting

### Pods not starting

```bash
kubectl describe pod <pod-name> -n todo-app
kubectl logs <pod-name> -n todo-app
```

### Database connection issues

Check secrets:

```bash
kubectl get secret todo-secrets -n todo-app -o yaml
```

Verify DATABASE_URL is correct.

### Image pull errors

Ensure images are built in Minikube's Docker:

```bash
eval $(minikube docker-env)
docker images | grep todo
```

### Ingress not working

Check ingress controller:

```bash
minikube addons list | grep ingress
kubectl get pods -n ingress-nginx
```

## Cleanup

Delete all resources:

```bash
kubectl delete namespace todo-app
```

Or delete individual resources:

```bash
kubectl delete -f k8s/
```

Stop Minikube:

```bash
minikube stop
minikube delete
```

## Production Considerations

For production deployments:

1. **Use proper secrets management** (e.g., Sealed Secrets, External Secrets Operator)
2. **Enable TLS/SSL** with cert-manager
3. **Add persistent volumes** for SQLite (if used)
4. **Configure horizontal pod autoscaling** (HPA)
5. **Set up monitoring** (Prometheus, Grafana)
6. **Configure network policies** for security
7. **Use production-grade ingress** controller
8. **Implement backup strategy** for database
9. **Add resource quotas** and limit ranges
10. **Use namespaces** for environment separation
