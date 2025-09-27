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

function readCfg(): Cfg | null {
  const cfg: Cfg = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  };

  // Мягкая проверка — если что-то не задано, возвращаем null
  if (!cfg.apiKey || !cfg.authDomain || !cfg.projectId || !cfg.appId) {
    const missing = Object.entries(cfg)
      .filter(([, v]) => !v)
      .map(([k]) => k);
    console.warn('[firebaseClient] Missing env variables:', missing);
    console.warn('[firebaseClient] Firebase will not be initialized. Add NEXT_PUBLIC_FIREBASE_* variables to Vercel.');
    return null;
  }
  return cfg;
}

export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === 'undefined') {
    throw new Error('getFirebaseApp() вызван на сервере. Используй только в client компонентах.');
  }
  
  const cfg = readCfg();
  if (!cfg) {
    return null;
  }
  
  return getApps().length ? getApp() : initializeApp(cfg);
}

export function getAuthClient(): Auth | null {
  if (typeof window === 'undefined') {
    throw new Error('getAuthClient() вызван на сервере. Используй только в client компонентах.');
  }
  
  const app = getFirebaseApp();
  if (!app) {
    return null;
  }
  
  return getAuth(app);
}

export function getGoogleProvider(): GoogleAuthProvider {
  const p = new GoogleAuthProvider();
  p.setCustomParameters({ prompt: 'select_account' });
  return p;
}