# Быстрый деплой на Vercel 🚀

## Шаг 1: Подготовка
Проект уже готов! Все localhost URLs заменены на production URLs.

## Шаг 2: Деплой на Vercel
1. Идите на [vercel.com](https://vercel.com)
2. Нажмите "New Project"
3. Подключите репозиторий `Ibragim1996/AI-Stream-View`
4. Нажмите "Deploy"

## Шаг 3: Настройка переменных окружения
В настройках проекта добавьте:

### Обязательные:
```
OPENAI_API_KEY=your_key_here
OVERLAY_SECRET=your_secret_here
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

### Для Stripe (опционально):
```
STRIPE_SECRET_KEY=your_stripe_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### Для Firebase (опционально):
```
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
```

## Шаг 4: Тестирование
После деплоя откройте:
- Главная: `https://your-app.vercel.app`
- Оверлей: `https://your-app.vercel.app/overlay`
- AI реакции: `https://your-app.vercel.app/ai-reactions/generate`

## Готово! 🎉
Проект полностью функционален и готов к использованию.
