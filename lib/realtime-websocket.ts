// lib/realtime-websocket.ts
import WebSocket from 'ws';
import { userDB } from './user-db';
import { REALTIME_CONFIG } from './openai-realtime';
import { buildSystemPrompt } from './prompt-builder';

export interface RealtimeSession {
  userId: string;
  openaiWs: WebSocket | null;
  clientWs: WebSocket;
  isConnected: boolean;
}

class RealtimeManager {
  private sessions: Map<string, RealtimeSession> = new Map();

  // Create new session
  async createSession(userId: string, clientWs: WebSocket): Promise<RealtimeSession> {
    const user = userDB.getUser(userId);
    
    if (!user.premium) {
      throw new Error('Premium subscription required');
    }

    const session: RealtimeSession = {
      userId,
      openaiWs: null,
      clientWs,
      isConnected: false
    };

    try {
      // Connect to OpenAI Realtime API
      const openaiWs = new WebSocket(REALTIME_CONFIG.wsUrl, {
        headers: REALTIME_CONFIG.getHeaders()
      });

      session.openaiWs = openaiWs;

      // Handle OpenAI WebSocket events
      openaiWs.on('open', () => {
        console.log(`OpenAI Realtime connected for user ${userId}`);
        session.isConnected = true;
        
        // Send session configuration
        this.sendToOpenAI(session, {
          type: 'session.update',
          session: {
            modalities: ['text', 'audio'],
            instructions: this.buildInstructions(user),
            voice: user.profile?.voice || REALTIME_CONFIG.defaultVoice,
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            input_audio_transcription: {
              model: 'whisper-1'
            }
          }
        });
      });

      openaiWs.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleOpenAIMessage(session, message);
        } catch (error) {
          console.error('Error parsing OpenAI message:', error);
        }
      });

      openaiWs.on('close', () => {
        console.log(`OpenAI Realtime disconnected for user ${userId}`);
        session.isConnected = false;
        this.cleanupSession(userId);
      });

      openaiWs.on('error', (error) => {
        console.error(`OpenAI Realtime error for user ${userId}:`, error);
        session.isConnected = false;
        this.cleanupSession(userId);
      });

      this.sessions.set(userId, session);
      return session;
    } catch (error) {
      console.error('Failed to create Realtime session:', error);
      throw error;
    }
  }

  // Send message to OpenAI
  private sendToOpenAI(session: RealtimeSession, message: any) {
    if (session.openaiWs && session.isConnected) {
      session.openaiWs.send(JSON.stringify(message));
    }
  }

  // Handle messages from OpenAI
  private handleOpenAIMessage(session: RealtimeSession, message: any) {
    switch (message.type) {
      case 'response.text.delta':
        // Send text delta to client
        this.sendToClient(session, {
          type: 'text',
          text: message.delta
        });
        break;
        
      case 'response.audio.delta':
        // Send audio chunk to client
        this.sendToClient(session, {
          type: 'audio',
          chunk: message.delta
        });
        break;
        
      case 'response.done':
        // Response complete
        this.sendToClient(session, {
          type: 'done'
        });
        break;
        
      case 'error':
        console.error('OpenAI Realtime error:', message.error);
        this.sendToClient(session, {
          type: 'error',
          error: message.error
        });
        break;
    }
  }

  // Send message to client
  private sendToClient(session: RealtimeSession, message: any) {
    if (session.clientWs.readyState === WebSocket.OPEN) {
      session.clientWs.send(JSON.stringify(message));
    }
  }

  // Handle client message
  handleClientMessage(userId: string, message: any) {
    const session = this.sessions.get(userId);
    if (!session || !session.isConnected) {
      return;
    }

    switch (message.type) {
      case 'reaction':
        // Send reaction request to OpenAI
        this.sendToOpenAI(session, {
          type: 'response.create',
          response: {
            modalities: ['text', 'audio'],
            instructions: `Generate a reaction to: "${message.text}". Keep it short and engaging.`
          }
        });
        break;
        
      case 'speak':
        // Send text to be spoken
        this.sendToOpenAI(session, {
          type: 'response.create',
          response: {
            modalities: ['audio'],
            instructions: `Speak this text: "${message.text}"`
          }
        });
        break;
    }
  }

  // Build instructions from user profile
  private buildInstructions(user: any): string {
    const profile = user.profile || {
      category: 'just_chatting',
      tone: 'funny',
      slangLevel: 5,
      language: 'en',
      voice: 'ash'
    };

    return buildSystemPrompt(profile, {
      category: profile.category,
      tone: profile.tone,
      slangLevel: profile.slangLevel,
      language: profile.language,
      context: 'realtime'
    });
  }

  // Cleanup session
  private cleanupSession(userId: string) {
    const session = this.sessions.get(userId);
    if (session) {
      if (session.openaiWs) {
        session.openaiWs.close();
      }
      this.sessions.delete(userId);
    }
  }

  // Get session
  getSession(userId: string): RealtimeSession | undefined {
    return this.sessions.get(userId);
  }

  // Close all sessions
  closeAll() {
    for (const [userId, session] of this.sessions) {
      this.cleanupSession(userId);
    }
  }
}

export const realtimeManager = new RealtimeManager();
