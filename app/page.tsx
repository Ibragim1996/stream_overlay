// app/page.tsx
'use client';

import { useRef, useState } from 'react';

/** Тоны (режимы) для генерации задач */
type Mode = 'funny' | 'motivator' | 'serious' | 'chill' | 'street';

/** Типы стримов (сократили список) */
type StreamKind = 'just_chatting' | 'irl' | 'cozy';

export default function HomePage() {
  // form state
  const [name, setName] = useState('');
  const [mode, setMode] = useState<Mode>('motivator');
  const [streamKind, setStreamKind] = useState<StreamKind>('just_chatting');
  const [voiceOn, setVoiceOn] = useState(false);
  const [friendOn, setFriendOn] = useState(false);
  const [autoOn, setAutoOn] = useState(false);
  const [seconds, setSeconds] = useState(12);

  // link state
  const [overlayUrl, setOverlayUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const toastRef = useRef<number | null>(null);

  // tiny toast
  const toast = (msg: string) => {
    const el = document.getElementById('toast-bar');
    if (!el) return;
    el.textContent = msg;
    el.style.opacity = '1';
    if (toastRef.current) window.clearTimeout(toastRef.current);
    toastRef.current = window.setTimeout(() => {
      el.style.opacity = '0';
    }, 1400);
  };

  // generate signed token and build overlay URL
  const generateLink = async () => {
    if (!name.trim()) {
      toast('Enter your streamer name');
      return;
    }
    try {
      setBusy(true);
      setCopied(false);

      const res = await fetch('/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), ttlSec: 6 * 60 * 60 }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Token error: ${res.status} ${txt}`);
      }

      const data = (await res.json()) as { token?: string };
      const token = String(data?.token ?? '');

      if (!token) throw new Error('Token is missing');

      const q = new URLSearchParams({
        t: token,
        m: mode,                       // tone
        st: streamKind,               // stream type
        v: voiceOn ? '1' : '0',       // voice
        f: friendOn ? '1' : '0',      // friend
        a: autoOn ? '1' : '0',        // auto tasks
        s: String(Math.max(5, seconds)),
      });

      const url = `${window.location.origin}/overlay?${q.toString()}`;
      setOverlayUrl(url);
      toast('Link generated');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to generate link');
    } finally {
      setBusy(false);
    }
  };

  const copyLink = async () => {
    if (!overlayUrl) return;
    try {
      await navigator.clipboard.writeText(overlayUrl);
      setCopied(true);
      toast('Copied');
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      toast('Copy failed');
    }
  };

  const openOverlay = () => {
    if (!overlayUrl) return;
    window.open(overlayUrl, '_blank', 'noopener,noreferrer');
  };

  // UI helpers
  const ToneButton = (key: Mode, label: string, hint?: string) => {
    const active = mode === key;
    return (
      <button
        onClick={() => setMode(key)}
        className={`px-3 py-2 rounded-xl border text-sm transition ${
          active
            ? 'bg-[#415cff] text-white border-transparent shadow-md'
            : 'bg-[#141a35] text-[#d3ddff] border-[#2a3a7a] hover:bg-[#182041]'
        }`}
        title={hint}
        type="button"
      >
        {label}
      </button>
    );
  };

  const StreamButton = (key: StreamKind, label: string, hint?: string) => {
    const active = streamKind === key;
    return (
      <button
        onClick={() => setStreamKind(key)}
        className={`px-3 py-2 rounded-xl border text-sm transition ${
          active
            ? 'bg-[#19a974] text-white border-transparent shadow-md'
            : 'bg-[#141a35] text-[#d3ddff] border-[#2a3a7a] hover:bg-[#182041]'
        }`}
        title={hint}
        type="button"
      >
        {label}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#0b1020_0%,#0c1226_100%)] text-[#e6e9f2]">
      {/* top bar (nav отрисовывается в layout, здесь — только заголовок блока) */}
      <header className="max-w-6xl mx-auto px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-[#1e2a5d] border border-[#2a3a7a] grid place-items-center text-xs font-bold">
            AI
          </div>
          <div className="text-lg font-semibold tracking-wide">Seeko Overlay</div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 pb-24 grid md:grid-cols-5 gap-16 md:gap-10">
        {/* left: setup */}
        <section className="md:col-span-3">
          <div className="rounded-2xl border border-[#243058] bg-[rgba(10,14,28,.88)] backdrop-blur p-5 md:p-6 shadow-[0_20px_60px_rgba(0,0,0,.45)]">
            <div className="text-base opacity-80 mb-2">Streamer setup</div>

            {/* name + generate */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your streamer name"
                className="flex-1 rounded-xl border border-[#243058] bg-[#0c1226] px-4 py-3 outline-none focus:ring-2 focus:ring-[#415cff]/40"
              />
              <button
                onClick={generateLink}
                disabled={busy}
                className={`px-4 py-3 rounded-xl text-white text-sm font-medium transition ${
                  busy ? 'bg-[#3243a6]/70 cursor-not-allowed' : 'bg-[#415cff] hover:bg-[#3243a6]'
                }`}
                type="button"
              >
                {busy ? 'Generating…' : 'Generate link'}
              </button>
            </div>

            {/* overlay url */}
            <div className="mb-6">
              <label className="text-xs opacity-70">Overlay URL</label>
              <div className="mt-2 flex gap-2">
                <input
                  readOnly
                  value={overlayUrl}
                  placeholder="Generate link to see URL"
                  className="flex-1 rounded-xl border border-[#243058] bg-[#0c1226] px-4 py-3 text-xs md:text-sm opacity-90"
                />
                <button
                  onClick={copyLink}
                  disabled={!overlayUrl}
                  className={`px-3 py-3 rounded-xl border text-sm ${
                    overlayUrl
                      ? 'bg-[#141a35] text-[#d3ddff] border-[#2a3a7a] hover:bg-[#182041]'
                      : 'bg-[#0f142b] text-[#6f79a7] border-[#1d274f] cursor-not-allowed'
                  }`}
                  type="button"
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button
                  onClick={openOverlay}
                  disabled={!overlayUrl}
                  className={`px-3 py-3 rounded-xl text-sm ${
                    overlayUrl
                      ? 'bg-[#19a974] text-white hover:bg-[#159267]'
                      : 'bg-[#0f142b] text-[#6f79a7] cursor-not-allowed'
                  }`}
                  type="button"
                >
                  Open overlay
                </button>
              </div>
              <div className="text-[11px] opacity-60 mt-2">
                Add this URL in OBS/Streamlabs as <b>Browser Source</b>. Use your canvas size (e.g., 1920×1080).
              </div>
            </div>

            {/* tones */}
            <div className="mb-4">
              <div className="text-xs opacity-70 mb-2">Tone</div>
              <div className="flex flex-wrap gap-2">
                {ToneButton('funny', 'Funny')}
                {ToneButton('motivator', 'Motivator')}
                {ToneButton('serious', 'Serious')}
                {ToneButton('chill', 'Chill')}
                {ToneButton('street', 'Street / Urban', 'Casual slang. No hate/offense; PG-13.')}
              </div>
              <div className="text-[11px] opacity-60 mt-2">
                <b>Street / Urban</b> — разговорный сленг (без оскорблений и без имитации акцентов/групп; всё дружелюбно и PG-13).
              </div>
            </div>

            {/* stream type */}
            <div className="mb-4">
              <div className="text-xs opacity-70 mb-2">Stream type</div>
              <div className="flex flex-wrap gap-2">
                {StreamButton('just_chatting', 'Just chatting', 'At desk / chatting with viewers')}
                {StreamButton('irl', 'IRL', 'Outdoors / on the move')}
                {StreamButton('cozy', 'Cozy', 'Chill vibe / focus / podcast-like')}
              </div>
            </div>

            {/* toggles + interval */}
            <div className="grid sm:grid-cols-3 gap-3">
              <Toggle label="Voice" on={voiceOn} onChange={setVoiceOn} hint="Speak tasks out loud in overlay" />
              <Toggle label="Friend" on={friendOn} onChange={setFriendOn} hint="AI Friend tips (subtle reactions)" />
              <div>
                <div className="text-xs opacity-70 mb-2">Auto task interval (sec)</div>
                <input
                  type="number"
                  min={5}
                  value={seconds}
                  onChange={(e) => setSeconds(Math.max(5, Number(e.target.value || 0)))}
                  className="w-full rounded-xl border border-[#243058] bg-[#0c1226] px-4 py-3 outline-none focus:ring-2 focus:ring-[#415cff]/40"
                />
              </div>
            </div>

            {/* auto */}
            <div className="mt-4">
              <Toggle label="Auto tasks" on={autoOn} onChange={setAutoOn} hint="Automatically request tasks on the overlay" />
            </div>

            <div className="text-xs opacity-60 mt-4">
              The overlay reads these settings from the URL (tone / stream type / voice / friend / auto / seconds). You can
              re-generate the link anytime.
            </div>
          </div>
        </section>

        {/* right: how it works */}
        <section className="md:col-span-2">
          <div className="rounded-2xl border border-[#243058] bg-[rgba(10,14,28,.88)] backdrop-blur p-5 md:p-6 shadow-[0_20px_60px_rgba(0,0,0,.45)]">
            <div className="text-base opacity-80 mb-4">How it works</div>
            <Step n="1" title="Set name, tone & type" text="Pick vibe (Funny/Motivator/etc.) and stream type (Chatting/IRL/Cozy)." />
            <Step n="2" title="Generate & copy link" text="Paste the link into OBS/Streamlabs as a Browser Source." />
            <Step n="3" title="Go live" text="Tasks appear on stream. Use the tiny in-overlay panel to control." />
          </div>
          <div className="mt-6 rounded-2xl border border-[#243058] bg-[rgba(10,14,28,.88)] backdrop-blur p-5 md:p-6">
            <div className="text-base opacity-80 mb-2">Legal & support</div>
            <ul className="list-disc ml-5 text-sm opacity-80 space-y-1">
              <li>Keep tasks safe and TOS-friendly for your platform.</li>
              <li>We don’t stream your content — this is an overlay only.</li>
              <li>Questions? Reach us anytime — we’re here to help.</li>
            </ul>
          </div>
        </section>
      </main>

      {/* footer */}
      <footer className="max-w-6xl mx-auto px-5 pb-10 text-xs opacity-60">
        © {new Date().getFullYear()} Seeko. All rights reserved.
      </footer>

      {/* tiny toast */}
      <div
        id="toast-bar"
        className="fixed left-1/2 -translate-x-1/2 bottom-6 px-4 py-2 rounded-xl text-sm bg-[#141a35] border border-[#2a3a7a] pointer-events-none transition-opacity duration-300 opacity-0"
      />
    </div>
  );
}

/* ——— small components ——— */

function Toggle({
  label,
  on,
  onChange,
  hint,
}: {
  label: string;
  on: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}) {
  return (
    <div>
      <div className="text-xs opacity-70 mb-2">{label}</div>
      <button
        onClick={() => onChange(!on)}
        className={`w-full px-3 py-3 rounded-xl border text-sm transition ${
          on ? 'bg-[#19a974] text-white border-transparent' : 'bg-[#141a35] text-[#d3ddff] border-[#2a3a7a] hover:bg-[#182041]'
        }`}
        title={hint}
        type="button"
      >
        {on ? `${label}: ON` : `${label}: OFF`}
      </button>
    </div>
  );
}

function Step({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <div className="flex gap-4 mb-4">
      <div className="h-8 w-8 rounded-xl bg-[#1e2a5d] border border-[#2a3a7a] grid place-items-center text-sm font-semibold">
        {n}
      </div>
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs opacity-70">{text}</div>
      </div>
    </div>
  );
}