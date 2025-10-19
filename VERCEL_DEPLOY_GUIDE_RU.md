# 🚀 ИНСТРУКЦИЯ ПО ДЕПЛОЮ НА VERCEL

## ✅ Статус: Проект готов к деплою

Все проверки пройдены:
- ✅ Build успешно завершается
- ✅ TypeScript ошибки исправлены
- ✅ ESLint проверка пройдена
- ✅ Зависимости установлены
- ✅ OpenAI ключи используются только на сервере

## 📋 ШАГ 1: Добавить переменные в Vercel

### Обязательные переменные (12 штук):

#### Firebase Client (6 переменных) — с префиксом `NEXT_PUBLIC_`
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
```

#### Firebase Server (1 переменная) — БЕЗ префикса
```
FIREBASE_SERVICE_ACCOUNT_KEY
```
⚠️ Значение должно быть **одной строкой JSON** без переносов строк!

#### OpenAI (1 переменная)
```
OPENAI_API_KEY
```
⚠️ Значение начинается с `sk-`

#### Redis/Upstash (2 переменные)
```
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
```

#### Site URL (1 переменная)
```
NEXT_PUBLIC_SITE_URL
```
Пример: `https://your-domain.vercel.app`

#### WebSocket (1 переменная)
```
NEXT_PUBLIC_USE_WEBSOCKET=false
```

### Как добавить в Vercel:

1. Открыть [Vercel Dashboard](https://vercel.com/dashboard)
2. Выбрать ваш проект
3. Settings → Environment Variables
4. Для каждой переменной:
   - Нажать **Add New**
   - **Name:** имя переменной (например, `OPENAI_API_KEY`)
   - **Value:** значение (БЕЗ кавычек, БЕЗ пробелов)
   - **Environments:** ✅ Production ✅ Preview
   - Нажать **Save**
5. Повторить для всех 12 переменных

## 🔄 ШАГ 2: Redeploy без кэша

После добавления всех переменных:

1. Перейти в **Deployments**
2. Найти последний деплой
3. Нажать на **"..."** (три точки справа)
4. Выбрать **Redeploy**
5. ⚠️ **ВАЖНО:** Снять галочку **"Use existing build cache"**
6. Нажать **Redeploy**

Деплой займет ~2-3 минуты.

## ✅ ШАГ 3: Проверка

После успешного деплоя проверить:

### 1. Проверка переменных окружения
Открыть: `https://your-domain.vercel.app/env-check`

Должно показать:
```
✅ NEXT_PUBLIC_FIREBASE_API_KEY: OK
✅ NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: OK
✅ NEXT_PUBLIC_FIREBASE_PROJECT_ID: OK
✅ NEXT_PUBLIC_FIREBASE_APP_ID: OK
✅ NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: OK
✅ NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: OK
```

### 2. Проверка серверных переменных
Открыть: `https://your-domain.vercel.app/api/debug-env`

Должно показать JSON с `true` для всех переменных:
```json
{
  "UPSTASH_REDIS_REST_URL": true,
  "UPSTASH_REDIS_REST_TOKEN": true,
  "OPENAI_API_KEY": true,
  "FIREBASE_SERVICE_ACCOUNT_KEY": true
}
```

### 3. Проверка overlay
Открыть: `https://your-domain.vercel.app/overlay?key=TEST123`

Должно открыться без ошибок. Проверить Console (F12) — не должно быть красных ошибок.

### 4. Проверка панели
1. Открыть: `https://your-domain.vercel.app/panel`
2. Ввести никнейм и нажать "Generate overlay link"
3. Должна появиться ссылка на overlay
4. Нажать "Next" — должно сгенерироваться задание

## 🔧 Решение проблем

### Проблема: "Missing credentials: OPENAI_API_KEY"

**Решение:**
1. Vercel → Settings → Environment Variables
2. Проверить, что `OPENAI_API_KEY` добавлен
3. Проверить, что значение начинается с `sk-`
4. Проверить, что выбраны Production и Preview
5. Redeploy без кэша

### Проблема: Firebase не работает

**Решение:**
1. Открыть `/env-check`
2. Посмотреть, какие переменные MISSING
3. Проверить, что все 6 переменных начинаются с `NEXT_PUBLIC_`
4. Проверить, что нет пробелов или кавычек в значениях
5. Redeploy без кэша

### Проблема: "FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON"

**Решение:**
1. Открыть JSON файл сервисного аккаунта
2. Скопировать весь JSON
3. Удалить все переносы строк (должна быть одна строка)
4. Пример: `{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}`
5. Вставить в Vercel как одну строку
6. Redeploy без кэша

### Проблема: TTS не работает

**Решение:**
1. Проверить, что `OPENAI_API_KEY` добавлен и корректный
2. Проверить, что `FIREBASE_SERVICE_ACCOUNT_KEY` корректный
3. Открыть Vercel → Deployments → Functions → Logs
4. Найти ошибки в логах
5. Если ошибка "quota exceeded" — проверить лимиты OpenAI

## 📚 Дополнительные ресурсы

- `VERCEL_ENV_CHECKLIST.md` — полный чеклист всех переменных
- `DEPLOYMENT_READY.md` — детальный отчет о готовности к деплою
- `docs/ENVIRONMENT.md` — документация по всем переменным окружения

## 🎯 Итог

После выполнения всех шагов:
- ✅ Проект задеплоен на Vercel
- ✅ Все переменные окружения настроены
- ✅ Overlay работает корректно
- ✅ TTS генерирует аудио
- ✅ Firebase подключен
- ✅ Нет ошибок в консоли

**Проект готов к использованию! 🎉**







