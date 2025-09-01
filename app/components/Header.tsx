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
        <div className="h-8 w-8 rounded-xl bg-[#1e2a5d] border border-[#2a3a7a] grid place-items-center text-xs font-bold">
          AI
        </div>
        <Link href="/" className="text-lg font-semibold tracking-wide">Seeko</Link>
      </div>

      <nav className="flex items-center gap-4 text-sm">
        <Link className="opacity-80 hover:opacity-100" href="/faq">FAQ</Link>
        <Link className="opacity-80 hover:opacity-100" href="/legal/privacy">Privacy</Link>
        <Link className="opacity-80 hover:opacity-100" href="/legal/terms">Terms</Link>
        <Link className="opacity-80 hover:opacity-100" href="/help">Help</Link>

        {/* правый блок: логин/логаут */}
        {user ? (
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs opacity-70">
              {user.displayName || user.email}
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-xl border border-[#2a3a7a] bg-[#141a35] hover:bg-[#182041]"
              title="Sign out"
            >
              Sign out
            </button>
          </div>
        ) : (
          <Link
            href="/sign-in"
            className="px-3 py-2 rounded-xl border border-[#2a3a7a] bg-[#141a35] hover:bg-[#182041]"
          >
            Sign in
          </Link>
        )}
      </nav>
    </header>
  );
}