// app/overlay/view.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { MODE_OPTIONS, type Mode } from '@/lib/mode';
import OverlayClient from './OverlayClient';

type OverlayState = {
  mode?: Mode;
  seconds?: number;
  auto?: boolean;
  voice?: string;
  streamKind?: string;
};

function readSearch(): URLSearchParams {
  if (typeof window === 'undefined') return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}

function setSearchParam(k: string, v: string | null) {
  if (typeof window === 'undefined') return;
  try {
    const u = new URL(window.location.href);
    if (v === null) u.searchParams.delete(k);
    else u.searchParams.set(k, v);
    window.history.replaceState(null, '', u.toString());
  } catch (error) {
    console.error('Error setting search param:', error);
  }
}

async function fetchState(token: string): Promise<OverlayState> {
  const r = await fetch(`/api/state?token=${encodeURIComponent(token)}`, { cache: 'no-store' });
  if (!r.ok) return {};
  const j = (await r.json()) as { ok: boolean; state?: OverlayState };
  return j.ok ? (j.state ?? {}) : {};
}

async function saveState(token: string, patch: OverlayState): Promise<void> {
  await fetch('/api/state', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ token, patch }),
  }).catch(() => void 0);
}

function OverlayViewContent() {
  const [token, setToken] = useState('');
  const [mode, setMode] = useState<Mode>('motivator' as Mode);
  const [auto, setAuto] = useState(false);
  const [intervalSec, setIntervalSec] = useState(15);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from URL params on client side
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    console.log('🔍 OverlayView useEffect - initializing');
    
    try {
      const urlParams = readSearch();
      const urlToken = urlParams.get('t') ?? '';
      const urlMode = urlParams.get('m') as Mode | null;
      const urlAuto = urlParams.get('a');
      const urlSec = urlParams.get('s');
      
      console.log('🔍 URL params:', { urlToken, urlMode, urlAuto, urlSec });
      
      setToken(urlToken);
      setMode((urlMode && MODE_OPTIONS.some(o => o.key === urlMode) ? urlMode : 'motivator') as Mode);
      setAuto(urlAuto === '1');
      setIntervalSec(urlSec ? parseInt(urlSec, 10) : 15);
      setIsInitialized(true);
      
      console.log('🔍 OverlayView initialized successfully');
    } catch (error) {
      console.error('🚨 Error initializing overlay:', error);
      setIsInitialized(true);
    }
  }, []);

  // Show error if no token provided
  if (isInitialized && !token) {
    return (
      <div className="min-h-screen bg-[#0b1020] flex items-center justify-center">
        <div className="text-white text-center max-w-md mx-auto p-6">
          <div className="text-yellow-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-4">Missing Token</h2>
          <p className="text-gray-300 mb-4">
            The overlay requires a valid token. Please check your URL and try again.
          </p>
          <p className="text-sm text-gray-400 mb-4">
            Expected format: /overlay?t=YOUR_TOKEN&m=mode&a=auto&s=seconds
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-[#415cff] text-white rounded-lg hover:bg-[#3648e6] transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Show loading while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#0b1020] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-2 border-[#415cff] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Initializing overlay...</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      const server = await fetchState(token);
      if (cancelled) return;
      const effectiveMode = server.mode && MODE_OPTIONS.some(o => o.key === server.mode) ? server.mode : mode;
      setMode(effectiveMode);
      setSearchParam('m', effectiveMode);
    })();
    return () => { cancelled = true; };
  }, [token, mode]);

  async function onChangeMode(next: Mode) {
    setMode(next);
    setSearchParam('m', next);
    if (token) await saveState(token, { mode: next });
  }

  return (
    <OverlayClient
      name={token}
      mode={mode}
      auto={auto}
      intervalSec={intervalSec}
    />
  );
}

export default function OverlayView() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0b1020] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-2 border-[#415cff] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading overlay...</p>
        </div>
      </div>
    }>
      <OverlayViewContent />
    </Suspense>
  );
}