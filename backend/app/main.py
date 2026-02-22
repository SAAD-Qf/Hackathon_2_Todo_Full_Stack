"""
FastAPI application entry point.
Configures CORS, includes routers, and initializes database.
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.routers import tasks, auth
from app.database import init_db
from app.dependencies import get_current_user
from fastapi import Depends


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Handles startup and shutdown events.
    """
    # Startup: Initialize database
    await init_db()
    yield
    # Shutdown: Cleanup (if needed)


# Create FastAPI application
app = FastAPI(
    title="Todo API",
    description="Full-stack todo application API with FastAPI, SQLModel, and Neon Postgres",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS configuration for frontend
# Read from environment variable or use defaults
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
allowed_origins = [origin.strip() for origin in cors_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if "*" not in allowed_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Include routers
app.include_router(auth.router)
app.include_router(
    tasks.router,
    dependencies=[Depends(get_current_user)],
)


@app.get("/", tags=["root"])
async def root():
    """
    Root endpoint.
    Returns API information.
    """
    return {
        "message": "Todo API v2.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
        "health": "/health"
    }


@app.get("/health", tags=["health"])
async def health_check():
    """
    Health check endpoint.
    Returns API health status.
    """
    return {
        "status": "healthy",
        "version": "2.0.0"
    }
