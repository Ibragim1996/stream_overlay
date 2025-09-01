import type { Config } from 'tailwindcss';

export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      fontFamily: {
        sans: 'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
        mono: 'var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace',
      },
    },
  },
  plugins: [],
} satisfies Config;