import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Human-like prompt types
type Mode = 'funny' | 'motivator' | 'serious' | 'chill' | 'street';
type VoiceId = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';

type Body = {
  overlayKey?: string;
  mode?: string;
  tone?: string;
  voiceId?: string;
};

// Improved human-like prompts with natural language
const HUMAN_PROMPTS = {
  funny: `You generate ONE engaging question for a livestream. Use natural internet slang: bruh, yo, lowkey, frfr, no cap. Sound like a real person talking casually. Keep it under 140 characters. Make it fun and relatable.`,
  
  motivator: `You generate ONE motivational question or challenge. Be supportive and energetic. Use phrases like "let's go", "you got this". Sound genuine and encouraging. Keep it under 140 characters.`,
  
  serious: `You generate ONE thoughtful question. Be direct and meaningful. No fluff. Sound mature and focused. Keep it under 140 characters.`,
  
  chill: `You generate ONE relaxed question. Sound laid-back and friendly, like talking to a friend. Use casual language. Keep it under 140 characters.`,
  
  street: `You generate ONE question using urban slang. Use: yo, bruh, frfr, no cap, lowkey, deadass, facts. Sound authentic and modern. Keep it under 140 characters.`
};

// Best voice for each mode
const VOICE_MAPPING: Record<Mode, VoiceId> = {
  funny: 'nova',
  motivator: 'echo',
  serious: 'onyx',
  chill: 'shimmer',
  street: 'echo'
};

// Speed for natural delivery
const SPEED_MAPPING: Record<Mode, number> = {
  funny: 1.08,
  motivator: 1.12,
  serious: 0.88,
  chill: 0.85,
  street: 1.10
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'access-control-allow-origin': '*' },
  });
}

function sanitizeOneLine(s: string) {
  return String(s)
    .split('\n')
    .map((x) => x.replace(/^\s*[\-\d\.\)\]]+\s*/, ''))
    .join(' ')
    .replace(/["""'']/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 140);
}

// Redis helper
const getRedis = async () => {
  try {
    const { getRedis: getRed } = await import('@/lib/redis');
    return getRed();
  } catch {
    return null;
  }
};

// Rate limiting
async function checkRateLimit(key: string): Promise<boolean> {
  try {
    const redis = await getRedis();
    if (!redis) return true;
    
    const rateLimitKey = `ratelimit:${key}:${Math.floor(Date.now() / 60000)}`;
    const count = await redis.incr(rateLimitKey);
    await redis.expire(rateLimitKey, 60);
    
    return count <= 20;
  } catch {
    return true;
  }
}

// Store recent tasks
async function getRecentTasks(key: string): Promise<string[]> {
  try {
    const redis = await getRedis();
    if (!redis) return [];
    
    const recentKey = `recent:${key}`;
    const recent = await redis.lrange(recentKey, 0, 9);
    return recent || [];
  } catch {
    return [];
  }
}

async function saveRecentTask(key: string, task: string): Promise<void> {
  try {
    const redis = await getRedis();
    if (!redis) return;
    
    const recentKey = `recent:${key}`;
    await redis.lpush(recentKey, task);
    await redis.ltrim(recentKey, 0, 19);
    await redis.expire(recentKey, 3600 * 12);
  } catch {
    // Ignore
  }
}

  // Fallback tasks - ultra human-like
  const FALLBACK_TASKS = {
    funny: [
      "yo chat, what's the most embarrassing thing you did this week?",
      "bruh, rate your setup 1-10, be honest",
      "quick question - pineapple on pizza, yes or nah?",
      "what's your most controversial food take?",
      "chat, describe your vibe in 3 words"
    ],
    motivator: [
      "alright, let's see a quick stretch - you got this!",
      "chat, drop some love for this legend real quick",
      "you're doing amazing, keep that energy up!",
      "let's go! show us that winning smile",
      "quick check-in - how are you feeling today?"
    ],
    serious: [
      "what's one thing you learned this week that mattered?",
      "real talk - how do you handle burnout?",
      "what skill are you currently trying to improve?",
      "what's your biggest goal right now?",
      "how do you stay motivated when things get tough?"
    ],
    chill: [
      "so like, what's your comfort food right now?",
      "what's your go-to late night snack?",
      "if you could be anywhere right now, where would you be?",
      "what's your favorite way to relax?",
      "what song are you vibing to lately?"
    ],
    street: [
      "yo chat, what's the most mid thing about this setup frfr?",
      "lowkey wanna know - what's your most controversial take?",
      "bruh, rate the fit 1-10, no cap be honest",
      "deadass, what's your favorite thing to do right now?",
      "frfr, if you could do anything today what would it be?"
    ]
  };

  function getRandomTask(mode: string, overlayKey: string): string {
    const normalizedMode = (['funny', 'motivator', 'serious', 'chill', 'street'].includes(mode) ? mode : 'funny') as Mode;
    const tasks = FALLBACK_TASKS[normalizedMode];
    return tasks[Math.floor(Math.random() * tasks.length)];
  }

async function rateLimitIP(req: NextRequest, windowSec = 3) {
  const tasks = FALLBACK_TASKS[mode as keyof typeof FALLBACK_TASKS] || FALLBACK_TASKS.funny;
  
  // Get recent tasks for this overlay
  const recent = recentTasks.get(overlayKey) || [];
  
  // Filter out recent tasks
  const availableTasks = tasks.filter(task => !recent.includes(task));
  
  // If all tasks were recent, reset the recent list
  const taskPool = availableTasks.length > 0 ? availableTasks : tasks;
  
  // Pick random task
  const selectedTask = taskPool[Math.floor(Math.random() * taskPool.length)];
  
  // Update recent tasks (keep last 5)
  recentTasks.set(overlayKey, [...recent.slice(-4), selectedTask]);
  
  return selectedTask;
}

async function rateLimitIP(req: NextRequest, windowSec = 3) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || (req as any).ip || '0.0.0.0';
    // Simple in-memory rate limiting for development
    // In production, use Redis
    return true; // Skip rate limiting for now
  } catch (e) {
    console.warn('Rate limiting error:', e);
    return true;
  }
}

async function rateLimitKey(key: string, windowSec = 2) {
  try {
    // Simple in-memory rate limiting for development
    // In production, use Redis
    return true; // Skip rate limiting for now
  } catch (e) {
    console.warn('Rate limiting error:', e);
    return true;
  }
}

export async function OPTIONS() { 
  return json(null, 204); 
}

export async function POST(req: NextRequest) {
  try {
    console.log('[API] /api/tasks/next - Starting request');
    
    const raw = (await req.json().catch(() => ({}))) as Body;
    const overlayKey = (raw.overlayKey || '').trim();
    const mode = (raw.mode || 'funny').trim() as Mode;
    const tone = (raw.tone || 'calm').trim();
    const voiceId = (raw.voiceId || 'alloy').trim() as VoiceId;

    console.log('[API] Request params:', { overlayKey: overlayKey ? 'present' : 'missing', mode, tone, voiceId });

    if (!overlayKey) {
      console.log('[API] Missing overlayKey');
      return json({ ok: false, error: 'overlay_key_missing' }, 400);
    }

    // Rate limiting
    const allowed = await checkRateLimit(overlayKey);
    if (!allowed) {
      console.log('[API] Rate limited');
      return json({ ok: false, error: 'Rate limit exceeded. Please wait a moment.' }, 429);
    }

    // Get recent tasks to avoid repetition
    const recent = await getRecentTasks(overlayKey);

    // Generate text with OpenAI using human prompts
    console.log('[API] Generating human-like task');
    let text = '';
    let via: 'ai' | 'fallback' = 'fallback';
    
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    
    if (hasOpenAI) {
      try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        
        // Use improved prompts
        const systemPrompt = HUMAN_PROMPTS[mode] || HUMAN_PROMPTS.funny;
        
        const resp = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: 'Generate ONE natural question:' }
          ],
          max_tokens: 60,
          temperature: 0.95,
          presence_penalty: 0.6,
          frequency_penalty: 0.7
        });
        
        text = sanitizeOneLine(resp.choices[0]?.message?.content || '');
        via = 'ai';
        console.log('[API] Generated human-like text:', text);
      } catch (e) {
        console.error('[API] OpenAI generation error:', e);
        // Fallback
        text = getRandomTask(mode, overlayKey);
        via = 'fallback';
        console.log('[API] Using fallback text:', text);
      }
    } else {
      console.log('[API] OpenAI not available, using fallback');
      text = getRandomTask(mode, overlayKey);
      via = 'fallback';
    }

    // Save to recent tasks
    await saveRecentTask(overlayKey, text);

    // Generate TTS with improved voice
    console.log('[API] Generating TTS');
    let voiceUrl = '';
    
    if (hasOpenAI) {
      try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        
        // Select best voice for mode
        const selectedVoice = voiceId || VOICE_MAPPING[mode];
        const speed = SPEED_MAPPING[mode];
        
        console.log('[API] TTS params:', { voice: selectedVoice, speed, mode });
        
        const response = await openai.audio.speech.create({
          model: 'tts-1-hd',
          voice: selectedVoice as any,
          input: text,
          response_format: 'mp3',
          speed: speed
        });
        
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Audio = buffer.toString('base64');
        voiceUrl = `data:audio/mpeg;base64,${base64Audio}`;
        
        console.log('[API] TTS generated, size:', buffer.length);


      } catch (e) {
        console.error('[API] TTS synthesis error:', e);
        voiceUrl = ''; // No audio fallback
      }
    } else {
      console.log('[API] OpenAI not available, no audio');
      voiceUrl = '';
    }

    console.log('[API] Success, returning response');
    return json({ 
      ok: true, 
      text, 
      voiceUrl, 
      mode, 
      tone,
      via,
      hasAudio: !!voiceUrl
    });
  } catch (e: any) {
    console.error('[API] Error in /api/tasks/next:', e);
    return json({ 
      ok: false, 
      error: e?.message || 'server_error',
      details: process.env.NODE_ENV === 'development' ? e.stack : undefined
    }, 500);
  }
}
