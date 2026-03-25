import { AlertTriangle, RefreshCw } from 'lucide-react'
import { useAuthStore } from '@/features/auth'
import { useDashboardOverview } from '@/features/dashboard/hooks'
import { PageEmptyState, PageErrorState, PageLoadingState } from '@/shared/components'
import { cn } from '@/shared/lib'
import { DashboardConversionChart } from './DashboardConversionChart'
import { DashboardCustomerRankingTable } from './DashboardCustomerRankingTable'
import { DashboardEventRankingTable } from './DashboardEventRankingTable'
import { DashboardExecutiveCards } from './DashboardExecutiveCards'
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
        <button onClick={() => void dashboard.refresh()} className="btn-secondary flex items-center gap-2 text-xs">
          <RefreshCw className="h-3.5 w-3.5" /> Atualizar
        </button>
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
        </>
      )}
    </div>
  )
}
