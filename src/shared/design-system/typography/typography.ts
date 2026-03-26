export const typographyScale = {
  display: {
    hero: 'clamp(3.75rem, 7vw, 6.5rem)',
    page: 'clamp(2.75rem, 5vw, 4.5rem)',
    section: 'clamp(2rem, 3vw, 3rem)',
  },
  text: {
    bodyLg: '1.125rem',
    body: '1rem',
    bodySm: '0.9375rem',
    label: '0.75rem',
    helper: '0.75rem',
    table: '0.875rem',
    metric: 'clamp(2rem, 4vw, 3.5rem)',
  },
  tracking: {
    eyebrow: '0.28em',
    label: '0.22em',
    display: '-0.04em',
  },
  fontFamily: {
    display: "'Cormorant Garamond', serif",
    body: "'DM Sans', system-ui, sans-serif",
    mono: "'DM Mono', monospace",
  },
} as const

export type TypographyScale = typeof typographyScale
