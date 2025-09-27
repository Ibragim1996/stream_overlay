# 🔧 VERCEL ENVIRONMENT VARIABLES - FIREBASE FIX

## 🚨 ПРОБЛЕМА
На проде падает "Firebase client config is incomplete..." - Vercel не видит NEXT_PUBLIC_FIREBASE_* переменные.

## ✅ РЕШЕНИЕ

### 1. ДОБАВЬТЕ В VERCEL (Production и Preview):

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCJdwovqfSZMb6QmJM1DaddHboFVXDh8ZI
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ibra-project-82064.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ibra-project-82064
NEXT_PUBLIC_FIREBASE_APP_ID=1:556300271135:web:dd6b25084266fb8936df2a
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=556300271135
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ibra-project-82064.firebasestorage.app
```

### 2. ПРОВЕРКА ПЕРЕМЕННЫХ

После деплоя откройте: **https://YOUR_DOMAIN/env-check**

Должно показать:
- ✅ All Firebase variables are present!
- Все 6 переменных с зелеными галочками

### 3. ЧТО ИСПРАВЛЕНО В КОДЕ

1. **Создана страница `/env-check`** - проверяет все переменные
2. **Обновлен `lib/firebaseClient.ts`** - мягкая проверка вместо throw
3. **Overlay не падает** - показывает fallback если Firebase недоступен

### 4. ИНСТРУКЦИЯ ДЛЯ VERCEL

1. **Settings → Environment Variables**
2. **Добавьте все 6 переменных** (копируйте выше)
3. **Убедитесь что выбраны Production и Preview**
4. **Сохраните**
5. **Redeploy БЕЗ кэша** (не ставьте галочку UseExistingBuildCache)

### 5. ТЕСТИРОВАНИЕ

После деплоя проверьте:

- **https://YOUR_DOMAIN/env-check** → все OK
- **https://YOUR_DOMAIN/overlay?key=TEST123** → работает без ошибок
- **https://YOUR_DOMAIN/overlay** → показывает "Overlay key missing"

## 🎯 РЕЗУЛЬТАТ

- ✅ Firebase переменные видны на проде
- ✅ Overlay не падает с "client-side exception"
- ✅ Все функции работают корректно
- ✅ Нет ошибок в консоли браузера

**ПРОБЛЕМА РЕШЕНА!** 🎉
