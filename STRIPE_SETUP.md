# 🔧 Stripe Setup Instructions

## 📋 Что нужно настроить в Stripe Dashboard

### 1. **Создать продукты и цены**

1. Перейдите в [Stripe Dashboard](https://dashboard.stripe.com/) → Products
2. Создайте продукт "Premium Monthly":
   - Name: `Premium Monthly`
   - Price: `$24.00`
   - Billing period: `Monthly`
   - Copy **Price ID** (начинается с `price_`)

3. Создайте продукт "Premium Yearly":
   - Name: `Premium Yearly` 
   - Price: `$240.00`
   - Billing period: `Yearly`
   - Copy **Price ID** (начинается с `price_`)

### 2. **Обновить .env.local**

Замените в файле `.env.local`:

```bash
# Замените на ваши реальные Price IDs
STRIPE_PRICE_PRO_MONTH=price_1S2HEjI3LETUZaboYsB1ZvC3  # ← замените на ваш monthly price ID
STRIPE_PRICE_PRO_YEAR=price_your-yearly-price-id        # ← замените на ваш yearly price ID

# Получите новый webhook secret (см. пункт 3)
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret-here    # ← замените на ваш webhook secret
```

### 3. **Настроить Webhook**

1. Перейдите в [Stripe Dashboard](https://dashboard.stripe.com/) → Developers → Webhooks
2. Нажмите "Add endpoint"
3. URL endpoint: `https://your-domain.com/api/billing/webhook`
   - Для локальной разработки: `https://your-ngrok-url.ngrok.io/api/billing/webhook`
4. Выберите события:
   - `checkout.session.completed`
   - `customer.subscription.updated` 
   - `customer.subscription.deleted`
5. Скопируйте **Signing secret** (начинается с `whsec_`)
6. Добавьте его в `.env.local` как `STRIPE_WEBHOOK_SECRET`

### 4. **Для локальной разработки с ngrok**

```bash
# Установите ngrok
npm install -g ngrok

# Запустите туннель
ngrok http 3000

# Используйте https URL для webhook в Stripe Dashboard
# Например: https://abc123.ngrok.io/api/billing/webhook
```

## 🧪 Тестирование

### Тестовые карты Stripe:

- **Успешная оплата**: `4242 4242 4242 4242`
- **Неудачная оплата**: `4000 0000 0000 0002`
- **Требует 3D Secure**: `4000 0025 0000 3155`

**Данные для всех тестовых карт:**
- Expiry: любая будущая дата (например, 12/25)
- CVC: любые 3 цифры (например, 123)
- ZIP: любой (например, 12345)

## 🔍 Проверка работы

1. **Запустите сервер**: `npm run dev`
2. **Откройте**: `http://localhost:3000/premium`
3. **Войдите в аккаунт** (Firebase Auth)
4. **Нажмите "Subscribe monthly"** или "Subscribe yearly"
5. **Используйте тестовую карту** `4242 4242 4242 4242`
6. **Проверьте**:
   - ✅ Перенаправление на Stripe Checkout
   - ✅ Успешная оплата
   - ✅ Возврат на `/premium?status=success`
   - ✅ Отображение "You're Premium!" секции
   - ✅ Кнопка "Manage Subscription" работает

## 🚨 Возможные проблемы

### Проблема: "Invalid price ID"
**Решение**: Проверьте, что Price IDs в `.env.local` соответствуют созданным в Stripe Dashboard

### Проблема: Webhook не работает
**Решение**: 
1. Убедитесь, что URL webhook правильный
2. Проверьте, что webhook secret правильный
3. Для локальной разработки используйте ngrok

### Проблема: "Customer not found"
**Решение**: Убедитесь, что Firebase Auth работает и пользователь авторизован

## 📞 Поддержка

Если что-то не работает:
1. Проверьте логи в терминале (`npm run dev`)
2. Проверьте [Stripe Dashboard Logs](https://dashboard.stripe.com/logs)
3. Убедитесь, что все переменные окружения установлены правильно
