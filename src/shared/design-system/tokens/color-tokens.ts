export const colorTokens = {
  canvas: {
    primary: '#070607',
    secondary: '#0d0b0a',
    tertiary: '#12100f',
    elevated: '#1a1614',
  },
  neutral: {
    0: '#ebe7e0',
    50: '#d7cec4',
    100: '#c8beb3',
    200: '#b8b0a8',
    300: '#9b928b',
    400: '#7d746d',
    500: '#615a54',
    600: '#453f3b',
    700: '#2b2622',
    800: '#171412',
  },
  accent: {
    champagne: '#d62a0b',
    bronze: '#ae936f',
    sage: '#9ba1a6',
    slate: '#615a54',
    plum: '#d9bca0',
  },
  status: {
    success: '#40b778',
    warning: '#ffa43a',
    error: '#ff453a',
    info: '#4c84ff',
  },
} as const

export type ColorTokens = typeof colorTokens
