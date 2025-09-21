'use client';

import React, { useState, useEffect } from 'react';

export default function DebugPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<any>({});

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const testAPI = async () => {
    addLog('Testing API call...');
    try {
      const response = await fetch('/api/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: 'TEST',
          mode: 'funny',
          voice: 'alloy',
          streamKind: 'just_chatting',
          kind: 'next'
        })
      });
      
      const data = await response.json();
      addLog(`API Response: ${response.status} - ${JSON.stringify(data)}`);
      setTestResults(prev => ({ ...prev, api: { success: true, data } }));
    } catch (error) {
      addLog(`API Error: ${error.message}`);
      setTestResults(prev => ({ ...prev, api: { success: false, error: error.message } }));
    }
  };

  const testOverlay = async () => {
    addLog('Testing overlay page...');
    try {
      const response = await fetch('/overlay?t=TEST');
      const html = await response.text();
      
      if (html.includes('Application error')) {
        addLog('❌ Found "Application error" in overlay response');
        setTestResults(prev => ({ ...prev, overlay: { success: false, error: 'Application error found' } }));
      } else if (html.includes('Initializing overlay')) {
        addLog('✅ Overlay shows "Initializing overlay" - server-side working');
        setTestResults(prev => ({ ...prev, overlay: { success: true, status: 'initializing' } }));
      } else if (html.includes('Missing Token')) {
        addLog('✅ Overlay shows "Missing Token" - validation working');
        setTestResults(prev => ({ ...prev, overlay: { success: true, status: 'missing_token' } }));
      } else {
        addLog('⚠️ Unknown overlay response');
        setTestResults(prev => ({ ...prev, overlay: { success: false, error: 'Unknown response' } }));
      }
    } catch (error) {
      addLog(`Overlay Error: ${error.message}`);
      setTestResults(prev => ({ ...prev, overlay: { success: false, error: error.message } }));
    }
  };

  const testWindow = () => {
    addLog('Testing window object...');
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('t');
      addLog(`Window test: token=${token || 'none'}`);
      addLog(`Window properties: innerWidth=${window.innerWidth}, innerHeight=${window.innerHeight}`);
      addLog(`Document test: body exists=${!!document.body}`);
      
      setTestResults(prev => ({ 
        ...prev, 
        window: { 
          success: true, 
          width: window.innerWidth, 
          height: window.innerHeight,
          token: token || 'none'
        } 
      }));
    } catch (error) {
      addLog(`Window Error: ${error.message}`);
      setTestResults(prev => ({ ...prev, window: { success: false, error: error.message } }));
    }
  };

  const testReact = () => {
    addLog('Testing React hydration...');
    try {
      // Test if React is working
      const testElement = document.createElement('div');
      testElement.innerHTML = 'React Test';
      document.body.appendChild(testElement);
      document.body.removeChild(testElement);
      
      addLog('✅ React DOM manipulation working');
      setTestResults(prev => ({ ...prev, react: { success: true } }));
    } catch (error) {
      addLog(`React Error: ${error.message}`);
      setTestResults(prev => ({ ...prev, react: { success: false, error: error.message } }));
    }
  };

  useEffect(() => {
    addLog('Debug page loaded');
    
    // Auto-run tests
    setTimeout(() => testWindow(), 1000);
    setTimeout(() => testReact(), 2000);
    setTimeout(() => testAPI(), 3000);
    setTimeout(() => testOverlay(), 4000);
  }, []);

  // Global error handler
  useEffect(() => {
    const handleError = (e: ErrorEvent) => {
      addLog(`Global Error: ${e.message} at ${e.filename}:${e.lineno}`);
    };
    
    const handleRejection = (e: PromiseRejectionEvent) => {
      addLog(`Promise Rejection: ${e.reason}`);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0b1020] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 Overlay Debug Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#1a1a2e] p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <div className="space-y-2">
              {Object.entries(testResults).map(([key, result]) => (
                <div key={key} className={`p-3 rounded ${result.success ? 'bg-green-900' : 'bg-red-900'}`}>
                  <strong>{key}:</strong> {result.success ? '✅ Success' : '❌ Failed'}
                  {result.error && <div className="text-sm text-red-300 mt-1">{result.error}</div>}
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-[#1a1a2e] p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button 
                onClick={testAPI}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
              >
                Test API
              </button>
              <button 
                onClick={testOverlay}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
              >
                Test Overlay
              </button>
              <button 
                onClick={testWindow}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded"
              >
                Test Window
              </button>
              <button 
                onClick={testReact}
                className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded"
              >
                Test React
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-[#1a1a2e] p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Debug Logs</h2>
          <div className="bg-black p-4 rounded h-64 overflow-y-auto font-mono text-sm">
            {logs.map((log, index) => (
              <div key={index} className="mb-1">{log}</div>
            ))}
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <a 
            href="/overlay?t=TEST" 
            className="inline-block px-6 py-3 bg-[#415cff] hover:bg-[#3648e6] rounded-lg font-semibold"
          >
            Test Overlay Page
          </a>
        </div>
      </div>
    </div>
  );
}
