'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import OverlayErrorBoundary from './ErrorBoundary';
import OverlayCore from './OverlayCore';
import './overlay.css';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

function OverlayContent() {
  const searchParams = useSearchParams();
  
  // Get key from URL parameters
  const key = searchParams.get('key') || 
              searchParams.get('k') || 
              searchParams.get('t') || 
              searchParams.get('token') ||
              searchParams.get('K') ||
              searchParams.get('T') ||
              searchParams.get('TOKEN');

  // Check if key is missing
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
          maxWidth: '520px',
          background: 'rgba(10, 14, 28, 0.95)',
          padding: '40px',
          borderRadius: '20px',
          border: '1px solid #243058'
        }}>
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>⚠️</div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px' }}>Overlay key missing</h2>
          <p style={{ fontSize: '16px', color: '#ccc', marginBottom: '16px' }}>
            Add the <code>key</code> query parameter to this URL to launch your overlay.
          </p>
          <p style={{ fontSize: '14px', color: '#aaa', marginBottom: '20px' }}>
            Example: <code>/overlay?key=YOUR_KEY</code>
          </p>
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center'
          }}>
            <a
              href="/panel"
              style={{
                padding: '10px 16px',
                background: '#415cff',
                color: 'white',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 'bold'
              }}
            >
              Open Panel to get key
            </a>
            <a
              href="/api/token"
              style={{
                padding: '10px 16px',
                background: '#1f2937',
                color: 'white',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 'bold'
              }}
            >
              Generate test key
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Only initialize heavy components when key is present
  return <OverlayCore key={key} />;
}

export default function OverlayPage() {
  return (
    <OverlayErrorBoundary>
      <Suspense
        fallback={
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
              }} />
              <p>Loading overlay...</p>
            </div>
          </div>
        }
      >
        <OverlayContent />
      </Suspense>
    </OverlayErrorBoundary>
  );
}