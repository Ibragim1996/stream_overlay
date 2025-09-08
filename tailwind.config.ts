// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx,js,jsx,md,mdx}',
    './components/**/*.{ts,tsx,js,jsx,md,mdx}',
    './pages/**/*.{ts,tsx,js,jsx,md,mdx}',
    './src/**/*.{ts,tsx,js,jsx,md,mdx}',
  ],
  theme: {
    container: { center: true, padding: '1.5rem', screens: { '2xl': '1400px' } },
    extend: {
      colors: { background: 'var(--background)', foreground: 'var(--foreground)' },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius, 0.75rem)',
        md: 'calc(var(--radius, 0.75rem) - 2px)',
        sm: 'calc(var(--radius, 0.75rem) - 4px)',
      },
    },
  },
  plugins: [],
} satisfies Config;