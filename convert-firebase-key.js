const fs = require('fs');
const path = require('path');

// Путь к скачанному JSON файлу
const keyPath = process.argv[2];
if (!keyPath) {
  console.error('Usage: node convert-firebase-key.js path/to/firebase-key.json');
  console.error('Example: node convert-firebase-key.js ./ibra-project-82064-firebase-adminsdk-xxxxx.json');
  process.exit(1);
}

if (!fs.existsSync(keyPath)) {
  console.error(`File not found: ${keyPath}`);
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
  console.log('\n=== ПРОВЕРКА ===');
  console.log(`Project ID: ${keyData.project_id}`);
  console.log(`Client Email: ${keyData.client_email}`);
  console.log(`Key Length: ${oneLine.length} символов`);
  
} catch (error) {
  console.error('Ошибка при чтении файла:', error.message);
  console.error('Убедитесь, что файл содержит валидный JSON');
  process.exit(1);
}





