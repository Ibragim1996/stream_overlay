# ✅ FIREBASE НАСТРОЙКА - ЧЕКЛИСТ

## 🔥 ПРОЕКТ: `ibra-project-82064`

### 📋 ЧТО НУЖНО НАСТРОИТЬ

- [ ] **Authentication** (Email/Password + Google)
- [ ] **Firestore Database** (база данных)
- [ ] **Storage** (для аудио файлов)
- [ ] **Service Account** (серверный ключ)

---

## 🚀 ПОШАГОВЫЙ ЧЕКЛИСТ

### 1. Authentication
- [ ] Открыть https://console.firebase.google.com/
- [ ] Выбрать проект `ibra-project-82064`
- [ ] Build → Authentication → Get started
- [ ] Sign-in method → Email/Password → Enable
- [ ] Sign-in method → Google → Enable → Save
- [ ] ✅ **Результат**: Пользователи могут регистрироваться

### 2. Firestore Database
- [ ] Build → Firestore Database → Create database
- [ ] Start in production mode → Next
- [ ] us-central1 → Done
- [ ] Rules → заменить на правила из `FIREBASE_SETUP_GUIDE.md`
- [ ] Publish
- [ ] ✅ **Результат**: База данных готова для users/ и overlays/

### 3. Storage
- [ ] Build → Storage → Get started
- [ ] Start in production mode → Next
- [ ] us-central1 → Done
- [ ] Rules → заменить на правила из `FIREBASE_SETUP_GUIDE.md`
- [ ] Publish
- [ ] ✅ **Результат**: Storage готов для /tts/ аудио файлов

### 4. Service Account Key
- [ ] ⚙️ → Project settings → Service accounts
- [ ] Generate new private key → Generate key
- [ ] Скачать JSON файл
- [ ] Запустить: `node convert-firebase-key.js путь/к/файлу.json`
- [ ] Скопировать полученную строку
- [ ] ✅ **Результат**: Ключ готов для Vercel

### 5. Добавить в Vercel
- [ ] Зайти в проект на Vercel
- [ ] Settings → Environment Variables
- [ ] Добавить: `FIREBASE_SERVICE_ACCOUNT_KEY` = скопированная строка
- [ ] Save
- [ ] Deployments → "..." → Redeploy → ❌ Use existing build cache → Redeploy
- [ ] ✅ **Результат**: Переменная добавлена в Vercel

---

## 🔍 ПРОВЕРКА ГОТОВНОСТИ

### Локальная проверка
```bash
npm run check-firebase
```

Должно показать:
```
✅ ВСЕ ПЕРЕМЕННЫЕ НАСТРОЕНЫ
🚀 Firebase готов к работе!
```

### Проверка в браузере
- [ ] `/env-check` — все Firebase переменные ✅
- [ ] `/api/debug-env` — FIREBASE_SERVICE_ACCOUNT_KEY ✅
- [ ] `/sign-in` — можно зарегистрироваться через Email/Password
- [ ] `/sign-in` — можно войти через Google
- [ ] После регистрации — документ создается в Firestore

### Проверка функций
- [ ] Генерация задания работает (кнопка "Next" в панели)
- [ ] TTS генерирует аудио и сохраняет в Storage
- [ ] Overlay обновляется в реальном времени
- [ ] `/overlay?key=TEST123` открывается без ошибок

---

## 📊 СТРУКТУРА ДАННЫХ

### Firestore Collections
```
users/{uid}
  - overlayKey: string
  - plan: "free" | "pro"
  - premium: boolean
  - createdAt: timestamp

overlays/{overlayKey}
  └── state/current
      - text: string
      - voiceUrl: string
      - mode: string
      - tone: string
      - updatedAt: timestamp
```

### Storage Structure
```
/tts/
  - 1703123456789-abc123.mp3
  - 1703123456790-def456.mp3
  - ...
```

---

## 🚨 ВОЗМОЖНЫЕ ПРОБЛЕМЫ

### "Firebase not initialized"
- ❌ Проблема: Отсутствуют NEXT_PUBLIC_FIREBASE_* переменные
- ✅ Решение: Проверить Vercel Environment Variables

### "Missing credentials: FIREBASE_SERVICE_ACCOUNT_KEY"
- ❌ Проблема: Service Account Key не добавлен в Vercel
- ✅ Решение: Добавить FIREBASE_SERVICE_ACCOUNT_KEY в Vercel

### "Permission denied" в Firestore
- ❌ Проблема: Неправильные Rules
- ✅ Решение: Проверить Rules в Firestore Database

### "Permission denied" в Storage
- ❌ Проблема: Неправильные Rules
- ✅ Решение: Проверить Rules в Storage

### Google Sign-In не работает
- ❌ Проблема: Google провайдер не настроен
- ✅ Решение: Включить Google в Authentication → Sign-in method

---

## 🎯 ГОТОВО!

После выполнения всех пунктов чеклиста:

✅ **Authentication** — пользователи могут регистрироваться  
✅ **Firestore** — данные сохраняются и читаются  
✅ **Storage** — аудио файлы сохраняются  
✅ **Service Account** — сервер работает с Firebase  
✅ **Vercel** — все переменные настроены  

**Firebase полностью готов к работе! 🚀**

**Следующий шаг:** Настройка OpenAI API Key





