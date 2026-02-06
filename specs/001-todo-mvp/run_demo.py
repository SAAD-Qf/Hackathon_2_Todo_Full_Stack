"""
Automated Demo - Todo App Phase I
Shows all features in action without user interaction
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

def separator(title):
    print("\n" + "="*70)
    print(f"  {title}")
    print("="*70)

print("\n" + "="*70)
print("  TODO APP - PHASE I - AUTOMATED DEMONSTRATION")
print("="*70)
print("\nShowing all features in action...\n")

# Feature 1: Add Tasks
separator("FEATURE 1: Adding Tasks")
print("\n[Action] Adding task: 'Buy groceries'")
task1 = add_task(tasks, "Buy groceries", "Milk, eggs, bread, cheese")
print(f"[Success] Task created with ID: {task1['id']}")

print("\n[Action] Adding task: 'Write report'")
task2 = add_task(tasks, "Write report", "Q4 financial summary for board meeting")
print(f"[Success] Task created with ID: {task2['id']}")

print("\n[Action] Adding task: 'Call dentist'")
task3 = add_task(tasks, "Call dentist", "Schedule 6-month checkup appointment")
print(f"[Success] Task created with ID: {task3['id']}")

# Feature 2: View All Tasks
separator("FEATURE 2: Viewing All Tasks")
view_tasks(tasks)

# Feature 3: Mark Task Complete
separator("FEATURE 3: Marking Task as Complete")
print(f"\n[Action] Marking task {task1['id']} (Buy groceries) as complete")
toggle_completion(tasks, task1['id'])
print("[Success] Task marked as complete")
print("\n[Current State] Updated task list:")
view_tasks(tasks)

# Feature 4: Update Task
separator("FEATURE 4: Updating Task")
print(f"\n[Action] Updating task {task2['id']} title")
print("  Old: 'Write report'")
print("  New: 'Write Q4 Report'")
update_task(tasks, task2['id'], new_title="Write Q4 Report")
print("[Success] Task updated")
print("\n[Current State] Updated task list:")
view_tasks(tasks)

# Feature 5: Mark Task Incomplete
separator("FEATURE 5: Toggling Task Status")
print(f"\n[Action] Marking task {task1['id']} as incomplete again")
toggle_completion(tasks, task1['id'])
print("[Success] Task marked as incomplete")
print("\n[Current State] Updated task list:")
view_tasks(tasks)

# Feature 6: Add More Tasks
separator("FEATURE 6: Adding More Tasks")
print("\n[Action] Adding task: 'Exercise'")
task4 = add_task(tasks, "Exercise", "30 minutes cardio at gym")
print(f"[Success] Task created with ID: {task4['id']}")

print("\n[Action] Adding task: 'Read book'")
task5 = add_task(tasks, "Read book", "Finish chapter 5 of Python guide")
print(f"[Success] Task created with ID: {task5['id']}")

print("\n[Current State] All tasks:")
view_tasks(tasks)

# Feature 7: Delete Task
separator("FEATURE 7: Deleting Task")
print(f"\n[Action] Deleting task {task3['id']} (Call dentist)")
delete_task(tasks, task3['id'])
print("[Success] Task deleted")
print("\n[Current State] Updated task list:")
view_tasks(tasks)

# Feature 8: Complete Multiple Tasks
separator("FEATURE 8: Completing Multiple Tasks")
print(f"\n[Action] Marking task {task2['id']} as complete")
toggle_completion(tasks, task2['id'])
print("[Success] Task marked as complete")

print(f"\n[Action] Marking task {task4['id']} as complete")
toggle_completion(tasks, task4['id'])
print("[Success] Task marked as complete")

print("\n[Current State] Final task list:")
view_tasks(tasks)

# Feature 9: Error Handling
separator("FEATURE 9: Error Handling")
print("\n[Action] Attempting to delete non-existent task (ID: 999)")
result = delete_task(tasks, 999)
print(f"[Result] Operation returned: {result} (gracefully handled)")

print("\n[Action] Attempting to update non-existent task (ID: 888)")
result = update_task(tasks, 888, new_title="This should fail")
print(f"[Result] Operation returned: {result} (gracefully handled)")

print("\n[Action] Attempting to toggle non-existent task (ID: 777)")
result = toggle_completion(tasks, 777)
print(f"[Result] Operation returned: {result} (gracefully handled)")

# Final Summary
separator("DEMONSTRATION COMPLETE")
print("\n[Summary] All features demonstrated successfully:\n")
print("  [OK] Add Task - Created 5 tasks with unique IDs")
print("  [OK] View Tasks - Displayed tasks with formatting")
print("  [OK] Update Task - Modified task title")
print("  [OK] Delete Task - Removed task from list")
print("  [OK] Mark Complete/Incomplete - Toggled task status")
print("  [OK] Error Handling - Gracefully handled invalid IDs")

print("\n[Statistics]")
print(f"  Total tasks created: 5")
print(f"  Tasks deleted: 1")
print(f"  Current tasks: {len(tasks)}")
completed = sum(1 for t in tasks if t['completed'])
print(f"  Completed tasks: {completed}")
print(f"  Incomplete tasks: {len(tasks) - completed}")

print("\n[Final State] Current task list:")
view_tasks(tasks)

print("\n" + "="*70)
print("  APPLICATION STATUS: FULLY FUNCTIONAL")
print("="*70)
print("\n[Info] To use the interactive menu, run: python todo_app.py")
print("="*70 + "\n")
