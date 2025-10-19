'use client';

import { useState, useRef } from 'react';
import { nanoid } from 'nanoid';
import { getBaseUrl } from '@/lib/config';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function GenerateAIReactionKey() {
  const [streamerName, setStreamerName] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const toastRef = useRef<number | null>(null);

  const generateKey = () => {
    if (!streamerName.trim()) {
      toast('Enter your streamer name');
      return;
    }

    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/ai-reactions/store/${streamerName.trim().toLowerCase()}`;
    setGeneratedUrl(url);
  };

  const copyUrl = async () => {
    if (!generatedUrl) return;
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      toast('URL copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast('Failed to copy');
    }
  };


  const toast = (msg: string) => {
    const el = document.getElementById('toast-bar');
    if (!el) return;
    el.textContent = msg;
    el.style.opacity = '1';
    if (toastRef.current) window.clearTimeout(toastRef.current);
    toastRef.current = window.setTimeout(() => {
      el.style.opacity = '0';
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#0b1020_0%,#0c1226_100%)] text-[#e6e9f2]">
      <div className="max-w-4xl mx-auto px-5 py-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
            🎤 AI Reactions Generator
          </h1>
          <p className="text-lg opacity-80">
            Generate your AI Reactions store link and overlay key for viewers
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Generator Form */}
            <div className="rounded-2xl border border-[#243058] bg-[rgba(10,14,28,.88)] backdrop-blur p-6 shadow-[0_20px_60px_rgba(0,0,0,.45)]">
              <h2 className="text-xl font-semibold mb-4 text-green-400">Generate Your Keys</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Streamer Name</label>
                  <input
                    type="text"
                    value={streamerName}
                    onChange={(e) => setStreamerName(e.target.value)}
                    placeholder="Enter your streamer name"
                    className="w-full rounded-xl border border-[#243058] bg-[#0c1226] px-4 py-3 outline-none focus:ring-2 focus:ring-green-500/40"
                  />
                </div>

                <button
                  onClick={generateKey}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-xl font-bold hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-300"
                >
                  Generate AI Reaction Keys
                </button>
              </div>

              {generatedUrl && (
                <div className="mt-6 space-y-4">
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                    <h3 className="font-semibold text-green-400 mb-2">✅ Generated Successfully!</h3>
                    <p className="text-sm opacity-80">
                      Share the store link with viewers - reactions will appear in your main overlay automatically!
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">🔗 Store Link (for viewers)</label>
                    <div className="flex gap-2">
                      <input
                        readOnly
                        value={generatedUrl}
                        className="flex-1 rounded-xl border border-[#243058] bg-[#0c1226] px-4 py-3 text-sm"
                      />
                      <button
                        onClick={copyUrl}
                        className={`px-4 py-3 rounded-xl text-sm font-medium transition ${
                          copied ? 'bg-green-600' : 'bg-green-500 hover:bg-green-600'
                        }`}
                      >
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-xs opacity-60 mt-1">Share this link with your viewers - reactions will appear in your main overlay!</p>
                  </div>
                </div>
              )}
            </div>

          {/* Instructions */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-[#243058] bg-[rgba(10,14,28,.88)] backdrop-blur p-6 shadow-[0_20px_60px_rgba(0,0,0,.45)]">
              <h3 className="text-lg font-semibold mb-4 text-blue-400">How to Use</h3>
              <div className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">1</div>
                  <div>
                    <strong>Generate store link</strong> - Enter your streamer name and click generate
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">2</div>
                  <div>
                    <strong>Share store link</strong> - Copy the store URL and share it with viewers (in chat, bio, etc.)
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">3</div>
                  <div>
                    <strong>Use your main overlay</strong> - AI reactions will appear in your existing overlay automatically
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">4</div>
                  <div>
                    <strong>Go live!</strong> - Viewers can now buy AI reactions that appear in your main overlay
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#243058] bg-[rgba(10,14,28,.88)] backdrop-blur p-6 shadow-[0_20px_60px_rgba(0,0,0,.45)]">
              <h3 className="text-lg font-semibold mb-4 text-yellow-400">OBS Setup</h3>
              <div className="text-sm space-y-2">
                <p><strong>1.</strong> Use your existing overlay from the main project</p>
                <p><strong>2.</strong> URL: <code className="bg-gray-700 px-2 py-1 rounded">https://vibekip.com/overlay?token=YOUR_TOKEN</code></p>
                <p><strong>3.</strong> AI reactions will appear automatically in your main overlay</p>
                <p><strong>4.</strong> No additional setup needed!</p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#243058] bg-[rgba(10,14,28,.88)] backdrop-blur p-6 shadow-[0_20px_60px_rgba(0,0,0,.45)]">
              <h3 className="text-lg font-semibold mb-4 text-purple-400">For Viewers</h3>
              <div className="text-sm space-y-2">
                <p><strong>1.</strong> Share the Store Link with viewers</p>
                <p><strong>2.</strong> Viewers can buy AI reactions for $2.99</p>
                <p><strong>3.</strong> Reactions appear in your overlay with voice</p>
                <p><strong>4.</strong> 3 styles: Supportive, Light Troll, Hard Troll</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      <div
        id="toast-bar"
        className="fixed left-1/2 -translate-x-1/2 bottom-6 px-4 py-2 rounded-xl text-sm bg-[#141a35] border border-[#2a3a7a] pointer-events-none transition-opacity duration-300 opacity-0"
      />
    </div>
  );
}
