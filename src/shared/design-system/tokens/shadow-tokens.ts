export const shadowTokens = {
  soft: '0 18px 46px rgba(63, 46, 26, 0.08)',
  medium: '0 20px 54px rgba(63, 46, 26, 0.12)',
  floating: '0 26px 80px rgba(50, 38, 20, 0.16)',
  glowChampagne: '0 18px 40px rgba(138, 115, 82, 0.16)',
  glowSage: '0 18px 40px rgba(109, 128, 118, 0.15)',
  insetLine: 'inset 0 1px 0 rgba(255, 255, 255, 0.65)',
} as const

export type ShadowTokens = typeof shadowTokens
