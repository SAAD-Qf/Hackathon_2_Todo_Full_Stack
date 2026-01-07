<!--
  Sync Impact Report:
  - Version change: 1.0.0 → 2.0.0 (MAJOR)
  - Breaking changes: Transition from console app to full-stack web application
  - New principles added: API-First Design, Database Schema from Spec, Type Safety, Frontend-Backend Separation
  - Modified principles: In-Memory Simplicity → Database Persistence, Console Interface → Web Interface
  - Templates status:
    ✅ spec-template.md - aligned with full-stack requirements
    ✅ plan-template.md - aligned with multi-tier architecture
    ✅ tasks-template.md - aligned with backend/frontend separation
  - Follow-up TODOs: None - all placeholders filled
-->

# Evolution of Todo — Phase II Constitution

## Core Principles

### I. Spec-First Development (NON-NEGOTIABLE)

All implementation MUST derive from written specifications. No code shall be written without a corresponding specification that defines:
- Domain model with all entities and relationships
- API contracts with request/response schemas
- Frontend components and their data requirements
- Database schema and migrations
- Expected inputs, outputs, and error conditions

**Rationale**: Spec-Driven Development ensures that every line of code has a documented purpose and can be traced back to a requirement. In a full-stack application, this prevents frontend-backend misalignment and ensures API contracts are honored.

### II. API-First Design (NON-NEGOTIABLE)

Frontend and backend MUST communicate exclusively through well-defined REST API endpoints:
- All API endpoints documented in specification before implementation
- Request and response schemas defined with JSON examples
- No direct database access from frontend
- No business logic in frontend (API handles all business rules)
- API versioning strategy defined upfront

**Rationale**: API-First Design ensures loose coupling between frontend and backend, enabling independent development, testing, and deployment. It also provides a clear contract that both teams can work against.

### III. Database Schema from Spec

Database schema MUST be generated from domain model specification:
- SQLModel classes define both Python models and database schema
- All fields, types, constraints, and relationships specified in domain model
- Migrations generated automatically from model changes
- No manual SQL unless explicitly justified
- Schema changes require spec updates first

**Rationale**: Generating schema from code ensures consistency between application models and database structure. SQLModel provides type safety and eliminates manual schema management.

### IV. Type Safety Throughout Stack

Type safety MUST be enforced at all layers:
- **Backend**: Python type hints on all functions, Pydantic models for validation
- **Frontend**: TypeScript with strict mode, typed API client
- **API**: JSON Schema validation on requests/responses
- **Database**: SQLModel enforces column types and constraints

**Rationale**: Type safety catches errors at compile time rather than runtime, improves IDE support, and serves as living documentation.

### V. Frontend-Backend Separation

Frontend and backend MUST be independently deployable:
- Frontend has no direct database access
- Backend exposes stateless REST API
- Authentication/authorization handled by backend
- Frontend state management separate from API calls
- No shared code between frontend and backend (except API types)

**Rationale**: Separation enables independent scaling, deployment, and technology choices. It also enforces proper architectural boundaries.

### VI. Component Modularity

Frontend components MUST follow single responsibility:
- Each component has one clear purpose
- Components are reusable and composable
- Props are explicitly typed
- State management is localized or lifted appropriately
- No global state except for authentication and theme

**Rationale**: Modular components are easier to test, maintain, and reuse. They also enable parallel development by multiple team members.

### VII. Iterative Refinement Through Specs

When implementation produces incorrect output:
- DO NOT modify code directly
- DO refine the specification to clarify requirements
- DO regenerate implementation from updated spec
- DO document what was unclear in the original spec
- DO update API contracts if needed

**Rationale**: This principle enforces the Spec-Driven Development contract. If the spec was clear, the implementation would be correct. Incorrect output indicates ambiguous or incomplete specifications.

## Development Workflow

### Specification Phase

1. Write domain model specification:
   - Define all entities with fields, types, and constraints
   - Define relationships between entities
   - Define validation rules

2. Write API specification:
   - Define all endpoints (method, path, purpose)
   - Define request schemas with examples
   - Define response schemas with examples
   - Define error responses
   - Define authentication requirements

3. Write frontend specification:
   - Define user stories with priorities
   - Define page layouts and components
   - Define component props and state
   - Define user interactions and flows

4. Review specification for completeness:
   - All API endpoints have request/response schemas
   - All database fields have types and constraints
   - All frontend components have defined props
   - All error conditions specified

5. Obtain approval before proceeding to implementation

### Implementation Phase

1. Generate backend implementation from spec:
   - SQLModel models from domain specification
   - FastAPI routes from API specification
   - Pydantic schemas for validation
   - Database migrations

2. Generate frontend implementation from spec:
   - Next.js pages from user stories
   - React components from component specification
   - API client from API specification
   - Tailwind styling

3. Test integration:
   - Backend API tests
   - Frontend component tests
   - End-to-end integration tests

4. If output is incorrect, return to Specification Phase

### Validation Phase

1. Verify all acceptance scenarios pass
2. Verify all functional requirements met
3. Verify API contracts honored
4. Verify database schema matches domain model
5. Document any deviations or clarifications needed

## Technical Constraints

**Frontend Stack**:
- Framework: Next.js 14+ (App Router)
- Styling: Tailwind CSS
- Language: TypeScript (strict mode)
- State: React hooks + Context API (minimal)
- HTTP Client: fetch API with typed wrapper

**Backend Stack**:
- Framework: FastAPI
- ORM: SQLModel
- Database: Neon Postgres (serverless)
- Validation: Pydantic v2
- Language: Python 3.11+

**API Design**:
- Protocol: REST over HTTP/HTTPS
- Format: JSON
- Authentication: JWT tokens (if needed)
- Versioning: URL path versioning (/api/v1/)
- CORS: Configured for frontend origin

**Database**:
- Provider: Neon (serverless Postgres)
- Migrations: Alembic (auto-generated from SQLModel)
- Connection: Async (asyncpg)
- Pooling: Managed by Neon

**Required Features** (Phase II):
- Add Task (with priority, tags, due_date)
- Delete Task (by ID)
- Update Task (all fields editable)
- View Tasks (list with pagination)
- Mark Complete/Incomplete (toggle)
- Search Tasks (by text in title/description)
- Filter Tasks (by status, priority, tag)
- Sort Tasks (by due_date, priority, title)

**Prohibited**:
- Direct database access from frontend
- Business logic in frontend
- Untyped API responses
- Manual SQL (except for complex queries)
- Global state for application data

## Quality Standards

### Code Quality

**Backend**:
- All functions have type hints
- All routes have OpenAPI documentation
- All models have validation rules
- Error handling with proper HTTP status codes
- Logging for all operations

**Frontend**:
- All components are TypeScript
- All props are typed interfaces
- All API calls are typed
- Error boundaries for error handling
- Loading states for async operations

### Testing Approach

- **Backend**: Unit tests for business logic, integration tests for API endpoints
- **Frontend**: Component tests with React Testing Library
- **Integration**: End-to-end tests with Playwright (optional)
- **API**: Contract tests to verify request/response schemas

### Documentation

- **Specification**: Maintained in `specs/002-todo-fullstack/` directory
- **API**: Auto-generated OpenAPI docs at `/docs`
- **Frontend**: Component documentation with Storybook (optional)
- **Database**: Schema documented in domain model spec

## Architecture Decisions

### Database Schema

Tasks table structure:
```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    priority VARCHAR(10) NOT NULL DEFAULT 'medium',
    tags TEXT[] NOT NULL DEFAULT '{}',
    due_date TIMESTAMP NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### API Endpoints

```
POST   /api/v1/tasks          - Create task
GET    /api/v1/tasks          - List tasks (with filters, search, sort)
GET    /api/v1/tasks/{id}     - Get task by ID
PUT    /api/v1/tasks/{id}     - Update task
DELETE /api/v1/tasks/{id}     - Delete task
PATCH  /api/v1/tasks/{id}/complete - Toggle completion
```

### Frontend Structure

```
app/
├── page.tsx                  - Home page (task list)
├── layout.tsx                - Root layout
├── components/
│   ├── TaskList.tsx          - Task list component
│   ├── TaskItem.tsx          - Individual task component
│   ├── TaskForm.tsx          - Add/Edit task form
│   ├── SearchBar.tsx         - Search input
│   ├── FilterBar.tsx         - Filter controls
│   └── SortControls.tsx      - Sort controls
└── lib/
    ├── api.ts                - API client
    └── types.ts              - TypeScript types
```

## Governance

### Amendment Process

1. Propose amendment with rationale
2. Document impact on existing specifications
3. Update constitution version following semantic versioning:
   - MAJOR: Breaking changes to architecture or tech stack
   - MINOR: New principles or sections added
   - PATCH: Clarifications or wording improvements
4. Update all dependent templates and documentation

### Compliance

- All code reviews MUST verify compliance with constitution
- Violations MUST be justified in writing or corrected
- Complexity beyond these principles MUST be explicitly approved
- API contracts MUST be honored by both frontend and backend

### Version Control

This constitution supersedes all other development practices for Phase II.

**Version**: 2.0.0 | **Ratified**: 2026-01-06 | **Last Amended**: 2026-01-06

**Changes from v1.0.0**:
- MAJOR: Transition from console app to full-stack web application
- Added: API-First Design, Database Schema from Spec, Type Safety, Frontend-Backend Separation, Component Modularity
- Modified: In-Memory Simplicity → Database Persistence, Console Interface → Web Interface
- Tech Stack: Python console → FastAPI + Next.js + Neon Postgres
