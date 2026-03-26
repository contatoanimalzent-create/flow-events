/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary:   '#f6f1e8',
          secondary: '#fbf8f2',
          card:      '#ffffff',
          surface:   '#f2ebe0',
          border:    '#e5dccf',
        },
        text: {
          primary:   '#211d18',
          secondary: '#5f564b',
          muted:     '#8d8377',
        },
        brand: {
          acid:   '#7d6d52',
          blue:   '#6a86ad',
          purple: '#8b7aa3',
          teal:   '#64897f',
        },
        status: {
          success: '#3f7c63',
          warning: '#b58445',
          error:   '#b85c67',
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
        card:         '0 18px 46px rgba(63, 46, 26, 0.08)',
        'glow-acid':  '0 18px 40px rgba(125, 109, 82, 0.16)',
        'glow-teal':  '0 18px 40px rgba(100, 137, 127, 0.14)',
        'glow-blue':  '0 18px 40px rgba(106, 134, 173, 0.14)',
        'glow-error': '0 18px 40px rgba(184, 92, 103, 0.16)',
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
      backgroundImage: { 'gradient-acid': 'linear-gradient(135deg, #7d6d52 0%, #9f9175 100%)' },
    },
  },
  plugins: [],
}
