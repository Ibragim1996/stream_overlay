'use client';

import { Suspense } from 'react';
import OverlayErrorBoundary from './ErrorBoundary';
import OverlayClient from './OverlayClient';
import './overlay.css';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

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
        <OverlayClient />
      </Suspense>
    </OverlayErrorBoundary>
  );
}