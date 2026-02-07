/**
 * TaskForm Component
 * Form for creating and editing tasks.
 */

'use client';

import { useState, useEffect } from 'react';
import { Task, TaskInput, Priority } from '@/lib/types';

interface TaskFormProps {
  task?: Task;
  onSubmit: (task: TaskInput) => void;
  onCancel: () => void;
}

export default function TaskForm({ task, onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState<Priority>(task?.priority || 'medium');
  const [tags, setTags] = useState(task?.tags.join(', ') || '');
  const [dueDate, setDueDate] = useState(
    task?.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const taskData: TaskInput = {
      title: title.trim(),
      description: description.trim(),
      priority,
      tags: tags.split(',').map(t => t.trim()).filter(t => t.length > 0),
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
    };

    onSubmit(taskData);
  };

  const isValid = title.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {task ? 'Edit Task' : 'Create New Task'}
      </h2>

      {/* Title */}
      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Enter task title"
          required
          maxLength={200}
        />
        <p className="text-xs text-gray-500 mt-1">{title.length}/200 characters</p>
      </div>

      {/* Description */}
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Enter task description (optional)"
          rows={3}
        />
      </div>

      {/* Priority */}
      <div className="mb-4">
        <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
          Priority
        </label>
        <select
          id="priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {/* Tags */}
      <div className="mb-4">
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
          Tags
        </label>
        <input
          type="text"
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Enter tags separated by commas (e.g., work, urgent)"
        />
        <p className="text-xs text-gray-500 mt-1">Separate multiple tags with commas (max 10)</p>
      </div>

      {/* Due Date */}
      <div className="mb-6">
        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
          Due Date
        </label>
        <input
          type="datetime-local"
          id="dueDate"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={!isValid}
          className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {task ? 'Update Task' : 'Create Task'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
