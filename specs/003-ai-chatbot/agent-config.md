# Agent Configuration Specification

**Feature**: AI Todo Chatbot - Agent Runtime Layer
**Created**: 2026-01-07
**Status**: Implementation Ready
**Constitution**: Phase III (v3.0.0)

## Overview

This document specifies the implementation of the AI agent using OpenAI Agents SDK. The agent parses natural language commands, extracts entities, selects appropriate MCP tools, and formats responses for users.

**Critical Constraint**: The agent MUST NOT access the backend API directly. All operations MUST go through MCP tools.

---

## Technology Stack

- **Agent SDK**: OpenAI Agents SDK
- **Runtime**: Node.js 18+ or Bun
- **Language**: TypeScript (strict mode)
- **Model**: GPT-4 or GPT-4 Turbo
- **Tools**: MCP protocol (stdio transport)
- **Date Parsing**: `chrono-node` library

---

## Project Structure

```
agent-runtime/
├── src/
│   ├── index.ts              # Agent runtime entry point
│   ├── agent/
│   │   ├── config.ts         # Agent configuration
│   │   ├── prompts.ts        # System prompts
│   │   └── handlers.ts       # Message handlers
│   ├── utils/
│   │   ├── date-parser.ts    # Natural language date parsing
│   │   ├── entity-extractor.ts # Entity extraction helpers
│   │   └── response-formatter.ts # Response formatting
│   └── types/
│       └── index.ts          # TypeScript types
├── package.json
├── tsconfig.json
└── README.md
```

---

## Agent Configuration

### package.json

```json
{
  "name": "todo-agent-runtime",
  "version": "1.0.0",
  "description": "AI agent runtime for Todo application",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "dev": "tsx watch src/index.ts",
    "start": "node dist/index.js",
    "test": "vitest"
  },
  "dependencies": {
    "@openai/agents-sdk": "^1.0.0",
    "chrono-node": "^2.7.0",
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

---

## System Prompt

### src/agent/prompts.ts

```typescript
/**
 * System prompt for the Todo AI agent
 * Defines agent behavior, constraints, and tool usage
 */

export const SYSTEM_PROMPT = `You are a helpful personal task management assistant. Your role is to help users manage their todo tasks through natural language conversation.

## Your Capabilities

You can help users:
1. Create new tasks with titles, descriptions, priorities, tags, and due dates
2. Update existing tasks (change any field)
3. List and search tasks with filters
4. Mark tasks as complete or incomplete
5. Delete tasks (with confirmation)
6. Reschedule tasks to new due dates
7. Perform bulk operations on multiple tasks

## Critical Rules

1. **Tool Usage**: You MUST use the provided MCP tools for ALL task operations. NEVER make up or simulate task data.
2. **No Direct Access**: You do NOT have direct access to the database or API. Use tools exclusively.
3. **Confirmation**: ALWAYS ask for confirmation before destructive actions (delete, bulk operations).
4. **Entity Extraction**: Extract task details from natural language carefully:
   - Title: The main action or task description
   - Due Date: Parse temporal expressions (tomorrow, next Friday, Jan 15)
   - Priority: Infer from keywords (urgent→high, important→high, low priority→low)
   - Tags: Extract explicit tags or infer categories
5. **Error Handling**: If a tool call fails, explain the error in user-friendly terms and suggest alternatives.
6. **Clarity**: If the user's intent is ambiguous, ask clarifying questions before calling tools.

## Available Tools

You have access to these MCP tools:
- **create_task**: Create a new task
- **update_task**: Update an existing task's fields
- **list_tasks**: List tasks with filters and search
- **mark_complete**: Mark a task as complete or incomplete
- **delete_task**: Delete a task by ID
- **reschedule_task**: Update only the due date of a task

## Date Parsing Guidelines

When users mention dates, parse them as follows:
- "tomorrow" → next day at 9:00 AM
- "tomorrow morning" → next day at 9:00 AM
- "tomorrow afternoon" → next day at 2:00 PM
- "tomorrow evening" → next day at 6:00 PM
- "next Friday" → next Friday at 9:00 AM
- "Friday at 2 PM" → next Friday at 2:00 PM
- "in 3 days" → 3 days from now at 9:00 AM
- "next week" → 7 days from now at 9:00 AM

Default to 9:00 AM if no time is specified.

## Response Style

- Be friendly and conversational
- Use emojis sparingly for visual clarity (✅ ❌ 📅 ⚡ 🏷️)
- Confirm actions with clear feedback
- Format task lists in a readable way
- Keep responses concise but informative

## Example Interactions

User: "Add a task to call Ali tomorrow morning"
You: Extract title="Call Ali", due_date=tomorrow at 9 AM, call create_task tool, confirm creation

User: "Show me all urgent tasks"
You: Call list_tasks with priority filter, format and display results

User: "Delete task 5"
You: Ask for confirmation, then call delete_task if confirmed

User: "Move all meetings to 2 PM"
You: List tasks with "meeting" in title, ask for confirmation, update each task's due_date

Remember: You are a helpful assistant, not a database. Always use tools to interact with tasks.`;

export const CONFIRMATION_PROMPT = `Before proceeding with this action, I need your confirmation. This action will affect the following:

{affected_items}

Type 'yes' to proceed or 'no' to cancel.`;
```

---

## Agent Configuration

### src/agent/config.ts

```typescript
import { AgentConfig } from '@openai/agents-sdk';
import { SYSTEM_PROMPT } from './prompts.js';

/**
 * Agent configuration for OpenAI Agents SDK
 */

export const agentConfig: AgentConfig = {
  name: 'todo-assistant',
  description: 'Personal task management assistant',
  model: 'gpt-4-turbo-preview',
  instructions: SYSTEM_PROMPT,
  tools: [
    {
      type: 'mcp',
      server: {
        command: 'node',
        args: ['../mcp-server/dist/index.js'],
        env: {
          BACKEND_API_URL: process.env.BACKEND_API_URL || 'http://localhost:8000/api/v1',
        },
      },
    },
  ],
  temperature: 0.7,
  maxTokens: 1000,
};

export const conversationConfig = {
  maxHistoryLength: 20, // Keep last 20 messages for context
  confirmationRequired: ['delete_task', 'bulk_operations'],
  defaultTimeout: 30000, // 30 seconds
};
```

---

## Date Parser Utility

### src/utils/date-parser.ts

```typescript
import * as chrono from 'chrono-node';

/**
 * Parse natural language date expressions into ISO 8601 format
 */

export interface ParsedDate {
  iso: string;
  readable: string;
}

export function parseNaturalDate(input: string, referenceDate: Date = new Date()): ParsedDate | null {
  // Use chrono-node for robust date parsing
  const results = chrono.parse(input, referenceDate, { forwardDate: true });

  if (results.length === 0) {
    return null;
  }

  const parsed = results[0].start;
  const date = parsed.date();

  // Apply default time if not specified
  if (!parsed.isCertain('hour')) {
    // Check for time-of-day hints in the input
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes('morning')) {
      date.setHours(9, 0, 0, 0);
    } else if (lowerInput.includes('afternoon')) {
      date.setHours(14, 0, 0, 0);
    } else if (lowerInput.includes('evening')) {
      date.setHours(18, 0, 0, 0);
    } else {
      // Default to 9 AM
      date.setHours(9, 0, 0, 0);
    }
  }

  return {
    iso: date.toISOString(),
    readable: formatReadableDate(date),
  };
}

export function formatReadableDate(date: Date): string {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dateStr = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  // Check if it's today or tomorrow
  if (date.toDateString() === now.toDateString()) {
    return `Today at ${timeStr}`;
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow at ${timeStr}`;
  } else {
    return `${dateStr} at ${timeStr}`;
  }
}

/**
 * Extract date expressions from user input
 */
export function extractDateFromInput(input: string): ParsedDate | null {
  // Common date patterns
  const datePatterns = [
    /tomorrow/i,
    /next (monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
    /in \d+ (day|days|week|weeks)/i,
    /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]* \d+/i,
    /\d{1,2}\/\d{1,2}/,
  ];

  for (const pattern of datePatterns) {
    const match = input.match(pattern);
    if (match) {
      return parseNaturalDate(match[0]);
    }
  }

  return null;
}
```

---

## Entity Extractor

### src/utils/entity-extractor.ts

```typescript
import { parseNaturalDate, extractDateFromInput } from './date-parser.js';

/**
 * Extract task entities from natural language input
 */

export interface ExtractedEntities {
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  due_date?: string;
  task_id?: number;
}

export function extractPriority(input: string): 'low' | 'medium' | 'high' | undefined {
  const lowerInput = input.toLowerCase();

  if (lowerInput.includes('urgent') || lowerInput.includes('high priority') || lowerInput.includes('important')) {
    return 'high';
  } else if (lowerInput.includes('low priority') || lowerInput.includes('not urgent')) {
    return 'low';
  } else if (lowerInput.includes('medium priority')) {
    return 'medium';
  }

  return undefined;
}

export function extractTags(input: string): string[] {
  const tags: string[] = [];

  // Extract hashtags
  const hashtagMatches = input.match(/#(\w+)/g);
  if (hashtagMatches) {
    tags.push(...hashtagMatches.map(tag => tag.slice(1)));
  }

  // Extract "tag it as X" or "tag: X"
  const tagPatterns = [
    /tag(?:ged)? (?:as|with) ([a-z0-9-]+)/i,
    /tag: ([a-z0-9-]+)/i,
  ];

  for (const pattern of tagPatterns) {
    const match = input.match(pattern);
    if (match) {
      tags.push(match[1]);
    }
  }

  return [...new Set(tags)]; // Remove duplicates
}

export function extractTaskId(input: string): number | undefined {
  // Match "task 5", "task #5", "ID 5", "#5"
  const patterns = [
    /task #?(\d+)/i,
    /id #?(\d+)/i,
    /#(\d+)/,
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match) {
      return parseInt(match[1], 10);
    }
  }

  return undefined;
}

export function extractTitle(input: string): string | undefined {
  // Remove common prefixes
  let title = input
    .replace(/^(add|create|new) (a )?task:?/i, '')
    .replace(/^(remind me to|remember to)/i, '')
    .trim();

  // Remove date expressions
  title = title.replace(/tomorrow/i, '').trim();
  title = title.replace(/next (monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i, '').trim();

  // Remove priority keywords
  title = title.replace(/(urgent|high priority|low priority|important)/i, '').trim();

  // Remove tag expressions
  title = title.replace(/tag(?:ged)? (?:as|with) [a-z0-9-]+/i, '').trim();
  title = title.replace(/#\w+/g, '').trim();

  return title || undefined;
}

export function extractEntities(input: string): ExtractedEntities {
  const entities: ExtractedEntities = {};

  // Extract task ID
  entities.task_id = extractTaskId(input);

  // Extract title
  entities.title = extractTitle(input);

  // Extract priority
  entities.priority = extractPriority(input);

  // Extract tags
  const tags = extractTags(input);
  if (tags.length > 0) {
    entities.tags = tags;
  }

  // Extract due date
  const parsedDate = extractDateFromInput(input);
  if (parsedDate) {
    entities.due_date = parsedDate.iso;
  }

  return entities;
}
```

---

## Response Formatter

### src/utils/response-formatter.ts

```typescript
/**
 * Format agent responses for user display
 */

export interface Task {
  id: number;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  tags?: string[];
  due_date?: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export function formatTaskCreated(task: Task): string {
  const lines = [
    `✅ Task created: "${task.title}"`,
  ];

  if (task.due_date) {
    lines.push(`📅 Due: ${formatDate(task.due_date)}`);
  }

  lines.push(`⚡ Priority: ${formatPriority(task.priority)}`);

  if (task.tags && task.tags.length > 0) {
    lines.push(`🏷️ Tags: ${task.tags.join(', ')}`);
  }

  return lines.join('\n');
}

export function formatTaskUpdated(task: Task, changedFields: string[]): string {
  const lines = [
    `✅ Task updated: "${task.title}"`,
  ];

  if (changedFields.length > 0) {
    lines.push(`🔄 Changed: ${changedFields.join(', ')}`);
  }

  return lines.join('\n');
}

export function formatTaskList(tasks: Task[]): string {
  if (tasks.length === 0) {
    return '📋 No tasks found.';
  }

  const lines = [`📋 Found ${tasks.length} task(s):\n`];

  tasks.forEach((task, index) => {
    const priorityIcon = getPriorityIcon(task.priority);
    const completedIcon = task.completed ? '✓' : ' ';

    lines.push(`${index + 1}. [${completedIcon}] ${priorityIcon} ${task.title} (${formatPriority(task.priority)})`);

    if (task.due_date) {
      lines.push(`   📅 Due: ${formatDate(task.due_date)}`);
    }

    if (task.tags && task.tags.length > 0) {
      lines.push(`   🏷️ ${task.tags.join(', ')}`);
    }

    lines.push(''); // Empty line between tasks
  });

  return lines.join('\n');
}

export function formatTaskCompleted(task: Task): string {
  return `✅ Task completed: "${task.title}"\n🎉 Great job!`;
}

export function formatTaskDeleted(taskTitle: string): string {
  return `✅ Task deleted: "${taskTitle}"`;
}

export function formatTaskRescheduled(task: Task): string {
  return `✅ Task rescheduled: "${task.title}"\n📅 New due date: ${formatDate(task.due_date!)}`;
}

export function formatError(error: string): string {
  return `❌ Error: ${error}`;
}

function formatPriority(priority: string): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

function getPriorityIcon(priority: string): string {
  switch (priority) {
    case 'high':
      return '🔴';
    case 'medium':
      return '🟡';
    case 'low':
      return '🟢';
    default:
      return '⚪';
  }
}

function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dateStr = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (date.toDateString() === now.toDateString()) {
    return `Today at ${timeStr}`;
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow at ${timeStr}`;
  } else {
    return `${dateStr} at ${timeStr}`;
  }
}
```

---

## Agent Runtime Entry Point

### src/index.ts

```typescript
import { Agent } from '@openai/agents-sdk';
import { agentConfig, conversationConfig } from './agent/config.js';

/**
 * Agent runtime for Todo application
 * Handles conversation management and tool orchestration
 */

class TodoAgent {
  private agent: Agent;
  private conversationHistory: any[] = [];

  constructor() {
    this.agent = new Agent(agentConfig);
  }

  async processMessage(userMessage: string): Promise<string> {
    try {
      // Add user message to history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage,
      });

      // Trim history if too long
      if (this.conversationHistory.length > conversationConfig.maxHistoryLength) {
        this.conversationHistory = this.conversationHistory.slice(-conversationConfig.maxHistoryLength);
      }

      // Send message to agent
      const response = await this.agent.run({
        messages: this.conversationHistory,
        timeout: conversationConfig.defaultTimeout,
      });

      // Add assistant response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: response.content,
      });

      return response.content;
    } catch (error) {
      console.error('Agent error:', error);
      return 'Sorry, I encountered an error processing your request. Please try again.';
    }
  }

  async reset(): Promise<void> {
    this.conversationHistory = [];
  }

  getHistory(): any[] {
    return [...this.conversationHistory];
  }
}

// Export singleton instance
export const todoAgent = new TodoAgent();

// CLI interface for testing
if (require.main === module) {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log('Todo AI Agent - CLI Interface');
  console.log('Type your commands or "exit" to quit\n');

  const prompt = () => {
    rl.question('You: ', async (input: string) => {
      if (input.toLowerCase() === 'exit') {
        rl.close();
        process.exit(0);
      }

      const response = await todoAgent.processMessage(input);
      console.log(`\nAgent: ${response}\n`);
      prompt();
    });
  };

  prompt();
}
```

---

## Environment Configuration

### .env.example

```env
# OpenAI API Key
OPENAI_API_KEY=sk-...

# Backend API URL (for MCP server)
BACKEND_API_URL=http://localhost:8000/api/v1

# Agent Configuration
AGENT_MODEL=gpt-4-turbo-preview
AGENT_TEMPERATURE=0.7
AGENT_MAX_TOKENS=1000

# Logging
LOG_LEVEL=info
```

---

## Testing Strategy

### Unit Tests

```typescript
// tests/utils/date-parser.test.ts
import { describe, it, expect } from 'vitest';
import { parseNaturalDate, extractDateFromInput } from '../../src/utils/date-parser';

describe('Date Parser', () => {
  it('should parse "tomorrow" correctly', () => {
    const result = parseNaturalDate('tomorrow');
    expect(result).not.toBeNull();
    expect(result!.iso).toMatch(/T09:00:00/); // Default 9 AM
  });

  it('should parse "tomorrow afternoon" correctly', () => {
    const result = parseNaturalDate('tomorrow afternoon');
    expect(result).not.toBeNull();
    expect(result!.iso).toMatch(/T14:00:00/); // 2 PM
  });

  it('should parse "next Friday" correctly', () => {
    const result = parseNaturalDate('next Friday');
    expect(result).not.toBeNull();
    // Should be a Friday
    const date = new Date(result!.iso);
    expect(date.getDay()).toBe(5); // Friday
  });
});
```

### Integration Tests

```typescript
// tests/agent/integration.test.ts
import { describe, it, expect } from 'vitest';
import { todoAgent } from '../../src/index';

describe('Agent Integration', () => {
  it('should create a task from natural language', async () => {
    const response = await todoAgent.processMessage('Add a task to buy groceries tomorrow');
    expect(response).toContain('Task created');
    expect(response).toContain('buy groceries');
  });

  it('should list tasks', async () => {
    const response = await todoAgent.processMessage('Show me all my tasks');
    expect(response).toContain('Found');
    expect(response).toContain('task');
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

### Environment Variables

```bash
# Production
export OPENAI_API_KEY="sk-..."
export BACKEND_API_URL="https://api.yourdomain.com/api/v1"
export AGENT_MODEL="gpt-4-turbo-preview"
```

---

## Success Criteria

- ✅ Agent parses natural language commands correctly
- ✅ Agent extracts entities (title, date, priority, tags) accurately
- ✅ Agent selects appropriate MCP tools for each intent
- ✅ Agent formats responses in user-friendly manner
- ✅ Agent handles errors gracefully
- ✅ Agent asks for confirmation on destructive actions
- ✅ Agent maintains conversation context
- ✅ Date parsing works for common temporal expressions
- ✅ Agent never accesses backend API directly
- ✅ All operations go through MCP tools

---

**Version**: 1.0.0
**Last Updated**: 2026-01-07
**Status**: Implementation Ready
