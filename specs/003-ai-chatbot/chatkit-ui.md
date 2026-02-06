# ChatKit UI Integration Specification

**Feature**: AI Todo Chatbot - ChatKit Frontend Layer
**Created**: 2026-01-07
**Status**: Implementation Ready
**Constitution**: Phase III (v3.0.0)

## Overview

This document specifies the implementation of the conversational UI using OpenAI ChatKit. The ChatKit UI provides a modern chat interface for users to interact with the AI agent and manage their tasks through natural language.

**Key Principle**: ChatKit UI is an alternative frontend to the Phase II web UI, not a replacement. Both interfaces operate on the same backend API.

---

## Technology Stack

- **UI Framework**: OpenAI ChatKit (React-based)
- **React Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + ChatKit default styles
- **State Management**: ChatKit built-in + React Context
- **Agent Client**: OpenAI Agents SDK client library
- **HTTP Client**: fetch API

---

## Project Structure

```
chatkit-ui/
├── app/
│   ├── page.tsx                    # Main chat interface page
│   ├── layout.tsx                  # Root layout with providers
│   ├── globals.css                 # Global styles
│   └── components/
│       ├── ChatWindow.tsx          # Main chat container
│       ├── MessageList.tsx         # Scrollable message history
│       ├── MessageItem.tsx         # Individual message component
│       ├── UserMessage.tsx         # User message display
│       ├── AgentMessage.tsx        # Agent message display
│       ├── ToolExecutionCard.tsx   # Tool execution display
│       ├── TaskCard.tsx            # Rich task display
│       ├── MessageInput.tsx        # User input field
│       ├── ConfirmationDialog.tsx  # Confirmation modal
│       └── ErrorBanner.tsx         # Error display
├── lib/
│   ├── agent-client.ts             # Agent SDK client
│   ├── types.ts                    # TypeScript types
│   ├── utils.ts                    # Utility functions
│   └── hooks/
│       ├── useChat.ts              # Chat state management
│       └── useAgent.ts             # Agent communication
├── public/
│   └── assets/                     # Images, icons
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

---

## Package Configuration

### package.json

```json
{
  "name": "todo-chatkit-ui",
  "version": "1.0.0",
  "description": "ChatKit UI for Todo AI Chatbot",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "@openai/chatkit": "^1.0.0",
    "@openai/agents-sdk": "^1.0.0",
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.3.3"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## Type Definitions

### lib/types.ts

```typescript
/**
 * Type definitions for ChatKit UI
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

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  timestamp: Date;
  toolExecution?: ToolExecution;
}

export interface ToolExecution {
  toolName: string;
  input: Record<string, any>;
  output: Record<string, any>;
  success: boolean;
  error?: string;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  pendingConfirmation: PendingConfirmation | null;
}

export interface PendingConfirmation {
  action: string;
  affectedItems: string[];
  onConfirm: () => void;
  onCancel: () => void;
}

export interface AgentResponse {
  content: string;
  toolExecutions?: ToolExecution[];
}
```

---

## Agent Client

### lib/agent-client.ts

```typescript
import { AgentClient } from '@openai/agents-sdk/client';
import { AgentResponse, ToolExecution } from './types';

/**
 * Client for communicating with the AI agent
 */

export class TodoAgentClient {
  private client: AgentClient;
  private agentUrl: string;

  constructor(agentUrl: string = process.env.NEXT_PUBLIC_AGENT_URL || 'http://localhost:3001') {
    this.agentUrl = agentUrl;
    this.client = new AgentClient({
      baseUrl: agentUrl,
    });
  }

  /**
   * Send a message to the agent and get a response
   */
  async sendMessage(message: string, conversationId?: string): Promise<AgentResponse> {
    try {
      const response = await this.client.sendMessage({
        message,
        conversationId,
      });

      return {
        content: response.content,
        toolExecutions: response.toolExecutions?.map(this.parseToolExecution),
      };
    } catch (error) {
      console.error('Agent client error:', error);
      throw new Error('Failed to communicate with agent');
    }
  }

  /**
   * Parse tool execution from agent response
   */
  private parseToolExecution(execution: any): ToolExecution {
    return {
      toolName: execution.name,
      input: execution.input,
      output: execution.output,
      success: execution.success ?? true,
      error: execution.error,
    };
  }

  /**
   * Reset conversation history
   */
  async resetConversation(conversationId: string): Promise<void> {
    await this.client.resetConversation(conversationId);
  }
}

// Singleton instance
export const agentClient = new TodoAgentClient();
```

---

## Custom Hooks

### lib/hooks/useChat.ts

```typescript
import { useState, useCallback } from 'react';
import { Message, ChatState, PendingConfirmation } from '../types';
import { agentClient } from '../agent-client';

/**
 * Custom hook for managing chat state
 */

export function useChat() {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
    pendingConfirmation: null,
  });

  const addMessage = useCallback((message: Message) => {
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, message],
    }));
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    addMessage(userMessage);

    // Set loading state
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Send to agent
      const response = await agentClient.sendMessage(content);

      // Add agent response
      const agentMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
      };
      addMessage(agentMessage);

      // Add tool executions if any
      if (response.toolExecutions) {
        response.toolExecutions.forEach(execution => {
          const toolMessage: Message = {
            id: crypto.randomUUID(),
            role: 'tool',
            content: JSON.stringify(execution.output),
            timestamp: new Date(),
            toolExecution: execution,
          };
          addMessage(toolMessage);
        });
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [addMessage]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const requestConfirmation = useCallback((confirmation: PendingConfirmation) => {
    setState(prev => ({ ...prev, pendingConfirmation: confirmation }));
  }, []);

  const clearConfirmation = useCallback(() => {
    setState(prev => ({ ...prev, pendingConfirmation: null }));
  }, []);

  const resetChat = useCallback(() => {
    setState({
      messages: [],
      isLoading: false,
      error: null,
      pendingConfirmation: null,
    });
  }, []);

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    pendingConfirmation: state.pendingConfirmation,
    sendMessage,
    clearError,
    requestConfirmation,
    clearConfirmation,
    resetChat,
  };
}
```

---

## Core Components

### app/components/ChatWindow.tsx

```typescript
'use client';

import { useChat } from '@/lib/hooks/useChat';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ErrorBanner from './ErrorBanner';
import ConfirmationDialog from './ConfirmationDialog';

/**
 * Main chat window component
 */

export default function ChatWindow() {
  const {
    messages,
    isLoading,
    error,
    pendingConfirmation,
    sendMessage,
    clearError,
    clearConfirmation,
  } = useChat();

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Todo AI Assistant</h1>
        <p className="text-sm text-gray-600">Manage your tasks with natural language</p>
      </header>

      {/* Error Banner */}
      {error && <ErrorBanner message={error} onDismiss={clearError} />}

      {/* Message List */}
      <div className="flex-1 overflow-hidden">
        <MessageList messages={messages} isLoading={isLoading} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 bg-white">
        <MessageInput onSend={sendMessage} disabled={isLoading} />
      </div>

      {/* Confirmation Dialog */}
      {pendingConfirmation && (
        <ConfirmationDialog
          action={pendingConfirmation.action}
          affectedItems={pendingConfirmation.affectedItems}
          onConfirm={() => {
            pendingConfirmation.onConfirm();
            clearConfirmation();
          }}
          onCancel={() => {
            pendingConfirmation.onCancel();
            clearConfirmation();
          }}
        />
      )}
    </div>
  );
}
```

### app/components/MessageList.tsx

```typescript
'use client';

import { useEffect, useRef } from 'react';
import { Message } from '@/lib/types';
import MessageItem from './MessageItem';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

/**
 * Scrollable list of chat messages
 */

export default function MessageList({ messages, isLoading }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="h-full overflow-y-auto px-6 py-4 space-y-4">
      {messages.length === 0 && (
        <div className="text-center text-gray-500 mt-20">
          <p className="text-lg font-medium">Welcome to Todo AI Assistant!</p>
          <p className="text-sm mt-2">Try saying:</p>
          <ul className="text-sm mt-4 space-y-2">
            <li>"Add a task to buy groceries tomorrow"</li>
            <li>"Show me all my tasks"</li>
            <li>"Mark task 3 as complete"</li>
          </ul>
        </div>
      )}

      {messages.map(message => (
        <MessageItem key={message.id} message={message} />
      ))}

      {isLoading && (
        <div className="flex items-center space-x-2 text-gray-500">
          <div className="animate-pulse">●</div>
          <div className="animate-pulse animation-delay-200">●</div>
          <div className="animate-pulse animation-delay-400">●</div>
          <span className="text-sm">Agent is thinking...</span>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
```

### app/components/MessageItem.tsx

```typescript
'use client';

import { Message } from '@/lib/types';
import UserMessage from './UserMessage';
import AgentMessage from './AgentMessage';
import ToolExecutionCard from './ToolExecutionCard';

interface MessageItemProps {
  message: Message;
}

/**
 * Individual message component (routes to specific message type)
 */

export default function MessageItem({ message }: MessageItemProps) {
  switch (message.role) {
    case 'user':
      return <UserMessage content={message.content} timestamp={message.timestamp} />;
    case 'assistant':
      return <AgentMessage content={message.content} timestamp={message.timestamp} />;
    case 'tool':
      return message.toolExecution ? (
        <ToolExecutionCard execution={message.toolExecution} />
      ) : null;
    default:
      return null;
  }
}
```

### app/components/UserMessage.tsx

```typescript
'use client';

interface UserMessageProps {
  content: string;
  timestamp: Date;
}

/**
 * User message display
 */

export default function UserMessage({ content, timestamp }: UserMessageProps) {
  return (
    <div className="flex justify-end">
      <div className="max-w-2xl">
        <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-3">
          <p className="text-sm">{content}</p>
        </div>
        <p className="text-xs text-gray-500 mt-1 text-right">
          {timestamp.toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
```

### app/components/AgentMessage.tsx

```typescript
'use client';

import ReactMarkdown from 'react-markdown';

interface AgentMessageProps {
  content: string;
  timestamp: Date;
}

/**
 * Agent message display with markdown support
 */

export default function AgentMessage({ content, timestamp }: AgentMessageProps) {
  return (
    <div className="flex justify-start">
      <div className="max-w-2xl">
        <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
          <ReactMarkdown className="text-sm text-gray-900 prose prose-sm max-w-none">
            {content}
          </ReactMarkdown>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {timestamp.toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
```

### app/components/MessageInput.tsx

```typescript
'use client';

import { useState, KeyboardEvent } from 'react';

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

/**
 * User input field with send button
 */

export default function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="px-6 py-4">
      <div className="flex items-end space-x-3">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message... (Shift+Enter for new line)"
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          className="bg-blue-600 text-white rounded-lg px-6 py-3 font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
}
```

### app/components/ToolExecutionCard.tsx

```typescript
'use client';

import { useState } from 'react';
import { ToolExecution } from '@/lib/types';

interface ToolExecutionCardProps {
  execution: ToolExecution;
}

/**
 * Collapsible card showing tool execution details
 */

export default function ToolExecutionCard({ execution }: ToolExecutionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">
            🔧 {execution.toolName}
          </span>
          {execution.success ? (
            <span className="text-xs text-green-600">✓ Success</span>
          ) : (
            <span className="text-xs text-red-600">✗ Failed</span>
          )}
        </div>
        <button className="text-gray-500 hover:text-gray-700">
          {isExpanded ? '▼' : '▶'}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-3 space-y-2 text-xs">
          <div>
            <p className="font-medium text-gray-600">Input:</p>
            <pre className="bg-white p-2 rounded mt-1 overflow-x-auto">
              {JSON.stringify(execution.input, null, 2)}
            </pre>
          </div>
          <div>
            <p className="font-medium text-gray-600">Output:</p>
            <pre className="bg-white p-2 rounded mt-1 overflow-x-auto">
              {JSON.stringify(execution.output, null, 2)}
            </pre>
          </div>
          {execution.error && (
            <div>
              <p className="font-medium text-red-600">Error:</p>
              <p className="text-red-600 mt-1">{execution.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

### app/components/ConfirmationDialog.tsx

```typescript
'use client';

interface ConfirmationDialogProps {
  action: string;
  affectedItems: string[];
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Modal dialog for confirming destructive actions
 */

export default function ConfirmationDialog({
  action,
  affectedItems,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm Action</h2>
        <p className="text-gray-700 mb-4">{action}</p>

        {affectedItems.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-600 mb-2">Affected items:</p>
            <ul className="text-sm text-gray-700 space-y-1">
              {affectedItems.map((item, index) => (
                <li key={index}>• {item}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex space-x-3">
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-red-700 transition-colors"
          >
            Confirm
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-800 rounded-lg px-4 py-2 font-medium hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
```

### app/components/ErrorBanner.tsx

```typescript
'use client';

interface ErrorBannerProps {
  message: string;
  onDismiss: () => void;
}

/**
 * Error banner with dismiss button
 */

export default function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div className="bg-red-50 border-b border-red-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-red-600">⚠️</span>
          <p className="text-sm text-red-800">{message}</p>
        </div>
        <button
          onClick={onDismiss}
          className="text-red-600 hover:text-red-800 font-medium text-sm"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
```

---

## Main Page

### app/page.tsx

```typescript
import ChatWindow from './components/ChatWindow';

/**
 * Main chat interface page
 */

export default function Home() {
  return <ChatWindow />;
}
```

### app/layout.tsx

```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Todo AI Assistant',
  description: 'Manage your tasks with natural language',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

---

## Environment Configuration

### .env.local.example

```env
# Agent API URL
NEXT_PUBLIC_AGENT_URL=http://localhost:3001

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ID=
```

---

## Styling

### tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        'pulse': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
```

---

## Testing Strategy

### Component Tests

```typescript
// __tests__/components/MessageInput.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import MessageInput from '@/app/components/MessageInput';

describe('MessageInput', () => {
  it('should call onSend when send button is clicked', () => {
    const onSend = jest.fn();
    render(<MessageInput onSend={onSend} />);

    const input = screen.getByPlaceholderText(/Type your message/i);
    const sendButton = screen.getByText('Send');

    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);

    expect(onSend).toHaveBeenCalledWith('Test message');
  });

  it('should not send empty messages', () => {
    const onSend = jest.fn();
    render(<MessageInput onSend={onSend} />);

    const sendButton = screen.getByText('Send');
    fireEvent.click(sendButton);

    expect(onSend).not.toHaveBeenCalled();
  });
});
```

---

## Deployment

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_AGENT_URL production
```

### Docker Support

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

---

## Success Criteria

- ✅ ChatKit UI displays conversation history
- ✅ User can send messages to agent
- ✅ Agent responses are displayed clearly
- ✅ Tool executions are shown in collapsible cards
- ✅ Confirmation dialogs work for destructive actions
- ✅ Error messages are user-friendly
- ✅ UI is responsive and accessible
- ✅ Loading states are clear
- ✅ Auto-scroll to latest message
- ✅ Markdown rendering in agent messages
- ✅ Integration with agent runtime works seamlessly

---

**Version**: 1.0.0
**Last Updated**: 2026-01-07
**Status**: Implementation Ready
