// app/overlay/OverlayClient.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type Mode = "motivator" | "funny" | "serious" | "chill";
type Voice = "male" | "female" | "robot";

const VOICE_OPTIONS = [
  { key: "male" as Voice, label: "Professional", emoji: "👨", style: "Confident & Clear" },
  { key: "female" as Voice, label: "Friendly", emoji: "👩", style: "Warm & Engaging" },
  { key: "robot" as Voice, label: "Tech", emoji: "🤖", style: "Precise & Modern" },
];

export default function OverlayClient(props: {
  name?: string;
  mode?: Mode;
  auto?: boolean;
  intervalSec?: number;
}) {
  const [task, setTask] = useState<string>("Loading...");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>("motivator");
  const [voice, setVoice] = useState<Voice>("male");
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 85 }); // в процентах - нижняя часть экрана
  const [showPanel, setShowPanel] = useState(true);
  
  const timerRef = useRef<number | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; startPos: { x: number; y: number } } | null>(null);

  const name = props.name ?? "";

  // Initialize mode from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlMode = urlParams.get('m');
    if (urlMode && ['motivator', 'funny', 'serious', 'chill'].includes(urlMode)) {
      setMode(urlMode as Mode);
    }
  }, []);

  const fetchTask = useCallback(async () => {
    try {
      setLoading(true);
      
      // Получаем токен из URL
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('t');
      
      if (!token) {
        setTask("No token provided");
        return;
      }

      const res = await fetch("/api/task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          mode,
          voice,
          streamKind: "just_chatting",
          kind: "next",
        }),
      });

      if (res.status === 401) {
        setTask("Invalid or expired token");
        return;
      }

      const data = await res.json();
      setTask(data.task || "Try a quick smile to the camera.");
    } catch {
      setTask("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }, [mode, voice]);

  // авто-обновление
  useEffect(() => {
    if (!props.auto) return;
    const ms = Math.max(5, props.intervalSec ?? 15) * 1000;
    timerRef.current = window.setInterval(fetchTask, ms);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [props.auto, props.intervalSec, fetchTask]);

  // первичный запрос
  useEffect(() => {
    fetchTask();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, name, voice]);

  // Drag functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPos: { ...position }
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !dragRef.current) return;
    
    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;
    
    const newX = Math.max(0, Math.min(100, dragRef.current.startPos.x + (deltaX / window.innerWidth) * 100));
    const newY = Math.max(0, Math.min(100, dragRef.current.startPos.y + (deltaY / window.innerHeight) * 100));
    
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    dragRef.current = null;
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <>
      {/* AI Task Window - Draggable */}
      <div
        className="fixed z-[1000] cursor-move select-none"
        style={{
          left: `${position.x}%`,
          top: `${position.y}%`,
          transform: 'translate(-50%, -50%)',
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="bg-[rgba(10,14,28,.95)] backdrop-blur-xl rounded-2xl border border-[#243058] p-4 shadow-[0_25px_80px_rgba(0,0,0,.6)] max-w-sm">
          {/* Task Content Only - Visible to Everyone */}
          <div className="text-[#e6e9f2] text-lg font-semibold leading-relaxed min-h-[3rem]">
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-[#415cff] border-t-transparent rounded-full animate-spin"></div>
                Loading...
              </div>
            ) : (
              task
            )}
          </div>
        </div>
      </div>

      {/* Control Panel - Right Bottom - Only for User */}
      <div className="fixed right-4 bottom-4 z-[999] bg-[rgba(10,14,28,.95)] backdrop-blur-xl rounded-2xl border border-[#243058] p-4 shadow-[0_25px_80px_rgba(0,0,0,.6)] max-w-xs">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs text-[#8bd0ff] font-medium">Control Panel</div>
          <button
            onClick={() => setShowPanel(!showPanel)}
            className="text-[#6f79a7] hover:text-[#8bd0ff] transition-colors"
          >
            ⚙️
          </button>
        </div>

        {/* Next Task Button */}
        <div className="mb-4">
          <button
            onClick={fetchTask}
            disabled={loading}
            className="w-full px-4 py-2 bg-gradient-to-r from-[#415cff] to-[#8bd0ff] hover:from-[#3648e6] hover:to-[#7bc5f0] text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Next Task"}
          </button>
        </div>

        {/* Tone Selection */}
        <div className="mb-4">
          <div className="text-xs text-[#8bd0ff] font-medium mb-2">Tone</div>
          <div className="grid grid-cols-2 gap-2">
            {['motivator', 'funny', 'serious', 'chill'].map(tone => (
              <button
                key={tone}
                onClick={() => setMode(tone as Mode)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
                  mode === tone
                    ? 'bg-[#415cff] text-white border-transparent'
                    : 'bg-[rgba(20,26,53,0.8)] text-[#6f79a7] border-[#243058] hover:bg-[rgba(24,32,65,0.9)] hover:border-[#415cff]/30'
                }`}
              >
                {tone.charAt(0).toUpperCase() + tone.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Voice Selection */}
        <div className="mb-4">
          <div className="text-xs text-[#8bd0ff] font-medium mb-2">Voice Style</div>
          <div className="space-y-2">
            {VOICE_OPTIONS.map(opt => (
              <button
                key={opt.key}
                onClick={() => setVoice(opt.key)}
                className={`w-full px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
                  voice === opt.key
                    ? 'bg-[#415cff] text-white border-transparent'
                    : 'bg-[rgba(20,26,53,0.8)] text-[#6f79a7] border-[#243058] hover:bg-[rgba(24,32,65,0.9)] hover:border-[#415cff]/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{opt.emoji}</span>
                  <div>
                    <div className="font-semibold">{opt.label}</div>
                    <div className="text-xs opacity-75">{opt.style}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Auto Mode Toggle */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-[#8bd0ff] font-medium">Auto Mode</div>
          <div className={`w-12 h-6 rounded-full transition-colors duration-200 ${props.auto ? 'bg-[#415cff]' : 'bg-[#243058]'}`}>
            <div className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ${props.auto ? 'translate-x-6' : 'translate-x-0.5'} mt-0.5`}></div>
          </div>
        </div>
      </div>
    </>
  );
}