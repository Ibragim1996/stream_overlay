'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const item = (active: boolean) =>
  `block rounded-lg px-3 py-2 text-sm ${
    active ? 'bg-[#141a35] text-white' : 'opacity-80 hover:opacity-100'
  }`;

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside className="w-56 shrink-0">
      <div className="space-y-1">
        <Link href="/site" className={item(path === '/site')}>Home</Link>
        <Link href="/overlay" className={item(path?.startsWith('/overlay') ?? false)}>Overlay</Link>
        <Link href="/account" className={item(path?.startsWith('/account') ?? false)}>Account</Link>
        <Link href="/legal/privacy" className={item(path === '/legal/privacy')}>Privacy</Link>
        <Link href="/legal/terms" className={item(path === '/legal/terms')}>Terms</Link>
      </div>
    </aside>
  );
}