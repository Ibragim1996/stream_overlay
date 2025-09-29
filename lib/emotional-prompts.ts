// lib/emotional-prompts.ts
// Система для генерации сотен разнообразных эмоциональных уведомлений

export interface EmotionalPrompt {
  text: string;
  emotion: string;
  style: string;
  voice: string;
  speed: number;
}

export class EmotionalPromptGenerator {
  private static instance: EmotionalPromptGenerator;
  
  static getInstance(): EmotionalPromptGenerator {
    if (!EmotionalPromptGenerator.instance) {
      EmotionalPromptGenerator.instance = new EmotionalPromptGenerator();
    }
    return EmotionalPromptGenerator.instance;
  }

  // Базовые шаблоны для разных режимов
  private getModeTemplates(mode: string): string[] {
    const templates = {
      funny: [
        "Слушай, {name}! {action} прямо сейчас! Это будет {adjective}!",
        "Ого, {name}! {action} и покажи всем, как это делается!",
        "Хей, {name}! Время для {action}! Давай, не стесняйся!",
        "Эй, {name}! {action} и пусть все увидят твою крутость!",
        "Слушай сюда, {name}! {action} и удиви всех!",
        "Окей, {name}! {action} и покажи свой характер!",
        "Привет, {name}! {action} и развлекай зрителей!",
        "Эй, {name}! {action} и пусть все засмеются!",
        "Слушай, {name}! {action} и будь звездой!",
        "Хей, {name}! {action} и покажи свою индивидуальность!"
      ],
      serious: [
        "Внимание, {name}. {action} немедленно.",
        "{name}, требуется выполнить {action}.",
        "Слушай, {name}. {action} - это важно.",
        "{name}, {action} прямо сейчас.",
        "Внимание, {name}. {action} без промедления.",
        "{name}, {action} - это критично.",
        "Слушай, {name}. {action} немедленно.",
        "{name}, {action} - это необходимо.",
        "Внимание, {name}. {action} сейчас же.",
        "{name}, {action} - это приоритет."
      ],
      chill: [
        "Эй, {name}... {action} когда будешь готов.",
        "Привет, {name}. {action} в своем темпе.",
        "Хей, {name}... {action} когда захочешь.",
        "Слушай, {name}. {action} расслабленно.",
        "Привет, {name}... {action} спокойно.",
        "Хей, {name}. {action} без спешки.",
        "Эй, {name}... {action} когда настроение будет.",
        "Привет, {name}. {action} в свое время.",
        "Хей, {name}... {action} когда захочешь.",
        "Слушай, {name}. {action} легко."
      ],
      street: [
        "Йо, {name}! {action} и покажи всем, кто тут главный!",
        "Эй, {name}! {action} и докажи свою крутость!",
        "Слушай, {name}! {action} и пусть все знают!",
        "Йо, {name}! {action} и покажи свой стиль!",
        "Эй, {name}! {action} и докажи, что ты лучший!",
        "Слушай, {name}! {action} и пусть все видят!",
        "Йо, {name}! {action} и покажи свою мощь!",
        "Эй, {name}! {action} и докажи свою силу!",
        "Слушай, {name}! {action} и пусть все знают!",
        "Йо, {name}! {action} и покажи свой характер!"
      ]
    };
    return templates[mode as keyof typeof templates] || templates.funny;
  }

  // Действия для разных режимов
  private getActions(mode: string): string[] {
    const actions = {
      funny: [
        "расскажи анекдот", "спой песню", "покажи фокус", "расскажи историю",
        "покажи танец", "расскажи шутку", "покажи трюк", "расскажи байку",
        "покажи пантомиму", "расскажи анекдот", "покажи фокус", "расскажи историю",
        "покажи танец", "расскажи шутку", "покажи трюк", "расскажи байку"
      ],
      serious: [
        "объясни тему", "расскажи факт", "поделись опытом", "объясни концепцию",
        "расскажи историю", "объясни процесс", "поделись знаниями", "расскажи о событии",
        "объясни принцип", "расскажи о явлении", "поделись информацией", "объясни суть"
      ],
      chill: [
        "поделись мыслями", "расскажи о дне", "поделись настроением", "расскажи о планах",
        "поделись впечатлениями", "расскажи о мечтах", "поделись опытом", "расскажи о целях",
        "поделись идеями", "расскажи о вдохновении", "поделись чувствами", "расскажи о надеждах"
      ],
      street: [
        "покажи свой стиль", "расскажи о жизни", "покажи свою крутость", "расскажи о планах",
        "покажи свой характер", "расскажи о целях", "покажи свою мощь", "расскажи о мечтах",
        "покажи свой дух", "расскажи о стремлениях", "покажи свою силу", "расскажи о амбициях"
      ]
    };
    return actions[mode as keyof typeof actions] || actions.funny;
  }

  // Прилагательные для разнообразия
  private getAdjectives(): string[] {
    return [
      "невероятно", "потрясающе", "фантастически", "удивительно", "потрясающе",
      "невероятно", "фантастически", "удивительно", "потрясающе", "невероятно",
      "круто", "классно", "здорово", "отлично", "прекрасно", "великолепно",
      "супер", "топ", "огонь", "бомба", "вау", "ух ты", "ничего себе"
    ];
  }

  // Имена для персонализации
  private getNames(): string[] {
    return [
      "друг", "приятель", "товарищ", "братан", "чувак", "чел", "человек",
      "зритель", "смотрящий", "слушатель", "участник", "гость", "посетитель"
    ];
  }

  // Генерируем эмоциональный промпт
  generateEmotionalPrompt(mode: string, tone: string): EmotionalPrompt {
    const templates = this.getModeTemplates(mode);
    const actions = this.getActions(mode);
    const adjectives = this.getAdjectives();
    const names = this.getNames();

    // Случайно выбираем элементы
    const template = templates[Math.floor(Math.random() * templates.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const name = names[Math.floor(Math.random() * names.length)];

    // Заменяем плейсхолдеры
    let text = template
      .replace(/{name}/g, name)
      .replace(/{action}/g, action)
      .replace(/{adjective}/g, adjective);

    // Добавляем эмоциональные маркеры
    text = this.addEmotionalMarkers(text, mode, tone);

    // Генерируем конфигурацию голоса
    const voiceConfig = this.generateVoiceConfig(mode, tone);

    return {
      text,
      emotion: voiceConfig.emotion,
      style: voiceConfig.style,
      voice: voiceConfig.voice,
      speed: voiceConfig.speed
    };
  }

  // Добавляем эмоциональные маркеры в текст
  private addEmotionalMarkers(text: string, mode: string, tone: string): string {
    let enhancedText = text;

    // Добавляем эмоциональные знаки препинания
    if (mode === 'funny') {
      enhancedText = enhancedText
        .replace(/!/g, '! 😄')
        .replace(/\./g, '. 😊')
        .replace(/\?/g, '? 🤔');
    } else if (mode === 'serious') {
      enhancedText = enhancedText
        .replace(/!/g, '! 😐')
        .replace(/\./g, '. 😐')
        .replace(/\?/g, '? 🤔');
    } else if (mode === 'chill') {
      enhancedText = enhancedText
        .replace(/!/g, '! 😌')
        .replace(/\./g, '. 😌')
        .replace(/\?/g, '? 🤔');
    } else if (mode === 'street') {
      enhancedText = enhancedText
        .replace(/!/g, '! 😎')
        .replace(/\./g, '. 😎')
        .replace(/\?/g, '? 🤔');
    }

    // Добавляем паузы для естественности
    enhancedText = enhancedText
      .replace(/,/g, ', *pause*')
      .replace(/;/g, '; *pause*')
      .replace(/:/g, ': *pause*');

    return enhancedText;
  }

  // Генерируем конфигурацию голоса
  private generateVoiceConfig(mode: string, tone: string): { voice: string; emotion: string; style: string; speed: number } {
    const voices = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"];
    const voice = voices[Math.floor(Math.random() * voices.length)];

    let emotion = 'natural';
    let style = 'natural';
    let speed = 1.0;

    // Адаптируем под режим
    if (mode === 'funny') {
      emotion = Math.random() > 0.5 ? 'cheerful' : 'excited';
      style = Math.random() > 0.3 ? 'dramatic' : 'conversational';
      speed = Math.random() * 0.3 + 0.9; // 0.9-1.2
    } else if (mode === 'serious') {
      emotion = Math.random() > 0.5 ? 'calm' : 'dramatic';
      style = 'natural';
      speed = Math.random() * 0.2 + 0.8; // 0.8-1.0
    } else if (mode === 'chill') {
      emotion = 'calm';
      style = 'conversational';
      speed = Math.random() * 0.2 + 0.7; // 0.7-0.9
    } else if (mode === 'street') {
      emotion = Math.random() > 0.5 ? 'excited' : 'surprised';
      style = 'dramatic';
      speed = Math.random() * 0.3 + 1.0; // 1.0-1.3
    }

    return { voice, emotion, style, speed };
  }

  // Генерируем несколько вариантов для разнообразия
  generateMultiplePrompts(mode: string, tone: string, count: number = 5): EmotionalPrompt[] {
    const prompts: EmotionalPrompt[] = [];
    for (let i = 0; i < count; i++) {
      prompts.push(this.generateEmotionalPrompt(mode, tone));
    }
    return prompts;
  }
}

export const emotionalPromptGenerator = EmotionalPromptGenerator.getInstance();
