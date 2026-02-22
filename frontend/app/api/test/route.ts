// This is a test API route to verify frontend-backend connectivity
// Located at: app/api/test/route.ts

import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Test the backend API
    const backendResponse = await fetch('http://localhost:8000/health');
    
    if (!backendResponse.ok) {
      return Response.json({ 
        success: false, 
        error: `Backend responded with status ${backendResponse.status}`,
        backendUrl: 'http://localhost:8000/health'
      });
    }
    
    const backendData = await backendResponse.json();
    
    return Response.json({ 
      success: true, 
      backendHealth: backendData,
      timestamp: new Date().toISOString(),
      message: 'Frontend can successfully communicate with backend!'
    });
  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      backendUrl: 'http://localhost:8000/health'
    });
  }
}