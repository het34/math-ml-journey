import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono:    ['var(--font-mono)', 'monospace'],
        sans:    ['var(--font-sans)', 'sans-serif'],
      },
      colors: {
        bg:      '#0D0D10',
        surface: '#16161A',
        border:  '#2A2A35',
        accent:  '#7C6AF7',
        'accent-dim': '#4A3FBF',
        text:    '#E8E8F0',
        muted:   '#6B6B80',
        code:    '#F0A05A',
        success: '#4ADE80',
      },
      animation: {
        'fade-in':       'fadeIn 0.4s ease forwards',
        'slide-up':      'slideUp 0.4s ease forwards',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}

export default config
