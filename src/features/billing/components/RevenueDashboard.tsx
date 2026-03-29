import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Banknote, Crown, Percent, Wallet } from 'lucide-react'
import { MetricCard, PremiumCard, SectionHeader } from '@/shared/components'
import { formatLocaleCurrency, useAppLocale } from '@/shared/i18n/app-locale'
import type { BillingRevenuePoint, BillingRevenueSummary } from '@/features/billing/types'

interface RevenueDashboardProps {
  summary: BillingRevenueSummary
  series: BillingRevenuePoint[]
}

export function RevenueDashboard({ summary, series }: RevenueDashboardProps) {
  const { locale, t } = useAppLocale()

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow={t('Revenue', 'Receita')}
        title={t('Platform revenue', 'Receita da plataforma')}
        description={t(
          'The monetization layer now combines operating fees, recurring plans and immediate take-rate visibility.',
          'A camada de monetizacao agora combina taxa operacional, recorrencia do plano e visibilidade imediata da taxa media.',
        )}
      />

      <div className="grid gap-4 xl:grid-cols-4">
        <MetricCard
          label={t('Total sold', 'Total vendido')}
          value={formatLocaleCurrency(summary.totalSold, locale)}
          helper={t('Orders with real revenue impact', 'Pedidos com impacto real em receita')}
          icon={<Wallet className="h-5 w-5" />}
        />
        <MetricCard
          label={t('Generated fees', 'Taxas geradas')}
          value={formatLocaleCurrency(summary.generatedFees, locale)}
          helper={t('Platform transaction fee', 'Taxa transacional da plataforma')}
          icon={<Percent className="h-5 w-5" />}
        />
        <MetricCard
          label={t('Platform revenue', 'Receita da plataforma')}
          value={formatLocaleCurrency(summary.platformRevenue, locale)}
          helper={t('Fee plus recurring plan revenue', 'Taxa mais receita recorrente do plano')}
          icon={<Banknote className="h-5 w-5" />}
        />
        <MetricCard
          label={t('Recurring plan', 'Plano recorrente')}
          value={summary.monthlySubscriptionRevenue > 0 ? formatLocaleCurrency(summary.monthlySubscriptionRevenue, locale) : t('Custom quote', 'Sob consulta')}
          helper={t(
            `${summary.activeEvents} active events | ${summary.absorbedEvents} with absorbed fee`,
            `${summary.activeEvents} eventos ativos | ${summary.absorbedEvents} com taxa absorvida`,
          )}
          icon={<Crown className="h-5 w-5" />}
          trend={t(
            `${summary.averageTakeRate.toFixed(1)}% take rate`,
            `${summary.averageTakeRate.toFixed(1)}% de taxa media`,
          )}
        />
      </div>

      <PremiumCard className="p-6">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.28em] text-text-muted">{t('Recent cycles', 'Ciclos recentes')}</div>
            <h3 className="mt-2 font-display text-4xl leading-none tracking-[-0.05em] text-text-primary">
              {t('Fees and revenue in motion.', 'Taxas e receita em movimento.')}
            </h3>
          </div>
        </div>

        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series}>
              <defs>
                <linearGradient id="billingRevenue" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#b48a5a" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#b48a5a" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="billingFees" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#76907b" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#76907b" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(127, 104, 77, 0.1)" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#7d6a55', fontSize: 12 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: '#7d6a55', fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => formatLocaleCurrency(Number(value), locale)}
                contentStyle={{
                  borderRadius: '20px',
                  border: '1px solid rgba(212, 196, 173, 0.6)',
                  background: 'rgba(255, 251, 245, 0.94)',
                  boxShadow: '0 18px 50px rgba(46, 34, 17, 0.08)',
                }}
              />
              <Area type="monotone" dataKey="platformRevenue" stroke="#1f1a15" strokeWidth={2.2} fill="url(#billingRevenue)" />
              <Area type="monotone" dataKey="fees" stroke="#76907b" strokeWidth={1.8} fill="url(#billingFees)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </PremiumCard>
    </div>
  )
}
