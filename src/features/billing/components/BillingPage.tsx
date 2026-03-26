import { useMemo, useState } from 'react'
import { CalendarDays, Lock, Sparkles, Ticket } from 'lucide-react'
import { useAuthStore } from '@/features/auth'
import { useBillingActions, useBillingOverview, useSubscriptionPlans } from '@/features/billing/hooks'
import { formatCurrency, formatDate } from '@/shared/lib'
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

export function BillingPage() {
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
          title="Monetizacao indisponivel"
          description="Conecte um perfil com organizacao vinculada para visualizar planos, fees e receita da plataforma."
        />
      </AdminPageLayout>
    )
  }

  if (overviewQuery.isPending || plansQuery.isPending) {
    return (
      <AdminPageLayout>
        <LoadingState title="Carregando monetizacao" description="Estamos consolidando plano, uso e receita para esta organizacao." />
      </AdminPageLayout>
    )
  }

  if (!overview) {
    return (
      <AdminPageLayout>
        <EmptyState
          title="Nao foi possivel montar a camada de billing"
          description="A organizacao ainda nao retornou um overview valido de monetizacao."
        />
      </AdminPageLayout>
    )
  }

  return (
    <AdminPageLayout>
      <PageHeader
        eyebrow="Billing"
        title={<>Monetizacao da plataforma<span className="admin-title-accent">.</span></>}
        description="Planos, limites, fee por evento e receita da plataforma agora vivem em uma camada unica, pronta para escalar como SaaS."
        actions={
          <AdminActionBar>
            <PremiumBadge tone="accent">{overview.organization.currentPlan.name}</PremiumBadge>
            <PremiumBadge tone="info">{overview.organization.activeFeatures.length} features ativas</PremiumBadge>
          </AdminActionBar>
        }
      />

      <RevenueDashboard summary={overview.summary} series={overview.revenueSeries} />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)]">
        <PremiumCard className="p-6">
          <SectionHeader
            eyebrow="Usage"
            title="Limites e operacao do plano"
            description="Os bloqueios agora seguem a estrutura do plano e deixam claro quanto ainda cabe de operacao antes de um upgrade."
          />

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <SurfacePanel className="p-5">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-text-muted">
                <CalendarDays className="h-3.5 w-3.5" />
                Eventos
              </div>
              <div className="mt-3 font-display text-[2.5rem] leading-none tracking-[-0.05em] text-text-primary">{overview.usage.eventCount}</div>
              <div className="mt-2 text-sm text-text-muted">
                {overview.usage.eventLimit == null ? 'Plano sem limite pratico de eventos.' : `${overview.usage.remainingEvents} restantes antes do limite.`}
              </div>
            </SurfacePanel>

            <SurfacePanel className="p-5">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-text-muted">
                <Ticket className="h-3.5 w-3.5" />
                Tipos de ingresso
              </div>
              <div className="mt-3 font-display text-[2.5rem] leading-none tracking-[-0.05em] text-text-primary">{overview.usage.ticketTypeCount}</div>
              <div className="mt-2 text-sm text-text-muted">
                Pico atual de {overview.usage.maxTicketTypesPerEvent} tipos no mesmo evento.
              </div>
            </SurfacePanel>

            <SurfacePanel className="p-5">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-text-muted">
                <Sparkles className="h-3.5 w-3.5" />
                Feature access
              </div>
              <div className="mt-3 font-display text-[2.5rem] leading-none tracking-[-0.05em] text-text-primary">{overview.organization.activeFeatures.length}</div>
              <div className="mt-2 text-sm text-text-muted">Capacidades premium em operacao para checkout, analytics e automacao.</div>
            </SurfacePanel>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {overview.organization.activeFeatures.map((feature) => (
              <PremiumBadge key={feature} tone="default">{feature.replace(/_/g, ' ')}</PremiumBadge>
            ))}
          </div>
        </PremiumCard>

        <PremiumCard className="p-6">
          <SectionHeader
            eyebrow="Fee Strategy"
            title="Modelo de fee por evento"
            description="Cada evento pode cobrar taxa fixa ou percentual e decidir se o comprador ve essa taxa ou se a organizacao a absorve."
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
              Assim que os eventos forem configurados, esta area passa a mostrar a estrategia de taxa usada em cada experiencia.
            </div>
          )}
        </PremiumCard>
      </section>

      <section className="space-y-6">
        <SectionHeader
          eyebrow="Plans"
          title="Planos de produtor"
          description="A base de assinatura agora esta estruturada em tabela propria, com limites e features que ja alimentam o produto."
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
          eyebrow="Events"
          title="Configuracao de fees por evento"
          description="Um painel unico para ver rapidamente quem esta repassando taxa ao comprador e quem absorve a fee dentro do repasse."
        />

        <PremiumCard className="p-3">
          <PremiumTable>
            <thead>
              <tr>
                <th>Evento</th>
                <th>Inicio</th>
                <th>Status</th>
                <th>Modelo</th>
                <th>Fee</th>
                <th>Repasse</th>
                <th>Vendidos</th>
              </tr>
            </thead>
            <tbody>
              {overview.eventFeeConfigurations.map((eventConfig) => (
                <tr key={eventConfig.eventId}>
                  <td className="font-medium text-text-primary">{eventConfig.eventName}</td>
                  <td>{formatDate(eventConfig.startsAt, 'dd/MM/yyyy')}</td>
                  <td>
                    <PremiumBadge tone={eventConfig.status === 'published' || eventConfig.status === 'ongoing' ? 'success' : 'default'}>
                      {eventConfig.status}
                    </PremiumBadge>
                  </td>
                  <td>{eventConfig.feeType === 'fixed' ? 'Fixa por ingresso' : 'Percentual'}</td>
                  <td>{eventConfig.feeType === 'fixed' ? formatCurrency(eventConfig.feeValue) : `${eventConfig.feeValue.toFixed(1)}%`}</td>
                  <td>
                    <PremiumBadge tone={eventConfig.absorbFee ? 'warning' : 'info'}>
                      {eventConfig.absorbFee ? 'Absorvida' : 'Repassada'}
                    </PremiumBadge>
                  </td>
                  <td>{eventConfig.soldTickets.toLocaleString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </PremiumTable>
        </PremiumCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <PremiumCard className="p-6">
          <SectionHeader
            eyebrow="Feature Flags"
            title="Features premium ja controladas por plano"
            description="A fundacao de flags ja permite ativar ou bloquear capacidades premium sem alterar os contratos atuais do app."
          />
          <div className="mt-5 grid gap-3">
            {[
              { label: 'Premium checkout', enabled: overview.organization.activeFeatures.includes('premium_checkout') },
              { label: 'Advanced analytics', enabled: overview.organization.activeFeatures.includes('advanced_analytics') },
              { label: 'White-label', enabled: overview.organization.activeFeatures.includes('white_label') },
              { label: 'API access', enabled: overview.organization.activeFeatures.includes('api_access') },
            ].map((feature) => (
              <SurfacePanel key={feature.label} className="flex items-center justify-between p-4">
                <div className="text-sm font-medium text-text-primary">{feature.label}</div>
                <PremiumBadge tone={feature.enabled ? 'success' : 'warning'}>
                  {feature.enabled ? 'Liberado' : 'Premium'}
                </PremiumBadge>
              </SurfacePanel>
            ))}
          </div>
        </PremiumCard>

        <PremiumCard className="p-6">
          <SectionHeader
            eyebrow="Notes"
            title="Como essa camada monetiza o produto"
            description="A fundacao foi desenhada para cobrar fee por evento, gerar receita recorrente por plano e refletir isso direto no checkout e no financeiro."
          />
          <div className="mt-5 space-y-4 text-sm leading-7 text-text-muted">
            <p>Pedidos agora diferenciam fee gerada para a plataforma, fee cobrada do comprador e fee absorvida pelo organizador, sem alterar o contrato legado de `fee_amount`.</p>
            <p>Os formularios de evento passam a decidir se a taxa e percentual ou fixa por ingresso, e o checkout reflete imediatamente esse comportamento no total exibido.</p>
            <p>Os hooks de criacao tambem consultam os limites do plano antes de abrir ainda mais a operacao, reduzindo sobreuso silencioso e preparando upgrades reais.</p>
          </div>
          <div className="mt-6">
            <PremiumButton variant="secondary" className="gap-2" disabled>
              <Lock className="h-4 w-4" />
              Upgrade automation em proxima etapa
            </PremiumButton>
          </div>
        </PremiumCard>
      </section>
    </AdminPageLayout>
  )
}
