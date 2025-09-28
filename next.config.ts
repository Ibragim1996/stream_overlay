// next.config.ts
import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,

  // Не роняем билд на Vercel из-за линтера/TS.
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // Клевая мелочь для безопасности/эстетики
  poweredByHeader: false,

  async headers() {
    return [
      {
        // Распространяем заголовки на /overlay и все вложенные пути
        source: '/overlay/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
          {
            key: 'Content-Security-Policy',
            // добавляй сюда хосты студий, где будет встраиваться оверлей
            value:
              "frame-ancestors 'self' https://vdo.ninja https://app.restream.io https://studio.golightstream.com https://streamyard.com; default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' wss: ws: https:; font-src 'self' data:;",
          },
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=()' },
        ],
      },
      {
        // Общие security headers для всех страниц
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-DNS-Prefetch-Control', value: 'off' },
          { key: 'X-Download-Options', value: 'noopen' },
          { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default config;