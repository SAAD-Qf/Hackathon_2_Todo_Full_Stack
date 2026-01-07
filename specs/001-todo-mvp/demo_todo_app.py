"""
Demo script to showcase Todo App functionality
Simulates user interactions to demonstrate all features
"""

import sys
import io

# Configure UTF-8 encoding for Windows console
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

sys.path.insert(0, '.')

from todo_app import (
    tasks, add_task, view_tasks, update_task, delete_task, toggle_completion
)

def demo_separator(title):
    """Print a section separator"""
    print("\n" + "="*70)
    print(f"  {title}")
    print("="*70 + "\n")

def main():
    print("\n" + "="*70)
    print("  TODO APP - PHASE I - LIVE DEMONSTRATION")
    print("="*70)
    print("\nThis demo will showcase all features of the Todo App.\n")
    input("Press Enter to start the demo...")

    # Demo 1: Add Tasks
    demo_separator("DEMO 1: Adding Tasks")
    print("Adding task 1: 'Buy groceries'...")
    task1 = add_task(tasks, "Buy groceries", "Milk, eggs, bread, cheese")
    print(f"✅ Task added with ID: {task1['id']}\n")

    print("Adding task 2: 'Write report'...")
    task2 = add_task(tasks, "Write report", "Q4 financial summary for board meeting")
    print(f"✅ Task added with ID: {task2['id']}\n")

    print("Adding task 3: 'Call dentist'...")
    task3 = add_task(tasks, "Call dentist", "Schedule 6-month checkup appointment")
    print(f"✅ Task added with ID: {task3['id']}\n")

    input("Press Enter to continue...")

    # Demo 2: View All Tasks
    demo_separator("DEMO 2: Viewing All Tasks")
    view_tasks(tasks)
    input("Press Enter to continue...")

    # Demo 3: Mark Task Complete
    demo_separator("DEMO 3: Marking Task as Complete")
    print(f"Marking task {task1['id']} (Buy groceries) as complete...\n")
    toggle_completion(tasks, task1['id'])
    print("✅ Task marked as complete!\n")
    print("Updated task list:")
    view_tasks(tasks)
    input("Press Enter to continue...")

    # Demo 4: Update Task
    demo_separator("DEMO 4: Updating Task")
    print(f"Updating task {task2['id']} (Write report)...\n")
    print("Old title: 'Write report'")
    print("New title: 'Write Q4 Report'\n")
    update_task(tasks, task2['id'], new_title="Write Q4 Report")
    print("✅ Task updated!\n")
    print("Updated task list:")
    view_tasks(tasks)
    input("Press Enter to continue...")

    # Demo 5: Mark Task Incomplete
    demo_separator("DEMO 5: Marking Task as Incomplete")
    print(f"Marking task {task1['id']} (Buy groceries) as incomplete again...\n")
    toggle_completion(tasks, task1['id'])
    print("✅ Task marked as incomplete!\n")
    print("Updated task list:")
    view_tasks(tasks)
    input("Press Enter to continue...")

    # Demo 6: Add More Tasks
    demo_separator("DEMO 6: Adding More Tasks")
    print("Adding task 4: 'Exercise'...")
    task4 = add_task(tasks, "Exercise", "30 minutes cardio at gym")
    print(f"✅ Task added with ID: {task4['id']}\n")

    print("Adding task 5: 'Read book'...")
    task5 = add_task(tasks, "Read book", "Finish chapter 5 of Python guide")
    print(f"✅ Task added with ID: {task5['id']}\n")

    print("Current task list:")
    view_tasks(tasks)
    input("Press Enter to continue...")

    # Demo 7: Delete Task
    demo_separator("DEMO 7: Deleting Task")
    print(f"Deleting task {task3['id']} (Call dentist)...\n")
    delete_task(tasks, task3['id'])
    print("✅ Task deleted!\n")
    print("Updated task list:")
    view_tasks(tasks)
    input("Press Enter to continue...")

    # Demo 8: Mark Multiple Tasks Complete
    demo_separator("DEMO 8: Completing Multiple Tasks")
    print(f"Marking task {task2['id']} as complete...")
    toggle_completion(tasks, task2['id'])
    print(f"Marking task {task4['id']} as complete...")
    toggle_completion(tasks, task4['id'])
    print("\n✅ Tasks marked as complete!\n")
    print("Final task list:")
    view_tasks(tasks)
    input("Press Enter to continue...")

    # Demo 9: Error Handling
    demo_separator("DEMO 9: Error Handling")
    print("Attempting to delete non-existent task (ID: 999)...\n")
    result = delete_task(tasks, 999)
    print(f"Result: {result} (False = operation failed gracefully)\n")

    print("Attempting to update non-existent task (ID: 888)...\n")
    result = update_task(tasks, 888, new_title="This should fail")
    print(f"Result: {result} (False = operation failed gracefully)\n")

    input("Press Enter to continue...")

    # Final Summary
    demo_separator("DEMO COMPLETE - SUMMARY")
    print("✅ All features demonstrated successfully:\n")
    print("  1. ✅ Add Task - Created 5 tasks with unique IDs")
    print("  2. ✅ View Tasks - Displayed tasks with formatting")
    print("  3. ✅ Update Task - Modified task title")
    print("  4. ✅ Delete Task - Removed task from list")
    print("  5. ✅ Mark Complete/Incomplete - Toggled task status")
    print("  6. ✅ Error Handling - Gracefully handled invalid IDs")
    print("\n📊 Final Statistics:")
    print(f"  Total tasks created: 5")
    print(f"  Tasks deleted: 1")
    print(f"  Current tasks: {len(tasks)}")
    completed = sum(1 for t in tasks if t['completed'])
    print(f"  Completed tasks: {completed}")
    print(f"  Incomplete tasks: {len(tasks) - completed}")
    print("\n🎉 Todo App Phase I is fully functional!")
    print("\nFinal task list:")
    view_tasks(tasks)
    print("\n" + "="*70)
    print("  To use the interactive app, run: python todo_app.py")
    print("="*70 + "\n")

if __name__ == "__main__":
    main()
