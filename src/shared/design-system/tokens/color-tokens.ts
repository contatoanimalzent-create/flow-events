export const colorTokens = {
  canvas: {
    primary: '#05070a',
    secondary: '#0a0d12',
    tertiary: '#11141a',
    elevated: '#171c25',
  },
  neutral: {
    0: '#f5f7fa',
    50: '#e5eaf1',
    100: '#d1d8e1',
    200: '#aeb8c6',
    300: '#8792a3',
    400: '#5d6675',
    500: '#3a414d',
    600: '#21262f',
    700: '#161a21',
    800: '#0d1015',
  },
  accent: {
    champagne: '#ff2d2d',
    bronze: '#ff5a36',
    sage: '#8f99a8',
    slate: '#4f6784',
    plum: '#7e8798',
  },
  status: {
    success: '#40b778',
    warning: '#ffa43a',
    error: '#ff453a',
    info: '#4c84ff',
  },
} as const

export type ColorTokens = typeof colorTokens
