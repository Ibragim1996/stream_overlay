# 🎤 AI Reactions System - User Guide

## Что это такое?

AI Reactions - это система, которая позволяет зрителям покупать персонализированные AI реакции, которые появляются в overlay стримера с голосовым озвучиванием.

## Как использовать (для стримеров):

### 1. Генерация ключей
1. Перейди на: `http://localhost:3000/ai-reactions/generate`
2. Введи свое имя стримера
3. Нажми "Generate AI Reaction Keys"
4. Скопируй:
   - **Store URL** - ссылку для зрителей
   - **Overlay Key** - ключ для OBS

### 2. Настройка OBS
1. Добавь Browser Source в OBS
2. URL: `http://localhost:3000/ai-reactions-overlay.html?key=ТВОЙ_КЛЮЧ`
3. Размер: 1920x1080 (или размер твоего canvas)
4. Включи "Shutdown source when not visible"

### 3. Поделись с зрителями
- Скопируй Store URL и поделись в чате, био, или где угодно
- Зрители смогут покупать реакции по этой ссылке

## Как использовать (для зрителей):

### 1. Покупка реакции
1. Перейди по ссылке от стримера
2. Выбери стиль реакции:
   - **Supportive** 😊 - поддерживающие и позитивные
   - **Light Troll** 😏 - игривые подколы и шутки  
   - **Hard Troll** 😈 - резкая критика и жесткая любовь
3. Нажми "Buy AI Reaction - $2.99"
4. Оплати через Stripe

### 2. Что происходит дальше
- AI генерирует персонализированную реакцию
- Реакция появляется в overlay стримера
- Озвучивается эмоциональным голосом
- Длительность: 5-10 секунд

## Стили реакций:

### Supportive (Поддерживающие) 😊
- "Hey, you're doing great! Keep it up!"
- "Don't give up, you've got this!"
- "That was amazing, well done!"

### Light Troll (Легкие подколы) 😏  
- "Oh come on, that was too easy!"
- "Really? That's the best you can do?"
- "Haha, nice try but not quite there yet!"

### Hard Troll (Жесткие подколы) 😈
- "Dude, what are you even doing? That was terrible!"
- "Come on man, you're embarrassing yourself!"
- "The viewers are laughing at you, get it together!"

## Технические детали:

- **Цена**: $2.99 за реакцию (BASIC tier)
- **Длительность**: 5-10 секунд
- **Голос**: OpenAI TTS с эмоциональными нюансами
- **Стили**: 3 варианта (Support, Light Troll, Hard Troll)
- **Платежи**: Stripe Checkout
- **Overlay**: WebSocket для real-time обновлений

## Файлы системы:

- `/ai-reactions/generate` - генератор ключей для стримеров
- `/ai-reactions-store.html` - магазин для зрителей  
- `/ai-reactions-overlay.html` - overlay для OBS
- `/api/ai-reactions/checkout` - API для покупок
- `/api/ai-reactions/webhook` - Stripe webhook

## Примеры ссылок:

- **Генератор**: `http://localhost:3000/ai-reactions/generate`
- **Магазин**: `http://localhost:3000/ai-reactions-store.html?streamer=teststreamer`
- **Overlay**: `http://localhost:3000/ai-reactions-overlay.html?key=abc123def456`

## Готово! 🎉

Теперь у тебя есть полная система AI Reactions, которая работает независимо от основного проекта. Стримеры могут генерировать ключи, а зрители - покупать реакции, которые появляются в overlay с голосом!
