import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { cn } from '@/shared/lib'

interface MotionRevealProps {
  children: ReactNode
  className?: string
  delayMs?: number
  distance?: number
  once?: boolean
}

export function MotionReveal({
  children,
  className,
  delayMs = 0,
  distance = 24,
  once = true,
}: MotionRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          if (once) {
            observer.disconnect()
          }
        } else if (!once) {
          setVisible(false)
        }
      },
      { threshold: 0.14 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [once])

  return (
    <div
      ref={ref}
      className={cn('motion-reveal', className)}
      style={
        {
          '--motion-delay': `${delayMs}ms`,
          '--motion-distance': `${distance}px`,
          opacity: visible ? 1 : 0,
          transform: visible ? 'translate3d(0, 0, 0)' : `translate3d(0, ${distance}px, 0)`,
        } as CSSProperties
      }
    >
      {children}
    </div>
  )
}

interface MotionStaggerProps {
  children: ReactNode
  className?: string
  stepMs?: number
}

export function MotionStagger({ children, className, stepMs = 110 }: MotionStaggerProps) {
  return (
    <div className={cn('motion-stagger', className)} style={{ '--stagger-step': `${stepMs}ms` } as CSSProperties}>
      {children}
    </div>
  )
}

interface MotionPageProps {
  children: ReactNode
  className?: string
}

export function MotionPage({ children, className }: MotionPageProps) {
  return <div className={cn('motion-page', className)}>{children}</div>
}
