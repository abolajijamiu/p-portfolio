import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Neutrals — primary UI language
        ink:     '#0a0a0a',
        muted:   '#6b7280',
        border:  '#e5e7eb',
        surface: '#f8f8f8',
        sidebar: '#0f0f0f',
        // Brand — used sparingly, never decoratively
        brand: {
          DEFAULT: '#1B3FC4',
          dim:     '#E6EBFA',
          deep:    '#122B8A',
        },
      },
      fontFamily: {
        sans:    ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}

export default config
