'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { getAuthClient } from '@/lib/firebaseClient';
import RequireAuth from '@/app/components/RequireAuth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

function SettingsContent() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuthClient();
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#0b1020_0%,#0c1226_100%)] grid place-items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#415cff] mx-auto mb-4"></div>
          <p className="text-[#e6e9f2] opacity-70">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.replace('/sign-in');
    return null;
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#0b1020_0%,#0c1226_100%)] py-8">
      <div className="max-w-4xl mx-auto px-5">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#e6e9f2] to-[#8bd0ff] bg-clip-text text-transparent mb-2">
            Settings
          </h1>
          <p className="text-[#e6e9f2] opacity-70">
            Manage your account and preferences
          </p>
        </div>

        <div className="grid gap-6">
          {/* Account Information */}
          <div className="bg-[rgba(10,14,28,.95)] backdrop-blur-xl border border-[#243058] rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-[#e6e9f2] mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#8bd0ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Account Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#8bd0ff] mb-2">Email</label>
                <div className="p-3 bg-[rgba(12,18,38,0.8)] border border-[#243058] rounded-xl text-[#e6e9f2]">
                  {user.email}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#8bd0ff] mb-2">Display Name</label>
                <div className="p-3 bg-[rgba(12,18,38,0.8)] border border-[#243058] rounded-xl text-[#e6e9f2]">
                  {user.displayName || 'Not set'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#8bd0ff] mb-2">Account Created</label>
                <div className="p-3 bg-[rgba(12,18,38,0.8)] border border-[#243058] rounded-xl text-[#e6e9f2]">
                  {user.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Unknown'}
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Status */}
          <div className="bg-[rgba(10,14,28,.95)] backdrop-blur-xl border border-[#243058] rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-[#e6e9f2] mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#8bd0ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              Subscription
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-[rgba(12,18,38,0.8)] border border-[#243058] rounded-xl">
                <p className="text-[#e6e9f2] mb-2">Current Plan: <span className="text-[#8bd0ff] font-semibold">Free</span></p>
                <p className="text-sm text-[#e6e9f2] opacity-70 mb-3">
                  Upgrade to Premium for advanced AI features and priority support.
                </p>
                <a
                  href="/premium"
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#415cff] to-[#8bd0ff] text-white font-medium rounded-xl hover:from-[#3243a6] hover:to-[#6bb6ff] transition-all duration-200"
                >
                  Upgrade to Premium
                </a>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-[rgba(10,14,28,.95)] backdrop-blur-xl border border-[#243058] rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-[#e6e9f2] mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#8bd0ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Preferences
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#e6e9f2] font-medium">Email Notifications</p>
                  <p className="text-sm text-[#e6e9f2] opacity-70">Receive updates about your account and new features</p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#415cff] transition-colors focus:outline-none focus:ring-2 focus:ring-[#415cff] focus:ring-offset-2 focus:ring-offset-[#0b1020]">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#e6e9f2] font-medium">Dark Mode</p>
                  <p className="text-sm text-[#e6e9f2] opacity-70">Use dark theme for better streaming experience</p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#415cff] transition-colors focus:outline-none focus:ring-2 focus:ring-[#415cff] focus:ring-offset-2 focus:ring-offset-[#0b1020]">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-[rgba(10,14,28,.95)] backdrop-blur-xl border border-red-500/30 rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-red-400 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              Danger Zone
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <p className="text-red-400 font-medium mb-2">Delete Account</p>
                <p className="text-sm text-red-300/70 mb-3">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <button className="px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 font-medium rounded-xl hover:bg-red-500/30 transition-all duration-200">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <RequireAuth>
      <SettingsContent />
    </RequireAuth>
  );
}
