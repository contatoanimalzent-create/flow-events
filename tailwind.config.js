/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        /* ── Admin light theme ── */
        bg: {
          primary:   '#06070a',
          secondary: '#0d1017',
          card:      '#12161f',
          surface:   '#181d27',
          border:    '#272d38',
          elevated:  '#1d2330',
        },
        text: {
          primary:   '#f5f0e8',
          secondary: '#b6ac9e',
          muted:     '#7c8495',
        },
        /* ── Brand ── */
        brand: {
          navy:   '#0d1118',
          blue:   '#31405f',
          sky:    '#7c94d8',
          acid:   '#5c1eb2',
          yellow: '#D4FF00',   /* acid yellow — editorial hero accent */
          teal:   '#ae936f',   /* warm gold accent */
          purple: '#d9bca0',
        },
        /* ── Ink scale (navy-based) ── */
        ink: {
          DEFAULT: '#0d1b35',
          50:  '#f0f4fa',
          100: '#dde6f4',
          200: '#b8cce8',
          300: '#8aadda',
          400: '#5d8ec8',
          500: '#3a6fb2',
          600: '#2a5694',
          700: '#1e3f75',
          800: '#142d56',
          900: '#0d1b35',
        },
        /* ── Status ── */
        status: {
          success: '#16a34a',
          warning: '#d97706',
          error:   '#dc2626',
          info:    '#2563eb',
        },
      },
      fontFamily: {
        sans:    ['Manrope', 'system-ui', 'sans-serif'],
        mono:    ['IBM Plex Mono', 'monospace'],
        display: ['Bebas Neue', 'Barlow Condensed', 'sans-serif'],
        serif:   ['Barlow Condensed', 'sans-serif'],
        ui:      ['Manrope', 'system-ui', 'sans-serif'],
      },
      borderRadius: { sm: '12px', xl: '18px', '2xl': '24px' },
      boxShadow: {
        /* Light theme card shadows */
        card:             '0 1px 3px rgba(15,23,42,0.08), 0 4px 12px rgba(15,23,42,0.05), inset 0 1px 0 rgba(255,255,255,0.9)',
        'card-hover':     '0 4px 16px rgba(15,23,42,0.12), 0 1px 4px rgba(15,23,42,0.06), inset 0 1px 0 rgba(255,255,255,1)',
        'card-deep':      '0 8px 32px rgba(15,23,42,0.14), 0 2px 8px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,1)',
        'card-navy':      '0 8px 32px rgba(13,27,53,0.18), 0 2px 8px rgba(13,27,53,0.12), inset 0 1px 0 rgba(255,255,255,0.06)',
        /* Skeuo raised/inset */
        'raised':         '0 1px 0 rgba(255,255,255,0.9) inset, 0 -1px 0 rgba(15,23,42,0.08) inset, 0 2px 8px rgba(15,23,42,0.12), 0 1px 2px rgba(15,23,42,0.08)',
        'inset':          '0 2px 6px rgba(15,23,42,0.1) inset, 0 1px 0 rgba(255,255,255,0.6) inset',
        'pressed':        '0 1px 3px rgba(15,23,42,0.15) inset, 0 -1px 0 rgba(255,255,255,0.4) inset',
        /* Glow effects */
        'glow-navy':      '0 8px 32px rgba(13,27,53,0.35)',
        'glow-acid':      '0 14px 38px rgba(92,30,178,0.34)',
        'glow-yellow':    '0 12px 36px rgba(199,155,68,0.24)',
        'glow-sky':       '0 8px 28px rgba(59,130,246,0.28)',
        'glow-teal':      '0 8px 28px rgba(174,147,111,0.22)',
        'glow-error':     '0 8px 28px rgba(220,38,38,0.28)',
        /* Dark navy panel (sidebar) */
        'panel-navy':     '4px 0 24px rgba(0,0,0,0.22), inset -1px 0 0 rgba(255,255,255,0.04)',
        'float-dark':     '0 32px 80px rgba(0,0,0,0.55)',
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
        'gradient-navy':  'linear-gradient(135deg, #0d1b35 0%, #142d56 100%)',
        'gradient-acid':  'linear-gradient(135deg, #4a1794 0%, #7a3ff0 100%)',
        'gradient-sky':   'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
        'gradient-light': 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        'gradient-card':  'linear-gradient(180deg, #ffffff 0%, #fafbfc 100%)',
        'carbon-fiber':   'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,255,255,0.012) 1px, rgba(255,255,255,0.012) 2px), repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(255,255,255,0.008) 1px, rgba(255,255,255,0.008) 2px)',
      },
    },
  },
  plugins: [],
}
