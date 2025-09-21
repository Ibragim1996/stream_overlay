'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export default class OverlayErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Overlay Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
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
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px' }}>Overlay Error</h2>
            <p style={{ fontSize: '16px', color: '#ccc', marginBottom: '20px' }}>
              Something went wrong with the overlay. Please check your URL and try again.
            </p>
            <button 
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.location.reload();
                }
              }}
              style={{
                padding: '12px 25px',
                background: '#415cff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Reload Page
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{ marginTop: '20px', textAlign: 'left' }}>
                <summary style={{ cursor: 'pointer', fontSize: '14px', color: '#888' }}>Error Details</summary>
                <pre style={{
                  marginTop: '10px',
                  fontSize: '12px',
                  color: '#ff6b6b',
                  background: 'rgba(0,0,0,0.5)',
                  padding: '10px',
                  borderRadius: '5px',
                  overflow: 'auto'
                }}>
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
