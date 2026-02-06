/**
 * API client for Todo backend.
 * Provides typed functions for all API endpoints.
 */

import { Task, TaskInput, TaskFilters, TaskListResponse } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

/**
 * Handle API response and errors.
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error occurred' }));
    throw new Error(error.detail || `HTTP ${response.status}: ${response.statusText}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

/**
 * Create a new task.
 */
export async function createTask(task: TaskInput): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  });

  return handleResponse<Task>(response);
}

/**
 * Get list of tasks with optional filters.
 */
export async function getTasks(filters?: TaskFilters): Promise<TaskListResponse> {
  const params = new URLSearchParams();

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
  }

  const url = `${API_BASE_URL}/tasks${params.toString() ? `?${params}` : ''}`;
  const response = await fetch(url);

  return handleResponse<TaskListResponse>(response);
}

/**
 * Get a single task by ID.
 */
export async function getTask(id: number): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`);
  return handleResponse<Task>(response);
}

/**
 * Update an existing task.
 */
export async function updateTask(id: number, task: Partial<TaskInput>): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  });

  return handleResponse<Task>(response);
}

/**
 * Delete a task by ID.
 */
export async function deleteTask(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
  });

  return handleResponse<void>(response);
}

/**
 * Toggle task completion status.
 */
export async function toggleComplete(id: number, completed: boolean): Promise<Task> {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}/complete`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ completed }),
  });

  return handleResponse<Task>(response);
}
