'use client';

import React from 'react';

export default function TestSimple() {
  // Простейший тест - без всякой сложной логики
  const [message, setMessage] = React.useState('Loading...');

  React.useEffect(() => {
    console.log('🔍 TestSimple mounted');
    
    try {
      // Тест 1: Проверяем window
      if (typeof window === 'undefined') {
        setMessage('Server-side rendering');
        return;
      }
      
      console.log('🔍 Window exists');
      
      // Тест 2: Проверяем URL параметры
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('t');
      
      console.log('🔍 Token:', token);
      
      if (!token) {
        setMessage('No token provided');
        return;
      }
      
      // Тест 3: Простой API вызов
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
        console.log('🔍 API Response:', response.status);
        return response.json();
      })
      .then(data => {
        console.log('🔍 API Data:', data);
        setMessage(`Success: ${data.task || 'No task'}`);
      })
      .catch(error => {
        console.error('🔍 API Error:', error);
        setMessage(`Error: ${error.message}`);
      });
      
    } catch (error) {
      console.error('🔍 General Error:', error);
      setMessage(`General Error: ${error.message}`);
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
        maxWidth: '500px',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>🧪 Simple Test</h1>
        <div style={{ 
          fontSize: '18px', 
          marginBottom: '20px',
          minHeight: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {message}
        </div>
        <div style={{ fontSize: '14px', color: '#8bd0ff' }}>
          Check browser console (F12) for detailed logs
        </div>
      </div>
    </div>
  );
}
