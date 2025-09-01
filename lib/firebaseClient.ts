// lib/firebaseClient.ts
import { initializeApp, getApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';

type Cfg = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
  messagingSenderId?: string;
  storageBucket?: string;
};

function readCfg(): Cfg {
  const cfg: Cfg = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  };

  // Валидация — если что-то не задано, падаем с понятной подсказкой
  if (!cfg.apiKey || !cfg.authDomain || !cfg.projectId || !cfg.appId) {
    const missing = Object.entries(cfg)
      .filter(([, v]) => !v)
      .map(([k]) => k);
    console.error('[firebaseClient] Missing env:', missing);
    throw new Error(
      'Firebase client config is incomplete. ' +
      'Заполни NEXT_PUBLIC_FIREBASE_* в .env.local и перезапусти dev-сервер.'
    );
  }
  return cfg;
}

export function getFirebaseApp(): FirebaseApp {
  if (typeof window === 'undefined') {
    throw new Error('getFirebaseApp() вызван на сервере. Используй только в client компонентах.');
  }
  return getApps().length ? getApp() : initializeApp(readCfg());
}

export function getAuthClient(): Auth {
  if (typeof window === 'undefined') {
    throw new Error('getAuthClient() вызван на сервере. Используй только в client компонентах.');
  }
  return getAuth(getFirebaseApp());
}

export function getGoogleProvider(): GoogleAuthProvider {
  const p = new GoogleAuthProvider();
  p.setCustomParameters({ prompt: 'select_account' });
  return p;
}