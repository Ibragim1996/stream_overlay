// app/premium/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import PremiumClient from './PremiumClient';

export default function Page() {
  return <PremiumClient />;
}