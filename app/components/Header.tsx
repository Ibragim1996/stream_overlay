'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { getAuthClient } from '@/lib/firebaseClient';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);


  useEffect(() => {
    const auth = getAuthClient();
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Не показываем хедер внутри оверлея (его видят зрители)
  if (pathname?.startsWith('/overlay')) return null;

  async function handleLogout() {
    try {
      const auth = getAuthClient();
      await signOut(auth);
      router.replace('/sign-in');
    } catch (e) {
      // опционально: показать тост
      console.error(e);
    }
  }

  return (
    <header className="max-w-6xl mx-auto px-5 py-5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border border-[#415cff]/30 bg-[#415cff]/10 hover:bg-[#415cff]/20 hover:border-[#415cff]/50">
          <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-[#415cff] to-[#8bd0ff] grid place-items-center text-xs font-bold text-white">
            S
          </div>
          <span className="text-[#415cff] hover:text-[#8bd0ff] font-semibold tracking-wide">SECO Overlay</span>
        </Link>
      </div>

      <nav className="flex items-center gap-4 text-sm opacity-90">
        <Link className="hover:opacity-100 opacity-80 font-semibold text-indigo-400" href="/premium">Premium</Link>
        <Link className="hover:opacity-100 opacity-80" href="/faq">FAQ</Link>
        <Link className="hover:opacity-100 opacity-80" href="/help">Help</Link>
        <Link className="hover:opacity-100 opacity-80" href="/legal/privacy">Privacy</Link>
        <Link className="hover:opacity-100 opacity-80" href="/legal/terms">Terms</Link>

        {/* правый блок: логин/логаут/настройки */}
        {user ? (
          <div className="flex items-center gap-3">
            <Link
              href="/settings"
              className="px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 border border-gray-500/30 bg-gray-500/10 hover:bg-gray-500/20 hover:border-gray-500/50 text-gray-400 hover:text-gray-300"
              title="Settings"
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </Link>
            <span className="hidden sm:inline text-xs opacity-70">
              {user.displayName || user.email}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 hover:border-red-500/50 text-red-400 hover:text-red-300"
              title="Sign out"
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border border-[#415cff]/30 bg-[#415cff]/10 hover:bg-[#415cff]/20 hover:border-[#415cff]/50 text-[#415cff] hover:text-[#8bd0ff]"
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Sign in
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}