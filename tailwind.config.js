/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        /* ── Pulse light theme ── */
        bg: {
          primary:   '#FFFFFF',
          secondary: '#F7F8FA',
          card:      '#FFFFFF',
          surface:   '#F7F8FA',
          border:    '#E5E7EB',
          elevated:  '#FFFFFF',
        },
        text: {
          primary:   '#0A0A0A',
          secondary: '#44475A',
          muted:     '#9CA3AF',
        },
        /* ── Brand ── */
        brand: {
          navy:   '#0057E7',
          blue:   '#0057E7',
          sky:    '#4285F4',
          acid:   '#0A1AFF',
          yellow: '#0057E7',   /* mapped to primary for consistency */
          teal:   '#4285F4',   /* mapped to primaryLight */
          purple: '#0057E7',
        },
        /* ── Ink scale (blue-based) ── */
        ink: {
          DEFAULT: '#0057E7',
          50:  '#EEF4FE',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#4285F4',
          600: '#0057E7',
          700: '#0047BD',
          800: '#003A99',
          900: '#002D75',
        },
        /* ── Status ── */
        status: {
          success: '#22C55E',
          warning: '#d97706',
          error:   '#EF4444',
          info:    '#0057E7',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['IBM Plex Mono', 'monospace'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        serif:   ['Inter', 'system-ui', 'sans-serif'],
        ui:      ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: { sm: '4px', md: '8px', lg: '16px', xl: '18px', '2xl': '24px' },
      boxShadow: {
        /* Pulse shadow system */
        soft:             '0 1px 2px rgba(0, 0, 0, 0.05)',
        medium:           '0 4px 8px rgba(0, 0, 0, 0.08)',
        strong:           '0 12px 24px rgba(0, 0, 0, 0.12)',
        card:             '0 1px 3px rgba(0, 0, 0, 0.06), 0 4px 12px rgba(0, 0, 0, 0.04)',
        'card-hover':     '0 4px 16px rgba(0, 0, 0, 0.10), 0 1px 4px rgba(0, 0, 0, 0.06)',
        'card-deep':      '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)',
        /* Glow effects */
        'glow-primary':   '0 8px 28px rgba(0, 87, 231, 0.22)',
        'glow-highlight': '0 8px 28px rgba(10, 26, 255, 0.18)',
        'glow-error':     '0 8px 28px rgba(239, 68, 68, 0.22)',
        'glow-success':   '0 8px 28px rgba(34, 197, 94, 0.22)',
        /* Legacy aliases */
        'glow-navy':      '0 8px 28px rgba(0, 87, 231, 0.22)',
        'glow-acid':      '0 8px 28px rgba(0, 87, 231, 0.22)',
        'glow-yellow':    '0 8px 28px rgba(0, 87, 231, 0.18)',
        'glow-sky':       '0 8px 28px rgba(66, 133, 244, 0.22)',
        'glow-teal':      '0 8px 28px rgba(66, 133, 244, 0.18)',
        'panel-navy':     '1px 0 0 #E5E7EB',
        'float-dark':     '0 32px 80px rgba(0, 0, 0, 0.18)',
        raised:           '0 1px 2px rgba(0, 0, 0, 0.05), 0 1px 0 rgba(255,255,255,0.9) inset',
        inset:            '0 2px 4px rgba(0, 0, 0, 0.06) inset',
        pressed:          '0 1px 3px rgba(0, 0, 0, 0.08) inset',
      },
      animation: {
        'fade-in':    'fadeIn 0.2s ease-out',
        'slide-up':   'slideUp 0.3s ease-out',
        'float-in':   'slideUp 0.52s cubic-bezier(0.16, 1, 0.3, 1)',
        'marquee':    'marquee 30s linear infinite',
        'orb-float':  'orbFloat 7s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2.4s ease-in-out infinite',
        'shimmer':    'shimmer 2s linear infinite',
        'press':      'press 0.12s ease-out',
        'hero-word':  'heroWord 0.7s cubic-bezier(0.16,1,0.3,1) both',
        'card-float': 'cardFloat 5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' },                      to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        marquee:   { to:   { transform: 'translateX(-50%)' } },
        orbFloat:  { '0%,100%': { transform: 'translateY(0) scale(1)', opacity: '0.7' }, '50%': { transform: 'translateY(-28px) scale(1.06)', opacity: '1' } },
        pulseGlow: { '0%,100%': { opacity: '0.4', transform: 'scale(0.97)' }, '50%': { opacity: '1', transform: 'scale(1.03)' } },
        shimmer:   { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
        press:     { '0%': { transform: 'scale(1)' }, '50%': { transform: 'scale(0.97)' }, '100%': { transform: 'scale(1)' } },
        heroWord:  { from: { opacity: '0', transform: 'translateY(60px) skewY(3deg)' }, to: { opacity: '1', transform: 'translateY(0) skewY(0deg)' } },
        cardFloat: { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-10px)' } },
      },
      backgroundImage: {
        'gradient-navy':  'linear-gradient(135deg, #0057E7 0%, #4285F4 100%)',
        'gradient-acid':  'linear-gradient(135deg, #0057E7 0%, #0A1AFF 100%)',
        'gradient-sky':   'linear-gradient(135deg, #0057E7 0%, #4285F4 100%)',
        'gradient-light': 'linear-gradient(180deg, #ffffff 0%, #F7F8FA 100%)',
        'gradient-card':  'linear-gradient(180deg, #ffffff 0%, #FAFBFC 100%)',
      },
    },
  },
  plugins: [],
}
