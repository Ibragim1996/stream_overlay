// app/components/UpgradeModal.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
}

export default function UpgradeModal({ isOpen, onClose, reason }: UpgradeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[rgba(10,14,28,0.95)] backdrop-blur-xl rounded-2xl border border-[#243058] p-8 max-w-md mx-4 shadow-[0_25px_80px_rgba(0,0,0,0.6)]">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-2xl font-bold text-white mb-2">🚀 Upgrade to Premium</div>
          <div className="text-[#8bd0ff] text-sm">
            {reason || "Unlock unlimited AI tasks and voice features"}
          </div>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-white">
            <span className="text-[#415cff]">✓</span>
            <span>Unlimited AI tasks (no 10/hour limit)</span>
          </div>
          <div className="flex items-center gap-3 text-white">
            <span className="text-[#415cff]">✓</span>
            <span>Real-time voice synthesis with OpenAI</span>
          </div>
          <div className="flex items-center gap-3 text-white">
            <span className="text-[#415cff]">✓</span>
            <span>AI reactions and responses</span>
          </div>
          <div className="flex items-center gap-3 text-white">
            <span className="text-[#415cff]">✓</span>
            <span>Custom voice profiles and tones</span>
          </div>
          <div className="flex items-center gap-3 text-white">
            <span className="text-[#415cff]">✓</span>
            <span>Street slang and modern expressions</span>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-[rgba(20,26,53,0.8)] rounded-xl p-4 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-1">$9.99</div>
            <div className="text-[#6f79a7] text-sm">per month</div>
            <div className="text-[#8bd0ff] text-xs mt-1">or $99.99/year (save 17%)</div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-[rgba(20,26,53,0.8)] text-[#6f79a7] border border-[#243058] rounded-xl hover:bg-[rgba(24,32,65,0.9)] hover:border-[#415cff]/30 transition-all duration-200"
          >
            Maybe Later
          </button>
          <Link
            href="/checkout"
            className="flex-1 px-4 py-2 bg-gradient-to-r from-[#415cff] to-[#8bd0ff] hover:from-[#3648e6] hover:to-[#7bc5f0] text-white rounded-xl font-medium transition-all duration-200 text-center"
          >
            Upgrade Now
          </Link>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#6f79a7] hover:text-[#8bd0ff] transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
