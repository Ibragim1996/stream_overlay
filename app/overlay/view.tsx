// app/overlay/view.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
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
  const u = new URL(window.location.href);
  if (v === null) u.searchParams.delete(k);
  else u.searchParams.set(k, v);
  window.history.replaceState(null, '', u.toString());
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

export default function OverlayView() {
  const [token, setToken] = useState('');
  const [mode, setMode] = useState<Mode>('motivator');
  const [auto, setAuto] = useState(false);
  const [intervalSec, setIntervalSec] = useState(15);

  // Initialize from URL params on client side
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const urlParams = readSearch();
    const urlToken = urlParams.get('t') ?? '';
    const urlMode = urlParams.get('m') as Mode | null;
    const urlAuto = urlParams.get('a');
    const urlSec = urlParams.get('s');
    
    setToken(urlToken);
    setMode((urlMode && MODE_OPTIONS.some(o => o.key === urlMode) ? urlMode : null) ?? 'motivator');
    setAuto(urlAuto === '1');
    setIntervalSec(urlSec ? parseInt(urlSec, 10) : 15);
  }, []);

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
  }, [token]);

  async function onChangeMode(next: Mode) {
    setMode(next);
    setSearchParam('m', next);
    if (token) await saveState(token, { mode: next });
  }

  return (
    <OverlayClient
      mode={mode}
      auto={auto}
      intervalSec={intervalSec}
    />
  );
}