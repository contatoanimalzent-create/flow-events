import { AlertTriangle, RefreshCw } from 'lucide-react'
import { useAuthStore } from '@/features/auth'
import { useDashboardOverview } from '@/features/dashboard/hooks'
import { PageEmptyState, PageErrorState, PageLoadingState } from '@/shared/components'
import { cn, formatCurrency, formatNumber } from '@/shared/lib'
import { DashboardConversionChart } from './DashboardConversionChart'
import { DashboardCustomerRankingTable } from './DashboardCustomerRankingTable'
import { DashboardEventRankingTable } from './DashboardEventRankingTable'
import { DashboardExecutiveCards } from './DashboardExecutiveCards'
import { DashboardInscricoesPanel } from './DashboardInscricoesPanel'
import { DashboardPerformancePanel } from './DashboardPerformancePanel'
import { DashboardRevenueChart } from './DashboardRevenueChart'

export function DashboardPageContent() {
  const organization = useAuthStore((state) => state.organization)
  const dashboard = useDashboardOverview(organization?.id)

  if (!organization) {
    return null
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <div className="admin-eyebrow">Executive overview</div>
          <h1 className="admin-title">
            Dashboard<span className="admin-title-accent">.</span>
          </h1>
          <p className="admin-subtitle">Visao executiva de receita, operacao, clientes e campanhas.</p>
        </div>
        <div className="novare-stage-panel-dark">
          <div className="novare-stage-label">Operations command</div>
          <div className="novare-stage-title">Receita, ocupacao e saude operacional em uma unica leitura.</div>
          <div className="novare-stage-copy">
            Painel executivo para produtores que precisam enxergar caixa, conversao, check-in e risco sem alternar entre modulos.
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button onClick={() => void dashboard.refresh()} className="btn-primary flex items-center gap-2 text-xs">
              <RefreshCw className="h-3.5 w-3.5" /> Atualizar
            </button>
            <div className="rounded-full border border-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-[#8e847d]">
              Org {organization.name}
            </div>
          </div>
        </div>
      </div>

      <div className="admin-filterbar">
        <span className="text-xs font-mono text-text-muted">PERIODO:</span>
        <div className="flex flex-wrap gap-2">
          {([
            ['7d', '7 dias'],
            ['30d', '30 dias'],
            ['90d', '90 dias'],
            ['365d', '12 meses'],
            ['all', 'Tudo'],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              onClick={() => dashboard.setPeriod(value)}
              className={cn(
                'rounded-sm px-3 py-1.5 text-xs font-medium transition-all',
                dashboard.period === value ? 'bg-brand-acid text-bg-primary' : 'border border-bg-border text-text-muted hover:text-text-primary',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        <select className="input h-9 w-auto pr-8 text-xs" value={dashboard.selectedEventId} onChange={(event) => dashboard.setSelectedEventId(event.target.value)}>
          <option value="all">Todos os eventos</option>
          {dashboard.eventOptions.map((event) => (
            <option key={event.id} value={event.id}>
              {event.name}
            </option>
          ))}
        </select>

        <div className="rounded-sm border border-bg-border px-3 py-2 text-[11px] font-mono text-text-muted">ORG - {organization.name}</div>
      </div>

      {dashboard.loading ? (
        <PageLoadingState title="Carregando dashboard executivo" description="Consolidando receita, campanhas, check-ins e clientes." />
      ) : dashboard.error ? (
        <PageErrorState
          title="ERRO AO CARREGAR DASHBOARD"
          description={dashboard.error}
          icon={<AlertTriangle className="mb-3 h-10 w-10 text-status-error" />}
          action={
            <button onClick={() => void dashboard.refresh()} className="btn-primary">
              Tentar novamente
            </button>
          }
        />
      ) : dashboard.overview.events.length === 0 ? (
        <PageEmptyState title="NENHUM EVENTO DISPONIVEL" description="Crie ou publique eventos para liberar a visao executiva consolidada." />
      ) : (
        <>
          <section className="novare-stage">
            <div className="novare-stage-panel">
              <div className="novare-stage-label">Executive snapshot</div>
              <div className="novare-stage-title">Cada evento publicado retorna para este cockpit como prova real de margem, tracao e capacidade.</div>
              <div className="novare-stage-copy">
                A camada principal concentra vendas, sinal comercial, clientes ativos e volume operacional com a mesma linguagem visual do restante do produto.
              </div>
            </div>

            <div className="novare-stage-stack">
              {[
                {
                  label: 'Receita bruta',
                  value: formatCurrency(dashboard.overview.summary.grossRevenue),
                  note: 'Volume consolidado entrando na operacao.',
                },
                {
                  label: 'Eventos ativos',
                  value: formatNumber(dashboard.overview.summary.activeEvents),
                  note: 'Portfolio hoje em circulacao e venda.',
                },
                {
                  label: 'Clientes ativos',
                  value: formatNumber(dashboard.overview.summary.totalCustomers),
                  note: 'Base que segue respondendo ao produto.',
                },
              ].map((item) => (
                <article key={item.label} className="novare-stage-metric">
                  <div className="novare-stage-label">{item.label}</div>
                  <div className="novare-stage-metric-value">{item.value}</div>
                  <div className="novare-stage-metric-copy">{item.note}</div>
                </article>
              ))}
            </div>
          </section>

          <DashboardExecutiveCards summary={dashboard.overview.summary} />

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.5fr_1fr]">
            <DashboardRevenueChart data={dashboard.overview.revenueSeries} />
            <DashboardPerformancePanel items={dashboard.overview.performance} />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_1fr]">
            <DashboardConversionChart data={dashboard.overview.conversionSeries} />
            <DashboardEventRankingTable rows={dashboard.overview.eventRanking} />
          </div>

          <DashboardCustomerRankingTable rows={dashboard.overview.customerRanking} />

          <DashboardInscricoesPanel />
        </>
      )}
    </div>
  )
}
