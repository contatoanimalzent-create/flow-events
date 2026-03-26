import { spacingTokens } from '../tokens'

export const spacingSystem = {
  ...spacingTokens,
  pagePadding: {
    mobile: '1.25rem',
    tablet: '2.5rem',
    desktop: '4rem',
  },
  sectionGap: {
    public: spacingTokens.sectionRhythm.spacious,
    admin: spacingTokens.sectionRhythm.base,
  },
} as const

export type SpacingSystem = typeof spacingSystem
