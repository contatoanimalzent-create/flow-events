export const motionDurations = {
  instant: 120,
  fast: 180,
  base: 260,
  slow: 420,
  hero: 620,
} as const

export const motionEasing = {
  standard: 'cubic-bezier(0.22, 1, 0.36, 1)',
  productive: 'cubic-bezier(0.16, 1, 0.3, 1)',
  hover: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
} as const

export const motionStaggers = {
  tight: 60,
  base: 110,
  spacious: 160,
} as const

export type MotionDurations = typeof motionDurations
