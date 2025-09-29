'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

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
  const [task, setTask] = useState<string>("Loading...");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<Mode>("funny");
  const [voice, setVoice] = useState<Voice>("alloy");
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastSpokenTask, setLastSpokenTask] = useState<string>("");
  const [autoMode, setAutoMode] = useState(false);
  const [intervalSec, setIntervalSec] = useState(15);
  const [showPanel, setShowPanel] = useState(false);
  
  const timerRef = useRef<number | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  // Voice synthesis function - only loaded when needed
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

  // Play audio from URL (emotional TTS)
  const playAudioFromUrl = useCallback(async (audioUrl: string) => {
    if (!voiceEnabled || isSpeaking) return;
    
    if (typeof window === 'undefined') return;
    
    try {
      setIsSpeaking(true);
      
      const audio = new Audio(audioUrl);
      audio.volume = 1.0;
      
      await new Promise<void>((resolve, reject) => {
        audio.onended = () => resolve();
        audio.onerror = () => reject(new Error('Audio playback failed'));
        audio.play();
      });
      
      console.log('Emotional audio played successfully');
    } catch (error) {
      console.error('Audio playback error:', error);
      // Fallback to TTS if audio fails
      const text = task;
      if (text) {
        speakText(text);
      }
    } finally {
      setIsSpeaking(false);
    }
  }, [voiceEnabled, isSpeaking, task, speakText]);

  // Enhanced TTS with emotional variety
  const speakTextWithEmotion = useCallback(async (text: string, currentMode: string) => {
    if (!voiceEnabled || isSpeaking || text === lastSpokenTask) return;
    
    if (typeof window === 'undefined') return;
    
    try {
      setIsSpeaking(true);
      setLastSpokenTask(text);
      
      // Enhance text with emotional markers based on mode
      let enhancedText = text;
      
      if (currentMode === 'funny') {
        enhancedText = text
          .replace(/!/g, '! *pause* ')
          .replace(/\?/g, '? *pause* ')
          .replace(/\./g, '. *pause* ');
      } else if (currentMode === 'serious') {
        enhancedText = text
          .replace(/!/g, '.')
          .replace(/\?/g, '? *long_pause* ');
      } else if (currentMode === 'chill') {
        enhancedText = text
          .replace(/!/g, '...')
          .replace(/\?/g, '? *pause* ');
      } else if (currentMode === 'street') {
        enhancedText = text
          .replace(/!/g, '! *excited* ')
          .replace(/\?/g, '? *surprised* ');
      }
      
      const utterance = new SpeechSynthesisUtterance(enhancedText);
      
      // Select voice based on mode
      const voices = speechSynthesis.getVoices();
      let selectedVoice = null;
      
      if (currentMode === 'funny') {
        selectedVoice = voices.find(v => v.name.includes('Google') && v.name.includes('Russian')) || 
                       voices.find(v => v.name.includes('Microsoft') && v.name.includes('Russian')) ||
                       voices[0];
      } else if (currentMode === 'serious') {
        selectedVoice = voices.find(v => v.name.includes('Google') && v.name.includes('Russian')) ||
                       voices.find(v => v.name.includes('Microsoft') && v.name.includes('Russian')) ||
                       voices[0];
      } else {
        selectedVoice = voices.find(v => v.name.includes(voice)) || voices[0];
      }
      
      utterance.voice = selectedVoice;
      
      // Adjust rate and pitch based on mode
      if (currentMode === 'funny') {
        utterance.rate = 1.1;
        utterance.pitch = 1.2;
      } else if (currentMode === 'serious') {
        utterance.rate = 0.9;
        utterance.pitch = 0.8;
      } else if (currentMode === 'chill') {
        utterance.rate = 0.8;
        utterance.pitch = 0.9;
      } else if (currentMode === 'street') {
        utterance.rate = 1.2;
        utterance.pitch = 1.1;
      } else {
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
      }
      
      await new Promise<void>((resolve, reject) => {
        utterance.onend = () => resolve();
        utterance.onerror = () => reject(new Error('Speech synthesis failed'));
        speechSynthesis.speak(utterance);
      });
      
      console.log(`Emotional TTS played for mode: ${currentMode}`);
    } catch (error) {
      console.error('Emotional TTS error:', error);
    } finally {
      setIsSpeaking(false);
    }
  }, [voiceEnabled, isSpeaking, lastSpokenTask, voice]);

  // Fetch task from API - only when key is present
  const fetchTask = useCallback(async () => {
    if (!overlayKey) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/tasks/next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          overlayKey: overlayKey,
          mode: mode,
          tone: 'playful', // Добавляем тон для эмоциональности
          voice: voice
        })
      });

      if (!response.ok) {
        if (response.status === 429) {
          setTask('Rate limit exceeded. Please try again later.');
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        setTask('Error parsing server response');
        return;
      }
      
      if (data.success && data.data) {
        setTask(data.data.text || 'No task available');
        
        // Speak the task if voice is enabled
        if (voiceEnabled && data.data.text) {
          speakText(data.data.text);
        }
      } else {
        setTask(data.error || 'Failed to generate task');
      }
    } catch (error) {
      console.error('Error fetching task:', error);
      setTask('Welcome to AI Overlay! Ready to generate tasks.');
    } finally {
      setLoading(false);
    }
  }, [overlayKey, mode, voice, voiceEnabled, speakText]);

  // WebSocket connection - only when key is present
  useEffect(() => {
    if (!overlayKey || typeof window === 'undefined') return;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/ws?key=${encodeURIComponent(overlayKey)}`;
      
      console.log('Connecting to WebSocket:', wsUrl);
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log('WebSocket connected successfully');
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'task' && data.text) {
            setTask(data.text);
            if (voiceEnabled) {
              // Use emotional TTS with enhanced text
              speakTextWithEmotion(data.text, data.mode || mode);
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      socket.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
      };

      return () => {
        if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
          socket.close();
        }
        socketRef.current = null;
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  }, [overlayKey, voiceEnabled, speakText]);

  // Auto-refresh timer - only when auto mode is enabled
  useEffect(() => {
    if (!overlayKey || !autoMode) return;

    const interval = setInterval(() => {
      fetchTask();
    }, intervalSec * 1000);

    return () => clearInterval(interval);
  }, [overlayKey, autoMode, intervalSec, fetchTask]);

  // Initial task fetch - only when key is present
  useEffect(() => {
    if (overlayKey) {
      fetchTask();
    }
  }, [overlayKey, fetchTask]);

  // Next task function - use WebSocket for emotional voices
  const handleNextTask = useCallback(async () => {
    try {
      setLoading(true);
      
      // Send task request via WebSocket API
      const response = await fetch('/api/ws/send-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          overlayKey: overlayKey,
          mode: mode,
          tone: 'playful'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to send task request');
      }

      // Task will be received via WebSocket
    } catch (error) {
      console.error('Error sending task request:', error);
      setTask('Failed to generate task. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [overlayKey, mode]);

  return (
    <>
      {/* TASK DISPLAY - Visible to everyone (viewers and user) */}
      <div
        style={{
          position: 'fixed',
          left: '50%',
          top: '85%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9998,
          userSelect: 'none',
          pointerEvents: 'none' // Prevent interaction with task display
        }}
      >
        <div style={{
          background: 'rgba(10, 14, 28, 0.95)',
          padding: '20px',
          borderRadius: '15px',
          border: '1px solid #243058',
          minWidth: '300px',
          maxWidth: '500px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '18px',
            color: '#66ff66',
            minHeight: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
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
