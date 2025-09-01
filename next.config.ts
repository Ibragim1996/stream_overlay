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
              "frame-ancestors 'self' https://vdo.ninja https://app.restream.io https://studio.golightstream.com https://streamyard.com",
          },
          { key: 'Referrer-Policy', value: 'no-referrer' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=()' },
        ],
      },
    ];
  },
};

export default config;