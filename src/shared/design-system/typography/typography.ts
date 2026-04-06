export const typographyScale = {
  fontFamily: 'Inter, sans-serif',
  h1: '3rem',
  h2: '2.25rem',
  h3: '1.5rem',
  h4: '1.25rem',
  h5: '1rem',
  h6: '0.875rem',
  body: '1rem',
  caption: '0.875rem',
} as const

export type TypographyScale = typeof typographyScale
