'use client';

import { useEffect, useState } from 'react';

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const ok = localStorage.getItem('cookies_ok') === '1';
      setShow(!ok);
    } catch {}
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[9998]">
      <div className="mx-auto max-w-6xl m-4 rounded-xl border border-[#243058] bg-[#0b1020]/90 backdrop-blur p-4 text-sm text-[#e6e9f2] flex items-center gap-3">
        <span className="opacity-80">
          We use cookies to improve your experience. See our{' '}
          <a href="/legal/privacy" className="underline">Privacy Policy</a>.
        </span>
        <button
          className="ml-auto rounded-md border border-[#2a3a7a] bg-[#141a35] px-3 py-2 hover:bg-[#182041]"
          onClick={() => {
            try { localStorage.setItem('cookies_ok', '1'); } catch {}
            setShow(false);
          }}
        >
          Accept
        </button>
      </div>
    </div>
  );
}