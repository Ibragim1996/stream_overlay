'use client';

import React, { useState, useEffect, Suspense } from 'react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Enhanced Error Boundary with detailed logging
class OverlayDebugErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    console.error('🚨 Overlay Error Boundary caught:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🚨 Overlay Error Details:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0b1020] flex items-center justify-center p-4">
          <div className="text-white text-center max-w-2xl mx-auto">
            <div className="text-red-500 text-6xl mb-4">🚨</div>
            <h2 className="text-2xl font-bold mb-4">Overlay Debug Error</h2>
            <p className="text-gray-300 mb-6">
              We caught the exact error! This will help us fix the problem.
            </p>
            
            <div className="bg-red-900/50 p-4 rounded-lg mb-6 text-left">
              <h3 className="font-bold mb-2">Error Message:</h3>
              <pre className="text-sm text-red-200 whitespace-pre-wrap">
                {this.state.error?.toString() || 'Unknown error'}
              </pre>
            </div>
            
            {this.state.errorInfo && (
              <div className="bg-gray-900/50 p-4 rounded-lg mb-6 text-left">
                <h3 className="font-bold mb-2">Error Stack:</h3>
                <pre className="text-xs text-gray-300 whitespace-pre-wrap overflow-auto max-h-40">
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}
            
            <div className="space-y-2">
              <button 
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.reload();
                  }
                }} 
                className="px-6 py-3 bg-[#415cff] text-white rounded-lg hover:bg-[#3648e6] transition-colors mr-2"
              >
                Reload Page
              </button>
              <button 
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.href = '/debug';
                  }
                }} 
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Go to Debug Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simple overlay component for testing
function SimpleOverlay() {
  const [task, setTask] = useState('Loading...');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('🔍 SimpleOverlay mounted');
    
    const fetchTask = async () => {
      try {
        console.log('🔍 Fetching task...');
        const response = await fetch('/api/task', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: 'TEST',
            mode: 'funny',
            voice: 'alloy',
            streamKind: 'just_chatting',
            kind: 'next'
          })
        });
        
        console.log('🔍 API Response:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('🔍 API Data:', data);
        
        setTask(data.task || 'No task received');
        setLoading(false);
      } catch (err) {
        console.error('🔍 Fetch Error:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchTask();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-[#0b1020] flex items-center justify-center">
        <div className="text-white text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-xl font-bold mb-4">Fetch Error</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-[#415cff] text-white rounded-lg hover:bg-[#3648e6] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1020] flex items-center justify-center">
      <div className="text-white text-center max-w-md mx-auto p-6">
        <div className="bg-[rgba(10,14,28,0.95)] backdrop-blur-xl rounded-2xl border border-[#243058] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.6)]">
          <h3 className="text-lg font-semibold mb-4">Debug Overlay</h3>
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-[#415cff] border-t-transparent rounded-full animate-spin"></div>
              <span>Loading...</span>
            </div>
          ) : (
            <div>
              <p className="text-lg leading-relaxed mb-4">{task}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-[#415cff] text-white rounded-lg hover:bg-[#3648e6] transition-colors"
              >
                Get New Task
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OverlayDebugPage() {
  return (
    <OverlayDebugErrorBoundary>
      <Suspense fallback={
        <div className="min-h-screen bg-[#0b1020] flex items-center justify-center">
          <div className="text-white text-center">
            <div className="w-8 h-8 border-2 border-[#415cff] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Loading debug overlay...</p>
          </div>
        </div>
      }>
        <SimpleOverlay />
      </Suspense>
    </OverlayDebugErrorBoundary>
  );
}
