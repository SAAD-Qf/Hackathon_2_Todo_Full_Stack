---
title: Todo App Backend
emoji: 📝
colorFrom: blue
colorTo: green
sdk: docker
pinned: false
app_port: 7860
---

# Todo App Backend API

FastAPI backend for a full-stack todo application.

## Features

- ✅ RESTful API with FastAPI
- ✅ SQLModel ORM with async support
- ✅ Full CRUD operations
- ✅ Priority levels and tags
- ✅ Search and filtering
- ✅ Auto-generated API documentation

## API Endpoints

- `GET /` - API information
- `GET /health` - Health check
- `GET /docs` - Interactive API documentation
- `GET /api/v1/tasks` - List all tasks
- `POST /api/v1/tasks` - Create a new task
- `GET /api/v1/tasks/{id}` - Get a specific task
- `PUT /api/v1/tasks/{id}` - Update a task
- `DELETE /api/v1/tasks/{id}` - Delete a task

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string (optional, uses SQLite by default)
- `CORS_ORIGINS` - Comma-separated list of allowed origins

## Usage

Visit `/docs` for interactive API documentation.
