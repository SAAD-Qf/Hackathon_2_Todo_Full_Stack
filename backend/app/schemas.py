"""
Pydantic schemas for request/response validation.
Defines input/output schemas separate from database models.
"""

from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional, List
from enum import Enum


class PriorityEnum(str, Enum):
    """Task priority levels."""
    low = "low"
    medium = "medium"
    high = "high"


class TaskCreate(BaseModel):
    """
    Schema for creating a new task.

    Validation:
    - title: Required, 1-200 characters
    - description: Optional, defaults to empty string
    - priority: Optional, defaults to medium
    - tags: Optional, max 10 tags, each 1-50 characters
    - due_date: Optional datetime
    """
    title: str = Field(min_length=1, max_length=200, description="Task title")
    description: Optional[str] = Field(default="", description="Task description")
    priority: PriorityEnum = Field(default=PriorityEnum.medium, description="Task priority")
    tags: List[str] = Field(default=[], description="Task tags")
    due_date: Optional[datetime] = Field(default=None, description="Task due date")

    @field_validator('title')
    @classmethod
    def validate_title(cls, v: str) -> str:
        """Validate title is not empty after stripping whitespace."""
        v = v.strip()
        if not v:
            raise ValueError('Title cannot be empty')
        return v

    @field_validator('tags')
    @classmethod
    def validate_tags(cls, v: List[str]) -> List[str]:
        """Validate tags array constraints."""
        if len(v) > 10:
            raise ValueError('Maximum 10 tags allowed')
        for tag in v:
            if len(tag) < 1 or len(tag) > 50:
                raise ValueError('Each tag must be 1-50 characters')
        return v

    model_config = {
        "json_schema_extra": {
            "example": {
                "title": "Buy groceries",
                "description": "Milk, eggs, bread, cheese",
                "priority": "high",
                "tags": ["shopping", "urgent"],
                "due_date": "2026-01-10T18:00:00Z"
            }
        }
    }


class TaskUpdate(BaseModel):
    """
    Schema for updating an existing task.
    All fields are optional - only provided fields will be updated.
    """
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    priority: Optional[PriorityEnum] = None
    tags: Optional[List[str]] = None
    due_date: Optional[datetime] = None

    @field_validator('title')
    @classmethod
    def validate_title(cls, v: Optional[str]) -> Optional[str]:
        """Validate title if provided."""
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError('Title cannot be empty')
        return v

    @field_validator('tags')
    @classmethod
    def validate_tags(cls, v: Optional[List[str]]) -> Optional[List[str]]:
        """Validate tags if provided."""
        if v is not None:
            if len(v) > 10:
                raise ValueError('Maximum 10 tags allowed')
            for tag in v:
                if len(tag) < 1 or len(tag) > 50:
                    raise ValueError('Each tag must be 1-50 characters')
        return v


class TaskComplete(BaseModel):
    """Schema for toggling task completion status."""
    completed: bool = Field(description="Task completion status")


class TaskResponse(BaseModel):
    """
    Schema for task responses.
    Matches Task model exactly for API responses.
    """
    id: int
    title: str
    description: str
    priority: PriorityEnum
    tags: List[str]
    due_date: Optional[datetime]
    completed: bool
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
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
    }


class TaskListResponse(BaseModel):
    """
    Schema for paginated task list responses.
    Includes tasks array and pagination metadata.
    """
    tasks: List[TaskResponse]
    total: int = Field(description="Total number of tasks matching filters")
    limit: int = Field(description="Number of tasks per page")
    offset: int = Field(description="Pagination offset")

    model_config = {
        "json_schema_extra": {
            "example": {
                "tasks": [
                    {
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
                ],
                "total": 1,
                "limit": 50,

class UserBase(BaseModel):
    email: str


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int
    is_active: bool

    class Config:
        orm_mode = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None
