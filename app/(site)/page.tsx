// app/(site)/page.tsx
'use client';

import { useEffect, useRef, useState } from 'react';

type Mode = 'funny' | 'motivator' | 'serious' | 'chill';
type StreamKind = 'just_chatting' | 'irl' | 'gaming' | 'music' | 'cooking';

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

  const toast = (msg: string) => {
    const el = document.getElementById('toast-bar');
    if (!el) return;
    el.textContent = msg;
    el.style.opacity = '1';
    if (toastRef.current) window.clearTimeout(toastRef.current);
    toastRef.current = window.setTimeout(() => (el.style.opacity = '0'), 1400);
  };

  async function generateLink() {
    if (!name.trim()) return toast('Enter your streamer name');
    try {
      setBusy(true);
      setCopied(false);
      const r = await fetch('/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), ttlSec: 6 * 60 * 60 }),
      });
      if (!r.ok) throw new Error(await r.text());
      const { token } = (await r.json()) as { token: string };
      const q = new URLSearchParams({
        t: token,
        m: mode,
        st: streamKind,
        v: voiceOn ? '1' : '0',
        f: friendOn ? '1' : '0',
        a: autoOn ? '1' : '0',
        s: String(Math.max(5, seconds)),
      });
      setOverlayUrl(`${window.location.origin}/overlay?${q.toString()}`);
      toast('Link generated');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Failed to generate link');
    } finally {
      setBusy(false);
    }
  }

  async function copyLink() {
    if (!overlayUrl) return;
    await navigator.clipboard.writeText(overlayUrl);
    setCopied(true);
    toast('Copied');
    window.setTimeout(() => setCopied(false), 1200);
  }

  function openOverlay() {
    if (!overlayUrl) return;
    window.open(overlayUrl, '_blank', 'noopener,noreferrer');
  }

  useEffect(() => {
    // лёгкая проверка «живости» API
    fetch('/api/ping').catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#0b1020_0%,#0c1226_100%)] text-[#e6e9f2]">
      <main className="max-w-6xl mx-auto px-5 pb-24 grid md:grid-cols-5 gap-16 md:gap-10">
        {/* left: setup */}
        <section className="md:col-span-3">
          <div className="rounded-2xl border border-[#243058] bg-[rgba(10,14,28,.88)] backdrop-blur p-5 md:p-6 shadow-[0_20px_60px_rgba(0,0,0,.45)]">
            <div className="text-base opacity-80 mb-2">Streamer setup</div>

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
              >
                {busy ? 'Generating…' : 'Generate link'}
              </button>
            </div>

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
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button
                  onClick={openOverlay}
                  disabled={!overlayUrl}
                  className={`px-3 py-3 rounded-xl text-sm ${
                    overlayUrl ? 'bg-[#19a974] text-white hover:bg-[#159267]' : 'bg-[#0f142b] text-[#6f79a7] cursor-not-allowed'
                  }`}
                >
                  Open overlay
                </button>
              </div>
              <div className="text-[11px] opacity-60 mt-2">
                Add this URL in OBS/Streamlabs as <b>Browser Source</b>.
              </div>
            </div>

            <Section title="Mode">
              <Pill active={mode === 'funny'}       onClick={() => setMode('funny')}>Funny</Pill>
              <Pill active={mode === 'motivator'}   onClick={() => setMode('motivator')}>Motivator</Pill>
              <Pill active={mode === 'serious'}     onClick={() => setMode('serious')}>Serious</Pill>
              <Pill active={mode === 'chill'}       onClick={() => setMode('chill')}>Chill</Pill>
            </Section>

            <Section title="Stream type">
              <Pill active={streamKind === 'just_chatting'} onClick={() => setStreamKind('just_chatting')}>Just chatting</Pill>
              <Pill active={streamKind === 'irl'}           onClick={() => setStreamKind('irl')}>IRL</Pill>
              <Pill active={streamKind === 'gaming'}        onClick={() => setStreamKind('gaming')}>Gaming</Pill>
              <Pill active={streamKind === 'music'}         onClick={() => setStreamKind('music')}>Music</Pill>
              <Pill active={streamKind === 'cooking'}       onClick={() => setStreamKind('cooking')}>Cooking</Pill>
            </Section>

            <Section title="">
              <Toggle label="Voice"  on={voiceOn}  onChange={setVoiceOn} />
              <Toggle label="Friend" on={friendOn} onChange={setFriendOn} />
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
            </Section>

            <div className="mt-4">
              <Toggle label="Auto tasks" on={autoOn} onChange={setAutoOn} />
            </div>
          </div>
        </section>

        {/* right: help blocks */}
        <section className="md:col-span-2">
          <div className="rounded-2xl border border-[#243058] bg-[rgba(10,14,28,.88)] backdrop-blur p-5 md:p-6 shadow-[0_20px_60px_rgba(0,0,0,.45)]">
            <div className="text-base opacity-80 mb-4">How it works</div>
            <Step n="1" title="Set name, mode & type" text="Pick vibe and stream type." />
            <Step n="2" title="Generate & copy link" text="Paste into OBS/Streamlabs as Browser Source." />
            <Step n="3" title="Go live" text="Tasks appear on stream. Control via in-overlay panel." />
          </div>
        </section>
      </main>

      {/* toast */}
      <div
        id="toast-bar"
        className="fixed left-1/2 -translate-x-1/2 bottom-6 px-4 py-2 rounded-xl text-sm bg-[#141a35] border border-[#2a3a7a] pointer-events-none transition-opacity duration-300 opacity-0"
      />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      {title && <div className="text-xs opacity-70 mb-2">{title}</div>}
      <div className="grid sm:grid-cols-3 gap-3">{children}</div>
    </div>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-xl border text-sm transition ${
        active ? 'bg-[#415cff] text-white border-transparent shadow-md'
               : 'bg-[#141a35] text-[#d3ddff] border-[#2a3a7a] hover:bg-[#182041]'
      }`}
    >
      {children}
    </button>
  );
}

function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div>
      <div className="text-xs opacity-70 mb-2">{label}</div>
      <button
        onClick={() => onChange(!on)}
        className={`w-full px-3 py-3 rounded-xl border text-sm transition ${
          on ? 'bg-[#19a974] text-white border-transparent'
             : 'bg-[#141a35] text-[#d3ddff] border-[#2a3a7a] hover:bg-[#182041]'
        }`}
      >
        {on ? `${label}: ON` : `${label}: OFF`}
      </button>
    </div>
  );
}

function Step({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <div className="flex gap-4 mb-4">
      <div className="h-8 w-8 rounded-xl bg-[#1e2a5d] border border-[#2a3a7a] grid place-items-center text-sm font-semibold">{n}</div>
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs opacity-70">{text}</div>
      </div>
    </div>
  );
}