# Implementation Plan: Todo MVP

**Branch**: `001-todo-mvp` | **Date**: 2026-01-06 | **Spec**: [spec.md](./spec.md)

## Summary

Implement a single-file Python console application for managing todo tasks in memory. The application provides a menu-driven interface for CRUD operations on tasks stored as dictionaries in a Python list. Implementation strictly follows the constitution's principles: spec-first development, single responsibility functions, zero external dependencies, and minimal global state.

## Technical Context

**Language/Version**: Python 3.x (standard library only)
**Primary Dependencies**: None (Python standard library only)
**Storage**: In-memory Python list of dictionaries
**Testing**: Manual console interaction testing
**Target Platform**: Any platform with Python 3.x
**Project Type**: Single-file application
**Performance Goals**: Instant response for all operations (in-memory)
**Constraints**: No file I/O, no database, no external libraries, single global variable (task list)
**Scale/Scope**: MVP - 5 core features, ~200-300 lines of code

## Constitution Check

*GATE: Must pass before implementation.*

✅ **Spec-First Development**: Complete specification exists with user stories, acceptance criteria, and functional requirements
✅ **Single Responsibility**: Plan includes modular functions, each with one clear purpose
✅ **In-Memory Simplicity**: No external dependencies, storage is Python list only
✅ **Console Interface**: Menu-driven text interface specified
✅ **Minimal Global State**: Only task list is global, all other state passed as parameters
✅ **Iterative Refinement**: Spec is complete and approved for implementation

**Result**: All constitution principles satisfied. Proceed to implementation.

## Project Structure

### Documentation (this feature)

```text
specs/001-todo-mvp/
├── spec.md              # Feature specification (complete)
├── plan.md              # This file - implementation plan
└── todo_app.py          # Implementation output (to be created)
```

### Source Code (repository root)

```text
specs/001-todo-mvp/
└── todo_app.py          # Single-file application containing all functionality
```

**Structure Decision**: Single-file architecture per constitution. All functions and the task list will reside in `todo_app.py` at the feature directory level.

## Implementation Design

### Data Structure

```python
# Global task list (only permitted global variable)
tasks = []

# Task structure (dictionary)
{
    "id": int,           # Unique sequential ID (1, 2, 3, ...)
    "title": str,        # Task title (required, non-empty)
    "description": str,  # Task description (optional)
    "completed": bool    # Completion status (default: False)
}
```

### Function Architecture

Following single responsibility principle, the application will have these functions:

**Core Operations** (one function per CRUD operation):
- `add_task(tasks, title, description)` → returns updated tasks list
- `view_tasks(tasks)` → displays all tasks, returns None
- `update_task(tasks, task_id, title, description)` → returns success boolean
- `delete_task(tasks, task_id)` → returns success boolean
- `toggle_completion(tasks, task_id)` → returns success boolean

**Helper Functions**:
- `get_next_id(tasks)` → returns next available ID (int)
- `find_task_by_id(tasks, task_id)` → returns task dict or None
- `display_task(task)` → prints single task, returns None
- `get_user_input(prompt)` → returns user input string
- `get_task_id_input()` → returns validated task ID (int) or None

**Interface Functions**:
- `display_menu()` → prints menu options, returns None
- `main()` → main application loop

### Menu Structure

```
=== Todo App - Phase I ===
1. Add Task
2. View All Tasks
3. Update Task
4. Delete Task
5. Mark Complete/Incomplete
6. Exit

Enter your choice (1-6):
```

### User Flow Examples

**Add Task Flow**:
1. User selects option 1
2. System prompts for title (validates non-empty)
3. System prompts for description (optional)
4. System creates task with next ID, completed=False
5. System confirms: "Task added successfully! (ID: X)"

**View Tasks Flow**:
1. User selects option 2
2. System displays all tasks in formatted list
3. Format: `[ID] Title - Description (Status: ✓ Complete / ○ Incomplete)`

**Update Task Flow**:
1. User selects option 3
2. System prompts for task ID
3. System validates ID exists
4. System prompts for new title (or Enter to keep current)
5. System prompts for new description (or Enter to keep current)
6. System updates task and confirms

**Delete Task Flow**:
1. User selects option 4
2. System prompts for task ID
3. System validates ID exists
4. System removes task and confirms

**Toggle Completion Flow**:
1. User selects option 5
2. System prompts for task ID
3. System validates ID exists
4. System toggles completed status and confirms

### Error Handling

All operations validate inputs and display user-friendly messages:
- Invalid menu option → "Invalid option. Please select 1-6."
- Empty title → "Title cannot be empty. Please try again."
- Invalid ID format → "Invalid input. Please enter a numeric ID."
- Task not found → "Task not found. Please check the ID and try again."
- Empty task list → "No tasks found. Add a task to get started."

### Implementation Order

Per constitution and spec priorities:

**Phase 1: Core Infrastructure**
1. Define global tasks list
2. Implement `get_next_id()` helper
3. Implement `find_task_by_id()` helper
4. Implement `display_task()` helper

**Phase 2: User Story 1 (P1) - Add and View**
5. Implement `add_task()`
6. Implement `view_tasks()`
7. Implement basic menu and main loop
8. Test: Add tasks and view them

**Phase 3: User Story 2 (P2) - Mark Complete**
9. Implement `toggle_completion()`
10. Add menu option 5
11. Test: Toggle task completion status

**Phase 4: User Story 3 (P3) - Update**
12. Implement `update_task()`
13. Add menu option 3
14. Test: Update task title and description

**Phase 5: User Story 4 (P3) - Delete**
15. Implement `delete_task()`
16. Add menu option 4
17. Test: Delete tasks by ID

**Phase 6: Polish**
18. Add input validation helpers
19. Improve error messages
20. Add exit option and graceful shutdown

## Acceptance Validation

After implementation, verify against spec:

**User Story 1 (P1)**:
- [ ] Can add task with title and description
- [ ] New tasks have unique ID and completed=False
- [ ] Can view all tasks with full details
- [ ] Empty title shows error message

**User Story 2 (P2)**:
- [ ] Can mark task complete (false → true)
- [ ] Can mark task incomplete (true → false)
- [ ] Invalid ID shows error message

**User Story 3 (P3)**:
- [ ] Can update task title
- [ ] Can update task description
- [ ] Other fields remain unchanged
- [ ] Invalid ID shows error message

**User Story 4 (P3)**:
- [ ] Can delete task by ID
- [ ] Task no longer appears in list
- [ ] Other tasks remain unchanged
- [ ] Invalid ID shows error message

**Edge Cases**:
- [ ] Non-numeric ID input handled gracefully
- [ ] Invalid menu option handled gracefully
- [ ] Empty list displays appropriate message
- [ ] Long titles/descriptions display correctly

## Notes

- Implementation will be generated directly from this plan and the spec
- All functions will include docstrings explaining purpose
- No manual coding - code generated from spec per constitution
- If output is incorrect, spec will be refined and code regenerated
