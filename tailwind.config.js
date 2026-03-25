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
          secondary: '#c8c8c0',
          muted:     '#6b6b6b',
        },
        brand: {
          acid:   '#d4ff00',
          blue:   '#4BA3FF',
          purple: '#8B7CFF',
          teal:   '#5BE7C4',
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
        mono:    ['DM Mono', 'monospace'],
        display: ['Bebas Neue', 'sans-serif'],
        serif:   ['Cormorant Garamond', 'serif'],
      },
      borderRadius: { sm: '2px', xl: '12px', '2xl': '16px' },
      boxShadow: {
        card:         '0 1px 3px rgba(0,0,0,0.6)',
        'glow-acid':  '0 0 24px rgba(212,255,0,0.25)',
        'glow-teal':  '0 0 20px rgba(91,231,196,0.15)',
        'glow-blue':  '0 0 20px rgba(75,163,255,0.15)',
        'glow-error': '0 0 20px rgba(255,90,107,0.15)',
      },
      animation: {
        'fade-in':  'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'marquee':  'marquee 30s linear infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        marquee: { to: { transform: 'translateX(-50%)' } },
      },
      backgroundImage: { 'gradient-acid': 'linear-gradient(135deg, #d4ff00 0%, #a8cc00 100%)' },
    },
  },
  plugins: [],
}
