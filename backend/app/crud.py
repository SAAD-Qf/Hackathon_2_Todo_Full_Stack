"""
CRUD operations for Task entity.
All database operations are async and use SQLModel/SQLAlchemy.
"""

from sqlmodel import select, or_, and_, func
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List, Tuple
from datetime import datetime

from app.models import Task, PriorityEnum
from app.schemas import TaskCreate, TaskUpdate


async def create_task(session: AsyncSession, task_data: TaskCreate) -> Task:
    """
    Create a new task.

    Args:
        session: Database session
        task_data: Task creation data

    Returns:
        Created task with generated ID and timestamps
    """
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
) -> Tuple[List[Task], int]:
    """
    Get tasks with filtering, searching, sorting, and pagination.

    Args:
        session: Database session
        search: Search text for title/description (case-insensitive)
        status: Filter by completion status (completed/incomplete/all)
        priority: Filter by priority level
        tag: Filter by tag (exact match)
        sort_by: Field to sort by (due_date/priority/title/created_at)
        sort_order: Sort direction (asc/desc)
        limit: Maximum number of results
        offset: Pagination offset

    Returns:
        Tuple of (tasks list, total count)
    """
    # Build base query
    query = select(Task)

    # Apply search filter (case-insensitive)
    if search:
        search_pattern = f"%{search}%"
        query = query.where(
            or_(
                Task.title.ilike(search_pattern),
                Task.description.ilike(search_pattern)
            )
        )

    # Apply status filter
    if status == "completed":
        query = query.where(Task.completed == True)
    elif status == "incomplete":
        query = query.where(Task.completed == False)
    # "all" or None means no filter

    # Apply priority filter
    if priority:
        query = query.where(Task.priority == priority)

    # Apply tag filter (check if tag is in tags array)
    if tag:
        query = query.where(Task.tags.contains([tag]))

    # Count total results before pagination
    count_query = select(func.count()).select_from(query.subquery())
    result = await session.execute(count_query)
    total = result.scalar_one()

    # Apply sorting
    sort_column = getattr(Task, sort_by, Task.created_at)

    # Handle priority sorting (high > medium > low)
    if sort_by == "priority":
        # Custom priority order
        priority_order = {"high": 3, "medium": 2, "low": 1}
        if sort_order == "desc":
            # High to low
            query = query.order_by(
                func.case(
                    (Task.priority == "high", 3),
                    (Task.priority == "medium", 2),
                    (Task.priority == "low", 1),
                    else_=0
                ).desc()
            )
        else:
            # Low to high
            query = query.order_by(
                func.case(
                    (Task.priority == "high", 3),
                    (Task.priority == "medium", 2),
                    (Task.priority == "low", 1),
                    else_=0
                ).asc()
            )
    else:
        # Standard sorting for other fields
        if sort_order == "desc":
            # Handle null values in due_date (nulls last for desc)
            if sort_by == "due_date":
                query = query.order_by(sort_column.desc().nullslast())
            else:
                query = query.order_by(sort_column.desc())
        else:
            # Handle null values in due_date (nulls last for asc)
            if sort_by == "due_date":
                query = query.order_by(sort_column.asc().nullslast())
            else:
                query = query.order_by(sort_column.asc())

    # Apply pagination
    query = query.offset(offset).limit(limit)

    # Execute query
    result = await session.execute(query)
    tasks = result.scalars().all()

    return list(tasks), total


async def get_task(session: AsyncSession, task_id: int) -> Optional[Task]:
    """
    Get a single task by ID.

    Args:
        session: Database session
        task_id: Task ID

    Returns:
        Task if found, None otherwise
    """
    result = await session.execute(
        select(Task).where(Task.id == task_id)
    )
    return result.scalar_one_or_none()


async def update_task(
    session: AsyncSession,
    task_id: int,
    task_data: TaskUpdate
) -> Optional[Task]:
    """
    Update an existing task.

    Args:
        session: Database session
        task_id: Task ID
        task_data: Fields to update (only provided fields are updated)

    Returns:
        Updated task if found, None otherwise
    """
    task = await get_task(session, task_id)
    if not task:
        return None

    # Update only provided fields
    update_data = task_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(task, key, value)

    # Update timestamp
    task.updated_at = datetime.utcnow()

    await session.commit()
    await session.refresh(task)
    return task


async def delete_task(session: AsyncSession, task_id: int) -> bool:
    """
    Delete a task by ID.

    Args:
        session: Database session
        task_id: Task ID

    Returns:
        True if task was deleted, False if not found
    """
    task = await get_task(session, task_id)
    if not task:
        return False

    await session.delete(task)
    await session.commit()
    return True


async def toggle_complete(
    session: AsyncSession,
    task_id: int,
    completed: bool
) -> Optional[Task]:
    """
    Toggle task completion status.

    Args:
        session: Database session
        task_id: Task ID
        completed: New completion status

    Returns:
        Updated task if found, None otherwise
    """
    task = await get_task(session, task_id)
    if not task:
        return None

    task.completed = completed
    task.updated_at = datetime.utcnow()

    await session.commit()
    await session.refresh(task)
    return task
