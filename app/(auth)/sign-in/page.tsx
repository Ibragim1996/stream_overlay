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
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
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
    'auth/invalid-email': 'Invalid email format.',
    'auth/missing-password': 'Enter your password.',
    'auth/weak-password': 'Password is too weak.',
    'auth/email-already-in-use': 'This email is already registered.',
    'auth/user-not-found': 'No user with this email.',
    'auth/wrong-password': 'Wrong password.',
    'auth/popup-closed-by-user': 'Popup closed. Trying redirect…',
    'auth/popup-blocked': 'Popup blocked. Trying redirect…',
    'auth/invalid-api-key': 'Invalid Firebase API key. Check your environment variables.',
  };
  return map[codeOrMessage] ?? codeOrMessage ?? 'Unexpected error';
}

type FirebaseErr = { code?: string; message?: string };

// Главная страница авторизации
export default function SignInPage() {
  const router = useRouter();

  // form state
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
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
    const auth: Auth = getAuthClient();

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

  async function signIn() {
    try {
      setLoading(true);
      setErr(null);
      const auth = getAuthClient();
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace('/');
    } catch (e: unknown) {
      const fe = e as FirebaseErr;
      setErr(friendly(fe.code || fe.message || ''));
    } finally {
      setLoading(false);
    }
  }

  async function signUp() {
    try {
      setLoading(true);
      setErr(null);
      const auth = getAuthClient();
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      router.replace('/');
    } catch (e: unknown) {
      const fe = e as FirebaseErr;
      setErr(friendly(fe.code || fe.message || ''));
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    try {
      setLoading(true);
      setErr(null);
      const auth = getAuthClient();
      await signInWithPopup(auth, provider);
      router.replace('/');
    } catch (e: unknown) {
      const fe = e as FirebaseErr;

      // Если попап закрыт/заблокирован — пробуем redirect поток
      if (fe.code === 'auth/popup-closed-by-user' || fe.code === 'auth/popup-blocked') {
        setInfo(friendly(fe.code));
        const auth = getAuthClient();
        await signInWithRedirect(auth, provider);
        return;
      }

      setErr(friendly(fe.code || fe.message || ''));
      setLoading(false);
    }
  }

  async function resetPassword() {
    try {
      setLoading(true);
      setErr(null);
      setInfo(null);
      const auth = getAuthClient();
      await sendPasswordResetEmail(auth, email.trim());
      setInfo('Reset link sent to your email.');
    } catch (e: unknown) {
      const fe = e as FirebaseErr;
      setErr(friendly(fe.code || fe.message || ''));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#0b1020_0%,#0c1226_100%)] grid place-items-center p-4 text-[#e6e9f2]">
      <div className="w-full max-w-md rounded-3xl border border-[#243058] bg-[rgba(10,14,28,.95)] backdrop-blur-xl p-8 shadow-[0_25px_80px_rgba(0,0,0,.6)]">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#415cff] to-[#8bd0ff] border border-[#415cff]/30 grid place-items-center text-sm font-bold text-white shadow-lg">
              AI
            </div>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#e6e9f2] to-[#8bd0ff] bg-clip-text text-transparent">
            Welcome to Seeko
          </h1>
          <p className="text-sm opacity-70 mt-2">
            Sign in to access your AI streaming overlay
          </p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <input
              className="w-full p-4 pl-12 rounded-2xl border border-[#243058] bg-[rgba(12,18,38,0.8)] backdrop-blur-sm outline-none focus:ring-2 focus:ring-[#415cff]/50 focus:border-[#415cff]/30 transition-all duration-200 text-[#e6e9f2] placeholder-[#6f79a7]"
              placeholder="Enter your email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6f79a7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
          </div>

          <div className="relative">
            <input
              className="w-full p-4 pl-12 rounded-2xl border border-[#243058] bg-[rgba(12,18,38,0.8)] backdrop-blur-sm outline-none focus:ring-2 focus:ring-[#415cff]/50 focus:border-[#415cff]/30 transition-all duration-200 text-[#e6e9f2] placeholder-[#6f79a7]"
              placeholder="Enter your password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#6f79a7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          {err && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {err}
            </div>
          )}
          {info && (
            <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {info}
            </div>
          )}

          <button
            disabled={loading}
            onClick={signIn}
            className="w-full p-4 rounded-2xl text-white font-medium bg-gradient-to-r from-[#415cff] to-[#8bd0ff] hover:from-[#3243a6] hover:to-[#6bb6ff] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </div>
            ) : (
              'Sign in'
            )}
          </button>

          <button
            disabled={loading}
            onClick={signUp}
            className="w-full p-4 rounded-2xl border-2 border-[#243058] bg-[rgba(20,26,53,0.8)] hover:bg-[rgba(24,32,65,0.9)] hover:border-[#415cff]/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 text-[#e6e9f2] font-medium"
          >
            {loading ? 'Creating account...' : 'Create new account'}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[#243058]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[rgba(10,14,28,.95)] px-4 text-xs opacity-70 text-[#6f79a7] font-medium">or continue with</span>
            </div>
          </div>

          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="w-full p-4 rounded-2xl border-2 border-[#243058] bg-white hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3 font-medium text-gray-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <button
            type="button"
            onClick={resetPassword}
            className="text-sm text-[#8bd0ff] hover:text-[#b3d9ff] underline transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !email.trim()}
          >
            Forgot your password?
          </button>

          <div className="text-xs text-[#6f79a7] mt-6 text-center leading-relaxed">
            By signing in, you agree to our{' '}
            <Link href="/legal/terms" className="text-[#8bd0ff] hover:text-[#b3d9ff] underline transition-colors duration-200">
              Terms of Service
            </Link>
            {' '}and{' '}
            <Link href="/legal/privacy" className="text-[#8bd0ff] hover:text-[#b3d9ff] underline transition-colors duration-200">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}