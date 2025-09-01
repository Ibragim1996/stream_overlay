// app/account/billing/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getAuthClient } from '@/lib/firebaseClient';

type Sub = {
  status?: string | null;
  priceId?: string | null;
  currentPeriodEnd?: number | null;
};

export default function BillingPage() {
  const [loading, setLoading] = useState(false);
  const [sub, setSub] = useState<Sub | null>(null);

  async function fetchSub() {
    try {
      const auth = getAuthClient();
      const token = await auth.currentUser?.getIdToken();
      const r = await fetch('/api/account/subscription', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (r.ok) setSub(await r.json());
    } catch {}
  }

  useEffect(() => {
    fetchSub();
  }, []);

  async function startCheckout() {
    setLoading(true);
    try {
      const auth = getAuthClient();
      const token = await auth.currentUser?.getIdToken();
      const r = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const { url } = await r.json();
      if (url) window.location.href = url;
    } finally {
      setLoading(false);
    }
  }

  async function openPortal() {
    setLoading(true);
    try {
      const auth = getAuthClient();
      const token = await auth.currentUser?.getIdToken();
      const r = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const { url } = await r.json();
      if (url) window.location.href = url;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#0b1020_0%,#0c1226_100%)] text-[#e6e9f2] p-6 grid place-items-center">
      <div className="w-full max-w-xl rounded-2xl border border-[#243058] bg-[rgba(10,14,28,.88)] backdrop-blur p-6 shadow-[0_20px_60px_rgba(0,0,0,.45)]">
        <h1 className="text-lg font-semibold mb-3">Billing</h1>

        <div className="text-sm opacity-80 mb-4">
          Status: <b>{sub?.status ?? '—'}</b>
          {sub?.currentPeriodEnd ? (
            <span> (until {new Date(sub.currentPeriodEnd * 1000).toLocaleDateString()})</span>
          ) : null}
        </div>

        <div className="flex gap-2">
          <button
            onClick={startCheckout}
            disabled={loading}
            className="px-4 py-3 rounded-xl text-white bg-[#415cff] hover:bg-[#3243a6] disabled:opacity-60"
          >
            {loading ? '...' : 'Upgrade to Pro'}
          </button>
          <button
            onClick={openPortal}
            disabled={loading}
            className="px-4 py-3 rounded-xl border border-[#2a3a7a] bg-[#141a35] hover:bg-[#182041] disabled:opacity-60"
          >
            {loading ? '...' : 'Manage subscription'}
          </button>
        </div>
      </div>
    </div>
  );
}