# Setup Guide - Todo Full-Stack Application

Complete step-by-step guide to set up and run the Todo application locally.

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

- **Python 3.11 or higher**
  - Check: `python --version` or `python3 --version`
  - Download: https://www.python.org/downloads/

- **Node.js 18 or higher**
  - Check: `node --version`
  - Download: https://nodejs.org/

- **npm (comes with Node.js)**
  - Check: `npm --version`

- **Git**
  - Check: `git --version`
  - Download: https://git-scm.com/

### Required Accounts

- **Neon Postgres** (free tier available)
  - Sign up: https://neon.tech
  - You'll need this for the database

---

## Step 1: Clone or Navigate to Project

If you already have the project files, navigate to the project directory:

```bash
cd path/to/todo-fullstack
```

---

## Step 2: Database Setup (Neon Postgres)

### 2.1 Create Neon Account

1. Go to https://neon.tech
2. Sign up for a free account
3. Verify your email

### 2.2 Create Database

1. Click "Create Project"
2. Choose a project name (e.g., "todo-app")
3. Select a region (choose closest to you)
4. Click "Create Project"

### 2.3 Get Connection String

1. In your Neon dashboard, click on your project
2. Go to "Connection Details"
3. Copy the connection string (it looks like):
   ```
   postgresql://user:password@ep-example-123456.us-east-2.aws.neon.tech/neondb
   ```
4. **Save this connection string** - you'll need it in the next step

---

## Step 3: Backend Setup

### 3.1 Navigate to Backend Directory

```bash
cd backend
```

### 3.2 Create Virtual Environment (Recommended)

**On macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**On Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

You should see `(venv)` in your terminal prompt.

### 3.3 Install Dependencies

```bash
pip install -r requirements.txt
```

This will install:
- FastAPI
- SQLModel
- Uvicorn
- Alembic
- asyncpg
- Pydantic
- python-dotenv

### 3.4 Configure Environment

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` in a text editor

3. Replace the `DATABASE_URL` with your Neon connection string from Step 2.3:
   ```
   DATABASE_URL=postgresql+asyncpg://your-connection-string-here
   ```

   **Important**: Change `postgresql://` to `postgresql+asyncpg://` if needed.

4. Save the file

### 3.5 Initialize Database

Generate and apply the initial database schema:

```bash
# Generate initial migration
alembic revision --autogenerate -m "Initial schema"

# Apply migration to database
alembic upgrade head
```

You should see output indicating the `tasks` table was created.

### 3.6 Start Backend Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### 3.7 Verify Backend is Running

Open your browser and go to:
- **API Root**: http://localhost:8000
- **Swagger UI**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

You should see the API documentation at `/docs`.

**Keep this terminal window open** - the backend server needs to stay running.

---

## Step 4: Frontend Setup

Open a **new terminal window** (keep the backend running in the first one).

### 4.1 Navigate to Frontend Directory

```bash
cd frontend
```

(If you're in the backend directory, use `cd ../frontend`)

### 4.2 Install Dependencies

```bash
npm install
```

This will install:
- Next.js
- React
- TypeScript
- Tailwind CSS
- And other dependencies

This may take a few minutes.

### 4.3 Configure Environment

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Open `.env.local` in a text editor

3. Verify the API URL (should already be correct):
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
   ```

4. Save the file

### 4.4 Start Frontend Server

```bash
npm run dev
```

You should see:
```
  ▲ Next.js 14.1.0
  - Local:        http://localhost:3000
  - Ready in 2.3s
```

### 4.5 Open Application

Open your browser and go to:
- **Application**: http://localhost:3000

You should see the Todo application interface!

---

## Step 5: Test the Application

### 5.1 Create a Task

1. Click the "+ New Task" button
2. Fill in the form:
   - Title: "Test Task"
   - Description: "This is a test"
   - Priority: "High"
   - Tags: "test, demo"
   - Due Date: (select a future date)
3. Click "Create Task"

You should see your task appear in the list!

### 5.2 Test Features

Try these features:
- ✅ Mark the task as complete (checkbox)
- ✅ Search for "test" in the search bar
- ✅ Filter by priority (High)
- ✅ Sort by different fields
- ✅ Edit the task
- ✅ Delete the task

---

## Troubleshooting

### Backend Issues

**Problem**: `ModuleNotFoundError: No module named 'fastapi'`
- **Solution**: Make sure you activated the virtual environment and ran `pip install -r requirements.txt`

**Problem**: Database connection error
- **Solution**:
  - Check your `.env` file has the correct `DATABASE_URL`
  - Verify your Neon database is active
  - Make sure the connection string starts with `postgresql+asyncpg://`

**Problem**: `alembic: command not found`
- **Solution**: Make sure you're in the virtual environment and alembic is installed

**Problem**: Port 8000 already in use
- **Solution**: Either stop the other process or use a different port:
  ```bash
  uvicorn app.main:app --reload --port 8001
  ```
  Then update frontend `.env.local` to use port 8001

### Frontend Issues

**Problem**: `npm: command not found`
- **Solution**: Install Node.js from https://nodejs.org/

**Problem**: API calls fail / CORS errors
- **Solution**:
  - Make sure backend is running on port 8000
  - Check `.env.local` has correct `NEXT_PUBLIC_API_URL`
  - Verify backend CORS settings allow `http://localhost:3000`

**Problem**: Port 3000 already in use
- **Solution**: Next.js will automatically try port 3001, 3002, etc.

**Problem**: TypeScript errors
- **Solution**: Run `npm run type-check` to see detailed errors

### Database Issues

**Problem**: Migration fails
- **Solution**:
  1. Delete all files in `backend/alembic/versions/`
  2. Run `alembic revision --autogenerate -m "Initial schema"`
  3. Run `alembic upgrade head`

**Problem**: Can't connect to Neon
- **Solution**:
  - Check your internet connection
  - Verify Neon project is active (not suspended)
  - Try copying the connection string again from Neon dashboard

---

## Development Workflow

### Daily Development

1. **Start Backend**:
   ```bash
   cd backend
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   uvicorn app.main:app --reload
   ```

2. **Start Frontend** (in new terminal):
   ```bash
   cd frontend
   npm run dev
   ```

3. **Make Changes**:
   - Backend changes auto-reload
   - Frontend changes auto-reload
   - Database changes require new migration

### Making Database Changes

If you modify `backend/app/models.py`:

```bash
cd backend
alembic revision --autogenerate -m "Description of changes"
alembic upgrade head
```

### Stopping the Application

- **Backend**: Press `Ctrl+C` in the backend terminal
- **Frontend**: Press `Ctrl+C` in the frontend terminal

---

## Next Steps

Now that your application is running:

1. **Explore the API**: Visit http://localhost:8000/docs
2. **Read the Spec**: Check `specs/002-todo-fullstack/spec.md`
3. **Review the Code**: Explore the backend and frontend code
4. **Make Changes**: Try modifying the application
5. **Deploy**: Follow deployment guides in README.md

---

## Getting Help

If you encounter issues:

1. Check the error message carefully
2. Review this guide's troubleshooting section
3. Check the main README.md
4. Verify all prerequisites are installed
5. Make sure both backend and frontend are running

---

## Summary

You should now have:
- ✅ Neon Postgres database created
- ✅ Backend running on http://localhost:8000
- ✅ Frontend running on http://localhost:3000
- ✅ Ability to create, view, update, and delete tasks
- ✅ Working search, filter, and sort features

**Congratulations!** Your Todo application is now running locally.
