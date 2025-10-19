import { OpenAI } from 'openai';

export type TaskGenerationArgs = {
  mode: 'funny' | 'street' | 'serious' | 'chill' | 'hype';
  tone: 'calm' | 'energetic' | 'playful' | 'sarcastic';
  persona: 'streamer' | 'friend' | 'hype-man';
};

// Интернет-сленг и живые выражения для разных режимов
const LIVING_EXPRESSIONS = {
  funny: {
    starters: ['yo chat', 'bruh', 'okay so', 'listen up', 'real talk'],
    reactions: ['no way', 'that\'s wild', 'insane', 'crazy', 'unreal', 'deadass'],
    endings: ['frfr', 'no cap', 'period', 'that\'s it', 'we\'re done'],
    fillers: ['like', 'you know', 'I mean', 'so like', 'basically']
  },
  street: {
    starters: ['yo', 'ay', 'listen', 'check this', 'real talk'],
    reactions: ['that\'s tough', 'that\'s fire', 'that\'s cold', 'that\'s crazy', 'that\'s wild'],
    endings: ['period', 'that\'s it', 'we out', 'done', 'fin'],
    fillers: ['you feel me', 'you know what I\'m saying', 'like', 'fr']
  },
  serious: {
    starters: ['alright', 'so', 'listen', 'here\'s the thing', 'real talk'],
    reactions: ['that\'s important', 'that\'s crucial', 'that\'s serious', 'that\'s real'],
    endings: ['that\'s it', 'period', 'done', 'we\'re good'],
    fillers: ['you know', 'I mean', 'basically', 'essentially']
  },
  chill: {
    starters: ['yo', 'hey', 'so', 'alright', 'check it'],
    reactions: ['that\'s cool', 'that\'s nice', 'that\'s chill', 'that\'s smooth'],
    endings: ['cool', 'nice', 'chill', 'we good'],
    fillers: ['you know', 'like', 'so like', 'basically']
  },
  hype: {
    starters: ['yo chat', 'let\'s go', 'here we go', 'we\'re back', 'this is it'],
    reactions: ['that\'s insane', 'that\'s crazy', 'that\'s wild', 'that\'s unreal', 'that\'s fire'],
    endings: ['let\'s go', 'we\'re back', 'this is it', 'here we go'],
    fillers: ['you know', 'like', 'so like', 'basically']
  }
};

// Генерация живого текста с интернет-сленгом
export async function generateLivingTask(args: TaskGenerationArgs): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set');

  const client = new OpenAI({ apiKey });

  const expressions = LIVING_EXPRESSIONS[args.mode];
  const starter = expressions.starters[Math.floor(Math.random() * expressions.starters.length)];
  const reaction = expressions.reactions[Math.floor(Math.random() * expressions.reactions.length)];
  const ending = expressions.endings[Math.floor(Math.random() * expressions.endings.length)];

  // Создаем промпт для живого языка
  const systemPrompt = `You are a ${args.persona} generating engaging tasks for a live stream overlay. 

PERSONA: ${args.persona}
MODE: ${args.mode}
TONE: ${args.tone}

LIVING LANGUAGE RULES:
- Use internet slang: bro, bruh, frfr, no cap, deadass, period
- Include natural reactions: no way, that's wild, insane, crazy, unreal
- Add streamer language: yo chat, let's go, we're back, this is it
- Use conversational fillers: you know, like, so like, basically
- Keep it under 120 characters
- Make it sound like a real person talking, not a robot
- Include emotional reactions and natural speech patterns

EXAMPLES:
- "yo chat, what's your most controversial food opinion? no cap, I need to know frfr"
- "bruh, tell me something that'll make me laugh, deadass"
- "alright chat, what's the most underrated thing that slaps? period"
- "yo, what's your current mood and why? I mean, we're all here for it"

Generate ONE engaging task that sounds natural and conversational.`;

  const userPrompt = `Generate a ${args.mode} task with ${args.tone} tone for a ${args.persona}. Make it sound like a real person talking to chat.`;

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 60,
      temperature: 1.2, // Высокая температура для креативности
      top_p: 0.9,
      frequency_penalty: 0.3,
      presence_penalty: 0.3
    });

    let task = response.choices[0]?.message?.content?.trim() || '';
    
    // Если задача слишком длинная, обрезаем
    if (task.length > 120) {
      task = task.substring(0, 117) + '...';
    }

    // Добавляем живые элементы если их нет
    if (!task.includes('chat') && !task.includes('yo') && !task.includes('bruh')) {
      task = `${starter}, ${task.toLowerCase()}`;
    }

    // Добавляем эмоциональную реакцию
    if (Math.random() < 0.3) {
      task += ` ${reaction}`;
    }

    // Добавляем окончание
    if (Math.random() < 0.2) {
      task += ` ${ending}`;
    }

    return task;

  } catch (error) {
    console.error('[LivingTask] OpenAI error:', error);
    
    // Fallback задачи с живым языком
    const fallbackTasks = {
      funny: [
        "yo chat, what's your most controversial food opinion? no cap, I need to know frfr",
        "bruh, tell me something that'll make me laugh, deadass",
        "alright chat, what's the weirdest thing you've ever eaten? period",
        "yo, what's your most embarrassing moment? we're all here for it"
      ],
      street: [
        "yo, what's the most underrated thing that slaps? period",
        "ay, tell me something that's straight fire, no cap",
        "check this, what's the coldest thing you've seen today?",
        "real talk, what's the toughest decision you've made? we out"
      ],
      serious: [
        "alright chat, what's something important you learned today?",
        "listen, what's a real problem you're facing right now?",
        "here's the thing, what's something that actually matters to you?",
        "real talk, what's a goal you're working towards? period"
      ],
      chill: [
        "yo, what's your current mood and why? we good",
        "hey chat, what's something that made you smile today?",
        "so, what's your favorite way to relax? chill",
        "alright, what's something you're grateful for? nice"
      ],
      hype: [
        "yo chat, what's got you hyped today? let's go!",
        "here we go! what's the most exciting thing happening?",
        "this is it! what's your biggest win this week? we're back",
        "let's go! what's something that's absolutely fire? here we go"
      ]
    };

    const tasks = fallbackTasks[args.mode] || fallbackTasks.funny;
    return tasks[Math.floor(Math.random() * tasks.length)];
  }
}

// Быстрая генерация для мгновенного отклика - фокус на стримера
export async function generateQuickTask(mode: string): Promise<string> {
  const quickTasks = {
    funny: [
      "yo, what's your most controversial take? let's hear it, frfr",
      "bruh, tell us something embarrassing that'll make us laugh, deadass",
      "alright, what's the weirdest thing you've done this week? period"
    ],
    street: [
      "yo, what's the coldest thing you've said today? no cap",
      "ay, tell us something that's straight fire about you, period",
      "check this, what's your biggest flex right now? deadass"
    ],
    serious: [
      "alright, what's something you're actually struggling with?",
      "listen, what's a real problem you're dealing with right now?",
      "here's the thing, what's something that's actually bothering you?"
    ],
    chill: [
      "yo, what's your current vibe and why? we good",
      "hey, what's something that made you smile today?",
      "so, what's your favorite way to waste time? chill"
    ],
    hype: [
      "yo, what's got you hyped today? let's go!",
      "here we go! what's the most exciting thing about you?",
      "this is it! what's your biggest win this week? we're back"
    ]
  };

  const tasks = quickTasks[mode as keyof typeof quickTasks] || quickTasks.funny;
  return tasks[Math.floor(Math.random() * tasks.length)];
}
