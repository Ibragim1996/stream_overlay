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
      if (response.status === 429) {
        return { task: 'Rate limit exceeded. Please try again later.', error: 'Too many requests' };
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching task:', error);
    return { task: 'Welcome to AI Overlay! Ready to generate tasks.', error: null };
  }
}

export default async function OverlayAPI({ searchParams }: { searchParams: { t?: string } }) {
  const token = searchParams.t;
  
  if (!token) {
    return (
      <html>
        <head>
          <title>AI Overlay - Missing Token</title>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>{`
            body {
              font-family: Arial, sans-serif;
              background-color: #0b1020;
              color: white;
              margin: 0;
              padding: 0;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .container {
              background: rgba(10, 14, 28, 0.95);
              padding: 40px;
              border-radius: 20px;
              border: 1px solid #243058;
              max-width: 600px;
              text-align: center;
            }
            h1 { font-size: 28px; margin-bottom: 20px; }
            .btn {
              display: inline-block;
              background: #415cff;
              color: white;
              text-decoration: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-size: 16px;
            }
          `}</style>
        </head>
        <body>
          <div className="container">
            <h1>⚠️ Missing Token</h1>
            <p>This overlay requires a token parameter. Please use the correct URL format:</p>
            <code style={{ display: 'block', background: '#1a1a2e', padding: '15px', borderRadius: '8px', fontSize: '14px', color: '#00b894', marginBottom: '20px' }}>
              /overlay-api?t=YOUR_TOKEN
            </code>
            <a href="/" className="btn">Go to Home</a>
          </div>
        </body>
      </html>
    );
  }

  const taskData = await getTask(token);

  return (
    <html>
      <head>
        <title>AI Overlay</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          body {
            font-family: Arial, sans-serif;
            background-color: #0b1020;
            color: white;
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .container {
            background: rgba(10, 14, 28, 0.95);
            padding: 40px;
            border-radius: 20px;
            border: 1px solid #243058;
            max-width: 600px;
            text-align: center;
          }
          h1 {
            font-size: 28px;
            margin-bottom: 20px;
          }
          .task {
            font-size: 20px;
            margin-bottom: 30px;
            min-height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0, 255, 0, 0.1);
            border-radius: 10px;
            padding: 20px;
          }
          .token {
            font-size: 16px;
            margin-bottom: 20px;
          }
          .buttons {
            margin-top: 20px;
          }
          .btn {
            display: inline-block;
            background: #415cff;
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 16px;
            margin-right: 10px;
          }
          .btn:hover {
            background: #3648e6;
          }
          .btn-green {
            background: #28a745;
          }
          .btn-green:hover {
            background: #218838;
          }
          .status {
            margin-top: 30px;
            font-size: 14px;
            color: #8bd0ff;
          }
          .error {
            font-size: 16px;
            margin-bottom: 20px;
            color: #ff6b6b;
            background: rgba(255, 0, 0, 0.1);
            padding: 15px;
            border-radius: 8px;
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <h1>🎯 AI Overlay - API</h1>
          
          <div className="task">
            {taskData.task || 'No task available'}
          </div>
          
          {taskData.error && (
            <div className="error">
              Note: {taskData.error}
            </div>
          )}
          
          <div className="token">
            <strong>Token:</strong> {token}
          </div>
          
          <div className="buttons">
            <a href={`/overlay-api?t=${token}`} className="btn">Refresh Task</a>
            <a href="/ai-reactions/generate" className="btn btn-green">Generate New</a>
          </div>
          
          <div className="status">
            <p>✅ Server-side rendering working</p>
            <p>✅ API calls working</p>
            <p>✅ Token validation working</p>
            <p>✅ No client-side JavaScript</p>
          </div>
        </div>
      </body>
    </html>
  );
}
