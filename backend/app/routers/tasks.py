"""
Task API router.
Defines all REST endpoints for task management.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.database import get_session
from app.schemas import (
    TaskCreate,
    TaskUpdate,
    TaskComplete,
    TaskResponse,
    TaskListResponse,
    PriorityEnum
)
from app import crud


router = APIRouter(prefix="/api/v1/tasks", tags=["tasks"])


@router.post(
    "",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new task",
    description="Create a new task with title, description, priority, tags, and due date"
)
async def create_task(
    task: TaskCreate,
    session: AsyncSession = Depends(get_session)
) -> TaskResponse:
    """
    Create a new task.

    Args:
        task: Task creation data
        session: Database session (injected)

    Returns:
        Created task with generated ID and timestamps

    Raises:
        400: Invalid data
        422: Validation errors
    """
    created_task = await crud.create_task(session, task)
    return TaskResponse.model_validate(created_task)


@router.get(
    "",
    response_model=TaskListResponse,
    summary="List tasks with filters",
    description="Get paginated list of tasks with optional search, filters, and sorting"
)
async def list_tasks(
    search: Optional[str] = Query(None, description="Search in title and description"),
    status: Optional[str] = Query(
        None,
        regex="^(completed|incomplete|all)$",
        description="Filter by completion status"
    ),
    priority: Optional[PriorityEnum] = Query(None, description="Filter by priority"),
    tag: Optional[str] = Query(None, description="Filter by tag (exact match)"),
    sort_by: str = Query(
        "created_at",
        regex="^(due_date|priority|title|created_at)$",
        description="Field to sort by"
    ),
    sort_order: str = Query(
        "desc",
        regex="^(asc|desc)$",
        description="Sort direction"
    ),
    limit: int = Query(50, ge=1, le=100, description="Number of results per page"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    session: AsyncSession = Depends(get_session)
) -> TaskListResponse:
    """
    List tasks with filtering, searching, sorting, and pagination.

    Query Parameters:
        - search: Search text (case-insensitive, searches title and description)
        - status: Filter by completion (completed/incomplete/all)
        - priority: Filter by priority (low/medium/high)
        - tag: Filter by tag (exact match)
        - sort_by: Sort field (due_date/priority/title/created_at)
        - sort_order: Sort direction (asc/desc)
        - limit: Results per page (1-100, default 50)
        - offset: Pagination offset (default 0)

    Returns:
        Paginated list of tasks with total count
    """
    tasks, total = await crud.get_tasks(
        session=session,
        search=search,
        status=status,
        priority=priority,
        tag=tag,
        sort_by=sort_by,
        sort_order=sort_order,
        limit=limit,
        offset=offset
    )

    task_responses = [TaskResponse.model_validate(task) for task in tasks]

    return TaskListResponse(
        tasks=task_responses,
        total=total,
        limit=limit,
        offset=offset
    )


@router.get(
    "/{task_id}",
    response_model=TaskResponse,
    summary="Get task by ID",
    description="Retrieve a single task by its ID"
)
async def get_task(
    task_id: int,
    session: AsyncSession = Depends(get_session)
) -> TaskResponse:
    """
    Get a single task by ID.

    Args:
        task_id: Task ID
        session: Database session (injected)

    Returns:
        Task details

    Raises:
        404: Task not found
    """
    task = await crud.get_task(session, task_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id {task_id} not found"
        )
    return TaskResponse.model_validate(task)


@router.put(
    "/{task_id}",
    response_model=TaskResponse,
    summary="Update task",
    description="Update one or more fields of an existing task"
)
async def update_task(
    task_id: int,
    task_data: TaskUpdate,
    session: AsyncSession = Depends(get_session)
) -> TaskResponse:
    """
    Update an existing task.

    Args:
        task_id: Task ID
        task_data: Fields to update (only provided fields are updated)
        session: Database session (injected)

    Returns:
        Updated task

    Raises:
        404: Task not found
        400: Invalid data
        422: Validation errors
    """
    updated_task = await crud.update_task(session, task_id, task_data)
    if not updated_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id {task_id} not found"
        )
    return TaskResponse.model_validate(updated_task)


@router.delete(
    "/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete task",
    description="Delete a task by its ID"
)
async def delete_task(
    task_id: int,
    session: AsyncSession = Depends(get_session)
) -> None:
    """
    Delete a task by ID.

    Args:
        task_id: Task ID
        session: Database session (injected)

    Returns:
        No content (204)

    Raises:
        404: Task not found
    """
    success = await crud.delete_task(session, task_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id {task_id} not found"
        )


@router.patch(
    "/{task_id}/complete",
    response_model=TaskResponse,
    summary="Toggle task completion",
    description="Mark a task as complete or incomplete"
)
async def toggle_complete(
    task_id: int,
    data: TaskComplete,
    session: AsyncSession = Depends(get_session)
) -> TaskResponse:
    """
    Toggle task completion status.

    Args:
        task_id: Task ID
        data: Completion status (true/false)
        session: Database session (injected)

    Returns:
        Updated task

    Raises:
        404: Task not found
    """
    updated_task = await crud.toggle_complete(session, task_id, data.completed)
    if not updated_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id {task_id} not found"
        )
    return TaskResponse.model_validate(updated_task)
