import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef, type ReactNode } from 'react'
import { cn } from '@/shared/lib'

interface ParallaxSectionProps {
  children: ReactNode
  /** Movement intensity — 0.1 (subtle) to 0.5 (strong). Default 0.3 */
  speed?: number
  className?: string
}

export function ParallaxSection({ children, speed = 0.3, className }: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  // Map scroll progress [0→1] to translateY range based on speed
  // Negative direction: content rises slightly as you scroll down (classic parallax)
  const yRange = 200 * speed
  const y = useTransform(scrollYProgress, [0, 1], [yRange, -yRange])

  return (
    <div ref={ref} className={cn('relative overflow-hidden', className)}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  )
}
