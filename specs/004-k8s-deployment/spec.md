# Feature Specification: Kubernetes Deployment for Todo AI System

**Feature Branch**: `004-k8s-deployment`
**Created**: 2026-01-08
**Status**: Draft
**Input**: Phase IV - Kubernetes deployment with Minikube, Helm, Docker, kagent, kubectl-ai
**Constitution**: Phase IV (v4.0.0)

## Executive Summary

Phase IV deploys the complete Todo AI System to Kubernetes using Spec-Driven Development. All infrastructure is defined in specifications and generated automatically—no manual YAML editing is permitted. The system runs on Minikube locally with production-ready patterns including zero-downtime deployments, service mesh networking, and observability.

**Key Constraint**: All Dockerfiles, Helm charts, and Kubernetes manifests MUST be generated from specifications. Manual editing is prohibited.

---

## Deployment Architecture

### Overview

The Todo AI System consists of 6 components deployed across multiple pods:

1. **Backend API** (FastAPI) - RESTful API for task management
2. **Frontend Web UI** (Next.js) - Traditional web interface
3. **Chat UI** (ChatKit) - Conversational interface
4. **Agent Runtime** (OpenAI Agents SDK) - AI agent for natural language processing
5. **MCP Server** (MCP SDK) - Tool execution layer
6. **Database** (PostgreSQL) - Persistent data storage

### Component Dependencies

```
External User
    │
    ▼
Ingress (NGINX)
    │
    ├─────────────┬─────────────┬─────────────┐
    │             │             │             │
    ▼             ▼             ▼             │
Frontend      ChatUI       Backend API       │
    │             │             │             │
    │             ▼             │             │
    │         Agent Runtime     │             │
    │             │             │             │
    │             ▼             │             │
    │         MCP Server ───────┘             │
    │             │                           │
    └─────────────┴───────────────────────────┘
                  │
                  ▼
              Database
```

### Namespace Structure

All resources are deployed in the `todo-ai` namespace:

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: todo-ai
  labels:
    name: todo-ai
    environment: development
    managed-by: helm
```

---

## Component Specifications

### 1. Backend API (FastAPI)

**Purpose**: RESTful API for task management (Phase II)

**Container Specification**:
- Base Image: `python:3.11-alpine`
- Exposed Port: 8000
- Health Check: `GET /health`
- Environment Variables:
  - `DATABASE_URL` (from Secret)
  - `CORS_ORIGINS` (from ConfigMap)
  - `LOG_LEVEL` (from ConfigMap)

**Resource Requirements**:
- CPU Request: 100m
- CPU Limit: 500m
- Memory Request: 128Mi
- Memory Limit: 512Mi

**Deployment Strategy**:
- Replicas: 2
- Rolling Update: maxSurge=1, maxUnavailable=0
- Readiness Probe: HTTP GET /health (initialDelay=15s, period=10s)
- Liveness Probe: HTTP GET /health (initialDelay=30s, period=10s)

**Service Specification**:
- Type: ClusterIP
- Port: 8000
- Target Port: 8000
- Selector: app=backend

**Ingress Rule**:
- Path: `/api/*`
- Backend: backend-service:8000

---

### 2. Frontend Web UI (Next.js)

**Purpose**: Traditional web interface for task management (Phase II)

**Container Specification**:
- Base Image: `node:20-alpine`
- Exposed Port: 3000
- Health Check: `GET /api/health`
- Environment Variables:
  - `NEXT_PUBLIC_API_URL` (from ConfigMap)
  - `NODE_ENV=production`

**Resource Requirements**:
- CPU Request: 50m
- CPU Limit: 200m
- Memory Request: 64Mi
- Memory Limit: 256Mi

**Deployment Strategy**:
- Replicas: 2
- Rolling Update: maxSurge=1, maxUnavailable=0
- Readiness Probe: HTTP GET /api/health (initialDelay=10s, period=10s)
- Liveness Probe: HTTP GET /api/health (initialDelay=20s, period=10s)

**Service Specification**:
- Type: ClusterIP
- Port: 3000
- Target Port: 3000
- Selector: app=frontend

**Ingress Rule**:
- Path: `/`
- Backend: frontend-service:3000

---

### 3. Chat UI (ChatKit)

**Purpose**: Conversational interface for AI agent (Phase III)

**Container Specification**:
- Base Image: `node:20-alpine`
- Exposed Port: 3000
- Health Check: `GET /api/health`
- Environment Variables:
  - `NEXT_PUBLIC_AGENT_URL` (from ConfigMap)
  - `NODE_ENV=production`

**Resource Requirements**:
- CPU Request: 50m
- CPU Limit: 200m
- Memory Request: 64Mi
- Memory Limit: 256Mi

**Deployment Strategy**:
- Replicas: 2
- Rolling Update: maxSurge=1, maxUnavailable=0
- Readiness Probe: HTTP GET /api/health (initialDelay=10s, period=10s)
- Liveness Probe: HTTP GET /api/health (initialDelay=20s, period=10s)

**Service Specification**:
- Type: ClusterIP
- Port: 3001
- Target Port: 3000
- Selector: app=chatui

**Ingress Rule**:
- Path: `/chat/*`
- Backend: chatui-service:3001

---

### 4. Agent Runtime (OpenAI Agents SDK)

**Purpose**: AI agent for natural language processing (Phase III)

**Container Specification**:
- Base Image: `node:20-alpine`
- Exposed Port: 3000
- Health Check: `GET /health`
- Environment Variables:
  - `OPENAI_API_KEY` (from Secret)
  - `MCP_SERVER_URL` (from ConfigMap)
  - `BACKEND_API_URL` (from ConfigMap)

**Resource Requirements**:
- CPU Request: 100m
- CPU Limit: 500m
- Memory Request: 256Mi
- Memory Limit: 1Gi

**Deployment Strategy**:
- Replicas: 1 (stateful conversation context)
- Rolling Update: maxSurge=1, maxUnavailable=0
- Readiness Probe: HTTP GET /health (initialDelay=15s, period=10s)
- Liveness Probe: HTTP GET /health (initialDelay=30s, period=10s)

**Service Specification**:
- Type: ClusterIP
- Port: 3002
- Target Port: 3000
- Selector: app=agent

**Ingress Rule**: None (internal only)

---

### 5. MCP Server (MCP SDK)

**Purpose**: Tool execution layer for agent (Phase III)

**Container Specification**:
- Base Image: `node:20-alpine`
- Exposed Port: 3000
- Health Check: `GET /health`
- Environment Variables:
  - `BACKEND_API_URL` (from ConfigMap)
  - `LOG_LEVEL` (from ConfigMap)

**Resource Requirements**:
- CPU Request: 50m
- CPU Limit: 200m
- Memory Request: 128Mi
- Memory Limit: 512Mi

**Deployment Strategy**:
- Replicas: 1
- Rolling Update: maxSurge=1, maxUnavailable=0
- Readiness Probe: HTTP GET /health (initialDelay=10s, period=10s)
- Liveness Probe: HTTP GET /health (initialDelay=20s, period=10s)

**Service Specification**:
- Type: ClusterIP
- Port: 3003
- Target Port: 3000
- Selector: app=mcp-server

**Ingress Rule**: None (internal only)

---

### 6. Database (PostgreSQL)

**Purpose**: Persistent data storage (Phase II)

**Container Specification**:
- Base Image: `postgres:16-alpine`
- Exposed Port: 5432
- Health Check: `pg_isready`
- Environment Variables:
  - `POSTGRES_DB` (from ConfigMap)
  - `POSTGRES_USER` (from Secret)
  - `POSTGRES_PASSWORD` (from Secret)

**Resource Requirements**:
- CPU Request: 250m
- CPU Limit: 1000m
- Memory Request: 512Mi
- Memory Limit: 2Gi

**Deployment Strategy**:
- StatefulSet (not Deployment)
- Replicas: 1
- Update Strategy: RollingUpdate
- Readiness Probe: exec pg_isready (initialDelay=10s, period=10s)
- Liveness Probe: exec pg_isready (initialDelay=30s, period=10s)

**Service Specification**:
- Type: ClusterIP
- Port: 5432
- Target Port: 5432
- Selector: app=database

**Persistent Storage**:
- PersistentVolumeClaim: database-pvc
- Storage Class: standard (Minikube default)
- Access Mode: ReadWriteOnce
- Storage Size: 10Gi
- Mount Path: /var/lib/postgresql/data

**Ingress Rule**: None (internal only)

---

## Configuration Management

### ConfigMaps

#### backend-config
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: backend-config
  namespace: todo-ai
data:
  CORS_ORIGINS: "http://localhost:3000,http://localhost:3001"
  LOG_LEVEL: "info"
  DATABASE_HOST: "database-service.todo-ai.svc.cluster.local"
  DATABASE_PORT: "5432"
  DATABASE_NAME: "todo_db"
```

#### frontend-config
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: frontend-config
  namespace: todo-ai
data:
  NEXT_PUBLIC_API_URL: "http://backend-service.todo-ai.svc.cluster.local:8000"
```

#### chatui-config
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: chatui-config
  namespace: todo-ai
data:
  NEXT_PUBLIC_AGENT_URL: "http://agent-service.todo-ai.svc.cluster.local:3002"
```

#### agent-config
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: agent-config
  namespace: todo-ai
data:
  MCP_SERVER_URL: "http://mcp-server-service.todo-ai.svc.cluster.local:3003"
  BACKEND_API_URL: "http://backend-service.todo-ai.svc.cluster.local:8000"
  AGENT_MODEL: "gpt-4-turbo-preview"
  AGENT_TEMPERATURE: "0.7"
```

#### mcp-config
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: mcp-config
  namespace: todo-ai
data:
  BACKEND_API_URL: "http://backend-service.todo-ai.svc.cluster.local:8000/api/v1"
  LOG_LEVEL: "info"
```

---

## Secret Management

### Secrets

#### database-secret
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: database-secret
  namespace: todo-ai
type: Opaque
data:
  POSTGRES_USER: <base64-encoded>
  POSTGRES_PASSWORD: <base64-encoded>
  DATABASE_URL: <base64-encoded>
```

**Values** (base64 encoded):
- `POSTGRES_USER`: `todo_user`
- `POSTGRES_PASSWORD`: `<generated-secure-password>`
- `DATABASE_URL`: `postgresql://todo_user:<password>@database-service.todo-ai.svc.cluster.local:5432/todo_db`

#### agent-secret
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: agent-secret
  namespace: todo-ai
type: Opaque
data:
  OPENAI_API_KEY: <base64-encoded>
```

**Values** (base64 encoded):
- `OPENAI_API_KEY`: `<user-provided-openai-key>`

---

## Networking

### Ingress Configuration

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: todo-ai-ingress
  namespace: todo-ai
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /$2
    nginx.ingress.kubernetes.io/ssl-redirect: "false"
spec:
  ingressClassName: nginx
  rules:
  - host: todo-ai.local
    http:
      paths:
      - path: /api(/|$)(.*)
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 8000
      - path: /chat(/|$)(.*)
        pathType: Prefix
        backend:
          service:
            name: chatui-service
            port:
              number: 3001
      - path: /(.*)
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 3000
```

**Ingress Setup**:
1. Enable NGINX Ingress Controller in Minikube: `minikube addons enable ingress`
2. Add to `/etc/hosts`: `<minikube-ip> todo-ai.local`
3. Access via: `http://todo-ai.local`

### Service Discovery

All internal communication uses Kubernetes DNS:
- Backend API: `backend-service.todo-ai.svc.cluster.local:8000`
- Agent Runtime: `agent-service.todo-ai.svc.cluster.local:3002`
- MCP Server: `mcp-server-service.todo-ai.svc.cluster.local:3003`
- Database: `database-service.todo-ai.svc.cluster.local:5432`

---

## Health Checks

### Backend API Health Endpoint

```python
# app/main.py
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "backend-api",
        "timestamp": datetime.utcnow().isoformat()
    }
```

### Frontend/ChatUI Health Endpoint

```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({
    status: 'healthy',
    service: 'frontend',
    timestamp: new Date().toISOString()
  });
}
```

### Agent Runtime Health Endpoint

```typescript
// src/health.ts
export function healthCheck() {
  return {
    status: 'healthy',
    service: 'agent-runtime',
    timestamp: new Date().toISOString()
  };
}
```

### MCP Server Health Endpoint

```typescript
// src/health.ts
export function healthCheck() {
  return {
    status: 'healthy',
    service: 'mcp-server',
    timestamp: new Date().toISOString()
  };
}
```

### Database Health Check

PostgreSQL built-in: `pg_isready -U todo_user -d todo_db`

---

## Deployment Procedures

### Initial Deployment

1. **Start Minikube**:
```bash
minikube start --cpus=4 --memory=8192 --disk-size=20g
minikube addons enable ingress
```

2. **Create Namespace**:
```bash
kubectl create namespace todo-ai
kubectl config set-context --current --namespace=todo-ai
```

3. **Create Secrets**:
```bash
kubectl create secret generic database-secret \
  --from-literal=POSTGRES_USER=todo_user \
  --from-literal=POSTGRES_PASSWORD=<secure-password> \
  --from-literal=DATABASE_URL=postgresql://todo_user:<password>@database-service.todo-ai.svc.cluster.local:5432/todo_db \
  -n todo-ai

kubectl create secret generic agent-secret \
  --from-literal=OPENAI_API_KEY=<your-openai-key> \
  -n todo-ai
```

4. **Install Helm Chart**:
```bash
helm install todo-ai ./helm/todo-ai -n todo-ai
```

5. **Verify Deployment**:
```bash
kubectl get pods -n todo-ai
kubectl get services -n todo-ai
kubectl get ingress -n todo-ai
```

6. **Access Application**:
```bash
# Get Minikube IP
minikube ip

# Add to /etc/hosts
echo "$(minikube ip) todo-ai.local" | sudo tee -a /etc/hosts

# Access
open http://todo-ai.local
```

### Rolling Update

1. **Update Image Tag in Helm Values**:
```yaml
# values.yaml
backend:
  image:
    tag: v1.1.0  # Updated from v1.0.0
```

2. **Upgrade Helm Release**:
```bash
helm upgrade todo-ai ./helm/todo-ai -n todo-ai
```

3. **Monitor Rollout**:
```bash
kubectl rollout status deployment/backend -n todo-ai
```

4. **Verify New Pods**:
```bash
kubectl get pods -n todo-ai -l app=backend
```

### Rollback

1. **Rollback to Previous Version**:
```bash
helm rollback todo-ai -n todo-ai
```

2. **Or Rollback Specific Deployment**:
```bash
kubectl rollout undo deployment/backend -n todo-ai
```

3. **Verify Rollback**:
```bash
kubectl rollout status deployment/backend -n todo-ai
```

---

## Observability

### Logging

All containers log to stdout/stderr in JSON format:

```json
{
  "timestamp": "2026-01-08T10:30:00Z",
  "level": "info",
  "service": "backend-api",
  "message": "Task created",
  "task_id": 123,
  "user_id": "user-456"
}
```

**Log Aggregation**:
```bash
# View logs for specific pod
kubectl logs -f <pod-name> -n todo-ai

# View logs for all pods of a deployment
kubectl logs -f deployment/backend -n todo-ai

# View logs with label selector
kubectl logs -l app=backend -n todo-ai --tail=100
```

### Metrics

All services expose `/metrics` endpoint in Prometheus format:

```
# HELP http_requests_total Total HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",endpoint="/api/tasks",status="200"} 1234

# HELP http_request_duration_seconds HTTP request duration
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{le="0.1"} 100
http_request_duration_seconds_bucket{le="0.5"} 200
```

**Metrics Collection** (Optional - Prometheus):
```bash
# Install Prometheus
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/prometheus -n monitoring --create-namespace
```

### Resource Monitoring

```bash
# View resource usage
kubectl top pods -n todo-ai
kubectl top nodes

# View resource limits
kubectl describe pod <pod-name> -n todo-ai | grep -A 5 "Limits"
```

---

## Troubleshooting

### Common Issues

#### 1. Pods Not Starting

**Symptoms**: Pods stuck in `Pending` or `CrashLoopBackOff`

**Diagnosis**:
```bash
kubectl describe pod <pod-name> -n todo-ai
kubectl logs <pod-name> -n todo-ai
```

**Common Causes**:
- Insufficient resources (check `kubectl top nodes`)
- Image pull errors (check image tag and registry)
- Missing secrets or ConfigMaps
- Failed health checks

#### 2. Service Not Accessible

**Symptoms**: Cannot access service via Ingress

**Diagnosis**:
```bash
kubectl get ingress -n todo-ai
kubectl describe ingress todo-ai-ingress -n todo-ai
kubectl get endpoints -n todo-ai
```

**Common Causes**:
- Ingress controller not installed (`minikube addons enable ingress`)
- DNS not configured (`/etc/hosts` entry missing)
- Service selector mismatch
- Pods not ready (failing health checks)

#### 3. Database Connection Errors

**Symptoms**: Backend cannot connect to database

**Diagnosis**:
```bash
kubectl logs deployment/backend -n todo-ai | grep -i database
kubectl exec -it <backend-pod> -n todo-ai -- env | grep DATABASE
```

**Common Causes**:
- Database pod not ready
- Incorrect DATABASE_URL in secret
- Network policy blocking connection
- Database credentials incorrect

#### 4. Agent Not Responding

**Symptoms**: Chat UI shows errors or timeouts

**Diagnosis**:
```bash
kubectl logs deployment/agent -n todo-ai
kubectl logs deployment/mcp-server -n todo-ai
```

**Common Causes**:
- OpenAI API key missing or invalid
- MCP server not reachable
- Agent pod out of memory (check resource limits)
- Backend API not reachable from agent

---

## User Stories and Acceptance Criteria

### User Story 1: Deploy System to Minikube

**As a** developer
**I want to** deploy the entire Todo AI System to Minikube
**So that** I can test the system in a Kubernetes environment

**Acceptance Criteria**:
- ✅ All 6 components deploy successfully
- ✅ All pods reach `Running` state
- ✅ All health checks pass
- ✅ Ingress routes traffic correctly
- ✅ Frontend accessible at `http://todo-ai.local`
- ✅ Chat UI accessible at `http://todo-ai.local/chat`
- ✅ Backend API accessible at `http://todo-ai.local/api`

**Priority**: P1 (Must Have)

---

### User Story 2: Zero-Downtime Rolling Update

**As a** developer
**I want to** update a component without downtime
**So that** users experience no service interruption

**Acceptance Criteria**:
- ✅ Rolling update completes successfully
- ✅ No 5xx errors during update
- ✅ Old pods terminate only after new pods are ready
- ✅ Rollback works if update fails
- ✅ Database migrations run before new pods start

**Priority**: P1 (Must Have)

---

### User Story 3: Service-to-Service Communication

**As a** system
**I want** components to communicate via Kubernetes DNS
**So that** services can discover each other dynamically

**Acceptance Criteria**:
- ✅ Agent can reach MCP server via cluster DNS
- ✅ MCP server can reach backend API via cluster DNS
- ✅ Backend can reach database via cluster DNS
- ✅ No hardcoded IP addresses in configuration
- ✅ Services remain accessible after pod restarts

**Priority**: P1 (Must Have)

---

### User Story 4: Persistent Data Storage

**As a** system
**I want** database data to persist across pod restarts
**So that** no data is lost during deployments

**Acceptance Criteria**:
- ✅ Database uses PersistentVolumeClaim
- ✅ Data persists after database pod restart
- ✅ Data persists after database pod deletion and recreation
- ✅ Volume can be backed up
- ✅ Volume can be restored from backup

**Priority**: P1 (Must Have)

---

### User Story 5: Secret Management

**As a** developer
**I want** sensitive data stored in Kubernetes Secrets
**So that** credentials are not exposed in code or logs

**Acceptance Criteria**:
- ✅ Database credentials in Secret
- ✅ OpenAI API key in Secret
- ✅ Secrets mounted as environment variables
- ✅ Secrets not visible in pod specs
- ✅ Secrets can be rotated without code changes

**Priority**: P1 (Must Have)

---

### User Story 6: Observability

**As a** developer
**I want** to view logs and metrics for all components
**So that** I can debug issues and monitor performance

**Acceptance Criteria**:
- ✅ All components log to stdout in JSON format
- ✅ Logs accessible via `kubectl logs`
- ✅ Health endpoints return status
- ✅ Resource usage visible via `kubectl top`
- ✅ Metrics endpoints expose Prometheus metrics

**Priority**: P2 (Should Have)

---

### User Story 7: kagent and kubectl-ai Integration

**As a** developer
**I want** to use kagent and kubectl-ai for operations
**So that** I can manage Kubernetes with natural language

**Acceptance Criteria**:
- ✅ kagent can deploy from specifications
- ✅ kubectl-ai can query cluster state
- ✅ kubectl-ai can perform common operations
- ✅ Operations align with specifications
- ✅ No manual YAML editing required

**Priority**: P2 (Should Have)

---

## Success Criteria

### Functional Requirements

- ✅ FR-001: All components deploy to Minikube successfully
- ✅ FR-002: All pods reach Running state with passing health checks
- ✅ FR-003: External access via Ingress works for all user-facing services
- ✅ FR-004: Internal service-to-service communication works via cluster DNS
- ✅ FR-005: Database data persists across pod restarts
- ✅ FR-006: Secrets are managed via Kubernetes Secrets
- ✅ FR-007: Configuration is managed via ConfigMaps
- ✅ FR-008: Rolling updates complete without downtime
- ✅ FR-009: Rollback works correctly
- ✅ FR-010: All infrastructure generated from specifications (no manual YAML)

### Non-Functional Requirements

- ✅ NFR-001: Pod startup time < 30 seconds (p95)
- ✅ NFR-002: Rolling update time < 2 minutes
- ✅ NFR-003: Zero downtime during rolling updates
- ✅ NFR-004: Resource limits prevent pod OOM kills
- ✅ NFR-005: Health checks detect unhealthy pods within 30 seconds
- ✅ NFR-006: Logs are structured and queryable
- ✅ NFR-007: All components pass security scanning

---

## Out of Scope (Phase V+)

- ❌ Multi-cluster deployment
- ❌ Production-grade monitoring (Prometheus, Grafana)
- ❌ Production-grade logging (ELK, Loki)
- ❌ Autoscaling (HPA, VPA)
- ❌ Service mesh (Istio, Linkerd)
- ❌ GitOps (ArgoCD, Flux)
- ❌ CI/CD pipelines
- ❌ Disaster recovery procedures
- ❌ Multi-region deployment
- ❌ Cloud provider deployment (EKS, GKE, AKS)

---

## Dependencies

### External Tools
- Minikube 1.32+
- kubectl 1.28+
- Helm 3.x
- Docker 24+
- kagent (AI-powered Kubernetes agent)
- kubectl-ai (AI-powered kubectl plugin)

### Container Images
- `python:3.11-alpine` (Backend)
- `node:20-alpine` (Frontend, ChatUI, Agent, MCP)
- `postgres:16-alpine` (Database)

### Kubernetes Resources
- Namespace: todo-ai
- Deployments: 5 (backend, frontend, chatui, agent, mcp-server)
- StatefulSets: 1 (database)
- Services: 6 (one per component)
- Ingress: 1 (NGINX)
- ConfigMaps: 5 (one per component)
- Secrets: 2 (database, agent)
- PersistentVolumeClaims: 1 (database)

---

## Risk Analysis

### Risk 1: Resource Constraints in Minikube
**Impact**: High
**Probability**: Medium
**Mitigation**: Set appropriate resource limits; monitor with `kubectl top`; increase Minikube resources if needed

### Risk 2: Image Build Failures
**Impact**: High
**Probability**: Low
**Mitigation**: Multi-stage builds; layer caching; CI/CD validation

### Risk 3: Database Migration Failures
**Impact**: High
**Probability**: Medium
**Mitigation**: Run migrations as init containers; test migrations in staging; support rollback

### Risk 4: Service Discovery Issues
**Impact**: Medium
**Probability**: Low
**Mitigation**: Use full DNS names; test connectivity with debug pods; verify CoreDNS is running

### Risk 5: Secret Leakage
**Impact**: High
**Probability**: Low
**Mitigation**: Never commit secrets to git; use sealed secrets or external secret managers in production; rotate secrets regularly

---

## Testing Strategy

### Unit Tests
- Dockerfile builds successfully
- Helm charts pass `helm lint`
- Kubernetes manifests pass `kubectl apply --dry-run`

### Integration Tests
- All pods start successfully
- Health checks pass
- Service-to-service communication works
- External access via Ingress works

### End-to-End Tests
- Deploy entire system
- Create task via web UI
- Create task via chat UI
- Verify task in database
- Perform rolling update
- Verify zero downtime

---

**Version**: 4.0.0
**Last Updated**: 2026-01-08
**Status**: Ready for Docker and Helm Specifications
