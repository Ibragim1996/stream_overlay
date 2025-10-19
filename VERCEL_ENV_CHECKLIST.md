# ✅ VERCEL ENVIRONMENT VARIABLES CHECKLIST

## 🔴 КРИТИЧЕСКИЕ (обязательные для работы)

### Firebase Client (Public)
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`

### Firebase Server (Secret)
- [ ] `FIREBASE_SERVICE_ACCOUNT_KEY` (одна строка JSON)

### OpenAI (Secret)
- [ ] `OPENAI_API_KEY` (начинается с `sk-`)

### Redis/Upstash (Secret)
- [ ] `UPSTASH_REDIS_REST_URL`
- [ ] `UPSTASH_REDIS_REST_TOKEN`

## 🟡 ВАЖНЫЕ (для полной функциональности)

### Stripe (Secret)
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### Site URL (Public)
- [ ] `NEXT_PUBLIC_SITE_URL` (например: `https://vibekip.com`)

## 🟢 ОПЦИОНАЛЬНЫЕ (с дефолтными значениями)

### TTS Configuration
- [ ] `TTS_PROVIDER` (default: `openai_rest`)
- [ ] `TTS_MODEL` (default: `gpt-4o-mini-tts`)
- [ ] `TTS_VOICE` или `TTS_VOICE_ID` (default: `alloy`)
- [ ] `TTS_FORMAT` (default: `mp3`)
- [ ] `TTS_SAMPLE_RATE` (default: `24000`)

### OpenAI Model
- [ ] `OPENAI_MODEL` (default: `gpt-4o-mini`)

### Stripe Prices
- [ ] `STRIPE_PRICE_PRO_MONTH`
- [ ] `STRIPE_PRICE_PRO_YEAR`

### Overlay Security
- [ ] `OVERLAY_SECRET` или `OVERLAY_SIGN_SECRET`

### WebSocket (для отключения)
- [ ] `NEXT_PUBLIC_USE_WEBSOCKET` (set to `false` for MVP)

### Base URL (для вебхуков)
- [ ] `NEXT_PUBLIC_BASE_URL` (fallback: `https://vibekip.com`)

## 📝 КАК ДОБАВИТЬ В VERCEL

1. Зайти в проект на Vercel
2. Settings → Environment Variables
3. Для каждой переменной:
   - Name: имя переменной
   - Value: значение (без кавычек)
   - Environments: ✅ Production ✅ Preview (Development опционально)
4. Save
5. После добавления всех переменных: Deployments → "..." → Redeploy → ❌ Use existing build cache → Redeploy

## 🔍 ПРОВЕРКА ПОСЛЕ ДЕПЛОЯ

- [ ] `/env-check` — показывает статус Firebase клиентских переменных
- [ ] `/api/debug-env` — показывает статус серверных переменных (без значений)
- [ ] `/overlay?key=TEST123` — открывается без ошибок
- [ ] Console (F12) — нет ошибок про missing credentials

## ⚠️ БЕЗОПАСНОСТЬ

- ❌ Никогда не коммитить `.env` или `.env.local` в Git
- ❌ Не использовать `NEXT_PUBLIC_` для секретов (API ключи, токены)
- ✅ Все секреты только через Vercel Environment Variables
- ✅ После деплоя проверить, что секреты не попали в клиентский бандл (DevTools → Sources)

## 🚀 БЫСТРЫЙ СТАРТ

Минимальный набор для MVP:
```bash
# Firebase Client (6 переменных)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...

# Firebase Server (1 переменная, одна строка JSON)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}

# OpenAI (1 переменная)
OPENAI_API_KEY=sk-...

# Redis (2 переменные)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Site URL (1 переменная)
NEXT_PUBLIC_SITE_URL=https://vibekip.com

# WebSocket (1 переменная, для отключения)
NEXT_PUBLIC_USE_WEBSOCKET=false
```

Всего: **12 обязательных переменных** для MVP.


