// This is a temporary test to debug the API route
// Will be removed after debugging

import { useState } from 'react';

export default function DebugTest() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testApi = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Hello',
          history: []
        })
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1>Debug Test Page</h1>
      <button 
        onClick={testApi} 
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading ? 'Loading...' : 'Test API'}
      </button>
      
      {result && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h2>Result:</h2>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}