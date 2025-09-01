// app/api/task/route.ts
import { NextRequest } from 'next/server';
import { redis } from '@/lib/redis';
import { channelNameForToken, enqueue } from '@/lib/bus';
import type { OverlayTaskEvent } from '@/lib/bus';
import type { Mode, TaskType, StreamKind } from '@/lib/mode';

// ---------- утилиты ----------
const json = (data: unknown, init?: number | ResponseInit) =>
  new Response(JSON.stringify(data), {
    status: typeof init === 'number' ? init : init?.status ?? 200,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

const NOW = () => Date.now();

// ключи Redis
const kRecent = (t: string) => `ovl:recent:${t}`;
const kRate   = (t: string) => `rate:${t}:${Math.floor(Date.now()/60000)}`;

// нормализация входных значений (поддержка старых названий из overlay)
type TaskTypeIn = TaskType | 'challenge' | 'joke' | 'just_talk';
type StreamKindIn = StreamKind | 'just_chat' | 'gaming' | 'music' | 'cooking';

function normMode(v: unknown): Mode {
  const ok = new Set<Mode>(['funny','motivator','serious','chill','urban','edgy']);
  return ok.has(v as Mode) ? (v as Mode) : 'motivator';
}
function normTaskType(v: unknown): TaskType {
  const s = String(v || '').toLowerCase() as TaskTypeIn;
  if (s === 'question') return 'question';
  if (s === 'banter' || s === 'joke' || s === 'just_talk') return 'banter';
  // 'challenge' и всё остальное сводим к базовому 'task'
  return 'task';
}
function normStreamKind(v: unknown): StreamKind {
  const s = String(v || '').toLowerCase() as StreamKindIn;
  if (s === 'irl') return 'irl';
  if (s === 'just_chat' || s === 'just_chatting') return 'just_chatting';
  return 'other';
}
function normLang(v: unknown): 'en'|'ru'|'es' {
  const s = String(v || '').toLowerCase();
  if (s === 'ru' || s === 'es') return s;
  return 'en';
}

// анти-дубликатор (очень простой, но эффективный)
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
  // убираем пустые и слишком короткие
  const pool = cands
    .map(s => String(s || '').trim())
    .filter(s => s.length >= 6);

  if (!pool.length) return '';

  // среди кандидатов выберем тот, что минимально похож на недавние
  let best = pool[0];
  let bestScore = 1;
  for (const c of pool) {
    const score = Math.max(...(recent.length ? recent.map(r => jaccard(c, r)) : [0]));
    if (score < bestScore) { bestScore = score; best = c; }
  }
  return best;
}

// хранение последних N строк для анти-повтора
async function getRecent(token: string, limit = 12): Promise<string[]> {
  const raw = await redis.lrange(kRecent(token), 0, limit - 1);
  // Upstash возвращает string[]; ioredis тоже отдаст массив строк
  return (raw as unknown as string[]) ?? [];
}

async function pushRecent(token: string, line: string, keep = 24) {
  const key = kRecent(token);
  await redis.lpush(key, line);
  await redis.ltrim(key, 0, keep - 1);
  await redis.expire(key, 60 * 60 * 12); // 12h
}

// мягкий rate limit (20 req/min на токен)
async function rateLimit(token: string, limitPerMin = 20) {
  const key = kRate(token);
  const n = (await redis.incr(key)) as unknown as number;
  if (n === 1) await redis.expire(key, 60);
  return n <= limitPerMin;
}
// верификация токена (динамически берём verifyToken, если он есть)
async function verifyBearer(bearer: string): Promise<{ ok: boolean; name?: string }> {
  try {
    const mod: any = await import('@/lib/token').catch(() => null);
    if (mod && typeof mod.verifyToken === 'function') {
      const r = mod.verifyToken(bearer);
      return { ok: !!r?.ok, name: r?.name || '' };
    }
  } catch {}
  // fallback — допускаем любой непустой токен (на твой риск)
  return { ok: Boolean(bearer), name: '' };
}

// ---------- OpenAI ----------
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

type PromptArgs = {
  mode: Mode;
  taskType: TaskType;
  streamKind: StreamKind;
  lang: 'en' | 'ru' | 'es';
  recent: string[];
  name?: string;
};

function toneInstruction(mode: Mode, lang: 'en'|'ru'|'es') {
  if (lang === 'ru') {
    const ru: Record<Mode,string> = {
      funny: 'Лёгкий юмор, остроумно, без пошлости.',
      motivator: 'Поддерживай и заряжай энергией.',
      serious: 'Коротко, по делу, уверенно.',
      chill: 'Расслабленно и ненавязчиво.',
      urban: 'Современный уличный сленг и ритм, TOS-safe (без оскорблений).',
      edgy: 'Острее/подначивание, но без травли и оскорблений (TOS-safe).',
    };
    return ru[mode];
  }
  if (lang === 'es') {
    const es: Record<Mode,string> = {
      funny: 'Ligero y con humor, sin vulgaridad.',
      motivator: 'Apoya y da energía.',
      serious: 'Conciso y directo.',
      chill: 'Relajado y sin presión.',
      urban: 'Jerga urbana moderna, TOS-safe (sin insultos).',
      edgy: 'Más agudo/sarcástico, pero sin acoso (TOS-safe).',
    };
    return es[mode];
  }
  const en: Record<Mode,string> = {
    funny: 'Playful, witty, no crudeness.',
    motivator: 'Supportive, energizing.',
    serious: 'Concise and focused.',
    chill: 'Relaxed, low-pressure.',
    urban: 'Modern street/urban slang vibe, TOS-safe (no slurs).',
    edgy: 'Sharper/roast-y but TOS-safe (no harassment).',
  };
  return en[mode];
}

function buildPrompt(args: PromptArgs) {
  const { mode, taskType, streamKind, lang, recent, name } = args;
  const baseGuard =
    'Stay TOS-safe: no slurs, hate, harassment, explicit sexual content, dangerous acts, or glorifying illegal activity.';
  const vibe = toneInstruction(mode, lang);
  const audienceHint =
    taskType === 'banter'
      ? (lang === 'ru'
          ? 'Иногда обращайся к зрителям 1-2 словами (напр. «чат, как думаете?»).'
          : lang === 'es'
          ? 'A veces dirígete a los espectadores en 1-2 palabras (p. ej., “chat, ¿qué opinan?”).'
          : 'Sometimes address the viewers in 1-2 words (e.g., “chat, thoughts?”).')
      : (lang === 'ru'
          ? 'Адресуй задание стримеру.'
          : lang === 'es'
          ? 'Dirige la tarea al streamer.'
          : 'Address the task to the streamer.');

  const style =
    taskType === 'question'
      ? (lang === 'ru'
          ? 'Дай 1 *живой* вопрос с эмоцией, без клише, до 140 символов, без нумерации, БЕЗ кавычек, только строка.'
          : lang === 'es'
          ? 'Da 1 pregunta *viva* con emoción, sin clichés, máx 140 caracteres, sin numeración, SIN comillas, solo una línea.'
          : 'Give 1 *alive* question with emotion, no clichés, ≤140 chars, no numbering, NO quotes, one single line.')
      : taskType === 'banter'
      ? (lang === 'ru'
          ? 'Дай 1 реплику/подкол с юмором, до 140 символов, без нумерации и кавычек.'
          : lang === 'es'
          ? 'Da 1 línea/banter con humor, máx 140 caracteres, sin numeración ni comillas.'
          : 'Give 1 banter line with humor, ≤140 chars, no numbering, no quotes.')
      : (lang === 'ru'
          ? 'Дай 1 конкретное микро-задание для стримера, до 140 символов, без нумерации и кавычек.'
          : lang === 'es'
          ? 'Da 1 micro-tarea concreta para el streamer, máx 140 caracteres, sin numeración ni comillas.'
          : 'Give 1 concrete micro-task for the streamer, ≤140 chars, no numbering, no quotes.');

  const avoid = recent.length
    ? (lang === 'ru'
        ? `Избегай повторов по смыслу с недавними: ${recent.map(r=>`“${r}”`).join('; ')}.`
        : lang === 'es'
        ? `Evita solaparte con recientes: ${recent.map(r=>`“${r}”`).join('; ')}.`
        : `Avoid semantic duplicates of recent ones: ${recent.join(' | ')}`)
    : '';

  const streamHint =
    streamKind === 'irl'
      ? (lang === 'ru' ? 'Контекст: IRL (на ходу/на улице).' : lang === 'es' ? 'Contexto: IRL (en movimiento).' : 'Context: IRL (on the move).')
      : streamKind === 'just_chatting'
      ? (lang === 'ru' ? 'Контекст: Just Chatting (у стола, общение).' : lang === 'es' ? 'Contexto: Just Chatting (a cámara).' : 'Context: Just Chatting (at desk).')
      : (lang === 'ru' ? 'Контекст: разное.' : lang === 'es' ? 'Contexto: variado.' : 'Context: mixed.');

  const who =
    name
      ? (lang === 'ru' ? `Имя стримера: ${name}.` : lang === 'es' ? `Nombre del streamer: ${name}.` : `Streamer name: ${name}.`)
      : '';

  return [
    baseGuard,
    vibe,
    streamHint,
    audienceHint,
    style,
    avoid,
    who,
  ].filter(Boolean).join('\n');
}

async function openaiOneLine(args: PromptArgs): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return '';

  const prompt = buildPrompt(args);

  const res = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'authorization': `Bearer ${key}`,
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
    throw new Error(`openai_error ${res.status}: ${txt.slice(0,200)}`);
  }
  const data = await res.json();
  const text = String(data?.choices?.[0]?.message?.content || '').trim();

  // иногда модель может вернуть с нумерацией или несколькими строками — забираем первую достойную
  const line = text
    .split('\n')
    .map(s => s.replace(/^\s*[\-\d\.\)\]]+\s*/, '').trim())
    .filter(Boolean)[0] || '';

  return line;
}

// запасной набор — когда нет ключа или случился fallback
const FALLBACK: string[] = [
  "Chat, rate the streamer’s fit 1–10 — be honest.",
  "Tell us your most controversial food take in 10s.",
  "Pick one: sleep or grind — and why?",
  "Show your phone lockscreen for 3 seconds 😏",
  "Do a 7-word life advice, no more, no less.",
  "Chat, drop one dare (PG-13) for the next minute.",
  "Tell a tiny L you took this week.",
  "If you vanished for a day — what’s the move?",
  "Name one habit you’re trying to fix.",
  "Give your best two-line roast of yourself."
];

// ---------- обработчик ----------
type Body = {
  kind?: 'ping' | 'next';
  token?: string;
  mode?: Mode | string;
  taskType?: TaskTypeIn | string;
  streamKind?: StreamKindIn | string;
  lang?: 'en'|'ru'|'es' | string;
};

export async function POST(req: NextRequest) {
  try {
    const raw: Body = await req.json().catch(() => ({} as Body));
    const hdr = req.headers.get('authorization') || '';
    const bearer = hdr.startsWith('Bearer ') ? hdr.slice(7) : (raw.token || '');

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
    const lang = normLang(raw.lang);

    if (kind === 'ping') {
      const recent = await getRecent(token, 10);
      return json({ ok: true, name: streamerName, recent, mode, taskType, streamKind, lang });
    }

    // next: получить недавние для анти-повтора
    const recent = await getRecent(token, 12);

    // пробуем OpenAI 3 раза, берём лучший по непохожести
    const candidates: string[] = [];
    let openaiOk = true;
    for (let i = 0; i < 3; i++) {
      try {
        const line = await openaiOneLine({ mode, taskType, streamKind, lang, recent, name: streamerName });
        if (line) candidates.push(line);
      } catch {
        openaiOk = false;
        break;
      }
    }

    let line = pickDissimilar(candidates, recent);

    // fallback если OpenAI не доступен/пусто
    if (!line) {
      const f = [...FALLBACK].sort(() => Math.random() - 0.5);
      line = pickDissimilar(f.slice(0, 5), recent) || f[0];
    }

    // записываем в историю
    await pushRecent(token, line);

    // публикуем событие в очередь оверлея
    const channel = channelNameForToken(token);
    const event: OverlayTaskEvent = {
      type: 'task',
      line,
      mode,
      taskType,
      streamKind,
      name: streamerName || undefined,
      ts: NOW(),
    };
    await enqueue(channel, event);

    return json({
      ok: true,
      task: line,
      mode,
      taskType,
      streamKind,
      lang,
      via: openaiOk ? 'openai' : 'fallback',
    });
  } catch (e: any) {
    return json({ ok: false, error: e?.message || 'server_error' }, 500);
  }
}