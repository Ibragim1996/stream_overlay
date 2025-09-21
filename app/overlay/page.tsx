'use client';

import React, { Suspense } from 'react';
import OverlayView from './view';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function OverlayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0b1020] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-2 border-[#415cff] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading overlay...</p>
        </div>
      </div>
    }>
      <OverlayView />
    </Suspense>
  );
}
