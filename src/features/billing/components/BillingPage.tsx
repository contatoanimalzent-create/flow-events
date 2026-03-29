import { useMemo, useState } from 'react'
import { CalendarDays, Lock, Sparkles, Ticket } from 'lucide-react'
import { useAuthStore } from '@/features/auth'
import { useBillingActions, useBillingOverview, useSubscriptionPlans } from '@/features/billing/hooks'
import { formatLocaleCurrency, formatLocaleDate, formatLocaleNumber, useAppLocale } from '@/shared/i18n/app-locale'
import {
  AdminActionBar,
  AdminPageLayout,
  EmptyState,
  LoadingState,
  PageHeader,
  PremiumBadge,
  PremiumButton,
  PremiumCard,
  PremiumTable,
  SectionHeader,
  SurfacePanel,
} from '@/shared/components'
import { FeeConfigurationPanel } from './FeeConfigurationPanel'
import { RevenueDashboard } from './RevenueDashboard'
import { SubscriptionCard } from './SubscriptionCard'
import { translateBillingEventStatus, translateBillingFeature, translateBillingPlanName } from '../lib/billing-localization'

export function BillingPage() {
  const { locale, t } = useAppLocale()
  const organization = useAuthStore((state) => state.organization)
  const overviewQuery = useBillingOverview(organization?.id)
  const plansQuery = useSubscriptionPlans()
  const { updatePlan, updatingPlan } = useBillingActions()
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  const overview = overviewQuery.data
  const plans = plansQuery.data ?? []
  const selectedEventConfig = useMemo(
    () => overview?.eventFeeConfigurations.find((event) => event.eventId === (selectedEventId ?? overview.eventFeeConfigurations[0]?.eventId)),
    [overview, selectedEventId],
  )

  if (!organization?.id) {
    return (
      <AdminPageLayout>
        <EmptyState
          title={t('Monetization unavailable', 'Monetizacao indisponivel')}
          description={t(
            'Connect a profile linked to an organization to view plans, fees and platform revenue.',
            'Conecte um perfil com organizacao vinculada para visualizar planos, taxas e receita da plataforma.',
          )}
        />
      </AdminPageLayout>
    )
  }

  if (overviewQuery.isPending || plansQuery.isPending) {
    return (
      <AdminPageLayout>
        <LoadingState
          title={t('Loading monetization', 'Carregando monetizacao')}
          description={t(
            'We are consolidating plan, usage and revenue for this organization.',
            'Estamos consolidando plano, uso e receita para esta organizacao.',
          )}
        />
      </AdminPageLayout>
    )
  }

  if (!overview) {
    return (
      <AdminPageLayout>
        <EmptyState
          title={t('Unable to assemble the billing layer', 'Nao foi possivel montar a camada de faturamento')}
          description={t(
            'The organization did not return a valid monetization overview yet.',
            'A organizacao ainda nao retornou uma visao geral valida de monetizacao.',
          )}
        />
      </AdminPageLayout>
    )
  }

  return (
    <AdminPageLayout>
      <PageHeader
        eyebrow={t('Billing', 'Faturamento')}
        title={
          <>
            {t('Platform monetization', 'Monetizacao da plataforma')}
            <span className="admin-title-accent">.</span>
          </>
        }
        description={t(
          'Plans, limits, event fees and platform revenue now live in a single layer ready to scale as software.',
          'Planos, limites, taxas por evento e receita da plataforma agora vivem em uma camada unica, pronta para escalar como software.',
        )}
        actions={
          <AdminActionBar>
            <PremiumBadge tone="accent">
              {translateBillingPlanName(
                overview.organization.currentPlan.slug,
                overview.organization.currentPlan.name,
                locale,
              )}
            </PremiumBadge>
            <PremiumBadge tone="info">
              {t(
                `${overview.organization.activeFeatures.length} active features`,
                `${overview.organization.activeFeatures.length} recursos ativos`,
              )}
            </PremiumBadge>
          </AdminActionBar>
        }
      />

      <RevenueDashboard summary={overview.summary} series={overview.revenueSeries} />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)]">
        <PremiumCard className="p-6">
          <SectionHeader
            eyebrow={t('Usage', 'Uso')}
            title={t('Plan limits and operations', 'Limites e operacao do plano')}
            description={t(
              'The guardrails now follow the plan structure and make clear how much room is left before an upgrade.',
              'Os limites agora seguem a estrutura do plano e deixam claro quanto ainda cabe de operacao antes de um upgrade.',
            )}
          />

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <SurfacePanel className="p-5">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-text-muted">
                <CalendarDays className="h-3.5 w-3.5" />
                {t('Events', 'Eventos')}
              </div>
              <div className="mt-3 font-display text-[2.5rem] leading-none tracking-[-0.05em] text-text-primary">
                {formatLocaleNumber(overview.usage.eventCount, locale)}
              </div>
              <div className="mt-2 text-sm text-text-muted">
                {overview.usage.eventLimit == null
                  ? t('This plan has no practical event limit.', 'Este plano nao tem limite pratico de eventos.')
                  : t(
                      `${overview.usage.remainingEvents} remaining before the limit.`,
                      `${overview.usage.remainingEvents} restantes antes do limite.`,
                    )}
              </div>
            </SurfacePanel>

            <SurfacePanel className="p-5">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-text-muted">
                <Ticket className="h-3.5 w-3.5" />
                {t('Ticket types', 'Tipos de ingresso')}
              </div>
              <div className="mt-3 font-display text-[2.5rem] leading-none tracking-[-0.05em] text-text-primary">
                {formatLocaleNumber(overview.usage.ticketTypeCount, locale)}
              </div>
              <div className="mt-2 text-sm text-text-muted">
                {t(
                  `Current peak of ${overview.usage.maxTicketTypesPerEvent} types in the same event.`,
                  `Pico atual de ${overview.usage.maxTicketTypesPerEvent} tipos no mesmo evento.`,
                )}
              </div>
            </SurfacePanel>

            <SurfacePanel className="p-5">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-text-muted">
                <Sparkles className="h-3.5 w-3.5" />
                {t('Feature access', 'Acesso a recursos')}
              </div>
              <div className="mt-3 font-display text-[2.5rem] leading-none tracking-[-0.05em] text-text-primary">
                {formatLocaleNumber(overview.organization.activeFeatures.length, locale)}
              </div>
              <div className="mt-2 text-sm text-text-muted">
                {t(
                  'Premium capabilities enabled for purchase flow, analytics and automation.',
                  'Capacidades premium em operacao para compra, analises e automacao.',
                )}
              </div>
            </SurfacePanel>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {overview.organization.activeFeatures.map((feature) => (
              <PremiumBadge key={feature} tone="default">
                {translateBillingFeature(feature, locale)}
              </PremiumBadge>
            ))}
          </div>
        </PremiumCard>

        <PremiumCard className="p-6">
          <SectionHeader
            eyebrow={t('Fee strategy', 'Estrategia de taxas')}
            title={t('Event fee model', 'Modelo de taxa por evento')}
            description={t(
              'Each event can charge a fixed or percentage fee and decide whether the buyer sees it or the organization absorbs it.',
              'Cada evento pode cobrar taxa fixa ou percentual e decidir se o comprador ve essa taxa ou se a organizacao a absorve.',
            )}
          />

          {selectedEventConfig ? (
            <>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                {overview.eventFeeConfigurations.slice(0, 6).map((eventConfig) => (
                  <button
                    key={eventConfig.eventId}
                    type="button"
                    onClick={() => setSelectedEventId(eventConfig.eventId)}
                    className={`rounded-full border px-4 py-2 text-sm transition-all ${selectedEventId === eventConfig.eventId || (!selectedEventId && eventConfig.eventId === selectedEventConfig.eventId) ? 'border-brand-acid/35 bg-brand-acid/10 text-text-primary' : 'border-bg-border bg-white/70 text-text-muted hover:text-text-primary'}`}
                  >
                    {eventConfig.eventName}
                  </button>
                ))}
              </div>

              <div className="mt-5">
                <FeeConfigurationPanel
                  editable={false}
                  feeType={selectedEventConfig.feeType}
                  feeValue={selectedEventConfig.feeValue}
                  absorbFee={selectedEventConfig.absorbFee}
                  sampleQuantity={2}
                  sampleSubtotal={selectedEventConfig.feeType === 'fixed' ? 720 : 840}
                />
              </div>
            </>
          ) : (
            <div className="mt-6 rounded-[1.5rem] border border-dashed border-bg-border px-5 py-8 text-sm text-text-muted">
              {t(
                'As soon as events are configured, this area will show the fee strategy used in each experience.',
                'Assim que os eventos forem configurados, esta area passa a mostrar a estrategia de taxa usada em cada experiencia.',
              )}
            </div>
          )}
        </PremiumCard>
      </section>

      <section className="space-y-6">
        <SectionHeader
          eyebrow={t('Plans', 'Planos')}
          title={t('Producer plans', 'Planos de produtor')}
          description={t(
            'The subscription base is now structured in its own table, with limits and features already feeding the product.',
            'A base de assinatura agora esta estruturada em tabela propria, com limites e recursos que ja alimentam o produto.',
          )}
        />

        <div className="grid gap-4 xl:grid-cols-4">
          {plans.map((plan) => (
            <SubscriptionCard
              key={plan.id}
              plan={plan}
              current={plan.id === overview.organization.currentPlan.id}
              disabled={updatingPlan}
              onSelect={(planId) => void updatePlan({ organizationId: organization.id, planId })}
            />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeader
          eyebrow={t('Events', 'Eventos')}
          title={t('Fee configuration by event', 'Configuracao de taxas por evento')}
          description={t(
            'A single panel to quickly see who is passing the fee to the buyer and who is absorbing it in the payout.',
            'Um painel unico para ver rapidamente quem esta repassando taxa ao comprador e quem a absorve dentro do repasse.',
          )}
        />

        <PremiumCard className="p-3">
          <PremiumTable>
            <thead>
              <tr>
                <th>{t('Event', 'Evento')}</th>
                <th>{t('Start', 'Inicio')}</th>
                <th>{t('Status', 'Status')}</th>
                <th>{t('Model', 'Modelo')}</th>
                <th>{t('Fee', 'Taxa')}</th>
                <th>{t('Payout', 'Repasse')}</th>
                <th>{t('Sold', 'Vendidos')}</th>
              </tr>
            </thead>
            <tbody>
              {overview.eventFeeConfigurations.map((eventConfig) => (
                <tr key={eventConfig.eventId}>
                  <td className="font-medium text-text-primary">{eventConfig.eventName}</td>
                  <td>
                    {formatLocaleDate(eventConfig.startsAt, locale, {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </td>
                  <td>
                    <PremiumBadge tone={eventConfig.status === 'published' || eventConfig.status === 'ongoing' ? 'success' : 'default'}>
                      {translateBillingEventStatus(eventConfig.status, locale)}
                    </PremiumBadge>
                  </td>
                  <td>{eventConfig.feeType === 'fixed' ? t('Fixed per ticket', 'Fixa por ingresso') : t('Percentage', 'Percentual')}</td>
                  <td>{eventConfig.feeType === 'fixed' ? formatLocaleCurrency(eventConfig.feeValue, locale) : `${eventConfig.feeValue.toFixed(1)}%`}</td>
                  <td>
                    <PremiumBadge tone={eventConfig.absorbFee ? 'warning' : 'info'}>
                      {eventConfig.absorbFee ? t('Absorbed', 'Absorvida') : t('Passed on', 'Repassada')}
                    </PremiumBadge>
                  </td>
                  <td>{formatLocaleNumber(eventConfig.soldTickets, locale)}</td>
                </tr>
              ))}
            </tbody>
          </PremiumTable>
        </PremiumCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <PremiumCard className="p-6">
          <SectionHeader
            eyebrow={t('Feature flags', 'Controle de recursos')}
            title={t('Premium capabilities already controlled by plan', 'Recursos premium ja controlados por plano')}
            description={t(
              'The feature-flag foundation already allows premium capabilities to be enabled or blocked without changing the current app contracts.',
              'A fundacao de controle ja permite ativar ou bloquear recursos premium sem alterar os contratos atuais do app.',
            )}
          />
          <div className="mt-5 grid gap-3">
            {[
              { label: translateBillingFeature('premium_checkout', locale), enabled: overview.organization.activeFeatures.includes('premium_checkout') },
              { label: translateBillingFeature('advanced_analytics', locale), enabled: overview.organization.activeFeatures.includes('advanced_analytics') },
              { label: translateBillingFeature('white_label', locale), enabled: overview.organization.activeFeatures.includes('white_label') },
              { label: translateBillingFeature('api_access', locale), enabled: overview.organization.activeFeatures.includes('api_access') },
            ].map((feature) => (
              <SurfacePanel key={feature.label} className="flex items-center justify-between p-4">
                <div className="text-sm font-medium text-text-primary">{feature.label}</div>
                <PremiumBadge tone={feature.enabled ? 'success' : 'warning'}>
                  {feature.enabled ? t('Enabled', 'Liberado') : t('Premium', 'Premium')}
                </PremiumBadge>
              </SurfacePanel>
            ))}
          </div>
        </PremiumCard>

        <PremiumCard className="p-6">
          <SectionHeader
            eyebrow={t('Notes', 'Notas')}
            title={t('How this layer monetizes the product', 'Como essa camada monetiza o produto')}
            description={t(
              'This foundation was designed to charge per-event fees, generate recurring plan revenue and reflect that directly in the purchase flow and finance.',
              'Esta fundacao foi desenhada para cobrar taxa por evento, gerar receita recorrente por plano e refletir isso direto na compra e no financeiro.',
            )}
          />
          <div className="mt-5 space-y-4 text-sm leading-7 text-text-muted">
            <p>
              {t(
                'Orders now differentiate platform fee, buyer fee and producer-absorbed fee without changing the legacy `fee_amount` contract.',
                'Os pedidos agora diferenciam taxa da plataforma, taxa cobrada do comprador e taxa absorvida pelo organizador, sem alterar o contrato legado de `fee_amount`.',
              )}
            </p>
            <p>
              {t(
                'Event forms now decide whether the fee is percentage-based or fixed per ticket, and the purchase flow immediately reflects that behavior in the displayed total.',
                'Os formularios de evento agora decidem se a taxa e percentual ou fixa por ingresso, e a compra reflete imediatamente esse comportamento no total exibido.',
              )}
            </p>
            <p>
              {t(
                'Creation flows also consult plan limits before expanding the operation further, reducing silent overuse and preparing real upgrades.',
                'Os fluxos de criacao tambem consultam os limites do plano antes de abrir ainda mais a operacao, reduzindo sobreuso silencioso e preparando upgrades reais.',
              )}
            </p>
          </div>
          <div className="mt-6">
            <PremiumButton variant="secondary" className="gap-2" disabled>
              <Lock className="h-4 w-4" />
              {t('Upgrade automation in the next step', 'Automacao de upgrade na proxima etapa')}
            </PremiumButton>
          </div>
        </PremiumCard>
      </section>
    </AdminPageLayout>
  )
}
