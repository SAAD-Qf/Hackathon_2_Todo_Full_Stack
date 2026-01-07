# MCP Tools Implementation Specification

**Feature**: AI Todo Chatbot - MCP Tools Layer
**Created**: 2026-01-07
**Status**: Implementation Ready
**Constitution**: Phase III (v3.0.0)

## Overview

This document specifies the implementation of MCP (Model Context Protocol) tools that serve as the exclusive interface between the AI agent and the FastAPI backend. Each tool validates inputs, calls backend APIs, and returns structured responses.

**Critical Constraint**: MCP tools are the ONLY way the agent can interact with the backend. No direct API access is permitted.

---

## Technology Stack

- **MCP SDK**: `@modelcontextprotocol/sdk` (Official MCP SDK)
- **Runtime**: Node.js 18+ or Bun
- **Language**: TypeScript (strict mode)
- **HTTP Client**: `fetch` API or `axios`
- **Validation**: JSON Schema (built into MCP SDK)
- **Transport**: stdio or HTTP (configurable)

---

## Project Structure

```
mcp-server/
├── src/
│   ├── index.ts              # MCP server entry point
│   ├── tools/
│   │   ├── create-task.ts    # Create task tool
│   │   ├── update-task.ts    # Update task tool
│   │   ├── list-tasks.ts     # List tasks tool
│   │   ├── mark-complete.ts  # Mark complete tool
│   │   ├── delete-task.ts    # Delete task tool
│   │   └── reschedule-task.ts # Reschedule task tool
│   ├── api/
│   │   └── client.ts         # Backend API client
│   ├── types/
│   │   └── index.ts          # TypeScript types
│   └── utils/
│       ├── validation.ts     # Input validation helpers
│       └── errors.ts         # Error handling
├── package.json
├── tsconfig.json
└── README.md
```

---

## MCP Server Configuration

### package.json

```json
{
  "name": "todo-mcp-server",
  "version": "1.0.0",
  "description": "MCP server for Todo application",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "dev": "tsx watch src/index.ts",
    "start": "node dist/index.js",
    "test": "vitest"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "tsx": "^4.7.0",
    "typescript": "^5.3.3",
    "vitest": "^1.0.0"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## Backend API Client

### src/api/client.ts

```typescript
/**
 * Backend API client for MCP tools
 * Handles all HTTP communication with FastAPI backend
 */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export class BackendApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.BACKEND_API_URL || 'http://localhost:8000/api/v1') {
    this.baseUrl = baseUrl;
  }

  /**
   * Generic request handler with error handling
   */
  private async request<T>(
    method: string,
    endpoint: string,
    body?: any
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || `HTTP ${response.status}: ${response.statusText}`,
          code: 'API_ERROR',
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'NETWORK_ERROR',
      };
    }
  }

  /**
   * Create a new task
   */
  async createTask(params: {
    title: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high';
    tags?: string[];
    due_date?: string;
  }) {
    return this.request('POST', '/tasks', params);
  }

  /**
   * Update an existing task
   */
  async updateTask(taskId: number, params: {
    title?: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high';
    tags?: string[];
    due_date?: string;
  }) {
    return this.request('PUT', `/tasks/${taskId}`, params);
  }

  /**
   * List tasks with filters
   */
  async listTasks(params?: {
    search?: string;
    status?: 'all' | 'completed' | 'incomplete';
    priority?: 'low' | 'medium' | 'high';
    tag?: string;
    sort_by?: 'due_date' | 'priority' | 'title' | 'created_at';
    sort_order?: 'asc' | 'desc';
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    const endpoint = query ? `/tasks?${query}` : '/tasks';
    return this.request('GET', endpoint);
  }

  /**
   * Get a single task by ID
   */
  async getTask(taskId: number) {
    return this.request('GET', `/tasks/${taskId}`);
  }

  /**
   * Mark task as complete or incomplete
   */
  async markComplete(taskId: number, completed: boolean = true) {
    return this.request('PATCH', `/tasks/${taskId}/complete`, { completed });
  }

  /**
   * Delete a task
   */
  async deleteTask(taskId: number) {
    return this.request('DELETE', `/tasks/${taskId}`);
  }
}
```

---

## Tool Implementations

### src/tools/create-task.ts

```typescript
import { z } from 'zod';
import { BackendApiClient } from '../api/client.js';

/**
 * MCP Tool: create_task
 * Creates a new task from natural language input
 */

export const createTaskSchema = z.object({
  title: z.string().min(1).max(200).describe('Task title (1-200 characters)'),
  description: z.string().optional().default('').describe('Optional task description'),
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium').describe('Task priority level'),
  tags: z.array(z.string().min(1).max(50)).max(10).optional().default([]).describe('Optional categorization tags'),
  due_date: z.string().datetime().nullable().optional().describe('Optional due date in ISO 8601 format'),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export async function createTask(input: CreateTaskInput, apiClient: BackendApiClient) {
  // Validate input
  const validated = createTaskSchema.parse(input);

  // Call backend API
  const response = await apiClient.createTask(validated);

  if (!response.success) {
    return {
      success: false,
      error: response.error,
      code: response.code,
    };
  }

  return {
    success: true,
    task: response.data,
    message: 'Task created successfully',
  };
}

export const createTaskTool = {
  name: 'create_task',
  description: 'Create a new task with title, description, priority, tags, and due date',
  inputSchema: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        description: 'Task title (1-200 characters)',
        minLength: 1,
        maxLength: 200,
      },
      description: {
        type: 'string',
        description: 'Optional task description',
        default: '',
      },
      priority: {
        type: 'string',
        enum: ['low', 'medium', 'high'],
        description: 'Task priority level',
        default: 'medium',
      },
      tags: {
        type: 'array',
        items: {
          type: 'string',
          minLength: 1,
          maxLength: 50,
        },
        description: 'Optional categorization tags',
        maxItems: 10,
        default: [],
      },
      due_date: {
        type: 'string',
        format: 'date-time',
        description: 'Optional due date in ISO 8601 format',
        nullable: true,
      },
    },
    required: ['title'],
  },
};
```

### src/tools/update-task.ts

```typescript
import { z } from 'zod';
import { BackendApiClient } from '../api/client.js';

/**
 * MCP Tool: update_task
 * Updates an existing task's fields
 */

export const updateTaskSchema = z.object({
  task_id: z.number().int().positive().describe('ID of the task to update'),
  title: z.string().min(1).max(200).optional().describe('New task title'),
  description: z.string().optional().describe('New task description'),
  priority: z.enum(['low', 'medium', 'high']).optional().describe('New priority level'),
  tags: z.array(z.string().min(1).max(50)).max(10).optional().describe('New tags'),
  due_date: z.string().datetime().nullable().optional().describe('New due date in ISO 8601 format'),
});

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export async function updateTask(input: UpdateTaskInput, apiClient: BackendApiClient) {
  // Validate input
  const validated = updateTaskSchema.parse(input);
  const { task_id, ...updateFields } = validated;

  // Call backend API
  const response = await apiClient.updateTask(task_id, updateFields);

  if (!response.success) {
    return {
      success: false,
      error: response.error,
      code: response.code,
    };
  }

  return {
    success: true,
    task: response.data,
    message: 'Task updated successfully',
  };
}

export const updateTaskTool = {
  name: 'update_task',
  description: 'Update an existing task\'s fields (title, description, priority, tags, due_date)',
  inputSchema: {
    type: 'object',
    properties: {
      task_id: {
        type: 'integer',
        description: 'ID of the task to update',
        minimum: 1,
      },
      title: {
        type: 'string',
        description: 'New task title',
        minLength: 1,
        maxLength: 200,
      },
      description: {
        type: 'string',
        description: 'New task description',
      },
      priority: {
        type: 'string',
        enum: ['low', 'medium', 'high'],
        description: 'New priority level',
      },
      tags: {
        type: 'array',
        items: {
          type: 'string',
          minLength: 1,
          maxLength: 50,
        },
        description: 'New tags',
        maxItems: 10,
      },
      due_date: {
        type: 'string',
        format: 'date-time',
        description: 'New due date in ISO 8601 format',
        nullable: true,
      },
    },
    required: ['task_id'],
  },
};
```

### src/tools/list-tasks.ts

```typescript
import { z } from 'zod';
import { BackendApiClient } from '../api/client.js';

/**
 * MCP Tool: list_tasks
 * Lists tasks with optional filters and search
 */

export const listTasksSchema = z.object({
  search: z.string().optional().describe('Search text in title and description'),
  status: z.enum(['all', 'completed', 'incomplete']).optional().default('all').describe('Filter by completion status'),
  priority: z.enum(['low', 'medium', 'high']).optional().describe('Filter by priority level'),
  tag: z.string().optional().describe('Filter by tag (exact match)'),
  sort_by: z.enum(['due_date', 'priority', 'title', 'created_at']).optional().default('created_at').describe('Sort field'),
  sort_order: z.enum(['asc', 'desc']).optional().default('desc').describe('Sort direction'),
  limit: z.number().int().min(1).max(100).optional().default(50).describe('Maximum number of results'),
});

export type ListTasksInput = z.infer<typeof listTasksSchema>;

export async function listTasks(input: ListTasksInput, apiClient: BackendApiClient) {
  // Validate input
  const validated = listTasksSchema.parse(input);

  // Call backend API
  const response = await apiClient.listTasks(validated);

  if (!response.success) {
    return {
      success: false,
      error: response.error,
      code: response.code,
    };
  }

  const tasks = Array.isArray(response.data) ? response.data : [];
  return {
    success: true,
    tasks,
    total: tasks.length,
    message: `Found ${tasks.length} task(s)`,
  };
}

export const listTasksTool = {
  name: 'list_tasks',
  description: 'List tasks with optional filters (search, status, priority, tag) and sorting',
  inputSchema: {
    type: 'object',
    properties: {
      search: {
        type: 'string',
        description: 'Search text in title and description',
      },
      status: {
        type: 'string',
        enum: ['all', 'completed', 'incomplete'],
        description: 'Filter by completion status',
        default: 'all',
      },
      priority: {
        type: 'string',
        enum: ['low', 'medium', 'high'],
        description: 'Filter by priority level',
      },
      tag: {
        type: 'string',
        description: 'Filter by tag (exact match)',
      },
      sort_by: {
        type: 'string',
        enum: ['due_date', 'priority', 'title', 'created_at'],
        description: 'Sort field',
        default: 'created_at',
      },
      sort_order: {
        type: 'string',
        enum: ['asc', 'desc'],
        description: 'Sort direction',
        default: 'desc',
      },
      limit: {
        type: 'integer',
        description: 'Maximum number of results',
        minimum: 1,
        maximum: 100,
        default: 50,
      },
    },
  },
};
```

### src/tools/mark-complete.ts

```typescript
import { z } from 'zod';
import { BackendApiClient } from '../api/client.js';

/**
 * MCP Tool: mark_complete
 * Toggles task completion status
 */

export const markCompleteSchema = z.object({
  task_id: z.number().int().positive().describe('ID of the task to mark complete/incomplete'),
  completed: z.boolean().optional().default(true).describe('New completion status'),
});

export type MarkCompleteInput = z.infer<typeof markCompleteSchema>;

export async function markComplete(input: MarkCompleteInput, apiClient: BackendApiClient) {
  // Validate input
  const validated = markCompleteSchema.parse(input);

  // Call backend API
  const response = await apiClient.markComplete(validated.task_id, validated.completed);

  if (!response.success) {
    return {
      success: false,
      error: response.error,
      code: response.code,
    };
  }

  return {
    success: true,
    task: response.data,
    message: validated.completed ? 'Task marked as complete' : 'Task marked as incomplete',
  };
}

export const markCompleteTool = {
  name: 'mark_complete',
  description: 'Mark a task as complete or incomplete',
  inputSchema: {
    type: 'object',
    properties: {
      task_id: {
        type: 'integer',
        description: 'ID of the task to mark complete/incomplete',
        minimum: 1,
      },
      completed: {
        type: 'boolean',
        description: 'New completion status',
        default: true,
      },
    },
    required: ['task_id'],
  },
};
```

### src/tools/delete-task.ts

```typescript
import { z } from 'zod';
import { BackendApiClient } from '../api/client.js';

/**
 * MCP Tool: delete_task
 * Deletes a task by ID
 */

export const deleteTaskSchema = z.object({
  task_id: z.number().int().positive().describe('ID of the task to delete'),
});

export type DeleteTaskInput = z.infer<typeof deleteTaskSchema>;

export async function deleteTask(input: DeleteTaskInput, apiClient: BackendApiClient) {
  // Validate input
  const validated = deleteTaskSchema.parse(input);

  // Call backend API
  const response = await apiClient.deleteTask(validated.task_id);

  if (!response.success) {
    return {
      success: false,
      error: response.error,
      code: response.code,
    };
  }

  return {
    success: true,
    message: 'Task deleted successfully',
  };
}

export const deleteTaskTool = {
  name: 'delete_task',
  description: 'Delete a task by ID (destructive action)',
  inputSchema: {
    type: 'object',
    properties: {
      task_id: {
        type: 'integer',
        description: 'ID of the task to delete',
        minimum: 1,
      },
    },
    required: ['task_id'],
  },
};
```

### src/tools/reschedule-task.ts

```typescript
import { z } from 'zod';
import { BackendApiClient } from '../api/client.js';

/**
 * MCP Tool: reschedule_task
 * Updates only the due date of a task (convenience wrapper)
 */

export const rescheduleTaskSchema = z.object({
  task_id: z.number().int().positive().describe('ID of the task to reschedule'),
  due_date: z.string().datetime().nullable().describe('New due date in ISO 8601 format'),
});

export type RescheduleTaskInput = z.infer<typeof rescheduleTaskSchema>;

export async function rescheduleTask(input: RescheduleTaskInput, apiClient: BackendApiClient) {
  // Validate input
  const validated = rescheduleTaskSchema.parse(input);

  // Call backend API (using update endpoint with only due_date)
  const response = await apiClient.updateTask(validated.task_id, {
    due_date: validated.due_date,
  });

  if (!response.success) {
    return {
      success: false,
      error: response.error,
      code: response.code,
    };
  }

  return {
    success: true,
    task: response.data,
    message: 'Task rescheduled successfully',
  };
}

export const rescheduleTaskTool = {
  name: 'reschedule_task',
  description: 'Update only the due date of a task',
  inputSchema: {
    type: 'object',
    properties: {
      task_id: {
        type: 'integer',
        description: 'ID of the task to reschedule',
        minimum: 1,
      },
      due_date: {
        type: 'string',
        format: 'date-time',
        description: 'New due date in ISO 8601 format',
        nullable: true,
      },
    },
    required: ['task_id', 'due_date'],
  },
};
```

---

## MCP Server Entry Point

### src/index.ts

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { BackendApiClient } from './api/client.js';
import { createTask, createTaskTool } from './tools/create-task.js';
import { updateTask, updateTaskTool } from './tools/update-task.js';
import { listTasks, listTasksTool } from './tools/list-tasks.js';
import { markComplete, markCompleteTool } from './tools/mark-complete.js';
import { deleteTask, deleteTaskTool } from './tools/delete-task.js';
import { rescheduleTask, rescheduleTaskTool } from './tools/reschedule-task.js';

/**
 * MCP Server for Todo Application
 * Provides tools for AI agents to interact with the Todo backend
 */

const server = new Server(
  {
    name: 'todo-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Initialize API client
const apiClient = new BackendApiClient();

// Register all tools
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      createTaskTool,
      updateTaskTool,
      listTasksTool,
      markCompleteTool,
      deleteTaskTool,
      rescheduleTaskTool,
    ],
  };
});

// Handle tool calls
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'create_task':
        return { content: [{ type: 'text', text: JSON.stringify(await createTask(args, apiClient)) }] };
      case 'update_task':
        return { content: [{ type: 'text', text: JSON.stringify(await updateTask(args, apiClient)) }] };
      case 'list_tasks':
        return { content: [{ type: 'text', text: JSON.stringify(await listTasks(args, apiClient)) }] };
      case 'mark_complete':
        return { content: [{ type: 'text', text: JSON.stringify(await markComplete(args, apiClient)) }] };
      case 'delete_task':
        return { content: [{ type: 'text', text: JSON.stringify(await deleteTask(args, apiClient)) }] };
      case 'reschedule_task':
        return { content: [{ type: 'text', text: JSON.stringify(await rescheduleTask(args, apiClient)) }] };
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          code: 'TOOL_ERROR',
        }),
      }],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Todo MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
```

---

## Environment Configuration

### .env.example

```env
# Backend API URL
BACKEND_API_URL=http://localhost:8000/api/v1

# Logging level
LOG_LEVEL=info
```

---

## Testing Strategy

### Unit Tests (Vitest)

```typescript
// tests/tools/create-task.test.ts
import { describe, it, expect, vi } from 'vitest';
import { createTask } from '../../src/tools/create-task';
import { BackendApiClient } from '../../src/api/client';

describe('create_task tool', () => {
  it('should create a task successfully', async () => {
    const mockClient = {
      createTask: vi.fn().mockResolvedValue({
        success: true,
        data: {
          id: 1,
          title: 'Test task',
          priority: 'medium',
          completed: false,
        },
      }),
    } as any;

    const result = await createTask({ title: 'Test task' }, mockClient);

    expect(result.success).toBe(true);
    expect(result.task.title).toBe('Test task');
    expect(mockClient.createTask).toHaveBeenCalledWith({
      title: 'Test task',
      description: '',
      priority: 'medium',
      tags: [],
      due_date: undefined,
    });
  });

  it('should handle validation errors', async () => {
    const mockClient = {} as any;

    await expect(createTask({ title: '' }, mockClient)).rejects.toThrow();
  });
});
```

---

## Deployment

### Docker Support

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
```

### Docker Compose Integration

```yaml
# docker-compose.yml (add to existing)
services:
  mcp-server:
    build: ./mcp-server
    environment:
      - BACKEND_API_URL=http://backend:8000/api/v1
    depends_on:
      - backend
```

---

## Success Criteria

- ✅ All 6 MCP tools implemented with JSON Schema validation
- ✅ All tools call backend API correctly
- ✅ All tools handle errors gracefully
- ✅ All tools return structured responses
- ✅ Type safety enforced with TypeScript
- ✅ Unit tests for all tools
- ✅ Integration tests with backend API
- ✅ MCP server runs on stdio transport
- ✅ Server can be discovered by OpenAI Agents SDK

---

**Version**: 1.0.0
**Last Updated**: 2026-01-07
**Status**: Implementation Ready
