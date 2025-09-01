// lib/openai.ts
import OpenAI from 'openai';

/** Общие типы (совпадают с фронтом) */
export type Mode = 'funny' | 'motivator' | 'serious' | 'chill';
export type TaskType = 'question' | 'challenge' | 'just_talk' | 'joke';
export type StreamKind = 'just_chat' | 'irl' | 'gaming' | 'music' | 'cooking';
export type Lang = 'en' | 'ru' | 'es';

export const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

/** Мягкий helper: 1 строка, без кавычек/переводов строк/лишних пробелов */
function sanitizeOneLine(s: string): string {
  let out = s.replace(/\r?\n+/g, ' ').trim();
  out = out.replace(/^["'`]+|["'`]+$/g, '').trim();
  return out.replace(/\s{2,}/g, ' ');
}

/** Чуть разные температуры по тону */
function temperatureFor(mode: Mode): number {
  if (mode === 'serious') return 0.45;
  if (mode === 'chill') return 0.6;
  if (mode === 'motivator') return 0.7;
  return 0.8; // funny
}

/** Мэппинг коротких подсказок под тон */
function toneHint(mode: Mode, lang: Lang): string {
  const byLang: Record<Lang, Record<Mode, string>> = {
    en: {
      funny: 'light, witty, a bit cheeky but kind',
      motivator: 'supportive, high-energy, hype but respectful',
      serious: 'calm, focused, concise',
      chill: 'relaxed, low-effort, cozy vibe',
    },
    ru: {
      funny: 'смешно, остроумно, слегка дерзко, но доброжелательно',
      motivator: 'поддерживающе, энергично, уважительно',
      serious: 'спокойно, по делу, кратко',
      chill: 'расслабленно, по-домашнему, без напряга',
    },
    es: {
      funny: 'ligero, ingenioso, un poco pícaro pero amable',
      motivator: 'apoyo, energía alta, respetuoso',
      serious: 'calmado, enfocado, conciso',
      chill: 'relajado, cómodo, sin esfuerzo',
    },
  };
  return byLang[lang][mode];
}

/** Короткие примеры/правила для разных типов заданий */
function rulesFor(taskType: TaskType, lang: Lang): string {
  const t = {
    en: {
      question:
        'Ask 1 short, engaging question. Address the streamer **and optionally** the chat. No tasks inside, only a question.',
      challenge:
        'Give 1 fun, doable challenge for the streamer only. It should be camera-visible or audible.',
      just_talk:
        'Suggest 1 small talk topic or icebreaker to keep the flow going. It should feel natural.',
      joke:
        'Make 1 quick, clean joke or playful roast (kind, not offensive).',
    },
    ru: {
      question:
        'Задай 1 короткий, вовлекающий вопрос. Обратись к стримеру **и, при желании,** к чату. Без заданий — только вопрос.',
      challenge:
        'Дай 1 весёлый и выполнимый челендж **только стримеру**. Он должен быть заметен в кадре или по звуку.',
      just_talk:
        'Предложи 1 тему для лёгкого разговора или айсбрейкер. Должно звучать естественно.',
      joke:
        'Сделай 1 короткую, чистую шутку или добрый лёгкий «роаст» (без оскорблений).',
    },
    es: {
      question:
        'Haz 1 pregunta corta y atractiva. Dirígete al streamer **y si quieres** al chat. Sin tareas dentro, solo pregunta.',
      challenge:
        'Propón 1 reto divertido y realizable **solo para el streamer**. Debe verse u oírse en cámara.',
      just_talk:
        'Sugiere 1 tema breve para conversar, natural y fluido.',
      joke:
        'Cuenta 1 chiste corto y limpio o un roast suave (amable).',
    },
  };
  return t[lang][taskType];
}

/** Краткое описание контекста стрима */
function streamHint(kind: StreamKind, lang: Lang): string {
  const text: Record<Lang, Record<StreamKind, string>> = {
    en: {
      just_chat: 'desk / just chatting stream',
      irl: 'IRL / on the move',
      gaming: 'live gameplay going on',
      music: 'music stream',
      cooking: 'cooking on camera',
    },
    ru: {
      just_chat: 'стрим «просто общаемся»',
      irl: 'IRL / в движении',
      gaming: 'идёт игровой процесс',
      music: 'музыкальный стрим',
      cooking: 'готовка в кадре',
    },
    es: {
      just_chat: 'charlando en el escritorio',
      irl: 'IRL / en movimiento',
      gaming: 'jugando en vivo',
      music: 'stream de música',
      cooking: 'cocinando en cámara',
    },
  };
  return text[lang][kind];
}

export async function getTaskFromOpenAI(opts: {
  mode: Mode;
  taskType: TaskType;
  streamKind: StreamKind;
  lang: Lang;
  recent?: string[];
  streamer?: string;
  audience?: string; // twitch/youtube/etc — опционально
}): Promise<string> {
  const { mode, taskType, streamKind, lang, recent = [], streamer } = opts;

  const t = temperatureFor(mode);

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content:
        'You generate a SINGLE, short line for a live-stream overlay. It must be emotionally engaging and natural.',
    },
    {
      role: 'system',
      content:
        'Hard rules: output ONE line only; <= 120 chars; no quotes; no hashtags; no emojis spam (0–1 emoji max); safe/TOS-friendly.',
    },
    {
      role: 'system',
      content:
        'Address BOTH streamer and chat ONLY for questions; all challenges are for the streamer only.',
    },
    {
      role: 'system',
      content:
        'Avoid repeating recent lines if possible; keep variety; no numbered lists; no leading labels.',
    },
    {
      role: 'system',
      content:
        `Language: ${lang}. Tone: ${toneHint(mode, lang)}. Stream context: ${streamHint(streamKind, lang)}.`,
    },
    {
      role: 'system',
      content: `Streamer name (optional): ${streamer || '—'}.`,
    },
    {
      role: 'user',
      content: `Task type is "${taskType}". ${rulesFor(taskType, lang)}`,
    },
  ];

  if (recent.length) {
    messages.push({
      role: 'system',
      content: `Recent lines to avoid repeating: ${recent.slice(0, 8).map((s) => `"${s}"`).join(', ')}`,
    });
  }

  messages.push({
    role: 'user',
    content:
      'Generate a NEW, distinct line that fits ALL rules above. Output only the line.',
  });

  const common = {
    temperature: t,
    max_tokens: 64,
    presence_penalty: 0.6,
    frequency_penalty: 0.65,
    messages,
  } as const;

  // основной вызов
  try {
    const resp = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      ...common,
    });
    const raw = resp.choices[0]?.message?.content ?? '';
    const clean = sanitizeOneLine(raw);
    if (clean) return clean;
  } catch {
    // ignore and try fallback
  }

  // запасная модель (если вдруг)
  try {
    const resp = await client.chat.completions.create({
      model: 'o4-mini',
      ...common,
    });
    const raw = resp.choices[0]?.message?.content ?? '';
    const clean = sanitizeOneLine(raw);
    if (clean) return clean;
  } catch {
    // ignore
  }

  // крайней случай — безопасный дефолт
  if (lang === 'ru') return 'Улыбнись в камеру и спроси чат: как у них настроение? 🙂';
  if (lang === 'es') return 'Sonríe a la cámara y pregunta al chat cómo va el ánimo 🙂';
  return 'Give the camera a quick smile and ask chat how they feel today 🙂';
}