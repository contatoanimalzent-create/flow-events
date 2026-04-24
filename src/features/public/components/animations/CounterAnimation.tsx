import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion'
import { useEffect, useRef } from 'react'
import { cn } from '@/shared/lib'

interface CounterAnimationProps {
  value: number
  suffix?: string
  /** Animation duration in seconds. Default 2 */
  duration?: number
  className?: string
}

export function CounterAnimation({
  value,
  suffix = '',
  duration = 2,
  className,
}: CounterAnimationProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' })

  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, {
    stiffness: 60,
    damping: 20,
    mass: 0.8,
  })

  const displayValue = useTransform(springValue, (latest) =>
    Math.round(latest).toLocaleString('pt-BR'),
  )

  useEffect(() => {
    if (isInView) {
      motionValue.set(value)
    }
  }, [isInView, motionValue, value, duration])

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      <motion.span>{displayValue}</motion.span>
      {suffix && <span>{suffix}</span>}
    </span>
  )
}
