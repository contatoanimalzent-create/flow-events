export const shadowTokens = {
  soft: '0 8px 24px rgba(10, 26, 255, 0.08)',
  medium: '0 16px 40px rgba(10, 26, 255, 0.12)',
  strong: '0 24px 64px rgba(10, 26, 255, 0.16)',
  inset: 'inset 0 1px 0 rgba(255, 255, 255, 0.8)',
} as const

export type ShadowTokens = typeof shadowTokens
