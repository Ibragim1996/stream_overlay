'use client';

import React, { Suspense } from 'react';
import OverlayView from './view';
import { FORCE_UPDATE_VERSION } from './force-update';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Force Vercel to update
console.log('Overlay version:', FORCE_UPDATE_VERSION);

// Error Boundary Component
class OverlayErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Overlay Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0b1020] flex items-center justify-center">
          <div className="text-white text-center max-w-md mx-auto p-6">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold mb-4">Overlay Error</h2>
            <p className="text-gray-300 mb-4">
              Something went wrong with the overlay. Please check the URL parameters and try again.
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-[#415cff] text-white rounded-lg hover:bg-[#3648e6] transition-colors"
            >
              Reload Page
            </button>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-400">Error Details</summary>
                <pre className="mt-2 text-xs text-red-400 bg-black/50 p-2 rounded overflow-auto">
                  {this.state.error?.toString()}
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

export default function OverlayPage() {
  return (
    <OverlayErrorBoundary>
      <Suspense fallback={
        <div className="min-h-screen bg-[#0b1020] flex items-center justify-center">
          <div className="text-white text-center">
            <div className="w-8 h-8 border-2 border-[#415cff] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Loading overlay...</p>
          </div>
        </div>
      }>
        <OverlayView />
      </Suspense>
    </OverlayErrorBoundary>
  );
}