import type { ReactNode } from 'react'
import { cn } from '@/shared/lib'
import { PublicReveal } from './PublicReveal'

interface PremiumSectionProps {
  eyebrow?: string
  title?: string
  description?: string
  className?: string
  children?: ReactNode
  align?: 'left' | 'center'
}

export function PremiumSection({
  eyebrow,
  title,
  description,
  className,
  children,
  align = 'left',
}: PremiumSectionProps) {
  return (
    <section className={cn('px-5 py-16 md:px-10 lg:px-16 lg:py-24', className)}>
      <div className="mx-auto max-w-7xl">
        {eyebrow || title || description ? (
          <PublicReveal className={cn('mb-10 max-w-3xl', align === 'center' && 'mx-auto text-center')}>
            {eyebrow ? (
              <div className="mb-4 text-[11px] uppercase tracking-[0.32em] text-[#ae936f]">
                {eyebrow}
              </div>
            ) : null}
            {title ? (
              <h2 className="font-display text-[clamp(2.8rem,4.5vw,4.8rem)] font-semibold leading-[0.9] tracking-[-0.04em] text-[#f0ebe2]">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#9a9088] md:text-lg">
                {description}
              </p>
            ) : null}
          </PublicReveal>
        ) : null}

        {children}
      </div>
    </section>
  )
}
