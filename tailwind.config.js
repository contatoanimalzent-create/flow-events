/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary:   '#080808',
          secondary: '#0e0e0e',
          card:      '#141414',
          surface:   '#1a1a1a',
          border:    '#242424',
        },
        text: {
          primary:   '#f5f5f0',
          secondary: '#9a9a9a',
          muted:     '#6b6b6b',
        },
        brand: {
          acid:   '#d4ff00',
          teal:   '#5BE7C4',
          blue:   '#4BA3FF',
          purple: '#8B7CFF',
        },
        status: {
          success: '#23C26B',
          warning: '#FFB020',
          error:   '#FF5A6B',
          info:    '#4BA3FF',
        },
      },
      fontFamily: {
        sans:    ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Bebas Neue', 'sans-serif'],
        mono:    ['DM Mono', 'monospace'],
      },
      borderRadius: {
        'xl':  '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'card':         '0 1px 3px rgba(0,0,0,0.6), 0 1px 2px rgba(0,0,0,0.4)',
        'glow-acid':    '0 0 30px rgba(212,255,0,0.2)',
        'glow-teal':    '0 0 20px rgba(91,231,196,0.15)',
        'glow-blue':    '0 0 20px rgba(75,163,255,0.15)',
        'glow-purple':  '0 0 20px rgba(139,124,255,0.15)',
      },
      backgroundImage: {
        'gradient-card':   'linear-gradient(135deg, #141414 0%, #0e0e0e 100%)',
        'gradient-acid':   'linear-gradient(135deg, #d4ff00 0%, #a8cc00 100%)',
        'gradient-teal':   'linear-gradient(135deg, #5BE7C4 0%, #4BA3FF 100%)',
        'gradient-hero':   'linear-gradient(180deg, #080808 0%, #0e0e0e 100%)',
      },
      animation: {
        'fade-in':       'fadeIn 0.2s ease-out',
        'slide-up':      'slideUp 0.35s cubic-bezier(0.16,1,0.3,1)',
        'slide-in':      'slideIn 0.35s cubic-bezier(0.16,1,0.3,1)',
        'pulse-slow':    'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'marquee':       'marquee 22s linear infinite',
        'orb-float':     'orbFloat 8s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:   { from: { opacity: '0' },                              to: { opacity: '1' } },
        slideUp:  { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideIn:  { from: { opacity: '0', transform: 'translateX(-10px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
        marquee:  { to: { transform: 'translateX(-50%)' } },
        orbFloat: { '0%,100%': { transform: 'translateY(0) scale(1)' }, '50%': { transform: 'translateY(-20px) scale(1.04)' } },
      },
    },
  },
  plugins: [],
}