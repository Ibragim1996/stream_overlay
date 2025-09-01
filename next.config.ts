import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/overlay",
        headers: [
          { key: "X-Frame-Options", value: "ALLOWALL" },
          {
            key: "Content-Security-Policy",
            // добавляй сюда хосты студий, где будешь встраивать
            value:
              "frame-ancestors 'self' https://vdo.ninja https://app.restream.io https://studio.golightstream.com https://streamyard.com",
          },
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "Permissions-Policy", value: "camera=(), microphone=()" },
        ],
      },
    ];
  },
};
export default config;