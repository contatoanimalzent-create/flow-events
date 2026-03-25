import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { cn } from '@/shared/lib'

interface PublicRevealProps {
  children: ReactNode
  className?: string
  delayMs?: number
}

export function PublicReveal({ children, className, delayMs = 0 }: PublicRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.12 },
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={cn('transition-all duration-700 ease-out', className)}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0px)' : 'translateY(22px)',
        transitionDelay: `${delayMs}ms`,
      }}
    >
      {children}
    </div>
  )
}
