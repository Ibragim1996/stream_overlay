import { Suspense } from 'react';
import CancelPageContent from './CancelPageContent';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function CancelPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center p-5">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-6">⏳</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Loading...</h1>
          <p className="text-gray-600">Please wait while we process your request.</p>
        </div>
      </div>
    }>
      <CancelPageContent />
    </Suspense>
  );
}


