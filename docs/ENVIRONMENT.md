# 🔧 ENVIRONMENT VARIABLES

## 📋 ОБЗОР

Этот документ содержит полный список всех переменных окружения, используемых в проекте SECO Overlay.

## 🔥 FIREBASE (КЛИЕНТСКИЕ)

Эти переменные должны быть доступны в браузере (префикс `NEXT_PUBLIC_`).

| Переменная | Описание | Пример значения |
|------------|----------|-----------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | API ключ Firebase для клиента | `AIzaSyCJdwovqfSZMb6QmJM1DaddHboFVXDh8ZI` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Домен аутентификации Firebase | `ibra-project-82064.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ID проекта Firebase | `ibra-project-82064` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | ID приложения Firebase | `1:556300271135:web:dd6b25084266fb8936df2a` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | ID отправителя сообщений | `556300271135` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Бакет хранилища Firebase | `ibra-project-82064.firebasestorage.app` |

## 🔐 FIREBASE (СЕРВЕРНЫЕ)

Эти переменные используются только на сервере.

| Переменная | Описание | Формат |
|------------|----------|--------|
| `FIREBASE_SERVICE_ACCOUNT_KEY` | JSON ключ сервисного аккаунта Firebase | Однострочный JSON без переносов |

## 💳 STRIPE

Переменные для обработки платежей.

| Переменная | Описание | Где используется |
|------------|----------|------------------|
| `STRIPE_SECRET_KEY` | Секретный ключ Stripe | API routes для платежей |
| `STRIPE_WEBHOOK_SECRET` | Секрет для вебхуков Stripe | Webhook обработчики |
| `STRIPE_PUBLISHABLE_KEY` | Публичный ключ Stripe | Клиентская часть |

## 🌐 VERCEL

Автоматически устанавливаются Vercel.

| Переменная | Описание | Пример |
|------------|----------|--------|
| `VERCEL_GIT_COMMIT_SHA` | Хеш коммита Git | `abc123def456` |
| `VERCEL_DEPLOYMENT_ID` | ID деплоя | `dpl_1234567890` |
| `VERCEL_ENV` | Окружение | `production`, `preview`, `development` |

## 🤖 OPENAI

Переменные для работы с OpenAI API.

| Переменная | Описание | Где используется |
|------------|----------|------------------|
| `OPENAI_API_KEY` | API ключ OpenAI | Генерация текста и TTS |
| `OPENAI_MODEL` | Модель для генерации текста | `gpt-4o-mini` (по умолчанию) |

## 🗄️ REDIS/UPSTASH

Переменные для работы с Redis.

| Переменная | Описание | Где используется |
|------------|----------|------------------|
| `UPSTASH_REDIS_REST_URL` | URL Redis REST API | Хранение состояния overlay |
| `UPSTASH_REDIS_REST_TOKEN` | Токен для Redis API | Аутентификация в Redis |

## 📁 STORAGE/CDN

Переменные для хранения файлов.

| Переменная | Описание | Где используется |
|------------|----------|------------------|
| `NEXT_PUBLIC_CDN_URL` | URL CDN для аудио файлов | Клиентская часть для TTS |
| `STORAGE_BUCKET_NAME` | Имя бакета для файлов | Серверная часть (опционально) |
| `STORAGE_ACCESS_KEY` | Ключ доступа к хранилищу | Серверная часть (опционально) |
| `STORAGE_SECRET_KEY` | Секретный ключ хранилища | Серверная часть (опционально) |

## 🔧 РАЗРАБОТКА

Переменные для локальной разработки.

| Переменная | Описание | Значение по умолчанию |
|------------|----------|----------------------|
| `NODE_ENV` | Режим Node.js | `development`, `production` |
| `PORT` | Порт для локального сервера | `3000` |

## 📝 ПРИМЕР .env.local

```bash
# Firebase Client (для браузера)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCJdwovqfSZMb6QmJM1DaddHboFVXDh8ZI
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ibra-project-82064.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ibra-project-82064
NEXT_PUBLIC_FIREBASE_APP_ID=1:556300271135:web:dd6b25084266fb8936df2a
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=556300271135
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ibra-project-82064.firebasestorage.app

# Firebase Server (только для сервера)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"ibra-project-82064",...}

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

# Redis/Upstash
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Storage/CDN
NEXT_PUBLIC_CDN_URL=https://your-cdn.com
```

## 🚨 ВАЖНЫЕ ЗАМЕЧАНИЯ

### 1. БЕЗОПАСНОСТЬ
- **НЕ** коммитьте `.env.local` в Git
- **НЕ** используйте `NEXT_PUBLIC_` для секретных ключей
- **НЕ** показывайте серверные ключи в клиентском коде

### 2. VERCEL
- Все `NEXT_PUBLIC_*` переменные должны быть установлены в Vercel
- `FIREBASE_SERVICE_ACCOUNT_KEY` должен быть в одну строку
- После изменения переменных сделайте redeploy

### 3. ПРОВЕРКА
- Используйте `/env-check` для проверки клиентских переменных
- Используйте `/health` для проверки статуса приложения

## 🔍 ДИАГНОСТИКА

### Проверка переменных в браузере:
```javascript
console.log('Firebase API Key:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
console.log('Firebase Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
```

### Проверка на сервере:
```javascript
console.log('Firebase Service Account:', process.env.FIREBASE_SERVICE_ACCOUNT_KEY ? 'Set' : 'Missing');
console.log('Stripe Secret Key:', process.env.STRIPE_SECRET_KEY ? 'Set' : 'Missing');
```

## 📚 ДОПОЛНИТЕЛЬНЫЕ РЕСУРСЫ

- [Firebase Environment Variables](https://firebase.google.com/docs/web/setup)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Stripe Environment Variables](https://stripe.com/docs/keys)
