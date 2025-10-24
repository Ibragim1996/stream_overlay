// app/(auth)/sign-in/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAuthClient } from '@/lib/firebaseClient';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  type Auth,
  type UserCredential,
} from 'firebase/auth';

// Читабельные сообщения для распространённых кодов ошибок Firebase
function friendly(codeOrMessage: string): string {
  const map: Record<string, string> = {
    'auth/popup-closed-by-user': 'Sign-in cancelled. Please try again.',
    'auth/popup-blocked': 'Popup blocked. Trying redirect…',
    'auth/invalid-api-key': 'Authentication service unavailable. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
  };
  return map[codeOrMessage] ?? 'Sign-in failed. Please try again.';
}

type FirebaseErr = { code?: string; message?: string };

// Современная страница авторизации
export default function SignInPage() {
  const router = useRouter();

  // state
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Google provider (мемоизированный)
  const provider = useMemo(() => {
    const p = new GoogleAuthProvider();
    p.setCustomParameters({ prompt: 'select_account' });
    return p;
  }, []);

  // Завершаем redirect-поток и делаем auth gate
  useEffect(() => {
    const auth: Auth | null = getAuthClient();
    if (!auth) {
      console.warn('[SignIn] Firebase auth not available');
      return;
    }

    // Если уже авторизован — отправляем на главную
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) router.replace('/');
    });

    // Если вернулись из redirect входа Google
    getRedirectResult(auth)
      .then((res: UserCredential | null) => {
        if (res?.user) router.replace('/');
      })
      .catch((e: unknown) => {
        const fe = e as FirebaseErr;
        setErr(friendly(fe.code || fe.message || ''));
      });

    return () => unsub();
  }, [router]);

  async function signInWithGoogle() {
    try {
      setLoading(true);
      setErr(null);
      setInfo(null);
      const auth = getAuthClient();
      if (!auth) {
        setErr('Authentication service not available');
        return;
      }
      
      // Use redirect flow by default (works better with Chrome's third-party cookie restrictions)
      await signInWithRedirect(auth, provider);
      // Note: After redirect, user will be automatically signed in on return
    } catch (e: unknown) {
      const fe = e as FirebaseErr;
      setErr(friendly(fe.code || fe.message || ''));
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#0b1020_0%,#0c1226_100%)] grid place-items-center p-4 text-[#e6e9f2]">
      <div className="w-full max-w-md rounded-3xl border border-[#243058] bg-[rgba(10,14,28,.95)] backdrop-blur-xl p-8 shadow-[0_25px_80px_rgba(0,0,0,.6)]">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#415cff] to-[#8bd0ff] border border-[#415cff]/30 grid place-items-center text-lg font-bold text-white shadow-lg">
              V
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#e6e9f2] to-[#8bd0ff] bg-clip-text text-transparent mb-2">
            Welcome to Vibekip
          </h1>
          <p className="text-base opacity-70">
            Sign in to access your AI streaming overlay
          </p>
        </div>

        <div className="space-y-6">
          {err && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {err}
            </div>
          )}
          
          {info && (
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm flex items-center gap-3">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {info}
            </div>
          )}

          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="w-full p-4 rounded-2xl border-2 border-[#243058] bg-white hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-4 font-semibold text-gray-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-lg"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </div>
            ) : (
              'Continue with Google'
            )}
          </button>

          <div className="text-center">
            <p className="text-sm text-[#6f79a7] leading-relaxed">
              By signing in, you agree to our{' '}
              <Link href="/legal/terms" className="text-[#8bd0ff] hover:text-[#b3d9ff] underline transition-colors duration-200">
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link href="/legal/privacy" className="text-[#8bd0ff] hover:text-[#b3d9ff] underline transition-colors duration-200">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}