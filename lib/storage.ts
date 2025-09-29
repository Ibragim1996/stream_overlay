// lib/storage.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export interface OverlayState {
  text: string;
  voiceUrl: string;
  mode: string;
  tone: string;
  updatedAt: number;
}

export class OverlayStorage {
  private static instance: OverlayStorage;
  
  static getInstance(): OverlayStorage {
    if (!OverlayStorage.instance) {
      OverlayStorage.instance = new OverlayStorage();
    }
    return OverlayStorage.instance;
  }

  async setOverlayState(overlayKey: string, state: OverlayState): Promise<void> {
    try {
      const key = `overlays/${overlayKey}/state`;
      await redis.setex(key, 3600, JSON.stringify(state)); // 1 hour TTL
    } catch (error) {
      console.error('Failed to set overlay state:', error);
      throw new Error('Storage unavailable');
    }
  }

  async getOverlayState(overlayKey: string): Promise<OverlayState | null> {
    try {
      const key = `overlays/${overlayKey}/state`;
      const data = await redis.get(key);
      return data ? JSON.parse(data as string) : null;
    } catch (error) {
      console.error('Failed to get overlay state:', error);
      return null;
    }
  }

  async deleteOverlayState(overlayKey: string): Promise<void> {
    try {
      const key = `overlays/${overlayKey}/state`;
      await redis.del(key);
    } catch (error) {
      console.error('Failed to delete overlay state:', error);
    }
  }

  // Generate a unique file path for TTS audio
  generateAudioPath(overlayKey: string, timestamp: number): string {
    return `tts/${overlayKey}/${timestamp}.mp3`;
  }

  // Store audio file metadata (in production, this would be actual file storage)
  async storeAudioMetadata(audioPath: string, overlayKey: string): Promise<string> {
    try {
      // In production, upload to actual storage (AWS S3, Cloudflare R2, etc.)
      // For now, return a mock URL
      const baseUrl = process.env.NEXT_PUBLIC_CDN_URL || 'https://your-cdn.com';
      const audioUrl = `${baseUrl}/${audioPath}`;
      
      // Store metadata in Redis
      const metadataKey = `audio:${audioPath}`;
      await redis.setex(metadataKey, 3600, JSON.stringify({
        overlayKey,
        path: audioPath,
        url: audioUrl,
        createdAt: Date.now()
      }));

      return audioUrl;
    } catch (error) {
      console.error('Failed to store audio metadata:', error);
      throw new Error('Audio storage failed');
    }
  }
}

export const overlayStorage = OverlayStorage.getInstance();
