// lib/tts-generator.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Новые эмоциональные голоса OpenAI Voice Engine
export type Voice = "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";

export interface TTSOptions {
  text: string;
  voice: Voice;
  speed?: number; // 0.25 to 4.0
  format?: 'mp3' | 'opus' | 'aac' | 'flac';
  emotion?: 'excited' | 'calm' | 'cheerful' | 'sad' | 'angry' | 'fearful' | 'disgusted' | 'surprised';
  style?: 'natural' | 'dramatic' | 'conversational' | 'storytelling';
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
      const { text, voice, speed = 1.0, format = 'mp3', emotion, style } = options;

      if (!text || text.trim().length === 0) {
        throw new Error('Text is required for TTS generation');
      }

      if (text.length > 4096) {
        throw new Error('Text too long for TTS (max 4096 characters)');
      }

      // Добавляем эмоциональные маркеры в текст для более естественного звучания
      const enhancedText = this.enhanceTextWithEmotion(text, emotion, style);

      console.log(`Generating TTS for text: "${enhancedText.substring(0, 50)}..." with voice: ${voice}, emotion: ${emotion || 'natural'}`);

      const response = await openai.audio.speech.create({
        model: "tts-1-hd", // Используем HD модель для лучшего качества
        voice: voice,
        input: enhancedText,
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

  // Улучшаем текст эмоциональными маркерами для более естественного звучания
  private enhanceTextWithEmotion(text: string, emotion?: string, style?: string): string {
    let enhancedText = text;

    // Добавляем эмоциональные паузы и интонации
    if (emotion === 'excited') {
      enhancedText = enhancedText
        .replace(/!/g, '! *pause* ')
        .replace(/\?/g, '? *pause* ')
        .replace(/\./g, '. *pause* ');
    } else if (emotion === 'calm') {
      enhancedText = enhancedText
        .replace(/!/g, '.')
        .replace(/\?/g, '? *long_pause* ');
    } else if (emotion === 'cheerful') {
      enhancedText = enhancedText
        .replace(/!/g, '! *laugh* ')
        .replace(/\./g, '. *smile* ');
    } else if (emotion === 'surprised') {
      enhancedText = enhancedText
        .replace(/!/g, '! *gasp* ')
        .replace(/\?/g, '? *surprised* ');
    }

    // Добавляем стилистические улучшения
    if (style === 'dramatic') {
      enhancedText = `*dramatic_pause* ${enhancedText} *dramatic_pause*`;
    } else if (style === 'storytelling') {
      enhancedText = `*storytelling_tone* ${enhancedText} *storytelling_end*`;
    } else if (style === 'conversational') {
      enhancedText = `*conversational* ${enhancedText}`;
    }

    return enhancedText;
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

  // Генерируем случайную эмоцию для разнообразия
  getRandomEmotion(): string {
    const emotions = ['excited', 'cheerful', 'surprised', 'calm', 'dramatic'];
    return emotions[Math.floor(Math.random() * emotions.length)];
  }

  // Генерируем случайный стиль
  getRandomStyle(): string {
    const styles = ['natural', 'dramatic', 'conversational', 'storytelling'];
    return styles[Math.floor(Math.random() * styles.length)];
  }

  // Генерируем случайную скорость для естественности
  getRandomSpeed(): number {
    return Math.random() * 0.4 + 0.8; // От 0.8 до 1.2
  }

  // Создаем эмоционально разнообразную конфигурацию
  generateEmotionalConfig(mode: string, tone: string): TTSOptions {
    const voices: Voice[] = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];
    const voice = voices[Math.floor(Math.random() * voices.length)];
    
    let emotion = this.getRandomEmotion();
    let style = this.getRandomStyle();
    
    // Адаптируем эмоции под режим и тон
    if (mode === 'funny') {
      emotion = Math.random() > 0.5 ? 'cheerful' : 'excited';
      style = Math.random() > 0.3 ? 'dramatic' : 'conversational';
    } else if (mode === 'serious') {
      emotion = Math.random() > 0.5 ? 'calm' : 'dramatic';
      style = 'natural';
    } else if (mode === 'chill') {
      emotion = 'calm';
      style = 'conversational';
    } else if (mode === 'street') {
      emotion = Math.random() > 0.5 ? 'excited' : 'surprised';
      style = 'dramatic';
    }

    return {
      voice,
      emotion: emotion as any,
      style: style as any,
      speed: this.getRandomSpeed(),
      format: 'mp3'
    };
  }
}

export const ttsGenerator = TTSGenerator.getInstance();
