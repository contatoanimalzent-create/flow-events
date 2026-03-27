/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary:   '#05070a',
          secondary: '#0a0d12',
          card:      '#11141a',
          surface:   '#0b0e13',
          border:    '#232833',
          elevated:  '#171c25',
        },
        text: {
          primary:   '#f5f7fa',
          secondary: '#a9b0bc',
          muted:     '#6f7785',
        },
        brand: {
          acid:   '#ff2d2d',
          blue:   '#4f6784',
          purple: '#7e8798',
          teal:   '#8f99a8',
        },
        ink: {
          DEFAULT: '#05070a',
          50:  '#f5f7fa',
          100: '#d7dde6',
          200: '#aeb8c6',
          300: '#8792a3',
          400: '#5d6675',
          500: '#3a414d',
          600: '#21262f',
          700: '#161a21',
          800: '#0d1015',
          900: '#05070a',
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
        'glow-acid':      '0 12px 40px rgba(255,45,45,0.32)',
        'glow-teal':      '0 10px 34px rgba(143,153,168,0.14)',
        'glow-blue':      '0 10px 34px rgba(76,132,255,0.16)',
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
        'gradient-acid': 'linear-gradient(135deg, #ff2d2d 0%, #ff5a36 100%)',
        'gradient-ink':  'linear-gradient(160deg, #141922 0%, #0d1117 60%, #10141b 100%)',
        'gradient-noir': 'linear-gradient(160deg, #05070a 0%, #0a0d12 60%, #06080b 100%)',
      },
    },
  },
  plugins: [],
}
