import { Suspense } from 'react';
import AIReactionsOverlayContent from './AIReactionsOverlayContent';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function AIReactionsOverlay() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0b1020] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-2 border-[#415cff] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading AI Reactions Overlay...</p>
        </div>
      </div>
    }>
      <AIReactionsOverlayContent />
    </Suspense>
  );
}
