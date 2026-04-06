export const shadowTokens = {
  soft: '0 1px 2px rgba(0, 0, 0, 0.05)',
  medium: '0 4px 8px rgba(0, 0, 0, 0.08)',
  strong: '0 12px 24px rgba(0, 0, 0, 0.12)',
  inset: 'inset 0 1px 0 rgba(255, 255, 255, 0.8)',
} as const

export type ShadowTokens = typeof shadowTokens
