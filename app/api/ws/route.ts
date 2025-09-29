import { NextRequest } from 'next/server';
import { emotionalPromptGenerator } from '@/lib/emotional-prompts';
import { ttsGenerator } from '@/lib/tts-generator';
import { overlayStorage } from '@/lib/storage';

export const runtime = 'nodejs';

// WebSocket connections storage
const connections = new Map<string, WebSocket>();

export async function GET(request: NextRequest) {
  const upgrade = request.headers.get('upgrade');
  
  if (upgrade !== 'websocket') {
    return new Response('Expected Upgrade: websocket', { status: 426 });
  }

  const url = new URL(request.url);
  const overlayKey = url.searchParams.get('key');
  
  if (!overlayKey) {
    return new Response('Missing overlay key', { status: 400 });
  }

  try {
    // Create WebSocket connection
    const ws = new WebSocket(`ws://localhost:3000/api/ws?key=${overlayKey}`);
    
    ws.onopen = () => {
      console.log(`WebSocket connected for overlay: ${overlayKey}`);
      connections.set(overlayKey, ws);
    };

    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'generate_task') {
          await generateAndSendTask(overlayKey, data.mode || 'funny', data.tone || 'playful');
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    ws.onclose = () => {
      console.log(`WebSocket disconnected for overlay: ${overlayKey}`);
      connections.delete(overlayKey);
    };

    ws.onerror = (error) => {
      console.error(`WebSocket error for overlay ${overlayKey}:`, error);
      connections.delete(overlayKey);
    };

    return new Response('WebSocket connection established', { status: 200 });
  } catch (error) {
    console.error('WebSocket setup error:', error);
    return new Response('WebSocket setup failed', { status: 500 });
  }
}

async function generateAndSendTask(overlayKey: string, mode: string, tone: string) {
  try {
    // Generate emotional prompt
    const emotionalPrompt = emotionalPromptGenerator.generateEmotionalPrompt(mode, tone);
    
    // Generate TTS audio
    const audioBuffer = await ttsGenerator.generateSpeechWithRetry({
      text: emotionalPrompt.text,
      voice: emotionalPrompt.voice as any,
      speed: emotionalPrompt.speed,
      format: 'mp3',
      emotion: emotionalPrompt.emotion as any,
      style: emotionalPrompt.style as any
    });

    // Store audio and get URL
    const timestamp = Date.now();
    const audioPath = overlayStorage.generateAudioPath(overlayKey, timestamp);
    const voiceUrl = await overlayStorage.storeAudioMetadata(audioPath, overlayKey);

    // Create overlay state
    const overlayState = {
      text: emotionalPrompt.text,
      voiceUrl: voiceUrl,
      mode: mode,
      tone: tone,
      updatedAt: timestamp
    };

    // Store state in Redis
    await overlayStorage.setOverlayState(overlayKey, overlayState);

    // Send to WebSocket client
    const ws = connections.get(overlayKey);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'task',
        text: emotionalPrompt.text,
        voiceUrl: voiceUrl,
        mode: mode,
        tone: tone,
        updatedAt: timestamp
      }));
    }

    console.log(`Task generated and sent for overlay ${overlayKey}: "${emotionalPrompt.text}"`);
  } catch (error) {
    console.error('Error generating task:', error);
    
    const ws = connections.get(overlayKey);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Failed to generate task'
      }));
    }
  }
}

// Function to send task to specific overlay
export async function sendTaskToOverlay(overlayKey: string, mode: string, tone: string) {
  await generateAndSendTask(overlayKey, mode, tone);
}