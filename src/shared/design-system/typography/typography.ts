export const typographyScale = {
  fontFamily: 'Inter, sans-serif',
  h1: '3.5rem',
  h2: '2.5rem',
  h3: '2rem',
  h4: '1.5rem',
  h5: '1.125rem',
  h6: '1rem',
  body: '1rem',
  caption: '0.875rem',
} as const

export type TypographyScale = typeof typographyScale
