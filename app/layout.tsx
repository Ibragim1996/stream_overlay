// app/layout.tsx
import './globals.css';
import type { Metadata, Viewport } from 'next';
import type { ReactNode, JSX } from 'react';
import Link from 'next/link';
import { Inter, JetBrains_Mono } from 'next/font/google';

// Fonts as CSS variables (used in globals.css)
const fontSans = Inter({ subsets: ['latin'], variable: '--font-geist-sans', display: 'swap' });
const fontMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-geist-mono', display: 'swap' });

// Prefer public URL from env in production, fallback to localhost for dev
const appUrl =
  process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL.startsWith('http')
    ? process.env.NEXT_PUBLIC_APP_URL
    : 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: { default: 'Seeko', template: '%s • Seeko' },
  description: 'AI overlay for streamers.',
  applicationName: 'Seeko',
  keywords: ['Seeko', 'overlay', 'streaming', 'AI'],
  openGraph: {
    title: 'Seeko',
    description: 'AI overlay for streamers.',
    url: '/',
    siteName: 'Seeko',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Seeko',
    description: 'AI overlay for streamers.',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0b1020' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
};

// Simple site header
function Header(): JSX.Element {
  return (
    <header className="max-w-6xl mx-auto px-5 py-5 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-3">
        <span className="inline-grid h-8 w-8 place-items-center rounded-xl bg-[#1e2a5d] border border-[#2a3a7a] text-xs font-bold">
          AI
        </span>
        <span className="text-lg font-semibold tracking-wide">Seeko</span>
      </Link>

      <nav className="flex items-center gap-4 text-sm opacity-90">
        <Link href="/premium" className="hover:opacity-100 opacity-80 font-semibold text-indigo-400">
          Premium
        </Link>
        <Link href="/faq" className="hover:opacity-100 opacity-80">
          FAQ
        </Link>
        <Link href="/help" className="hover:opacity-100 opacity-80">
          Help
        </Link>
        <Link href="/legal/privacy" className="hover:opacity-100 opacity-80">
          Privacy
        </Link>
        <Link href="/legal/terms" className="hover:opacity-100 opacity-80">
          Terms
        </Link>
      </nav>
    </header>
  );
}

// Simple site footer
function Footer(): JSX.Element {
  const year = new Date().getFullYear();
  return (
    <footer className="max-w-6xl mx-auto px-5 py-10 text-xs opacity-60">
      © {year} Seeko. All rights reserved.
    </footer>
  );
}

export default function RootLayout({ children }: { children: ReactNode }): JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} bg-[#0b1020] text-[#e6e9f2] antialiased min-h-dvh`}
      >
        <Header />
        <main className="max-w-6xl mx-auto px-5 pb-14">{children}</main>
        <Footer />
      </body>
    </html>
  );
}