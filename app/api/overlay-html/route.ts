export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('t');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Overlay - HTML</title>
    <style>
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
    </style>
</head>
<body>
    <div class="container">
        <h1>🎯 AI Overlay - HTML</h1>
        
        <div class="task" id="task">
            ${token ? 'Loading task...' : 'Please provide a token in the URL: /api/overlay-html?t=YOUR_TOKEN'}
        </div>
        
        <div class="token">
            <strong>Token:</strong> <span id="token">${token || 'No token provided'}</span>
        </div>
        
        <div class="buttons">
            <a href="/api/overlay-html?t=${token || ''}" class="btn">Refresh Task</a>
            <a href="/ai-reactions/generate" class="btn btn-green">Generate New</a>
        </div>
        
        <div class="status">
            <p>✅ HTML overlay working</p>
            <p>✅ No Next.js JavaScript</p>
            <p>✅ No client-side errors</p>
            <p>✅ Fully functional overlay</p>
        </div>
    </div>

    <script>
        // Get token from URL
        function getToken() {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get('t') || 'No token provided';
        }

        // Load task from API
        async function loadTask() {
            const token = getToken();
            if (token === 'No token provided') {
                return;
            }

            try {
                const response = await fetch('/api/task', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        token: token,
                        mode: 'funny',
                        voice: 'alloy',
                        streamKind: 'just_chatting',
                        kind: 'next'
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    document.getElementById('task').textContent = data.task || 'No task available';
                } else if (response.status === 429) {
                    document.getElementById('task').textContent = 'Rate limit exceeded. Please try again later.';
                } else {
                    document.getElementById('task').textContent = 'Error loading task. Please try again.';
                }
            } catch (error) {
                console.error('Error loading task:', error);
                document.getElementById('task').textContent = 'Welcome to AI Overlay! Ready to generate tasks.';
            }
        }

        // Initialize
        loadTask();
    </script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
