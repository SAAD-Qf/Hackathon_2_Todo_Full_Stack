'use client';

import { useState, useEffect } from 'react';

export default function TestConnection() {
  const [connectionStatus, setConnectionStatus] = useState<{
    success?: boolean;
    error?: string;
    backendHealth?: any;
    timestamp?: string;
    message?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch('/api/test');
        const data = await response.json();
        setConnectionStatus(data);
      } catch (error) {
        setConnectionStatus({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        });
      } finally {
        setLoading(false);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50 to-purple-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-gray-900 dark:text-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-indigo-600">Connection Test</h1>
        
        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
            <p>Testing connection between frontend and backend...</p>
          </div>
        ) : connectionStatus ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border dark:border-slate-700 p-8">
            <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
            
            {connectionStatus.success ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-green-700 dark:text-green-300 font-medium">✅ Connection Successful!</p>
                  <p className="text-green-600 dark:text-green-400 mt-1">{connectionStatus.message}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h3 className="font-medium text-blue-700 dark:text-blue-300">Backend Health</h3>
                    <pre className="text-sm mt-2 bg-gray-100 dark:bg-slate-700 p-2 rounded overflow-x-auto">
                      {JSON.stringify(connectionStatus.backendHealth, null, 2)}
                    </pre>
                  </div>
                  
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <h3 className="font-medium text-purple-700 dark:text-purple-300">Timestamp</h3>
                    <p className="mt-2">{connectionStatus.timestamp}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800">
                <p className="text-red-700 dark:text-red-300 font-medium">❌ Connection Failed</p>
                <p className="text-red-600 dark:text-red-400 mt-1">Error: {connectionStatus.error}</p>
                <p className="text-red-600 dark:text-red-400 mt-2">Make sure the backend server is running on http://localhost:8000</p>
              </div>
            )}
            
            <div className="mt-8 pt-6 border-t dark:border-slate-700">
              <h3 className="font-medium mb-3">Next Steps:</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>If connection is successful, you can use the <a href="/chat" className="text-indigo-600 dark:text-indigo-400 hover:underline">AI Chat</a> feature</li>
                <li>If connection failed, ensure the backend is running with: <code className="bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded text-sm">python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000</code></li>
                <li>Check that CORS is properly configured in the backend</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-red-500">Failed to load connection status</p>
          </div>
        )}
      </div>
    </div>
  );
}