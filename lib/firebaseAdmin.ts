// lib/firebaseAdmin.ts
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

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

/** Возвращает Firestore admin. */
export function getAdminDB() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not set');
  }
  const sa = JSON.parse(raw);
  const projectId = sa.project_id;
  const clientEmail = sa.client_email;
  const privateKey: string = String(sa.private_key).replace(/\\n/g, '\n');
  if (!inited) {
    if (!getApps().length) {
      initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
    }
    inited = true;
  }
  return getFirestore();
}

/** Возвращает Firebase Storage admin bucket. */
export function getAdminBucket() {
  if (!inited) getAdminAuth(); // Ensure app is initialized
  const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (!bucketName) {
    throw new Error('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is not set');
  }
  return getStorage().bucket(bucketName);
}