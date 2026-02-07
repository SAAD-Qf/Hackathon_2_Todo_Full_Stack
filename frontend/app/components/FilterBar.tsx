/**
 * FilterBar Component
 * Controls for filtering tasks by status, priority, and tags.
 */

'use client';

import { Priority } from '@/lib/types';

interface FilterBarProps {
  status: string;
  priority: Priority | '';
  tag: string;
  availableTags: string[];
  onStatusChange: (status: string) => void;
  onPriorityChange: (priority: Priority | '') => void;
  onTagChange: (tag: string) => void;
  onClearFilters: () => void;
}

export default function FilterBar({
  status,
  priority,
  tag,
  availableTags,
  onStatusChange,
  onPriorityChange,
  onTagChange,
  onClearFilters,
}: FilterBarProps) {
  const hasActiveFilters = status !== 'all' || priority !== '' || tag !== '';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status Filter */}
        <div>
          <label htmlFor="status" className="block text-xs font-medium text-gray-600 mb-1">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Tasks</option>
            <option value="incomplete">Incomplete</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label htmlFor="priority" className="block text-xs font-medium text-gray-600 mb-1">
            Priority
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => onPriorityChange(e.target.value as Priority | '')}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Tag Filter */}
        <div>
          <label htmlFor="tag" className="block text-xs font-medium text-gray-600 mb-1">
            Tag
          </label>
          <select
            id="tag"
            value={tag}
            onChange={(e) => onTagChange(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Tags</option>
            {availableTags.map((t) => (
              <option key={t} value={t}>
                #{t}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
