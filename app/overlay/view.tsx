// app/overlay/view.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { MODE_OPTIONS, type Mode } from '@/lib/mode';

type OverlayState = {
  mode?: Mode;
  seconds?: number;
  auto?: boolean;
  voice?: boolean;
  friend?: boolean;
  streamKind?: 'just_chatting' | 'irl' | 'other';
};

function readSearch(): URLSearchParams {
  return new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
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
  const token = useMemo(() => readSearch().get('t') ?? '', []);
  const [mode, setMode] = useState<Mode>(() => {
    const urlMode = readSearch().get('m') as Mode | null;
    return (urlMode && (MODE_OPTIONS.some(o => o.key === urlMode) ? urlMode : null)) ?? 'motivator';
  });

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
    <div className="fixed left-3 bottom-3 z-[1000] rounded-2xl border border-[#243058] bg-[rgba(10,14,28,.88)] backdrop-blur px-3 py-2 text-xs text-[#e6e9f2]">
      <div className="mb-1 opacity-80">Tone</div>
      <div className="flex flex-wrap gap-2 max-w-[80vw]">
        {MODE_OPTIONS.map(opt => {
          const active = opt.key === mode;
          return (
            <button
              key={opt.key}
              title={opt.hint}
              onClick={() => onChangeMode(opt.key)}
              className={
                'px-2 py-1 rounded-lg border transition ' +
                (active
                  ? 'bg-[#415cff] text-white border-transparent shadow'
                  : 'bg-[#141a35] text-[#d3ddff] border-[#2a3a7a] hover:bg-[#182041]')
              }
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}