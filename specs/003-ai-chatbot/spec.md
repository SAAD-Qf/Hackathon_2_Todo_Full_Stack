# Feature Specification: AI Todo Chatbot with Natural Language Interface

**Feature Branch**: `003-ai-chatbot`
**Created**: 2026-01-07
**Status**: Draft
**Input**: Phase III - Conversational AI interface using OpenAI ChatKit, Agents SDK, and MCP SDK
**Constitution**: Phase III (v3.0.0)

## Executive Summary

Phase III adds a conversational AI interface to the Todo application, enabling users to manage tasks through natural language commands. The system integrates OpenAI ChatKit for the UI, OpenAI Agents SDK for the agent runtime, and the Official MCP SDK for tool execution. All operations flow through MCP tools that call the existing FastAPI backend from Phase II.

**Key Constraint**: The agent MUST NOT modify state directly. All operations MUST go through MCP tools → Backend API.

---

## Domain Model

### Task Entity (Inherited from Phase II)

No changes to the Task entity. The Phase II database schema remains unchanged:

| Field | Type | Constraints | Default | Description |
|-------|------|-------------|---------|-------------|
| `id` | Integer | Primary Key, Auto-increment | - | Unique task identifier |
| `title` | String(200) | Required, Non-empty | - | Task title |
| `description` | Text | Optional | Empty string | Detailed task description |
| `priority` | Enum | Required, One of: low/medium/high | medium | Task priority level |
| `tags` | Array[String] | Optional | Empty array | Categorization tags |
| `due_date` | DateTime | Optional, Nullable | null | Task deadline |
| `completed` | Boolean | Required | false | Completion status |
| `created_at` | DateTime | Required, Auto-set | NOW() | Creation timestamp |
| `updated_at` | DateTime | Required, Auto-update | NOW() | Last update timestamp |

**Validation Rules** (Inherited from Phase II):
- `title`: 1-200 characters, no leading/trailing whitespace
- `priority`: Must be exactly one of: "low", "medium", "high" (case-sensitive)
- `tags`: Each tag 1-50 characters, max 10 tags per task
- `due_date`: Must be in the future when creating new tasks (optional validation)
- `completed`: Boolean only (true/false)

---

## MCP Tools Specification

### Overview

MCP tools are the EXCLUSIVE interface between the AI agent and the backend API. Each tool:
- Validates input parameters using JSON Schema
- Calls the corresponding FastAPI endpoint
- Transforms API responses into agent-friendly formats
- Handles errors and returns structured error messages

### Tool 1: create_task

**Purpose**: Create a new task from natural language input

**Parameters**:
```json
{
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "description": "Task title (1-200 characters)",
      "minLength": 1,
      "maxLength": 200
    },
    "description": {
      "type": "string",
      "description": "Optional task description",
      "default": ""
    },
    "priority": {
      "type": "string",
      "enum": ["low", "medium", "high"],
      "description": "Task priority level",
      "default": "medium"
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string",
        "minLength": 1,
        "maxLength": 50
      },
      "description": "Optional categorization tags",
      "maxItems": 10,
      "default": []
    },
    "due_date": {
      "type": "string",
      "format": "date-time",
      "description": "Optional due date in ISO 8601 format",
      "nullable": true
    }
  },
  "required": ["title"]
}
```

**Returns**:
```json
{
  "success": true,
  "task": {
    "id": 1,
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "priority": "high",
    "tags": ["shopping", "urgent"],
    "due_date": "2026-01-10T18:00:00Z",
    "completed": false,
    "created_at": "2026-01-07T10:30:00Z",
    "updated_at": "2026-01-07T10:30:00Z"
  },
  "message": "Task created successfully"
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Validation error: title is required",
  "code": "VALIDATION_ERROR"
}
```

**Backend API Call**: `POST /api/v1/tasks`

---

### Tool 2: update_task

**Purpose**: Update an existing task's fields

**Parameters**:
```json
{
  "type": "object",
  "properties": {
    "task_id": {
      "type": "integer",
      "description": "ID of the task to update",
      "minimum": 1
    },
    "title": {
      "type": "string",
      "description": "New task title",
      "minLength": 1,
      "maxLength": 200
    },
    "description": {
      "type": "string",
      "description": "New task description"
    },
    "priority": {
      "type": "string",
      "enum": ["low", "medium", "high"],
      "description": "New priority level"
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string",
        "minLength": 1,
        "maxLength": 50
      },
      "description": "New tags",
      "maxItems": 10
    },
    "due_date": {
      "type": "string",
      "format": "date-time",
      "description": "New due date in ISO 8601 format",
      "nullable": true
    }
  },
  "required": ["task_id"]
}
```

**Returns**:
```json
{
  "success": true,
  "task": {
    "id": 1,
    "title": "Buy groceries (updated)",
    "description": "Milk, eggs, bread, cheese",
    "priority": "medium",
    "tags": ["shopping"],
    "due_date": "2026-01-11T18:00:00Z",
    "completed": false,
    "created_at": "2026-01-07T10:30:00Z",
    "updated_at": "2026-01-07T11:00:00Z"
  },
  "message": "Task updated successfully"
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Task not found with ID 999",
  "code": "NOT_FOUND"
}
```

**Backend API Call**: `PUT /api/v1/tasks/{task_id}`

---

### Tool 3: list_tasks

**Purpose**: List tasks with optional filters and search

**Parameters**:
```json
{
  "type": "object",
  "properties": {
    "search": {
      "type": "string",
      "description": "Search text in title and description"
    },
    "status": {
      "type": "string",
      "enum": ["all", "completed", "incomplete"],
      "description": "Filter by completion status",
      "default": "all"
    },
    "priority": {
      "type": "string",
      "enum": ["low", "medium", "high"],
      "description": "Filter by priority level"
    },
    "tag": {
      "type": "string",
      "description": "Filter by tag (exact match)"
    },
    "sort_by": {
      "type": "string",
      "enum": ["due_date", "priority", "title", "created_at"],
      "description": "Sort field",
      "default": "created_at"
    },
    "sort_order": {
      "type": "string",
      "enum": ["asc", "desc"],
      "description": "Sort direction",
      "default": "desc"
    },
    "limit": {
      "type": "integer",
      "description": "Maximum number of results",
      "minimum": 1,
      "maximum": 100,
      "default": 50
    }
  }
}
```

**Returns**:
```json
{
  "success": true,
  "tasks": [
    {
      "id": 1,
      "title": "Buy groceries",
      "description": "Milk, eggs, bread",
      "priority": "high",
      "tags": ["shopping", "urgent"],
      "due_date": "2026-01-10T18:00:00Z",
      "completed": false,
      "created_at": "2026-01-07T10:30:00Z",
      "updated_at": "2026-01-07T10:30:00Z"
    }
  ],
  "total": 1,
  "message": "Found 1 task(s)"
}
```

**Backend API Call**: `GET /api/v1/tasks?search=...&status=...&priority=...`

---

### Tool 4: mark_complete

**Purpose**: Toggle task completion status

**Parameters**:
```json
{
  "type": "object",
  "properties": {
    "task_id": {
      "type": "integer",
      "description": "ID of the task to mark complete/incomplete",
      "minimum": 1
    },
    "completed": {
      "type": "boolean",
      "description": "New completion status",
      "default": true
    }
  },
  "required": ["task_id"]
}
```

**Returns**:
```json
{
  "success": true,
  "task": {
    "id": 1,
    "title": "Buy groceries",
    "completed": true,
    "updated_at": "2026-01-07T12:00:00Z"
  },
  "message": "Task marked as complete"
}
```

**Backend API Call**: `PATCH /api/v1/tasks/{task_id}/complete`

---

### Tool 5: delete_task

**Purpose**: Delete a task by ID

**Parameters**:
```json
{
  "type": "object",
  "properties": {
    "task_id": {
      "type": "integer",
      "description": "ID of the task to delete",
      "minimum": 1
    }
  },
  "required": ["task_id"]
}
```

**Returns**:
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Task not found with ID 999",
  "code": "NOT_FOUND"
}
```

**Backend API Call**: `DELETE /api/v1/tasks/{task_id}`

---

### Tool 6: reschedule_task

**Purpose**: Update only the due date of a task (convenience wrapper)

**Parameters**:
```json
{
  "type": "object",
  "properties": {
    "task_id": {
      "type": "integer",
      "description": "ID of the task to reschedule",
      "minimum": 1
    },
    "due_date": {
      "type": "string",
      "format": "date-time",
      "description": "New due date in ISO 8601 format",
      "nullable": true
    }
  },
  "required": ["task_id", "due_date"]
}
```

**Returns**:
```json
{
  "success": true,
  "task": {
    "id": 1,
    "title": "Buy groceries",
    "due_date": "2026-01-12T14:00:00Z",
    "updated_at": "2026-01-07T13:00:00Z"
  },
  "message": "Task rescheduled successfully"
}
```

**Backend API Call**: `PUT /api/v1/tasks/{task_id}` (with only due_date field)

---

## Agent Behavior Specification

### Agent Role and Constraints

**Role**: Personal task management assistant

**Constraints**:
- MUST use MCP tools for ALL state modifications
- MUST NOT access backend API directly
- MUST NOT hardcode business logic
- MUST parse natural language into structured tool calls
- MUST confirm destructive actions (delete, bulk operations)
- MUST handle errors gracefully with user-friendly messages

### Supported Intents

#### 1. Create Task Intent

**User Examples**:
- "Add a task to call Ali tomorrow morning"
- "Create a task: Buy groceries with high priority"
- "Remind me to submit the report by Friday"
- "New task: Review PR #123, tag it as code-review"

**Entity Extraction**:
- **Title**: Main action phrase (required)
- **Due Date**: Temporal expressions (tomorrow, Friday, next week, Jan 10)
- **Priority**: Keywords (urgent, important, high, low)
- **Tags**: Explicit tags or inferred categories
- **Description**: Additional context

**Tool Call**: `create_task`

**Response Pattern**:
```
✅ Task created: "Call Ali"
📅 Due: Tomorrow at 9:00 AM
⚡ Priority: Medium
🏷️ Tags: None
```

---

#### 2. Update Task Intent

**User Examples**:
- "Change the priority of task 5 to high"
- "Update task 3's description to include meeting notes"
- "Rename task 2 to 'Buy groceries and cook dinner'"
- "Add tag 'urgent' to task 7"

**Entity Extraction**:
- **Task ID**: Numeric reference (task 5, #3, ID 7)
- **Field**: Which field to update (title, description, priority, tags)
- **Value**: New value for the field

**Tool Call**: `update_task`

**Response Pattern**:
```
✅ Task updated: "Buy groceries"
🔄 Changed: Priority → High
```

---

#### 3. List/Search Tasks Intent

**User Examples**:
- "Show me all my tasks"
- "List incomplete tasks"
- "Find tasks tagged with 'urgent'"
- "Show high priority tasks due this week"
- "Search for tasks about groceries"

**Entity Extraction**:
- **Search Query**: Keywords to search
- **Status Filter**: completed, incomplete, all
- **Priority Filter**: low, medium, high
- **Tag Filter**: Specific tag name
- **Sort**: due date, priority, title

**Tool Call**: `list_tasks`

**Response Pattern**:
```
📋 Found 3 tasks:

1. 🔴 Buy groceries (High)
   📅 Due: Tomorrow at 6:00 PM
   🏷️ shopping, urgent

2. 🟡 Call Ali (Medium)
   📅 Due: Tomorrow at 9:00 AM

3. 🟢 Review PR #123 (Low)
   📅 Due: Friday
   🏷️ code-review
```

---

#### 4. Mark Complete Intent

**User Examples**:
- "Mark task 5 as complete"
- "I finished task 3"
- "Complete the grocery shopping task"
- "Mark task 2 as incomplete" (undo)

**Entity Extraction**:
- **Task ID**: Numeric reference or title match
- **Status**: complete or incomplete

**Tool Call**: `mark_complete`

**Response Pattern**:
```
✅ Task completed: "Buy groceries"
🎉 Great job!
```

---

#### 5. Delete Task Intent

**User Examples**:
- "Delete task 5"
- "Remove the grocery task"
- "Cancel task 3"

**Entity Extraction**:
- **Task ID**: Numeric reference or title match

**Confirmation Required**: YES (destructive action)

**Tool Call**: `delete_task`

**Response Pattern**:
```
⚠️ Are you sure you want to delete "Buy groceries"? (yes/no)

[User confirms]

✅ Task deleted successfully
```

---

#### 6. Reschedule Task Intent

**User Examples**:
- "Move task 5 to tomorrow"
- "Reschedule the meeting to next Friday at 2 PM"
- "Change the due date of task 3 to January 15"
- "Push back task 7 by 2 days"

**Entity Extraction**:
- **Task ID**: Numeric reference or title match
- **New Due Date**: Temporal expression

**Tool Call**: `reschedule_task`

**Response Pattern**:
```
✅ Task rescheduled: "Team meeting"
📅 New due date: Friday, Jan 12 at 2:00 PM
```

---

#### 7. Bulk Operations Intent

**User Examples**:
- "Move all meetings to 2 PM"
- "Set all urgent tasks to high priority"
- "Mark all completed tasks from last week as archived"
- "Delete all completed tasks"

**Entity Extraction**:
- **Filter Criteria**: Which tasks to affect (all meetings, urgent tasks)
- **Action**: What to do (move, set priority, delete)
- **Parameters**: New values (2 PM, high priority)

**Confirmation Required**: YES (affects multiple tasks)

**Tool Calls**: Multiple calls to `list_tasks` + appropriate action tool

**Response Pattern**:
```
⚠️ This will affect 5 tasks:
1. Team standup
2. Client meeting
3. 1-on-1 with manager
4. Design review
5. Sprint planning

Proceed? (yes/no)

[User confirms]

✅ Updated 5 tasks successfully
📅 All meetings now scheduled for 2:00 PM
```

---

### Natural Language Date Parsing

The agent MUST parse temporal expressions into ISO 8601 format:

| User Input | Parsed Date |
|------------|-------------|
| "tomorrow" | Next day at 9:00 AM |
| "tomorrow morning" | Next day at 9:00 AM |
| "tomorrow afternoon" | Next day at 2:00 PM |
| "tomorrow evening" | Next day at 6:00 PM |
| "next Friday" | Next Friday at 9:00 AM |
| "Friday at 2 PM" | Next Friday at 2:00 PM |
| "Jan 15" | January 15 of current year at 9:00 AM |
| "January 15 at 3:30 PM" | January 15 at 3:30 PM |
| "in 3 days" | 3 days from now at 9:00 AM |
| "next week" | 7 days from now at 9:00 AM |

**Default Time**: If no time specified, default to 9:00 AM

---

### Error Handling

The agent MUST handle errors gracefully:

| Error Type | Agent Response |
|------------|----------------|
| Task not found | "I couldn't find task #5. Would you like to see all your tasks?" |
| Invalid priority | "Priority must be 'low', 'medium', or 'high'. Which would you like?" |
| Invalid date | "I couldn't understand that date. Could you try 'tomorrow', 'next Friday', or 'Jan 15'?" |
| API error | "Sorry, I'm having trouble connecting to the task service. Please try again in a moment." |
| Validation error | "The task title must be between 1 and 200 characters. Could you shorten it?" |

---

## ChatKit UI Specification

### Component Structure

```
chatkit-ui/
├── app/
│   ├── page.tsx              - Main chat interface
│   ├── layout.tsx            - Root layout with ChatKit provider
│   └── components/
│       ├── ChatWindow.tsx    - Main chat container
│       ├── MessageList.tsx   - Scrollable message history
│       ├── MessageItem.tsx   - Individual message (user/agent)
│       ├── MessageInput.tsx  - User input field with send button
│       ├── ToolResult.tsx    - Display tool execution results
│       └── TaskCard.tsx      - Rich task display in chat
└── lib/
    ├── agent-client.ts       - OpenAI Agents SDK client
    ├── types.ts              - TypeScript types
    └── utils.ts              - Date formatting, etc.
```

### Message Types

#### 1. User Message
```typescript
interface UserMessage {
  role: 'user';
  content: string;
  timestamp: Date;
}
```

**Display**: Right-aligned, blue background, user avatar

---

#### 2. Agent Message
```typescript
interface AgentMessage {
  role: 'assistant';
  content: string;
  timestamp: Date;
}
```

**Display**: Left-aligned, gray background, agent avatar

---

#### 3. Tool Execution Message
```typescript
interface ToolMessage {
  role: 'tool';
  tool_name: string;
  tool_input: Record<string, any>;
  tool_output: Record<string, any>;
  timestamp: Date;
}
```

**Display**: Collapsible card showing tool name, inputs, and outputs

---

### UI Features

1. **Message History**: Scrollable list of all messages
2. **Auto-scroll**: Scroll to bottom on new message
3. **Loading Indicator**: Show when agent is thinking or tool is executing
4. **Error Display**: Red banner for errors with retry button
5. **Rich Task Display**: Task cards with priority badges, tags, due dates
6. **Confirmation Dialogs**: Modal for destructive actions
7. **Typing Indicator**: Show when agent is composing response

---

## User Stories and Acceptance Criteria

### User Story 1: Create Task via Natural Language

**As a** user
**I want to** create tasks using natural language
**So that** I can quickly add tasks without filling forms

**Acceptance Criteria**:
- ✅ User can type "Add a task to call Ali tomorrow"
- ✅ Agent extracts title ("Call Ali") and due date (tomorrow 9 AM)
- ✅ Agent calls `create_task` MCP tool
- ✅ Agent confirms task creation with details
- ✅ Task appears in backend database
- ✅ Task is visible in web UI (Phase II)

**Priority**: P1 (Must Have)

---

### User Story 2: Update Task Details

**As a** user
**I want to** update task details conversationally
**So that** I can modify tasks without navigating forms

**Acceptance Criteria**:
- ✅ User can type "Change priority of task 5 to high"
- ✅ Agent identifies task ID and field to update
- ✅ Agent calls `update_task` MCP tool
- ✅ Agent confirms update with new values
- ✅ Changes persist in database
- ✅ Changes visible in web UI

**Priority**: P1 (Must Have)

---

### User Story 3: List and Search Tasks

**As a** user
**I want to** search and filter tasks conversationally
**So that** I can find tasks without using filter UI

**Acceptance Criteria**:
- ✅ User can type "Show me all urgent tasks"
- ✅ Agent calls `list_tasks` with appropriate filters
- ✅ Agent displays tasks in readable format
- ✅ Agent shows priority badges and due dates
- ✅ Agent handles empty results gracefully

**Priority**: P1 (Must Have)

---

### User Story 4: Mark Tasks Complete

**As a** user
**I want to** mark tasks complete conversationally
**So that** I can quickly update task status

**Acceptance Criteria**:
- ✅ User can type "Mark task 3 as complete"
- ✅ Agent calls `mark_complete` MCP tool
- ✅ Agent confirms completion
- ✅ Task status updates in database
- ✅ Completion visible in web UI

**Priority**: P1 (Must Have)

---

### User Story 5: Delete Tasks

**As a** user
**I want to** delete tasks conversationally
**So that** I can remove unwanted tasks

**Acceptance Criteria**:
- ✅ User can type "Delete task 5"
- ✅ Agent asks for confirmation (destructive action)
- ✅ User confirms deletion
- ✅ Agent calls `delete_task` MCP tool
- ✅ Task removed from database
- ✅ Deletion reflected in web UI

**Priority**: P1 (Must Have)

---

### User Story 6: Reschedule Tasks

**As a** user
**I want to** reschedule tasks conversationally
**So that** I can adjust due dates quickly

**Acceptance Criteria**:
- ✅ User can type "Move task 2 to next Friday"
- ✅ Agent parses "next Friday" into ISO date
- ✅ Agent calls `reschedule_task` MCP tool
- ✅ Agent confirms new due date
- ✅ Due date updates in database
- ✅ Change visible in web UI

**Priority**: P1 (Must Have)

---

### User Story 7: Bulk Operations

**As a** user
**I want to** perform bulk operations conversationally
**So that** I can update multiple tasks at once

**Acceptance Criteria**:
- ✅ User can type "Set all urgent tasks to high priority"
- ✅ Agent identifies affected tasks
- ✅ Agent asks for confirmation with task list
- ✅ User confirms bulk operation
- ✅ Agent calls appropriate tools for each task
- ✅ Agent reports success/failure for each task
- ✅ All changes persist in database

**Priority**: P2 (Should Have)

---

## Technical Integration

### Architecture Flow

```
User Input (ChatKit UI)
    ↓
Agent Runtime (OpenAI Agents SDK)
    ↓
Intent Parsing & Entity Extraction
    ↓
MCP Tool Selection
    ↓
MCP Tool Execution (Official MCP SDK)
    ↓
Backend API Call (FastAPI)
    ↓
Database Operation (Neon Postgres)
    ↓
API Response
    ↓
MCP Tool Response
    ↓
Agent Response Formatting
    ↓
ChatKit UI Display
```

### Environment Variables

**ChatKit UI**:
```env
NEXT_PUBLIC_AGENT_API_URL=http://localhost:3001
```

**Agent Runtime**:
```env
OPENAI_API_KEY=sk-...
MCP_SERVER_URL=http://localhost:3002
BACKEND_API_URL=http://localhost:8000
```

**MCP Server**:
```env
BACKEND_API_URL=http://localhost:8000/api/v1
```

---

## Success Criteria

### Functional Requirements

- ✅ FR-001: User can create tasks via natural language
- ✅ FR-002: User can update task fields via natural language
- ✅ FR-003: User can list/search tasks via natural language
- ✅ FR-004: User can mark tasks complete via natural language
- ✅ FR-005: User can delete tasks via natural language
- ✅ FR-006: User can reschedule tasks via natural language
- ✅ FR-007: Agent parses temporal expressions correctly
- ✅ FR-008: Agent confirms destructive actions
- ✅ FR-009: Agent handles errors gracefully
- ✅ FR-010: All operations go through MCP tools (no direct API access)

### Non-Functional Requirements

- ✅ NFR-001: Agent response time < 3 seconds (p95)
- ✅ NFR-002: MCP tool execution time < 1 second (p95)
- ✅ NFR-003: All tool parameters validated with JSON Schema
- ✅ NFR-004: All agent responses are user-friendly
- ✅ NFR-005: ChatKit UI is responsive and accessible
- ✅ NFR-006: System maintains Phase II web UI functionality
- ✅ NFR-007: No breaking changes to Phase II backend API

---

## Out of Scope (Phase IV+)

- ❌ Voice input/output
- ❌ Multi-user conversations
- ❌ Task sharing and collaboration
- ❌ Advanced NLP (sentiment analysis, context tracking)
- ❌ Integration with external calendars
- ❌ Mobile app
- ❌ Offline support
- ❌ Custom agent training

---

## Dependencies

### External Services
- OpenAI API (GPT-4 or compatible model)
- Neon Postgres (Phase II database)

### NPM Packages
- `@openai/agents-sdk` - Agent runtime
- `@modelcontextprotocol/sdk` - MCP tools
- `@openai/chatkit` - Chat UI components
- `next` - React framework
- `typescript` - Type safety

### Python Packages (Phase II - No Changes)
- `fastapi` - Backend API
- `sqlmodel` - ORM
- `pydantic` - Validation

---

## Risk Analysis

### Risk 1: Natural Language Ambiguity
**Impact**: High
**Probability**: High
**Mitigation**: Agent asks clarifying questions; user can reference tasks by ID

### Risk 2: Date Parsing Errors
**Impact**: Medium
**Probability**: Medium
**Mitigation**: Use robust date parsing library; show parsed date for confirmation

### Risk 3: MCP Tool Failures
**Impact**: High
**Probability**: Low
**Mitigation**: Comprehensive error handling; retry logic; fallback messages

### Risk 4: Agent Hallucinations
**Impact**: Medium
**Probability**: Medium
**Mitigation**: Strict tool schemas; validation at MCP layer; no direct state access

### Risk 5: OpenAI API Rate Limits
**Impact**: Medium
**Probability**: Low
**Mitigation**: Implement rate limiting; queue requests; show user-friendly errors

---

## Testing Strategy

### Unit Tests
- MCP tool parameter validation
- MCP tool API call logic
- Date parsing functions
- Error handling

### Integration Tests
- Agent → MCP tool → API flow
- ChatKit UI → Agent communication
- End-to-end conversation flows

### Acceptance Tests
- All user stories with acceptance criteria
- Error scenarios
- Bulk operations
- Confirmation dialogs

---

## Deployment Strategy

### Phase 1: MCP Server
1. Deploy MCP server with all 6 tools
2. Test each tool independently
3. Verify API connectivity

### Phase 2: Agent Runtime
1. Deploy agent with OpenAI Agents SDK
2. Configure MCP server connection
3. Test intent parsing and tool selection

### Phase 3: ChatKit UI
1. Deploy ChatKit frontend
2. Connect to agent runtime
3. Test end-to-end conversations

### Phase 4: Integration Testing
1. Test all user stories
2. Verify Phase II web UI still works
3. Load testing and performance optimization

---

**Version**: 3.0.0
**Last Updated**: 2026-01-07
**Status**: Ready for Planning Phase
