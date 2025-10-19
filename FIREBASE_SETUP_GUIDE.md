# 🔥 ПОШАГОВАЯ НАСТРОЙКА FIREBASE ДЛЯ AI STREAM

## 📋 ЧТО НУЖНО НАСТРОИТЬ В FIREBASE

У нас есть проект: **`ibra-project-82064`**

Нужно настроить 4 компонента:
1. ✅ **Authentication** (Email/Password + Google)
2. ✅ **Firestore Database** (база данных для пользователей и overlay)
3. ✅ **Storage** (для хранения аудио файлов TTS)
4. ✅ **Service Account** (для серверного доступа)

---

## 🚀 ШАГ 1: АУТЕНТИФИКАЦИЯ (AUTHENTICATION)

### 1.1 Открыть Firebase Console
- Перейти: https://console.firebase.google.com/
- Выбрать проект: **`ibra-project-82064`**

### 1.2 Включить Authentication
- В левом меню: **Build** → **Authentication**
- Если не включено: нажать **"Get started"**
- Перейти на вкладку **"Sign-in method"**

### 1.3 Настроить Email/Password
- Найти **"Email/Password"** в списке провайдеров
- Нажать на него
- Включить **"Email/Password"** (первый переключатель)
- Нажать **"Save"**

### 1.4 Настроить Google Sign-In
- Найти **"Google"** в списке провайдеров
- Нажать на него
- Включить переключатель
- **Project support email**: выбрать свой email
- **Project public-facing name**: `AI Stream Overlay`
- Нажать **"Save"**

### ✅ Результат:
```
Authentication → Sign-in method:
✅ Email/Password: Enabled
✅ Google: Enabled
```

---

## 🗄️ ШАГ 2: FIRESTORE DATABASE

### 2.1 Создать Firestore Database
- В левом меню: **Build** → **Firestore Database**
- Если не создана: нажать **"Create database"**

### 2.2 Выбрать режим безопасности
- Выбрать **"Start in production mode"** (более безопасно)
- Нажать **"Next"**

### 2.3 Выбрать регион
- Рекомендуется: **`us-central1`** (ближайший к Vercel)
- Нажать **"Done"**

### 2.4 Настроить правила безопасности
- После создания перейти на вкладку **"Rules"**
- Заменить содержимое на:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Пользователи могут читать только свои данные
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if false; // Только через Admin SDK
    }
    
    // Overlay state доступен для чтения всем (для OBS)
    match /overlays/{overlayKey}/state/{document=**} {
      allow read: if true;
      allow write: if false; // Только через Admin SDK
    }
    
    // Все остальные документы запрещены
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

- Нажать **"Publish"**

### ✅ Результат:
```
Firestore Database создана
Rules настроены
Структура данных готова для:
- users/{uid}
- overlays/{overlayKey}/state/current
```

---

## 📁 ШАГ 3: STORAGE

### 3.1 Создать Storage
- В левом меню: **Build** → **Storage**
- Если не создан: нажать **"Get started"**

### 3.2 Выбрать режим безопасности
- Выбрать **"Start in production mode"**
- Нажать **"Next"**

### 3.3 Выбрать регион
- Рекомендуется: **`us-central1`** (тот же, что Firestore)
- Нажать **"Done"**

### 3.4 Настроить правила Storage
- После создания перейти на вкладку **"Rules"**
- Заменить содержимое на:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // TTS аудио файлы - публичное чтение, запись только через Admin SDK
    match /tts/{allPaths=**} {
      allow read: if true; // Публичное чтение для аудио
      allow write: if false; // Только через Admin SDK
    }
    
    // Все остальные файлы запрещены
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

- Нажать **"Publish"**

### ✅ Результат:
```
Storage создан
Rules настроены
Готов для хранения аудио файлов в папке /tts/
```

---

## 🔑 ШАГ 4: SERVICE ACCOUNT (САМЫЙ ВАЖНЫЙ)

### 4.1 Открыть настройки проекта
- В левом меню: **⚙️** → **Project settings**

### 4.2 Перейти к Service Accounts
- Вкладка **"Service accounts"**
- Нажать **"Generate new private key"**

### 4.3 Скачать ключ
- Появится диалог: **"Are you sure you want to generate a new private key?"**
- Нажать **"Generate key"**
- Скачается JSON файл (например: `ibra-project-82064-firebase-adminsdk-xxxxx.json`)

### 4.4 Преобразовать в одну строку
JSON файл выглядит так:
```json
{
  "type": "service_account",
  "project_id": "ibra-project-82064",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@ibra-project-82064.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

**Нужно преобразовать в ОДНУ СТРОКУ:**
```json
{"type":"service_account","project_id":"ibra-project-82064","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-xxxxx@ibra-project-82064.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}
```

### 4.5 Создать скрипт для преобразования
Создать файл `convert-firebase-key.js`:

```javascript
const fs = require('fs');
const path = require('path');

// Путь к скачанному JSON файлу
const keyPath = process.argv[2];
if (!keyPath) {
  console.error('Usage: node convert-firebase-key.js path/to/firebase-key.json');
  process.exit(1);
}

try {
  const keyData = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
  const oneLine = JSON.stringify(keyData);
  
  console.log('\n=== FIREBASE SERVICE ACCOUNT KEY (одна строка) ===');
  console.log(oneLine);
  console.log('\n=== КОПИРУЙТЕ ЭТУ СТРОКУ В VERCEL ===');
  console.log('Переменная: FIREBASE_SERVICE_ACCOUNT_KEY');
  console.log('Значение: (скопировать строку выше)');
  
} catch (error) {
  console.error('Ошибка:', error.message);
  process.exit(1);
}
```

### ✅ Результат:
```
Service Account Key получен
Готов для добавления в Vercel как FIREBASE_SERVICE_ACCOUNT_KEY
```

---

## 🔍 ШАГ 5: ПРОВЕРКА НАСТРОЙКИ

### 5.1 Проверить все компоненты
В Firebase Console должно быть:

```
✅ Authentication
  ✅ Sign-in method: Email/Password (Enabled)
  ✅ Sign-in method: Google (Enabled)

✅ Firestore Database
  ✅ Database: ibra-project-82064 (us-central1)
  ✅ Rules: настроены для users/ и overlays/

✅ Storage
  ✅ Bucket: ibra-project-82064.firebasestorage.app
  ✅ Rules: настроены для /tts/

✅ Project Settings
  ✅ Service Account: ключ скачан
```

### 5.2 Проверить конфигурацию проекта
- **Project Settings** → **General** → **Your apps**
- Должно быть Web App с конфигурацией:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyCJdwovqfSZMb6QmJM1DaddHboFVXDh8ZI",
  authDomain: "ibra-project-82064.firebaseapp.com",
  projectId: "ibra-project-82064",
  storageBucket: "ibra-project-82064.firebasestorage.app",
  messagingSenderId: "556300271135",
  appId: "1:556300271135:web:dd6b25084266fb8936df2a"
};
```

---

## 📝 ШАГ 6: ДОБАВЛЕНИЕ В VERCEL

### 6.1 Переменные для Vercel
После настройки Firebase добавить в Vercel:

```bash
# Firebase Client (уже есть)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCJdwovqfSZMb6QmJM1DaddHboFVXDh8ZI
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ibra-project-82064.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ibra-project-82064
NEXT_PUBLIC_FIREBASE_APP_ID=1:556300271135:web:dd6b25084266fb8936df2a
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=556300271135
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ibra-project-82064.firebasestorage.app

# Firebase Server (НОВОЕ - добавить после получения Service Account)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

### 6.2 Как добавить в Vercel
1. Зайти в проект на Vercel
2. **Settings** → **Environment Variables**
3. Для каждой переменной:
   - **Name**: имя переменной
   - **Value**: значение (без кавычек)
   - **Environments**: ✅ Production ✅ Preview
4. **Save**
5. После добавления всех переменных: **Deployments** → **"..."** → **Redeploy** → ❌ **Use existing build cache** → **Redeploy**

---

## ✅ ФИНАЛЬНАЯ ПРОВЕРКА

После настройки Firebase и добавления переменных в Vercel:

### 1. Проверить переменные
- `/env-check` — должен показать все Firebase переменные как ✅
- `/api/debug-env` — должен показать FIREBASE_SERVICE_ACCOUNT_KEY как ✅

### 2. Проверить аутентификацию
- Зайти на `/sign-in`
- Попробовать зарегистрироваться через Email/Password
- Попробовать войти через Google

### 3. Проверить Firestore
- После регистрации пользователя должен создаться документ в `users/{uid}`
- Проверить в Firebase Console → Firestore → Data

### 4. Проверить Storage
- Сгенерировать задание через панель
- Проверить, что аудио файл сохранился в Storage → `/tts/`

### 5. Проверить Overlay
- Открыть `/overlay?key=TEST123`
- Должно работать без ошибок в консоли

---

## 🚨 ВОЗМОЖНЫЕ ПРОБЛЕМЫ

### Проблема: "Firebase not initialized"
**Решение**: Проверить, что все `NEXT_PUBLIC_FIREBASE_*` переменные добавлены в Vercel

### Проблема: "Missing credentials: FIREBASE_SERVICE_ACCOUNT_KEY"
**Решение**: 
1. Убедиться, что Service Account Key скачан
2. Преобразовать в одну строку
3. Добавить в Vercel как `FIREBASE_SERVICE_ACCOUNT_KEY`

### Проблема: "Permission denied" в Firestore
**Решение**: Проверить Rules в Firestore Database

### Проблема: "Permission denied" в Storage
**Решение**: Проверить Rules в Storage

### Проблема: Google Sign-In не работает
**Решение**: 
1. Проверить, что Google провайдер включен в Authentication
2. Проверить Project support email в настройках Google

---

## 🎯 ГОТОВО!

После выполнения всех шагов Firebase будет полностью настроен и готов к работе с проектом AI Stream Overlay.

**Следующие шаги:**
1. Настроить OpenAI API Key
2. Настроить Upstash Redis
3. Добавить все переменные в Vercel
4. Redeploy проект
5. Протестировать все функции





