# Dapr Configuration Specifications

**Feature**: Cloud-Native Event-Driven - Dapr Components
**Created**: 2026-01-08
**Status**: Implementation Ready
**Constitution**: Phase V (v5.0.0)

## Overview

This document specifies all Dapr component configurations for the Todo AI System. Dapr provides portable, event-driven runtime with built-in best practices for microservices. All Dapr configurations MUST be generated from these specifications.

**Critical Constraint**: All Dapr component YAML files MUST be generated from these specifications. No manual editing is permitted.

---

## Dapr Architecture

### Sidecar Pattern

Each service that needs Dapr capabilities gets a sidecar container:

```
┌─────────────────────────────────────┐
│           Kubernetes Pod             │
├─────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐│
│  │   Service    │  │    Dapr      ││
│  │  Container   │◄─┤   Sidecar    ││
│  │              │  │              ││
│  │  (Backend)   │  │  (daprd)     ││
│  └──────────────┘  └──────────────┘│
│         │                  │        │
│         │                  │        │
│         ▼                  ▼        │
│    App Logic         Dapr APIs     │
│                      - Pub/Sub     │
│                      - State       │
│                      - Secrets     │
│                      - Invocation  │
└─────────────────────────────────────┘
```

### Dapr Control Plane

Dapr control plane components run in `dapr-system` namespace:

- **dapr-operator**: Manages Dapr components and configurations
- **dapr-sidecar-injector**: Injects Dapr sidecars into pods
- **dapr-placement**: Manages actor placement (not used in Phase V)
- **dapr-sentry**: Certificate authority for mTLS

---

## Component 1: Pub/Sub (Kafka)

### Purpose

Enables services to publish and subscribe to events via Kafka without direct Kafka client code.

### Component Specification

```yaml
# dapr-components/pubsub-kafka.yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
  namespace: todo-ai
spec:
  type: pubsub.kafka
  version: v1
  metadata:
  # Kafka brokers
  - name: brokers
    value: "kafka-broker-1.kafka.svc.cluster.local:9092,kafka-broker-2.kafka.svc.cluster.local:9092,kafka-broker-3.kafka.svc.cluster.local:9092"

  # Consumer configuration
  - name: consumerGroup
    value: "{appId}"  # Uses app-id from Dapr annotation
  - name: clientId
    value: "{appId}"
  - name: consumeRetryInterval
    value: "200ms"
  - name: consumeRetryEnabled
    value: "true"

  # Producer configuration
  - name: maxMessageBytes
    value: "1024000"  # 1MB max message size
  - name: compressionType
    value: "snappy"

  # Authentication (for production)
  - name: authType
    value: "none"  # Change to "sasl" for production
  # - name: saslUsername
  #   secretKeyRef:
  #     name: kafka-secret
  #     key: username
  # - name: saslPassword
  #   secretKeyRef:
  #     name: kafka-secret
  #     key: password
  # - name: saslMechanism
  #   value: "PLAIN"

  # TLS (for production)
  # - name: enableTLS
  #   value: "true"
  # - name: caCert
  #   secretKeyRef:
  #     name: kafka-tls-secret
  #     key: ca.crt

  # Kafka version
  - name: version
    value: "3.0.0"

  # Offset management
  - name: initialOffset
    value: "newest"  # or "oldest" for replay

  # Session timeout
  - name: sessionTimeout
    value: "10s"
  - name: heartbeatInterval
    value: "3s"
```

### Usage in Services

**Backend API (Publisher)**:
```python
# backend/app/events/publisher.py
from dapr.clients import DaprClient
import json

def publish_task_created(task_data: dict):
    with DaprClient() as client:
        event = {
            "event_id": str(uuid.uuid4()),
            "event_type": "task.created",
            "event_version": "v1.0.0",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "correlation_id": str(uuid.uuid4()),
            "tenant_id": "tenant-123",
            "data": task_data
        }

        # Publish to Kafka via Dapr
        client.publish_event(
            pubsub_name='pubsub',
            topic_name='tasks',
            data=json.dumps(event),
            data_content_type='application/json'
        )
```

**Reminder Engine (Subscriber)**:
```python
# reminder-engine/app/main.py
from dapr.ext.fastapi import DaprApp
from fastapi import FastAPI

app = FastAPI()
dapr_app = DaprApp(app)

@dapr_app.subscribe(pubsub_name='pubsub', topic='tasks')
async def task_event_handler(event_data: dict):
    event_type = event_data.get('event_type')

    if event_type == 'task.created':
        await handle_task_created(event_data)
    elif event_type == 'task.updated':
        await handle_task_updated(event_data)
    elif event_type == 'task.completed':
        await handle_task_completed(event_data)
    elif event_type == 'task.deleted':
        await handle_task_deleted(event_data)

    return {'success': True}
```

---

## Component 2: State Store (Redis - Optional)

### Purpose

Provides distributed state management for services that need to store state (e.g., Reminder Engine scheduler state).

### Component Specification

```yaml
# dapr-components/statestore-redis.yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
  namespace: todo-ai
spec:
  type: state.redis
  version: v1
  metadata:
  # Redis connection
  - name: redisHost
    value: "redis-master.todo-ai.svc.cluster.local:6379"
  - name: redisPassword
    secretKeyRef:
      name: redis-secret
      key: password

  # Connection pool
  - name: maxRetries
    value: "3"
  - name: maxRetryBackoff
    value: "2s"
  - name: enableTLS
    value: "false"

  # Key prefix
  - name: keyPrefix
    value: "todo-ai"

  # TTL
  - name: ttlInSeconds
    value: "86400"  # 24 hours default
```

### Redis Deployment

```yaml
# redis/redis-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis-master
  namespace: todo-ai
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
      role: master
  template:
    metadata:
      labels:
        app: redis
        role: master
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        ports:
        - containerPort: 6379
        env:
        - name: REDIS_PASSWORD
          valueFrom:
            secretKeyRef:
              name: redis-secret
              key: password
        command:
        - redis-server
        - --requirepass
        - $(REDIS_PASSWORD)
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 500m
            memory: 512Mi
---
apiVersion: v1
kind: Service
metadata:
  name: redis-master
  namespace: todo-ai
spec:
  type: ClusterIP
  ports:
  - port: 6379
    targetPort: 6379
  selector:
    app: redis
    role: master
```

### Usage in Reminder Engine

```python
# reminder-engine/app/state.py
from dapr.clients import DaprClient

def save_reminder_state(task_id: int, reminder_time: str):
    with DaprClient() as client:
        state_key = f"reminder:{task_id}"
        state_value = {
            "task_id": task_id,
            "reminder_time": reminder_time,
            "status": "scheduled"
        }

        client.save_state(
            store_name='statestore',
            key=state_key,
            value=json.dumps(state_value)
        )

def get_reminder_state(task_id: int):
    with DaprClient() as client:
        state_key = f"reminder:{task_id}"
        state = client.get_state(
            store_name='statestore',
            key=state_key
        )
        return json.loads(state.data) if state.data else None

def delete_reminder_state(task_id: int):
    with DaprClient() as client:
        state_key = f"reminder:{task_id}"
        client.delete_state(
            store_name='statestore',
            key=state_key
        )
```

---

## Component 3: Secret Store (Kubernetes)

### Purpose

Provides secure access to Kubernetes secrets without mounting them as volumes.

### Component Specification

```yaml
# dapr-components/secretstore-kubernetes.yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: secretstore
  namespace: todo-ai
spec:
  type: secretstores.kubernetes
  version: v1
  metadata:
  - name: vaultKubernetesMountPath
    value: "kubernetes"
  - name: vaultAddr
    value: "http://vault:8200"
```

### Usage in Services

```python
# backend/app/config.py
from dapr.clients import DaprClient

def get_database_password():
    with DaprClient() as client:
        secret = client.get_secret(
            store_name='secretstore',
            key='database-secret',
            metadata={'namespace': 'todo-ai'}
        )
        return secret.secret['POSTGRES_PASSWORD']

def get_openai_api_key():
    with DaprClient() as client:
        secret = client.get_secret(
            store_name='secretstore',
            key='agent-secret',
            metadata={'namespace': 'todo-ai'}
        )
        return secret.secret['OPENAI_API_KEY']
```

---

## Component 4: Resiliency Policy

### Purpose

Defines retry, timeout, and circuit breaker policies for Dapr operations.

### Component Specification

```yaml
# dapr-components/resiliency-policy.yaml
apiVersion: dapr.io/v1alpha1
kind: Resiliency
metadata:
  name: default-resiliency
  namespace: todo-ai
spec:
  policies:
    # Retry policies
    retries:
      # Pub/sub retry policy
      pubsubRetry:
        policy: exponential
        duration: 1s
        maxDuration: 60s
        maxRetries: 10
        maxInterval: 60s

      # Service invocation retry policy
      serviceRetry:
        policy: constant
        duration: 1s
        maxRetries: 3

      # State store retry policy
      stateRetry:
        policy: exponential
        duration: 500ms
        maxDuration: 30s
        maxRetries: 5

    # Timeout policies
    timeouts:
      general:
        timeout: 30s

      pubsubTimeout:
        timeout: 60s

      stateTimeout:
        timeout: 10s

    # Circuit breaker policies
    circuitBreakers:
      pubsubCB:
        maxRequests: 5
        interval: 10s
        timeout: 60s
        trip: consecutiveFailures >= 5

      serviceCB:
        maxRequests: 3
        interval: 5s
        timeout: 30s
        trip: consecutiveFailures >= 3

      stateCB:
        maxRequests: 5
        interval: 10s
        timeout: 30s
        trip: consecutiveFailures >= 5

  # Apply policies to targets
  targets:
    # App-level policies
    apps:
      backend:
        retry: pubsubRetry
        timeout: pubsubTimeout
        circuitBreaker: pubsubCB

      reminder-engine:
        retry: pubsubRetry
        timeout: pubsubTimeout
        circuitBreaker: pubsubCB

      mcp-server:
        retry: serviceRetry
        timeout: general
        circuitBreaker: serviceCB

    # Component-level policies
    components:
      pubsub:
        outbound:
          retry: pubsubRetry
          timeout: pubsubTimeout
          circuitBreaker: pubsubCB

      statestore:
        outbound:
          retry: stateRetry
          timeout: stateTimeout
          circuitBreaker: stateCB
```

---

## Subscription Configuration

### Declarative Subscriptions

Instead of programmatic subscriptions, use declarative YAML:

```yaml
# dapr-subscriptions/reminder-engine-subscription.yaml
apiVersion: dapr.io/v1alpha1
kind: Subscription
metadata:
  name: reminder-engine-tasks-subscription
  namespace: todo-ai
spec:
  pubsubname: pubsub
  topic: tasks
  route: /events/tasks
  metadata:
    rawPayload: "false"
  scopes:
  - reminder-engine
```

```yaml
# dapr-subscriptions/backend-reminders-subscription.yaml
apiVersion: dapr.io/v1alpha1
kind: Subscription
metadata:
  name: backend-reminders-subscription
  namespace: todo-ai
spec:
  pubsubname: pubsub
  topic: reminders
  route: /events/reminders
  metadata:
    rawPayload: "false"
  scopes:
  - backend
```

---

## Service Annotations

### Backend API

```yaml
# backend/deployment.yaml (annotations section)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: todo-ai
spec:
  template:
    metadata:
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "backend"
        dapr.io/app-port: "8000"
        dapr.io/app-protocol: "http"
        dapr.io/enable-api-logging: "true"
        dapr.io/log-level: "info"
        dapr.io/sidecar-cpu-request: "100m"
        dapr.io/sidecar-cpu-limit: "500m"
        dapr.io/sidecar-memory-request: "128Mi"
        dapr.io/sidecar-memory-limit: "512Mi"
        dapr.io/enable-metrics: "true"
        dapr.io/metrics-port: "9090"
```

### Reminder Engine

```yaml
# reminder-engine/deployment.yaml (annotations section)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: reminder-engine
  namespace: todo-ai
spec:
  template:
    metadata:
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "reminder-engine"
        dapr.io/app-port: "8080"
        dapr.io/app-protocol: "http"
        dapr.io/enable-api-logging: "true"
        dapr.io/log-level: "info"
        dapr.io/sidecar-cpu-request: "100m"
        dapr.io/sidecar-cpu-limit: "500m"
        dapr.io/sidecar-memory-request: "128Mi"
        dapr.io/sidecar-memory-limit: "512Mi"
        dapr.io/enable-metrics: "true"
        dapr.io/metrics-port: "9090"
```

### MCP Server

```yaml
# mcp-server/deployment.yaml (annotations section)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mcp-server
  namespace: todo-ai
spec:
  template:
    metadata:
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "mcp-server"
        dapr.io/app-port: "3000"
        dapr.io/app-protocol: "http"
        dapr.io/enable-api-logging: "true"
        dapr.io/log-level: "info"
        dapr.io/sidecar-cpu-request: "50m"
        dapr.io/sidecar-cpu-limit: "200m"
        dapr.io/sidecar-memory-request: "64Mi"
        dapr.io/sidecar-memory-limit: "256Mi"
        dapr.io/enable-metrics: "true"
        dapr.io/metrics-port: "9090"
```

---

## Service-to-Service Invocation

### Purpose

Enables services to call each other with built-in retries, timeouts, and tracing.

### Configuration

No additional component needed—uses Dapr sidecar-to-sidecar communication.

### Usage Example

**MCP Server calling Backend API**:

```typescript
// mcp-server/src/api/client.ts
import { DaprClient } from '@dapr/dapr';

const daprClient = new DaprClient();

async function createTask(taskData: any) {
  try {
    const response = await daprClient.invoker.invoke(
      'backend',  // Target app-id
      'api/v1/tasks',  // Method/endpoint
      'POST',  // HTTP method
      taskData  // Request body
    );

    return response;
  } catch (error) {
    console.error('Failed to invoke backend:', error);
    throw error;
  }
}
```

**Backend API calling Reminder Engine**:

```python
# backend/app/services/reminder.py
from dapr.clients import DaprClient

def trigger_reminder(task_id: int):
    with DaprClient() as client:
        response = client.invoke_method(
            app_id='reminder-engine',
            method_name='reminders/trigger',
            data=json.dumps({'task_id': task_id}),
            http_verb='POST'
        )
        return response.json()
```

---

## Observability Configuration

### Distributed Tracing

```yaml
# dapr-config/tracing-config.yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: tracing-config
  namespace: todo-ai
spec:
  tracing:
    samplingRate: "1"  # 100% sampling (reduce in production)
    zipkin:
      endpointAddress: "http://zipkin.observability.svc.cluster.local:9411/api/v2/spans"
```

### Metrics

Dapr exposes Prometheus metrics on port 9090 (configurable via annotation).

**Metrics Endpoint**: `http://localhost:9090/metrics`

**Key Metrics**:
- `dapr_http_server_request_count` - HTTP request count
- `dapr_http_server_request_duration_ms` - HTTP request duration
- `dapr_component_pubsub_ingress_count` - Pub/sub ingress count
- `dapr_component_pubsub_egress_count` - Pub/sub egress count
- `dapr_runtime_service_invocation_req_sent_total` - Service invocation count

---

## Dapr Dashboard

### Deployment

```yaml
# dapr-dashboard/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dapr-dashboard
  namespace: dapr-system
spec:
  replicas: 1
  selector:
    matchLabels:
      app: dapr-dashboard
  template:
    metadata:
      labels:
        app: dapr-dashboard
    spec:
      containers:
      - name: dashboard
        image: daprio/dashboard:latest
        ports:
        - containerPort: 8080
        env:
        - name: DAPR_DASHBOARD_PORT
          value: "8080"
---
apiVersion: v1
kind: Service
metadata:
  name: dapr-dashboard
  namespace: dapr-system
spec:
  type: ClusterIP
  ports:
  - port: 8080
    targetPort: 8080
  selector:
    app: dapr-dashboard
```

### Access Dashboard

```bash
# Port forward to access dashboard
kubectl port-forward svc/dapr-dashboard -n dapr-system 8080:8080

# Open in browser
open http://localhost:8080
```

---

## Testing Dapr Components

### Test Pub/Sub

```bash
# Publish test event
curl -X POST http://localhost:3500/v1.0/publish/pubsub/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": "test-123",
    "event_type": "task.created",
    "event_version": "v1.0.0",
    "timestamp": "2026-01-08T10:30:00Z",
    "correlation_id": "test-456",
    "tenant_id": "tenant-123",
    "data": {
      "task_id": 999,
      "title": "Test task",
      "priority": "high",
      "completed": false,
      "created_by": "test-user",
      "created_at": "2026-01-08T10:30:00Z"
    }
  }'
```

### Test State Store

```bash
# Save state
curl -X POST http://localhost:3500/v1.0/state/statestore \
  -H "Content-Type: application/json" \
  -d '[{
    "key": "test-key",
    "value": "test-value"
  }]'

# Get state
curl http://localhost:3500/v1.0/state/statestore/test-key

# Delete state
curl -X DELETE http://localhost:3500/v1.0/state/statestore/test-key
```

### Test Service Invocation

```bash
# Invoke backend service
curl -X POST http://localhost:3500/v1.0/invoke/backend/method/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test task",
    "priority": "high"
  }'
```

---

## Deployment Order

1. **Install Dapr Runtime**:
```bash
dapr init -k --wait
```

2. **Deploy Dapr Components**:
```bash
kubectl apply -f dapr-components/pubsub-kafka.yaml
kubectl apply -f dapr-components/statestore-redis.yaml
kubectl apply -f dapr-components/secretstore-kubernetes.yaml
kubectl apply -f dapr-components/resiliency-policy.yaml
```

3. **Deploy Subscriptions**:
```bash
kubectl apply -f dapr-subscriptions/
```

4. **Deploy Services with Dapr Annotations**:
```bash
helm install todo-ai ./helm/todo-ai -n todo-ai
```

5. **Verify Dapr Sidecars**:
```bash
kubectl get pods -n todo-ai
# Each pod should have 2 containers: app + daprd
```

---

## Troubleshooting

### Sidecar Not Injected

**Symptoms**: Pod has only 1 container instead of 2

**Diagnosis**:
```bash
kubectl describe pod <pod-name> -n todo-ai
```

**Solution**:
- Verify `dapr.io/enabled: "true"` annotation
- Check Dapr sidecar injector is running: `kubectl get pods -n dapr-system`
- Check namespace has Dapr enabled: `kubectl get namespace todo-ai -o yaml`

### Pub/Sub Not Working

**Symptoms**: Events not being published or consumed

**Diagnosis**:
```bash
# Check Dapr component
kubectl get component pubsub -n todo-ai -o yaml

# Check Dapr sidecar logs
kubectl logs <pod-name> -c daprd -n todo-ai

# Check app logs
kubectl logs <pod-name> -c <app-container> -n todo-ai
```

**Solution**:
- Verify Kafka brokers are reachable
- Check component metadata (brokers, topics)
- Verify subscription configuration
- Check event schema validation

### High Latency

**Symptoms**: Slow response times with Dapr

**Diagnosis**:
```bash
# Check Dapr metrics
kubectl port-forward <pod-name> 9090:9090 -n todo-ai
curl http://localhost:9090/metrics | grep dapr_http
```

**Solution**:
- Increase sidecar resource limits
- Use gRPC instead of HTTP for service invocation
- Optimize resiliency policies (reduce retries)
- Check network latency between pods

---

## Success Criteria

- ✅ All Dapr components deployed successfully
- ✅ Dapr sidecars injected into all services
- ✅ Pub/sub working (events published and consumed)
- ✅ State store working (state saved and retrieved)
- ✅ Secret store working (secrets accessed)
- ✅ Resiliency policies applied
- ✅ Service-to-service invocation working
- ✅ Distributed tracing enabled
- ✅ Metrics exposed and scrapable
- ✅ Dapr dashboard accessible

---

**Version**: 1.0.0
**Last Updated**: 2026-01-08
**Status**: Implementation Ready
