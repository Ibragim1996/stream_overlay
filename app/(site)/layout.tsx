import Link from 'next/link';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="min-h-dvh flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </section>
  );
}

function Header() {
  return (
    <header className="py-5 flex items-center justify-between max-w-6xl mx-auto px-5">
      <Link href="/" className="flex items-center gap-3">
        <span className="inline-block h-8 w-8 rounded-xl bg-[#1e2a5d] border border-[#2a3a7a]" />
        <span className="text-lg font-semibold tracking-wide">Seeko</span>
      </Link>
      <nav className="flex items-center gap-4 text-sm opacity-90">
        <Link href="/faq" className="hover:opacity-100 opacity-80">FAQ</Link>
        <Link href="/help" className="hover:opacity-100 opacity-80">Help</Link>
        <Link href="/legal/privacy" className="hover:opacity-100 opacity-80">Privacy</Link>
        <Link href="/legal/terms" className="hover:opacity-100 opacity-80">Terms</Link>
      </nav>
    </header>
  );
}

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="py-10 text-xs opacity-60 text-center">
      © {year} Seeko. All rights reserved.
    </footer>
  );
}
