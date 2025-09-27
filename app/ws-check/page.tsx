'use client';

import { useEffect, useState } from 'react';

type WSStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
type WSMessage = {
  type: 'open' | 'message' | 'error' | 'close';
  timestamp: string;
  data?: any;
  error?: string;
};

export default function WSCheckPage() {
  const [status, setStatus] = useState<WSStatus>('disconnected');
  const [messages, setMessages] = useState<WSMessage[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [testKey, setTestKey] = useState('TEST123');

  const addMessage = (type: WSMessage['type'], data?: any, error?: string) => {
    const message: WSMessage = {
      type,
      timestamp: new Date().toLocaleTimeString(),
      data,
      error
    };
    setMessages(prev => [...prev, message]);
  };

  const connectWebSocket = () => {
    if (ws) {
      ws.close();
      setWs(null);
    }

    setStatus('connecting');
    addMessage('open', 'Attempting to connect...');

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/ws?key=${encodeURIComponent(testKey)}`;
      
      addMessage('open', `Connecting to: ${wsUrl}`);
      
      const socket = new WebSocket(wsUrl);
      setWs(socket);

      socket.onopen = () => {
        setStatus('connected');
        addMessage('open', 'WebSocket connected successfully!');
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          addMessage('message', data);
        } catch (error) {
          addMessage('message', event.data);
        }
      };

      socket.onerror = (error) => {
        setStatus('error');
        addMessage('error', null, 'WebSocket error occurred');
        console.error('WebSocket error:', error);
      };

      socket.onclose = (event) => {
        setStatus('disconnected');
        addMessage('close', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        });
        setWs(null);
      };

    } catch (error) {
      setStatus('error');
      addMessage('error', null, `Connection failed: ${error}`);
    }
  };

  const disconnectWebSocket = () => {
    if (ws) {
      ws.close();
      setWs(null);
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const getStatusColor = (status: WSStatus) => {
    switch (status) {
      case 'connected': return '#4caf50';
      case 'connecting': return '#ff9800';
      case 'error': return '#f44336';
      default: return '#666';
    }
  };

  const getStatusText = (status: WSStatus) => {
    switch (status) {
      case 'connected': return '✅ Connected';
      case 'connecting': return '🔄 Connecting...';
      case 'error': return '❌ Error';
      default: return '⚪ Disconnected';
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0b1020',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      color: 'white'
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>🔌 WebSocket Diagnostic Tool</h1>
        
        <div style={{
          background: '#1a1f3a',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <h2 style={{ margin: '0 0 15px 0' }}>Connection Status</h2>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            marginBottom: '15px'
          }}>
            <div style={{
              padding: '8px 16px',
              background: getStatusColor(status),
              borderRadius: '5px',
              fontWeight: 'bold'
            }}>
              {getStatusText(status)}
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={testKey}
                onChange={(e) => setTestKey(e.target.value)}
                placeholder="Test key"
                style={{
                  padding: '8px',
                  background: '#2a2f4a',
                  color: 'white',
                  border: '1px solid #444',
                  borderRadius: '5px',
                  width: '120px'
                }}
              />
              
              <button
                onClick={connectWebSocket}
                disabled={status === 'connecting'}
                style={{
                  padding: '8px 16px',
                  background: status === 'connecting' ? '#666' : '#415cff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: status === 'connecting' ? 'not-allowed' : 'pointer'
                }}
              >
                Connect
              </button>
              
              <button
                onClick={disconnectWebSocket}
                disabled={status === 'disconnected'}
                style={{
                  padding: '8px 16px',
                  background: status === 'disconnected' ? '#666' : '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: status === 'disconnected' ? 'not-allowed' : 'pointer'
                }}
              >
                Disconnect
              </button>
              
              <button
                onClick={clearMessages}
                style={{
                  padding: '8px 16px',
                  background: '#666',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Clear
              </button>
            </div>
          </div>
          
          <div style={{ fontSize: '14px', opacity: 0.7 }}>
            <p><strong>URL:</strong> {typeof window !== 'undefined' ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/api/ws?key=${testKey}` : 'Loading...'}</p>
          </div>
        </div>

        <div style={{
          background: '#1a1f3a',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: '0 0 15px 0' }}>Event Log</h3>
          <div style={{
            background: '#0a0e1c',
            padding: '15px',
            borderRadius: '5px',
            maxHeight: '400px',
            overflowY: 'auto',
            fontFamily: 'monospace',
            fontSize: '12px'
          }}>
            {messages.length === 0 ? (
              <div style={{ opacity: 0.5 }}>No events yet. Click "Connect" to start testing.</div>
            ) : (
              messages.map((msg, index) => (
                <div key={index} style={{
                  marginBottom: '8px',
                  padding: '5px',
                  background: msg.type === 'error' ? '#4d1a1a' : msg.type === 'open' ? '#1a4d1a' : '#1a1a2e',
                  borderRadius: '3px',
                  borderLeft: `3px solid ${
                    msg.type === 'error' ? '#f44336' : 
                    msg.type === 'open' ? '#4caf50' : 
                    msg.type === 'message' ? '#2196f3' : '#666'
                  }`
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                    [{msg.timestamp}] {msg.type.toUpperCase()}
                  </div>
                  {msg.data && (
                    <div style={{ opacity: 0.8 }}>
                      {typeof msg.data === 'string' ? msg.data : JSON.stringify(msg.data, null, 2)}
                    </div>
                  )}
                  {msg.error && (
                    <div style={{ color: '#f44336' }}>
                      Error: {msg.error}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div style={{
          background: '#1a1f3a',
          padding: '20px',
          borderRadius: '10px'
        }}>
          <h3 style={{ margin: '0 0 15px 0' }}>Instructions</h3>
          <ol style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.6' }}>
            <li>Enter a test key (default: TEST123)</li>
            <li>Click "Connect" to test WebSocket connection</li>
            <li>Check the event log for connection status</li>
            <li>If connection fails, check Vercel Functions logs</li>
            <li>Make sure WebSocket endpoint is properly configured</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
