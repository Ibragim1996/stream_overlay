const fs = require('fs');

console.log('🔍 ПРОВЕРКА FIREBASE КОНФИГУРАЦИИ\n');

// Проверяем переменные окружения
const requiredVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'
];

const serverVars = [
  'FIREBASE_SERVICE_ACCOUNT_KEY'
];

console.log('📋 КЛИЕНТСКИЕ ПЕРЕМЕННЫЕ (NEXT_PUBLIC_*):');
let allClientVarsOk = true;
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`❌ ${varName}: НЕ НАЙДЕНА`);
    allClientVarsOk = false;
  }
});

console.log('\n📋 СЕРВЕРНЫЕ ПЕРЕМЕННЫЕ:');
let allServerVarsOk = true;
serverVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    try {
      const parsed = JSON.parse(value);
      console.log(`✅ ${varName}: ${parsed.project_id} (${parsed.client_email})`);
    } catch (e) {
      console.log(`⚠️  ${varName}: НАЙДЕНА, но невалидный JSON`);
    }
  } else {
    console.log(`❌ ${varName}: НЕ НАЙДЕНА`);
    allServerVarsOk = false;
  }
});

console.log('\n📊 СТАТУС:');
if (allClientVarsOk && allServerVarsOk) {
  console.log('✅ ВСЕ ПЕРЕМЕННЫЕ НАСТРОЕНЫ');
  console.log('🚀 Firebase готов к работе!');
} else {
  console.log('❌ НЕКОТОРЫЕ ПЕРЕМЕННЫЕ ОТСУТСТВУЮТ');
  console.log('📝 Следуйте инструкции в FIREBASE_SETUP_GUIDE.md');
}

console.log('\n🔗 ПОЛЕЗНЫЕ ССЫЛКИ:');
console.log('Firebase Console: https://console.firebase.google.com/');
console.log('Проект: ibra-project-82064');
console.log('Authentication: Build → Authentication → Sign-in method');
console.log('Firestore: Build → Firestore Database → Rules');
console.log('Storage: Build → Storage → Rules');
console.log('Service Account: ⚙️ → Project settings → Service accounts');





