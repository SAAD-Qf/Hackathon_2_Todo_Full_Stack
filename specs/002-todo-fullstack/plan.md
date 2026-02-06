# Implementation Plan: Todo Full-Stack Web Application

**Branch**: `002-todo-fullstack` | **Date**: 2026-01-06 | **Spec**: [spec.md](./spec.md)

## Summary

Implement a full-stack web application for task management using Next.js (frontend), FastAPI (backend), and Neon Postgres (database). The application provides enhanced task management with priorities, tags, due dates, search, filtering, and sorting capabilities. Implementation strictly follows Spec-Driven Development with API-First Design and type safety throughout the stack.

## Technical Context

**Frontend**:
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript 5+ (strict mode)
- **Styling**: Tailwind CSS 3+
- **HTTP Client**: Native fetch API with typed wrapper
- **State Management**: React hooks + Context API (minimal)
- **Build Tool**: Next.js built-in (Turbopack)

**Backend**:
- **Framework**: FastAPI 0.109+
- **Language**: Python 3.11+
- **ORM**: SQLModel 0.0.14+
- **Database Driver**: asyncpg (async Postgres)
- **Validation**: Pydantic v2
- **ASGI Server**: Uvicorn

**Database**:
- **Provider**: Neon (serverless Postgres)
- **Version**: PostgreSQL 16
- **Migrations**: Alembic (auto-generated from SQLModel)
- **Connection**: Async connection pool

**Development Tools**:
- **API Testing**: FastAPI /docs (Swagger UI)
- **Type Checking**: mypy (backend), tsc (frontend)
- **Linting**: ruff (backend), eslint (frontend)
- **Formatting**: black (backend), prettier (frontend)

**Deployment**:
- **Frontend**: Vercel (recommended) or any Node.js host
- **Backend**: Railway, Render, or any Python ASGI host
- **Database**: Neon (managed Postgres)

## Constitution Check

*GATE: Must pass before implementation.*

✅ **Spec-First Development**: Complete specification exists with domain model, API contracts, and frontend components
✅ **API-First Design**: All endpoints documented with request/response schemas before implementation
✅ **Database Schema from Spec**: SQLModel classes will generate schema from domain model
✅ **Type Safety Throughout Stack**: TypeScript (frontend) + Python type hints (backend) + Pydantic validation
✅ **Frontend-Backend Separation**: Clear API boundary, no direct database access from frontend
✅ **Component Modularity**: Frontend components follow single responsibility
✅ **Iterative Refinement**: Spec is complete and approved for implementation

**Result**: All constitution principles satisfied. Proceed to implementation.

## Project Structure

### Repository Layout

```
todo-fullstack/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py            # FastAPI app entry point
│   │   ├── models.py          # SQLModel models
│   │   ├── schemas.py         # Pydantic schemas
│   │   ├── database.py        # Database connection
│   │   ├── crud.py            # CRUD operations
│   │   └── routers/
│   │       └── tasks.py       # Task endpoints
│   ├── alembic/               # Database migrations
│   │   ├── versions/
│   │   └── env.py
│   ├── alembic.ini
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/                   # Next.js frontend
│   ├── app/
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   ├── globals.css        # Global styles
│   │   └── components/
│   │       ├── TaskList.tsx
│   │       ├── TaskItem.tsx
│   │       ├── TaskForm.tsx
│   │       ├── SearchBar.tsx
│   │       ├── FilterBar.tsx
│   │       └── SortControls.tsx
│   ├── lib/
│   │   ├── api.ts             # API client
│   │   └── types.ts           # TypeScript types
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── next.config.js
│   └── .env.local.example
│
├── specs/                      # Specifications
│   └── 002-todo-fullstack/
│       ├── spec.md
│       └── plan.md            # This file
│
└── README.md
```

## Backend Implementation Design

### 1. Database Model (SQLModel)

**File**: `backend/app/models.py`

```python
from sqlmodel import SQLModel, Field, Column
from sqlalchemy import ARRAY, String
from datetime import datetime
from typing import Optional, List
from enum import Enum

class PriorityEnum(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"

class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=200, nullable=False)
    description: str = Field(default="")
    priority: PriorityEnum = Field(default=PriorityEnum.medium)
    tags: List[str] = Field(default=[], sa_column=Column(ARRAY(String)))
    due_date: Optional[datetime] = Field(default=None, nullable=True)
    completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

### 2. Pydantic Schemas

**File**: `backend/app/schemas.py`

```python
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional, List
from enum import Enum

class PriorityEnum(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"

class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = ""
    priority: PriorityEnum = PriorityEnum.medium
    tags: List[str] = Field(default=[])
    due_date: Optional[datetime] = None

    @field_validator('tags')
    def validate_tags(cls, v):
        if len(v) > 10:
            raise ValueError('Maximum 10 tags allowed')
        for tag in v:
            if len(tag) < 1 or len(tag) > 50:
                raise ValueError('Each tag must be 1-50 characters')
        return v

class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    priority: Optional[PriorityEnum] = None
    tags: Optional[List[str]] = None
    due_date: Optional[datetime] = None

    @field_validator('tags')
    def validate_tags(cls, v):
        if v is not None:
            if len(v) > 10:
                raise ValueError('Maximum 10 tags allowed')
            for tag in v:
                if len(tag) < 1 or len(tag) > 50:
                    raise ValueError('Each tag must be 1-50 characters')
        return v

class TaskComplete(BaseModel):
    completed: bool

class TaskResponse(BaseModel):
    id: int
    title: str
    description: str
    priority: PriorityEnum
    tags: List[str]
    due_date: Optional[datetime]
    completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TaskListResponse(BaseModel):
    tasks: List[TaskResponse]
    total: int
    limit: int
    offset: int
```

### 3. Database Connection

**File**: `backend/app/database.py`

```python
from sqlmodel import create_engine, Session, SQLModel
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = os.getenv("DATABASE_URL")

# Async engine for Neon Postgres
engine = create_async_engine(DATABASE_URL, echo=True, future=True)

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

async def get_session() -> AsyncSession:
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    async with async_session() as session:
        yield session
```

### 4. CRUD Operations

**File**: `backend/app/crud.py`

```python
from sqlmodel import select, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from datetime import datetime
from app.models import Task, PriorityEnum
from app.schemas import TaskCreate, TaskUpdate

async def create_task(session: AsyncSession, task_data: TaskCreate) -> Task:
    task = Task(**task_data.model_dump())
    session.add(task)
    await session.commit()
    await session.refresh(task)
    return task

async def get_tasks(
    session: AsyncSession,
    search: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[PriorityEnum] = None,
    tag: Optional[str] = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
    limit: int = 50,
    offset: int = 0
) -> tuple[List[Task], int]:
    # Build query with filters
    query = select(Task)

    # Search filter
    if search:
        query = query.where(
            or_(
                Task.title.ilike(f"%{search}%"),
                Task.description.ilike(f"%{search}%")
            )
        )

    # Status filter
    if status == "completed":
        query = query.where(Task.completed == True)
    elif status == "incomplete":
        query = query.where(Task.completed == False)

    # Priority filter
    if priority:
        query = query.where(Task.priority == priority)

    # Tag filter
    if tag:
        query = query.where(Task.tags.contains([tag]))

    # Count total before pagination
    count_query = select(func.count()).select_from(query.subquery())
    total = await session.scalar(count_query)

    # Sorting
    sort_column = getattr(Task, sort_by, Task.created_at)
    if sort_order == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    # Pagination
    query = query.offset(offset).limit(limit)

    result = await session.execute(query)
    tasks = result.scalars().all()

    return tasks, total

async def get_task(session: AsyncSession, task_id: int) -> Optional[Task]:
    result = await session.execute(select(Task).where(Task.id == task_id))
    return result.scalar_one_or_none()

async def update_task(
    session: AsyncSession, task_id: int, task_data: TaskUpdate
) -> Optional[Task]:
    task = await get_task(session, task_id)
    if not task:
        return None

    update_data = task_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(task, key, value)

    task.updated_at = datetime.utcnow()
    await session.commit()
    await session.refresh(task)
    return task

async def delete_task(session: AsyncSession, task_id: int) -> bool:
    task = await get_task(session, task_id)
    if not task:
        return False

    await session.delete(task)
    await session.commit()
    return True

async def toggle_complete(
    session: AsyncSession, task_id: int, completed: bool
) -> Optional[Task]:
    task = await get_task(session, task_id)
    if not task:
        return None

    task.completed = completed
    task.updated_at = datetime.utcnow()
    await session.commit()
    await session.refresh(task)
    return task
```

### 5. API Routes

**File**: `backend/app/routers/tasks.py`

```python
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.database import get_session
from app.schemas import (
    TaskCreate, TaskUpdate, TaskComplete, TaskResponse, TaskListResponse
)
from app.models import PriorityEnum
from app import crud

router = APIRouter(prefix="/api/v1/tasks", tags=["tasks"])

@router.post("", response_model=TaskResponse, status_code=201)
async def create_task(
    task: TaskCreate,
    session: AsyncSession = Depends(get_session)
):
    return await crud.create_task(session, task)

@router.get("", response_model=TaskListResponse)
async def list_tasks(
    search: Optional[str] = None,
    status: Optional[str] = Query(None, regex="^(completed|incomplete|all)$"),
    priority: Optional[PriorityEnum] = None,
    tag: Optional[str] = None,
    sort_by: str = Query("created_at", regex="^(due_date|priority|title|created_at)$"),
    sort_order: str = Query("desc", regex="^(asc|desc)$"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    session: AsyncSession = Depends(get_session)
):
    tasks, total = await crud.get_tasks(
        session, search, status, priority, tag, sort_by, sort_order, limit, offset
    )
    return TaskListResponse(tasks=tasks, total=total, limit=limit, offset=offset)

@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int,
    session: AsyncSession = Depends(get_session)
):
    task = await crud.get_task(session, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_data: TaskUpdate,
    session: AsyncSession = Depends(get_session)
):
    task = await crud.update_task(session, task_id, task_data)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.delete("/{task_id}", status_code=204)
async def delete_task(
    task_id: int,
    session: AsyncSession = Depends(get_session)
):
    success = await crud.delete_task(session, task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Task not found")

@router.patch("/{task_id}/complete", response_model=TaskResponse)
async def toggle_complete(
    task_id: int,
    data: TaskComplete,
    session: AsyncSession = Depends(get_session)
):
    task = await crud.toggle_complete(session, task_id, data.completed)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task
```

### 6. Main Application

**File**: `backend/app/main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import tasks
from app.database import init_db

app = FastAPI(
    title="Todo API",
    description="Full-stack todo application API",
    version="2.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(tasks.router)

@app.on_event("startup")
async def on_startup():
    await init_db()

@app.get("/")
async def root():
    return {"message": "Todo API v2.0.0"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
```

## Frontend Implementation Design

### 1. TypeScript Types

**File**: `frontend/lib/types.ts`

```typescript
export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: number;
  title: string;
  description: string;
  priority: Priority;
  tags: string[];
  due_date: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaskInput {
  title: string;
  description?: string;
  priority?: Priority;
  tags?: string[];
  due_date?: string | null;
}

export interface TaskFilters {
  search?: string;
  status?: 'completed' | 'incomplete' | 'all';
  priority?: Priority;
  tag?: string;
  sort_by?: 'due_date' | 'priority' | 'title' | 'created_at';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface TaskListResponse {
  tasks: Task[];
  total: number;
  limit: number;
  offset: number;
}
```

### 2. API Client

**File**: `frontend/lib/api.ts`

```typescript
import { Task, TaskInput, TaskFilters, TaskListResponse } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json();
}

export async function createTask(task: TaskInput): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  });
  return handleResponse<Task>(response);
}

export async function getTasks(filters?: TaskFilters): Promise<TaskListResponse> {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
  }
  const response = await fetch(`${API_BASE_URL}/tasks?${params}`);
  return handleResponse<TaskListResponse>(response);
}

export async function getTask(id: number): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`);
  return handleResponse<Task>(response);
}

export async function updateTask(id: number, task: Partial<TaskInput>): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  });
  return handleResponse<Task>(response);
}

export async function deleteTask(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
  });
  return handleResponse<void>(response);
}

export async function toggleComplete(id: number, completed: boolean): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}/complete`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed }),
  });
  return handleResponse<Task>(response);
}
```

### 3. Component Structure

Components will be implemented following the specification in spec.md:
- TaskList: Container for task items
- TaskItem: Individual task card with actions
- TaskForm: Create/edit task form
- SearchBar: Search input with debouncing
- FilterBar: Status, priority, tag filters
- SortControls: Sort field and order selection

### 4. Home Page

**File**: `frontend/app/page.tsx`

Main page that orchestrates all components and manages application state.

## Database Migrations

**Tool**: Alembic (auto-generated from SQLModel)

**Setup**:
1. Initialize Alembic: `alembic init alembic`
2. Configure `alembic.ini` with Neon database URL
3. Generate initial migration: `alembic revision --autogenerate -m "Initial schema"`
4. Apply migration: `alembic upgrade head`

**Migration Strategy**:
- All schema changes go through spec updates first
- Migrations auto-generated from SQLModel changes
- Never edit migrations manually unless absolutely necessary
- Always test migrations on development database first

## Implementation Order

### Phase 1: Backend Foundation (Priority: P1)
1. Setup FastAPI project structure
2. Implement SQLModel Task model
3. Implement Pydantic schemas
4. Setup database connection (Neon)
5. Implement CRUD operations
6. Test CRUD operations with /docs

### Phase 2: Backend API (Priority: P1)
7. Implement task router endpoints
8. Add validation and error handling
9. Test all endpoints with Swagger UI
10. Verify OpenAPI documentation

### Phase 3: Frontend Foundation (Priority: P1)
11. Setup Next.js project with TypeScript
12. Configure Tailwind CSS
13. Implement TypeScript types
14. Implement API client
15. Test API client with backend

### Phase 4: Frontend Components (Priority: P2)
16. Implement TaskItem component
17. Implement TaskList component
18. Implement TaskForm component
19. Implement SearchBar component
20. Implement FilterBar component
21. Implement SortControls component

### Phase 5: Integration (Priority: P2)
22. Implement home page with all components
23. Connect components to API client
24. Add loading and error states
25. Test full user flows

### Phase 6: Polish (Priority: P3)
26. Add responsive design
27. Add animations and transitions
28. Optimize performance
29. Add accessibility features
30. Final testing and bug fixes

## Environment Configuration

### Backend `.env`
```
DATABASE_URL=postgresql+asyncpg://user:password@host/database
CORS_ORIGINS=http://localhost:3000
```

### Frontend `.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## Testing Strategy

### Backend Testing
- Unit tests for CRUD operations
- Integration tests for API endpoints
- Validation tests for Pydantic schemas
- Database tests with test database

### Frontend Testing
- Component tests with React Testing Library
- API client tests with mocked responses
- Integration tests for user flows

### Manual Testing
- Test all user stories from spec.md
- Test all edge cases
- Test error handling
- Test responsive design

## Deployment Strategy

### Backend Deployment
1. Push code to GitHub
2. Connect to Railway/Render
3. Set environment variables (DATABASE_URL)
4. Deploy backend
5. Run migrations: `alembic upgrade head`

### Frontend Deployment
1. Push code to GitHub
2. Connect to Vercel
3. Set environment variables (NEXT_PUBLIC_API_URL)
4. Deploy frontend

### Database Setup
1. Create Neon project
2. Create database
3. Copy connection string
4. Add to backend environment variables

## Acceptance Validation

After implementation, verify against spec:

**User Story 1 (P1) - Create and View Tasks**:
- [ ] Can create task with all fields
- [ ] Tasks display with priority badges
- [ ] Tags display as chips
- [ ] Due dates display formatted
- [ ] Validation errors show for invalid data

**User Story 2 (P1) - Search Tasks**:
- [ ] Search finds tasks by title
- [ ] Search finds tasks by description
- [ ] Search is case-insensitive
- [ ] Empty search shows all tasks

**User Story 3 (P2) - Filter Tasks**:
- [ ] Can filter by completion status
- [ ] Can filter by priority
- [ ] Can filter by tag
- [ ] Multiple filters work together (AND logic)

**User Story 4 (P2) - Sort Tasks**:
- [ ] Can sort by due date
- [ ] Can sort by priority
- [ ] Can sort by title
- [ ] Can toggle sort order (asc/desc)

**User Story 5 (P3) - Update and Delete**:
- [ ] Can update all task fields
- [ ] Can delete tasks
- [ ] Updated_at timestamp refreshes

**User Story 6 (P1) - Mark Complete**:
- [ ] Can toggle completion status
- [ ] Status updates immediately
- [ ] Filters update accordingly

## Notes

- Implementation will be generated directly from this plan and the spec
- All code will include type hints and documentation
- No manual coding - code generated from spec per constitution
- If output is incorrect, spec will be refined and code regenerated
- API-first approach ensures frontend and backend can be developed in parallel
