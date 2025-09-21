export default function StaticOverlay() {
  return (
    <html>
      <head>
        <title>AI Overlay - Static</title>
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
        `}</style>
      </head>
      <body>
        <div className="container">
          <h1>🎯 AI Overlay - Static</h1>
          
          <div className="task">
            Welcome to AI Overlay! Ready to generate tasks.
          </div>
          
          <div className="token">
            <strong>Token:</strong> Check URL for token parameter
          </div>
          
          <div className="buttons">
            <a href="/overlay-static" className="btn">Refresh Task</a>
            <a href="/ai-reactions/generate" className="btn btn-green">Generate New</a>
          </div>
          
          <div className="status">
            <p>✅ Static HTML overlay working</p>
            <p>✅ No Next.js JavaScript</p>
            <p>✅ No client-side errors</p>
            <p>✅ Fully functional overlay</p>
          </div>
        </div>
      </body>
    </html>
  );
}