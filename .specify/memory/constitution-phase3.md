<!--
  Sync Impact Report:
  - Version change: 2.0.0 → 3.0.0 (MAJOR)
  - Breaking changes: Addition of Conversational AI Interface layer
  - New principles added: Agent-Tool Separation, MCP-First Integration, Natural Language Intent Parsing, Conversational State Management
  - Extended principles: API-First Design → includes MCP tool layer
  - Templates status:
    ✅ spec-template.md - aligned with agent-based architecture
    ✅ plan-template.md - aligned with multi-layer AI system
    ✅ tasks-template.md - aligned with agent/tool/frontend separation
  - Follow-up TODOs: None - all placeholders filled
-->

# Evolution of Todo — Phase III Constitution

## Core Principles

### I. Spec-First Development (NON-NEGOTIABLE)

All implementation MUST derive from written specifications. No code shall be written without a corresponding specification that defines:
- Domain model with all entities and relationships
- API contracts with request/response schemas
- MCP tool definitions with input/output schemas
- Agent behavior and intent parsing rules
- Frontend components and their data requirements
- Database schema and migrations
- Expected inputs, outputs, and error conditions

**Rationale**: Spec-Driven Development ensures that every line of code has a documented purpose and can be traced back to a requirement. In Phase III, this extends to AI agent behavior, MCP tools, and conversational interfaces.

### II. Agent-Tool Separation (NON-NEGOTIABLE)

AI agents MUST NOT modify application state directly:
- All state modifications go through MCP tools
- MCP tools are the ONLY interface between agent and backend API
- Agents parse intent and select appropriate tools
- Agents format tool results for user presentation
- No direct database or API access from agent code
- No hardcoded business logic in agent prompts

**Rationale**: Agent-Tool Separation ensures that business logic remains in the backend, agents remain stateless and testable, and the system can evolve independently at each layer.

### III. MCP-First Integration (NON-NEGOTIABLE)

Model Context Protocol (MCP) tools MUST be the exclusive interface for agent operations:
- Each backend API operation has a corresponding MCP tool
- MCP tools validate inputs before calling API
- MCP tools transform API responses into agent-friendly formats
- MCP tools handle errors and return structured error messages
- No direct API calls from agent runtime
- MCP server configuration defines all available tools

**Rationale**: MCP-First Integration provides a standardized, type-safe interface between AI agents and backend systems, enabling tool reusability, testing, and monitoring.

### IV. Natural Language Intent Parsing

Agents MUST parse user intent from natural language and map to tool calls:
- Support conversational commands (e.g., "Add a task to call Ali tomorrow")
- Extract entities (task title, due date, priority, tags) from natural language
- Handle ambiguous inputs by asking clarifying questions
- Support bulk operations (e.g., "Move all meetings to 2 PM")
- Confirm actions before execution when appropriate
- Provide friendly, conversational responses

**Rationale**: Natural Language Intent Parsing makes the system accessible to non-technical users and enables more efficient task management through conversational interfaces.

### V. API-First Design (EXTENDED FROM PHASE II)

Frontend, agents, and MCP tools MUST communicate through well-defined interfaces:
- **Frontend ↔ Backend**: REST API (Phase II)
- **Agent ↔ MCP Tools**: MCP protocol with JSON-RPC
- **MCP Tools ↔ Backend**: REST API calls
- All interfaces documented in specification before implementation
- Request and response schemas defined with JSON examples
- No direct database access from any layer
- Versioning strategy defined upfront

**Rationale**: Multi-layer API-First Design ensures loose coupling between all system components, enabling independent development, testing, and deployment of each layer.

### VI. Conversational State Management

Agent conversations MUST maintain context while remaining stateless:
- Agent runtime manages conversation history
- Each tool call is self-contained with all required parameters
- No persistent state in agent code
- Session context passed through agent runtime
- Tool calls are idempotent where possible
- Conversation history used for context, not state

**Rationale**: Stateless agents are easier to scale, test, and debug. Conversation context is managed by the runtime, not the agent logic.

### VII. Type Safety Throughout Stack (EXTENDED FROM PHASE II)

Type safety MUST be enforced at all layers including AI layer:
- **Backend**: Python type hints on all functions, Pydantic models for validation
- **Frontend**: TypeScript with strict mode, typed API client
- **MCP Tools**: JSON Schema for tool definitions, typed parameters
- **Agent**: Structured outputs, typed tool calls
- **API**: JSON Schema validation on requests/responses
- **Database**: SQLModel enforces column types and constraints

**Rationale**: Type safety catches errors at compile time, improves IDE support, and serves as living documentation across all layers including AI components.

### VIII. Frontend-Backend Separation (MAINTAINED FROM PHASE II)

Frontend and backend MUST remain independently deployable:
- Frontend has no direct database access
- Backend exposes stateless REST API
- Authentication/authorization handled by backend
- Frontend state management separate from API calls
- No shared code between frontend and backend (except API types)
- ChatKit UI is an alternative frontend, not a replacement

**Rationale**: Separation enables independent scaling, deployment, and technology choices. Phase III adds a conversational frontend without modifying the existing web UI.

### IX. Component Modularity (EXTENDED FROM PHASE II)

All components MUST follow single responsibility:
- **Frontend Components**: Each has one clear purpose
- **MCP Tools**: Each tool performs one operation
- **Agent Functions**: Each handles one intent type
- Components are reusable and composable
- Props/parameters are explicitly typed
- State management is localized or lifted appropriately

**Rationale**: Modular components are easier to test, maintain, and reuse across different interfaces (web UI and chat UI).

### X. Iterative Refinement Through Specs (MAINTAINED FROM PHASE II)

When implementation produces incorrect output:
- DO NOT modify code directly
- DO refine the specification to clarify requirements
- DO regenerate implementation from updated spec
- DO document what was unclear in the original spec
- DO update API contracts, MCP tools, or agent prompts if needed

**Rationale**: This principle enforces the Spec-Driven Development contract across all layers. Incorrect agent behavior indicates ambiguous specifications, not code bugs.

## Development Workflow

### Specification Phase

1. Write domain model specification (if extending Phase II model):
   - Define any new entities with fields, types, and constraints
   - Define new relationships between entities
   - Define validation rules

2. Write MCP tools specification:
   - Define all MCP tools (name, description, parameters, returns)
   - Define parameter schemas with JSON Schema
   - Define return value schemas
   - Define error conditions and error messages
   - Map each tool to backend API endpoint

3. Write agent behavior specification:
   - Define supported intents (user commands)
   - Define entity extraction rules (dates, priorities, tags)
   - Define confirmation requirements
   - Define error handling and fallback responses
   - Define conversation flow patterns

4. Write ChatKit integration specification:
   - Define UI components for chat interface
   - Define message rendering (user, agent, tool results)
   - Define input handling and validation
   - Define loading states and error displays

5. Review specification for completeness:
   - All MCP tools have parameter and return schemas
   - All agent intents have example commands
   - All error conditions specified
   - All tool-to-API mappings defined

6. Obtain approval before proceeding to implementation

### Implementation Phase

1. Generate MCP tools implementation from spec:
   - MCP server configuration
   - Tool definitions with JSON Schema
   - API client for backend calls
   - Error handling and validation

2. Generate agent implementation from spec:
   - OpenAI Agents SDK configuration
   - Agent prompt with tool descriptions
   - Intent parsing logic
   - Response formatting

3. Generate ChatKit UI from spec:
   - Chat interface components
   - Message rendering
   - Input handling
   - Integration with agent runtime

4. Test integration:
   - MCP tool tests (unit and integration)
   - Agent behavior tests (intent parsing, tool selection)
   - End-to-end conversation tests
   - Error handling tests

5. If output is incorrect, return to Specification Phase

### Validation Phase

1. Verify all acceptance scenarios pass
2. Verify all functional requirements met
3. Verify MCP tools correctly call backend API
4. Verify agent correctly parses intents and selects tools
5. Verify ChatKit UI correctly displays conversations
6. Document any deviations or clarifications needed

## Technical Constraints

**Frontend Stack** (Phase II - Maintained):
- Framework: Next.js 14+ (App Router)
- Styling: Tailwind CSS
- Language: TypeScript (strict mode)
- State: React hooks + Context API (minimal)
- HTTP Client: fetch API with typed wrapper

**Chat Frontend Stack** (Phase III - New):
- Framework: OpenAI ChatKit (React-based)
- Styling: ChatKit default + Tailwind CSS
- Language: TypeScript (strict mode)
- State: ChatKit built-in state management
- Agent Client: OpenAI Agents SDK client

**Agent Runtime** (Phase III - New):
- Framework: OpenAI Agents SDK
- Language: TypeScript/JavaScript
- Tools: MCP protocol
- Model: GPT-4 or compatible
- Context: Conversation history managed by runtime

**MCP Tools Layer** (Phase III - New):
- Protocol: Model Context Protocol (Official MCP SDK)
- Language: TypeScript/JavaScript or Python
- Transport: stdio or HTTP
- Schema: JSON Schema for tool definitions
- Backend Client: fetch API or axios

**Backend Stack** (Phase II - Maintained):
- Framework: FastAPI
- ORM: SQLModel
- Database: Neon Postgres (serverless)
- Validation: Pydantic v2
- Language: Python 3.11+

**API Design** (Phase II - Maintained):
- Protocol: REST over HTTP/HTTPS
- Format: JSON
- Authentication: JWT tokens (if needed)
- Versioning: URL path versioning (/api/v1/)
- CORS: Configured for frontend origins

**Database** (Phase II - Maintained):
- Provider: Neon (serverless Postgres)
- Migrations: Alembic (auto-generated from SQLModel)
- Connection: Async (asyncpg)
- Pooling: Managed by Neon

**Required Features** (Phase III):
- Natural language task creation
- Natural language task updates (title, description, priority, tags, due date)
- Natural language task completion/incompletion
- Natural language task deletion
- Natural language task rescheduling
- Bulk operations (e.g., "Move all meetings to 2 PM")
- Intelligent date parsing (e.g., "tomorrow morning", "next Friday")
- Conversational confirmations
- Friendly error messages

**Prohibited**:
- Direct database access from agent or MCP tools
- Business logic in agent prompts
- Hardcoded API endpoints in agent code
- Untyped MCP tool parameters
- Direct API calls from agent (must use MCP tools)
- State persistence in agent code

## Quality Standards

### Code Quality

**Backend** (Phase II - Maintained):
- All functions have type hints
- All routes have OpenAPI documentation
- All models have validation rules
- Error handling with proper HTTP status codes
- Logging for all operations

**Frontend** (Phase II - Maintained):
- All components are TypeScript
- All props are typed interfaces
- All API calls are typed
- Error boundaries for error handling
- Loading states for async operations

**MCP Tools** (Phase III - New):
- All tools have JSON Schema definitions
- All parameters are validated
- All API calls have error handling
- All responses are structured
- Logging for all tool invocations

**Agent** (Phase III - New):
- All intents are documented
- All tool calls are validated
- All responses are user-friendly
- All errors are handled gracefully
- Conversation flow is tested

### Testing Approach

- **Backend**: Unit tests for business logic, integration tests for API endpoints (Phase II)
- **Frontend**: Component tests with React Testing Library (Phase II)
- **MCP Tools**: Unit tests for tool logic, integration tests for API calls (Phase III)
- **Agent**: Intent parsing tests, tool selection tests, conversation flow tests (Phase III)
- **Integration**: End-to-end tests with agent → MCP → API → database (Phase III)

### Documentation

- **Specification**: Maintained in `specs/003-ai-chatbot/` directory
- **API**: Auto-generated OpenAPI docs at `/docs` (Phase II)
- **MCP Tools**: Tool definitions in MCP server config
- **Agent**: Intent documentation in agent spec
- **ChatKit**: Component documentation

## Architecture Decisions

### System Architecture (Phase III)

```
┌─────────────────────────────────────────────────────────────┐
│                        User Layer                            │
├─────────────────────────────────────────────────────────────┤
│  Web UI (Next.js)              Chat UI (ChatKit)            │
│       │                              │                       │
│       │                              │                       │
│       ▼                              ▼                       │
├─────────────────────────────────────────────────────────────┤
│                    Agent Runtime Layer                       │
│                  (OpenAI Agents SDK)                         │
│                          │                                   │
│                          ▼                                   │
├─────────────────────────────────────────────────────────────┤
│                    MCP Tools Layer                           │
│              (Official MCP SDK)                              │
│   ┌──────────┬──────────┬──────────┬──────────┐            │
│   │ create   │ update   │ list     │ delete   │            │
│   │ _task    │ _task    │ _tasks   │ _task    │            │
│   └──────────┴──────────┴──────────┴──────────┘            │
│                          │                                   │
│                          ▼                                   │
├─────────────────────────────────────────────────────────────┤
│                    Backend API Layer                         │
│                     (FastAPI)                                │
│                          │                                   │
│                          ▼                                   │
├─────────────────────────────────────────────────────────────┤
│                    Database Layer                            │
│                  (Neon Postgres)                             │
└─────────────────────────────────────────────────────────────┘
```

### MCP Tools (Phase III)

Required MCP tools that map to backend API:

```
create_task       → POST   /api/v1/tasks
update_task       → PUT    /api/v1/tasks/{id}
list_tasks        → GET    /api/v1/tasks
get_task          → GET    /api/v1/tasks/{id}
mark_complete     → PATCH  /api/v1/tasks/{id}/complete
delete_task       → DELETE /api/v1/tasks/{id}
reschedule_task   → PUT    /api/v1/tasks/{id} (due_date only)
```

### Agent Behavior (Phase III)

Agent must:
1. Parse user intent from natural language
2. Extract entities (title, date, priority, tags)
3. Select appropriate MCP tool
4. Call tool with extracted parameters
5. Format tool result for user
6. Handle errors gracefully
7. Ask clarifying questions when needed

### ChatKit Integration (Phase III)

```
chatkit-ui/
├── app/
│   ├── page.tsx              - Chat interface page
│   ├── layout.tsx            - Root layout
│   └── components/
│       ├── ChatWindow.tsx    - Main chat component
│       ├── MessageList.tsx   - Message history
│       ├── MessageInput.tsx  - User input
│       └── ToolResult.tsx    - Tool execution display
└── lib/
    ├── agent-client.ts       - Agent SDK client
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
- API contracts MUST be honored by all layers
- MCP tools MUST be the exclusive agent-backend interface
- Agents MUST NOT modify state directly

### Version Control

This constitution supersedes Phase II for conversational AI features.

**Version**: 3.0.0 | **Ratified**: 2026-01-07 | **Last Amended**: 2026-01-07

**Changes from v2.0.0**:
- MAJOR: Addition of Conversational AI Interface layer
- Added: Agent-Tool Separation, MCP-First Integration, Natural Language Intent Parsing, Conversational State Management
- Extended: API-First Design (includes MCP layer), Type Safety (includes agent layer), Component Modularity (includes tools and agent)
- Tech Stack: Added OpenAI Agents SDK, OpenAI ChatKit, Official MCP SDK
- Architecture: Multi-layer system with agent runtime and MCP tools
