'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// Инициализация Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};
if (!getApps().length) initializeApp(firebaseConfig);

type Plan = 'monthly' | 'yearly';

interface SubscriptionStatus {
  status: string;
  plan: string | null;
  currentPeriodEnd: number | null;
  isActive: boolean;
  isMonthly: boolean;
  isYearly: boolean;
}

export default function PremiumClient() {
  const sp = useSearchParams();
  const [busy, setBusy] = useState<Plan | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isAuthed, setIsAuthed] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    if (!auth) {
      console.warn('[PremiumClient] Firebase auth not available');
      setIsAuthed(false);
      setLoading(false);
      return;
    }
    
    const un = onAuthStateChanged(auth, (u) => {
      setIsAuthed(!!u);
      if (u) {
        fetchSubscriptionStatus(u);
      } else {
        setSubscription(null);
        setLoading(false);
      }
    });
    return () => un();
  }, []);

  async function fetchSubscriptionStatus(user: any) {
    try {
      setLoading(true);
      const idToken = await user.getIdToken();
      const res = await fetch('/api/subscription', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        setSubscription(data);
      }
    } catch (e) {
      console.error('Failed to fetch subscription:', e);
    } finally {
      setLoading(false);
    }
  }

  async function openBillingPortal() {
    try {
      const auth = getAuth();
      if (!auth) {
        console.warn('[PremiumClient] Firebase auth not available for billing');
        return;
      }
      
      const user = auth.currentUser;
      if (!user) return;

      const idToken = await user.getIdToken();
      const res = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      setToast('Failed to open billing portal');
    }
  }

  const checkoutStatus = useMemo(() => {
    const s = sp.get('status');
    if (s === 'success') return { text: 'Payment successful. Premium is active.' } as const;
    if (s === 'cancel')  return { text: 'Checkout canceled.' } as const;
    if (sp.get('success') === '1')  return { text: 'Payment successful. Premium is active.' } as const;
    if (sp.get('canceled') === '1') return { text: 'Checkout canceled.' } as const;
    return null;
  }, [sp]);

  useEffect(() => {
    if (!checkoutStatus) return;
    setToast(checkoutStatus.text);
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [checkoutStatus]);

  async function startCheckout(plan: Plan) {
    try {
      setBusy(plan);
      setToast(null);

      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        setBusy(null);
        setToast('Please sign in first.');
        return;
      }
      const idToken = await user.getIdToken();

      // ВАЖНО: правильный эндпоинт + Bearer
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.url) {
        throw new Error(data?.error || `Checkout failed (${res.status})`);
      }
      window.location.href = data.url as string;
    } catch (e: any) {
      setToast(e?.message || 'Checkout failed');
      setBusy(null);
    }
  }

  return (
    <div className="min-h-screen text-[#e6e9f2]">
      {/* hero */}
      <section className="pt-12 pb-8">
        <div className="max-w-6xl mx-auto px-5">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Go <span className="text-[#8bd0ff]">Premium</span> — never run out of content again
          </h1>
          <p className="mt-3 text-sm md:text-base opacity-85 leading-relaxed">
            Premium unlocks stronger AI reactions, richer tasks, fewer repeats, and priority generation — built to
            keep chat engaged and your stream flowing 24/7.
          </p>
        </div>
      </section>

      {/* pricing */}
      <section className="pb-16">
        <div className="max-w-6xl mx-auto px-5 grid md:grid-cols-3 gap-6">
          <TierCard
            title="Free"
            price="$0"
            period="forever"
            bullets={['Core task modes','Basic overlay controls','Fair-use rate limits']}
            ctaLabel={subscription?.isActive ? "You're on Premium" : "You're on Free"}
            ctaDisabled
          />
          <TierCard
            title="Premium Monthly"
            price="$24"
            period="/month"
            highlight={!subscription?.isActive}
            bullets={[
              'Unlimited task requests (no caps)',
              'More expressive AI reactions',
              'Anti-repeat engine for fresh ideas',
              'Priority generation (less waiting)',
              'Built for Just Chatting & IRL',
            ]}
            note="Renews monthly • Cancel anytime"
            ctaLabel={
              loading ? 'Loading...' :
              subscription?.isActive && subscription.isMonthly ? 'Current Plan' :
              subscription?.isActive ? 'Switch to Monthly' :
              busy === 'monthly' ? 'Redirecting…' : 
              isAuthed ? 'Subscribe monthly' : 'Sign in to subscribe'
            }
            onClick={() => isAuthed && !subscription?.isMonthly && startCheckout('monthly')}
            loading={busy === 'monthly'}
            ctaDisabled={!isAuthed || (subscription?.isActive && subscription.isMonthly)}
          />
          <TierCard
            title="Premium Yearly"
            price="$240"
            period="/year"
            subtext="(best value)"
            highlight={!subscription?.isActive}
            bullets={['Everything in Monthly','Best price for daily streamers','Priority support']}
            note="Renews yearly • Cancel anytime"
            ctaLabel={
              loading ? 'Loading...' :
              subscription?.isActive && subscription.isYearly ? 'Current Plan' :
              subscription?.isActive ? 'Switch to Yearly' :
              busy === 'yearly' ? 'Redirecting…' : 
              isAuthed ? 'Subscribe yearly' : 'Sign in to subscribe'
            }
            onClick={() => isAuthed && !subscription?.isYearly && startCheckout('yearly')}
            loading={busy === 'yearly'}
            ctaDisabled={!isAuthed || (subscription?.isActive && subscription.isYearly)}
          />
        </div>
      </section>

      {/* Subscription Management */}
      {subscription?.isActive && (
        <section className="pb-16">
          <div className="max-w-6xl mx-auto px-5">
            <div className="rounded-2xl border border-[#415cff] bg-[rgba(10,14,28,.88)] backdrop-blur p-6 shadow-[0_20px_60px_rgba(0,0,0,.45)]">
              <h2 className="text-xl font-semibold mb-4">🎉 You're Premium!</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm opacity-80 mb-2">Current Plan</div>
                  <div className="text-lg font-semibold">
                    {subscription.isMonthly ? 'Premium Monthly' : 'Premium Yearly'}
                  </div>
                  {subscription.currentPeriodEnd && (
                    <div className="text-sm opacity-70 mt-1">
                      Renews on {new Date(subscription.currentPeriodEnd * 1000).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={openBillingPortal}
                    className="px-4 py-3 rounded-xl text-sm font-medium bg-[#415cff] hover:bg-[#3243a6] text-white transition"
                  >
                    Manage Subscription
                  </button>
                  <div className="text-xs opacity-60">
                    Update payment method, view invoices, or cancel subscription
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      <section className="pb-16">
        <div className="max-w-6xl mx-auto px-5">
          <h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-2">What's included in Premium?</h3>
              <p className="text-sm opacity-80">
                Unlimited task requests, more expressive AI reactions, anti-repeat engine, 
                priority generation, and premium support.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Can I cancel anytime?</h3>
              <p className="text-sm opacity-80">
                Yes! You can cancel your subscription at any time. You'll continue to have 
                Premium access until the end of your billing period.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">How does billing work?</h3>
              <p className="text-sm opacity-80">
                Monthly subscriptions renew every 30 days, yearly subscriptions renew every 12 months. 
                You can update your payment method anytime.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Is there a free trial?</h3>
              <p className="text-sm opacity-80">
                We offer a free tier with basic features. Premium unlocks unlimited usage 
                and advanced features for serious streamers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {toast && (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-6 px-4 py-2 rounded-xl text-sm bg-[#141a35] border border-[#2a3a7a] shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

/* ===== Small components ===== */
function TierCard(props: {
  title: string; price: string; period: string; subtext?: string;
  highlight?: boolean; bullets: string[]; note?: string;
  ctaLabel: string; ctaDisabled?: boolean; onClick?: () => void; loading?: boolean;
}) {
  const { title, price, period, subtext, highlight, bullets, note, ctaLabel, ctaDisabled, onClick, loading } = props;
  return (
    <div className={[
      'rounded-2xl border backdrop-blur p-6 shadow-[0_20px_60px_rgba(0,0,0,.35)]',
      highlight ? 'border-[#415cff] bg-[rgba(10,14,28,.88)]' : 'border-[#243058] bg-[rgba(10,14,28,.65)]'
    ].join(' ')}>
      <div className="text-lg font-semibold">{title}</div>
      <div className="mt-2 flex items-baseline gap-2">
        <div className="text-2xl font-extrabold">{price}</div>
        <div className="opacity-80">{period}</div>
      </div>
      {subtext && <div className="text-xs opacity-70 mt-0.5">{subtext}</div>}
      <ul className="mt-4 space-y-2 text-sm opacity-90">
        {bullets.map((b, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-0.5 inline-block h-1.5 w-1.5 rounded-full bg-[#8bd0ff]" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
      {note && <div className="text-xs opacity-60 mt-3">{note}</div>}
      <button
        onClick={onClick}
        disabled={!!ctaDisabled || !!loading}
        className={[
          'mt-5 w-full px-4 py-3 rounded-xl text-sm font-medium transition',
          ctaDisabled ? 'bg-[#0f142b] text-[#6f79a7] cursor-not-allowed'
          : highlight ? 'bg-[#415cff] hover:bg-[#3243a6] text-white'
          : 'bg-[#141a35] hover:bg-[#182041] text-[#d3ddff] border border-[#2a3a7a]'
        ].join(' ')}
      >
        {ctaLabel}
      </button>
    </div>
  );
}