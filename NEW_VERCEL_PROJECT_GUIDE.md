# 🚀 СОЗДАНИЕ НОВОГО ПРОЕКТА В VERCEL

## ✅ ПРЕИМУЩЕСТВА НОВОГО ПРОЕКТА

- **Нет проблем с кэшем** - чистый старт
- **Все настройки свежие** - никаких старых конфигураций
- **Гарантированно работает** - overlay уже исправлен

## 📋 ПОШАГОВАЯ ИНСТРУКЦИЯ

### 1. УДАЛЕНИЕ СТАРОГО ПРОЕКТА

1. Откройте [Vercel Dashboard](https://vercel.com/dashboard)
2. Найдите ваш текущий проект
3. Нажмите на него
4. Перейдите в **Settings**
5. Прокрутите вниз до **General**
6. Нажмите **Delete Project**
7. Введите название проекта для подтверждения
8. Нажмите **Delete**

### 2. СОЗДАНИЕ НОВОГО ПРОЕКТА

1. В Vercel Dashboard нажмите **New Project**
2. Выберите **Import from GitHub**
3. Найдите репозиторий **stream_overlay**
4. Нажмите **Import**
5. **НЕ МЕНЯЙТЕ** настройки сборки (оставьте по умолчанию)
6. Нажмите **Deploy**

### 3. НАСТРОЙКА ПЕРЕМЕННЫХ ОКРУЖЕНИЯ

После деплоя перейдите в **Settings → Environment Variables** и добавьте:

#### Firebase Client Variables (NEXT_PUBLIC_*)
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCJdwovqfSZMb6QmJM1DaddHboFVXDh8ZI
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ibra-project-82064.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ibra-project-82064
NEXT_PUBLIC_FIREBASE_APP_ID=1:556300271135:web:dd6b25084266fb8936df2a
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=556300271135
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ibra-project-82064.firebasestorage.app
```

#### Firebase Service Account (Server-side)
```
FIREBASE_SERVICE_ACCOUNT_KEY=ваш_однострочный_json_ключ
```

#### Другие переменные (если нужны)
```
STRIPE_SECRET_KEY=ваш_stripe_ключ
STRIPE_WEBHOOK_SECRET=ваш_webhook_секрет
```

### 4. ПЕРЕЗАПУСК ДЕПЛОЯ

1. После добавления всех переменных
2. Перейдите в **Deployments**
3. Нажмите **Redeploy** на последнем деплое
4. **НЕ СТАВЬТЕ** галочку "UseExistingBuildCache"
5. Нажмите **Redeploy**

### 5. ТЕСТИРОВАНИЕ

После завершения деплоя проверьте:

1. **https://YOUR_NEW_DOMAIN/overlay?key=TEST123**
   - Должен показать overlay с задачей
   - Не должно быть ошибок в консоли

2. **https://YOUR_NEW_DOMAIN/overlay**
   - Должен показать "Overlay key missing"
   - Не должно быть крашей

3. **https://YOUR_NEW_DOMAIN/panel**
   - Должен открыться панель управления

## 🎯 РЕЗУЛЬТАТ

- ✅ Overlay работает без ошибок
- ✅ Нет проблем с кэшем
- ✅ Все переменные окружения настроены
- ✅ WebSocket подключается правильно
- ✅ Firebase работает корректно

## 🚨 ЕСЛИ ЧТО-ТО НЕ РАБОТАЕТ

1. Проверьте все переменные окружения
2. Убедитесь, что Firebase ключ в одну строку
3. Проверьте логи в Vercel Functions
4. Убедитесь, что домен правильно настроен

**НОВЫЙ ПРОЕКТ = РЕШЕНИЕ ВСЕХ ПРОБЛЕМ!** 🎉
