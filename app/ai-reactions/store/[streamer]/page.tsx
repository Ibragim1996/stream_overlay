'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function AIReactionsStore() {
  const params = useParams();
  const streamer = params.streamer as string;
  
  const [selectedStyle, setSelectedStyle] = useState('support');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const styles = [
    {
      id: 'support',
      emoji: '😊',
      name: 'Supportive',
      description: 'Encouraging and positive'
    },
    {
      id: 'light_troll',
      emoji: '😏',
      name: 'Light Troll',
      description: 'Playful teasing and jokes'
    },
    {
      id: 'hard_troll',
      emoji: '😈',
      name: 'Hard Troll',
      description: 'Sharp criticism and tough love'
    }
  ];

  const buyReaction = async () => {
    if (!streamer) {
      setError('Streamer not found');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/ai-reactions/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          handle: streamer,
          style: selectedStyle,
          tier: 'BASIC'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Checkout failed');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;

    } catch (error: any) {
      console.error('Purchase error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Check for success/cancel from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    
    if (status === 'success') {
      setSuccess('Payment successful! Your AI reaction has been sent to the streamer.');
    } else if (status === 'cancel') {
      setError('Payment was cancelled. You can try again anytime.');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-6 text-center">
          <h1 className="text-3xl font-bold mb-2">🎤 AI Reactions</h1>
          <p className="text-lg opacity-90">Send personalized AI reactions to</p>
          <p className="text-xl font-semibold">@{streamer}</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Tiers */}
          <div className="mb-6">
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl text-center mb-4">
              <div className="text-2xl font-bold">BASIC</div>
              <div className="text-3xl font-bold">$2.99</div>
              <div className="text-sm opacity-90">Quick AI reaction (5-10 seconds)</div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-100 p-3 rounded-lg text-center opacity-60">
                <div className="font-bold text-gray-600">MEDIUM</div>
                <div className="text-lg font-bold text-gray-600">$9.99</div>
                <div className="text-xs text-gray-500">Coming Soon</div>
              </div>
              <div className="bg-gray-100 p-3 rounded-lg text-center opacity-60">
                <div className="font-bold text-gray-600">VIP</div>
                <div className="text-lg font-bold text-gray-600">$49.99</div>
                <div className="text-xs text-gray-500">Coming Soon</div>
              </div>
            </div>
          </div>

          {/* Style Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Choose Reaction Style:</h3>
            <div className="space-y-3">
              {styles.map((style) => (
                <div
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedStyle === style.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{style.emoji}</div>
                    <div>
                      <div className="font-semibold text-gray-800">{style.name}</div>
                      <div className="text-sm text-gray-600">{style.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Buy Button */}
          <button
            onClick={buyReaction}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? 'Processing...' : 'Buy AI Reaction - $2.99'}
          </button>

          {/* Messages */}
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg">
              {success}
            </div>
          )}

          {/* Info */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Your reaction will appear in the streamer's overlay with voice narration!</p>
          </div>
        </div>
      </div>
    </div>
  );
}


