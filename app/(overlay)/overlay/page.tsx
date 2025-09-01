// app/overlay/page.tsx
'use client';

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  type CSSProperties,
} from 'react';

type Mode = 'funny' | 'motivator' | 'serious' | 'chill';
type TaskType = 'question' | 'challenge' | 'just_talk' | 'joke';
type StreamKind = 'just_chat' | 'irl' | 'gaming' | 'music' | 'cooking';
type Status = 'checking' | 'invalid' | 'ready';
type Position =
  | 'top-left' | 'top-center' | 'top-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

export default function OverlayPage() {
  // -------- URL params (once) --------
  // -------- URL params (once) --------
const params = useMemo(() => {
  if (typeof window === 'undefined') return null;

  // авто-детект языка
  const detectLang = (): 'en' | 'ru' | 'es' => {
    const sp = new URLSearchParams(window.location.search);
    const q = sp.get('lg');
    if (q === 'en' || q === 'ru' || q === 'es') return q;

    // cookie, который ставит middleware
    const m = document.cookie.match(/(?:^|; )locale=(en|ru|es)/);
    if (m) return m[1] as 'en' | 'ru' | 'es';

    // запасной вариант — язык браузера
    const n = (navigator.language || 'en').slice(0, 2).toLowerCase();
    return n === 'ru' || n === 'es' ? (n as 'ru' | 'es') : 'en';
  };

  const sp = new URLSearchParams(window.location.search);
  return {
    token: sp.get('t') || '',
    mode: (sp.get('m') as Mode) || 'motivator',
    taskType: (sp.get('tt') as TaskType) || 'challenge',
    streamKind: (sp.get('sc') as StreamKind) || 'just_chat',
    voiceOn: sp.get('v') === '1',
    friendOn: sp.get('f') === '1',
    autoOn: sp.get('a') === '1',
    seconds: Math.max(5, Number(sp.get('s') || 12)),
    panel: sp.get('panel') === '1',
    lang: (sp.get('lg') as 'en' | 'ru' | 'es') || detectLang(),
  };
}, []);

  // -------- state --------
  const [status, setStatus] = useState<Status>('checking');
  const [name, setName] = useState('');
  const [mode, setMode] = useState<Mode>('motivator');
  const [taskType, setTaskType] = useState<TaskType>('challenge');
  const [streamKind, setStreamKind] = useState<StreamKind>('just_chat');

  const [task, setTask] = useState('');
  const [isFetching, setIsFetching] = useState(false);

  const [voiceOn, setVoiceOn] = useState(false);
  const [friendOn, setFriendOn] = useState(false);
  const [auto, setAuto] = useState(false);
  const [seconds, setSeconds] = useState(12);

  const [panelOpen, setPanelOpen] = useState(false);
  const [safeBottom, setSafeBottom] = useState(24); // панель не перекрывает пузырь
  const [bubbleW, setBubbleW] = useState(520);      // узкая ширина текста

  // позиционирование
  const [pos, setPos] = useState<Position>('bottom-center'); // пресет
  const [dragEnabled, setDragEnabled] = useState(false);
  const [customPos, setCustomPos] = useState(false); // фиксируем XY независимо от панели
  const [xy, setXy] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const [friendTip, setFriendTip] = useState('');

  // -------- refs --------
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const friendTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const bubbleRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const startRef = useRef<{ x: number; y: number; bx: number; by: number; bw: number; bh: number }>({
    x: 0, y: 0, bx: 0, by: 0, bw: 0, bh: 0,
  });

  // -------- init from URL --------
  useEffect(() => {
    if (!params) return;
    setMode(params.mode);
    setTaskType(params.taskType);
    setStreamKind(params.streamKind);
    setVoiceOn(params.voiceOn);
    setFriendOn(params.friendOn);
    setAuto(params.autoOn);
    setSeconds(params.seconds);

    const remembered = typeof window !== 'undefined' && localStorage.getItem('ovl_panel') === '1';
    setPanelOpen(params.panel || remembered);
  }, [params]);

  // panel persist + hotkey
  useEffect(() => {
    if (panelOpen) localStorage.setItem('ovl_panel', '1');
    else localStorage.removeItem('ovl_panel');
  }, [panelOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key.toLowerCase() === 'p') setPanelOpen(v => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // -------- safe bottom + bubble width --------
  useEffect(() => {
    const recalc = () => {
      const ph = panelRef.current?.offsetHeight || 0;
      setSafeBottom(ph ? ph + 28 : 24);

      const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
      const target = Math.min(520, Math.max(260, Math.floor(vw * 0.45)));
      setBubbleW(target);
    };
    recalc();
    const ro = new ResizeObserver(recalc);
    if (panelRef.current) ro.observe(panelRef.current);
    window.addEventListener('resize', recalc);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', recalc);
    };
  }, [panelOpen]);

  // -------- включили Drag: зафиксировать текущее положение пузыря, чтобы не «прыгнул» --------
  useEffect(() => {
    if (!dragEnabled || !bubbleRef.current) return;
    const r = bubbleRef.current.getBoundingClientRect();
    setXy({ x: r.left, y: r.top });
    setCustomPos(true); // дальше XY не будет зависеть от панели
  }, [dragEnabled]);

  // -------- Broadcast channel --------
  useEffect(() => {
    const bc = new BroadcastChannel('overlay-bus');
    bc.onmessage = (ev) => {
      const msg = ev.data || {};
      if (msg.type === 'friend-tip' && friendOn) {
        setFriendTip(msg.text || '');
        if (friendTimerRef.current) clearTimeout(friendTimerRef.current);
        friendTimerRef.current = setTimeout(() => setFriendTip(''), 4200);
      }
      if (msg.type === 'task' && typeof msg.text === 'string') {
        setTask(String(msg.text));
        if (voiceOn) speak(String(msg.text));
      }
      if (msg.type === 'settings' && msg.payload && typeof msg.payload === 'object') {
        const s = msg.payload as Partial<{
          mode: Mode; taskType: TaskType; streamKind: StreamKind;
          voiceOn: boolean; auto: boolean; seconds: number; position: Position;
        }>;
        if (s.mode) setMode(s.mode);
        if (s.taskType) setTaskType(s.taskType);
        if (s.streamKind) setStreamKind(s.streamKind);
        if (typeof s.voiceOn === 'boolean') setVoiceOn(s.voiceOn);
        if (typeof s.auto === 'boolean') setAuto(s.auto);
        if (typeof s.seconds === 'number') setSeconds(Math.max(5, s.seconds));
        if (s.position) { setCustomPos(false); setPos(s.position); }
      }
    };
    return () => bc.close();
  }, [friendOn, voiceOn]);

 // -------- token validate --------
useEffect(() => {
  const run = async () => {
    if (!params) return;
    if (!params.token) return setStatus('invalid');

    try {
      const res = await fetch('/api/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: params.token,
          mode,
          taskType,
          streamKind,
          kind: 'ping',          // <- проверка токена
          lang: params.lang,     // <- добавили язык
        }),
      });

      if (res.status === 401) return setStatus('invalid');

  const data: { ok?: boolean; name?: string } = await res.json().catch(() => ({}));
      if (data?.ok) {
        setName(String(data.name || ''));
        setStatus('ready');
      } else {
        setStatus('invalid');
      }
    } catch {
      setStatus('invalid');
    }
  };

  run();
  return () => stopAuto();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [params?.token]);// -------- token validate --------

  const nextTask = async () => {
  if (!params?.token) return;
  setIsFetching(true);
  try {
    const res = await fetch('/api/task', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: params.token,
        mode,
        taskType,
        streamKind,
        kind: 'next',
        lang: params.lang, // <- важное добавление
      }),
    });

    if (res.status === 401) {
      setStatus('invalid');
      stopAuto();
      return;
    }

  const data: { ok?: boolean; task?: string } = await res.json().catch(() => ({}));
    if (data?.ok && typeof data.task === 'string') {
      const t = data.task as string;
      setTask(t);
      if (voiceOn) speak(t);
    }
  } finally {
    setIsFetching(false);
  }
};

  // -------- auto --------
  const startAuto = () => {
    stopAuto();
    setAuto(true);
    timerRef.current = setInterval(nextTask, Math.max(5, seconds) * 1000);
  };
  const stopAuto = () => {
    setAuto(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };
  useEffect(() => {
    if (status !== 'ready') return;
    if (auto) startAuto();
    return () => stopAuto();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);
  useEffect(() => {
    if (!auto) return;
    startAuto();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, mode, taskType, streamKind]);

  // -------- TTS --------
  const speak = (text: string) => {
    try {
      const synth = window.speechSynthesis;
      if (!synth) return;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.0; u.pitch = 1.0;
      synth.speak(u);
    } catch {}
  };

  // -------- drag handlers (с клампом по краям окна) --------
  const clampXY = useCallback((x: number, y: number, w: number, h: number) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const pad = 4; // на самый низ можно опустить до 4px
    const nx = Math.min(Math.max(x, pad), Math.max(vw - w - pad, pad));
    const ny = Math.min(Math.max(y, pad), Math.max(vh - h - pad, pad));
    return { x: nx, y: ny };
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!dragEnabled || !bubbleRef.current) return;
    draggingRef.current = true;
    (document.body || document.documentElement).style.userSelect = 'none';

    const r = bubbleRef.current.getBoundingClientRect();
    startRef.current = { x: e.clientX, y: e.clientY, bx: r.left, by: r.top, bw: r.width, bh: r.height };
    setCustomPos(true);
  };

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!draggingRef.current) return;
      const dx = e.clientX - startRef.current.x;
      const dy = e.clientY - startRef.current.y;
      const { x, y } = clampXY(startRef.current.bx + dx, startRef.current.by + dy, startRef.current.bw, startRef.current.bh);
      setXy({ x, y });
    };
    const onUp = () => {
      draggingRef.current = false;
      (document.body || document.documentElement).style.userSelect = '';
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [clampXY]);

  // -------- вычисляем стиль якоря пузыря --------
  const bubbleAnchorStyle = useMemo<CSSProperties>(() => {
    if (dragEnabled || customPos) {
      return { position: 'absolute', left: xy.x, top: xy.y, pointerEvents: 'auto' };
    }
    const base: CSSProperties = { position: 'absolute' };
    switch (pos) {
      case 'top-left':     return { ...base, top: 24, left: 24 };
      case 'top-center':   return { ...base, top: 24, left: '50%', transform: 'translateX(-50%)' };
      case 'top-right':    return { ...base, top: 24, right: 24 };
      case 'bottom-left':  return { ...base, bottom: safeBottom, left: 24 };
      case 'bottom-right': return { ...base, bottom: safeBottom, right: 24 };
      case 'bottom-center':
      default:             return { ...base, bottom: safeBottom, left: '50%', transform: 'translateX(-50%)' };
    }
  }, [pos, safeBottom, dragEnabled, customPos, xy]);

  // -------- UI --------
  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: 'transparent', pointerEvents: 'none' }}>
      {/* TASK BUBBLE */}
<div
  ref={bubbleRef}
  style={{ ...bubbleWrap, ...bubbleAnchorStyle, pointerEvents: dragEnabled ? 'auto' : 'none' }}
  onPointerDown={dragEnabled ? onPointerDown : undefined}
>
  <div style={bubble(bubbleW)}>
    {status === 'checking' && <div style={dim}>Connecting...</div>}
    {status === 'invalid' && <div>Invalid or expired link.</div>}
    {status === 'ready' && (
      <div style={{ fontSize: 18, lineHeight: '26px', fontWeight: 700, minHeight: 26, wordBreak: 'break-word' }}>
        {isFetching ? <Dots /> : task || 'Connected. Click Next or enable Auto.'}
      </div>
    )}
  </div>
</div>

      {/* FRIEND TIP (top center) */}
      {friendOn && friendTip && (
        <div style={topCenterWrap}>
          <div style={friendBubble}>{friendTip}</div>
        </div>
      )}

      {/* PANEL (visible to streamer only) */}
      {status === 'ready' && (
        <div style={panelWrap}>
          <div ref={panelRef} style={panel}>
            <div style={panelHead}>
              <div style={{ fontSize: 11, opacity: 0.7 }}>Overlay controls</div>
              <button style={gearBtn} onClick={() => setPanelOpen(v => !v)} aria-label="Advanced">⚙</button>
            </div>

            <div style={row}>
              <button style={btnSm()} onClick={nextTask} disabled={isFetching}>
                {isFetching ? 'Loading…' : 'Next'}
              </button>
              <button style={btnSm(auto)} onClick={auto ? stopAuto : startAuto}>
                {auto ? 'Auto: ON' : 'Auto: OFF'}
              </button>
              <Toggle label="Voice" on={voiceOn} onClick={() => setVoiceOn(v => !v)} />
              <Toggle label="Drag" on={dragEnabled} onClick={() => setDragEnabled(v => !v)} />
              <button style={btnSm()} onClick={() => { setCustomPos(false); setPos('bottom-center'); }}>
                Reset
              </button>
            </div>

            {/* позиция (когда drag выключен) */}
            {!dragEnabled && (
              <div style={{ ...row, marginTop: 8 }}>
                <PosBtn label="TL" on={pos === 'top-left'} click={() => { setCustomPos(false); setPos('top-left'); }} />
                <PosBtn label="TC" on={pos === 'top-center'} click={() => { setCustomPos(false); setPos('top-center'); }} />
                <PosBtn label="TR" on={pos === 'top-right'} click={() => { setCustomPos(false); setPos('top-right'); }} />
                <PosBtn label="BL" on={pos === 'bottom-left'} click={() => { setCustomPos(false); setPos('bottom-left'); }} />
                <PosBtn label="BC" on={pos === 'bottom-center'} click={() => { setCustomPos(false); setPos('bottom-center'); }} />
                <PosBtn label="BR" on={pos === 'bottom-right'} click={() => { setCustomPos(false); setPos('bottom-right'); }} />
              </div>
            )}

            <div style={{ height: 8 }} />
            <div style={row}>
              <div style={numWrap}>
                <span style={numLabel}>Seconds</span>
                <input
                  type="number"
                  min={5}
                  value={seconds}
                  onChange={(e) => setSeconds(Math.max(5, Number(e.target.value || 0)))}
                  style={num}
                  title="Seconds"
                />
              </div>
            </div>

            {/* advanced */}
            {panelOpen && (
              <>
                <div style={{ height: 10 }} />
                <div style={hintRow}>Advanced</div>

                <div style={groupLabel}>Tone</div>
                <div style={grid2}>
                  {(['funny', 'motivator', 'serious', 'chill'] as Mode[]).map(k => (
                    <Chip key={k} active={mode === k} onClick={() => setMode(k)} label={modeLabel(k)} />
                  ))}
                </div>

                <div style={groupLabel}>Task type</div>
                <div style={grid3}>
                  {(['question', 'challenge', 'just_talk', 'joke'] as TaskType[]).map(k => (
                    <Chip key={k} active={taskType === k} onClick={() => setTaskType(k)} label={taskTypeLabel(k)} />
                  ))}
                </div>

                <div style={groupLabel}>Stream type</div>
                <div style={grid3}>
                  {(['just_chat', 'irl', 'gaming', 'music', 'cooking'] as StreamKind[]).map(k => (
                    <Chip key={k} active={streamKind === k} onClick={() => setStreamKind(k)} label={streamKindLabel(k)} />
                  ))}
                </div>
              </>
            )}

            <div style={hint}>Streamer: {name || 'unknown'}</div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- helpers ---------- */
function modeLabel(m: Mode) {
  if (m === 'funny') return 'Funny';
  if (m === 'motivator') return 'Motivator';
  if (m === 'serious') return 'Serious';
  return 'Chill';
}
function taskTypeLabel(t: TaskType) {
  if (t === 'question') return 'Question';
  if (t === 'challenge') return 'Challenge';
  if (t === 'just_talk') return 'Just talk';
  return 'Joke/Roast';
}
function streamKindLabel(s: StreamKind) {
  if (s === 'just_chat') return 'Just chatting';
  if (s === 'irl') return 'IRL';
  if (s === 'gaming') return 'Gaming';
  if (s === 'music') return 'Music';
  return 'Cooking';
}

function Toggle(props: { label: string; on: boolean; onClick: () => void }) {
  const { label, on, onClick } = props;
  return (
    <button
      onClick={onClick}
      style={{
        fontSize: 11,
        padding: '6px 10px',
        borderRadius: 999,
        border: '1px solid #2a3a7a',
        background: on ? '#19a974' : '#1f2a55',
        color: on ? '#fff' : '#d3ddff',
        cursor: 'pointer',
        pointerEvents: 'auto',
      }}
    >
      {label}: {on ? 'ON' : 'OFF'}
    </button>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontSize: 12,
        padding: '6px 10px',
        borderRadius: 12,
        border: '1px solid #2a3a7a',
        background: active ? '#415cff' : '#141a35',
        color: active ? '#fff' : '#d3ddff',
        cursor: 'pointer',
        pointerEvents: 'auto',
        textAlign: 'center',
      }}
      title={label}
    >
      {label}
    </button>
  );
}

function PosBtn({ label, on, click }: { label: string; on: boolean; click: () => void }) {
  return (
    <button
      onClick={click}
      style={{
        fontSize: 11,
        padding: '6px 8px',
        borderRadius: 8,
        border: '1px solid #2a3a7a',
        background: on ? '#415cff' : '#141a35',
        color: on ? '#fff' : '#d3ddff',
        cursor: 'pointer',
        pointerEvents: 'auto',
      }}
      title={`Place: ${label}`}
    >
      {label}
    </button>
  );
}

function Dots() {
  return (
    <span style={{ display: 'inline-block', minWidth: 60 }}>
      <span className="animate-pulse">Fetching</span>
      <span className="animate-pulse">…</span>
    </span>
  );
}

/* ---------- styles ---------- */
const dim: CSSProperties = { opacity: 0.7 };

const bubble = (w: number): CSSProperties => ({
  background: 'rgba(11,16,32,.92)',
  color: '#e6e9f2',
  border: '1px solid #243058',
  borderRadius: 16,
  padding: '14px 18px',
  boxShadow: '0 12px 40px rgba(0,0,0,.45)',
  maxWidth: w,
  width: 'max-content',
  pointerEvents: 'none',
  backdropFilter: 'blur(4px)',
  zIndex: 10,
  whiteSpace: 'pre-wrap',
});

const bubbleWrap: CSSProperties = {
  position: 'absolute',
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'flex-end',
  pointerEvents: 'none', // клики сквозь пузырь; drag включаем на контейнере через onPointerDown
};

const friendBubble: CSSProperties = {
  background: 'rgba(12,18,38,.9)',
  color: '#d9e1ff',
  border: '1px solid #2a3a7a',
  borderRadius: 12,
  padding: '10px 14px',
  boxShadow: '0 14px 44px rgba(0,0,0,.5)',
  maxWidth: 640,
  pointerEvents: 'none',
  zIndex: 10,
};

const topCenterWrap: CSSProperties = {
  position: 'absolute',
  left: 0,
  right: 0,
  top: 24,
  display: 'flex',
  justifyContent: 'center',
  pointerEvents: 'none',
  zIndex: 5,
};

const panelWrap: CSSProperties = {
  position: 'absolute',
  right: 24,
  bottom: 24,
  pointerEvents: 'auto',
  zIndex: 9999,
};

const panel: CSSProperties = {
  background: 'rgba(10,14,28,.88)',
  border: '1px solid #243058',
  color: '#dbe3ff',
  borderRadius: 14,
  padding: 10,
  minWidth: 260,
  boxShadow: '0 20px 60px rgba(0,0,0,.55)',
  backdropFilter: 'blur(6px)',
};

const panelHead: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: 8,
};

const gearBtn: CSSProperties = {
  background: '#141a35',
  color: '#d3ddff',
  border: '1px solid #2a3a7a',
  borderRadius: 10,
  padding: '6px 10px',
  cursor: 'pointer',
  pointerEvents: 'auto',
};

const row: CSSProperties = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
  pointerEvents: 'auto',
  alignItems: 'center',
};

const numWrap: CSSProperties = { display: 'flex', gap: 6, alignItems: 'center' };
const numLabel: CSSProperties = { fontSize: 11, opacity: 0.7 };
const num: CSSProperties = {
  width: 84,
  background: '#0c1226',
  color: '#e6e9f2',
  border: '1px solid #243058',
  borderRadius: 10,
  padding: '8px 10px',
  pointerEvents: 'auto',
};

const grid2: CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, pointerEvents: 'auto' };
const grid3: CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, pointerEvents: 'auto' };

const hintRow: CSSProperties = {
  fontSize: 11,
  opacity: 0.8,
  padding: '6px 8px',
  background: 'rgba(20,26,53,.6)',
  border: '1px dashed #2a3a7a',
  borderRadius: 10,
  marginBottom: 8,
};

const hint: CSSProperties = { fontSize: 11, opacity: 0.6, marginTop: 8 };
const groupLabel: CSSProperties = { marginTop: 12, marginBottom: 4, fontSize: 11, opacity: 0.7 };

const btnSm = (active = false): CSSProperties => ({
  background: active ? '#415cff' : '#1f2a55',
  color: active ? '#fff' : '#d3ddff',
  border: '1px solid #2a3a7a',
  borderRadius: 10,
  padding: '6px 10px',
  cursor: 'pointer',
  pointerEvents: 'auto',
});