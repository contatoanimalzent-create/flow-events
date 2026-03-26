export const colorTokens = {
  canvas: {
    primary: '#f6f1e8',
    secondary: '#fbf8f2',
    tertiary: '#efe6d7',
    elevated: '#fffdf9',
  },
  neutral: {
    0: '#ffffff',
    50: '#fcfaf6',
    100: '#f6f1e8',
    200: '#ece3d6',
    300: '#ddd1bf',
    400: '#c1b29a',
    500: '#8f7f68',
    600: '#5f5549',
    700: '#3a3026',
    800: '#211d18',
  },
  accent: {
    champagne: '#8a7352',
    bronze: '#a28a66',
    sage: '#6d8076',
    slate: '#7289a8',
    plum: '#867597',
  },
  status: {
    success: '#42705c',
    warning: '#b28952',
    error: '#b66065',
    info: '#6e87aa',
  },
} as const

export type ColorTokens = typeof colorTokens
