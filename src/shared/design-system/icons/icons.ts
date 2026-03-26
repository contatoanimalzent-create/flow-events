export const iconSystem = {
  size: {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
  },
  strokeWidth: {
    soft: 1.6,
    base: 1.85,
    strong: 2.1,
  },
} as const

export type IconSystem = typeof iconSystem
