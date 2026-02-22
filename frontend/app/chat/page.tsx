'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export default function ChatPage() {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your task assistant. How can I help you today?',
      role: 'assistant',
      timestamp: new Date(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateMockResponse = (userMessage: string) => {
    const lowerCaseMsg = userMessage.toLowerCase();
    
    if (lowerCaseMsg.includes('hello') || lowerCaseMsg.includes('hi') || lowerCaseMsg.includes('hey')) {
      return "Hello there! How can I assist you with your tasks today?";
    } else if (lowerCaseMsg.includes('task') || lowerCaseMsg.includes('todo')) {
      return "I can help you manage your tasks! You can add, edit, or delete tasks in the main dashboard.";
    } else if (lowerCaseMsg.includes('help')) {
      return "I'm here to help! You can ask me about managing tasks, setting priorities, or organizing your workflow.";
    } else if (lowerCaseMsg.includes('complete') || lowerCaseMsg.includes('done') || lowerCaseMsg.includes('finish')) {
      return "To mark a task as complete, simply click the checkbox next to the task in your task list.";
    } else if (lowerCaseMsg.includes('add') || lowerCaseMsg.includes('create') || lowerCaseMsg.includes('new')) {
      return "To add a new task, click the '+ Add Task' button and fill in the details like title, description, and priority.";
    } else if (lowerCaseMsg.includes('thank')) {
      return "You're welcome! Is there anything else I can help you with?";
    } else if (lowerCaseMsg.includes('bye') || lowerCaseMsg.includes('goodbye')) {
      return "Goodbye! Feel free to come back if you have more questions.";
    } else {
      const responses = [
        "That's interesting! How else can I help you with your tasks?",
        "I understand. Would you like help organizing your tasks?",
        "Thanks for sharing! Do you need assistance with anything specific?",
        "I'm here to help with your task management. What else would you like to know?",
        "Great question! Managing tasks effectively is important for productivity.",
        "I can help you with that. Have you tried using the filter options in the task list?",
        "That's a common concern. Our task manager can help you stay organized."
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate API delay
    setTimeout(() => {
      const mockResponse = generateMockResponse(inputMessage);
      
      // Add AI response to chat
      const aiMessage: Message = {
        id: Date.now().toString(),
        content: mockResponse,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50 to-purple-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-6 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Task Assistant
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Your helpful task management assistant
            </p>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <main className="max-w-4xl mx-auto px-6 py-8 h-[calc(100vh-200px)] flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border dark:border-slate-700 p-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div className={`text-xs mt-1 ${message.role === 'user' ? 'text-indigo-200' : 'text-gray-500 dark:text-gray-400'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl rounded-bl-none bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200 px-4 py-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce delay-100"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border dark:border-slate-700 p-4">
          <div className="flex space-x-3">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about tasks, priorities, or organization..."
              className="flex-1 min-h-[60px] max-h-32 px-4 py-3 bg-gray-100 dark:bg-slate-700 rounded-xl border dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Send
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
            Task Assistant - Ask about managing your tasks and productivity
          </div>
        </div>
      </main>
    </div>
  );
}