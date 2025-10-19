import crypto from 'crypto';
import { OpenAI } from 'openai';

export type SynthesisArgs = {
  text: string;
  mode?: string;   // fun | street | support | harsh
  tone?: string;   // calm | hype | serious | ...
};

export type SynthesisResult = {
  audioBuffer: Buffer;
  mime: string;
  durationMs?: number; // optional, if available
  model: string;
  voice: string;
  variantHash: string; // hash used for cache key
};

const PROVIDER = process.env.TTS_PROVIDER || 'openai_rest';
const MODEL = process.env.TTS_MODEL || 'gpt-4o-mini-tts';
const MODEL_FALLBACK = 'tts-1-hd';
const VOICE = process.env.TTS_VOICE || process.env.TTS_VOICE_ID || 'alloy';
const FORMAT = (process.env.TTS_FORMAT || 'mp3').toLowerCase();
const SAMPLE_RATE = Number(process.env.TTS_SAMPLE_RATE || 24000);

export const AVAILABLE_VOICES = [
  'alloy','echo','fable','onyx','nova','shimmer','verse','aria','ash','ballad'
];

function chooseModel(): string {
  const prefer = MODEL;
  if (prefer) return prefer;
  return MODEL_FALLBACK;
}

function canonicalizeText(s: string): string {
  return s.replace(/\s+/g, ' ').trim();
}

function microVariate(input: string): string {
  // Enhanced stochastic variation for more human-like speech
  const rnd = Math.random();
  let out = input;
  
  // Add natural pauses and breathing
  if (rnd < 0.12) {
    out = out.replace(/,\s*/g, ', ');
  } else if (rnd < 0.22) {
    out = out.replace(/\.\s*$/, '…');
  } else if (rnd < 0.32) {
    out = out.replace(/!\s*$/, '! (excited)');
  } else if (rnd < 0.42) {
    out = out.replace(/\?\s*$/, '? (curious)');
  } else if (rnd < 0.52) {
    out = out.replace(/\.\s*$/, '. (nods)');
  } else if (rnd < 0.62) {
    out = out.replace(/,\s+/g, ' — ');
  } else if (rnd < 0.72) {
    out = out.replace(/\bum\b/gi, 'um');
  } else if (rnd < 0.82) {
    out = out.replace(/\bwell\b/gi, 'well');
  } else if (rnd < 0.92) {
    out = out.replace(/\bso\b/gi, 'so, like');
  }
  
  // Add emphasis variations with more emotion
  if (Math.random() < 0.4) {
    out = out.replace(/\b(amazing|awesome|incredible|fantastic)\b/gi, '$1!');
  }
  
  // Add conversational fillers and natural speech patterns
  if (Math.random() < 0.15) {
    out = 'So, ' + out;
  }
  if (Math.random() < 0.1) {
    out = out.replace(/\bI\b/gi, 'I, you know');
  }
  if (Math.random() < 0.08) {
    out = out.replace(/\bthat\b/gi, 'that, like');
  }
  
  // Add emotional expressions
  if (Math.random() < 0.2) {
    out = out.replace(/\bwow\b/gi, 'wow, that\'s');
  }
  if (Math.random() < 0.15) {
    out = out.replace(/\boh\b/gi, 'oh my');
  }
  
  // Add natural hesitations
  if (Math.random() < 0.1) {
    out = out.replace(/\bthe\b/gi, 'the, um');
  }
  
  return out;
}

function styleByModeAndTone(text: string, mode?: string, tone?: string): { styled: string; speed: number } {
  const m = (mode || '').toLowerCase();
  const t = (tone || '').toLowerCase();

  let speed = 1.0;
  let s = text;

  // Mode-based emotional styling with more human reactions
  if (m === 'funny' || m === 'fun') {
    s = s.replace(/\.$/, ' — (giggles softly).');
    s = s.replace(/!$/, '! (bursts into laughter)');
    s = s.replace(/\?$/, '? (raises eyebrow with a smirk)');
    s = s.replace(/\bamazing\b/gi, 'absolutely amazing');
    s = s.replace(/\bincredible\b/gi, 'mind-blowing');
    speed = 1.08; // Faster for humor
  } else if (m === 'street' || m === 'urban') {
    s = s.replace(/\.$/, '! (nods confidently)');
    s = s.replace(/!$/, '! (pounds chest)');
    s = s.replace(/\?$/, '? (leans forward)');
    s = s.replace(/\bhey\b/i, 'yo');
    s = s.replace(/\bwhat\b/i, 'what');
    s = s.replace(/\bman\b/i, 'bruh');
    s = s.replace(/\bthat's\b/gi, "that's straight up");
    speed = 1.12; // Faster, more energetic
  } else if (m === 'serious') {
    s = s.replace(/\.$/, '… (nods thoughtfully)');
    s = s.replace(/!$/, '. (speaks firmly)');
    s = s.replace(/\?$/, '? (pauses for emphasis)');
    s = s.replace(/\bimportant\b/gi, 'crucially important');
    speed = 0.88; // Slower, more deliberate
  } else if (m === 'chill') {
    s = s.replace(/\.$/, '… (relaxes back)');
    s = s.replace(/!$/, '… (smiles gently)');
    s = s.replace(/\?$/, '? (tilts head)');
    s = s.replace(/\bcool\b/gi, 'super cool');
    speed = 0.82; // Slower, relaxed
  } else if (m === 'motivator' || m === 'support') {
    s = '(leans in with warm smile) ' + s;
    s = s.replace(/\.$/, '! (clenches fist)');
    s = s.replace(/!$/, '! (pumps fist)');
    s = s.replace(/\?$/, '? (encouraging nod)');
    s = s.replace(/\byou\b/gi, 'you');
    speed = 1.05; // Slightly faster, encouraging
  }

  // Tone-based adjustments with more emotion
  if (t === 'calm') {
    speed *= 0.92;
    s = s.replace(/!/g, '. (speaks softly)');
    s = s.replace(/\bexcited\b/gi, 'pleased');
  } else if (t === 'hype' || t === 'energetic') {
    speed *= 1.15;
    s = s.replace(/\.$/, '! (jumps up)');
    s = s.replace(/\bawesome\b/gi, 'absolutely incredible');
    s = s.replace(/\bgood\b/gi, 'amazing');
  } else if (t === 'serious') {
    speed *= 0.85;
    s = s.replace(/!/g, '. (speaks with authority)');
    s = s.replace(/\bimportant\b/gi, 'critical');
  } else if (t === 'playful') {
    speed *= 1.08;
    s = s.replace(/\.$/, ' — (winks).');
    s = s.replace(/\?$/, '? (playful grin)');
  }

  // Add natural pauses and intonation
  s = s.replace(/\s-\s/g, ' — ');
  s = s.replace(/\?\s*$/, '?! (waits for response)');
  s = s.replace(/,\s+/g, ', ');
  s = s.replace(/\.\s+/g, '. ');

  // Add emotional reactions based on content
  if (s.includes('chat') || s.includes('viewers')) {
    s = s.replace(/(chat|viewers)/gi, '$1 — (looks directly at camera)');
  }
  if (s.includes('?')) {
    s = s.replace(/\?/g, '? (pauses and waits)');
  }
  if (s.includes('!')) {
    s = s.replace(/!/g, '! (eyes light up)');
  }

  // Add breathing and natural speech patterns
  if (Math.random() < 0.3) {
    s = s.replace(/^/, '(takes a breath) ');
  }
  if (Math.random() < 0.2) {
    s = s.replace(/\bso\b/gi, 'so, you know');
  }

  // Stochastic variety for naturalness
  s = microVariate(s);
  
  return { styled: s, speed };
}

function buildHash(model: string, voice: string, mode: string, tone: string, text: string): string {
  const h = crypto.createHash('sha1');
  h.update([model, voice, mode, tone, canonicalizeText(text)].join('|'));
  return h.digest('hex');
}

export async function synthesize(args: SynthesisArgs): Promise<SynthesisResult> {
  if (PROVIDER !== 'openai_rest') {
    throw new Error(`Unsupported TTS_PROVIDER: ${PROVIDER}`);
  }
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set');

  const { styled, speed } = styleByModeAndTone(args.text, args.mode, args.tone);
  const model = chooseModel();
  const voice = AVAILABLE_VOICES.includes(VOICE) ? VOICE : 'alloy';
  const format = FORMAT === 'wav' ? 'wav' : FORMAT === 'ogg' ? 'ogg' : 'mp3';
  const variantHash = buildHash(model, voice, args.mode || '', args.tone || '', styled);

  const client = new OpenAI({ apiKey });

  // Enhanced TTS settings for more human-like voice
  const request: any = {
    model,
    voice,
    input: styled,
    format,
    response_format: format,
  };
  
  // Add human-like parameters
  if (SAMPLE_RATE && Number.isFinite(SAMPLE_RATE)) {
    request.sample_rate = SAMPLE_RATE;
  }
  
  // Add emotional temperature for more natural speech
  request.temperature = 1.2; // Higher temperature for more variation
  
  // Add speed control if supported
  if (speed !== 1.0) {
    request.speed = Math.max(0.25, Math.min(4.0, speed)); // Clamp between 0.25x and 4x
  }

  let audio: ArrayBuffer;
  try {
    const res = await client.audio.speech.create(request);
    audio = await res.arrayBuffer();
  } catch (e) {
    // Fallback to older model
    const res = await client.audio.speech.create({ ...request, model: MODEL_FALLBACK });
    audio = await res.arrayBuffer();
  }

  const buffer = Buffer.from(audio);
  const mime = format === 'mp3' ? 'audio/mpeg' : format === 'wav' ? 'audio/wav' : 'audio/ogg';

  // Audio optimization: normalize volume and trim silence
  const optimizedBuffer = await optimizeAudio(buffer, format);
  
  return { audioBuffer: optimizedBuffer, mime, model, voice, variantHash };
}

async function optimizeAudio(audioBuffer: Buffer, format: string): Promise<Buffer> {
  // Simple audio optimization without external dependencies
  // This is a basic implementation - for production, consider using ffmpeg
  
  try {
    // For MP3, we can't easily modify without decoding
    // This is a placeholder for future enhancement with ffmpeg
    if (format === 'mp3') {
      // Could add ffmpeg-based normalization here
      // For now, return as-is to avoid breaking existing functionality
      return audioBuffer;
    }
    
    // For other formats, return as-is for now
    return audioBuffer;
  } catch (error) {
    console.warn('[TTS] Audio optimization failed, using original:', error);
    return audioBuffer;
  }
}

