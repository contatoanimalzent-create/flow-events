import type { ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import { PremiumButton, PremiumCard, SectionHeader } from '@/shared/components'
import { cn } from '@/shared/lib'

interface PublicCTASectionProps {
  eyebrow?: string
  title: string
  description: string
  primaryCta: { label: string; href: string }
  secondaryCta?: { label: string; href: string }
  className?: string
  aside?: ReactNode
}

export function PublicCTASection({
  eyebrow,
  title,
  description,
  primaryCta,
  secondaryCta,
  className,
  aside,
}: PublicCTASectionProps) {
  return (
    <PremiumCard className={cn('grid gap-6 p-8 lg:grid-cols-[1fr_auto]', className)}>
      <div className="max-w-3xl">
        <SectionHeader eyebrow={eyebrow} title={title} description={description} />
      </div>
      <div className="flex flex-col items-start gap-3 lg:items-end">
        <a href={primaryCta.href}>
          <PremiumButton size="lg">
            {primaryCta.label}
            <ArrowRight className="h-4 w-4" />
          </PremiumButton>
        </a>
        {secondaryCta ? (
          <a href={secondaryCta.href}>
            <PremiumButton variant="secondary">{secondaryCta.label}</PremiumButton>
          </a>
        ) : null}
        {aside ? <div className="mt-3 text-sm text-text-muted">{aside}</div> : null}
      </div>
    </PremiumCard>
  )
}
