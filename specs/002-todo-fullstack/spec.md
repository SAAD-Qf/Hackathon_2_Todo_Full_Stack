# Feature Specification: Todo Full-Stack Web Application

**Feature Branch**: `002-todo-fullstack`
**Created**: 2026-01-06
**Status**: Draft
**Input**: Phase II - Full-stack web application with Next.js + FastAPI + Neon Postgres

## Domain Model

### Task Entity

The core entity of the application with the following fields:

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

**Validation Rules**:
- `title`: 1-200 characters, no leading/trailing whitespace
- `priority`: Must be exactly one of: "low", "medium", "high" (case-sensitive)
- `tags`: Each tag 1-50 characters, max 10 tags per task
- `due_date`: Must be in the future when creating new tasks (optional validation)
- `completed`: Boolean only (true/false)

**Relationships**: None (single entity for Phase II)

---

## API Specification

### Base URL
- Development: `http://localhost:8000/api/v1`
- Production: `https://your-domain.com/api/v1`

### Endpoints

#### 1. Create Task
**POST** `/tasks`

**Request Body**:
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread, cheese",
  "priority": "high",
  "tags": ["shopping", "urgent"],
  "due_date": "2026-01-10T18:00:00Z"
}
```

**Response** (201 Created):
```json
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread, cheese",
  "priority": "high",
  "tags": ["shopping", "urgent"],
  "due_date": "2026-01-10T18:00:00Z",
  "completed": false,
  "created_at": "2026-01-06T10:30:00Z",
  "updated_at": "2026-01-06T10:30:00Z"
}
```

**Error Responses**:
- 400 Bad Request: Invalid data (missing title, invalid priority, etc.)
- 422 Unprocessable Entity: Validation errors

---

#### 2. List Tasks (with filters, search, sort)
**GET** `/tasks`

**Query Parameters**:
- `search` (string, optional): Search in title and description
- `status` (string, optional): Filter by completion status ("completed", "incomplete", "all")
- `priority` (string, optional): Filter by priority ("low", "medium", "high")
- `tag` (string, optional): Filter by tag (exact match)
- `sort_by` (string, optional): Sort field ("due_date", "priority", "title", "created_at")
- `sort_order` (string, optional): Sort direction ("asc", "desc")
- `limit` (integer, optional): Number of results (default: 50, max: 100)
- `offset` (integer, optional): Pagination offset (default: 0)

**Example Request**:
```
GET /tasks?search=grocery&status=incomplete&priority=high&sort_by=due_date&sort_order=asc
```

**Response** (200 OK):
```json
{
  "tasks": [
    {
      "id": 1,
      "title": "Buy groceries",
      "description": "Milk, eggs, bread, cheese",
      "priority": "high",
      "tags": ["shopping", "urgent"],
      "due_date": "2026-01-10T18:00:00Z",
      "completed": false,
      "created_at": "2026-01-06T10:30:00Z",
      "updated_at": "2026-01-06T10:30:00Z"
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

---

#### 3. Get Task by ID
**GET** `/tasks/{id}`

**Response** (200 OK):
```json
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread, cheese",
  "priority": "high",
  "tags": ["shopping", "urgent"],
  "due_date": "2026-01-10T18:00:00Z",
  "completed": false,
  "created_at": "2026-01-06T10:30:00Z",
  "updated_at": "2026-01-06T10:30:00Z"
}
```

**Error Responses**:
- 404 Not Found: Task does not exist

---

#### 4. Update Task
**PUT** `/tasks/{id}`

**Request Body** (all fields optional except at least one must be provided):
```json
{
  "title": "Buy groceries and supplies",
  "description": "Milk, eggs, bread, cheese, cleaning supplies",
  "priority": "medium",
  "tags": ["shopping", "home"],
  "due_date": "2026-01-11T18:00:00Z"
}
```

**Response** (200 OK):
```json
{
  "id": 1,
  "title": "Buy groceries and supplies",
  "description": "Milk, eggs, bread, cheese, cleaning supplies",
  "priority": "medium",
  "tags": ["shopping", "home"],
  "due_date": "2026-01-11T18:00:00Z",
  "completed": false,
  "created_at": "2026-01-06T10:30:00Z",
  "updated_at": "2026-01-06T11:45:00Z"
}
```

**Error Responses**:
- 404 Not Found: Task does not exist
- 400 Bad Request: Invalid data
- 422 Unprocessable Entity: Validation errors

---

#### 5. Delete Task
**DELETE** `/tasks/{id}`

**Response** (204 No Content): Empty body

**Error Responses**:
- 404 Not Found: Task does not exist

---

#### 6. Toggle Task Completion
**PATCH** `/tasks/{id}/complete`

**Request Body**:
```json
{
  "completed": true
}
```

**Response** (200 OK):
```json
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread, cheese",
  "priority": "high",
  "tags": ["shopping", "urgent"],
  "due_date": "2026-01-10T18:00:00Z",
  "completed": true,
  "created_at": "2026-01-06T10:30:00Z",
  "updated_at": "2026-01-06T12:00:00Z"
}
```

**Error Responses**:
- 404 Not Found: Task does not exist

---

## User Stories & Testing

### User Story 1 - Create and View Tasks with Enhanced Fields (Priority: P1) 🎯 MVP

Users need to create tasks with priority, tags, and due dates, then view them in a list.

**Why this priority**: Core functionality - without the ability to create and view enhanced tasks, the application has no value over Phase I.

**Independent Test**: Can be fully tested by creating tasks with various priorities, tags, and due dates, then viewing the list. Delivers immediate value as an enhanced task tracker.

**Acceptance Scenarios**:

1. **Given** an empty task list, **When** user creates a task with title "Buy groceries", priority "high", tags ["shopping"], and due_date "2026-01-10", **Then** task is created with ID, completed=false, and timestamps
2. **Given** existing tasks, **When** user views the task list, **Then** all tasks are displayed with title, priority badge, tags, due date, and completion status
3. **Given** user attempts to create a task, **When** title is empty, **Then** API returns 400 error with message "Title is required"
4. **Given** user attempts to create a task, **When** priority is invalid (e.g., "urgent"), **Then** API returns 422 error with message "Priority must be low, medium, or high"

---

### User Story 2 - Search Tasks (Priority: P1) 🎯 MVP

Users need to search for tasks by text in title or description to quickly find specific tasks.

**Why this priority**: Essential for usability - as task list grows, users need to find tasks quickly.

**Independent Test**: Can be tested by creating multiple tasks and searching for keywords. Works independently of other features.

**Acceptance Scenarios**:

1. **Given** tasks with titles "Buy groceries", "Write report", "Call dentist", **When** user searches for "report", **Then** only "Write report" task is displayed
2. **Given** tasks with descriptions containing "meeting", **When** user searches for "meeting", **Then** all tasks with "meeting" in title or description are displayed
3. **Given** user searches for "xyz123", **When** no tasks match, **Then** empty list is displayed with message "No tasks found"
4. **Given** user searches with empty string, **When** search is submitted, **Then** all tasks are displayed (no filter applied)

---

### User Story 3 - Filter Tasks by Status, Priority, and Tags (Priority: P2)

Users need to filter tasks by completion status, priority level, and tags to focus on specific subsets.

**Why this priority**: Important for task management - users need to see only relevant tasks.

**Independent Test**: Can be tested by creating tasks with different statuses, priorities, and tags, then applying filters.

**Acceptance Scenarios**:

1. **Given** tasks with mixed completion status, **When** user filters by "completed", **Then** only completed tasks are displayed
2. **Given** tasks with priorities "low", "medium", "high", **When** user filters by "high", **Then** only high-priority tasks are displayed
3. **Given** tasks with tags ["work", "personal", "urgent"], **When** user filters by tag "work", **Then** only tasks with "work" tag are displayed
4. **Given** user applies multiple filters (status=incomplete, priority=high), **When** filters are active, **Then** only tasks matching ALL filters are displayed

---

### User Story 4 - Sort Tasks (Priority: P2)

Users need to sort tasks by due date, priority, or title to organize their view.

**Why this priority**: Important for prioritization - users need to see tasks in meaningful order.

**Independent Test**: Can be tested by creating tasks with different due dates, priorities, and titles, then applying sort.

**Acceptance Scenarios**:

1. **Given** tasks with due dates, **When** user sorts by "due_date" ascending, **Then** tasks are ordered from earliest to latest due date
2. **Given** tasks with priorities, **When** user sorts by "priority" descending, **Then** tasks are ordered high → medium → low
3. **Given** tasks with titles, **When** user sorts by "title" ascending, **Then** tasks are ordered alphabetically A→Z
4. **Given** tasks with null due dates, **When** user sorts by "due_date", **Then** tasks with null due dates appear last

---

### User Story 5 - Update and Delete Tasks (Priority: P3)

Users need to edit task details and remove tasks that are no longer relevant.

**Why this priority**: Nice-to-have for Phase II - users can work around by creating new tasks.

**Independent Test**: Can be tested by creating a task, updating its fields, and deleting it.

**Acceptance Scenarios**:

1. **Given** an existing task, **When** user updates the title, **Then** task title changes and updated_at timestamp is refreshed
2. **Given** an existing task, **When** user updates priority from "low" to "high", **Then** priority changes and task is re-sorted if sort is active
3. **Given** an existing task, **When** user adds/removes tags, **Then** tags are updated and task appears/disappears from tag filters
4. **Given** an existing task, **When** user deletes the task, **Then** task is removed from database and no longer appears in any view

---

### User Story 6 - Mark Tasks Complete/Incomplete (Priority: P1) 🎯 MVP

Users need to toggle task completion status to track progress.

**Why this priority**: Essential for task management - core feature from Phase I.

**Independent Test**: Can be tested by creating tasks and toggling their completion status.

**Acceptance Scenarios**:

1. **Given** a task with completed=false, **When** user marks task as complete, **Then** task status changes to completed=true and updated_at is refreshed
2. **Given** a task with completed=true, **When** user marks task as incomplete, **Then** task status changes to completed=false
3. **Given** user filters by "completed", **When** user marks a task as complete, **Then** task appears in completed filter view
4. **Given** user marks task as complete, **When** task has due_date in the past, **Then** task is marked complete without validation error

---

### Edge Cases

- What happens when user creates task with due_date in the past?
  - System accepts it (no validation) - user may want to track overdue tasks

- What happens when user searches with special characters (e.g., quotes, slashes)?
  - System escapes special characters and performs safe text search

- What happens when user applies conflicting filters (e.g., completed=true and status=incomplete)?
  - System applies all filters with AND logic (result: empty list)

- What happens when database connection fails?
  - API returns 503 Service Unavailable with message "Database temporarily unavailable"

- What happens when user creates task with 100+ tags?
  - API returns 422 error with message "Maximum 10 tags allowed"

- What happens when user sorts by due_date and some tasks have null due_date?
  - Tasks with null due_date appear last in ascending order, first in descending order

- What happens when user requests offset beyond total results?
  - API returns empty tasks array with correct total count

---

## Requirements

### Functional Requirements

**Task Management**:
- **FR-001**: System MUST allow users to create tasks with title, description, priority, tags, and due_date
- **FR-002**: System MUST assign unique auto-incrementing IDs to tasks
- **FR-003**: System MUST initialize new tasks with completed=false, created_at=NOW(), updated_at=NOW()
- **FR-004**: System MUST allow users to view all tasks in a paginated list
- **FR-005**: System MUST allow users to update any task field (title, description, priority, tags, due_date)
- **FR-006**: System MUST allow users to delete tasks by ID
- **FR-007**: System MUST allow users to toggle task completion status

**Search & Filter**:
- **FR-008**: System MUST allow users to search tasks by text in title or description (case-insensitive)
- **FR-009**: System MUST allow users to filter tasks by completion status (completed/incomplete/all)
- **FR-010**: System MUST allow users to filter tasks by priority (low/medium/high)
- **FR-011**: System MUST allow users to filter tasks by tag (exact match)
- **FR-012**: System MUST support multiple simultaneous filters with AND logic

**Sorting**:
- **FR-013**: System MUST allow users to sort tasks by due_date (ascending/descending)
- **FR-014**: System MUST allow users to sort tasks by priority (high→medium→low or reverse)
- **FR-015**: System MUST allow users to sort tasks by title (alphabetically A→Z or Z→A)
- **FR-016**: System MUST allow users to sort tasks by created_at (newest/oldest first)

**Validation**:
- **FR-017**: System MUST validate that task titles are 1-200 characters
- **FR-018**: System MUST validate that priority is one of: low, medium, high
- **FR-019**: System MUST validate that tags array contains max 10 tags, each 1-50 characters
- **FR-020**: System MUST return appropriate HTTP status codes (200, 201, 400, 404, 422, 500, 503)

**API Contract**:
- **FR-021**: System MUST expose REST API at /api/v1/tasks
- **FR-022**: System MUST return JSON responses with proper content-type headers
- **FR-023**: System MUST support CORS for frontend origin
- **FR-024**: System MUST provide OpenAPI documentation at /docs

---

## Frontend Specification

### Pages

#### Home Page (`/`)
- **Purpose**: Main task management interface
- **Components**: TaskList, TaskForm, SearchBar, FilterBar, SortControls
- **Layout**: Single-page application with sidebar for filters

### Components

#### TaskList
- **Props**: `tasks: Task[]`, `onToggleComplete: (id: number) => void`, `onDelete: (id: number) => void`, `onEdit: (id: number) => void`
- **State**: None (controlled by parent)
- **Renders**: List of TaskItem components

#### TaskItem
- **Props**: `task: Task`, `onToggleComplete: () => void`, `onDelete: () => void`, `onEdit: () => void`
- **State**: None
- **Renders**: Single task card with title, description, priority badge, tags, due date, completion checkbox, edit/delete buttons

#### TaskForm
- **Props**: `task?: Task`, `onSubmit: (task: TaskInput) => void`, `onCancel: () => void`
- **State**: Form fields (title, description, priority, tags, due_date)
- **Renders**: Form with inputs for all task fields, submit/cancel buttons

#### SearchBar
- **Props**: `onSearch: (query: string) => void`
- **State**: Search query
- **Renders**: Text input with search icon, debounced search

#### FilterBar
- **Props**: `onFilterChange: (filters: Filters) => void`
- **State**: Active filters (status, priority, tag)
- **Renders**: Dropdown/buttons for status, priority, tag filters

#### SortControls
- **Props**: `onSortChange: (sortBy: string, sortOrder: string) => void`
- **State**: Current sort field and order
- **Renders**: Dropdown for sort field, toggle for sort order

### API Client (`lib/api.ts`)

TypeScript interface for all API calls:
```typescript
interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  due_date: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

interface TaskInput {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  due_date?: string | null;
}

interface TaskFilters {
  search?: string;
  status?: 'completed' | 'incomplete' | 'all';
  priority?: 'low' | 'medium' | 'high';
  tag?: string;
  sort_by?: 'due_date' | 'priority' | 'title' | 'created_at';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

interface TaskListResponse {
  tasks: Task[];
  total: number;
  limit: number;
  offset: number;
}

// API functions
async function createTask(task: TaskInput): Promise<Task>
async function getTasks(filters?: TaskFilters): Promise<TaskListResponse>
async function getTask(id: number): Promise<Task>
async function updateTask(id: number, task: Partial<TaskInput>): Promise<Task>
async function deleteTask(id: number): Promise<void>
async function toggleComplete(id: number, completed: boolean): Promise<Task>
```

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can create a task with all fields and see it in the list within 5 seconds
- **SC-002**: Search returns results within 500ms for databases with 1000+ tasks
- **SC-003**: Filters and sorts apply instantly without page reload
- **SC-004**: All CRUD operations work without errors (100% success rate in testing)
- **SC-005**: API returns proper error messages for all validation failures
- **SC-006**: Frontend displays loading states during API calls
- **SC-007**: Frontend displays error messages for failed API calls
- **SC-008**: Database schema matches domain model specification exactly
- **SC-009**: API documentation is auto-generated and accessible at /docs
- **SC-010**: Frontend and backend can be deployed independently

---

## Technical Constraints (from Constitution)

- **Frontend**: Next.js 14+ App Router, TypeScript strict mode, Tailwind CSS
- **Backend**: FastAPI, SQLModel, Python 3.11+, Pydantic v2
- **Database**: Neon Postgres (serverless)
- **API**: REST JSON, /api/v1/ prefix, CORS enabled
- **Type Safety**: Enforced at all layers
- **No Direct DB Access**: Frontend uses API only
- **No Business Logic in Frontend**: All logic in backend
