/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Netflix-Black Design System
        netflix: {
          black:   '#0A0A0A',   // deepest background
          dark:    '#141414',   // card / surface
          grey:    '#1F1F1F',   // input / elevated surface
          mid:     '#2A2A2A',   // border / divider
          muted:   '#808080',   // secondary text
          red:     '#E50914',   // Netflix red — primary CTA
          'red-hover': '#F40612',
          gold:    '#E8B84B',   // rating / highlight
          'gold-light': '#F5CF72',
        },
      },
      fontFamily: {
        sans:  ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Georgia', 'Times New Roman', 'serif'],
      },
      boxShadow: {
        'netflix-red':  '0 0 24px rgba(229, 9, 20, 0.35)',
        'netflix-gold': '0 0 16px rgba(232, 184, 75, 0.3)',
        'card':         '0 8px 32px rgba(0,0,0,0.7)',
      },
      animation: {
        'glow-red':   'glow-red 2.5s ease-in-out infinite',
        'fade-up':    'fade-up 0.5s ease-out forwards',
        'shimmer':    'shimmer 2s ease-in-out infinite',
      },
      keyframes: {
        'glow-red': {
          '0%, 100%': { 'box-shadow': '0 0 12px rgba(229, 9, 20, 0.2)' },
          '50%':      { 'box-shadow': '0 0 28px rgba(229, 9, 20, 0.5)' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'shimmer': {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
}
