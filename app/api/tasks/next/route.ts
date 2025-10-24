import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { buildHumanPrompt, sanitizeOutput, humanizeText } from '@/lib/human-prompts';
import { generateHumanTTS } from '@/lib/ultra-human-tts';
import type { Mode, TaskType, StreamKind } from '@/lib/human-prompts';
import type { VoiceId } from '@/lib/ultra-human-tts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Body = {
  overlayKey?: string;
  mode?: string;
  tone?: string;
  voiceId?: string;
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

  // Fallback tasks with diverse content types - фокус на стримера
  const FALLBACK_TASKS = {
    funny: [
      "hey, what's the weirdest food combo you actually love?",
      "so tell us about your most awkward first date experience",
      "okay, what's something you believed as a kid that was totally wrong?",
      "listen, what's your most embarrassing autocorrect fail?",
      "alright, describe your worst haircut ever in detail",
      "check this, what's the strangest dream you've had recently?",
      "real talk, what's your most irrational fear?",
      "yo, what's something you're secretly terrible at?",
      "bruh, tell us about your most epic fail moment",
      "here's the thing, what's your weirdest habit?"
    ],
    serious: [
      "so, what's a goal you're working towards this year?",
      "listen, what's something you've learned about yourself recently?",
      "alright, what's a challenge you're currently facing?",
      "hey, what's something you're grateful for today?",
      "okay, what's a skill you're trying to develop?",
      "real talk, what's something that's been on your mind?",
      "check this, what's a decision you're struggling with?",
      "so, what's something you're proud of accomplishing?",
      "listen, what's a habit you're trying to change?",
      "alright, what's something you wish you knew earlier?"
    ],
    chill: [
      "hey, what's your current mood and why?",
      "so, what's something that made you smile today?",
      "okay, describe your perfect lazy day",
      "listen, what's your favorite way to relax?",
      "alright, what's something you're looking forward to?",
      "hey, what's your go-to comfort food?",
      "so, what's your favorite time of day?",
      "okay, what's something that always cheers you up?",
      "listen, what's your ideal weekend plan?",
      "alright, what's something you find peaceful?"
    ],
    street: [
      "yo, what's your biggest flex this week?",
      "check this, what's the coldest thing you've done today?",
      "real talk, what's your most confident moment?",
      "ay, tell us something that's straight fire about you",
      "yo, what's your biggest win right now?",
      "check this, what's something you're proud of?",
      "real talk, what's your strongest skill?",
      "ay, what's something that makes you feel powerful?",
      "yo, what's your biggest achievement?",
      "check this, what's something you're really good at?"
    ],
    hype: [
      "let's go! what's got you excited today?",
      "here we go! what's the most exciting thing happening?",
      "this is it! what's your biggest win this week?",
      "let's go! what's something that's absolutely fire?",
      "here we go! what's the most insane thing you've done?",
      "this is it! what's got you hyped right now?",
      "let's go! what's the most exciting thing about you?",
      "here we go! what's something that's wild?",
      "this is it! what's the most thrilling thing you've experienced?",
      "let's go! what's something that's absolutely crazy?"
    ]
  };

// Simple in-memory cache to avoid recent repetitions
const recentTasks = new Map<string, string[]>();

function getRandomTask(mode: string, overlayKey: string): string {
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
        // Use our improved human prompt system
        const taskType: TaskType = 'question';
        const streamKind: StreamKind = 'just_chatting';
        const prompt = buildHumanPrompt(mode, taskType, streamKind, recent);
        
        const { OpenAI } = await import('openai');
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const contentTypes = [
          'question', 'challenge', 'story_request', 'opinion', 'fact_share', 
          'confession', 'prediction', 'memory', 'hypothetical', 'debate'
        ];
        
        const randomType = contentTypes[Math.floor(Math.random() * contentTypes.length)];
        
        const systemPrompt = `You are generating diverse content for a streamer in Just Chatting mode. 

CONTENT TYPE: ${randomType}
MODE: ${mode}

VARIETY REQUIREMENTS:
- NEVER start with the same word twice in a row
- NEVER end with the same word twice in a row  
- Mix different content types: questions, challenges, stories, facts, opinions
- Use different starting patterns: "hey", "so", "listen", "okay", "alright", "yo", "bruh", "check this", "real talk"
- Vary endings: "thoughts?", "what do you think?", "let's hear it", "spill the tea", "no cap", "frfr", "period"

STYLE GUIDELINES:
- Use natural internet slang but vary it
- Keep under 120 characters
- Make it personal to the streamer
- Be engaging and energetic
- Avoid repetitive patterns

CONTENT TYPES TO ROTATE:
- Personal questions about experiences
- Fun challenges or dares  
- Story requests ("tell us about...")
- Opinion polls ("what's your take on...")
- Interesting facts to share
- Hypothetical scenarios
- Memory sharing requests
- Debate topics
- Predictions about future
- Confession requests

Make each response completely different from previous ones.`;

        const userPrompt = `Generate a ${randomType} for a streamer in ${mode} mode. Make it unique and engaging. Avoid any repetitive patterns.`;

        const resp = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 60,
          temperature: 1.3, // Высокая температура для креативности
          top_p: 0.9,
          frequency_penalty: 0.5, // Избегаем повторений
          presence_penalty: 0.3
        });
        
        text = sanitizeOneLine(resp.choices[0]?.message?.content || '');
        via = 'openai';
        console.log('[API] Generated human-like text:', text);
      } catch (e) {
        console.error('[API] OpenAI generation error:', e);
        // Fallback to diverse tasks if OpenAI fails
        text = getRandomTask(mode, overlayKey);
        via = 'fallback';
        console.log('[API] Using fallback text:', text);
      }
    } else {
      console.log('[API] OpenAI not available, using fallback');
      text = getRandomTask(mode, overlayKey);
      via = 'fallback';
    }

    // TTS synthesize - try server TTS first, fallback to no audio
    console.log('[API] Synthesizing TTS');
    let voiceUrl = '';
    
    if (hasOpenAI) {
      try {
        console.log('[API] Trying server TTS');
        const { synthesizeRealistic } = await import('@/lib/realistic-tts');
        const tts = await synthesizeRealistic({ text, mode, tone, persona: 'streamer' });
        console.log('[API] TTS synthesized, buffer size:', tts.audioBuffer.length);

        // Try to upload to storage, but don't fail if unavailable
        if (hasStorage && hasFirebase) {
          try {
            console.log('[API] Uploading to storage');
            const { uploadBufferPublic } = await import('@/lib/storage');
            const uploaded = await uploadBufferPublic(tts.audioBuffer, tts.mime, 'tts');
            voiceUrl = uploaded.url;
            console.log('[API] Uploaded to:', voiceUrl);
          } catch (e) {
            console.error('[API] Storage upload error:', e);
            // Create a data URL as fallback
            const base64 = tts.audioBuffer.toString('base64');
            voiceUrl = `data:${tts.mime};base64,${base64}`;
            console.log('[API] Using data URL fallback');
          }
        } else {
          // Create a data URL as fallback
          const base64 = tts.audioBuffer.toString('base64');
          voiceUrl = `data:${tts.mime};base64,${base64}`;
          console.log('[API] Using data URL fallback (no storage)');
        }
      } catch (e) {
        console.error('[API] TTS synthesis error:', e);
        voiceUrl = ''; // No audio fallback
      }
    } else {
      console.log('[API] OpenAI not available, no audio');
      voiceUrl = '';
    }

    // Write to Firestore - try to save, but don't fail if unavailable
    console.log('[API] Writing to Firestore');
    if (hasFirebase) {
      try {
        const { getAdminDB } = await import('@/lib/firebaseAdmin');
        const db = getAdminDB();
        const ref = db.collection('overlays').doc(overlayKey).collection('state').doc('current');
        await ref.set({ 
          text, 
          voiceUrl, 
          mode, 
          tone, 
          updatedAt: new Date().toISOString() 
        }, { merge: true });
        console.log('[API] Written to Firestore');
      } catch (e) {
        console.error('[API] Firestore write error:', e);
        // Don't fail the request if Firestore is unavailable
      }
    } else {
      console.log('[API] Firestore not available, skipping database write');
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