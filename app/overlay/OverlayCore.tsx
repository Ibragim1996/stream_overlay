'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { getFirebaseApp } from '@/lib/firebaseClient';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';

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

interface OverlayCoreProps {
  overlayKey: string;
}

export default function OverlayCore({ overlayKey }: OverlayCoreProps) {
  const [task, setTask] = useState<string>("Welcome to AI Overlay! Click Next to generate a task.");
  const [voiceUrl, setVoiceUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>("funny");
  const [voice, setVoice] = useState<Voice>("alloy");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastSpokenTask, setLastSpokenTask] = useState<string>("");
  const [autoMode, setAutoMode] = useState(false);
  const [intervalSec, setIntervalSec] = useState(15);
  const [showPanel, setShowPanel] = useState(false);
  
  const timerRef = useRef<number | null>(null);

  // Play audio from server-generated TTS with text synchronization
  const playAudioFromUrl = useCallback(async (audioUrl: string, taskText: string) => {
    if (!voiceEnabled || isSpeaking) return;
    if (typeof window === 'undefined') return;
    
    try {
      setIsSpeaking(true);
      
      // Show text immediately when audio starts
      if (taskText) {
        setTask(taskText);
      }
      
      const audio = new Audio(audioUrl);
      audio.preload = 'auto';
      audio.volume = 1.0;
      
      await new Promise<void>((resolve, reject) => {
        audio.onended = () => resolve();
        audio.onerror = () => reject(new Error('Audio playback failed'));
        audio.play();
      });
      
      console.log('Realistic TTS audio played successfully');
    } catch (error) {
      console.error('Audio playback error:', error);
    } finally {
      setIsSpeaking(false);
    }
  }, [voiceEnabled, isSpeaking]);

  // Firestore realtime subscription (no WebSocket)
  useEffect(() => {
    if (!overlayKey) return;
    const app = getFirebaseApp();
    if (!app) {
      console.warn('[overlay] Firebase not initialized; set NEXT_PUBLIC_FIREBASE_*');
      return;
    }
    const db = getFirestore(app);
    const ref = doc(db, `overlays/${overlayKey}/state`, 'current');
    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.data() as any;
      if (!data) return;
      const nextText = String(data.text ?? '').trim();
      const nextVoice = String(data.voiceUrl ?? '').trim();
      if (nextText) setTask(nextText);
      setVoiceUrl(nextVoice);
      if (nextVoice && voiceEnabled) {
        // Auto-play the TTS audio with text synchronization
        playAudioFromUrl(nextVoice, nextText);
      }
    }, (err) => {
      console.error('[overlay] Firestore onSnapshot error:', err);
    });
    return () => unsub();
  }, [overlayKey, voiceEnabled, playAudioFromUrl]);

  // Fetch task from API with TTS - only when key is present
  const fetchTask = useCallback(async () => {
    if (!overlayKey) return;
    
    setLoading(true);
    
    // Показываем индикатор загрузки для быстрого отклика
    setTask("Generating task...");
    setLoading(false);
    
    try {
      console.log('[OverlayCore] Fetching task for overlayKey:', overlayKey);
      
      const response = await fetch('/api/tasks/next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          overlayKey: overlayKey,
          mode: mode,
          tone: mode === 'funny' ? 'hype' : mode === 'serious' ? 'serious' : 'calm',
          voiceId: voice
        })
      });

      console.log('[OverlayCore] Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        // Try to get error details from response
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
          console.error('[OverlayCore] API Error:', errorData);
        } catch (e) {
          console.error('[OverlayCore] Could not parse error response:', e);
        }
        
        if (response.status === 429) {
          setTask('Rate limit exceeded. Please try again later.');
          return;
        } else if (response.status === 500) {
          setTask('Server error. Using fallback task...');
          // Show fallback task instead of error
          const fallbackTasks = {
            funny: "Tell chat your most controversial food opinion in 10 seconds",
            serious: "Share one thing you learned today that changed your perspective", 
            chill: "What's your current mood and why?",
            street: "Yo chat, what's the most underrated thing that slaps?"
          };
          setTask(fallbackTasks[mode] || fallbackTasks.funny);
          return;
        }
        
        throw new Error(errorMessage);
      }

      let data;
      try {
        data = await response.json();
        console.log('[OverlayCore] API Response:', data);
      } catch (parseError) {
        console.error('[OverlayCore] Error parsing JSON response:', parseError);
        setTask('Error parsing server response');
        return;
      }
      
      if (data.ok && data.text) {
        // Показываем сгенерированный текст
        setTask(data.text);
        console.log('[OverlayCore] Task set:', data.text);
        console.log('[OverlayCore] Generated via:', data.via);
        console.log('[OverlayCore] Has audio:', !!data.voiceUrl, 'Voice enabled:', voiceEnabled);
        
        if (data.voiceUrl && voiceEnabled) {
          setVoiceUrl(data.voiceUrl);
          
          // Auto-play the audio
          try {
            await playAudioFromUrl(data.voiceUrl, data.text);
          } catch (audioError) {
            console.error('[OverlayCore] Audio playback error:', audioError);
          }
        } else if (!data.voiceUrl) {
          console.log('[OverlayCore] No audio URL provided');
        }
      } else {
        console.error('[OverlayCore] Invalid API response:', data);
        setTask('Error generating task');
      }
    } catch (error) {
      console.error('[OverlayCore] Error fetching task:', error);
    }
  }, [overlayKey, mode, voice, voiceEnabled, playAudioFromUrl]);

  // Auto-refresh timer - only when auto mode is enabled
  useEffect(() => {
    if (!overlayKey || !autoMode) return;

    const interval = setInterval(() => {
      fetchTask();
    }, intervalSec * 1000);

    return () => clearInterval(interval);
  }, [overlayKey, autoMode, intervalSec, fetchTask]);

  // Next task function - use original API (temporary until /api/tasks/next)
  const handleNextTask = useCallback(() => {
    fetchTask();
  }, [fetchTask]);

  return (
    <>
      {/* TASK DISPLAY - Visible to everyone (viewers and user) */}
      <div
        style={{
          position: 'fixed',
          left: '50%',
          bottom: '80px',
          transform: 'translateX(-50%)',
          zIndex: 9998,
          userSelect: 'none',
          pointerEvents: 'none' // Prevent interaction with task display
        }}
      >
        <div style={{
          background: 'rgba(0, 0, 0, 0.7)',
          padding: '15px 20px',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          minWidth: '300px',
          maxWidth: '500px',
          boxShadow: '0 5px 20px rgba(0,0,0,0.3)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '16px',
            color: '#ffffff',
            fontWeight: '500',
            lineHeight: '1.4'
          }}>
            {loading ? 'Loading...' : task}
          </div>
        </div>
      </div>

      {/* CONTROL PANEL - Only visible to user (small panel in corner) */}
      <div
        style={{
          position: 'fixed',
          right: '20px',
          bottom: '20px',
          zIndex: 9999,
          userSelect: 'none'
        }}
      >
        <div style={{
          background: 'rgba(10, 14, 28, 0.95)',
          padding: '15px',
          borderRadius: '10px',
          border: '1px solid #243058',
          minWidth: '200px',
          boxShadow: '0 5px 20px rgba(0,0,0,0.5)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px'
          }}>
            <h4 style={{ margin: 0, fontSize: '14px', color: '#8bd0ff' }}>Control Panel</h4>
            <button
              onClick={() => setShowPanel(!showPanel)}
              style={{
                background: 'none',
                border: 'none',
                color: '#8bd0ff',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              {showPanel ? '−' : '+'}
            </button>
          </div>
          
          {/* Always visible controls */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
            <button
              onClick={handleNextTask}
              disabled={loading}
              style={{
                background: loading ? '#666' : '#415cff',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                padding: '6px 12px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '12px',
                flex: 1
              }}
            >
              {loading ? 'Loading...' : 'Next'}
            </button>
            
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px',
              fontSize: '12px',
              color: '#ccc',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={voiceEnabled}
                onChange={(e) => setVoiceEnabled(e.target.checked)}
                style={{ margin: 0 }}
              />
              Voice
            </label>
          </div>
          
          {/* Expandable panel */}
          {showPanel && (
            <div style={{
              borderTop: '1px solid #243058',
              paddingTop: '10px',
              marginTop: '10px'
            }}>
              <div style={{ marginBottom: '8px' }}>
                <label style={{ fontSize: '12px', color: '#ccc', marginRight: '8px' }}>
                  Voice:
                </label>
                <select
                  value={voice}
                  onChange={(e) => setVoice(e.target.value as Voice)}
                  style={{
                    background: '#1a1f3a',
                    color: 'white',
                    border: '1px solid #243058',
                    borderRadius: '3px',
                    padding: '3px',
                    fontSize: '11px',
                    width: '100%'
                  }}
                >
                  {VOICE_OPTIONS.map(option => (
                    <option key={option.key} value={option.key}>
                      {option.emoji} {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div style={{ marginBottom: '8px' }}>
                <label style={{ fontSize: '12px', color: '#ccc', marginRight: '8px' }}>
                  Mode:
                </label>
                <select
                  value={mode}
                  onChange={(e) => setMode(e.target.value as Mode)}
                  style={{
                    background: '#1a1f3a',
                    color: 'white',
                    border: '1px solid #243058',
                    borderRadius: '3px',
                    padding: '3px',
                    fontSize: '11px',
                    width: '100%'
                  }}
                >
                  <option value="funny">😄 Funny</option>
                  <option value="serious">😐 Serious</option>
                  <option value="chill">😌 Chill</option>
                  <option value="street">😎 Street</option>
                </select>
              </div>
              
              <div style={{ marginBottom: '8px' }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  fontSize: '12px',
                  color: '#ccc',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={autoMode}
                    onChange={(e) => setAutoMode(e.target.checked)}
                    style={{ margin: 0 }}
                  />
                  Auto Mode
                </label>
              </div>
              
              {autoMode && (
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ fontSize: '12px', color: '#ccc', marginRight: '8px' }}>
                    Interval:
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={intervalSec}
                    onChange={(e) => setIntervalSec(parseInt(e.target.value) || 15)}
                    style={{
                      background: '#1a1f3a',
                      color: 'white',
                      border: '1px solid #243058',
                      borderRadius: '3px',
                      padding: '3px',
                      fontSize: '11px',
                      width: '60px'
                    }}
                  />
                  <span style={{ fontSize: '11px', color: '#888', marginLeft: '4px' }}>sec</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
