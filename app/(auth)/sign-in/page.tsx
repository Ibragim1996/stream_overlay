// app/(auth)/sign-in/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthClient } from '@/lib/firebaseClient';
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
      <div className="w-full max-w-sm rounded-2xl border border-[#243058] bg-[rgba(10,14,28,.88)] backdrop-blur p-6 shadow-[0_20px_60px_rgba(0,0,0,.45)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-9 w-9 rounded-xl bg-[#1e2a5d] border border-[#2a3a7a] grid place-items-center text-xs font-bold">
            AI
          </div>
          <div className="text-lg font-semibold">Seeko — Sign in</div>
        </div>

        <div className="space-y-3">
          <input
            className="border border-[#243058] bg-[#0c1226] w-full p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#415cff]/40"
            placeholder="Email"
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="border border-[#243058] bg-[#0c1226] w-full p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#415cff]/40"
            placeholder="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {err && <p className="text-red-400 text-sm">{err}</p>}
          {info && <p className="text-green-400 text-sm">{info}</p>}

          <button
            disabled={loading}
            onClick={signIn}
            className="w-full p-3 rounded-xl text-white bg-[#415cff] hover:bg-[#3243a6] disabled:opacity-60"
          >
            {loading ? '...' : 'Sign in'}
          </button>

          <button
            disabled={loading}
            onClick={signUp}
            className="w-full p-3 rounded-xl border border-[#2a3a7a] bg-[#141a35] hover:bg-[#182041] disabled:opacity-60"
          >
            {loading ? '...' : 'Create account'}
          </button>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[#243058]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[rgba(10,14,28,.88)] px-2 text-xs opacity-70">or</span>
            </div>
          </div>

          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="w-full p-3 rounded-xl border border-[#2a3a7a] bg-[#141a35] hover:bg-[#182041] disabled:opacity-60"
          >
            Continue with Google
          </button>

          <button
            type="button"
            onClick={resetPassword}
            className="text-xs underline opacity-80"
            disabled={loading || !email.trim()}
          >
            Forgot password?
          </button>
        </div>
      </div>
    </div>
  );
}