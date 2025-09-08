'use client';

import { useEffect, useState } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const cfg = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};
if (!getApps().length) initializeApp(cfg);

export default function SubscriptionPage() {
  const [loading, setLoading] = useState(true);
  const [sub, setSub] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    return onAuthStateChanged(auth, async (user) => {
      setLoading(true); setErr(null);
      try {
        if (!user) { setSub(null); setErr('Войдите в аккаунт'); return; }
        const token = await user.getIdToken();
        const r = await fetch('/api/account/subscription', { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
        const j = await r.json();
        if (!r.ok) throw new Error(j?.error || `HTTP ${r.status}`);
        setSub(j?.subscription ?? null);
      } catch (e: any) { setErr(e?.message || 'Ошибка'); }
      finally { setLoading(false); }
    });
  }, []);

  return (
    <main className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Подписка</h1>
      {loading && <p>Загрузка…</p>}
      {err && <p className="text-red-500">{err}</p>}
      {!loading && !err && (
        sub ? (
          <div className="border rounded p-4">
            <p><b>ID:</b> {sub.id}</p>
            <p><b>Статус:</b> {sub.status}</p>
            <p><b>Оплачен до:</b> {sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleString() : '—'}</p>
          </div>
        ) : <p>Подписка не оформлена.</p>
      )}
    </main>
  );
}