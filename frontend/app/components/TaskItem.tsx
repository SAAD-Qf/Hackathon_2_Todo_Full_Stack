/**
 * TaskItem Component
 * Displays a single task with all its details and action buttons.
 */

'use client';

import { Task } from '@/lib/types';

interface TaskItemProps {
  task: Task;
  onToggleComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const priorityColors = {
  low: 'bg-blue-50 text-blue-700 border-blue-200',
  medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  high: 'bg-red-50 text-red-700 border-red-200',
};

export default function TaskItem({ task, onToggleComplete, onEdit, onDelete }: TaskItemProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !task.completed;

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow ${
      task.completed ? 'opacity-60 border-gray-200' : 'border-gray-200'
    }`}>
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={task.completed}
          onChange={onToggleComplete}
          className="mt-1 h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
        />

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          {/* Title and Priority */}
          <div className="flex items-center gap-2 mb-2">
            <h3 className={`text-lg font-semibold ${
              task.completed ? 'line-through text-gray-500' : 'text-gray-900'
            }`}>
              {task.title}
            </h3>
            <span className={`px-2 py-1 text-xs font-medium rounded border ${
              priorityColors[task.priority]
            }`}>
              {task.priority}
            </span>
          </div>

          {/* Description */}
          {task.description && (
            <p className={`text-sm mb-3 ${
              task.completed ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {task.description}
            </p>
          )}

          {/* Tags */}
          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {task.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded border border-gray-200"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Due Date */}
          {task.due_date && (
            <div className={`text-sm mb-2 ${
              isOverdue ? 'text-red-600 font-semibold' : 'text-gray-500'
            }`}>
              {isOverdue && '⚠️ '}
              Due: {formatDate(task.due_date)}
            </div>
          )}

          {/* Timestamps */}
          <div className="text-xs text-gray-400">
            Created: {formatDate(task.created_at)}
            {task.updated_at !== task.created_at && (
              <> • Updated: {formatDate(task.updated_at)}</>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 rounded border border-indigo-200 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded border border-red-200 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
