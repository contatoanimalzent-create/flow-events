import type { ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import { MediaFrame, PremiumButton, PremiumCard } from '@/shared/components'
import { cn } from '@/shared/lib'
import { PublicReveal } from './PublicReveal'

interface PublicHeroProps {
  eyebrow: string
  title: string
  description: string
  media?: ReactNode
  primaryCta?: { label: string; href: string }
  secondaryCta?: { label: string; href: string }
  className?: string
}

export function PublicHero({ eyebrow, title, description, media, primaryCta, secondaryCta, className }: PublicHeroProps) {
  return (
    <section className={cn('px-5 pb-20 pt-12 md:px-10 lg:px-16 lg:pb-28 lg:pt-16', className)}>
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
        <PublicReveal>
          <div className="max-w-3xl">
            <div className="page-eyebrow">{eyebrow}</div>
            <h1 className="mt-4 font-display text-[clamp(3.75rem,7vw,6.5rem)] leading-[0.92] tracking-[-0.04em] text-text-primary">
              {title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-text-secondary">{description}</p>
            {primaryCta || secondaryCta ? (
              <div className="mt-8 flex flex-wrap gap-3">
                {primaryCta ? (
                  <a href={primaryCta.href}>
                    <PremiumButton size="lg">
                      {primaryCta.label}
                      <ArrowRight className="h-4 w-4" />
                    </PremiumButton>
                  </a>
                ) : null}
                {secondaryCta ? (
                  <a href={secondaryCta.href}>
                    <PremiumButton variant="secondary" size="lg">
                      {secondaryCta.label}
                    </PremiumButton>
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
        </PublicReveal>

        <PublicReveal delayMs={120}>
          <PremiumCard className="overflow-hidden p-3">
            <MediaFrame ratio="cinema">
              {media ?? <div className="h-full w-full bg-[radial-gradient(circle_at_top,#efe3d0,transparent_40%),linear-gradient(135deg,#e9dcc7_0%,#f7f2e8_55%,#e9e1d5_100%)]" />}
            </MediaFrame>
          </PremiumCard>
        </PublicReveal>
      </div>
    </section>
  )
}
