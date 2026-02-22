/**
 * API client for Todo backend.
 * Provides typed functions for all API endpoints.
 */

import { Task, TaskInput, TaskFilters, TaskListResponse } from './types';
import { getSession } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function getAuthHeaders() {
  const session = await getSession();
  const headers: { [key: string]: string } = {
    'Content-Type': 'application/json',
  };
  if (session?.accessToken) {
    headers['Authorization'] = `Bearer ${session.accessToken}`;
  }
  return headers;
}

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
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers,
    body: JSON.stringify(task),
  });

  return handleResponse<Task>(response);
}

/**
 * Get list of tasks with optional filters.
 */
export async function getTasks(filters?: TaskFilters): Promise<TaskListResponse> {
  const headers = await getAuthHeaders();
  const params = new URLSearchParams();

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
  }

  const url = `${API_BASE_URL}/tasks${params.toString() ? `?${params}` : ''}`;
  const response = await fetch(url, { headers });

  return handleResponse<TaskListResponse>(response);
}

/**
 * Get a single task by ID.
 */
export async function getTask(id: number): Promise<Task> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, { headers });
  return handleResponse<Task>(response);
}

/**
 * Update an existing task.
 */
export async function updateTask(id: number, task: Partial<TaskInput>): Promise<Task> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(task),
  });

  return handleResponse<Task>(response);
}

/**
 * Delete a task by ID.
 */
export async function deleteTask(id: number): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
    headers,
  });

  return handleResponse<void>(response);
}

/**
 * Toggle task completion status.
 */
export async function toggleComplete(id: number, completed: boolean): Promise<Task> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/tasks/${id}/complete`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ completed }),
  });

  return handleResponse<Task>(response);
}


