# 🧪 AI Reactions Flow Test

## ✅ **Проверка связи между компонентами:**

### 1. **Генератор ключей** (`/ai-reactions/generate`)
- ✅ Создает ссылку: `http://localhost:3000/ai-reactions/store/{streamerName}`
- ✅ Стример вводит имя и получает Store Link
- ✅ Ссылка содержит имя стримера в URL

### 2. **Магазин для зрителей** (`/ai-reactions/store/[streamer]`)
- ✅ Получает имя стримера из URL параметра `[streamer]`
- ✅ Отображает "Send personalized AI reactions to @{streamerName}"
- ✅ Отправляет `handle: streamer` в API при покупке

### 3. **API Checkout** (`/api/ai-reactions/checkout`)
- ✅ Получает `handle`, `style`, `tier` из запроса
- ✅ Находит или создает стримера по `handle`
- ✅ Создает заказ с `streamerId`
- ✅ Сохраняет в metadata Stripe: `orderId`, `streamerId`, `style`, `tier`
- ✅ Создает Stripe checkout сессию

### 4. **Webhook** (`/api/ai-reactions/webhook`)
- ✅ Получает `streamerId` из metadata Stripe
- ✅ Генерирует AI реакцию по стилю
- ✅ Логирует отправку реакции конкретному стримеру

### 5. **Overlay** (`/overlay`)
- ✅ Подключается к WebSocket для получения реакций
- ✅ Отображает реакции с анимацией
- ✅ Показывает стиль и текст реакции

## 🔗 **Полный флоу:**

```
1. Стример "teststreamer" генерирует ссылку
   ↓
2. Получает: http://localhost:3000/ai-reactions/store/teststreamer
   ↓
3. Делится ссылкой с зрителями
   ↓
4. Зритель переходит по ссылке
   ↓
5. Видит магазин с именем "teststreamer"
   ↓
6. Выбирает стиль и покупает реакцию
   ↓
7. API создает заказ с streamerId = "streamer-{timestamp}"
   ↓
8. Stripe обрабатывает платеж
   ↓
9. Webhook получает streamerId и генерирует реакцию
   ↓
10. Реакция отправляется в overlay стримера
```

## ✅ **Связь подтверждена!**

Каждая реакция привязана к конкретному стримеру через:
- **URL параметр** → **API handle** → **streamerId** → **Stripe metadata** → **Webhook** → **Overlay**

Система полностью связана! 🎉


