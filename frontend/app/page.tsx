/**
 * Home Page - Main Todo Application Interface
 * Orchestrates all components and manages application state.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Task, TaskInput, Priority } from '@/lib/types';
import { createTask, getTasks, updateTask, deleteTask, toggleComplete } from '@/lib/api';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import SearchBar from './components/SearchBar';
import FilterBar from './components/FilterBar';
import SortControls from './components/SortControls';

export default function Home() {
  // State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  // Filters and search
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [priority, setPriority] = useState<Priority | ''>('');
  const [tag, setTag] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // Fetch tasks with current filters
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getTasks({
        search: search || undefined,
        status: status !== 'all' ? (status as 'completed' | 'incomplete') : undefined,
        priority: priority || undefined,
        tag: tag || undefined,
        sort_by: sortBy as any,
        sort_order: sortOrder as 'asc' | 'desc',
      });

      setTasks(response.tasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [search, status, priority, tag, sortBy, sortOrder]);

  // Fetch tasks on mount and when filters change
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Get unique tags from all tasks
  const availableTags = Array.from(
    new Set(tasks.flatMap(task => task.tags))
  ).sort();

  // Handlers
  const handleCreateTask = async (taskData: TaskInput) => {
    try {
      await createTask(taskData);
      setShowForm(false);
      fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    }
  };

  const handleUpdateTask = async (taskData: TaskInput) => {
    if (!editingTask) return;

    try {
      await updateTask(editingTask.id, taskData);
      setEditingTask(undefined);
      setShowForm(false);
      fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  const handleDeleteTask = async (id: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await deleteTask(id);
      fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  const handleToggleComplete = async (id: number) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    try {
      await toggleComplete(id, !task.completed);
      fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle task');
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingTask(undefined);
  };

  const handleClearFilters = () => {
    setStatus('all');
    setPriority('');
    setTag('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📝 Todo App</h1>
              <p className="text-sm text-gray-500 mt-1">Phase II - Full-Stack Web Application</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {showForm ? 'Cancel' : '+ New Task'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-700 hover:text-red-900"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Task Form */}
        {showForm && (
          <div className="mb-6">
            <TaskForm
              task={editingTask}
              onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
              onCancel={handleCancelForm}
            />
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar onSearch={setSearch} />
        </div>

        {/* Filters and Sort */}
        <div className="mb-6 space-y-4">
          <FilterBar
            status={status}
            priority={priority}
            tag={tag}
            availableTags={availableTags}
            onStatusChange={setStatus}
            onPriorityChange={setPriority}
            onTagChange={setTag}
            onClearFilters={handleClearFilters}
          />

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {loading ? 'Loading...' : `${tasks.length} task${tasks.length !== 1 ? 's' : ''}`}
            </div>
            <SortControls
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortByChange={setSortBy}
              onSortOrderChange={setSortOrder}
            />
          </div>
        </div>

        {/* Task List */}
        <TaskList
          tasks={tasks}
          loading={loading}
          onToggleComplete={handleToggleComplete}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            Built with Next.js, FastAPI, SQLModel, and Neon Postgres
          </p>
        </div>
      </footer>
    </div>
  );
}
