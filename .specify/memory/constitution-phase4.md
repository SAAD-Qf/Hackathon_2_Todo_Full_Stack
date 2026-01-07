<!--
  Sync Impact Report:
  - Version change: 3.0.0 → 4.0.0 (MAJOR)
  - Breaking changes: Addition of Kubernetes deployment layer and infrastructure specifications
  - New principles added: Infrastructure as Code (Spec-Driven), Container-First Architecture, Service Mesh Networking, Zero-Downtime Deployments, Observability-First Design
  - Extended principles: All Phase III principles maintained with deployment considerations
  - Templates status:
    ✅ spec-template.md - aligned with infrastructure requirements
    ✅ plan-template.md - aligned with deployment architecture
    ✅ tasks-template.md - aligned with infrastructure tasks
  - Follow-up TODOs: None - all placeholders filled
-->

# Evolution of Todo — Phase IV Constitution

## Core Principles

### I. Spec-First Development (NON-NEGOTIABLE - EXTENDED)

All implementation MUST derive from written specifications, including infrastructure:
- Domain model with all entities and relationships (Phase II)
- API contracts with request/response schemas (Phase II)
- MCP tool definitions with input/output schemas (Phase III)
- Agent behavior and intent parsing rules (Phase III)
- Frontend components and their data requirements (Phase II/III)
- **Container specifications with resource limits and health checks (Phase IV)**
- **Kubernetes manifests with deployment strategies (Phase IV)**
- **Helm chart values and templates (Phase IV)**
- **Infrastructure networking and service discovery (Phase IV)**
- Database schema and migrations (Phase II)
- Expected inputs, outputs, and error conditions (All Phases)

**Rationale**: Spec-Driven Development extends to infrastructure. No manual YAML editing or Docker configuration is permitted. All infrastructure must be generated from specifications to ensure consistency, reproducibility, and traceability.

### II. Infrastructure as Code (Spec-Driven) (NON-NEGOTIABLE)

All infrastructure MUST be defined in specifications before deployment:
- Dockerfiles generated from container specifications
- Kubernetes manifests generated from deployment specifications
- Helm charts generated from service specifications
- ConfigMaps and Secrets defined in specifications
- Ingress rules defined in networking specifications
- No manual kubectl commands except for spec-aligned operations
- All infrastructure changes require spec updates first

**Rationale**: Infrastructure as Code (IaC) ensures reproducibility, version control, and disaster recovery. Spec-Driven IaC adds the constraint that specifications are the source of truth, not the generated YAML.

### III. Container-First Architecture (NON-NEGOTIABLE)

All application components MUST be containerized:
- Each service has a Dockerfile specification
- Base images are pinned to specific versions
- Multi-stage builds for production optimization
- Health checks defined at container level
- Resource limits (CPU, memory) specified
- Environment variables injected via ConfigMaps/Secrets
- No host dependencies beyond container runtime

**Rationale**: Container-First Architecture ensures consistency across development, staging, and production environments. It also enables horizontal scaling and zero-downtime deployments.

### IV. Service Mesh Networking (NON-NEGOTIABLE)

All inter-service communication MUST use Kubernetes service discovery:
- Each component has a Kubernetes Service
- Internal communication uses cluster DNS (service-name.namespace.svc.cluster.local)
- External access only through Ingress
- No hardcoded IP addresses or external URLs for internal services
- Network policies define allowed communication paths
- Service-to-service authentication via service accounts

**Rationale**: Service Mesh Networking provides service discovery, load balancing, and network isolation. It enables dynamic scaling and service replacement without configuration changes.

### V. Zero-Downtime Deployments (NON-NEGOTIABLE)

All deployments MUST support rolling updates without downtime:
- Rolling update strategy with maxSurge and maxUnavailable
- Readiness probes ensure traffic only to ready pods
- Liveness probes detect and restart unhealthy pods
- PreStop hooks for graceful shutdown
- PodDisruptionBudgets prevent simultaneous pod termination
- Database migrations run as init containers or jobs

**Rationale**: Zero-Downtime Deployments ensure continuous availability during updates. This is critical for production systems and enables frequent deployments.

### VI. Observability-First Design (NON-NEGOTIABLE)

All components MUST expose observability endpoints:
- Structured logging to stdout/stderr (JSON format)
- Health check endpoints (/health, /ready)
- Metrics endpoints (/metrics) in Prometheus format
- Distributed tracing with correlation IDs
- Log aggregation via Kubernetes logging
- Resource usage monitoring via Kubernetes metrics

**Rationale**: Observability-First Design enables proactive monitoring, debugging, and performance optimization. It's essential for operating distributed systems in production.

### VII. Secret Management (NON-NEGOTIABLE)

All sensitive data MUST be managed via Kubernetes Secrets:
- Database credentials in Secrets
- API keys in Secrets
- TLS certificates in Secrets
- Secrets mounted as volumes or environment variables
- No secrets in container images or ConfigMaps
- Secret rotation supported via deployment updates

**Rationale**: Secret Management prevents credential leakage and enables secure credential rotation. Kubernetes Secrets provide encryption at rest and access control.

### VIII. Configuration Management (NON-NEGOTIABLE)

All configuration MUST be externalized via ConfigMaps:
- Application configuration in ConfigMaps
- Environment-specific values in Helm values files
- No configuration hardcoded in container images
- Configuration changes trigger rolling updates
- Configuration validated before deployment

**Rationale**: Configuration Management enables environment-specific deployments without rebuilding containers. It also supports A/B testing and feature flags.

### IX. Persistent Storage (NON-NEGOTIABLE)

All stateful components MUST use PersistentVolumes:
- Database uses PersistentVolumeClaim
- Storage class defined for volume provisioning
- Backup and restore procedures defined
- Volume snapshots for disaster recovery
- StatefulSets for stateful workloads

**Rationale**: Persistent Storage ensures data durability across pod restarts and node failures. It's essential for databases and other stateful services.

### X. Agent-Tool Separation (MAINTAINED FROM PHASE III)

AI agents MUST NOT modify application state directly:
- All state modifications go through MCP tools (Phase III)
- MCP tools are the ONLY interface between agent and backend API (Phase III)
- Agents parse intent and select appropriate tools (Phase III)
- **Agent service runs in separate pod with resource limits (Phase IV)**
- **MCP server runs in separate pod or sidecar (Phase IV)**
- No direct database or API access from agent code (Phase III)

**Rationale**: Agent-Tool Separation ensures business logic remains in the backend. In Kubernetes, this extends to pod-level isolation with resource limits.

### XI. MCP-First Integration (MAINTAINED FROM PHASE III)

Model Context Protocol (MCP) tools MUST be the exclusive interface for agent operations:
- Each backend API operation has a corresponding MCP tool (Phase III)
- **MCP server exposed as Kubernetes Service (Phase IV)**
- **Agent communicates with MCP server via cluster DNS (Phase IV)**
- MCP tools validate inputs before calling API (Phase III)
- No direct API calls from agent runtime (Phase III)

**Rationale**: MCP-First Integration provides standardized agent-backend communication. In Kubernetes, this is implemented via service-to-service networking.

### XII. Iterative Refinement Through Specs (MAINTAINED FROM ALL PHASES)

When implementation produces incorrect output:
- DO NOT modify code or YAML directly
- DO refine the specification to clarify requirements
- DO regenerate implementation from updated spec
- DO document what was unclear in the original spec
- DO update API contracts, MCP tools, agent prompts, or infrastructure specs if needed

**Rationale**: This principle enforces the Spec-Driven Development contract across all layers including infrastructure. Incorrect deployment behavior indicates ambiguous specifications.

## Development Workflow

### Specification Phase

1. Write infrastructure specification:
   - Define all components (backend, frontend, agent, MCP, database)
   - Define resource requirements (CPU, memory, storage)
   - Define health check endpoints and strategies
   - Define networking and service discovery
   - Define secrets and configuration requirements
   - Define deployment strategies and rollout policies

2. Write container specifications:
   - Define Dockerfile for each component
   - Define base images and versions
   - Define build stages (development, production)
   - Define exposed ports and volumes
   - Define environment variables and entry points

3. Write Helm chart specifications:
   - Define chart structure and dependencies
   - Define values schema with defaults
   - Define templates for Deployments, Services, Ingress
   - Define ConfigMaps and Secrets templates
   - Define resource quotas and limits

4. Write operational procedures:
   - Define deployment procedures
   - Define rollback procedures
   - Define backup and restore procedures
   - Define monitoring and alerting setup
   - Define troubleshooting guides

5. Review specification for completeness:
   - All components have resource limits
   - All services have health checks
   - All secrets are externalized
   - All configuration is in ConfigMaps
   - All networking is via service discovery

6. Obtain approval before proceeding to implementation

### Implementation Phase

1. Generate Dockerfiles from container specifications:
   - Multi-stage builds for each component
   - Optimized layer caching
   - Security scanning in CI/CD

2. Generate Helm charts from deployment specifications:
   - Chart templates for all Kubernetes resources
   - Values files for different environments
   - Chart dependencies and hooks

3. Generate Kubernetes manifests from specifications:
   - Deployments with rolling update strategy
   - Services with appropriate types
   - Ingress with routing rules
   - ConfigMaps and Secrets
   - PersistentVolumeClaims

4. Deploy to Minikube:
   - Start Minikube cluster
   - Install Helm charts
   - Verify all pods are running
   - Test service connectivity
   - Verify external access via Ingress

5. If deployment fails, return to Specification Phase

### Validation Phase

1. Verify all acceptance scenarios pass
2. Verify all components are running
3. Verify service-to-service communication
4. Verify external access via Ingress
5. Verify zero-downtime rolling updates
6. Verify logs and metrics collection
7. Document any deviations or clarifications needed

## Technical Constraints

**Container Runtime**:
- Runtime: Docker (Minikube default)
- Base Images: Alpine Linux or Distroless (minimal attack surface)
- Registry: Docker Hub or local registry
- Image Tags: Semantic versioning (no :latest in production)

**Kubernetes Platform**:
- Distribution: Minikube (local development)
- Version: 1.28+ (stable)
- Networking: CNI plugin (default)
- Storage: hostPath (Minikube) or local-path provisioner
- Ingress: NGINX Ingress Controller

**Helm**:
- Version: Helm 3.x
- Chart API Version: v2
- Chart Structure: Standard Helm chart layout
- Values: Environment-specific values files
- Hooks: Pre-install, post-install, pre-upgrade, post-upgrade

**Tools**:
- **kagent**: AI-powered Kubernetes agent for spec-aligned operations
- **kubectl-ai**: AI-powered kubectl plugin for natural language commands
- **kubectl**: Standard Kubernetes CLI
- **helm**: Helm CLI for chart management
- **minikube**: Local Kubernetes cluster

**Component Stack** (Inherited from Phase II/III):
- Backend: FastAPI + SQLModel + Neon Postgres
- Frontend: Next.js 14 + TypeScript + Tailwind CSS
- Chat UI: OpenAI ChatKit + Next.js
- Agent: OpenAI Agents SDK + TypeScript
- MCP Server: Official MCP SDK + TypeScript
- Database: PostgreSQL 16 (containerized)

**Namespace**:
- Namespace: `todo-ai`
- All resources deployed in this namespace
- Resource quotas applied at namespace level

**Required Components** (Phase IV):
- Backend API (FastAPI) - Deployment + Service
- Frontend Web UI (Next.js) - Deployment + Service
- Chat UI (ChatKit) - Deployment + Service
- Agent Runtime (OpenAI Agents SDK) - Deployment + Service
- MCP Server (MCP SDK) - Deployment + Service
- Database (PostgreSQL) - StatefulSet + Service + PVC
- Ingress (NGINX) - Ingress resource

**Prohibited**:
- Manual YAML editing (must be generated from specs)
- Hardcoded secrets in manifests
- Hardcoded IP addresses or external URLs
- :latest image tags in production
- Running as root in containers
- Privileged containers
- Host network or host path mounts (except for Minikube storage)

## Quality Standards

### Container Quality

- All containers have non-root user
- All containers have health checks
- All containers have resource limits
- All containers use specific image tags
- All containers pass security scanning
- All containers have minimal attack surface

### Kubernetes Quality

- All Deployments have rolling update strategy
- All Services have appropriate type (ClusterIP, NodePort, LoadBalancer)
- All Pods have readiness and liveness probes
- All Pods have resource requests and limits
- All Secrets are base64 encoded
- All ConfigMaps are validated

### Helm Quality

- All charts follow standard structure
- All values have defaults
- All templates are valid YAML
- All charts have README.md
- All charts have NOTES.txt
- All charts pass `helm lint`

### Operational Quality

- All deployments support rollback
- All services have monitoring
- All logs are aggregated
- All metrics are collected
- All alerts are configured
- All procedures are documented

## Architecture Decisions

### Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Minikube Cluster                          │
│                      Namespace: todo-ai                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                    Ingress (NGINX)                      │    │
│  │  Routes: /api → backend, / → frontend, /chat → chatui  │    │
│  └────────────────────────────────────────────────────────┘    │
│                          │                                       │
│         ┌────────────────┼────────────────┐                    │
│         │                │                │                     │
│         ▼                ▼                ▼                     │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐                │
│  │ Frontend │    │  ChatUI  │    │ Backend  │                 │
│  │ Service  │    │ Service  │    │ Service  │                 │
│  │(ClusterIP)│   │(ClusterIP)│   │(ClusterIP)│                │
│  └──────────┘    └──────────┘    └──────────┘                 │
│       │               │                │                        │
│       ▼               ▼                │                        │
│  ┌──────────┐    ┌──────────┐         │                       │
│  │ Frontend │    │  ChatUI  │         │                        │
│  │   Pod    │    │   Pod    │         │                        │
│  │(Next.js) │    │(ChatKit) │         │                        │
│  └──────────┘    └──────────┘         │                        │
│                       │                │                        │
│                       ▼                │                        │
│                  ┌──────────┐         │                        │
│                  │  Agent   │         │                        │
│                  │ Service  │         │                        │
│                  │(ClusterIP)│        │                        │
│                  └──────────┘         │                        │
│                       │                │                        │
│                       ▼                │                        │
│                  ┌──────────┐         │                        │
│                  │  Agent   │         │                        │
│                  │   Pod    │         │                        │
│                  │(Agents SDK)        │                        │
│                  └──────────┘         │                        │
│                       │                │                        │
│                       ▼                │                        │
│                  ┌──────────┐         │                        │
│                  │   MCP    │         │                        │
│                  │ Service  │         │                        │
│                  │(ClusterIP)│        │                        │
│                  └──────────┘         │                        │
│                       │                │                        │
│                       ▼                │                        │
│                  ┌──────────┐         │                        │
│                  │   MCP    │         │                        │
│                  │   Pod    │         │                        │
│                  │(MCP SDK) │         │                        │
│                  └──────────┘         │                        │
│                       │                │                        │
│                       └────────────────┘                        │
│                                │                                │
│                                ▼                                │
│                         ┌──────────┐                           │
│                         │ Backend  │                           │
│                         │   Pod    │                           │
│                         │(FastAPI) │                           │
│                         └──────────┘                           │
│                                │                                │
│                                ▼                                │
│                         ┌──────────┐                           │
│                         │ Database │                           │
│                         │ Service  │                           │
│                         │(ClusterIP)│                          │
│                         └──────────┘                           │
│                                │                                │
│                                ▼                                │
│                         ┌──────────┐                           │
│                         │ Database │                           │
│                         │   Pod    │                           │
│                         │(Postgres)│                           │
│                         └──────────┘                           │
│                                │                                │
│                                ▼                                │
│                         ┌──────────┐                           │
│                         │   PVC    │                           │
│                         │(Storage) │                           │
│                         └──────────┘                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Resource Allocation

| Component | CPU Request | CPU Limit | Memory Request | Memory Limit | Replicas |
|-----------|-------------|-----------|----------------|--------------|----------|
| Backend   | 100m        | 500m      | 128Mi          | 512Mi        | 2        |
| Frontend  | 50m         | 200m      | 64Mi           | 256Mi        | 2        |
| ChatUI    | 50m         | 200m      | 64Mi           | 256Mi        | 2        |
| Agent     | 100m        | 500m      | 256Mi          | 1Gi          | 1        |
| MCP       | 50m         | 200m      | 128Mi          | 512Mi        | 1        |
| Database  | 250m        | 1000m     | 512Mi          | 2Gi          | 1        |

### Service Types

| Component | Service Type | Port | Target Port | External Access |
|-----------|--------------|------|-------------|-----------------|
| Backend   | ClusterIP    | 8000 | 8000        | Via Ingress     |
| Frontend  | ClusterIP    | 3000 | 3000        | Via Ingress     |
| ChatUI    | ClusterIP    | 3001 | 3000        | Via Ingress     |
| Agent     | ClusterIP    | 3002 | 3000        | Internal only   |
| MCP       | ClusterIP    | 3003 | 3000        | Internal only   |
| Database  | ClusterIP    | 5432 | 5432        | Internal only   |

### Health Checks

All components must have:
- **Readiness Probe**: HTTP GET to /health or /ready endpoint
- **Liveness Probe**: HTTP GET to /health endpoint
- **Initial Delay**: 10-30 seconds (component-specific)
- **Period**: 10 seconds
- **Timeout**: 5 seconds
- **Failure Threshold**: 3

### Rolling Update Strategy

All Deployments use:
- **Strategy**: RollingUpdate
- **Max Surge**: 1 (one extra pod during update)
- **Max Unavailable**: 0 (no downtime)
- **Min Ready Seconds**: 10 (wait before marking ready)

## Governance

### Amendment Process

1. Propose amendment with rationale
2. Document impact on existing specifications
3. Update constitution version following semantic versioning:
   - MAJOR: Breaking changes to architecture or deployment
   - MINOR: New principles or sections added
   - PATCH: Clarifications or wording improvements
4. Update all dependent templates and documentation

### Compliance

- All code reviews MUST verify compliance with constitution
- All infrastructure changes MUST be spec-driven
- Violations MUST be justified in writing or corrected
- Complexity beyond these principles MUST be explicitly approved
- Manual YAML editing is PROHIBITED
- All deployments MUST pass validation checks

### Version Control

This constitution supersedes Phase III for deployment and infrastructure.

**Version**: 4.0.0 | **Ratified**: 2026-01-08 | **Last Amended**: 2026-01-08

**Changes from v3.0.0**:
- MAJOR: Addition of Kubernetes deployment layer
- Added: Infrastructure as Code (Spec-Driven), Container-First Architecture, Service Mesh Networking, Zero-Downtime Deployments, Observability-First Design, Secret Management, Configuration Management, Persistent Storage
- Extended: Spec-First Development (includes infrastructure), Agent-Tool Separation (pod-level isolation), MCP-First Integration (service-to-service networking)
- Tech Stack: Added Minikube, Helm, Docker, kagent, kubectl-ai
- Architecture: Multi-pod deployment with service mesh networking
