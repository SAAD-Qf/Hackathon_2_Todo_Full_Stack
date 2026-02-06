"""
Todo App - Phase I
Evolution of Todo Project

A simple console-based todo application with in-memory storage.
Implements CRUD operations following Spec-Driven Development principles.

Constitution: .specify/memory/constitution.md
Specification: specs/001-todo-mvp/spec.md
Plan: specs/001-todo-mvp/plan.md
"""

# Global task list (only permitted global variable per constitution)
tasks = []


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def get_next_id(task_list):
    """
    Generate the next available task ID.

    Args:
        task_list: List of task dictionaries

    Returns:
        int: Next sequential ID (1 if list is empty, otherwise max_id + 1)
    """
    if not task_list:
        return 1
    return max(task["id"] for task in task_list) + 1


def find_task_by_id(task_list, task_id):
    """
    Find a task by its ID.

    Args:
        task_list: List of task dictionaries
        task_id: Integer ID to search for

    Returns:
        dict: Task dictionary if found, None otherwise
    """
    for task in task_list:
        if task["id"] == task_id:
            return task
    return None


def display_task(task):
    """
    Display a single task in formatted output.

    Args:
        task: Task dictionary with id, title, description, completed

    Returns:
        None
    """
    status = "✓ Complete" if task["completed"] else "○ Incomplete"
    print(f"[{task['id']}] {task['title']}")
    print(f"    Description: {task['description']}")
    print(f"    Status: {status}")
    print()


def get_user_input(prompt):
    """
    Get user input with a prompt.

    Args:
        prompt: String to display to user

    Returns:
        str: User input (stripped of whitespace)
    """
    return input(prompt).strip()


def get_task_id_input():
    """
    Get and validate task ID input from user.

    Returns:
        int: Valid task ID, or None if input is invalid
    """
    try:
        task_id = int(get_user_input("Enter task ID: "))
        return task_id
    except ValueError:
        print("❌ Invalid input. Please enter a numeric ID.")
        return None


# ============================================================================
# CORE OPERATIONS (CRUD)
# ============================================================================

def add_task(task_list, title, description):
    """
    Add a new task to the task list.

    Args:
        task_list: List of task dictionaries
        title: Task title (required, non-empty)
        description: Task description (optional)

    Returns:
        dict: The newly created task
    """
    new_task = {
        "id": get_next_id(task_list),
        "title": title,
        "description": description,
        "completed": False
    }
    task_list.append(new_task)
    return new_task


def view_tasks(task_list):
    """
    Display all tasks in the task list.

    Args:
        task_list: List of task dictionaries

    Returns:
        None
    """
    if not task_list:
        print("📋 No tasks found. Add a task to get started.\n")
        return

    print(f"\n{'='*60}")
    print(f"📋 ALL TASKS ({len(task_list)} total)")
    print(f"{'='*60}\n")

    for task in task_list:
        display_task(task)


def update_task(task_list, task_id, new_title=None, new_description=None):
    """
    Update a task's title or description.

    Args:
        task_list: List of task dictionaries
        task_id: ID of task to update
        new_title: New title (None to keep current)
        new_description: New description (None to keep current)

    Returns:
        bool: True if task was updated, False if task not found
    """
    task = find_task_by_id(task_list, task_id)

    if task is None:
        print("❌ Task not found. Please check the ID and try again.\n")
        return False

    if new_title is not None:
        task["title"] = new_title

    if new_description is not None:
        task["description"] = new_description

    return True


def delete_task(task_list, task_id):
    """
    Delete a task from the task list.

    Args:
        task_list: List of task dictionaries
        task_id: ID of task to delete

    Returns:
        bool: True if task was deleted, False if task not found
    """
    task = find_task_by_id(task_list, task_id)

    if task is None:
        print("❌ Task not found. Please check the ID and try again.\n")
        return False

    task_list.remove(task)
    return True


def toggle_completion(task_list, task_id):
    """
    Toggle a task's completion status.

    Args:
        task_list: List of task dictionaries
        task_id: ID of task to toggle

    Returns:
        bool: True if task was toggled, False if task not found
    """
    task = find_task_by_id(task_list, task_id)

    if task is None:
        print("❌ Task not found. Please check the ID and try again.\n")
        return False

    task["completed"] = not task["completed"]
    return True


# ============================================================================
# INTERFACE FUNCTIONS
# ============================================================================

def display_menu():
    """
    Display the main menu options.

    Returns:
        None
    """
    print("\n" + "="*60)
    print("📝 TODO APP - PHASE I")
    print("="*60)
    print("1. Add Task")
    print("2. View All Tasks")
    print("3. Update Task")
    print("4. Delete Task")
    print("5. Mark Complete/Incomplete")
    print("6. Exit")
    print("="*60)


def handle_add_task():
    """
    Handle the add task menu option.

    Returns:
        None
    """
    print("\n--- ADD NEW TASK ---")

    title = get_user_input("Enter task title: ")

    if not title:
        print("❌ Title cannot be empty. Please try again.\n")
        return

    description = get_user_input("Enter task description (optional): ")

    new_task = add_task(tasks, title, description)
    print(f"✅ Task added successfully! (ID: {new_task['id']})\n")


def handle_view_tasks():
    """
    Handle the view tasks menu option.

    Returns:
        None
    """
    view_tasks(tasks)


def handle_update_task():
    """
    Handle the update task menu option.

    Returns:
        None
    """
    print("\n--- UPDATE TASK ---")

    task_id = get_task_id_input()
    if task_id is None:
        return

    task = find_task_by_id(tasks, task_id)
    if task is None:
        print("❌ Task not found. Please check the ID and try again.\n")
        return

    print(f"\nCurrent title: {task['title']}")
    new_title = get_user_input("Enter new title (or press Enter to keep current): ")

    print(f"Current description: {task['description']}")
    new_description = get_user_input("Enter new description (or press Enter to keep current): ")

    # Only update if user provided new values
    title_to_update = new_title if new_title else None
    description_to_update = new_description if new_description else None

    if title_to_update is None and description_to_update is None:
        print("ℹ️  No changes made.\n")
        return

    if update_task(tasks, task_id, title_to_update, description_to_update):
        print("✅ Task updated successfully!\n")


def handle_delete_task():
    """
    Handle the delete task menu option.

    Returns:
        None
    """
    print("\n--- DELETE TASK ---")

    task_id = get_task_id_input()
    if task_id is None:
        return

    if delete_task(tasks, task_id):
        print("✅ Task deleted successfully!\n")


def handle_toggle_completion():
    """
    Handle the toggle completion menu option.

    Returns:
        None
    """
    print("\n--- MARK COMPLETE/INCOMPLETE ---")

    task_id = get_task_id_input()
    if task_id is None:
        return

    task = find_task_by_id(tasks, task_id)
    if task is None:
        print("❌ Task not found. Please check the ID and try again.\n")
        return

    if toggle_completion(tasks, task_id):
        new_status = "complete" if task["completed"] else "incomplete"
        print(f"✅ Task marked as {new_status}!\n")


# ============================================================================
# MAIN APPLICATION
# ============================================================================

def main():
    """
    Main application loop.

    Displays menu, processes user input, and executes corresponding actions.
    Continues until user selects exit option.

    Returns:
        None
    """
    print("\n🎉 Welcome to Todo App - Phase I!")
    print("Manage your tasks with simple console commands.\n")

    while True:
        display_menu()
        choice = get_user_input("\nEnter your choice (1-6): ")

        if choice == "1":
            handle_add_task()
        elif choice == "2":
            handle_view_tasks()
        elif choice == "3":
            handle_update_task()
        elif choice == "4":
            handle_delete_task()
        elif choice == "5":
            handle_toggle_completion()
        elif choice == "6":
            print("\n👋 Thank you for using Todo App! Goodbye.\n")
            break
        else:
            print("❌ Invalid option. Please select 1-6.\n")


if __name__ == "__main__":
    main()
