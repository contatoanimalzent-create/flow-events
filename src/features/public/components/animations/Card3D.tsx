import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useRef, type ReactNode } from 'react'
import { cn } from '@/shared/lib'

interface Card3DProps {
  children: ReactNode
  className?: string
  /** Tilt intensity in degrees. Default 15 */
  intensity?: number
}

const SPRING_CONFIG = { stiffness: 300, damping: 30, mass: 0.5 }

export function Card3D({ children, className, intensity = 15 }: Card3DProps) {
  const ref = useRef<HTMLDivElement>(null)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [intensity, -intensity]), SPRING_CONFIG)
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-intensity, intensity]), SPRING_CONFIG)

  // Glare position mapped from mouse
  const glareX = useTransform(mouseX, [-0.5, 0.5], [0, 100])
  const glareY = useTransform(mouseY, [-0.5, 0.5], [0, 100])

  const glareBackground = useTransform(
    [glareX, glareY],
    ([x, y]) =>
      `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.18) 0%, transparent 65%)`,
  )

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5

    mouseX.set(x)
    mouseY.set(y)
  }

  const onMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
      className={cn('relative cursor-pointer', className)}
    >
      {children}

      {/* Glare overlay */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{ background: glareBackground, opacity: 0.7 }}
      />
    </motion.div>
  )
}
