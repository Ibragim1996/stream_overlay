'use client';

import { useEffect, useState } from 'react';

export default function OverlaySimpleTest() {
  const [message, setMessage] = useState('Loading...');
  const [token, setToken] = useState('');

  useEffect(() => {
    console.log('🚀 OverlaySimpleTest: useEffect running');
    
    try {
      // Get token from URL
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('t') || 'NO_TOKEN';
      setToken(urlToken);
      
      console.log('🔍 OverlaySimpleTest: Token from URL:', urlToken);
      
      // Test API call
      fetch('/api/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: urlToken,
          mode: 'funny',
          voice: 'alloy',
          streamKind: 'just_chatting',
          kind: 'next'
        })
      })
      .then(response => {
        console.log('📡 OverlaySimpleTest: API response status:', response.status);
        return response.json();
      })
      .then(data => {
        console.log('📡 OverlaySimpleTest: API data:', data);
        setMessage(data.task || 'No task received');
      })
      .catch(error => {
        console.error('🚨 OverlaySimpleTest: API error:', error);
        setMessage(`API Error: ${error.message}`);
      });
      
    } catch (error) {
      console.error('🚨 OverlaySimpleTest: General error:', error);
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, []);

  const handleRefresh = () => {
    console.log('🔄 OverlaySimpleTest: Refresh clicked');
    window.location.reload();
  };

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
        <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>🎯 Simple Overlay Test</h1>
        
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
          {message}
        </div>
        
        <div style={{ fontSize: '16px', marginBottom: '20px' }}>
          <strong>Token:</strong> {token}
        </div>
        
        <button
          onClick={handleRefresh}
          style={{
            background: '#415cff',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            marginRight: '10px'
          }}
        >
          Refresh
        </button>
        
        <button
          onClick={() => window.location.href = '/overlay?t=TEST'}
          style={{
            background: '#28a745',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Test Original
        </button>
        
        <div style={{ marginTop: '20px', fontSize: '14px', color: '#8bd0ff' }}>
          <p><strong>Instructions:</strong></p>
          <p>1. Open browser console (F12)</p>
          <p>2. Look for logs starting with 🚀, 🔍, 📡, 🚨</p>
          <p>3. Test with: /overlay-simple-test?t=TEST</p>
        </div>
      </div>
    </div>
  );
}
