import crypto from 'crypto';
import { OpenAI } from 'openai';

export type RealisticSynthesisArgs = {
  text: string;
  mode?: 'funny' | 'street' | 'serious' | 'chill' | 'hype';
  tone?: 'calm' | 'energetic' | 'playful' | 'sarcastic';
  persona?: 'streamer' | 'friend' | 'hype-man';
};

export type RealisticSynthesisResult = {
  audioBuffer: Buffer;
  mime: string;
  durationMs?: number;
  model: string;
  voice: string;
  variantHash: string;
};

// Лучшие голоса для реалистичной речи
const REALISTIC_VOICES = {
  male: ['onyx', 'echo'], // Глубокие, выразительные мужские голоса
  female: ['nova', 'shimmer'], // Яркие, эмоциональные женские голоса
  neutral: ['alloy', 'fable'] // Универсальные голоса
};

const VOICE_CONFIG = {
  onyx: { gender: 'male', style: 'deep', energy: 'high' },
  echo: { gender: 'male', style: 'expressive', energy: 'very-high' },
  nova: { gender: 'female', style: 'bright', energy: 'high' },
  shimmer: { gender: 'female', style: 'soft', energy: 'medium' },
  alloy: { gender: 'neutral', style: 'clear', energy: 'medium' },
  fable: { gender: 'neutral', style: 'warm', energy: 'medium' }
};

// Интернет-сленг и живые выражения
const LIVING_LANGUAGE = {
  greetings: ['yo', 'hey', 'what\'s up', 'sup', 'yo chat', 'what\'s good'],
  reactions: ['no way', 'bruh', 'frfr', 'that\'s wild', 'insane', 'crazy', 'unreal'],
  emphasis: ['literally', 'actually', 'honestly', 'for real', 'deadass', 'lowkey'],
  fillers: ['um', 'uh', 'like', 'you know', 'I mean', 'so like', 'basically'],
  laughter: ['haha', 'lol', 'lmao', 'hahaha', 'hehe', 'pfft'],
  disbelief: ['what', 'seriously', 'no shot', 'cap', 'nah', 'stop'],
  excitement: ['let\'s go', 'yooo', 'this is it', 'we\'re back', 'here we go']
};

// Функция для добавления живых элементов в текст
function addLivingElements(text: string, mode: string, persona: string): string {
  let enhanced = text;
  
  // Добавляем приветствия для стримера
  if (persona === 'streamer' && Math.random() < 0.3) {
    const greeting = LIVING_LANGUAGE.greetings[Math.floor(Math.random() * LIVING_LANGUAGE.greetings.length)];
    enhanced = `${greeting}, ${enhanced.toLowerCase()}`;
  }
  
  // Добавляем реакции в зависимости от контента
  if (enhanced.includes('amazing') || enhanced.includes('incredible')) {
    if (Math.random() < 0.4) {
      const reaction = LIVING_LANGUAGE.reactions[Math.floor(Math.random() * LIVING_LANGUAGE.reactions.length)];
      enhanced = enhanced.replace(/\b(amazing|incredible)\b/gi, `${reaction}, $1`);
    }
  }
  
  // Добавляем естественные заполнители
  if (Math.random() < 0.2) {
    const filler = LIVING_LANGUAGE.fillers[Math.floor(Math.random() * LIVING_LANGUAGE.fillers.length)];
    enhanced = enhanced.replace(/^/, `${filler}, `);
  }
  
  // Добавляем смех для funny режима
  if (mode === 'funny' && Math.random() < 0.3) {
    const laugh = LIVING_LANGUAGE.laughter[Math.floor(Math.random() * LIVING_LANGUAGE.laughter.length)];
    enhanced = enhanced.replace(/\.$/, ` ${laugh}.`);
  }
  
  // Добавляем восклицания для hype режима
  if (mode === 'hype' && Math.random() < 0.4) {
    const excitement = LIVING_LANGUAGE.excitement[Math.floor(Math.random() * LIVING_LANGUAGE.excitement.length)];
    enhanced = enhanced.replace(/^/, `${excitement}! `);
  }
  
  return enhanced;
}

// Обработка текста для естественной человеческой речи
function processTextForSpeech(text: string, mode: string): string {
  let processed = text;
  
  // Добавляем естественные паузы и интонации
  processed = processed.replace(/\./g, '. ');
  processed = processed.replace(/!/g, '! ');
  processed = processed.replace(/\?/g, '? ');
  processed = processed.replace(/,/g, ', ');
  
  // Добавляем эмоциональные акценты для разных режимов
  if (mode === 'funny') {
    processed = processed.replace(/\b(haha|lol|lmao)\b/gi, '$1!');
    processed = processed.replace(/\b(bruh|frfr)\b/gi, '$1!');
  }
  
  if (mode === 'hype') {
    processed = processed.replace(/\b(let's go|yooo|insane|crazy|wild)\b/gi, '$1!');
    processed = processed.replace(/\b(yo chat|hey chat)\b/gi, '$1!');
  }
  
  if (mode === 'street') {
    processed = processed.replace(/\b(no cap|deadass|period)\b/gi, '$1!');
    processed = processed.replace(/\b(yo|ay)\b/gi, '$1!');
  }
  
  // Добавляем естественные заполнители для человечности
  if (Math.random() < 0.3) {
    processed = processed.replace(/^/, 'so, ');
  }
  
  if (Math.random() < 0.2) {
    processed = processed.replace(/\?$/, '? you know what I mean?');
  }
  
  return processed;
}

// Выбор лучшего голоса для режима
function selectBestVoice(mode: string, tone: string): string {
  switch (mode) {
    case 'funny':
      return tone === 'playful' ? 'nova' : 'echo';
    case 'street':
      return 'onyx';
    case 'serious':
      return 'alloy';
    case 'chill':
      return 'shimmer';
    case 'hype':
      return 'echo';
    default:
      return 'alloy';
  }
}

export async function synthesizeRealistic(args: RealisticSynthesisArgs): Promise<RealisticSynthesisResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set');

  // Простая обработка текста для естественной речи
  const processedText = processTextForSpeech(args.text, args.mode || 'funny');
  
  // Выбираем лучший голос
  const voice = selectBestVoice(args.mode || 'funny', args.tone || 'calm');
  
  const client = new OpenAI({ apiKey });
  
  // Настройки TTS для человеческого звучания
  let speed = 1.0;
  if (args.mode === 'hype') speed = 1.15;
  else if (args.mode === 'chill') speed = 0.85;
  else if (args.mode === 'funny') speed = 1.05;
  else if (args.mode === 'street') speed = 1.1;
  
  const request: any = {
    model: 'tts-1-hd',
    voice: voice,
    input: processedText,
    response_format: 'mp3',
    speed: speed,
  };
  
  let audio: ArrayBuffer;
  try {
    console.log('[RealisticTTS] Generating simple TTS for:', processedText.substring(0, 50) + '...');
    const res = await client.audio.speech.create(request);
    audio = await res.arrayBuffer();
  } catch (e) {
    console.error('[RealisticTTS] TTS generation failed:', e);
    throw e;
  }

  const buffer = Buffer.from(audio);
  const variantHash = crypto.createHash('sha1')
    .update([voice, args.mode || '', args.tone || '', processedText].join('|'))
    .digest('hex');
  
  return {
    audioBuffer: buffer,
    mime: 'audio/mpeg',
    model: 'tts-1-hd',
    voice: voice,
    variantHash
  };
}

// Функция для быстрого тестирования TTS
export async function testRealisticTTS(): Promise<Buffer> {
  const testText = "Yo chat, what's up? This is insane, frfr! Let's go!";
  const result = await synthesizeRealistic({
    text: testText,
    mode: 'hype',
    tone: 'energetic',
    persona: 'streamer'
  });
  return result.audioBuffer;
}
