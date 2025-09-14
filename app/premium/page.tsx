// app/premium/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import PremiumClient from './PremiumClient';
import RequireAuth from '@/app/components/RequireAuth';

export default function Page() {
  return (
    <RequireAuth>
      <PremiumClient />
    </RequireAuth>
  );
}