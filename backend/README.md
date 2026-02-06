# Todo Full-Stack Backend

FastAPI backend for Todo application with SQLModel and Neon Postgres.

## Features

- ✅ RESTful API with FastAPI
- ✅ Async database operations with SQLModel
- ✅ Neon Postgres (serverless)
- ✅ Automatic API documentation (Swagger UI)
- ✅ Type safety with Pydantic v2
- ✅ Database migrations with Alembic
- ✅ CORS enabled for frontend

## Tech Stack

- **Framework**: FastAPI 0.109+
- **ORM**: SQLModel 0.0.14+
- **Database**: Neon Postgres (PostgreSQL 16)
- **Validation**: Pydantic v2
- **Migrations**: Alembic
- **Server**: Uvicorn (ASGI)

## Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env` with your Neon Postgres connection string:

```
DATABASE_URL=postgresql+asyncpg://user:password@host/database
```

### 3. Run Database Migrations

```bash
# Generate initial migration
alembic revision --autogenerate -m "Initial schema"

# Apply migrations
alembic upgrade head
```

### 4. Start Development Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Tasks

- `POST /api/v1/tasks` - Create task
- `GET /api/v1/tasks` - List tasks (with filters, search, sort)
- `GET /api/v1/tasks/{id}` - Get task by ID
- `PUT /api/v1/tasks/{id}` - Update task
- `DELETE /api/v1/tasks/{id}` - Delete task
- `PATCH /api/v1/tasks/{id}/complete` - Toggle completion

### Query Parameters (GET /api/v1/tasks)

- `search` - Search in title/description
- `status` - Filter by completion (completed/incomplete/all)
- `priority` - Filter by priority (low/medium/high)
- `tag` - Filter by tag
- `sort_by` - Sort field (due_date/priority/title/created_at)
- `sort_order` - Sort direction (asc/desc)
- `limit` - Results per page (1-100, default 50)
- `offset` - Pagination offset

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py          # FastAPI app
│   ├── models.py        # SQLModel models
│   ├── schemas.py       # Pydantic schemas
│   ├── database.py      # Database connection
│   ├── crud.py          # CRUD operations
│   └── routers/
│       └── tasks.py     # Task endpoints
├── alembic/             # Database migrations
├── requirements.txt
├── .env.example
└── README.md
```

## Database Schema

### Tasks Table

| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PRIMARY KEY, AUTO INCREMENT |
| title | VARCHAR(200) | NOT NULL |
| description | TEXT | DEFAULT '' |
| priority | VARCHAR(10) | NOT NULL, DEFAULT 'medium' |
| tags | TEXT[] | DEFAULT '{}' |
| due_date | TIMESTAMP | NULLABLE |
| completed | BOOLEAN | NOT NULL, DEFAULT FALSE |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() |

## Development

### Generate New Migration

After modifying models in `app/models.py`:

```bash
alembic revision --autogenerate -m "Description of changes"
alembic upgrade head
```

### Run Tests

```bash
pytest
```

### Type Checking

```bash
mypy app/
```

### Linting

```bash
ruff check app/
```

### Formatting

```bash
black app/
```

## Deployment

### Railway

1. Create new project on Railway
2. Add Neon Postgres database
3. Set environment variables:
   - `DATABASE_URL` (from Neon)
   - `CORS_ORIGINS` (frontend URL)
4. Deploy from GitHub

### Render

1. Create new Web Service
2. Connect to GitHub repository
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables

## Environment Variables

- `DATABASE_URL` - Neon Postgres connection string (required)
- `CORS_ORIGINS` - Allowed frontend origins (default: localhost:3000)
- `ENVIRONMENT` - Environment name (development/production)

## API Documentation

Interactive API documentation is automatically generated and available at:
- Swagger UI: `/docs`
- ReDoc: `/redoc`

## License

MIT
