/**
 * TypeScript types for Todo application.
 * Matches backend API schemas exactly.
 */

export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: number;
  title: string;
  description: string;
  priority: Priority;
  tags: string[];
  due_date: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface TaskInput {
  title: string;
  description?: string;
  priority?: Priority;
  tags?: string[];
  due_date?: string | null;
}

export interface TaskFilters {
  search?: string;
  status?: 'completed' | 'incomplete' | 'all';
  priority?: Priority;
  tag?: string;
  sort_by?: 'due_date' | 'priority' | 'title' | 'created_at';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface TaskListResponse {
  tasks: Task[];
  total: number;
  limit: number;
  offset: number;
}

export interface ApiError {
  detail: string;
}
