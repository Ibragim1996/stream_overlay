// app/overlay/OverlayClient.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
// import UpgradeModal from "../../components/UpgradeModal";

type Mode = "funny" | "serious" | "chill" | "street";
type Voice = "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";

const VOICE_OPTIONS = [
  { key: "alloy" as Voice, label: "Alloy", emoji: "🎭", style: "Neutral & Clear" },
  { key: "echo" as Voice, label: "Echo", emoji: "🎪", style: "Expressive & Dynamic" },
  { key: "fable" as Voice, label: "Fable", emoji: "📚", style: "Storytelling & Warm" },
  { key: "onyx" as Voice, label: "Onyx", emoji: "💎", style: "Deep & Authoritative" },
  { key: "nova" as Voice, label: "Nova", emoji: "⭐", style: "Bright & Energetic" },
  { key: "shimmer" as Voice, label: "Shimmer", emoji: "✨", style: "Soft & Gentle" },
];

export default function OverlayClient(props: {
  name?: string;
  mode?: Mode;
  auto?: boolean;
  intervalSec?: number;
}) {
  const [task, setTask] = useState<string>("Loading...");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>("funny");
  const [voice, setVoice] = useState<Voice>("alloy");
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 85 }); // в процентах - нижняя часть экрана
  const [showPanel, setShowPanel] = useState(false); // Сначала свернута
  const [isExpanded, setIsExpanded] = useState(false); // Состояние раскрытия
  const [voiceEnabled, setVoiceEnabled] = useState(false); // Включен ли голос
  const [isSpeaking, setIsSpeaking] = useState(false); // Говорит ли сейчас
  const [lastSpokenTask, setLastSpokenTask] = useState<string>(""); // Последнее озвученное задание
  const [showUpgradeModal, setShowUpgradeModal] = useState(false); // Показать модалку апгрейда
  const [aiReactions, setAiReactions] = useState<Array<{
    id: string;
    text: string;
    style: 'support' | 'light_troll' | 'hard_troll';
    tier: string;
    timestamp: number;
    audioUrl?: string;
  }>>([]); // AI Reactions
  
  const timerRef = useRef<number | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; startPos: { x: number; y: number } } | null>(null);

  const name = props.name ?? "";

  // Voice synthesis function
  const speakText = useCallback(async (text: string) => {
    if (!voiceEnabled || isSpeaking || text === lastSpokenTask) return;
    
    setIsSpeaking(true);
    setLastSpokenTask(text);
    
    try {
      // Use OpenAI TTS API for high-quality voice
      const response = await fetch('/api/voice/realtime', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          voice: voice,
          mode: mode,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Voice generation failed');
      }
      
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      await audio.play();
    } catch (error) {
      console.error('Voice synthesis error:', error);
      setIsSpeaking(false);
    }
  }, [voiceEnabled, isSpeaking, lastSpokenTask, voice]);

  // Stop speaking function
  const stopSpeaking = useCallback(() => {
    // Stop any playing audio
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    setIsSpeaking(false);
  }, []);

  // Initialize mode from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlMode = urlParams.get('m');
    if (urlMode && ['funny', 'serious', 'chill', 'street'].includes(urlMode)) {
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

      if (res.status === 429) {
        const errorData = await res.json();
        if (errorData.code === 'FREE_LIMIT_EXCEEDED') {
          setShowUpgradeModal(true);
          setTask("Free limit reached. Upgrade to Premium for unlimited access.");
          return;
        }
        setTask("Rate limited. Please try again later.");
        return;
      }

      const data = await res.json();
      const newTask = data.task || "Try a quick smile to the camera.";
      setTask(newTask);
      
      // Speak the task if voice is enabled
      if (voiceEnabled && newTask) {
        speakText(newTask);
      }
    } catch {
      const errorTask = "Network error. Try again.";
      setTask(errorTask);
      if (voiceEnabled) {
        speakText(errorTask);
      }
    } finally {
      setLoading(false);
    }
  }, [mode, voice, voiceEnabled, speakText]);

  // авто-обновление
  useEffect(() => {
    if (!props.auto) return;
    const ms = Math.max(5, props.intervalSec ?? 15) * 1000;
    timerRef.current = window.setInterval(fetchTask, ms);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [props.auto, props.intervalSec, fetchTask]);

  // Speak task when it changes and voice is enabled
  useEffect(() => {
    if (voiceEnabled && task && task !== "Loading..." && !isSpeaking) {
      speakText(task);
    }
  }, [task, voiceEnabled, isSpeaking, speakText]);

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

  // Poll for AI Reactions
  useEffect(() => {
    const pollReactions = async () => {
      try {
        // Get streamer ID from URL or use default
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token') || 'default-user';
        
        const response = await fetch(`/api/ai-reactions/poll?streamerId=${token}`);
        if (response.ok) {
          const data = await response.json();
          
          if (data.reactions && data.reactions.length > 0) {
            data.reactions.forEach((reaction: any) => {
              const newReaction = {
                id: reaction.id || Date.now().toString(),
                text: reaction.text,
                style: reaction.style,
                tier: reaction.tier,
                audioUrl: reaction.audioUrl,
                timestamp: reaction.timestamp || Date.now()
              };
              
              setAiReactions(prev => [...prev, newReaction]);
              
              // Play audio if available
              if (reaction.audioUrl && voiceEnabled) {
                playReactionAudio(reaction.audioUrl);
              }
              
              // Remove reaction after 7 seconds
              setTimeout(() => {
                setAiReactions(prev => prev.filter(r => r.id !== newReaction.id));
              }, 7000);
            });
          }
        }
      } catch (error) {
        console.error('Error polling AI reactions:', error);
      }
    };

    // Poll every 2 seconds
    const interval = setInterval(pollReactions, 2000);
    
    // Initial poll
    pollReactions();
    
    return () => {
      clearInterval(interval);
    };
  }, [voiceEnabled]);

  // Play reaction audio
  const playReactionAudio = (audioUrl: string) => {
    if (isSpeaking) return; // Don't interrupt current speech
    
    const audio = new Audio(audioUrl);
    audio.volume = 0.8;
    
    audio.onended = () => {
      setIsSpeaking(false);
    };
    
    audio.onerror = (error) => {
      console.error('Audio playback error:', error);
      setIsSpeaking(false);
    };
    
    setIsSpeaking(true);
    audio.play().catch(error => {
      console.error('Failed to play reaction audio:', error);
      setIsSpeaking(false);
    });
  };

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

      {/* AI Reactions Display */}
      {aiReactions.map((reaction) => (
        <div
          key={reaction.id}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[1001] animate-bounce"
          style={{
            animation: 'slideInFromTop 0.6s ease-out'
          }}
        >
          <div className={`px-6 py-4 rounded-2xl text-white font-bold text-lg shadow-2xl backdrop-blur-xl border-2 max-w-md text-center ${
            reaction.style === 'support' 
              ? 'bg-gradient-to-r from-green-500 to-green-600 border-green-400'
              : reaction.style === 'light_troll'
              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 border-yellow-400'
              : 'bg-gradient-to-r from-red-500 to-pink-500 border-red-400'
          }`}>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl">
                {reaction.style === 'support' ? '😊' : reaction.style === 'light_troll' ? '😏' : '😈'}
              </span>
              <span>{reaction.text}</span>
              <div className="bg-white/20 px-2 py-1 rounded-full text-xs font-bold">
                {reaction.tier}
              </div>
            </div>
            {reaction.audioUrl && (
              <div className="mt-2 flex justify-center">
                <button
                  onClick={() => playReactionAudio(reaction.audioUrl)}
                  className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200"
                >
                  🔊 Play Voice
                </button>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Control Panel - Right Bottom - Collapsible */}
      <div className="fixed right-4 bottom-4 z-[999] bg-[rgba(10,14,28,.95)] backdrop-blur-xl rounded-2xl border border-[#243058] shadow-[0_25px_80px_rgba(0,0,0,.6)] transition-all duration-300">
        {/* Collapsed State - Only Next, Voice and Settings buttons */}
        {!isExpanded ? (
          <div className="p-3 flex gap-2">
            {/* Next Task Button */}
        <button
          onClick={fetchTask}
              disabled={loading}
              className="px-4 py-2 bg-gradient-to-r from-[#415cff] to-[#8bd0ff] hover:from-[#3648e6] hover:to-[#7bc5f0] text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
            >
              {loading ? "..." : "Next"}
            </button>
            
            {/* Voice Toggle Button */}
            <button
              onClick={() => {
                if (isSpeaking) {
                  stopSpeaking();
                } else {
                  setVoiceEnabled(!voiceEnabled);
                }
              }}
              className={`px-3 py-2 rounded-xl font-medium transition-all duration-200 border ${
                voiceEnabled
                  ? 'bg-[#415cff] text-white border-transparent'
                  : 'bg-[rgba(20,26,53,0.8)] text-[#6f79a7] border-[#243058] hover:bg-[rgba(24,32,65,0.9)] hover:border-[#415cff]/30'
              }`}
            >
              {isSpeaking ? "⏹️ Stop" : voiceEnabled ? "🔊 On" : "🔇 Off"}
            </button>
            
            {/* Settings Button */}
            <button
              onClick={() => setIsExpanded(true)}
              className="px-3 py-2 bg-[rgba(20,26,53,0.8)] text-[#6f79a7] border border-[#243058] rounded-xl hover:bg-[rgba(24,32,65,0.9)] hover:border-[#415cff]/30 transition-all duration-200"
            >
              ⚙️
            </button>
          </div>
        ) : (
          /* Expanded State - Full panel */
          <div className="p-4 max-w-xs">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs text-[#8bd0ff] font-medium">AI Settings</div>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-[#6f79a7] hover:text-[#8bd0ff] transition-colors"
              >
                ✕
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
                {[
                  { key: 'funny', label: 'Funny', emoji: '😄' },
                  { key: 'serious', label: 'Serious', emoji: '😐' },
                  { key: 'chill', label: 'Chill', emoji: '😎' },
                  { key: 'street', label: 'Street', emoji: '🔥' }
                ].map(tone => (
                  <button
                    key={tone.key}
                    onClick={() => setMode(tone.key as Mode)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
                      mode === tone.key
                        ? 'bg-[#415cff] text-white border-transparent'
                        : 'bg-[rgba(20,26,53,0.8)] text-[#6f79a7] border-[#243058] hover:bg-[rgba(24,32,65,0.9)] hover:border-[#415cff]/30'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <span>{tone.emoji}</span>
                      <span>{tone.label}</span>
                    </div>
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
        )}
      </div>

      {/* Upgrade Modal - temporarily disabled */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div className="bg-[rgba(10,14,28,0.95)] p-8 rounded-2xl border border-[#243058] max-w-md">
            <h2 className="text-white text-xl mb-4">Upgrade to Premium</h2>
            <p className="text-[#8bd0ff] mb-4">Free users are limited to 10 tasks per hour. Upgrade to Premium for unlimited access and voice features.</p>
            <button 
              onClick={() => setShowUpgradeModal(false)}
              className="px-4 py-2 bg-[#415cff] text-white rounded-xl"
            >
              Close
        </button>
      </div>
    </div>
      )}
    </>
  );
}