import { AlertTriangle, RefreshCw, TrendingUp, Zap } from 'lucide-react'
import { useAuthStore } from '@/features/auth'
import { useDashboardOverview } from '@/features/dashboard/hooks'
import { PageErrorState, PageLoadingState } from '@/shared/components'
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

  if (!organization) return null

  return (
    <div className="admin-page">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="reveal border-b border-bg-border pb-8 lg:pb-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="admin-eyebrow mb-3">Command center</div>
            <h1 className="admin-title">
              Dashboard<span className="admin-title-accent">.</span>
            </h1>
            <p className="admin-subtitle mt-3">
              Receita, operação, acesso e governança em tempo real.
            </p>
          </div>

          {/* Ações rápidas */}
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <div
              className="rounded-full border px-4 py-2 text-[11px] uppercase tracking-[0.28em]"
              style={{ borderColor: 'rgba(240,232,214,0.12)', color: 'rgba(240,232,214,0.45)' }}
            >
              {organization.name}
            </div>
            <button
              onClick={() => void dashboard.refresh()}
              className="flex items-center gap-2 rounded-full border px-5 py-2.5 text-xs font-semibold transition-all hover:-translate-y-0.5"
              style={{
                background: 'rgba(0,87,231,0.12)',
                borderColor: 'rgba(0,87,231,0.28)',
                color: '#4285F4',
              }}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Atualizar
            </button>
          </div>
        </div>
      </div>

      {/* ── Filtros ─────────────────────────────────────────────────────── */}
      <div className="admin-filterbar">
        <span className="text-xs font-mono text-text-muted">PERÍODO:</span>
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
                'rounded-full px-3.5 py-1.5 text-xs font-medium transition-all',
                dashboard.period === value
                  ? 'bg-[#0057E7] text-white'
                  : 'border border-bg-border text-text-muted hover:border-white/20 hover:text-text-primary',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        <select
          className="input h-9 w-auto pr-8 text-xs"
          value={dashboard.selectedEventId}
          onChange={(e) => dashboard.setSelectedEventId(e.target.value)}
        >
          <option value="all">Todos os eventos</option>
          {dashboard.eventOptions.map((ev) => (
            <option key={ev.id} value={ev.id}>{ev.name}</option>
          ))}
        </select>
      </div>

      {/* ── Estados ─────────────────────────────────────────────────────── */}
      {dashboard.loading ? (
        <PageLoadingState
          title="Carregando dashboard"
          description="Consolidando receita, check-ins e clientes…"
        />
      ) : dashboard.error ? (
        <PageErrorState
          title="Erro ao carregar"
          description={dashboard.error}
          icon={<AlertTriangle className="mb-3 h-10 w-10 text-status-error" />}
          action={
            <button onClick={() => void dashboard.refresh()} className="btn-primary">
              Tentar novamente
            </button>
          }
        />
      ) : dashboard.overview.events.length === 0 ? (

        /* ── Empty state elegante ── */
        <div
          className="flex flex-col items-center justify-center gap-6 rounded-2xl py-20 text-center"
          style={{ background: 'rgba(240,232,214,0.02)', border: '1px solid rgba(240,232,214,0.06)' }}
        >
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ background: 'rgba(0,87,231,0.1)', border: '1px solid rgba(0,87,231,0.2)' }}
          >
            <Zap className="h-7 w-7 text-[#4285F4]" />
          </div>
          <div>
            <p className="text-base font-semibold text-text-primary">Nenhum evento ainda</p>
            <p className="mt-2 max-w-sm text-sm text-text-muted">
              Crie e publique seu primeiro evento para liberar a visão executiva consolidada.
            </p>
          </div>
        </div>

      ) : (
        <>
          {/* ── KPI strip 3 métricas principais ── */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                label: 'Receita bruta',
                value: formatCurrency(dashboard.overview.summary.grossRevenue),
                note: 'Volume consolidado',
                icon: TrendingUp,
                accent: '#4285F4',
                glow: 'rgba(0,87,231,0.15)',
              },
              {
                label: 'Eventos ativos',
                value: formatNumber(dashboard.overview.summary.activeEvents),
                note: 'Em circulação hoje',
                icon: Zap,
                accent: '#C9A84C',
                glow: 'rgba(201,168,76,0.12)',
              },
              {
                label: 'Clientes ativos',
                value: formatNumber(dashboard.overview.summary.totalCustomers),
                note: 'Base respondendo',
                icon: TrendingUp,
                accent: '#22C55E',
                glow: 'rgba(34,197,94,0.10)',
              },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.label}
                  className="reveal flex flex-col gap-3 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    background: `linear-gradient(160deg, #0D1525 0%, #111A2E 100%)`,
                    border: `1px solid rgba(240,232,214,0.07)`,
                    boxShadow: `0 4px 24px ${item.glow}`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[10px] font-semibold uppercase tracking-[0.28em]"
                      style={{ color: 'rgba(240,232,214,0.45)' }}
                    >
                      {item.label}
                    </span>
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-xl"
                      style={{ background: `${item.glow.replace('0.12', '0.18')}`, border: `1px solid ${item.accent}22` }}
                    >
                      <Icon className="h-4 w-4" style={{ color: item.accent }} />
                    </div>
                  </div>
                  <div
                    className="text-[2rem] font-black leading-none tracking-[-0.04em]"
                    style={{ color: '#F0E8D6' }}
                  >
                    {item.value}
                  </div>
                  <div className="text-xs" style={{ color: 'rgba(240,232,214,0.38)' }}>
                    {item.note}
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── Cards executivos (8 métricas) ── */}
          <DashboardExecutiveCards summary={dashboard.overview.summary} />

          {/* ── Gráficos ── */}
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
