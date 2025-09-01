/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // чтобы сборка не падала из-за eslint (у тебя много предупреждений)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // заголовки только для overlay (если добавляешь как Browser Source в OBS/Streamlabs)
  async headers() {
    const overlayHeaders = [
      // для встраивания через iframe (если когда-нибудь понадобится) — разрешаем всем
      // при желании сузим список доменов: "frame-ancestors 'self' https://dashboard.twitch.tv https://studio.youtube.com"
      { key: 'Content-Security-Policy', value: "frame-ancestors *" },
      { key: 'Referrer-Policy', value: 'no-referrer' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=()' },
      // X-Frame-Options намеренно НЕ ставим — ALLOWALL не существует
    ];

    return [
      { source: '/overlay', headers: overlayHeaders },
      { source: '/overlay/:path*', headers: overlayHeaders },
    ];
  },

  // опционально: удобнее деплоить
  // output: 'standalone',
  poweredByHeader: false,
};

module.exports = nextConfig;