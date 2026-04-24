import { Check, Crown } from 'lucide-react'
import { PremiumBadge, PremiumButton, PremiumCard } from '@/shared/components'
import { cn } from '@/shared/lib'
import { formatLocaleCurrency, useAppLocale } from '@/shared/i18n/app-locale'
import type { BillingSubscriptionPlan } from '@/features/billing/types'
import {
  translateBillingFeature,
  translateBillingPlanDescription,
  translateBillingPlanName,
} from '../lib/billing-localization'

interface SubscriptionCardProps {
  plan: BillingSubscriptionPlan
  current?: boolean
  disabled?: boolean
  onSelect?: (planId: string) => void
}

export function SubscriptionCard({ plan, current = false, disabled = false, onSelect }: SubscriptionCardProps) {
  const { locale, t } = useAppLocale()
  const planName = translateBillingPlanName(plan.slug, plan.name, locale)
  const planDescription = translateBillingPlanDescription(plan.slug, plan.description, locale)

  return (
    <PremiumCard className={cn('h-full p-6', current && 'border-brand-acid/35 bg-[linear-gradient(180deg,rgba(255,250,240,0.92),rgba(249,241,226,0.88))]')}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-text-muted">{t('Plan', 'Plano')}</div>
          <div className="mt-3 font-display text-4xl leading-none tracking-[-0.05em] text-text-primary">{planName}</div>
          <p className="mt-3 max-w-sm text-sm leading-6 text-text-muted">{planDescription}</p>
        </div>
        {current ? <PremiumBadge tone="accent">{t('Active', 'Ativo')}</PremiumBadge> : <PremiumBadge tone="info">{t('Available', 'Disponível')}</PremiumBadge>}
      </div>

      <div className="mt-6 flex items-end gap-2">
        <div className="font-display text-[2.9rem] leading-none tracking-[-0.05em] text-text-primary">
          {plan.price > 0 ? formatLocaleCurrency(plan.price, locale) : t('Custom quote', 'Sob consulta')}
        </div>
        <div className="pb-1 text-sm text-text-muted">
          {plan.billingCycle === 'monthly' ? t('/month', '/mes') : plan.billingCycle === 'annual' ? t('/year', '/ano') : t('on request', 'sob consulta')}
        </div>
      </div>

      <div className="mt-6 grid gap-3 rounded-[1.5rem] border border-bg-border bg-white/65 p-4 text-sm text-text-muted md:grid-cols-2">
        <div>
          <div className="text-[11px] uppercase tracking-[0.24em] text-text-muted">{t('Events', 'Eventos')}</div>
          <div className="mt-2 text-base font-medium text-text-primary">
            {plan.limits.events == null ? t('Unlimited', 'Ilimitados') : t(`${plan.limits.events} active`, `${plan.limits.events} ativos`)}
          </div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-[0.24em] text-text-muted">{t('Ticket types per event', 'Tipos de ingresso por evento')}</div>
          <div className="mt-2 text-base font-medium text-text-primary">
            {plan.limits.ticketsPerEvent == null ? t('Unlimited', 'Ilimitados') : t(`${plan.limits.ticketsPerEvent} types`, `${plan.limits.ticketsPerEvent} tipos`)}
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-2.5">
        {plan.features.map((feature) => (
          <div key={feature} className="flex items-center gap-2 text-sm text-text-primary">
            <Check className="h-4 w-4 text-brand-acid" />
            <span>{translateBillingFeature(feature, locale)}</span>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <PremiumButton
          variant={current ? 'secondary' : 'primary'}
          className="w-full justify-center gap-2"
          disabled={disabled || current}
          onClick={() => onSelect?.(plan.id)}
        >
          {current ? <Crown className="h-4 w-4" /> : null}
          {current ? t('Current plan', 'Plano atual') : t('Activate plan', 'Ativar plano')}
        </PremiumButton>
      </div>
    </PremiumCard>
  )
}
