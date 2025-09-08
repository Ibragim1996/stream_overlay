// lib/firebaseAdmin.ts
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

let inited = false;

/** Возвращает инстанс admin auth только когда реально нужен. */
export function getAdminAuth() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not set');
  }

  // Разбираем JSON из переменной окружения
  const sa = JSON.parse(raw);

  // Иногда private_key приходит с \\n — нормализуем
  const projectId = sa.project_id;
  const clientEmail = sa.client_email;
  const privateKey: string = String(sa.private_key).replace(/\\n/g, '\n');

  if (!inited) {
    if (!getApps().length) {
      initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
      });
    }
    inited = true;
  }
  return getAuth();
}