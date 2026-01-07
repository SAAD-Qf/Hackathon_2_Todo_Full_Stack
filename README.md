# Todo Full-Stack Application - Phase II

Complete full-stack web application for task management built with Next.js, FastAPI, SQLModel, and Neon Postgres following Spec-Driven Development principles.

## 🎯 Project Overview

**Phase II** upgrades the console-based Todo app (Phase I) to a modern full-stack web application with:
- ✅ Rich web interface with Next.js and Tailwind CSS
- ✅ RESTful API with FastAPI
- ✅ PostgreSQL database with SQLModel ORM
- ✅ Advanced features: priorities, tags, due dates, search, filtering, sorting
- ✅ Type safety throughout the entire stack
- ✅ API-first design with auto-generated documentation

## 📁 Project Structure

```
todo-fullstack/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── main.py            # FastAPI application
│   │   ├── models.py          # SQLModel database models
│   │   ├── schemas.py         # Pydantic validation schemas
│   │   ├── database.py        # Database connection
│   │   ├── crud.py            # CRUD operations
│   │   └── routers/
│   │       └── tasks.py       # Task API endpoints
│   ├── alembic/               # Database migrations
│   ├── requirements.txt
│   └── README.md
│
├── frontend/                   # Next.js frontend
│   ├── app/
│   │   ├── page.tsx           # Main application page
│   │   ├── layout.tsx         # Root layout
│   │   └── components/        # React components
│   ├── lib/
│   │   ├── api.ts             # Typed API client
│   │   └── types.ts           # TypeScript types
│   ├── package.json
│   └── README.md
│
├── specs/                      # Specifications
│   └── 002-todo-fullstack/
│       ├── spec.md            # Feature specification
│       └── plan.md            # Implementation plan
│
└── README.md                   # This file
```

## 🚀 Quick Start

### Prerequisites

- **Backend**: Python 3.11+, pip
- **Frontend**: Node.js 18+, npm
- **Database**: Neon Postgres account (free tier available)

### 1. Database Setup

1. Create a free account at [Neon](https://neon.tech)
2. Create a new project and database
3. Copy the connection string (starts with `postgresql://`)

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your Neon connection string

# Run database migrations
alembic revision --autogenerate -m "Initial schema"
alembic upgrade head

# Start backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at:
- API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.local.example .env.local
# Edit .env.local if backend is not at localhost:8000

# Start development server
npm run dev
```

Frontend will be available at http://localhost:3000

## 🎨 Features

### Task Management
- ✅ Create tasks with title, description, priority, tags, and due dates
- ✅ Update any task field
- ✅ Delete tasks with confirmation
- ✅ Mark tasks as complete/incomplete
- ✅ View all tasks in a responsive list

### Search & Filter
- ✅ Real-time search in title and description
- ✅ Filter by completion status (all/incomplete/completed)
- ✅ Filter by priority (high/medium/low)
- ✅ Filter by tags
- ✅ Multiple filters work together (AND logic)

### Sorting
- ✅ Sort by due date (earliest/latest)
- ✅ Sort by priority (high→low or low→high)
- ✅ Sort by title (A→Z or Z→A)
- ✅ Sort by created date (newest/oldest)

### UI/UX
- ✅ Modern, responsive design with Tailwind CSS
- ✅ Priority badges with color coding
- ✅ Tag chips
- ✅ Overdue task indicators
- ✅ Loading states
- ✅ Error handling with user-friendly messages
- ✅ Form validation

## 🏗️ Tech Stack

### Backend
- **Framework**: FastAPI 0.109+
- **ORM**: SQLModel 0.0.14+
- **Database**: Neon Postgres (PostgreSQL 16)
- **Validation**: Pydantic v2
- **Migrations**: Alembic
- **Server**: Uvicorn (ASGI)

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript 5+ (strict mode)
- **Styling**: Tailwind CSS 3+
- **HTTP Client**: Native fetch API
- **State**: React hooks

### Database Schema

```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT DEFAULT '',
    priority VARCHAR(10) NOT NULL DEFAULT 'medium',
    tags TEXT[] DEFAULT '{}',
    due_date TIMESTAMP NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## 📡 API Endpoints

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/tasks` | Create new task |
| GET | `/api/v1/tasks` | List tasks (with filters) |
| GET | `/api/v1/tasks/{id}` | Get task by ID |
| PUT | `/api/v1/tasks/{id}` | Update task |
| DELETE | `/api/v1/tasks/{id}` | Delete task |
| PATCH | `/api/v1/tasks/{id}/complete` | Toggle completion |

### Query Parameters (GET /api/v1/tasks)

- `search` - Search text (title/description)
- `status` - Filter by status (completed/incomplete/all)
- `priority` - Filter by priority (low/medium/high)
- `tag` - Filter by tag
- `sort_by` - Sort field (due_date/priority/title/created_at)
- `sort_order` - Sort direction (asc/desc)
- `limit` - Results per page (1-100, default 50)
- `offset` - Pagination offset

## 🧪 Development

### Backend Development

```bash
cd backend

# Run with auto-reload
uvicorn app.main:app --reload

# Type checking
mypy app/

# Linting
ruff check app/

# Formatting
black app/

# Generate migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head
```

### Frontend Development

```bash
cd frontend

# Run development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build
npm start
```

## 🚢 Deployment

### Backend Deployment (Railway/Render)

1. Push code to GitHub
2. Create new project on Railway or Render
3. Connect to GitHub repository
4. Set environment variables:
   - `DATABASE_URL` (from Neon)
   - `CORS_ORIGINS` (frontend URL)
5. Deploy
6. Run migrations: `alembic upgrade head`

### Frontend Deployment (Vercel)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variable:
   - `NEXT_PUBLIC_API_URL` (backend API URL)
4. Deploy

### Database (Neon)

1. Create Neon project at https://neon.tech
2. Create database
3. Copy connection string
4. Add to backend environment variables

## 📚 Documentation

- **Backend API**: http://localhost:8000/docs (Swagger UI)
- **Backend README**: [backend/README.md](backend/README.md)
- **Frontend README**: [frontend/README.md](frontend/README.md)
- **Feature Spec**: [specs/002-todo-fullstack/spec.md](specs/002-todo-fullstack/spec.md)
- **Implementation Plan**: [specs/002-todo-fullstack/plan.md](specs/002-todo-fullstack/plan.md)
- **Constitution**: [.specify/memory/constitution-phase2.md](.specify/memory/constitution-phase2.md)

## 🎓 Spec-Driven Development

This project follows **Spec-Driven Development (SDD)** principles:

1. **Spec-First**: All code generated from written specifications
2. **API-First**: API contracts defined before implementation
3. **Type Safety**: TypeScript (frontend) + Python type hints (backend)
4. **Database Schema from Spec**: SQLModel generates schema from domain model
5. **Iterative Refinement**: Spec updates drive code regeneration

### Development Workflow

```
Specification → Implementation → Validation → Refinement
```

1. Write detailed specification (domain model, API contracts, UI components)
2. Generate implementation from spec
3. Test against acceptance criteria
4. If incorrect, refine spec and regenerate (never edit code directly)

## 🔒 Security

- ✅ Input validation with Pydantic
- ✅ SQL injection prevention (SQLModel/SQLAlchemy)
- ✅ CORS configuration
- ✅ Type safety throughout stack
- ⚠️ Authentication not implemented (Phase III)

## 🧩 Architecture

### Frontend-Backend Separation

- Frontend and backend are independently deployable
- Communication via REST API only
- No direct database access from frontend
- Stateless API design

### Type Safety

- **Backend**: Python type hints + Pydantic validation
- **Frontend**: TypeScript strict mode
- **API**: JSON Schema validation
- **Database**: SQLModel enforces types

### Component Modularity

- Each React component has single responsibility
- Components are reusable and composable
- Props are explicitly typed
- State management is localized

## 📈 Future Enhancements (Phase III+)

- [ ] User authentication and authorization
- [ ] Multi-user support with task ownership
- [ ] Real-time updates with WebSockets
- [ ] Task categories and projects
- [ ] Recurring tasks
- [ ] Task attachments
- [ ] Collaboration features (sharing, comments)
- [ ] Mobile app (React Native)
- [ ] Email notifications
- [ ] Analytics dashboard

## 🐛 Troubleshooting

### Backend Issues

**Database connection fails**:
- Verify `DATABASE_URL` in `.env`
- Ensure Neon database is active
- Check connection string format: `postgresql+asyncpg://...`

**Migrations fail**:
- Delete `alembic/versions/*.py` files
- Regenerate: `alembic revision --autogenerate -m "Initial"`
- Apply: `alembic upgrade head`

**CORS errors**:
- Check `CORS_ORIGINS` in backend includes frontend URL
- Verify frontend is running on expected port

### Frontend Issues

**API calls fail**:
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Ensure backend is running
- Check browser console for errors

**Build fails**:
- Delete `.next` folder
- Run `npm install` again
- Check TypeScript errors: `npm run type-check`

## 📝 License

MIT

## 🙏 Acknowledgments

Built following Spec-Driven Development principles with:
- FastAPI for high-performance async API
- SQLModel for elegant ORM with type safety
- Next.js for modern React development
- Neon for serverless Postgres
- Tailwind CSS for utility-first styling

---

**Version**: 2.0.0
**Created**: 2026-01-06
**Constitution**: Phase II (v2.0.0)
