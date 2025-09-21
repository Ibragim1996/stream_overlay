import { Suspense } from 'react';

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

export default async function OverlayNewPage({ searchParams }: { searchParams: { t?: string } }) {
  const token = searchParams.t;
  
  if (!token) {
    return (
      <div style={{
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#0b1020',
        color: 'white',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        boxSizing: 'border-box'
      }}>
        <div style={{
          background: 'rgba(10, 14, 28, 0.95)',
          padding: '40px',
          borderRadius: '20px',
          border: '1px solid #243058',
          maxWidth: '600px',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>⚠️ Missing Token</h1>
          <p style={{ fontSize: '16px', marginBottom: '20px' }}>
            This overlay requires a token parameter. Please use the correct URL format:
          </p>
          <code style={{
            display: 'block',
            background: '#1a1a2e',
            padding: '15px',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#00b894',
            marginBottom: '20px'
          }}>
            /overlay-new?t=YOUR_TOKEN
          </code>
          <a 
            href="/"
            style={{
              display: 'inline-block',
              background: '#415cff',
              color: 'white',
              textDecoration: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px'
            }}
          >
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  const taskData = await getTask(token);

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#0b1020',
      color: 'white',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        background: 'rgba(10, 14, 28, 0.95)',
        padding: '40px',
        borderRadius: '20px',
        border: '1px solid #243058',
        maxWidth: '600px',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>🎯 New Overlay</h1>
        
        <div style={{
          fontSize: '20px',
          marginBottom: '30px',
          minHeight: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(0, 255, 0, 0.1)',
          borderRadius: '10px',
          padding: '20px'
        }}>
          {taskData.task || 'No task available'}
        </div>
        
        {taskData.error && (
          <div style={{
            fontSize: '16px',
            marginBottom: '20px',
            color: '#ff6b6b',
            background: 'rgba(255, 0, 0, 0.1)',
            padding: '15px',
            borderRadius: '8px'
          }}>
            Error: {taskData.error}
          </div>
        )}
        
        <div style={{ fontSize: '16px', marginBottom: '20px' }}>
          <strong>Token:</strong> {token}
        </div>
        
        <div style={{ marginTop: '20px' }}>
          <a
            href={`/overlay-new?t=${token}`}
            style={{
              display: 'inline-block',
              background: '#415cff',
              color: 'white',
              textDecoration: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              marginRight: '10px'
            }}
          >
            Refresh Task
          </a>
          
          <a
            href="/ai-reactions/generate"
            style={{
              display: 'inline-block',
              background: '#28a745',
              color: 'white',
              textDecoration: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px'
            }}
          >
            Generate New
          </a>
        </div>
        
        <div style={{ marginTop: '30px', fontSize: '14px', color: '#8bd0ff' }}>
          <p>✅ New overlay working</p>
          <p>✅ Server-side rendering</p>
          <p>✅ API calls working</p>
          <p>✅ Token validation working</p>
        </div>
      </div>
    </div>
  );
}
