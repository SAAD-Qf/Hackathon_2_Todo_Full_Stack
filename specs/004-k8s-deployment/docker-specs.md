# Docker Container Specifications

**Feature**: Kubernetes Deployment - Container Specifications
**Created**: 2026-01-08
**Status**: Implementation Ready
**Constitution**: Phase IV (v4.0.0)

## Overview

This document specifies the Dockerfile implementations for all 6 components of the Todo AI System. Each Dockerfile uses multi-stage builds for optimization, runs as non-root user, and includes health check endpoints.

**Critical Constraint**: All Dockerfiles MUST be generated from these specifications. No manual editing is permitted.

---

## 1. Backend API (FastAPI) Dockerfile

### Specification

**Base Image**: `python:3.11-alpine`
**Build Strategy**: Multi-stage (builder + runtime)
**User**: Non-root (uid 1000)
**Exposed Port**: 8000
**Health Check**: HTTP GET /health

### Dockerfile

```dockerfile
# Backend API Dockerfile
# Phase IV - Kubernetes Deployment
# Generated from spec: specs/004-k8s-deployment/docker-specs.md

# Stage 1: Builder
FROM python:3.11-alpine AS builder

WORKDIR /build

# Install build dependencies
RUN apk add --no-cache \
    gcc \
    musl-dev \
    postgresql-dev \
    python3-dev

# Copy requirements
COPY backend/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --user -r requirements.txt

# Stage 2: Runtime
FROM python:3.11-alpine

# Install runtime dependencies
RUN apk add --no-cache \
    libpq \
    && adduser -D -u 1000 appuser

WORKDIR /app

# Copy Python packages from builder
COPY --from=builder /root/.local /home/appuser/.local

# Copy application code
COPY backend/app ./app
COPY backend/alembic ./alembic
COPY backend/alembic.ini .

# Set environment variables
ENV PATH=/home/appuser/.local/bin:$PATH \
    PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8000/health || exit 1

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Build Command

```bash
docker build -t todo-backend:v1.0.0 -f backend/Dockerfile .
```

### Environment Variables

Required at runtime:
- `DATABASE_URL` - PostgreSQL connection string (from Secret)
- `CORS_ORIGINS` - Allowed CORS origins (from ConfigMap)
- `LOG_LEVEL` - Logging level (from ConfigMap)

---

## 2. Frontend Web UI (Next.js) Dockerfile

### Specification

**Base Image**: `node:20-alpine`
**Build Strategy**: Multi-stage (builder + runtime)
**User**: Non-root (uid 1000)
**Exposed Port**: 3000
**Health Check**: HTTP GET /api/health

### Dockerfile

```dockerfile
# Frontend Web UI Dockerfile
# Phase IV - Kubernetes Deployment
# Generated from spec: specs/004-k8s-deployment/docker-specs.md

# Stage 1: Dependencies
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Stage 2: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY frontend/ .

# Build application
RUN npm run build

# Stage 3: Runtime
FROM node:20-alpine

# Create non-root user
RUN adduser -D -u 1000 appuser

WORKDIR /app

# Copy built application
COPY --from=builder --chown=appuser:appuser /app/.next/standalone ./
COPY --from=builder --chown=appuser:appuser /app/.next/static ./.next/static
COPY --from=builder --chown=appuser:appuser /app/public ./public

# Set environment variables
ENV NODE_ENV=production \
    PORT=3000

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Run application
CMD ["node", "server.js"]
```

### Build Command

```bash
docker build -t todo-frontend:v1.0.0 -f frontend/Dockerfile .
```

### Environment Variables

Required at runtime:
- `NEXT_PUBLIC_API_URL` - Backend API URL (from ConfigMap)

### Next.js Configuration

Add to `frontend/next.config.js`:

```javascript
module.exports = {
  output: 'standalone',
  // ... other config
};
```

---

## 3. Chat UI (ChatKit) Dockerfile

### Specification

**Base Image**: `node:20-alpine`
**Build Strategy**: Multi-stage (builder + runtime)
**User**: Non-root (uid 1000)
**Exposed Port**: 3000
**Health Check**: HTTP GET /api/health

### Dockerfile

```dockerfile
# Chat UI Dockerfile
# Phase IV - Kubernetes Deployment
# Generated from spec: specs/004-k8s-deployment/docker-specs.md

# Stage 1: Dependencies
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files
COPY chatkit-ui/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Stage 2: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY chatkit-ui/ .

# Build application
RUN npm run build

# Stage 3: Runtime
FROM node:20-alpine

# Create non-root user
RUN adduser -D -u 1000 appuser

WORKDIR /app

# Copy built application
COPY --from=builder --chown=appuser:appuser /app/.next/standalone ./
COPY --from=builder --chown=appuser:appuser /app/.next/static ./.next/static
COPY --from=builder --chown=appuser:appuser /app/public ./public

# Set environment variables
ENV NODE_ENV=production \
    PORT=3000

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Run application
CMD ["node", "server.js"]
```

### Build Command

```bash
docker build -t todo-chatui:v1.0.0 -f chatkit-ui/Dockerfile .
```

### Environment Variables

Required at runtime:
- `NEXT_PUBLIC_AGENT_URL` - Agent service URL (from ConfigMap)

---

## 4. Agent Runtime (OpenAI Agents SDK) Dockerfile

### Specification

**Base Image**: `node:20-alpine`
**Build Strategy**: Multi-stage (builder + runtime)
**User**: Non-root (uid 1000)
**Exposed Port**: 3000
**Health Check**: HTTP GET /health

### Dockerfile

```dockerfile
# Agent Runtime Dockerfile
# Phase IV - Kubernetes Deployment
# Generated from spec: specs/004-k8s-deployment/docker-specs.md

# Stage 1: Dependencies
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files
COPY agent-runtime/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Stage 2: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY agent-runtime/ .

# Build TypeScript
RUN npm run build

# Stage 3: Runtime
FROM node:20-alpine

# Create non-root user
RUN adduser -D -u 1000 appuser

WORKDIR /app

# Copy dependencies and built code
COPY --from=builder --chown=appuser:appuser /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appuser /app/dist ./dist
COPY --from=builder --chown=appuser:appuser /app/package.json ./

# Set environment variables
ENV NODE_ENV=production \
    PORT=3000

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Run application
CMD ["node", "dist/index.js"]
```

### Build Command

```bash
docker build -t todo-agent:v1.0.0 -f agent-runtime/Dockerfile .
```

### Environment Variables

Required at runtime:
- `OPENAI_API_KEY` - OpenAI API key (from Secret)
- `MCP_SERVER_URL` - MCP server URL (from ConfigMap)
- `BACKEND_API_URL` - Backend API URL (from ConfigMap)
- `AGENT_MODEL` - Model name (from ConfigMap)
- `AGENT_TEMPERATURE` - Temperature setting (from ConfigMap)

---

## 5. MCP Server (MCP SDK) Dockerfile

### Specification

**Base Image**: `node:20-alpine`
**Build Strategy**: Multi-stage (builder + runtime)
**User**: Non-root (uid 1000)
**Exposed Port**: 3000
**Health Check**: HTTP GET /health

### Dockerfile

```dockerfile
# MCP Server Dockerfile
# Phase IV - Kubernetes Deployment
# Generated from spec: specs/004-k8s-deployment/docker-specs.md

# Stage 1: Dependencies
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files
COPY mcp-server/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Stage 2: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY mcp-server/ .

# Build TypeScript
RUN npm run build

# Stage 3: Runtime
FROM node:20-alpine

# Create non-root user
RUN adduser -D -u 1000 appuser

WORKDIR /app

# Copy dependencies and built code
COPY --from=builder --chown=appuser:appuser /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appuser /app/dist ./dist
COPY --from=builder --chown=appuser:appuser /app/package.json ./

# Set environment variables
ENV NODE_ENV=production \
    PORT=3000

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Run application
CMD ["node", "dist/index.js"]
```

### Build Command

```bash
docker build -t todo-mcp-server:v1.0.0 -f mcp-server/Dockerfile .
```

### Environment Variables

Required at runtime:
- `BACKEND_API_URL` - Backend API URL (from ConfigMap)
- `LOG_LEVEL` - Logging level (from ConfigMap)

---

## 6. Database (PostgreSQL) - No Custom Dockerfile

### Specification

**Base Image**: `postgres:16-alpine` (official image)
**Customization**: None required
**User**: postgres (default)
**Exposed Port**: 5432
**Health Check**: pg_isready

### Usage

Use official PostgreSQL image directly:

```yaml
# In Kubernetes manifest
spec:
  containers:
  - name: database
    image: postgres:16-alpine
    env:
    - name: POSTGRES_DB
      valueFrom:
        configMapKeyRef:
          name: database-config
          key: POSTGRES_DB
    - name: POSTGRES_USER
      valueFrom:
        secretKeyRef:
          name: database-secret
          key: POSTGRES_USER
    - name: POSTGRES_PASSWORD
      valueFrom:
        secretKeyRef:
          name: database-secret
          key: POSTGRES_PASSWORD
```

### Initialization Scripts (Optional)

If custom initialization is needed, create `database/init.sql`:

```sql
-- Database initialization script
-- Phase IV - Kubernetes Deployment

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE todo_db TO todo_user;
```

Mount as volume:

```yaml
volumeMounts:
- name: init-scripts
  mountPath: /docker-entrypoint-initdb.d
```

---

## Health Check Endpoint Implementations

### Backend API (FastAPI)

Add to `backend/app/main.py`:

```python
from fastapi import FastAPI
from datetime import datetime

app = FastAPI()

@app.get("/health")
async def health_check():
    """Health check endpoint for Kubernetes probes"""
    return {
        "status": "healthy",
        "service": "backend-api",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }

@app.get("/ready")
async def readiness_check():
    """Readiness check - verify database connection"""
    try:
        # Test database connection
        from app.database import engine
        with engine.connect() as conn:
            conn.execute("SELECT 1")
        return {
            "status": "ready",
            "service": "backend-api",
            "database": "connected"
        }
    except Exception as e:
        return {
            "status": "not_ready",
            "service": "backend-api",
            "database": "disconnected",
            "error": str(e)
        }, 503
```

### Frontend/ChatUI (Next.js)

Create `app/api/health/route.ts`:

```typescript
// Health check endpoint for Kubernetes probes
export async function GET() {
  return Response.json({
    status: 'healthy',
    service: 'frontend',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
}
```

### Agent Runtime

Add to `agent-runtime/src/index.ts`:

```typescript
import express from 'express';

const app = express();

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'agent-runtime',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/ready', async (req, res) => {
  try {
    // Test MCP server connection
    const mcpResponse = await fetch(`${process.env.MCP_SERVER_URL}/health`);
    if (!mcpResponse.ok) throw new Error('MCP server not ready');

    res.json({
      status: 'ready',
      service: 'agent-runtime',
      mcp_server: 'connected'
    });
  } catch (error) {
    res.status(503).json({
      status: 'not_ready',
      service: 'agent-runtime',
      mcp_server: 'disconnected',
      error: error.message
    });
  }
});

app.listen(3000);
```

### MCP Server

Add to `mcp-server/src/index.ts`:

```typescript
import express from 'express';

const app = express();

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'mcp-server',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/ready', async (req, res) => {
  try {
    // Test backend API connection
    const backendResponse = await fetch(`${process.env.BACKEND_API_URL}/health`);
    if (!backendResponse.ok) throw new Error('Backend API not ready');

    res.json({
      status: 'ready',
      service: 'mcp-server',
      backend_api: 'connected'
    });
  } catch (error) {
    res.status(503).json({
      status: 'not_ready',
      service: 'mcp-server',
      backend_api: 'disconnected',
      error: error.message
    });
  }
});

app.listen(3000);
```

---

## Build Script

### build-all.sh

```bash
#!/bin/bash
# Build all Docker images
# Phase IV - Kubernetes Deployment

set -e

VERSION=${1:-v1.0.0}
REGISTRY=${2:-""}

echo "Building all Docker images with version: $VERSION"

# Backend API
echo "Building backend..."
docker build -t ${REGISTRY}todo-backend:${VERSION} -f backend/Dockerfile .

# Frontend Web UI
echo "Building frontend..."
docker build -t ${REGISTRY}todo-frontend:${VERSION} -f frontend/Dockerfile .

# Chat UI
echo "Building chatui..."
docker build -t ${REGISTRY}todo-chatui:${VERSION} -f chatkit-ui/Dockerfile .

# Agent Runtime
echo "Building agent..."
docker build -t ${REGISTRY}todo-agent:${VERSION} -f agent-runtime/Dockerfile .

# MCP Server
echo "Building mcp-server..."
docker build -t ${REGISTRY}todo-mcp-server:${VERSION} -f mcp-server/Dockerfile .

echo "All images built successfully!"

# Tag as latest
echo "Tagging as latest..."
docker tag ${REGISTRY}todo-backend:${VERSION} ${REGISTRY}todo-backend:latest
docker tag ${REGISTRY}todo-frontend:${VERSION} ${REGISTRY}todo-frontend:latest
docker tag ${REGISTRY}todo-chatui:${VERSION} ${REGISTRY}todo-chatui:latest
docker tag ${REGISTRY}todo-agent:${VERSION} ${REGISTRY}todo-agent:latest
docker tag ${REGISTRY}todo-mcp-server:${VERSION} ${REGISTRY}todo-mcp-server:latest

echo "Done!"
```

### Usage

```bash
# Build all images with version v1.0.0
./build-all.sh v1.0.0

# Build with registry prefix
./build-all.sh v1.0.0 myregistry.io/
```

---

## Push Script

### push-all.sh

```bash
#!/bin/bash
# Push all Docker images to registry
# Phase IV - Kubernetes Deployment

set -e

VERSION=${1:-v1.0.0}
REGISTRY=${2:-""}

if [ -z "$REGISTRY" ]; then
  echo "Error: Registry required for push"
  echo "Usage: ./push-all.sh <version> <registry>"
  exit 1
fi

echo "Pushing all Docker images to $REGISTRY with version: $VERSION"

# Push versioned images
docker push ${REGISTRY}todo-backend:${VERSION}
docker push ${REGISTRY}todo-frontend:${VERSION}
docker push ${REGISTRY}todo-chatui:${VERSION}
docker push ${REGISTRY}todo-agent:${VERSION}
docker push ${REGISTRY}todo-mcp-server:${VERSION}

# Push latest tags
docker push ${REGISTRY}todo-backend:latest
docker push ${REGISTRY}todo-frontend:latest
docker push ${REGISTRY}todo-chatui:latest
docker push ${REGISTRY}todo-agent:latest
docker push ${REGISTRY}todo-mcp-server:latest

echo "All images pushed successfully!"
```

### Usage

```bash
# Push to Docker Hub
./push-all.sh v1.0.0 myusername/

# Push to private registry
./push-all.sh v1.0.0 registry.example.com/todo-ai/
```

---

## Minikube Local Registry

For local development with Minikube, use Minikube's Docker daemon:

```bash
# Point Docker CLI to Minikube's Docker daemon
eval $(minikube docker-env)

# Build images (they'll be available in Minikube)
./build-all.sh v1.0.0

# Verify images
docker images | grep todo-

# In Kubernetes manifests, use imagePullPolicy: Never
```

---

## Security Best Practices

### 1. Non-Root User

All containers run as non-root user (uid 1000):

```dockerfile
RUN adduser -D -u 1000 appuser
USER appuser
```

### 2. Minimal Base Images

Use Alpine Linux for minimal attack surface:

```dockerfile
FROM python:3.11-alpine
FROM node:20-alpine
```

### 3. Multi-Stage Builds

Separate build and runtime stages:

```dockerfile
FROM node:20-alpine AS builder
# ... build steps ...

FROM node:20-alpine
COPY --from=builder /app/dist ./dist
```

### 4. No Secrets in Images

Never include secrets in Dockerfiles:

```dockerfile
# ❌ WRONG
ENV OPENAI_API_KEY=sk-...

# ✅ CORRECT
# Inject via Kubernetes Secret at runtime
```

### 5. Specific Image Tags

Never use `:latest` in production:

```dockerfile
# ❌ WRONG
FROM node:latest

# ✅ CORRECT
FROM node:20-alpine
```

### 6. Security Scanning

Scan images for vulnerabilities:

```bash
# Using Trivy
trivy image todo-backend:v1.0.0

# Using Docker Scout
docker scout cves todo-backend:v1.0.0
```

---

## Testing Dockerfiles

### Local Testing

```bash
# Build image
docker build -t todo-backend:test -f backend/Dockerfile .

# Run container
docker run -d -p 8000:8000 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  -e CORS_ORIGINS=http://localhost:3000 \
  -e LOG_LEVEL=info \
  --name backend-test \
  todo-backend:test

# Check health
curl http://localhost:8000/health

# View logs
docker logs backend-test

# Stop and remove
docker stop backend-test
docker rm backend-test
```

### Docker Compose Testing

Create `docker-compose.test.yml`:

```yaml
version: '3.8'

services:
  database:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: todo_db
      POSTGRES_USER: todo_user
      POSTGRES_PASSWORD: test_password
    ports:
      - "5432:5432"

  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://todo_user:test_password@database:5432/todo_db
      CORS_ORIGINS: http://localhost:3000
      LOG_LEVEL: info
    depends_on:
      - database

  frontend:
    build:
      context: .
      dockerfile: frontend/Dockerfile
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://backend:8000
    depends_on:
      - backend
```

Run tests:

```bash
docker-compose -f docker-compose.test.yml up -d
docker-compose -f docker-compose.test.yml ps
docker-compose -f docker-compose.test.yml logs
docker-compose -f docker-compose.test.yml down
```

---

## Success Criteria

- ✅ All Dockerfiles use multi-stage builds
- ✅ All containers run as non-root user
- ✅ All containers have health check endpoints
- ✅ All containers use Alpine base images
- ✅ All containers pass security scanning
- ✅ All containers build successfully
- ✅ All containers start and respond to health checks
- ✅ No secrets in container images
- ✅ Specific image tags (no :latest)
- ✅ Build scripts work correctly

---

**Version**: 1.0.0
**Last Updated**: 2026-01-08
**Status**: Implementation Ready
