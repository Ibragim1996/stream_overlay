// lib/modes.ts

/** Локаль для подсказок */
export type Lang = 'en' | 'ru' | 'es';

/** Тон/режим поведения ассистента */
export type Mode =
  | 'funny'
  | 'motivator'
  | 'serious'
  | 'chill'
  | 'urban'   // уличный/сленговый, но TOS-safe
  | 'edgy';   // поострее/подколы, но без травли/оскорблений

/** Тип выдачи */
export type TaskType = 'task' | 'question' | 'banter';

/** Тип трансляции */
export type StreamKind = 'just_chatting' | 'irl' | 'other';

/** Значения по умолчанию */
export const DEFAULT_MODE: Mode = 'motivator';
export const DEFAULT_TASK_TYPE: TaskType = 'task';
export const DEFAULT_STREAM_KIND: StreamKind = 'just_chatting';

/** Универсальная опция для UI */
export type Option<T extends string> = Readonly<{ key: T; label: string; hint: string }>;

/** Опции тонов */
export const MODE_OPTIONS: ReadonlyArray<Option<Mode>> = [
  { key: 'funny',     label: 'Funny',     hint: 'Playful, light jokes' },
  { key: 'motivator', label: 'Motivator', hint: 'Supportive, energetic push' },
  { key: 'serious',   label: 'Serious',   hint: 'Focused, no frills' },
  { key: 'chill',     label: 'Chill',     hint: 'Low-pressure, calm vibe' },
  { key: 'urban',     label: 'Street',    hint: 'Modern slang, TOS-safe' },
  { key: 'edgy',      label: 'Edgy',      hint: 'Sharper/roast, TOS-safe' },
] as const;

/** Опции типов выдачи */
export const TASK_TYPE_OPTIONS: ReadonlyArray<Option<TaskType>> = [
  { key: 'task',     label: 'Task',     hint: 'Action/challenge for the streamer' },
  { key: 'question', label: 'Question', hint: 'A question to streamer/viewers' },
  { key: 'banter',   label: 'Banter',   hint: 'Short witty comment/reaction' },
] as const;

/** Опции типов стрима */
export const STREAM_KIND_OPTIONS: ReadonlyArray<Option<StreamKind>> = [
  { key: 'just_chatting', label: 'Just chatting', hint: 'At desk, talking to chat' },
  { key: 'irl',           label: 'IRL',           hint: 'Outdoor / on the move' },
  { key: 'other',         label: 'Other',         hint: 'Anything else' },
] as const;

/** Подсказка под тон (локализуемая) */
export function modeToHint(mode: Mode, lang: Lang = 'en'): string {
  const en: Record<Mode, string> = {
    urban:
      'Use modern urban slang and rhythm; keep it TOS-safe (no slurs/harassment).',
    edgy:
      'Sharper/roasty but TOS-safe: teasing without insults or harassment.',
    motivator:
      'Be supportive, high-energy, short bursts.',
    serious:
      'Be concise, focused, and clear.',
    chill:
      'Keep it relaxed and low pressure.',
    funny:
      'Playful, witty, light humor.',
  };

  const ru: Record<Mode, string> = {
    urban:
      'Современный уличный сленг и ритм; строго в рамках правил (без оскорблений).',
    edgy:
      'Острее/подколы, но TOS-safe: без травли и оскорблений.',
    motivator:
      'Поддерживай и заряжай энергией, коротко и по делу.',
    serious:
      'Кратко, строго и понятно.',
    chill:
      'Спокойный тон без давления.',
    funny:
      'Лёгкий остроумный юмор.',
  };

  const es: Record<Mode, string> = {
    urban:
      'Jerga urbana moderna; siempre dentro de las normas (sin insultos/acosos).',
    edgy:
      'Más directo/sarcástico pero TOS-safe: sin acoso ni insultos.',
    motivator:
      'Apoya y da energía, frases cortas.',
    serious:
      'Conciso, enfocado y claro.',
    chill:
      'Relajado, sin presión.',
    funny:
      'Ligero y con humor ingenioso.',
  };

  const dict = lang === 'ru' ? ru : lang === 'es' ? es : en;
  return dict[mode];
}

/** Узкие type-guard’ы — удобно при валидации входных параметров */
export function isMode(x: unknown): x is Mode {
  return MODE_OPTIONS.some(o => o.key === x);
}
export function isTaskType(x: unknown): x is TaskType {
  return TASK_TYPE_OPTIONS.some(o => o.key === x);
}
export function isStreamKind(x: unknown): x is StreamKind {
  return STREAM_KIND_OPTIONS.some(o => o.key === x);
}

/** Нормализация входа с дефолтом — чтобы сервер не падал от мусора */
export function normalizeMode(x: unknown, fallback: Mode = DEFAULT_MODE): Mode {
  return isMode(x) ? x : fallback;
}
export function normalizeTaskType(x: unknown, fallback: TaskType = DEFAULT_TASK_TYPE): TaskType {
  return isTaskType(x) ? x : fallback;
}
export function normalizeStreamKind(x: unknown, fallback: StreamKind = DEFAULT_STREAM_KIND): StreamKind {
  return isStreamKind(x) ? x : fallback;
}