# Feature Specification: Cloud-Native Event-Driven Deployment to DOKS

**Feature Branch**: `005-cloud-native-doks`
**Created**: 2026-01-08
**Status**: Draft
**Input**: Phase V - Cloud-native deployment with Kafka, Dapr, and DigitalOcean DOKS
**Constitution**: Phase V (v5.0.0)

## Executive Summary

Phase V transforms the Todo AI System into a cloud-native, event-driven architecture deployed on DigitalOcean Kubernetes (DOKS). All state changes emit events to Kafka, services communicate via Dapr sidecars, and a new Reminder Engine consumes events to trigger notifications. The entire system is generated from specifications—no manual YAML, event schema, or Dapr configuration editing is permitted.

**Key Constraint**: All event schemas, Dapr configurations, and cloud infrastructure MUST be generated from specifications. Manual editing is prohibited.

---

## Event-Driven Architecture Overview

### Architectural Shift

**Phase IV (Kubernetes)**: Synchronous, request-response architecture
- Frontend → Backend API → Database
- Agent → MCP → Backend API → Database
- Direct service-to-service calls

**Phase V (Event-Driven)**: Asynchronous, event-driven architecture
- Backend API → Kafka (events) → Consumers
- Services publish events, don't know about consumers
- Consumers subscribe to events, don't know about publishers
- Eventual consistency instead of immediate consistency

### Benefits

1. **Loose Coupling**: Services don't depend on each other's availability
2. **Scalability**: Consumers can scale independently based on event load
3. **Auditability**: All state changes recorded as immutable events
4. **Extensibility**: New consumers can be added without modifying publishers
5. **Resilience**: Failed consumers can replay events from Kafka

---

## Domain Events

### Event Types

#### 1. task.created

**Emitted When**: New task is created via API

**Publisher**: Backend API

**Consumers**:
- Reminder Engine (schedules reminder if due_date set)
- Event Logger (optional, for audit trail)

**Schema Version**: v1.0.0

**Payload**:
```json
{
  "event_id": "uuid",
  "event_type": "task.created",
  "event_version": "v1.0.0",
  "timestamp": "2026-01-08T10:30:00Z",
  "correlation_id": "uuid",
  "tenant_id": "tenant-123",
  "data": {
    "task_id": 123,
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "priority": "high",
    "tags": ["shopping", "urgent"],
    "due_date": "2026-01-10T18:00:00Z",
    "completed": false,
    "created_by": "user-456",
    "created_at": "2026-01-08T10:30:00Z"
  }
}
```

---

#### 2. task.updated

**Emitted When**: Task is updated via API

**Publisher**: Backend API

**Consumers**:
- Reminder Engine (reschedules reminder if due_date changed)
- Event Logger (optional)

**Schema Version**: v1.0.0

**Payload**:
```json
{
  "event_id": "uuid",
  "event_type": "task.updated",
  "event_version": "v1.0.0",
  "timestamp": "2026-01-08T11:00:00Z",
  "correlation_id": "uuid",
  "tenant_id": "tenant-123",
  "data": {
    "task_id": 123,
    "changes": {
      "title": {
        "old": "Buy groceries",
        "new": "Buy groceries and cook dinner"
      },
      "due_date": {
        "old": "2026-01-10T18:00:00Z",
        "new": "2026-01-11T18:00:00Z"
      }
    },
    "updated_by": "user-456",
    "updated_at": "2026-01-08T11:00:00Z"
  }
}
```

---

#### 3. task.completed

**Emitted When**: Task is marked as complete

**Publisher**: Backend API

**Consumers**:
- Reminder Engine (cancels scheduled reminder)
- Event Logger (optional)

**Schema Version**: v1.0.0

**Payload**:
```json
{
  "event_id": "uuid",
  "event_type": "task.completed",
  "event_version": "v1.0.0",
  "timestamp": "2026-01-08T12:00:00Z",
  "correlation_id": "uuid",
  "tenant_id": "tenant-123",
  "data": {
    "task_id": 123,
    "completed_by": "user-456",
    "completed_at": "2026-01-08T12:00:00Z"
  }
}
```

---

#### 4. task.deleted

**Emitted When**: Task is deleted via API

**Publisher**: Backend API

**Consumers**:
- Reminder Engine (cancels scheduled reminder)
- Event Logger (optional)

**Schema Version**: v1.0.0

**Payload**:
```json
{
  "event_id": "uuid",
  "event_type": "task.deleted",
  "event_version": "v1.0.0",
  "timestamp": "2026-01-08T13:00:00Z",
  "correlation_id": "uuid",
  "tenant_id": "tenant-123",
  "data": {
    "task_id": 123,
    "deleted_by": "user-456",
    "deleted_at": "2026-01-08T13:00:00Z"
  }
}
```

---

#### 5. task.reminder.triggered

**Emitted When**: Reminder time is reached for a task

**Publisher**: Reminder Engine

**Consumers**:
- Backend API (sends notification to user)
- Agent Service (optional, for conversational reminders)

**Schema Version**: v1.0.0

**Payload**:
```json
{
  "event_id": "uuid",
  "event_type": "task.reminder.triggered",
  "event_version": "v1.0.0",
  "timestamp": "2026-01-10T18:00:00Z",
  "correlation_id": "uuid",
  "tenant_id": "tenant-123",
  "data": {
    "task_id": 123,
    "title": "Buy groceries",
    "due_date": "2026-01-10T18:00:00Z",
    "reminder_type": "due_date",
    "user_id": "user-456"
  }
}
```

---

#### 6. agent.action.executed

**Emitted When**: AI agent performs an action via MCP tools

**Publisher**: MCP Server

**Consumers**:
- Event Logger (audit trail of agent actions)
- Analytics Service (optional, for usage tracking)

**Schema Version**: v1.0.0

**Payload**:
```json
{
  "event_id": "uuid",
  "event_type": "agent.action.executed",
  "event_version": "v1.0.0",
  "timestamp": "2026-01-08T10:30:00Z",
  "correlation_id": "uuid",
  "tenant_id": "tenant-123",
  "data": {
    "action": "create_task",
    "user_input": "Add a task to buy groceries tomorrow",
    "tool_name": "create_task",
    "tool_input": {
      "title": "Buy groceries",
      "due_date": "2026-01-09T09:00:00Z"
    },
    "tool_output": {
      "success": true,
      "task_id": 123
    },
    "agent_id": "agent-789",
    "user_id": "user-456"
  }
}
```

---

## Kafka Topics

### Topic Configuration

#### tasks

**Purpose**: All task-related events (created, updated, completed, deleted)

**Partitions**: 3
**Replication Factor**: 3
**Retention**: 7 days
**Compression**: snappy
**Partitioning Key**: `tenant_id` (for multi-tenancy)

**Consumers**:
- Reminder Engine (consumer group: `reminder-engine`)
- Event Logger (consumer group: `event-logger`)

---

#### reminders

**Purpose**: Reminder-triggered events

**Partitions**: 3
**Replication Factor**: 3
**Retention**: 7 days
**Compression**: snappy
**Partitioning Key**: `tenant_id`

**Consumers**:
- Backend API (consumer group: `backend-notifications`)
- Agent Service (consumer group: `agent-reminders`)

---

#### agent-actions

**Purpose**: Agent action audit log

**Partitions**: 3
**Replication Factor**: 3
**Retention**: 30 days (longer for audit)
**Compression**: snappy
**Partitioning Key**: `tenant_id`

**Consumers**:
- Event Logger (consumer group: `event-logger`)
- Analytics Service (consumer group: `analytics`)

---

## Dapr Components

### Pub/Sub Component (Kafka)

**Component Name**: `pubsub`

**Type**: `pubsub.kafka`

**Configuration**:
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
  namespace: todo-ai
spec:
  type: pubsub.kafka
  version: v1
  metadata:
  - name: brokers
    value: "kafka-broker-1:9092,kafka-broker-2:9092,kafka-broker-3:9092"
  - name: consumerGroup
    value: "{appId}"
  - name: clientId
    value: "{appId}"
  - name: authType
    value: "none"  # or "sasl" for production
  - name: maxMessageBytes
    value: "1024000"
  - name: consumeRetryInterval
    value: "200ms"
```

---

### State Store Component (Redis - Optional)

**Component Name**: `statestore`

**Type**: `state.redis`

**Configuration**:
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
  namespace: todo-ai
spec:
  type: state.redis
  version: v1
  metadata:
  - name: redisHost
    value: "redis-master:6379"
  - name: redisPassword
    secretKeyRef:
      name: redis-secret
      key: password
```

---

### Secret Store Component (Kubernetes)

**Component Name**: `secretstore`

**Type**: `secretstores.kubernetes`

**Configuration**:
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: secretstore
  namespace: todo-ai
spec:
  type: secretstores.kubernetes
  version: v1
  metadata: []
```

---

### Resiliency Policy

**Policy Name**: `default-resiliency`

**Configuration**:
```yaml
apiVersion: dapr.io/v1alpha1
kind: Resiliency
metadata:
  name: default-resiliency
  namespace: todo-ai
spec:
  policies:
    retries:
      pubsubRetry:
        policy: exponential
        maxInterval: 60s
        maxRetries: 10
      serviceRetry:
        policy: constant
        duration: 1s
        maxRetries: 3
    timeouts:
      general:
        timeout: 30s
    circuitBreakers:
      pubsubCB:
        maxRequests: 5
        interval: 10s
        timeout: 60s
        trip: consecutiveFailures >= 5
  targets:
    apps:
      backend:
        retry: pubsubRetry
        circuitBreaker: pubsubCB
      reminder-engine:
        retry: pubsubRetry
        circuitBreaker: pubsubCB
    components:
      pubsub:
        outbound:
          retry: pubsubRetry
          timeout: general
```

---

## New Service: Reminder Engine

### Purpose

Consumes task events and triggers reminders when due dates are reached.

### Responsibilities

1. **Subscribe to task events**: Listen to `tasks` topic
2. **Schedule reminders**: When task.created or task.updated with due_date
3. **Cancel reminders**: When task.completed or task.deleted
4. **Trigger reminders**: Publish task.reminder.triggered event at due time
5. **Handle failures**: Retry with exponential backoff, dead letter queue

### Technology Stack

- **Language**: Python 3.11
- **Framework**: FastAPI (for health checks)
- **Dapr SDK**: Python Dapr SDK
- **Scheduler**: APScheduler (in-memory or Redis-backed)
- **Database**: PostgreSQL (for reminder state persistence)

### Container Specification

**Base Image**: `python:3.11-alpine`
**Exposed Port**: 8080 (health checks)
**Dapr Sidecar**: Yes (injected via annotation)

### Event Subscriptions

**Topic**: `tasks`
**Events**: `task.created`, `task.updated`, `task.completed`, `task.deleted`
**Consumer Group**: `reminder-engine`

### Event Publishing

**Topic**: `reminders`
**Events**: `task.reminder.triggered`

### Resource Requirements

- CPU Request: 100m
- CPU Limit: 500m
- Memory Request: 256Mi
- Memory Limit: 1Gi

### Deployment Strategy

- Replicas: 1 (stateful scheduler)
- Rolling Update: maxSurge=1, maxUnavailable=0
- Readiness Probe: HTTP GET /health
- Liveness Probe: HTTP GET /health

---

## Modified Services

### Backend API

**Changes**:
1. **Add Dapr SDK**: Publish events after CRUD operations
2. **Event Publishing**: Emit task.created, task.updated, task.completed, task.deleted
3. **Event Consumption**: Subscribe to task.reminder.triggered (optional)
4. **Dapr Annotations**: Enable sidecar injection

**Dapr Annotations**:
```yaml
annotations:
  dapr.io/enabled: "true"
  dapr.io/app-id: "backend"
  dapr.io/app-port: "8000"
  dapr.io/enable-api-logging: "true"
```

---

### MCP Server

**Changes**:
1. **Add Dapr SDK**: Publish events after tool execution
2. **Event Publishing**: Emit agent.action.executed
3. **Dapr Annotations**: Enable sidecar injection

**Dapr Annotations**:
```yaml
annotations:
  dapr.io/enabled: "true"
  dapr.io/app-id: "mcp-server"
  dapr.io/app-port: "3000"
  dapr.io/enable-api-logging: "true"
```

---

## Cloud Infrastructure (DigitalOcean)

### DOKS Cluster

**Configuration**:
- **Region**: nyc3 (New York)
- **Kubernetes Version**: 1.28
- **Node Pool**:
  - Name: `worker-pool`
  - Size: `s-4vcpu-8gb` (4 vCPU, 8GB RAM)
  - Count: 3 nodes
  - Auto-scaling: Enabled (min: 3, max: 10)
- **High Availability**: Yes (control plane)
- **Monitoring**: Enabled (DigitalOcean Monitoring)

**Estimated Cost**: $144/month (3 nodes × $48/month)

---

### Managed Kafka

**Option 1: DigitalOcean Managed Kafka** (if available)
- **Brokers**: 3
- **Storage**: 100GB per broker
- **Replication**: 3
- **Estimated Cost**: $150/month

**Option 2: Confluent Cloud** (alternative)
- **Cluster Type**: Basic
- **Region**: us-east-1 (closest to nyc3)
- **Throughput**: 100 MB/s
- **Storage**: 100GB
- **Estimated Cost**: $100-200/month

---

### Managed PostgreSQL

**Configuration**:
- **Plan**: `db-s-4vcpu-8gb` (4 vCPU, 8GB RAM)
- **Storage**: 115GB
- **Standby Nodes**: 1 (high availability)
- **Backups**: Daily, 7-day retention
- **Region**: nyc3

**Estimated Cost**: $120/month

---

### Load Balancer

**Configuration**:
- **Type**: DigitalOcean Load Balancer
- **Algorithm**: Round Robin
- **Health Checks**: Enabled
- **SSL/TLS**: Let's Encrypt (via cert-manager)
- **Sticky Sessions**: Disabled

**Estimated Cost**: $12/month

---

### Container Registry

**Configuration**:
- **Name**: `todo-ai-registry`
- **Storage**: 100GB
- **Region**: nyc3
- **Private**: Yes

**Estimated Cost**: $5/month

---

### DNS

**Configuration**:
- **Domain**: `todo-ai.example.com` (user-provided)
- **Records**:
  - A record: `todo-ai.example.com` → Load Balancer IP
  - A record: `api.todo-ai.example.com` → Load Balancer IP
  - A record: `chat.todo-ai.example.com` → Load Balancer IP

**Estimated Cost**: $1/month

---

### Total Estimated Cost

| Resource | Monthly Cost |
|----------|--------------|
| DOKS Cluster (3 nodes) | $144 |
| Managed Kafka | $150 |
| Managed PostgreSQL | $120 |
| Load Balancer | $12 |
| Container Registry | $5 |
| DNS | $1 |
| **Total** | **$432/month** |

---

## Deployment Procedures

### Prerequisites

1. **DigitalOcean Account**: With payment method
2. **doctl CLI**: DigitalOcean command-line tool
3. **kubectl**: Kubernetes CLI
4. **helm**: Helm CLI
5. **Terraform/Pulumi**: Infrastructure as Code tool

### Step 1: Provision Cloud Resources

```bash
# Authenticate with DigitalOcean
doctl auth init

# Create DOKS cluster
doctl kubernetes cluster create todo-ai-cluster \
  --region nyc3 \
  --version 1.28 \
  --size s-4vcpu-8gb \
  --count 3 \
  --auto-upgrade \
  --ha

# Get kubeconfig
doctl kubernetes cluster kubeconfig save todo-ai-cluster

# Verify cluster
kubectl cluster-info
kubectl get nodes
```

### Step 2: Install Dapr

```bash
# Install Dapr CLI
wget -q https://raw.githubusercontent.com/dapr/cli/master/install/install.sh -O - | /bin/bash

# Initialize Dapr on Kubernetes
dapr init -k --wait

# Verify Dapr installation
kubectl get pods -n dapr-system
dapr status -k
```

### Step 3: Setup Managed Kafka

```bash
# Create Managed Kafka cluster (via DigitalOcean UI or API)
# Note: Managed Kafka may not be available in all regions

# Alternative: Deploy Kafka using Strimzi operator
kubectl create namespace kafka
kubectl apply -f 'https://strimzi.io/install/latest?namespace=kafka' -n kafka

# Create Kafka cluster
kubectl apply -f kafka-cluster.yaml -n kafka

# Wait for Kafka to be ready
kubectl wait kafka/todo-ai-kafka --for=condition=Ready --timeout=300s -n kafka
```

### Step 4: Create Kafka Topics

```bash
# Create topics
kubectl apply -f kafka-topics.yaml -n kafka

# Verify topics
kubectl get kafkatopics -n kafka
```

### Step 5: Deploy Dapr Components

```bash
# Create namespace
kubectl create namespace todo-ai

# Deploy Dapr components
kubectl apply -f dapr-pubsub.yaml -n todo-ai
kubectl apply -f dapr-statestore.yaml -n todo-ai
kubectl apply -f dapr-secretstore.yaml -n todo-ai
kubectl apply -f dapr-resiliency.yaml -n todo-ai

# Verify components
kubectl get components -n todo-ai
```

### Step 6: Deploy Services

```bash
# Build and push images to DOCR
./scripts/build-and-push-docr.sh v1.0.0

# Deploy with Helm
helm install todo-ai ./helm/todo-ai \
  -n todo-ai \
  -f helm/todo-ai/values-doks.yaml \
  --set global.imageRegistry=registry.digitalocean.com/todo-ai-registry/

# Watch deployment
kubectl get pods -n todo-ai -w
```

### Step 7: Configure Ingress and SSL

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create ClusterIssuer for Let's Encrypt
kubectl apply -f letsencrypt-issuer.yaml

# Deploy Ingress with TLS
kubectl apply -f ingress-tls.yaml -n todo-ai

# Get Load Balancer IP
kubectl get ingress -n todo-ai
```

### Step 8: Configure DNS

```bash
# Get Load Balancer IP
LB_IP=$(kubectl get ingress todo-ai-ingress -n todo-ai -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

# Create DNS records (via DigitalOcean UI or API)
doctl compute domain records create todo-ai.example.com \
  --record-type A \
  --record-name @ \
  --record-data $LB_IP

doctl compute domain records create todo-ai.example.com \
  --record-type A \
  --record-name api \
  --record-data $LB_IP

doctl compute domain records create todo-ai.example.com \
  --record-type A \
  --record-name chat \
  --record-data $LB_IP
```

### Step 9: Verify Event Flow

```bash
# Create a task via API
curl -X POST https://api.todo-ai.example.com/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Test task", "due_date": "2026-01-09T10:00:00Z"}'

# Check Kafka topic for event
kubectl exec -it kafka-0 -n kafka -- \
  kafka-console-consumer.sh \
  --bootstrap-server localhost:9092 \
  --topic tasks \
  --from-beginning \
  --max-messages 1

# Check Reminder Engine logs
kubectl logs -f deployment/reminder-engine -n todo-ai -c reminder-engine
```

---

## User Stories and Acceptance Criteria

### User Story 1: Event-Driven Task Creation

**As a** user
**I want** task creation to emit events
**So that** other services can react to new tasks

**Acceptance Criteria**:
- ✅ Creating task via API emits task.created event to Kafka
- ✅ Event contains all task details
- ✅ Event has correlation ID for tracing
- ✅ Reminder Engine receives and processes event
- ✅ Event visible in Kafka topic

**Priority**: P1 (Must Have)

---

### User Story 2: Automatic Reminder Scheduling

**As a** user
**I want** reminders automatically scheduled for tasks with due dates
**So that** I don't forget important tasks

**Acceptance Criteria**:
- ✅ Reminder Engine subscribes to task.created events
- ✅ Reminder scheduled when task has due_date
- ✅ Reminder triggered at due_date time
- ✅ task.reminder.triggered event published to Kafka
- ✅ User receives notification (via Backend API)

**Priority**: P1 (Must Have)

---

### User Story 3: Dapr Pub/Sub Abstraction

**As a** developer
**I want** services to use Dapr for pub/sub
**So that** we can switch message brokers without code changes

**Acceptance Criteria**:
- ✅ All services use Dapr SDK (not direct Kafka client)
- ✅ Dapr sidecars injected automatically
- ✅ Pub/sub component configured for Kafka
- ✅ Services can publish and subscribe to events
- ✅ Dapr handles retries and circuit breaking

**Priority**: P1 (Must Have)

---

### User Story 4: Cloud-Native Deployment

**As a** DevOps engineer
**I want** system deployed to DOKS with managed services
**So that** we have production-ready infrastructure

**Acceptance Criteria**:
- ✅ DOKS cluster provisioned with 3 nodes
- ✅ Managed Kafka cluster provisioned
- ✅ Managed PostgreSQL provisioned
- ✅ Load Balancer configured with SSL/TLS
- ✅ DNS records point to Load Balancer
- ✅ All services running and healthy

**Priority**: P1 (Must Have)

---

### User Story 5: Event Auditability

**As a** compliance officer
**I want** all state changes recorded as events
**So that** we have audit trail of all actions

**Acceptance Criteria**:
- ✅ All task CRUD operations emit events
- ✅ All agent actions emit events
- ✅ Events stored in Kafka with 7-30 day retention
- ✅ Events have timestamps and user IDs
- ✅ Events can be replayed for debugging

**Priority**: P2 (Should Have)

---

## Success Criteria

### Functional Requirements

- ✅ FR-001: All task CRUD operations emit events to Kafka
- ✅ FR-002: Reminder Engine consumes task events
- ✅ FR-003: Reminders triggered at due date time
- ✅ FR-004: All services use Dapr for pub/sub
- ✅ FR-005: System deployed to DOKS
- ✅ FR-006: Managed Kafka and PostgreSQL provisioned
- ✅ FR-007: Load Balancer with SSL/TLS configured
- ✅ FR-008: DNS records configured
- ✅ FR-009: Event schemas versioned and validated
- ✅ FR-010: All infrastructure generated from specifications

### Non-Functional Requirements

- ✅ NFR-001: Event publishing latency < 100ms (p95)
- ✅ NFR-002: Event consumption latency < 500ms (p95)
- ✅ NFR-003: Kafka consumer lag < 1000 messages
- ✅ NFR-004: Zero message loss (at-least-once delivery)
- ✅ NFR-005: Dapr sidecar overhead < 50ms
- ✅ NFR-006: System handles 1000 events/second
- ✅ NFR-007: 99.9% uptime (managed services)

---

## Out of Scope (Phase VI+)

- ❌ Event sourcing (full event store)
- ❌ CQRS (separate read/write models)
- ❌ Saga orchestration (complex workflows)
- ❌ Multi-region deployment
- ❌ Active-active replication
- ❌ Custom Kafka connectors
- ❌ Real-time analytics on events
- ❌ Machine learning on event streams

---

## Risk Analysis

### Risk 1: Event Schema Evolution
**Impact**: High
**Probability**: Medium
**Mitigation**: Semantic versioning, schema registry, backward compatibility testing

### Risk 2: Kafka Consumer Lag
**Impact**: High
**Probability**: Medium
**Mitigation**: Monitor lag, scale consumers, increase partitions, optimize processing

### Risk 3: Dapr Sidecar Overhead
**Impact**: Medium
**Probability**: Low
**Mitigation**: Monitor latency, optimize Dapr configuration, use HTTP/gRPC efficiently

### Risk 4: Cloud Cost Overruns
**Impact**: High
**Probability**: Medium
**Mitigation**: Set budget alerts, monitor usage, optimize resource allocation, use spot instances

### Risk 5: Eventual Consistency Issues
**Impact**: Medium
**Probability**: Medium
**Mitigation**: Design for idempotency, handle out-of-order events, use correlation IDs

---

## Testing Strategy

### Unit Tests
- Event schema validation
- Event publishing logic
- Event consumption logic
- Dapr SDK integration

### Integration Tests
- End-to-end event flow (publish → Kafka → consume)
- Dapr pub/sub functionality
- Reminder Engine event processing
- Multi-service event propagation

### Load Tests
- 1000 events/second throughput
- Kafka consumer lag under load
- Dapr sidecar performance
- Cloud resource scaling

---

**Version**: 5.0.0
**Last Updated**: 2026-01-08
**Status**: Ready for Event Schema and Dapr Specifications
