'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AIReactionsOverlayContent() {
  const searchParams = useSearchParams();
  const overlayKey = searchParams.get('key');
  
  const [connectionStatus, setConnectionStatus] = useState('Connecting...');
  const [reactionText, setReactionText] = useState('Welcome to AI Reactions! 🎤');
  const [reactionStyle, setReactionStyle] = useState('support');
  const [reactionTier, setReactionTier] = useState('BASIC');
  const [isVisible, setIsVisible] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cooldownRef = useRef<boolean>(false);

  useEffect(() => {
    if (!overlayKey) {
      setConnectionStatus('No key provided');
      return;
    }

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [overlayKey]);

  const connectWebSocket = () => {
    if (!overlayKey) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws?key=${overlayKey}`;
    
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('Connected to WebSocket');
      setConnectionStatus('Connected');
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket connection closed');
      setConnectionStatus('Disconnected');
      
      // Reconnect after 3 seconds
      setTimeout(() => {
        if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
          connectWebSocket();
        }
      }, 3000);
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('Error');
    };
  };

  const handleWebSocketMessage = (data: any) => {
    console.log('Received message:', data);

    switch (data.type) {
      case 'connection.established':
        console.log('Connection established for overlay:', data.overlayKey);
        setConnectionStatus('Connected');
        break;

      case 'reaction.new':
        handleReaction(data);
        break;

      default:
        console.log('Unknown message type:', data.type);
    }
  };

  const handleReaction = (reaction: any) => {
    if (cooldownRef.current) {
      console.log('Cooldown active, skipping reaction');
      return;
    }

    // Show reaction
    showReaction(reaction);

    // Play audio if available
    if (reaction.audioUrl && !isMuted) {
      playAudio(reaction.audioUrl);
    }

    // Start cooldown
    startCooldown(5000); // 5 seconds cooldown
  };

  const showReaction = (reaction: any) => {
    setReactionText(reaction.text);
    setReactionStyle(reaction.style);
    setReactionTier(reaction.tier);
    setIsVisible(true);

    // Hide after 7 seconds
    setTimeout(() => {
      setIsVisible(false);
    }, 7000);
  };

  const playAudio = (audioUrl: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(audioUrl);
    audio.volume = isMuted ? 0 : volume;
    
    audio.onended = () => {
      setIsSpeaking(false);
    };

    audio.onerror = (error) => {
      console.error('Audio playback error:', error);
      setIsSpeaking(false);
    };

    audio.play().then(() => {
      setIsSpeaking(true);
      audioRef.current = audio;
    }).catch(error => {
      console.error('Failed to play audio:', error);
      setIsSpeaking(false);
    });
  };

  const startCooldown = (duration: number) => {
    cooldownRef.current = true;
    setTimeout(() => {
      cooldownRef.current = false;
    }, duration);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.volume = !isMuted ? 0 : volume;
    }
  };

  const setVolumeLevel = (value: string) => {
    const newVolume = parseFloat(value);
    setVolume(newVolume);
    if (audioRef.current && !isMuted) {
      audioRef.current.volume = newVolume;
    }
  };

  const getStyleEmoji = (style: string) => {
    const emojis = {
      'support': '😊',
      'light_troll': '😏',
      'hard_troll': '😈'
    };
    return emojis[style as keyof typeof emojis] || '😊';
  };

  const getStyleColor = (style: string) => {
    const colors = {
      'support': 'border-green-500 bg-green-500/10',
      'light_troll': 'border-yellow-500 bg-yellow-500/10',
      'hard_troll': 'border-red-500 bg-red-500/10'
    };
    return colors[style as keyof typeof colors] || 'border-green-500 bg-green-500/10';
  };

  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Connection Status */}
      <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold pointer-events-none ${
        connectionStatus === 'Connected' 
          ? 'bg-green-500 text-white' 
          : 'bg-red-500 text-white'
      }`}>
        {connectionStatus}
      </div>

      {/* Reaction Display */}
      <div className={`absolute bottom-6 left-1/2 transform -translate-x-1/2 transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24'
      }`}>
        <div className={`px-6 py-3 rounded-2xl backdrop-blur-md border-2 ${getStyleColor(reactionStyle)} max-w-md text-center`}>
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl">{getStyleEmoji(reactionStyle)}</span>
            <span className="text-white font-bold text-lg">{reactionText}</span>
          </div>
          <div className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            {reactionTier}
          </div>
        </div>
      </div>

      {/* Audio Controls */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2 pointer-events-auto">
        <button
          onClick={toggleMute}
          className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
        <input
          type="range"
          min="0"
          max="100"
          value={volume * 100}
          onChange={(e) => setVolumeLevel((parseInt(e.target.value) / 100).toString())}
          className="w-20"
        />
      </div>
    </div>
  );
}
