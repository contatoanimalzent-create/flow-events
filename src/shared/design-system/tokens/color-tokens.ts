export const colorTokens = {
  primary: '#0057E7',
  primaryLight: '#4285F4',
  primarySoft: '#4285F4',
  background: '#0A0A0A',
  surface: '#111111',
  textPrimary: 'rgba(255,255,255,0.92)',
  textSecondary: 'rgba(255,255,255,0.60)',
  border: 'rgba(255,255,255,0.10)',
} as const

export type ColorTokens = typeof colorTokens
