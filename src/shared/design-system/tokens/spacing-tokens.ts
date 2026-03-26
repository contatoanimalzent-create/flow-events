export const spacingTokens = {
  compact: {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
  },
  relaxed: {
    xxs: 6,
    xs: 12,
    sm: 18,
    md: 24,
    lg: 32,
    xl: 48,
    '2xl': 64,
    '3xl': 88,
  },
  sectionRhythm: {
    tight: 48,
    base: 72,
    spacious: 104,
  },
  density: {
    tableRow: 56,
    formField: 48,
    cardInset: 24,
  },
} as const

export type SpacingTokens = typeof spacingTokens
