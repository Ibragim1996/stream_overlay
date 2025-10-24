// lib/ultra-human-tts.ts
// Ultra-realistic TTS with maximum human-like qualities

import { OpenAI } from 'openai';
import crypto from 'crypto';

export type VoiceMode = 'funny' | 'motivator' | 'serious' | 'chill' | 'street';
export type VoiceId = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';

// Best voice mappings for each mode
const VOICE_MAPPING: Record<VoiceMode, VoiceId> = {
  funny: 'nova',      // Bright, energetic female
  motivator: 'echo',  // Expressive, dynamic
  serious: 'onyx',    // Deep, authoritative 
  chill: 'shimmer',   // Soft, gentle
  street: 'echo'      // Expressive, energetic
};

// Natural speech enhancements for human-like delivery
function enhanceTextForSpeech(text: string, mode: VoiceMode): string {
  let enhanced = text;

  // Add natural pauses with commas
  enhanced = enhanced.replace(/\band\b/gi, ', and');
  enhanced = enhanced.replace(/\bor\b/gi, ', or');
  enhanced = enhanced.replace(/\bbut\b/gi, ', but');

  // Add emphasis for questions
  if (enhanced.includes('?')) {
    enhanced = enhanced.replace(/\?/g, '...?');
  }

  // Mode-specific enhancements
  switch (mode) {
    case 'funny':
      // Add laughs and playful pauses
      enhanced = enhanced.replace(/haha|lol/gi, 'haha');
      enhanced = enhanced.replace(/bruh/gi, 'bruhhh');
      break;
      
    case 'motivator':
      // Add energy and emphasis
      enhanced = enhanced.replace(/!/g, '!!');
      enhanced = enhanced.replace(/\byou\b/gi, 'YOU');
      enhanced = enhanced.replace(/\blet's go\b/gi, 'LET\'S GO');
      break;
      
    case 'serious':
      // Add thoughtful pauses
      enhanced = enhanced.replace(/\./g, '...');
      enhanced = enhanced.replace(/,/g, '... ');
      break;
      
    case 'chill':
      // Add relaxed spacing
      enhanced = enhanced.replace(/,/g, ', ');
      enhanced = enhanced.replace(/\./g, '...');
      break;
      
    case 'street':
      // Emphasize slang
      enhanced = enhanced.replace(/\byo\b/gi, 'yooo');
      enhanced = enhanced.replace(/\bfrfr\b/gi, 'for real for real');
      enhanced = enhanced.replace(/\bno cap\b/gi, 'no cap');
      enhanced = enhanced.replace(/\bdeadass\b/gi, 'dead ass');
      enhanced = enhanced.replace(/\blowkey\b/gi, 'low key');
      break;
  }

  return enhanced;
}

// Speed adjustments for natural delivery
function getSpeedForMode(mode: VoiceMode): number {
  const speeds: Record<VoiceMode, number> = {
    funny: 1.08,      // Slightly faster, energetic
    motivator: 1.12,  // Fast, pumped up
    serious: 0.88,    // Slower, deliberate
    chill: 0.85,      // Slow, relaxed
    street: 1.10      // Fast, energetic
  };
  return speeds[mode];
}

export interface TTSOptions {
  text: string;
  mode: VoiceMode;
  voiceId?: VoiceId;
}

export interface TTSResult {
  audioBuffer: Buffer;
  mime: string;
  voice: string;
  model: string;
  hash: string;
}

/**
 * Generate ultra-realistic human-like TTS
 * Uses OpenAI's best TTS with maximum human qualities
 */
export async function generateHumanTTS(options: TTSOptions): Promise<TTSResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const { text, mode, voiceId } = options;
  
  // Select best voice for mode (or use custom voice)
  const voice = voiceId || VOICE_MAPPING[mode];
  
  // Enhance text for natural speech
  const enhancedText = enhanceTextForSpeech(text, mode);
  
  // Get speed for natural delivery
  const speed = getSpeedForMode(mode);
  
  console.log('[UltraHumanTTS] Generating:', {
    originalText: text.substring(0, 50),
    enhancedText: enhancedText.substring(0, 50),
    voice,
    speed,
    mode
  });

  const client = new OpenAI({ apiKey });
  
  try {
    const response = await client.audio.speech.create({
      model: 'tts-1-hd', // Highest quality model
      voice: voice as any,
      input: enhancedText,
      response_format: 'mp3',
      speed: speed
    });

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Generate hash for caching
    const hash = crypto
      .createHash('sha256')
      .update(`${voice}:${mode}:${text}`)
      .digest('hex')
      .substring(0, 16);

    console.log('[UltraHumanTTS] Success! Audio size:', buffer.length, 'bytes');

    return {
      audioBuffer: buffer,
      mime: 'audio/mpeg',
      voice,
      model: 'tts-1-hd',
      hash
    };
  } catch (error) {
    console.error('[UltraHumanTTS] Generation failed:', error);
    throw new Error(`TTS generation failed: ${error}`);
  }
}

/**
 * Quick test function
 */
export async function testHumanTTS(): Promise<void> {
  const tests: TTSOptions[] = [
    { text: 'yo chat, what\'s up? this is insane frfr!', mode: 'street' },
    { text: 'you got this! let\'s go, keep pushing!', mode: 'motivator' },
    { text: 'so like, what\'s your favorite chill song?', mode: 'chill' },
    { text: 'bruh, that was hilarious haha', mode: 'funny' },
    { text: 'what do you think is the most important skill?', mode: 'serious' }
  ];

  for (const test of tests) {
    console.log(`\n[Test] Mode: ${test.mode}`);
    try {
      const result = await generateHumanTTS(test);
      console.log(`✅ Success: ${result.audioBuffer.length} bytes`);
    } catch (error) {
      console.log(`❌ Failed: ${error}`);
    }
  }
}
