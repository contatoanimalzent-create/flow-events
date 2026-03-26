import { Check, Crown } from 'lucide-react'
import { PremiumBadge, PremiumButton, PremiumCard } from '@/shared/components'
import { cn, formatCurrency } from '@/shared/lib'
import type { BillingSubscriptionPlan } from '@/features/billing/types'

interface SubscriptionCardProps {
  plan: BillingSubscriptionPlan
  current?: boolean
  disabled?: boolean
  onSelect?: (planId: string) => void
}

export function SubscriptionCard({ plan, current = false, disabled = false, onSelect }: SubscriptionCardProps) {
  return (
    <PremiumCard className={cn('h-full p-6', current && 'border-brand-acid/35 bg-[linear-gradient(180deg,rgba(255,250,240,0.92),rgba(249,241,226,0.88))]')}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-text-muted">Plano</div>
          <div className="mt-3 font-display text-4xl leading-none tracking-[-0.05em] text-text-primary">{plan.name}</div>
          <p className="mt-3 max-w-sm text-sm leading-6 text-text-muted">{plan.description}</p>
        </div>
        {current ? <PremiumBadge tone="accent">Ativo</PremiumBadge> : <PremiumBadge tone="info">Disponivel</PremiumBadge>}
      </div>

      <div className="mt-6 flex items-end gap-2">
        <div className="font-display text-[2.9rem] leading-none tracking-[-0.05em] text-text-primary">
          {plan.price > 0 ? formatCurrency(plan.price) : 'Custom'}
        </div>
        <div className="pb-1 text-sm text-text-muted">
          {plan.billingCycle === 'monthly' ? '/mes' : plan.billingCycle === 'annual' ? '/ano' : 'sob consulta'}
        </div>
      </div>

      <div className="mt-6 grid gap-3 rounded-[1.5rem] border border-bg-border bg-white/65 p-4 text-sm text-text-muted md:grid-cols-2">
        <div>
          <div className="text-[11px] uppercase tracking-[0.24em] text-text-muted">Eventos</div>
          <div className="mt-2 text-base font-medium text-text-primary">
            {plan.limits.events == null ? 'Ilimitados' : `${plan.limits.events} ativos`}
          </div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-[0.24em] text-text-muted">Tickets por evento</div>
          <div className="mt-2 text-base font-medium text-text-primary">
            {plan.limits.ticketsPerEvent == null ? 'Ilimitados' : `${plan.limits.ticketsPerEvent} tipos`}
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-2.5">
        {plan.features.map((feature) => (
          <div key={feature} className="flex items-center gap-2 text-sm text-text-primary">
            <Check className="h-4 w-4 text-brand-acid" />
            <span className="capitalize">{feature.replace(/_/g, ' ')}</span>
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
          {current ? 'Plano atual' : 'Ativar plano'}
        </PremiumButton>
      </div>
    </PremiumCard>
  )
}
