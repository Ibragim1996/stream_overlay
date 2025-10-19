'use client';

import { useState } from 'react';

export default function TestAPIPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tasks/next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          overlayKey: 'TEST123',
          mode: 'funny',
          tone: 'calm'
        })
      });

      const data = await response.json();
      setResult({ status: response.status, data });
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testTTS = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'Hello, this is a test of the text-to-speech system.'
        })
      });

      const data = await response.json();
      setResult({ status: response.status, data });
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#0b1020_0%,#0c1226_100%)] text-[#e6e9f2] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-[#8bd0ff]">API Test Page</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-[rgba(10,14,28,.95)] rounded-2xl p-6 border border-[#243058]">
            <h2 className="text-xl font-semibold mb-4 text-[#415cff]">Test Tasks API</h2>
            <button
              onClick={testAPI}
              disabled={loading}
              className="w-full p-3 bg-[#415cff] hover:bg-[#5a6fff] disabled:opacity-50 rounded-xl font-medium transition-colors"
            >
              {loading ? 'Testing...' : 'Test /api/tasks/next'}
            </button>
          </div>

          <div className="bg-[rgba(10,14,28,.95)] rounded-2xl p-6 border border-[#243058]">
            <h2 className="text-xl font-semibold mb-4 text-[#415cff]">Test TTS API</h2>
            <button
              onClick={testTTS}
              disabled={loading}
              className="w-full p-3 bg-[#415cff] hover:bg-[#5a6fff] disabled:opacity-50 rounded-xl font-medium transition-colors"
            >
              {loading ? 'Testing...' : 'Test /api/test-tts'}
            </button>
          </div>
        </div>

        {result && (
          <div className="mt-8 bg-[rgba(10,14,28,.95)] rounded-2xl p-6 border border-[#243058]">
            <h3 className="text-lg font-semibold mb-4 text-[#415cff]">Result</h3>
            <pre className="bg-[#0b1020] p-4 rounded-xl overflow-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8 text-center">
          <a
            href="/overlay?key=TEST123"
            className="inline-block p-3 bg-[#8bd0ff] hover:bg-[#b3d9ff] text-[#0b1020] rounded-xl font-medium transition-colors"
          >
            Open Overlay with TEST123
          </a>
        </div>
      </div>
    </div>
  );
}





