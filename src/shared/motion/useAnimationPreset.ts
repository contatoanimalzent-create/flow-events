import { useMemo } from 'react'
import { useReducedMotion, type Variants } from 'framer-motion'
import {
  fadeIn,
  scaleIn,
  slideUp,
  type AnimationPresetName,
  type AnimationPresetOptions,
} from './animation.presets'

interface UseAnimationPresetOptions extends Omit<AnimationPresetOptions, 'reducedMotion'> {
  once?: boolean
  amount?: number
}

export function useAnimationPreset(
  preset: AnimationPresetName = 'slideUp',
  options: UseAnimationPresetOptions = {},
) {
  const prefersReducedMotion = useReducedMotion()

  const variants = useMemo<Variants>(() => {
    const config = {
      ...options,
      reducedMotion: Boolean(prefersReducedMotion),
    }

    if (preset === 'fadeIn') {
      return fadeIn(config)
    }

    if (preset === 'scaleIn') {
      return scaleIn(config)
    }

    return slideUp(config)
  }, [options, prefersReducedMotion, preset])

  return {
    variants,
    initial: 'hidden' as const,
    animate: 'visible' as const,
    whileInView: 'visible' as const,
    viewport: {
      once: options.once ?? true,
      amount: options.amount ?? 0.2,
    },
    prefersReducedMotion: Boolean(prefersReducedMotion),
  }
}
