// lib/tts-generator.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type Voice = "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";

export interface TTSOptions {
  text: string;
  voice: Voice;
  speed?: number; // 0.25 to 4.0
  format?: 'mp3' | 'opus' | 'aac' | 'flac';
}

export class TTSGenerator {
  private static instance: TTSGenerator;
  
  static getInstance(): TTSGenerator {
    if (!TTSGenerator.instance) {
      TTSGenerator.instance = new TTSGenerator();
    }
    return TTSGenerator.instance;
  }

  async generateSpeech(options: TTSOptions): Promise<Buffer> {
    try {
      const { text, voice, speed = 1.0, format = 'mp3' } = options;

      if (!text || text.trim().length === 0) {
        throw new Error('Text is required for TTS generation');
      }

      if (text.length > 4096) {
        throw new Error('Text too long for TTS (max 4096 characters)');
      }

      console.log(`Generating TTS for text: "${text.substring(0, 50)}..." with voice: ${voice}`);

      const response = await openai.audio.speech.create({
        model: "tts-1",
        voice: voice,
        input: text,
        speed: Math.max(0.25, Math.min(4.0, speed)),
        response_format: format,
      });

      const buffer = Buffer.from(await response.arrayBuffer());
      
      console.log(`TTS generated successfully: ${buffer.length} bytes`);
      return buffer;
    } catch (error) {
      console.error('TTS generation failed:', error);
      throw new Error(`TTS generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateSpeechWithRetry(options: TTSOptions, maxRetries: number = 3): Promise<Buffer> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.generateSpeech(options);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        console.warn(`TTS attempt ${attempt}/${maxRetries} failed:`, lastError.message);
        
        if (attempt < maxRetries) {
          // Exponential backoff
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('TTS generation failed after all retries');
  }

  // Validate voice parameter
  isValidVoice(voice: string): voice is Voice {
    const validVoices: Voice[] = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];
    return validVoices.includes(voice as Voice);
  }

  // Get voice display info
  getVoiceInfo(voice: Voice): { label: string; emoji: string; style: string } {
    const voiceMap = {
      alloy: { label: "Alloy", emoji: "🎭", style: "Neutral & Clear" },
      echo: { label: "Echo", emoji: "🎪", style: "Expressive & Dynamic" },
      fable: { label: "Fable", emoji: "📚", style: "Storytelling & Warm" },
      onyx: { label: "Onyx", emoji: "💎", style: "Deep & Authoritative" },
      nova: { label: "Nova", emoji: "⭐", style: "Bright & Energetic" },
      shimmer: { label: "Shimmer", emoji: "✨", style: "Soft & Gentle" },
    };
    return voiceMap[voice];
  }
}

export const ttsGenerator = TTSGenerator.getInstance();
