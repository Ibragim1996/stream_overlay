'use client';

import { useEffect, useState } from 'react';

export default function EnvCheckPage() {
  const [envVars, setEnvVars] = useState<Record<string, string | undefined>>({});
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setEnvVars({
      NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  }, []);

  if (!isClient) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0b1020',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif',
        color: 'white'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'
  ];

  const allPresent = requiredVars.every(key => envVars[key]);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0b1020',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      color: 'white'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>🔍 Environment Variables Check</h1>
        
        <div style={{
          background: allPresent ? '#1a4d1a' : '#4d1a1a',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px',
          border: `2px solid ${allPresent ? '#4caf50' : '#f44336'}`
        }}>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>
            {allPresent ? '✅ All Firebase variables are present!' : '❌ Missing Firebase variables!'}
          </h2>
          <p style={{ margin: 0, opacity: 0.8 }}>
            {allPresent 
              ? 'Firebase client should work correctly.' 
              : 'Add missing variables to Vercel Environment Variables.'
            }
          </p>
        </div>

        <div style={{ background: '#1a1f3a', padding: '20px', borderRadius: '10px' }}>
          <h3 style={{ margin: '0 0 15px 0' }}>Firebase Environment Variables:</h3>
          
          {requiredVars.map(key => {
            const value = envVars[key];
            const isPresent = !!value;
            
            return (
              <div key={key} style={{
                marginBottom: '10px',
                padding: '10px',
                background: isPresent ? '#1a4d1a' : '#4d1a1a',
                borderRadius: '5px',
                border: `1px solid ${isPresent ? '#4caf50' : '#f44336'}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                  <span style={{ marginRight: '10px' }}>
                    {isPresent ? '✅' : '❌'}
                  </span>
                  <code style={{ 
                    fontWeight: 'bold',
                    color: isPresent ? '#4caf50' : '#f44336'
                  }}>
                    {key}
                  </code>
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  opacity: 0.7,
                  marginLeft: '30px',
                  wordBreak: 'break-all'
                }}>
                  {isPresent ? value : 'NOT SET'}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '20px', fontSize: '14px', opacity: 0.7 }}>
          <p><strong>Instructions:</strong></p>
          <ol>
            <li>Go to Vercel Dashboard → Your Project → Settings → Environment Variables</li>
            <li>Add all missing variables with NEXT_PUBLIC_ prefix</li>
            <li>Make sure they are set for Production and Preview environments</li>
            <li>Redeploy without cache</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
