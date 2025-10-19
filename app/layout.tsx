// app/layout.tsx
import './globals.css';
import type { Metadata, Viewport } from 'next';
import type { ReactNode, JSX } from 'react';
import { Inter, JetBrains_Mono } from 'next/font/google';
import Header from './components/Header';
import { getBaseUrl } from '@/lib/config';

// Fonts as CSS variables (used in globals.css)
const fontSans = Inter({ subsets: ['latin'], variable: '--font-geist-sans', display: 'swap' });
const fontMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-geist-mono', display: 'swap' });

// Use centralized base URL configuration
const appUrl = getBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: { default: 'Vibekip', template: '%s • Vibekip' },
  description: 'AI overlay for streamers.',
  applicationName: 'Vibekip',
  keywords: ['Vibekip', 'overlay', 'streaming', 'AI'],
  openGraph: {
    title: 'Vibekip',
    description: 'AI overlay for streamers.',
    url: '/',
    siteName: 'Vibekip',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vibekip',
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

// Header component is now imported from ./components/Header

// Simple site footer
function Footer(): JSX.Element {
  const year = new Date().getFullYear();
  return (
    <footer className="max-w-6xl mx-auto px-5 py-10 text-xs opacity-60">
      © {year} Vibekip. All rights reserved.
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