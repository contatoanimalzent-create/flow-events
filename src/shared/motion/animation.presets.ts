import type { TargetAndTransition, Transition, Variants } from 'framer-motion'
import { motionDurations } from './motion.tokens'

export type AnimationPresetName = 'fadeIn' | 'slideUp' | 'scaleIn'

export interface AnimationPresetOptions {
  delayMs?: number
  durationMs?: number
  distance?: number
  reducedMotion?: boolean
}

function createTransition({
  delayMs = 0,
  durationMs = motionDurations.slow,
}: Pick<AnimationPresetOptions, 'delayMs' | 'durationMs'>): Transition {
  return {
    delay: delayMs / 1000,
    duration: durationMs / 1000,
    ease: [0.16, 1, 0.3, 1],
  }
}

function createVisibleState(transition: Transition): TargetAndTransition {
  return {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition,
  }
}

export function fadeIn(options: AnimationPresetOptions = {}): Variants {
  const transition = createTransition(options)

  return {
    hidden: {
      opacity: 0,
      filter: options.reducedMotion ? 'blur(0px)' : 'blur(1px)',
    },
    visible: createVisibleState(transition),
  }
}

export function slideUp(options: AnimationPresetOptions = {}): Variants {
  const transition = createTransition(options)
  const distance = options.reducedMotion ? 0 : options.distance ?? 24

  return {
    hidden: {
      opacity: 0,
      y: distance,
      filter: options.reducedMotion ? 'blur(0px)' : 'blur(2px)',
    },
    visible: createVisibleState(transition),
  }
}

export function scaleIn(options: AnimationPresetOptions = {}): Variants {
  const transition = createTransition(options)

  return {
    hidden: {
      opacity: 0,
      scale: options.reducedMotion ? 1 : 0.96,
      y: options.reducedMotion ? 0 : 12,
      filter: options.reducedMotion ? 'blur(0px)' : 'blur(1px)',
    },
    visible: createVisibleState(transition),
  }
}
