<!--
  Sync Impact Report:
  - Version change: 4.0.0 → 5.0.0 (MAJOR)
  - Breaking changes: Addition of event-driven architecture and cloud-native deployment
  - New principles added: Event-Driven Architecture, Pub/Sub Messaging, Dapr Sidecar Pattern, Cloud-Native Deployment, Event Schema Versioning, Eventual Consistency, Multi-Tenancy Ready
  - Extended principles: All Phase IV principles maintained with cloud considerations
  - Templates status:
    ✅ spec-template.md - aligned with event-driven requirements
    ✅ plan-template.md - aligned with cloud-native architecture
    ✅ tasks-template.md - aligned with event-driven tasks
  - Follow-up TODOs: None - all placeholders filled
-->

# Evolution of Todo — Phase V Constitution

## Core Principles

### I. Spec-First Development (NON-NEGOTIABLE - EXTENDED)

All implementation MUST derive from written specifications, including events and cloud infrastructure:
- Domain model with all entities and relationships (Phase II)
- API contracts with request/response schemas (Phase II)
- MCP tool definitions with input/output schemas (Phase III)
- Agent behavior and intent parsing rules (Phase III)
- Frontend components and their data requirements (Phase II/III)
- Container specifications with resource limits and health checks (Phase IV)
- Kubernetes manifests with deployment strategies (Phase IV)
- Helm chart values and templates (Phase IV)
- **Event schemas with versioning and compatibility rules (Phase V)**
- **Dapr component configurations and pub/sub subscriptions (Phase V)**
- **Kafka topic configurations and retention policies (Phase V)**
- **Cloud provider resources and networking (Phase V)**
- Infrastructure networking and service discovery (Phase IV)
- Database schema and migrations (Phase II)
- Expected inputs, outputs, and error conditions (All Phases)

**Rationale**: Spec-Driven Development extends to event-driven architecture and cloud infrastructure. No manual event schema or Dapr configuration editing is permitted. All event-driven components must be generated from specifications.

### II. Event-Driven Architecture (NON-NEGOTIABLE)

All state changes MUST emit events to enable loose coupling and scalability:
- Task CRUD operations emit domain events
- Events published to Kafka topics via Dapr
- Services subscribe to events they care about
- No direct service-to-service calls for state changes
- Events are immutable and append-only
- Event schemas are versioned and backward compatible
- Dead letter queues for failed event processing

**Rationale**: Event-Driven Architecture enables loose coupling, scalability, and auditability. Services can evolve independently by subscribing to events rather than making direct calls.

### III. Pub/Sub Messaging (NON-NEGOTIABLE)

All inter-service communication for state changes MUST use pub/sub:
- Publishers emit events without knowing subscribers
- Subscribers consume events without knowing publishers
- Kafka provides durable, ordered event log
- Dapr abstracts pub/sub implementation details
- Topics organized by domain aggregate (tasks, reminders, agent-actions)
- Partitioning by entity ID for ordering guarantees
- Consumer groups for parallel processing

**Rationale**: Pub/Sub Messaging decouples producers from consumers, enabling independent scaling and deployment. It also provides a natural audit log of all state changes.

### IV. Dapr Sidecar Pattern (NON-NEGOTIABLE)

All services MUST use Dapr sidecars for cross-cutting concerns:
- Pub/sub abstraction (Kafka, Redis, etc.)
- Service-to-service invocation with retries
- State management (optional)
- Secrets management
- Observability (tracing, metrics)
- Resiliency (retries, circuit breakers, timeouts)
- No direct Kafka client code in services

**Rationale**: Dapr Sidecar Pattern provides portable, cloud-native building blocks. Services remain infrastructure-agnostic and can switch pub/sub implementations without code changes.

### V. Cloud-Native Deployment (NON-NEGOTIABLE)

All infrastructure MUST be cloud-native and production-ready:
- Managed Kubernetes (DigitalOcean DOKS)
- Managed Kafka (DigitalOcean Managed Kafka or Confluent Cloud)
- Managed databases (DigitalOcean Managed PostgreSQL)
- Load balancers (DigitalOcean Load Balancer)
- Block storage (DigitalOcean Volumes)
- Container registry (DigitalOcean Container Registry)
- DNS and SSL/TLS (DigitalOcean DNS + Let's Encrypt)
- No self-hosted infrastructure components

**Rationale**: Cloud-Native Deployment leverages managed services for reliability, scalability, and reduced operational overhead. It enables focus on application logic rather than infrastructure management.

### VI. Event Schema Versioning (NON-NEGOTIABLE)

All event schemas MUST be versioned and backward compatible:
- Semantic versioning for event schemas (v1.0.0, v1.1.0, v2.0.0)
- Schema registry for centralized schema management
- Backward compatibility for minor versions
- Breaking changes require major version bump
- Consumers must handle multiple schema versions
- Schema evolution documented in specifications

**Rationale**: Event Schema Versioning enables independent service evolution. Producers can emit new event versions while consumers gradually upgrade.

### VII. Eventual Consistency (NON-NEGOTIABLE)

All distributed operations MUST embrace eventual consistency:
- State changes propagate asynchronously via events
- Services maintain local state from event streams
- No distributed transactions across services
- Idempotent event handlers for at-least-once delivery
- Compensating actions for failures
- Saga pattern for multi-service workflows

**Rationale**: Eventual Consistency is inherent in event-driven systems. It enables high availability and partition tolerance (CAP theorem) while maintaining acceptable consistency guarantees.

### VIII. Multi-Tenancy Ready (NON-NEGOTIABLE)

All services MUST support multi-tenancy for future scaling:
- Tenant ID in all events and API requests
- Tenant-based partitioning in Kafka
- Tenant-based routing in Dapr
- Tenant isolation in database (schema or row-level)
- Tenant-based resource quotas
- Tenant-based observability and billing

**Rationale**: Multi-Tenancy Ready architecture enables SaaS deployment and horizontal scaling. It's easier to design for multi-tenancy upfront than to retrofit later.

### IX. Infrastructure as Code (Spec-Driven) (MAINTAINED FROM PHASE IV)

All infrastructure MUST be defined in specifications before deployment:
- Dockerfiles generated from container specifications (Phase IV)
- Kubernetes manifests generated from deployment specifications (Phase IV)
- Helm charts generated from service specifications (Phase IV)
- **Terraform/Pulumi for cloud resources (Phase V)**
- **Dapr components generated from specifications (Phase V)**
- **Kafka topics generated from event specifications (Phase V)**
- ConfigMaps and Secrets defined in specifications (Phase IV)
- Ingress rules defined in networking specifications (Phase IV)
- No manual kubectl commands except for spec-aligned operations (Phase IV)
- All infrastructure changes require spec updates first (Phase IV)

**Rationale**: Infrastructure as Code (IaC) ensures reproducibility, version control, and disaster recovery. Spec-Driven IaC adds the constraint that specifications are the source of truth.

### X. Container-First Architecture (MAINTAINED FROM PHASE IV)

All application components MUST be containerized:
- Each service has a Dockerfile specification (Phase IV)
- Base images are pinned to specific versions (Phase IV)
- Multi-stage builds for production optimization (Phase IV)
- Health checks defined at container level (Phase IV)
- Resource limits (CPU, memory) specified (Phase IV)
- Environment variables injected via ConfigMaps/Secrets (Phase IV)
- **Dapr sidecar injected automatically via annotations (Phase V)**
- No host dependencies beyond container runtime (Phase IV)

**Rationale**: Container-First Architecture ensures consistency across environments. Dapr sidecars extend containers with cloud-native capabilities.

### XI. Service Mesh Networking (EXTENDED FROM PHASE IV)

All inter-service communication MUST use service mesh patterns:
- Each component has a Kubernetes Service (Phase IV)
- Internal communication uses cluster DNS (Phase IV)
- External access only through Ingress/Load Balancer (Phase IV)
- **Dapr handles service-to-service invocation with retries (Phase V)**
- **Dapr provides distributed tracing across services (Phase V)**
- **Dapr enforces mTLS for service-to-service calls (Phase V)**
- No hardcoded IP addresses or external URLs for internal services (Phase IV)
- Network policies define allowed communication paths (Phase IV)

**Rationale**: Service Mesh Networking with Dapr provides service discovery, load balancing, retries, and observability without code changes.

### XII. Zero-Downtime Deployments (MAINTAINED FROM PHASE IV)

All deployments MUST support rolling updates without downtime:
- Rolling update strategy with maxSurge and maxUnavailable (Phase IV)
- Readiness probes ensure traffic only to ready pods (Phase IV)
- Liveness probes detect and restart unhealthy pods (Phase IV)
- PreStop hooks for graceful shutdown (Phase IV)
- PodDisruptionBudgets prevent simultaneous pod termination (Phase IV)
- **Event consumers gracefully drain before shutdown (Phase V)**
- **Kafka consumer group rebalancing on pod changes (Phase V)**
- Database migrations run as init containers or jobs (Phase IV)

**Rationale**: Zero-Downtime Deployments ensure continuous availability during updates. Event consumers must gracefully drain to avoid message loss.

### XIII. Observability-First Design (EXTENDED FROM PHASE IV)

All components MUST expose observability endpoints and emit telemetry:
- Structured logging to stdout/stderr (JSON format) (Phase IV)
- Health check endpoints (/health, /ready) (Phase IV)
- Metrics endpoints (/metrics) in Prometheus format (Phase IV)
- **Distributed tracing with OpenTelemetry via Dapr (Phase V)**
- **Event publishing and consumption metrics (Phase V)**
- **Kafka lag monitoring for consumer groups (Phase V)**
- **Cloud provider metrics (CPU, memory, network) (Phase V)**
- Log aggregation via Kubernetes logging (Phase IV)
- Resource usage monitoring via Kubernetes metrics (Phase IV)

**Rationale**: Observability-First Design enables proactive monitoring, debugging, and performance optimization in distributed, event-driven systems.

### XIV. Agent-Tool Separation (MAINTAINED FROM PHASE III)

AI agents MUST NOT modify application state directly:
- All state modifications go through MCP tools (Phase III)
- MCP tools are the ONLY interface between agent and backend API (Phase III)
- Agents parse intent and select appropriate tools (Phase III)
- Agent service runs in separate pod with resource limits (Phase IV)
- MCP server runs in separate pod or sidecar (Phase IV)
- **Agent actions emit events for auditability (Phase V)**
- **Agent service subscribes to task events for context (Phase V)**
- No direct database or API access from agent code (Phase III)

**Rationale**: Agent-Tool Separation ensures business logic remains in the backend. In event-driven systems, agent actions are auditable via events.

### XV. MCP-First Integration (MAINTAINED FROM PHASE III)

Model Context Protocol (MCP) tools MUST be the exclusive interface for agent operations:
- Each backend API operation has a corresponding MCP tool (Phase III)
- MCP server exposed as Kubernetes Service (Phase IV)
- Agent communicates with MCP server via cluster DNS (Phase IV)
- **MCP tools emit events after successful operations (Phase V)**
- MCP tools validate inputs before calling API (Phase III)
- No direct API calls from agent runtime (Phase III)

**Rationale**: MCP-First Integration provides standardized agent-backend communication. Events provide audit trail of agent actions.

### XVI. Iterative Refinement Through Specs (MAINTAINED FROM ALL PHASES)

When implementation produces incorrect output:
- DO NOT modify code, YAML, or event schemas directly
- DO refine the specification to clarify requirements
- DO regenerate implementation from updated spec
- DO document what was unclear in the original spec
- DO update API contracts, MCP tools, agent prompts, infrastructure specs, event schemas, or Dapr configs if needed

**Rationale**: This principle enforces the Spec-Driven Development contract across all layers including event-driven architecture and cloud infrastructure.

## Development Workflow

### Specification Phase

1. Write event schema specifications:
   - Define all domain events (task.created, task.updated, etc.)
   - Define event payload schemas with JSON Schema
   - Define event versioning strategy
   - Define event routing and partitioning rules
   - Define event retention policies

2. Write Dapr component specifications:
   - Define pub/sub components (Kafka)
   - Define state store components (optional)
   - Define secret store components
   - Define service invocation configurations
   - Define resiliency policies (retries, circuit breakers)

3. Write Kafka topic specifications:
   - Define topics for each event type
   - Define partitioning strategy (by tenant, by entity ID)
   - Define replication factor and retention
   - Define consumer groups and subscriptions

4. Write new service specifications:
   - Reminder Engine service (consumes task events)
   - Event Logger service (optional, for audit trail)
   - Define service dependencies and event subscriptions

5. Write cloud infrastructure specifications:
   - DOKS cluster configuration (node pools, autoscaling)
   - Managed Kafka configuration (brokers, storage)
   - Managed PostgreSQL configuration (size, backups)
   - Load Balancer configuration (SSL/TLS, health checks)
   - Container Registry configuration
   - DNS and domain configuration

6. Review specification for completeness:
   - All events have schemas and versions
   - All services have Dapr subscriptions
   - All Kafka topics have retention policies
   - All cloud resources have sizing and costs
   - All error conditions specified

7. Obtain approval before proceeding to implementation

### Implementation Phase

1. Generate event schemas from specifications:
   - JSON Schema files for each event type
   - Schema registry configuration
   - Event validation code

2. Generate Dapr components from specifications:
   - Pub/sub component YAML
   - State store component YAML (if needed)
   - Secret store component YAML
   - Resiliency policy YAML

3. Generate Kafka setup from specifications:
   - Topic creation scripts
   - Consumer group configurations
   - ACL configurations (if needed)

4. Generate new services from specifications:
   - Reminder Engine Dockerfile and code
   - Event Logger Dockerfile and code (if needed)
   - Kubernetes manifests with Dapr annotations

5. Generate cloud infrastructure from specifications:
   - Terraform/Pulumi for DOKS cluster
   - Terraform/Pulumi for Managed Kafka
   - Terraform/Pulumi for Managed PostgreSQL
   - Terraform/Pulumi for Load Balancer

6. Deploy to DOKS:
   - Provision cloud resources
   - Deploy Dapr runtime
   - Deploy Kafka topics
   - Deploy services with Dapr sidecars
   - Verify event flow

7. If deployment fails, return to Specification Phase

### Validation Phase

1. Verify all acceptance scenarios pass
2. Verify all components are running
3. Verify event publishing and consumption
4. Verify Dapr pub/sub functionality
5. Verify Kafka topics and consumer groups
6. Verify cloud resources are provisioned
7. Verify zero-downtime rolling updates
8. Verify observability (logs, metrics, traces)
9. Document any deviations or clarifications needed

## Technical Constraints

**Cloud Platform**:
- Provider: DigitalOcean
- Kubernetes: DOKS (managed Kubernetes)
- Kafka: DigitalOcean Managed Kafka or Confluent Cloud
- Database: DigitalOcean Managed PostgreSQL
- Load Balancer: DigitalOcean Load Balancer
- Container Registry: DigitalOcean Container Registry (DOCR)
- DNS: DigitalOcean DNS
- SSL/TLS: Let's Encrypt via cert-manager

**Event Bus**:
- Platform: Apache Kafka
- Version: 3.x
- Replication Factor: 3 (production)
- Partitions: Based on throughput requirements
- Retention: 7 days (configurable per topic)
- Compression: snappy or lz4

**Dapr Runtime**:
- Version: 1.12+
- Mode: Kubernetes (sidecar injection)
- Pub/Sub: Kafka component
- State Store: Redis (optional)
- Secret Store: Kubernetes secrets
- Tracing: OpenTelemetry → Jaeger/Zipkin
- Metrics: Prometheus

**Component Stack** (Inherited from Phase II/III/IV):
- Backend: FastAPI + SQLModel + Managed PostgreSQL
- Frontend: Next.js 14 + TypeScript + Tailwind CSS
- Chat UI: OpenAI ChatKit + Next.js
- Agent: OpenAI Agents SDK + TypeScript
- MCP Server: Official MCP SDK + TypeScript
- **Reminder Engine: Python + Dapr SDK (Phase V)**
- **Event Logger: Python + Dapr SDK (Phase V, optional)**

**Namespace**:
- Namespace: `todo-ai`
- All resources deployed in this namespace
- Resource quotas applied at namespace level

**Required Components** (Phase V):
- Backend API (FastAPI) - Deployment + Service + Dapr sidecar
- Frontend Web UI (Next.js) - Deployment + Service
- Chat UI (ChatKit) - Deployment + Service
- Agent Runtime (OpenAI Agents SDK) - Deployment + Service + Dapr sidecar
- MCP Server (MCP SDK) - Deployment + Service + Dapr sidecar
- **Reminder Engine (Python) - Deployment + Service + Dapr sidecar (Phase V)**
- Database (Managed PostgreSQL) - External service
- **Kafka (Managed Kafka) - External service (Phase V)**
- **Dapr Control Plane - DaemonSet + Services (Phase V)**
- Load Balancer (DigitalOcean LB) - External resource

**Event Types** (Phase V):
- `task.created` - Emitted when task is created
- `task.updated` - Emitted when task is updated
- `task.completed` - Emitted when task is marked complete
- `task.reminder.triggered` - Emitted by Reminder Engine
- `agent.action.executed` - Emitted when agent performs action

**Prohibited**:
- Manual event schema editing (must be generated from specs)
- Manual Dapr configuration editing (must be generated from specs)
- Manual Kafka topic creation (must be generated from specs)
- Hardcoded secrets in manifests
- Hardcoded IP addresses or external URLs
- :latest image tags in production
- Running as root in containers
- Privileged containers
- Direct Kafka client code (must use Dapr)
- Synchronous service-to-service calls for state changes

## Quality Standards

### Event Quality

- All events have JSON Schema definitions
- All events have semantic versioning
- All events are immutable
- All events have correlation IDs for tracing
- All events have timestamps (ISO 8601)
- All events have tenant IDs (for multi-tenancy)
- All events pass schema validation

### Dapr Quality

- All Dapr components have YAML specifications
- All pub/sub subscriptions are declarative
- All resiliency policies are configured
- All services use Dapr SDK (not direct Kafka)
- All Dapr sidecars have resource limits
- All Dapr components pass validation

### Kafka Quality

- All topics have appropriate partitioning
- All topics have appropriate replication
- All topics have appropriate retention
- All consumer groups have unique IDs
- All consumers handle rebalancing gracefully
- All producers handle failures with retries

### Cloud Quality

- All cloud resources are managed (no self-hosted)
- All cloud resources have backups enabled
- All cloud resources have monitoring enabled
- All cloud resources have appropriate sizing
- All cloud resources have cost estimates
- All cloud resources are in same region

## Architecture Decisions

### Event-Driven Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    DigitalOcean Cloud                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              Load Balancer (DigitalOcean LB)            │    │
│  │         SSL/TLS Termination + Health Checks             │    │
│  └────────────────────────────────────────────────────────┘    │
│                          │                                       │
│         ┌────────────────┼────────────────┐                    │
│         │                │                │                     │
│         ▼                ▼                ▼                     │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐                │
│  │ Frontend │    │  ChatUI  │    │ Backend  │                 │
│  │ Service  │    │ Service  │    │ Service  │                 │
│  └──────────┘    └──────────┘    └──────────┘                 │
│       │               │                │                        │
│       │               │                │ (Dapr Sidecar)        │
│       │               │                │                        │
│       │               ▼                ▼                        │
│       │          ┌──────────┐    ┌──────────┐                 │
│       │          │  Agent   │    │   MCP    │                 │
│       │          │ Service  │    │ Service  │                 │
│       │          └──────────┘    └──────────┘                 │
│       │               │                │                        │
│       │               │ (Dapr)         │ (Dapr)                │
│       │               │                │                        │
│       │               └────────────────┘                        │
│       │                        │                                │
│       │                        │ Publishes Events              │
│       │                        ▼                                │
│       │               ┌─────────────────┐                      │
│       │               │  Kafka Topics   │                      │
│       │               │  (Managed)      │                      │
│       │               │                 │                      │
│       │               │ - tasks         │                      │
│       │               │ - reminders     │                      │
│       │               │ - agent-actions │                      │
│       │               └─────────────────┘                      │
│       │                        │                                │
│       │                        │ Consumes Events               │
│       │                        ▼                                │
│       │               ┌──────────────┐                         │
│       │               │  Reminder    │                         │
│       │               │  Engine      │                         │
│       │               │  Service     │                         │
│       │               └──────────────┘                         │
│       │                    │ (Dapr)                            │
│       │                    │                                    │
│       │                    │ Publishes Reminder Events         │
│       │                    ▼                                    │
│       │               ┌─────────────────┐                      │
│       │               │  Kafka Topics   │                      │
│       │               └─────────────────┘                      │
│       │                                                         │
│       └─────────────────────────────────────────────────────┐ │
│                                │                              │ │
│                                ▼                              │ │
│                         ┌──────────┐                         │ │
│                         │ Database │                         │ │
│                         │(Managed  │                         │ │
│                         │PostgreSQL)│                        │ │
│                         └──────────┘                         │ │
│                                                                │ │
│  ┌──────────────────────────────────────────────────────────┐│ │
│  │              Dapr Control Plane                           ││ │
│  │  - Operator                                               ││ │
│  │  - Sidecar Injector                                       ││ │
│  │  - Placement Service                                      ││ │
│  │  - Sentry (mTLS CA)                                       ││ │
│  └──────────────────────────────────────────────────────────┘│ │
│                                                                │ │
└────────────────────────────────────────────────────────────────┘
```

### Event Flow

```
1. User creates task via Frontend/ChatUI
   ↓
2. Backend API creates task in database
   ↓
3. Backend publishes task.created event to Kafka (via Dapr)
   ↓
4. Reminder Engine consumes task.created event
   ↓
5. Reminder Engine schedules reminder
   ↓
6. At reminder time, Reminder Engine publishes task.reminder.triggered event
   ↓
7. Backend/Agent consumes reminder event and notifies user
```

### Kafka Topics

| Topic | Partitions | Replication | Retention | Purpose |
|-------|------------|-------------|-----------|---------|
| tasks | 3 | 3 | 7 days | Task CRUD events |
| reminders | 3 | 3 | 7 days | Reminder events |
| agent-actions | 3 | 3 | 30 days | Agent action audit log |

### Dapr Components

| Component | Type | Configuration |
|-----------|------|---------------|
| pubsub | pubsub.kafka | Kafka brokers, topics |
| statestore | state.redis | Redis connection (optional) |
| secretstore | secretstores.kubernetes | Kubernetes secrets |
| resiliency | resiliency | Retries, circuit breakers, timeouts |

### Cloud Resources

| Resource | Type | Size | Cost (est.) |
|----------|------|------|-------------|
| DOKS Cluster | Kubernetes | 3 nodes, 4GB RAM each | $36/month |
| Managed Kafka | Kafka | 3 brokers, 100GB storage | $150/month |
| Managed PostgreSQL | Database | 4GB RAM, 80GB storage | $60/month |
| Load Balancer | LB | 1 instance | $12/month |
| Container Registry | DOCR | 100GB storage | $5/month |
| **Total** | | | **~$263/month** |

## Governance

### Amendment Process

1. Propose amendment with rationale
2. Document impact on existing specifications
3. Update constitution version following semantic versioning:
   - MAJOR: Breaking changes to architecture or event schemas
   - MINOR: New principles or sections added
   - PATCH: Clarifications or wording improvements
4. Update all dependent templates and documentation

### Compliance

- All code reviews MUST verify compliance with constitution
- All infrastructure changes MUST be spec-driven
- All event schemas MUST be versioned
- Violations MUST be justified in writing or corrected
- Complexity beyond these principles MUST be explicitly approved
- Manual event schema or Dapr config editing is PROHIBITED
- All deployments MUST pass validation checks

### Version Control

This constitution supersedes Phase IV for cloud-native, event-driven deployment.

**Version**: 5.0.0 | **Ratified**: 2026-01-08 | **Last Amended**: 2026-01-08

**Changes from v4.0.0**:
- MAJOR: Addition of event-driven architecture and cloud-native deployment
- Added: Event-Driven Architecture, Pub/Sub Messaging, Dapr Sidecar Pattern, Cloud-Native Deployment, Event Schema Versioning, Eventual Consistency, Multi-Tenancy Ready
- Extended: Spec-First Development (includes events), Infrastructure as Code (includes Dapr/Kafka), Service Mesh Networking (includes Dapr), Observability-First Design (includes distributed tracing)
- Tech Stack: Added Kafka, Dapr, DigitalOcean DOKS, Managed services
- Architecture: Event-driven with pub/sub messaging and Dapr sidecars
- New Service: Reminder Engine for event consumption
