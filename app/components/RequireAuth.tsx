// app/components/RequireAuth.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { getAuthClient } from '@/lib/firebaseClient';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const auth = getAuthClient();
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.replace('/sign-in');
      setReady(true);
    });
    return () => unsub();
  }, [router]);

  if (!ready) return null;
  return <>{children}</>;
}