/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Flow Events Design System
        bg: {
          primary:   '#0B1020',
          secondary: '#121A2F',
          card:      '#18233D',
          border:    '#263452',
        },
        text: {
          primary:   '#F7F9FC',
          secondary: '#AAB6D3',
          muted:     '#6B7A99',
        },
        brand: {
          teal:    '#5BE7C4',
          blue:    '#4BA3FF',
          purple:  '#8B7CFF',
        },
        status: {
          success: '#23C26B',
          warning: '#FFB020',
          error:   '#FF5A6B',
          info:    '#4BA3FF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl':  '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'card':   '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        'glow-teal':   '0 0 20px rgba(91,231,196,0.15)',
        'glow-blue':   '0 0 20px rgba(75,163,255,0.15)',
        'glow-purple': '0 0 20px rgba(139,124,255,0.15)',
      },
      backgroundImage: {
        'gradient-card': 'linear-gradient(135deg, #18233D 0%, #121A2F 100%)',
        'gradient-teal': 'linear-gradient(135deg, #5BE7C4 0%, #4BA3FF 100%)',
        'gradient-hero': 'linear-gradient(180deg, #0B1020 0%, #121A2F 100%)',
      },
      animation: {
        'fade-in':    'fadeIn 0.2s ease-out',
        'slide-up':   'slideUp 0.3s ease-out',
        'slide-in':   'slideIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideIn: { from: { opacity: '0', transform: 'translateX(-8px)' }, to: { opacity: '1', transform: 'translateX(0)' } },
      },
    },
  },
  plugins: [],
}
