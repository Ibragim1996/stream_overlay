// postcss.config.mjs
/** @type {import('postcss-load-config').Config} */
const config = {
  // ВАЖНО: порядок плагинов сохраняем
  plugins: {
    // Tailwind v4 использует отдельный плагин:
    '@tailwindcss/postcss': {},
    // Автопрефиксы для браузеров:
    autoprefixer: {}
  }
};

export default config;