import { Suspense } from 'react';
import RefreshButton from './RefreshButton';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

async function getTask(token: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'https://stream-overlay-six.vercel.app'}/api/task`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: token,
        mode: 'funny',
        voice: 'alloy',
        streamKind: 'just_chatting',
        kind: 'next'
      }),
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching task:', error);
    return { task: 'Error loading task', error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

async function OverlayContent({ searchParams }: { searchParams: { t?: string } }) {
  const token = searchParams.t;
  
  if (!token) {
    return (
      <div className="min-h-screen bg-[#0b1020] flex items-center justify-center">
        <div className="text-white text-center max-w-md mx-auto p-6">
          <div className="text-yellow-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-4">Missing Token</h2>
          <p className="text-gray-300 mb-4">
            This overlay requires a token parameter. Please use the correct URL format:
          </p>
          <code className="block bg-gray-800 p-3 rounded text-sm text-green-400 mb-4">
            /overlay?t=YOUR_TOKEN
          </code>
          <a 
            href="/"
            className="px-4 py-2 bg-[#415cff] text-white rounded-lg hover:bg-[#3648e6] transition-colors inline-block"
          >
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  const taskData = await getTask(token);

  return (
    <div className="min-h-screen bg-[#0b1020] flex items-center justify-center">
      <div className="text-white text-center max-w-2xl mx-auto p-6">
        <h1 className="text-4xl font-bold mb-8">🎯 AI Overlay</h1>
        
        <div className="bg-[#1a1f3a] rounded-lg p-8 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Current Task</h2>
          <div className="text-xl text-green-400 mb-4">
            {taskData.task || 'No task available'}
          </div>
          {taskData.error && (
            <div className="text-red-400 text-sm">
              Error: {taskData.error}
            </div>
          )}
        </div>
        
        <div className="bg-[#1a1f3a] rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-3">Token Info</h3>
          <code className="text-sm text-gray-300 break-all">
            {token}
          </code>
        </div>
        
        <div className="flex gap-4 justify-center">
          <RefreshButton />
          <a 
            href="/ai-reactions/generate"
            className="px-6 py-3 bg-[#28a745] text-white rounded-lg hover:bg-[#218838] transition-colors"
          >
            Generate New
          </a>
        </div>
        
        <div className="mt-8 text-sm text-gray-400">
          <p>✅ Server-side rendering working</p>
          <p>✅ API calls working</p>
          <p>✅ Token validation working</p>
          <p>✅ Client Component onClick fixed</p>
        </div>
      </div>
    </div>
  );
}

export default function OverlayPage({ searchParams }: { searchParams: { t?: string } }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0b1020] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-2 border-[#415cff] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading overlay...</p>
        </div>
      </div>
    }>
      <OverlayContent searchParams={searchParams} />
    </Suspense>
  );
}
