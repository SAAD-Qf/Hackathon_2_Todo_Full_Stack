---
id: 001
title: Phase V Cloud-Native DOKS Deployment Specification
stage: spec
date: 2026-01-08
surface: agent
model: claude-sonnet-4-5-20250929
feature: 005-cloud-native-doks
branch: master
user: TEXON
command: manual
labels: ["phase5", "cloud-native", "doks", "kafka", "dapr", "event-driven", "digitalocean", "terraform", "infrastructure"]
links:
  spec: specs/005-cloud-native-doks/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution-phase5.md
  - specs/005-cloud-native-doks/spec.md
  - specs/005-cloud-native-doks/event-schemas.md
  - specs/005-cloud-native-doks/dapr-config.md
  - specs/005-cloud-native-doks/kafka-setup.md
  - specs/005-cloud-native-doks/reminder-engine.md
  - specs/005-cloud-native-doks/doks-deployment.md
tests:
  - None (specification phase)
---

## Prompt

PHASE V — Cloud-Native Deployment | DOKS + Kafka + Dapr (Spec-Driven)
I am now deploying the Todo AI System to DigitalOcean Kubernetes (DOKS).
The architecture must be event-driven and generated entirely from refined specifications.

🏛 System Constitution — Phase V

Runtime Platform: DigitalOcean Kubernetes (DOKS)

Event Bus: Apache Kafka (Managed)

Service Mesh: Dapr

Database: PostgreSQL (Managed)

Infrastructure: Terraform

Components:

FastAPI Backend (event publisher)

Next.js Frontend

AI Chatbot / Agent Service

Postgres Database (Managed)

Kafka Event Bus (Managed)

Reminder Engine Service (new)

📜 Event-Driven Architecture

Task CRUD operations emit domain events

Events published to Kafka topics via Dapr

Reminder Engine consumes task events

Dapr handles pub/sub, service-to-service calls, retries, observability

🔁 Operational Requirements

All infrastructure provisioned via Terraform

Event schema versioning and validation

Eventual consistency patterns

Multi-tenancy ready

Zero-downtime deployments

✅ Acceptance Criteria

System runs fully on DOKS

Event-driven architecture with Kafka and Dapr

All infrastructure generated from specs

Reminder Engine service implemented

No manual YAML or Terraform editing

First: Generate Cloud Constitution + Event Spec.
Then: Generate manifests, Dapr configs, Kafka setup, and deployment scripts.

## Response snapshot

I successfully created comprehensive specifications for Phase V Cloud-Native DOKS deployment, following Spec-Driven Development principles:

**1. Phase V Constitution (constitution-phase5.md)**
- Extended Phase IV constitution to v5.0.0 (MAJOR version)
- Added 8 new core principles for event-driven systems:
  - Event-Driven Architecture (NON-NEGOTIABLE)
  - Pub/Sub Messaging (NON-NEGOTIABLE)
  - Dapr Sidecar Pattern (NON-NEGOTIABLE)
  - Cloud-Native Deployment (NON-NEGOTIABLE)
  - Event Schema Versioning (NON-NEGOTIABLE)
  - Eventual Consistency (NON-NEGOTIABLE)
  - Multi-Tenancy Ready (NON-NEGOTIABLE)
  - Extended Infrastructure as Code for Cloud
- Defined complete event-driven architecture with Kafka, Dapr, and new Reminder Engine service
- Specified cloud resource requirements (DOKS, Managed Kafka, Managed PostgreSQL, Load Balancer)
- Total estimated cost: $432/month
- 700+ lines of event-driven governance

**2. Event-Driven Architecture Specification (spec.md)**
- Complete event-driven architecture with 6 domain event types:
  - task.created, task.updated, task.completed, task.deleted
  - task.reminder.triggered, agent.action.executed
- Kafka topic configurations (3 topics: tasks, reminders, agent-actions)
- Dapr component specifications (pub/sub, state store, secret store, resiliency)
- New Reminder Engine service specification
- Cloud infrastructure specifications (DOKS cluster, Managed Kafka, Managed PostgreSQL)
- Event flow diagrams and sequence diagrams
- 7 user stories with acceptance criteria
- Risk analysis and testing strategy
- 1,100+ lines

**3. Event Schema Specifications (event-schemas.md)**
- JSON Schema definitions for all 6 event types
- Base event schema with common fields (event_id, event_type, event_version, timestamp, correlation_id, tenant_id)
- Semantic versioning strategy for schema evolution (MAJOR.MINOR.PATCH)
- Schema registry configuration (Confluent Schema Registry)
- Event validation in Python (Pydantic) and TypeScript (Zod)
- Code generation from schemas
- Backward compatibility rules
- 800+ lines

**4. Dapr Configuration Specifications (dapr-config.md)**
- Dapr component configurations:
  - Pub/Sub component (Kafka)
  - State store component (Redis)
  - Secret store component (Kubernetes)
  - Resiliency policies (retries, timeouts, circuit breakers)
- Service annotations for Dapr sidecar injection (Backend, Reminder Engine, MCP Server)
- Declarative subscription configurations
- Service-to-service invocation examples using Dapr SDK
- Observability configuration (distributed tracing with Zipkin, Prometheus metrics)
- Dapr dashboard deployment
- Testing procedures for all Dapr components
- 800+ lines

**5. Kafka Setup Specifications (kafka-setup.md)**
- Strimzi operator deployment for Kafka on Kubernetes
- Kafka cluster configuration (3 brokers, replication factor 3, persistent storage)
- Topic creation specifications for all 3 topics:
  - tasks: 6 partitions, RF=3, 7-day retention
  - reminders: 3 partitions, RF=3, 7-day retention
  - agent-actions: 3 partitions, RF=3, 7-day retention
- Consumer group configurations (reminder-engine, agent-runtime)
- Security and ACL configuration (SASL/SCRAM-SHA-512)
- Kafka user definitions with ACLs
- Monitoring and metrics (Prometheus ServiceMonitor, Grafana dashboards)
- Testing procedures (cluster health, producer/consumer tests, performance tests)
- Troubleshooting guide
- 900+ lines

**6. Reminder Engine Service Specification (reminder-engine.md)**
- Complete new microservice specification:
  - Python 3.11 + FastAPI + APScheduler
  - Subscribes to 'tasks' topic via Dapr
  - Schedules reminders for tasks with due dates (1 hour before)
  - Publishes 'task.reminder.triggered' events
  - Stores reminder state in PostgreSQL
- Event subscription and handler implementation
- APScheduler configuration (persistent job store, async executor)
- Database schema for reminder state
- Multi-stage Dockerfile (Python 3.11-alpine, non-root user)
- Kubernetes deployment manifests (1 replica, resource limits, health checks)
- Dapr sidecar configuration
- API endpoints (health, readiness, admin)
- Testing procedures (unit tests, integration tests)
- Troubleshooting guide
- 1,000+ lines

**7. DOKS Deployment Specifications (doks-deployment.md)**
- Complete Terraform infrastructure provisioning:
  - DOKS cluster (3 nodes, s-4vcpu-8gb, auto-scaling 3-6)
  - Managed Kafka cluster (3 brokers, kafka-3-node-2gb, 100GB storage)
  - Managed PostgreSQL (db-s-2vcpu-4gb, 50GB storage, high availability)
  - Container Registry (Professional plan)
  - Load Balancer with SSL/TLS (Let's Encrypt)
- Terraform configuration files (main.tf, variables.tf, outputs.tf, doks.tf, kafka.tf, database.tf, registry.tf)
- Container registry setup and image build/push procedures
- Kubernetes cluster deployment (kubectl configuration, namespaces, registry access)
- Dapr installation and cert-manager setup
- Managed services configuration (database connection, Kafka connection, migrations)
- Application deployment procedures (Dapr components, services, Ingress)
- DNS and SSL configuration (cert-manager, ClusterIssuer, TLS certificates)
- Monitoring and observability (Prometheus stack, Grafana dashboards)
- Backup and disaster recovery (database backups, Velero for Kubernetes)
- Cost optimization strategies
- Troubleshooting guide
- 1,100+ lines

**Key Architectural Decisions:**
- Event-driven architecture with Kafka as event bus
- Dapr for pub/sub abstraction and service mesh capabilities
- New Reminder Engine service for asynchronous reminder scheduling
- Managed services for Kafka and PostgreSQL (reduced operational overhead)
- Terraform for Infrastructure as Code (declarative, version-controlled)
- Strimzi operator for Kafka on Kubernetes (alternative to managed Kafka for self-hosted)
- Event schema versioning with semantic versioning
- Eventual consistency patterns for event propagation
- Multi-tenancy support via tenant_id in all events
- Zero-downtime deployments with rolling updates

**Success Criteria Met:**
- ✅ All specifications follow Spec-Driven Development principles
- ✅ No code or infrastructure implementation (specification only)
- ✅ Complete event-driven architecture specifications
- ✅ Event schemas defined with JSON Schema
- ✅ Dapr components specified for pub/sub, state, secrets, resiliency
- ✅ Kafka setup specified with Strimzi operator
- ✅ New Reminder Engine service fully specified
- ✅ Complete DOKS deployment with Terraform
- ✅ Monitoring, backup, and disaster recovery specified
- ✅ Cost estimation provided ($432/month)

## Outcome

- ✅ Impact: Created complete Phase V specification suite enabling cloud-native event-driven deployment of Todo AI System to DigitalOcean Kubernetes. All specifications are implementation-ready and follow Spec-Driven Development principles. No manual YAML, Terraform, or code editing required.
- 🧪 Tests: No tests run (specification phase). Testing strategies defined in each specification document for implementation phase.
- 📁 Files: Created 7 specification documents totaling ~6,500 lines of detailed specifications covering constitution, event-driven architecture, event schemas, Dapr configuration, Kafka setup, Reminder Engine service, and DOKS deployment with Terraform.
- 🔁 Next prompts:
  - Generate Terraform files from doks-deployment.md
  - Generate Dockerfiles from reminder-engine.md
  - Generate Kubernetes manifests from all specifications
  - Deploy to DOKS following doks-deployment.md procedures
  - Run `/sp.plan` if planning phase needed for implementation
  - Run `/sp.tasks` to generate actionable implementation tasks
  - Run `/sp.adr` to document architectural decisions (Event-Driven Architecture, Dapr Sidecar Pattern, Managed Services)
- 🧠 Reflection: Successfully translated cloud-native event-driven requirements into comprehensive, implementation-ready specifications. The multi-layer architecture (DOKS → Terraform → Kubernetes → Dapr → Kafka → Application) ensures proper separation of concerns and maintains all Phase II/III/IV functionality while adding event-driven capabilities. All specifications include event schemas, Dapr configurations, Kafka setup, new Reminder Engine service, complete Terraform infrastructure, monitoring, backup, and cost optimization. The Event-Driven Architecture principle is enforced throughout, ensuring all state changes emit events and services communicate asynchronously via Kafka and Dapr.

## Evaluation notes (flywheel)

- Failure modes observed: None. All specifications created successfully with complete detail.
- Graders run and results (PASS/FAIL): N/A (specification phase, no infrastructure to grade)
- Prompt variant (if applicable): N/A (initial specification creation)
- Next experiment (smallest change to try): Proceed to implementation phase by generating Terraform files and deploying infrastructure to DOKS. Generate Dockerfiles and Kubernetes manifests from specifications. Test event-driven flows end-to-end. If gaps are found, refine specifications before continuing implementation.
