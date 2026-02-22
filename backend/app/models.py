"""
SQLModel models for Todo application.
Defines the Task entity with all fields from domain specification.
"""

from sqlmodel import SQLModel, Field, Column
from sqlalchemy import JSON
from datetime import datetime
from typing import Optional, List
from enum import Enum


class PriorityEnum(str, Enum):
    """Task priority levels."""
    low = "low"
    medium = "medium"
    high = "high"


class Task(SQLModel, table=True):
    """
    Task entity representing a todo item.

    Fields match domain model specification exactly:
    - id: Auto-incrementing primary key
    - title: Required, 1-200 characters
    - description: Optional text
    - priority: Enum (low/medium/high), default medium
    - tags: Array of strings, max 10 tags (stored as JSON for SQLite compatibility)
    - due_date: Optional datetime
    - completed: Boolean, default false
    - created_at: Auto-set on creation
    - updated_at: Auto-updated on modification
    """
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(max_length=200, nullable=False, index=True)
    description: str = Field(default="")
    priority: PriorityEnum = Field(default=PriorityEnum.medium, index=True)
    tags: List[str] = Field(default=[], sa_column=Column(JSON))
    due_date: Optional[datetime] = Field(default=None, nullable=True, index=True)
    completed: bool = Field(default=False, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    class Config:
        """SQLModel configuration."""
        json_schema_extra = {
            "example": {
                "id": 1,
                "title": "Buy groceries",
                "description": "Milk, eggs, bread, cheese",
                "priority": "high",
                "tags": ["shopping", "urgent"],
                "due_date": "2026-01-10T18:00:00Z",
                "completed": False,
                "created_at": "2026-01-06T10:30:00Z",
                "updated_at": "2026-01-06T10:30:00Z"
            }
        }


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True, nullable=False)
    hashed_password: str = Field(nullable=False)
