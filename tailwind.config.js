/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary:   '#0a0908',
          secondary: '#131110',
          card:      '#1c1a16',
          surface:   '#0e0c0a',
          border:    '#2e2a22',
          elevated:  '#232018',
        },
        text: {
          primary:   '#f0ebe2',
          secondary: '#9a9088',
          muted:     '#6a6058',
        },
        brand: {
          acid:   '#c49a50',
          blue:   '#6a86ad',
          purple: '#9b8ab8',
          teal:   '#64897f',
        },
        ink: {
          DEFAULT: '#0a0908',
          50:  '#f0ebe2',
          100: '#e0d8cc',
          200: '#c4b49a',
          300: '#a49070',
          400: '#6e5c42',
          500: '#3a2f22',
          600: '#241e16',
          700: '#1c1610',
          800: '#14110c',
          900: '#0a0908',
        },
        status: {
          success: '#4a9b7f',
          warning: '#d4954a',
          error:   '#c45c6a',
          info:    '#6a86ad',
        },
      },
      fontFamily: {
        sans:    ['DM Sans', 'system-ui', 'sans-serif'],
        mono:    ['DM Mono', 'monospace'],
        display: ['Cormorant Garamond', 'serif'],
        serif:   ['Cormorant Garamond', 'serif'],
      },
      borderRadius: { sm: '14px', xl: '22px', '2xl': '30px' },
      boxShadow: {
        card:             '0 4px 24px rgba(0,0,0,0.44), inset 0 1px 0 rgba(255,255,255,0.05)',
        'card-deep':      '0 16px 56px rgba(0,0,0,0.58), inset 0 1px 0 rgba(255,255,255,0.06)',
        'card-dark':      '0 18px 50px rgba(0,0,0,0.52), inset 0 1px 0 rgba(255,255,255,0.06)',
        'card-dark-deep': '0 32px 80px rgba(0,0,0,0.66), inset 0 1px 0 rgba(255,255,255,0.08)',
        'glow-acid':      '0 8px 36px rgba(196,154,80,0.32)',
        'glow-teal':      '0 8px 32px rgba(100,137,127,0.18)',
        'glow-blue':      '0 8px 32px rgba(106,134,173,0.18)',
        'glow-error':     '0 8px 32px rgba(196,92,106,0.24)',
        'float-dark':     '0 40px 100px rgba(0,0,0,0.72)',
      },
      animation: {
        'fade-in':  'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'marquee':  'marquee 30s linear infinite',
        'float-in': 'slideUp 0.52s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        marquee: { to: { transform: 'translateX(-50%)' } },
      },
      backgroundImage: {
        'gradient-acid': 'linear-gradient(135deg, #c49a50 0%, #e0b96a 100%)',
        'gradient-ink':  'linear-gradient(160deg, #1c1610 0%, #14110c 60%, #1a1510 100%)',
        'gradient-noir': 'linear-gradient(160deg, #0a0908 0%, #0e0c0a 60%, #0c0b09 100%)',
      },
    },
  },
  plugins: [],
}
