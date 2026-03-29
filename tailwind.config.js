/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary:   '#070607',
          secondary: '#0d0b0a',
          card:      '#12100f',
          surface:   '#0d0b0a',
          border:    '#2b2622',
          elevated:  '#1a1614',
        },
        text: {
          primary:   '#ebe7e0',
          secondary: '#b8b0a8',
          muted:     '#6f6660',
        },
        brand: {
          acid:   '#d62a0b',
          blue:   '#9ba1a6',
          purple: '#d9bca0',
          teal:   '#ae936f',
        },
        ink: {
          DEFAULT: '#070607',
          50:  '#ebe7e0',
          100: '#d7cec4',
          200: '#b8b0a8',
          300: '#9b928b',
          400: '#7d746d',
          500: '#615a54',
          600: '#453f3b',
          700: '#2b2622',
          800: '#171412',
          900: '#070607',
        },
        status: {
          success: '#40b778',
          warning: '#ffa43a',
          error:   '#ff453a',
          info:    '#4c84ff',
        },
      },
      fontFamily: {
        sans:    ['Manrope', 'system-ui', 'sans-serif'],
        mono:    ['IBM Plex Mono', 'monospace'],
        display: ['Barlow Condensed', 'sans-serif'],
        serif:   ['Barlow Condensed', 'sans-serif'],
      },
      borderRadius: { sm: '14px', xl: '22px', '2xl': '30px' },
      boxShadow: {
        card:             '0 18px 42px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.04)',
        'card-deep':      '0 28px 72px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.05)',
        'card-dark':      '0 24px 58px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.04)',
        'card-dark-deep': '0 36px 92px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
        'glow-acid':      '0 12px 40px rgba(214,42,11,0.24)',
        'glow-teal':      '0 10px 34px rgba(174,147,111,0.16)',
        'glow-blue':      '0 10px 34px rgba(155,161,166,0.16)',
        'glow-error':     '0 10px 34px rgba(255,69,58,0.22)',
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
        'gradient-acid': 'linear-gradient(135deg, #d62a0b 0%, #ae936f 100%)',
        'gradient-ink':  'linear-gradient(160deg, #171412 0%, #0d0b0a 60%, #12100f 100%)',
        'gradient-noir': 'linear-gradient(160deg, #070607 0%, #0d0b0a 60%, #090807 100%)',
      },
    },
  },
  plugins: [],
}
