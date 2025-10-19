# 🚀 Деплой на Vercel - www.vibekip.com

## ✅ Проект готов к деплою!

### 📋 Что уже настроено:

1. **Домен**: `www.vibekip.com` в `lib/config.ts`
2. **Vercel конфигурация**: `vercel.json` создан
3. **Сборка**: `npm run build` проходит успешно
4. **API роуты**: все работают
5. **Overlay**: готов к использованию
6. **Разнообразные задания**: система обновлена

### 🔧 Переменные окружения для Vercel:

```bash
# Обязательные
OPENAI_API_KEY=your_openai_key
OVERLAY_SIGN_SECRET=your_secret_key
OVERLAY_SECRET=your_secret_key

# Опциональные (для Firebase)
FIREBASE_SERVICE_ACCOUNT_KEY=your_firebase_key
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket

# Для продакшена
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://www.vibekip.com
```

### 📝 Инструкции по деплою:

1. **Подключить к Vercel:**
   ```bash
   npm i -g vercel
   vercel login
   vercel link
   ```

2. **Настроить домен:**
   - В Vercel Dashboard → Settings → Domains
   - Добавить `www.vibekip.com`
   - Настроить DNS записи

3. **Деплой:**
   ```bash
   vercel --prod
   ```

4. **Проверить:**
   - `https://www.vibekip.com` - главная страница
   - `https://www.vibekip.com/overlay?key=TEST123` - overlay

### 🎯 После деплоя:

1. **Сгенерировать ключ** на главной странице
2. **Скопировать URL** overlay
3. **Добавить в OBS/Streamlabs** как Browser Source
4. **Настроить размер** (1920×1080)
5. **Тестировать** генерацию заданий

### ⚠️ Важные моменты:

- **Rate limiting** отключен для разработки (включить в продакшене)
- **Firebase** опционально (есть fallback)
- **TTS** работает через OpenAI
- **Задания** теперь разнообразные и уникальные

### 🔗 Полезные ссылки:

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Документация**: https://vercel.com/docs
- **Домен настройки**: https://vercel.com/docs/concepts/projects/domains

## 🎉 Готово к использованию!

Проект полностью готов для продакшена на `www.vibekip.com`!