'use client';

import React from 'react';

export default function OverlaySimple() {
  const [status, setStatus] = React.useState('Initializing...');
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    console.log('🚀 OverlaySimple starting...');
    
    try {
      // Проверяем, что мы на клиенте
      if (typeof window === 'undefined') {
        setStatus('Server-side rendering');
        return;
      }
      
      console.log('✅ Window object available');
      
      // Получаем параметры URL
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('t');
      
      console.log('🔑 Token from URL:', token);
      
      if (!token) {
        setStatus('Missing token - add ?t=YOUR_TOKEN to URL');
        return;
      }
      
      setStatus('Token found, testing API...');
      
      // Тестируем API
      fetch('/api/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token,
          mode: 'funny',
          voice: 'alloy',
          streamKind: 'just_chatting',
          kind: 'next'
        })
      })
      .then(response => {
        console.log('📡 API Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response.json();
      })
      .then(data => {
        console.log('📡 API Response data:', data);
        setStatus(`✅ Success! Task: ${data.task || 'No task received'}`);
      })
      .catch(err => {
        console.error('❌ API Error:', err);
        setError(err.message);
        setStatus(`❌ API Error: ${err.message}`);
      });
      
    } catch (err) {
      console.error('❌ General Error:', err);
      setError(err.message);
      setStatus(`❌ Error: ${err.message}`);
    }
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0b1020', 
      color: 'white', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      padding: '20px'
    }}>
      <div style={{ 
        background: 'rgba(10,14,28,0.95)', 
        padding: '40px', 
        borderRadius: '20px', 
        border: '1px solid #243058',
        maxWidth: '600px',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>🎯 Overlay Simple Test</h1>
        
        <div style={{ 
          fontSize: '20px', 
          marginBottom: '30px',
          minHeight: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: error ? 'rgba(255,0,0,0.1)' : 'rgba(0,255,0,0.1)',
          borderRadius: '10px',
          padding: '20px'
        }}>
          {status}
        </div>
        
        {error && (
          <div style={{ 
            background: 'rgba(255,0,0,0.2)', 
            padding: '15px', 
            borderRadius: '10px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            <strong>Error Details:</strong><br/>
            {error}
          </div>
        )}
        
        <div style={{ fontSize: '14px', color: '#8bd0ff' }}>
          <strong>Instructions:</strong><br/>
          1. Open browser console (F12)<br/>
          2. Look for logs starting with 🚀, ✅, ❌<br/>
          3. Test with: /overlay-simple?t=TEST
        </div>
        
        <div style={{ marginTop: '20px' }}>
          <button 
            onClick={() => window.location.reload()} 
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
            Reload
          </button>
          <button 
            onClick={() => window.location.href = '/test-simple?t=TEST'} 
            style={{
              background: '#28a745',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Test Simple
          </button>
        </div>
      </div>
    </div>
  );
}
