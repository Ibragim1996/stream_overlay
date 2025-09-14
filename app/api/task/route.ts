// app/api/task/route.ts
import { NextRequest } from 'next/server';
import type { Mode, TaskType, StreamKind } from '@/lib/mode';

// ...existing code...

// --- Next/Vercel runtime hints ---
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// ленивый импорт клиента Redis (не трогает env на билде)
const redisL = async () => (await import('@/lib/redis')).getRedis();
// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------
const json = (data: unknown, init?: number | ResponseInit) =>
  new Response(JSON.stringify(data), {
    status: typeof init === 'number' ? init : init?.status ?? 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'access-control-allow-origin': '*', // при желании замени на твой домен
    },
  });

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'POST, OPTIONS',
      'access-control-allow-headers': 'authorization, content-type',
      'access-control-max-age': '600',
    },
  });
}

const NOW = () => Date.now();

// ------------------------------------------------------------------
// Redis keys
// ------------------------------------------------------------------
const kRecent = (t: string) => `ovl:recent:${t}`;
const kRate   = (t: string) => `rate:${t}:${Math.floor(Date.now() / 60000)}`;

// ------------------------------------------------------------------
/* Input normalization (с обратной совместимостью старых названий) */
// ------------------------------------------------------------------
type TaskTypeIn = TaskType | 'challenge' | 'joke' | 'just_talk';
type StreamKindIn = StreamKind | 'just_chat' | 'gaming' | 'music' | 'cooking';

function normMode(v: unknown): Mode {
  const ok = new Set<Mode>(['funny', 'motivator', 'serious', 'chill', 'urban', 'edgy']);
  return ok.has(v as Mode) ? (v as Mode) : 'motivator';
}
function normTaskType(v: unknown): TaskType {
  const s = String(v ?? '').toLowerCase() as TaskTypeIn;
  if (s === 'question') return 'question';
  if (s === 'banter' || s === 'joke' || s === 'just_talk') return 'banter';
  return 'task'; // всё остальное → task (включая challenge)
}
function normStreamKind(v: unknown): StreamKind {
  const s = String(v ?? '').toLowerCase() as StreamKindIn;
  if (s === 'irl') return 'irl';
  if (s === 'just_chat' || s === 'just_chatting') return 'just_chatting';
  return 'other';
}
function normLang(v: unknown): 'en' | 'ru' | 'es' {
  const s = String(v ?? '').toLowerCase();
  if (s === 'ru' || s === 'es') return s;
  return 'en';
}
function normVoice(v: unknown): 'male' | 'female' | 'robot' {
  const s = String(v ?? '').toLowerCase();
  if (s === 'female' || s === 'robot') return s;
  return 'male'; // default to male professional
}

// ------------------------------------------------------------------
// Anti-duplicate scoring (простая, но действенная логика)
// ------------------------------------------------------------------
function normLine(s: string) {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
function jaccard(a: string, b: string) {
  const A = new Set(normLine(a).split(' '));
  const B = new Set(normLine(b).split(' '));
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const w of A) if (B.has(w)) inter++;
  const uni = A.size + B.size - inter;
  return inter / uni;
}
function pickDissimilar(cands: string[], recent: string[]) {
  const pool = cands
    .map((s) => String(s ?? '').trim())
    .filter((s) => s.length >= 6);
  if (!pool.length) return '';
  let best = pool[0];
  let bestScore = 1;
  for (const c of pool) {
    const score = Math.max(...(recent.length ? recent.map((r) => jaccard(c, r)) : [0]));
    if (score < bestScore) {
      bestScore = score;
      best = c;
    }
  }
  return best;
}

// ------------------------------------------------------------------
// Recent history in Redis
// ------------------------------------------------------------------
async function getRecent(token: string, limit = 12): Promise<string[]> {
  const redis = await redisL();
  const raw = (await redis.lrange(kRecent(token), 0, limit - 1)) as unknown as string[] | null;
  return raw ?? [];
}
async function pushRecent(token: string, line: string, keep = 24) {
  const redis = await redisL();
  const key = kRecent(token);
  await redis.lpush(key, line);
  await redis.ltrim(key, 0, keep - 1);
  await redis.expire(key, 60 * 60 * 12); // 12h
}

async function rateLimit(token: string, limitPerMin = 20) {
  const redis = await redisL();
  const key = kRate(token);
  const n = Number(await redis.incr(key));
  if (n === 1) await redis.expire(key, 60);
  return n <= limitPerMin;
}

// ------------------------------------------------------------------
// Token verification (динамически тянем verifyToken, если есть)
// ------------------------------------------------------------------
type VerifyResult = { ok: boolean; name?: string };
async function verifyBearer(bearer: string): Promise<VerifyResult> {
  try {
    const mod: any = await import('@/lib/token').catch(() => null);
    if (mod && typeof mod.verifyToken === 'function') {
      const r = await Promise.resolve(mod.verifyToken(bearer));
      return { ok: !!r?.ok, name: r?.name || '' };
    }
  } catch { /* ignore */ }
  // Прод-режим лучше сделать JWT/HMAC; пока допускаем любой непустой токен.
  return { ok: Boolean(bearer), name: '' };
}

// ------------------------------------------------------------------
// OpenAI
// ------------------------------------------------------------------
const OPENAI_URL   = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

type PromptArgs = {
  mode: Mode;
  taskType: TaskType;
  streamKind: StreamKind;
  voice: 'male' | 'female' | 'robot';
  lang: 'en' | 'ru' | 'es';
  recent: string[];
  name?: string;
};

function toneInstruction(mode: Mode, lang: 'en' | 'ru' | 'es') {
  if (lang === 'ru') {
    const ru: Record<Mode, string> = {
      funny: 'Лёгкий юмор, остроумно, без пошлости.',
      motivator: 'Поддерживай и заряжай энергией.',
      serious: 'Коротко, по делу, уверенно.',
      chill: 'Расслабленно и ненавязчиво.',
      urban: 'Современный уличный сленг, TOS-safe (без оскорблений).',
      edgy: 'Острее/подначивание, но без травли и оскорблений (TOS-safe).',
    };
    return ru[mode];
  }
  if (lang === 'es') {
    const es: Record<Mode, string> = {
      funny: 'Ligero y con humor, sin vulgaridad.',
      motivator: 'Apoya y da energía.',
      serious: 'Conciso y directo.',
      chill: 'Relajado y sin presión.',
      urban: 'Jerga urbana moderna, TOS-safe (sin insultos).',
      edgy: 'Más agudo/sarcástico, pero sin acoso (TOS-safe).',
    };
    return es[mode];
  }
  const en: Record<Mode, string> = {
    funny: 'Playful, witty, no crudeness.',
    motivator: 'Supportive, energizing.',
    serious: 'Concise and focused.',
    chill: 'Relaxed, low-pressure.',
    urban: 'Modern street/urban slang vibe, TOS-safe (no slurs).',
    edgy: 'Sharper/roast-y but TOS-safe (no harassment).',
  };
  return en[mode];
}

function voiceStyleInstruction(voice: 'male' | 'female' | 'robot', lang: 'en' | 'ru' | 'es') {
  if (lang === 'ru') {
    const ru: Record<string, string> = {
      male: 'Мужской голос, уверенно и профессионально. Эмоционально и выразительно.',
      female: 'Женский голос, дружелюбно и тепло. Эмоционально и выразительно.',
      robot: 'Роботизированный голос, технично и четко. Современный AI-стиль.',
    };
    return ru[voice];
  }
  if (lang === 'es') {
    const es: Record<string, string> = {
      male: 'Voz masculina, confiada y profesional. Emocional y expresiva.',
      female: 'Voz femenina, amigable y cálida. Emocional y expresiva.',
      robot: 'Voz robótica, técnica y clara. Estilo AI moderno.',
    };
    return es[voice];
  }
  const en: Record<string, string> = {
    male: 'Male voice, confident and professional. Emotional and expressive.',
    female: 'Female voice, friendly and warm. Emotional and expressive.',
    robot: 'Robotic voice, technical and clear. Modern AI style.',
  };
  return en[voice];
}

function buildPrompt(args: PromptArgs) {
  const { mode, taskType, streamKind, voice, lang, recent, name } = args;
  const baseGuard =
    'Stay TOS-safe: no slurs, hate, harassment, explicit sexual content, dangerous acts, or glorifying illegal activity.';
  const vibe = toneInstruction(mode, lang);
  const voiceStyle = voiceStyleInstruction(voice, lang);
  const audienceHint =
    taskType === 'banter'
      ? (lang === 'ru'
          ? 'Иногда обращайся к зрителям 1–2 словами (напр. «чат, как думаете?»).'
          : lang === 'es'
          ? 'A veces dirígete a los espectadores en 1–2 palabras (p. ej., “chat, ¿qué opinan?”).'
          : 'Sometimes address the viewers in 1–2 words (e.g., “chat, thoughts?”).')
      : (lang === 'ru'
          ? 'Адресуй задание стримеру.'
          : lang === 'es'
          ? 'Dirige la tarea al streamer.'
          : 'Address the task to the streamer.');
  const style =
    taskType === 'question'
      ? (lang === 'ru'
          ? 'Дай 1 живой вопрос с эмоцией, без клише, ≤140 символов, без нумерации, БЕЗ кавычек, только строка.'
          : lang === 'es'
          ? 'Da 1 pregunta viva con emoción, máx 140 caracteres, sin numeración ni comillas, una sola línea.'
          : 'Give 1 alive question with emotion, ≤140 chars, no numbering, NO quotes, single line.')
      : taskType === 'banter'
      ? (lang === 'ru'
          ? 'Дай 1 реплику/подкол с юмором, ≤140 символов, без нумерации и кавычек.'
          : lang === 'es'
          ? 'Da 1 línea/banter con humor, máx 140, sin numeración ni comillas.'
          : 'Give 1 banter line with humor, ≤140 chars, no numbering, no quotes.')
      : (lang === 'ru'
          ? 'Дай 1 конкретное микро-задание для стримера, ≤140 символов, без нумерации и кавычек.'
          : lang === 'es'
          ? 'Da 1 micro-tarea concreta para el streamer, máx 140, sin numeración ni comillas.'
          : 'Give 1 concrete micro-task for the streamer, ≤140 chars, no numbering, no quotes.');
  const avoid = recent.length
    ? (lang === 'ru'
        ? `Избегай повторов по смыслу с недавними: ${recent.map((r) => `«${r}»`).join('; ')}.`
        : lang === 'es'
        ? `Evita solaparte con recientes: ${recent.map((r) => `«${r}»`).join('; ')}.`
        : `Avoid semantic duplicates of recent ones: ${recent.join(' | ')}`)
    : '';
  const streamHint =
    streamKind === 'irl'
      ? (lang === 'ru' ? 'Контекст: IRL (на ходу/на улице).' : lang === 'es' ? 'Contexto: IRL (en movimiento).' : 'Context: IRL (on the move).')
      : streamKind === 'just_chatting'
      ? (lang === 'ru' ? 'Контекст: Just Chatting (у стола, общение).' : lang === 'es' ? 'Contexto: Just Chatting (a cámara).' : 'Context: Just Chatting (at desk).')
      : (lang === 'ru' ? 'Контекст: разное.' : lang === 'es' ? 'Contexto: variado.' : 'Context: mixed.');
  const who =
    name && name.trim()
      ? (lang === 'ru' ? `Имя стримера: ${name}.` : lang === 'es' ? `Nombre del streamer: ${name}.` : `Streamer name: ${name}.`)
      : '';
  return [baseGuard, vibe, voiceStyle, streamHint, audienceHint, style, avoid, who].filter(Boolean).join('\n');
}

function sanitizeOneLine(s: string): string {
  // убираем кавычки/маркеры списков, схлопываем пробелы, режем до 140
  let out = s
    .split('\n')
    .map((x) => x.replace(/^\s*[\-\d\.\)\]]+\s*/, ''))
    .join(' ')
    .replace(/["“”‘’]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (out.length > 140) out = out.slice(0, 140).trim();
  return out;
}

async function openaiOneLine(args: PromptArgs): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return '';
  const prompt = buildPrompt(args);
  const res = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${key}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.9,
      top_p: 0.95,
      messages: [
        {
          role: 'system',
          content:
            'You generate one single-line output for a live stream overlay. Keep it ≤140 chars, no quotes, no numbering, no emojis unless natural. TOS-safe.',
        },
        { role: 'user', content: prompt },
      ],
    }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`openai_error ${res.status}: ${txt.slice(0, 200)}`);
  }
  const data = await res.json().catch(() => ({}));
  const raw = String(data?.choices?.[0]?.message?.content ?? '').trim();
  return sanitizeOneLine(raw);
}

// ------------------------------------------------------------------
// Fallback candidates (когда OpenAI недоступен)
// ------------------------------------------------------------------
const FALLBACK: string[] = [
  "Chat, rate the streamer's fit 1–10 — be honest.",
  'Tell us your most controversial food take in 10s.',
  'Pick one: sleep or grind — and why?',
  'Show your phone lockscreen for 3 seconds 😏',
  'Do a 7-word life advice, no more, no less.',
  'Chat, drop one dare (PG-13) for the next minute.',
  'Tell a tiny L you took this week.',
  'If you vanished for a day — what’s the move?',
  "Name one habit you're trying to fix.",
  'Give your best two-line roast of yourself.',
];

// ------------------------------------------------------------------
// Handler
// ------------------------------------------------------------------
type Body = {
  kind?: 'ping' | 'next';
  token?: string;
  mode?: Mode | string;
  taskType?: TaskTypeIn | string;
  streamKind?: StreamKindIn | string;
  voice?: 'male' | 'female' | 'robot' | string;
  lang?: 'en' | 'ru' | 'es' | string;
};

// локальный тип события, чтобы не импортировать bus типы на билде
type OverlayTaskEventLocal = {
  type: 'task';
  line: string;
  mode: Mode;
  taskType: TaskType;
  streamKind: StreamKind;
  name?: string;
  ts: number;
};

export async function POST(req: NextRequest) {
  try {
    const raw: Body = (await req.json().catch(() => ({}))) as Body;

    // Берём токен из заголовка или тела
    const h1 = req.headers.get('authorization');
    const h2 = req.headers.get('Authorization');
    const hdr = h1 ?? h2 ?? '';
    const bearer = hdr.toLowerCase().startsWith('bearer ')
      ? hdr.slice(7).trim()
      : (raw.token || '').trim();

    if (!bearer) return json({ ok: false, error: 'token_missing' }, 401);

    const v = await verifyBearer(bearer);
    if (!v.ok) return json({ ok: false, error: 'invalid_token' }, 401);

    const streamerName = v.name || '';
    const token = bearer;

    const okRate = await rateLimit(token, 20);
    if (!okRate) return json({ ok: false, error: 'rate_limited' }, 429);

    const kind = raw.kind === 'ping' ? 'ping' : 'next';
    const mode = normMode(raw.mode);
    const taskType = normTaskType(raw.taskType);
    const streamKind = normStreamKind(raw.streamKind);
    const voice = normVoice(raw.voice);
    const lang = normLang(raw.lang);

    if (kind === 'ping') {
      const recent = await getRecent(token, 10);
      return json({ ok: true, name: streamerName, recent, mode, taskType, streamKind, lang });
    }

    // kind === 'next'
    const recent = await getRecent(token, 12);

    // Пытаемся 3 раза OpenAI и выбираем наименее похожую строку
    const candidates: string[] = [];
    let openaiOk = true;
    for (let i = 0; i < 3; i++) {
      try {
        const line = await openaiOneLine({ mode, taskType, streamKind, voice, lang, recent, name: streamerName });
        if (line) candidates.push(line);
      } catch {
        openaiOk = false;
        break;
      }
    }

    let line = pickDissimilar(candidates, recent);

    // Фоллбек при пустом результате/ошибке OpenAI
    if (!line) {
      const shuffled = [...FALLBACK].sort(() => Math.random() - 0.5);
      line = pickDissimilar(shuffled.slice(0, 5), recent) || shuffled[0];
      line = sanitizeOneLine(line);
    }

    await pushRecent(token, line);

    // Публикация события в очередь (динамический импорт, чтобы не падать на билде)
    let via: 'openai' | 'fallback' = openaiOk && candidates.length ? 'openai' : 'fallback';
    try {
      const { channelNameForToken, enqueue } = await import('@/lib/bus');
      const event: OverlayTaskEventLocal = {
        type: 'task',
        line,
        mode,
        taskType,
        streamKind,
        name: streamerName || undefined,
        ts: NOW(),
      };
      const channel = channelNameForToken(token);
      await enqueue(channel, event as any);
    } catch {
      // не фейлим ответ — оверлей может опрашивать историю
    }

    return json({ ok: true, task: line, mode, taskType, streamKind, lang, via });
  } catch (e: any) {
    return json({ ok: false, error: e?.message || 'server_error' }, 500);
  }
}