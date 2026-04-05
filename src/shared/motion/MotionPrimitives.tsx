import { Children, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/shared/lib'
import type { AnimationPresetName } from './animation.presets'
import { motionDurations, motionStaggers } from './motion.tokens'
import { useAnimationPreset } from './useAnimationPreset'

interface MotionRevealProps {
  children: ReactNode
  className?: string
  delayMs?: number
  distance?: number
  once?: boolean
  preset?: AnimationPresetName
  amount?: number
}

export function MotionReveal({
  children,
  className,
  delayMs = 0,
  distance = 24,
  once = true,
  preset = 'slideUp',
  amount = 0.14,
}: MotionRevealProps) {
  const animation = useAnimationPreset(preset, {
    delayMs,
    distance,
    once,
    amount,
  })

  return (
    <motion.div
      className={cn('motion-reveal', className)}
      initial={animation.initial}
      whileInView={animation.whileInView}
      viewport={animation.viewport}
      variants={animation.variants}
    >
      {children}
    </motion.div>
  )
}

interface MotionStaggerProps {
  children: ReactNode
  className?: string
  stepMs?: number
  preset?: AnimationPresetName
}

export function MotionStagger({ children, className, stepMs = motionStaggers.base, preset = 'slideUp' }: MotionStaggerProps) {
  const childrenArray = Children.toArray(children)
  const itemAnimation = useAnimationPreset(preset, {
    durationMs: motionDurations.base,
    once: true,
    amount: 0.12,
  })

  return (
    <motion.div
      className={cn('motion-stagger', className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12 }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: stepMs / 1000,
          },
        },
      }}
    >
      {childrenArray.map((child, index) => (
        <motion.div
          key={index}
          variants={itemAnimation.variants}
          transition={{ delay: 0 }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

interface MotionPageProps {
  children: ReactNode
  className?: string
}

export function MotionPage({ children, className }: MotionPageProps) {
  const animation = useAnimationPreset('fadeIn', {
    durationMs: motionDurations.base,
  })

  return (
    <motion.div
      className={cn('motion-page', className)}
      initial={animation.initial}
      animate={animation.animate}
      variants={animation.variants}
    >
      {children}
    </motion.div>
  )
}
