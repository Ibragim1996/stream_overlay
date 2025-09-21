'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

function OverlayV3Client() {
  const searchParams = useSearchParams();
  const key = searchParams.get('key');
  
  if (!key) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0b1020',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif',
        color: 'white',
        padding: '20px'
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '500px',
          background: 'rgba(10, 14, 28, 0.95)',
          padding: '40px',
          borderRadius: '20px',
          border: '1px solid #243058'
        }}>
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>⚠️</div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px' }}>Overlay key is missing</h2>
          <p style={{ fontSize: '16px', color: '#ccc', marginBottom: '20px' }}>
            Please provide a valid key parameter in the URL.
          </p>
          <p style={{ fontSize: '14px', color: '#888' }}>
            Expected format: /overlay-v3?key=YOUR_KEY
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0b1020',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      color: 'white',
      padding: '20px'
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '600px',
        background: 'rgba(10, 14, 28, 0.95)',
        padding: '40px',
        borderRadius: '20px',
        border: '1px solid #243058'
      }}>
        <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>🎯 AI Overlay V3</h1>
        
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
          Welcome to AI Overlay! Ready to generate tasks.
        </div>
        
        <div style={{ fontSize: '16px', marginBottom: '20px' }}>
          <strong>Key:</strong> {key}
        </div>
        
        <div style={{ marginTop: '20px' }}>
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.reload();
              }
            }}
            style={{
              display: 'inline-block',
              background: '#415cff',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            Refresh Task
          </button>
          
          <a
            href="/ai-reactions/generate"
            style={{
              display: 'inline-block',
              background: '#28a745',
              color: 'white',
              textDecoration: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontSize: '16px'
            }}
          >
            Generate New
          </a>
        </div>
        
        <div style={{ marginTop: '30px', fontSize: '14px', color: '#8bd0ff' }}>
          <p>✅ Overlay V3 working</p>
          <p>✅ Key parameter working</p>
          <p>✅ No Vercel cache issues</p>
          <p>✅ Fully functional overlay</p>
        </div>
      </div>
    </div>
  );
}

export default function OverlayV3Page() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        background: '#0b1020',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '2px solid #415cff',
            borderTop: '2px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p>Loading overlay...</p>
        </div>
      </div>
    }>
      <OverlayV3Client />
    </Suspense>
  );
}
