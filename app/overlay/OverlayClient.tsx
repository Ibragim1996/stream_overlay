'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

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

export default function OverlayClient() {
  const searchParams = useSearchParams();
  const key = searchParams.get('key');
  
  const [task, setTask] = useState<string>("Loading...");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>("funny");
  const [voice, setVoice] = useState<Voice>("alloy");
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 85 });
  const [showPanel, setShowPanel] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastSpokenTask, setLastSpokenTask] = useState<string>("");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [aiReactions, setAiReactions] = useState<Array<{
    id: string;
    text: string;
    style: 'support' | 'light_troll' | 'hard_troll';
    tier: string;
    timestamp: number;
    audioUrl?: string;
  }>>([]);
  
  const timerRef = useRef<number | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; startPos: { x: number; y: number } } | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  // Voice synthesis function
  const speakText = useCallback(async (text: string) => {
    if (!voiceEnabled || isSpeaking || text === lastSpokenTask) return;
    
    if (typeof window === 'undefined') return;
    
    try {
      setIsSpeaking(true);
      setLastSpokenTask(text);
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = speechSynthesis.getVoices().find(v => v.name.includes(voice)) || null;
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      
      await new Promise<void>((resolve, reject) => {
        utterance.onend = () => resolve();
        utterance.onerror = () => reject(new Error('Speech synthesis failed'));
        speechSynthesis.speak(utterance);
      });
    } catch (error) {
      console.error('Speech synthesis error:', error);
    } finally {
      setIsSpeaking(false);
    }
  }, [voiceEnabled, isSpeaking, lastSpokenTask, voice]);

  // Fetch task from API
  const fetchTask = useCallback(async () => {
    if (!key) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: key,
          mode: mode,
          voice: voice,
          streamKind: 'just_chatting',
          kind: 'next'
        })
      });

      if (!response.ok) {
        if (response.status === 429) {
          setTask('Rate limit exceeded. Please try again later.');
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setTask(data.task || 'No task available');
      
      // Speak the task if voice is enabled
      if (voiceEnabled && data.task) {
        speakText(data.task);
      }
    } catch (error) {
      console.error('Error fetching task:', error);
      setTask('Welcome to AI Overlay! Ready to generate tasks.');
    } finally {
      setLoading(false);
    }
  }, [key, mode, voice, voiceEnabled, speakText]);

  // WebSocket connection
  useEffect(() => {
    if (!key || typeof window === 'undefined') return;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws?key=${encodeURIComponent(key)}`;
      
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log('WebSocket connected');
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'task' && data.text) {
            setTask(data.text);
            if (voiceEnabled) {
              speakText(data.text);
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      socket.onclose = () => {
        console.log('WebSocket disconnected');
      };

      return () => {
        socket.close();
        socketRef.current = null;
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  }, [key, voiceEnabled, speakText]);

  // Auto-refresh timer
  useEffect(() => {
    if (!key) return;

    const interval = setInterval(() => {
      fetchTask();
    }, 15000); // 15 seconds

    return () => clearInterval(interval);
  }, [key, fetchTask]);

  // Initial task fetch
  useEffect(() => {
    if (key) {
      fetchTask();
    }
  }, [key, fetchTask]);

  // Drag functionality
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (typeof window === 'undefined') return;
    
    e.preventDefault();
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPos: { ...position }
    };
  }, [position]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragRef.current) return;
    
    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;
    
    const newX = Math.max(0, Math.min(100, dragRef.current.startPos.x + (deltaX / window.innerWidth) * 100));
    const newY = Math.max(0, Math.min(100, dragRef.current.startPos.y + (deltaY / window.innerHeight) * 100));
    
    setPosition({ x: newX, y: newY });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    dragRef.current = null;
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  if (!key) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0b1020',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif',
        color: 'white',
        padding: '20px'
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '400px',
          background: 'rgba(10, 14, 28, 0.95)',
          padding: '40px',
          borderRadius: '20px',
          border: '1px solid #243058'
        }}>
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>⚠️</div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px' }}>Overlay key is missing</h2>
          <p style={{ fontSize: '16px', color: '#ccc', marginBottom: '20px' }}>
            Please provide a valid key parameter in the URL.
          </p>
          <p style={{ fontSize: '14px', color: '#888' }}>
            Expected format: /overlay?key=YOUR_KEY
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      id="overlay-root"
      style={{
        position: 'fixed',
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none'
      }}
      onMouseDown={handleMouseDown}
    >
      <div style={{
        background: 'rgba(10, 14, 28, 0.95)',
        padding: '20px',
        borderRadius: '15px',
        border: '1px solid #243058',
        minWidth: '300px',
        maxWidth: '500px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '15px'
        }}>
          <h3 style={{ margin: 0, fontSize: '18px', color: '#8bd0ff' }}>🎯 AI Overlay</h3>
          <button
            onClick={() => setShowPanel(!showPanel)}
            style={{
              background: 'none',
              border: 'none',
              color: '#8bd0ff',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            {showPanel ? '−' : '+'}
          </button>
        </div>
        
        <div style={{
          fontSize: '16px',
          color: '#66ff66',
          marginBottom: '15px',
          minHeight: '40px',
          display: 'flex',
          alignItems: 'center'
        }}>
          {loading ? 'Loading...' : task}
        </div>
        
        {showPanel && (
          <div style={{
            borderTop: '1px solid #243058',
            paddingTop: '15px',
            marginTop: '15px'
          }}>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '14px', color: '#ccc', marginRight: '10px' }}>
                Voice:
              </label>
              <select
                value={voice}
                onChange={(e) => setVoice(e.target.value as Voice)}
                style={{
                  background: '#1a1f3a',
                  color: 'white',
                  border: '1px solid #243058',
                  borderRadius: '5px',
                  padding: '5px'
                }}
              >
                {VOICE_OPTIONS.map(option => (
                  <option key={option.key} value={option.key}>
                    {option.emoji} {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '14px', color: '#ccc', marginRight: '10px' }}>
                <input
                  type="checkbox"
                  checked={voiceEnabled}
                  onChange={(e) => setVoiceEnabled(e.target.checked)}
                  style={{ marginRight: '5px' }}
                />
                Enable Voice
              </label>
            </div>
            
            <button
              onClick={fetchTask}
              disabled={loading}
              style={{
                background: loading ? '#666' : '#415cff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                padding: '8px 16px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              {loading ? 'Loading...' : 'Refresh Task'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}