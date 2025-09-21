'use client';

import { useEffect, useState } from 'react';

export default function TestConsolePage() {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const addLog = (message: string) => {
      setLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
    };

    addLog('TestConsolePage: Component mounted');
    
    // Test basic functionality
    try {
      addLog('TestConsolePage: Testing window object');
      if (typeof window !== 'undefined') {
        addLog('TestConsolePage: Window object available');
        addLog(`TestConsolePage: Location: ${window.location.href}`);
        addLog(`TestConsolePage: User agent: ${navigator.userAgent.substring(0, 50)}...`);
      } else {
        addLog('TestConsolePage: Window object not available (SSR)');
      }
    } catch (error) {
      addLog(`TestConsolePage: Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test fetch
    try {
      addLog('TestConsolePage: Testing fetch API');
      fetch('/api/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: 'TEST',
          mode: 'funny',
          voice: 'alloy',
          streamKind: 'just_chatting',
          kind: 'next'
        })
      })
      .then(response => {
        addLog(`TestConsolePage: Fetch response status: ${response.status}`);
        return response.json();
      })
      .then(data => {
        addLog(`TestConsolePage: Fetch data: ${JSON.stringify(data).substring(0, 100)}...`);
      })
      .catch(error => {
        addLog(`TestConsolePage: Fetch error: ${error.message}`);
      });
    } catch (error) {
      addLog(`TestConsolePage: Fetch setup error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Test button click
    const handleClick = () => {
      addLog('TestConsolePage: Button clicked!');
    };

    // Add click listener
    const button = document.getElementById('test-button');
    if (button) {
      button.addEventListener('click', handleClick);
      addLog('TestConsolePage: Click listener added');
    }

    return () => {
      if (button) {
        button.removeEventListener('click', handleClick);
      }
    };
  }, []);

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#1a1a2e',
      color: '#e0e0e0',
      minHeight: '100vh',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <h1 style={{ color: '#00b894', marginBottom: '20px' }}>Console Test Page</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button
          id="test-button"
          onClick={() => setLogs(prev => [...prev, `${new Date().toISOString()}: Button clicked via onClick`])}
          style={{
            background: '#415cff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Test Button (onClick)
        </button>
        
        <button
          id="test-button-2"
          style={{
            background: '#28a745',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Test Button (addEventListener)
        </button>
      </div>

      <div style={{
        backgroundColor: '#0f0f23',
        padding: '15px',
        borderRadius: '8px',
        border: '1px solid #333',
        maxHeight: '400px',
        overflowY: 'auto'
      }}>
        <h3 style={{ marginTop: 0, color: '#00b894' }}>Console Logs:</h3>
        {logs.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>No logs yet...</p>
        ) : (
          logs.map((log, index) => (
            <div
              key={index}
              style={{
                fontFamily: 'monospace',
                fontSize: '12px',
                marginBottom: '5px',
                padding: '2px 0',
                borderBottom: '1px solid #222'
              }}
            >
              {log}
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#888' }}>
        <p>Instructions:</p>
        <ul>
          <li>Open browser console (F12) to see additional logs</li>
          <li>Click both buttons to test different event handling methods</li>
          <li>Check if fetch API works</li>
          <li>Look for any error messages</li>
        </ul>
      </div>
    </div>
  );
}
