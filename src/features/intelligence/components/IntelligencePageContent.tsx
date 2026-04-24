import { useState } from 'react'
import { AlertTriangle, BrainCircuit, Loader2, RefreshCw } from 'lucide-react'
import { useAuthStore } from '@/features/auth'
import { useIntelligenceDashboard, useIntelligenceMutations } from '@/features/intelligence/hooks'
import { INTELLIGENCE_ALERT_SEVERITY_LABELS, INTELLIGENCE_ALERT_STATUS_LABELS, INTELLIGENCE_ALERT_TYPE_LABELS } from '@/features/intelligence/types'
import type { IntelligenceAlert } from '@/features/intelligence/types'
import { AlertAcknowledgeModal } from '@/features/intelligence/modals'
import { PageErrorState, PageLoadingState } from '@/shared/components'
import { cn } from '@/shared/lib'
import { IntelligenceAlertsList } from './IntelligenceAlertsList'
import { IntelligenceConsistencyPanel } from './IntelligenceConsistencyPanel'
import { IntelligenceHealthScoreGrid } from './IntelligenceHealthScoreGrid'
import { IntelligenceRecommendationsList } from './IntelligenceRecommendationsList'

export function IntelligencePageContent() {
  const organization = useAuthStore((state) => state.organization)
  const profile = useAuthStore((state) => state.profile)
  const dashboard = useIntelligenceDashboard(organization?.id)
  const mutations = useIntelligenceMutations({ organizationId: organization?.id })
  const [selectedAlert, setSelectedAlert] = useState<IntelligenceAlert | null>(null)

  if (!organization) {
    return null
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <div className="admin-eyebrow">Operational insights</div>
          <h1 className="admin-title">
            Intelligence<span className="admin-title-accent">.</span>
          </h1>
          <p className="admin-subtitle">Health score, alertas e recomendações acionaveis por evento.</p>
        </div>
        <button onClick={() => void dashboard.refresh()} className="btn-secondary flex items-center gap-2 text-xs">
          <RefreshCw className="h-3.5 w-3.5" /> Atualizar
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {[
          { label: 'Health medio', value: dashboard.overview?.summary.average_overall_health ?? 0, sublabel: 'score consolidado', color: 'text-brand-blue' },
          { label: 'Alertas ativos', value: dashboard.overview?.summary.active_alerts_count ?? 0, sublabel: 'sinais abertos', color: 'text-status-warning' },
          { label: 'Criticos', value: dashboard.overview?.summary.critical_alerts_count ?? 0, sublabel: 'exigem ação rápida', color: 'text-status-error' },
          { label: 'Eventos em risco', value: dashboard.overview?.summary.high_risk_events_count ?? 0, sublabel: 'overall health < 60', color: 'text-brand-acid' },
          { label: 'Issues de dados', value: dashboard.overview?.summary.consistency_issues_count ?? 0, sublabel: 'consistencia operacional', color: 'text-brand-purple' },
          { label: 'Criticas de dados', value: dashboard.overview?.summary.critical_consistency_issues_count ?? 0, sublabel: 'impacto enterprise', color: 'text-status-error' },
        ].map((card) => (
          <div key={card.label} className="card p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted">{card.label}</span>
              <BrainCircuit className={`h-4 w-4 ${card.color}`} />
            </div>
            <div className={`text-2xl font-bold font-mono ${card.color}`}>{card.value}</div>
            <div className="mt-1 text-[11px] text-text-muted">{card.sublabel}</div>
          </div>
        ))}
      </div>

      <div className="surface-panel reveal flex items-center gap-1 p-2">
        {([
          { key: 'overview', label: 'Health score' },
          { key: 'alerts', label: 'Alertas' },
          { key: 'recommendations', label: 'Recomendações' },
          { key: 'consistency', label: 'Data consistency' },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => dashboard.setTab(tab.key)}
            className={cn(
              'border-b-2 -mb-px px-4 py-3 text-xs font-medium transition-all',
              dashboard.tab === tab.key ? 'border-brand-acid text-brand-acid' : 'border-transparent text-text-muted hover:text-text-primary',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="admin-filterbar">
        <span className="text-xs font-mono text-text-muted">EVENTO:</span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => dashboard.setSelectedEventId('all')}
            className={cn(
              'rounded-sm px-3 py-1.5 text-xs font-medium transition-all',
              dashboard.selectedEventId === 'all' ? 'bg-brand-acid text-white' : 'border border-bg-border text-text-muted hover:text-text-primary',
            )}
          >
            Todos
          </button>
          {dashboard.eventOptions.map((event) => (
            <button
              key={event.id}
              onClick={() => dashboard.setSelectedEventId(event.id)}
              className={cn(
                'rounded-sm px-3 py-1.5 text-xs font-medium transition-all',
                dashboard.selectedEventId === event.id ? 'bg-brand-acid text-white' : 'border border-bg-border text-text-muted hover:text-text-primary',
              )}
            >
              {event.name}
            </button>
          ))}
        </div>
      </div>

      {dashboard.tab === 'alerts' ? (
        <div className="admin-filterbar">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => dashboard.setStatusFilter('all')}
              className={cn(
                'rounded-sm px-3 py-1.5 text-xs font-medium transition-all',
                dashboard.statusFilter === 'all' ? 'bg-brand-blue text-white' : 'border border-bg-border text-text-muted hover:text-text-primary',
              )}
            >
              Todos status
            </button>
            {Object.entries(INTELLIGENCE_ALERT_STATUS_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => dashboard.setStatusFilter(key as keyof typeof INTELLIGENCE_ALERT_STATUS_LABELS)}
                className={cn(
                  'rounded-sm px-3 py-1.5 text-xs font-medium transition-all',
                  dashboard.statusFilter === key ? 'bg-brand-blue text-white' : 'border border-bg-border text-text-muted hover:text-text-primary',
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => dashboard.setSeverityFilter('all')}
              className={cn(
                'rounded-sm px-3 py-1.5 text-xs font-medium transition-all',
                dashboard.severityFilter === 'all' ? 'bg-brand-acid text-white' : 'border border-bg-border text-text-muted hover:text-text-primary',
              )}
            >
              Todas severidades
            </button>
            {Object.entries(INTELLIGENCE_ALERT_SEVERITY_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => dashboard.setSeverityFilter(key as keyof typeof INTELLIGENCE_ALERT_SEVERITY_LABELS)}
                className={cn(
                  'rounded-sm px-3 py-1.5 text-xs font-medium transition-all',
                  dashboard.severityFilter === key ? 'bg-brand-acid text-white' : 'border border-bg-border text-text-muted hover:text-text-primary',
                )}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => dashboard.setTypeFilter('all')}
              className={cn(
                'rounded-sm px-3 py-1.5 text-xs font-medium transition-all',
                dashboard.typeFilter === 'all' ? 'bg-brand-purple text-white' : 'border border-bg-border text-text-muted hover:text-text-primary',
              )}
            >
              Todos tipos
            </button>
            {Object.entries(INTELLIGENCE_ALERT_TYPE_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => dashboard.setTypeFilter(key as keyof typeof INTELLIGENCE_ALERT_TYPE_LABELS)}
                className={cn(
                  'rounded-sm px-3 py-1.5 text-xs font-medium transition-all',
                  dashboard.typeFilter === key ? 'bg-brand-purple text-white' : 'border border-bg-border text-text-muted hover:text-text-primary',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {dashboard.loading ? (
        <PageLoadingState title="Carregando intelligence" description="Calculando health score, alertas e recomendações acionaveis." />
      ) : dashboard.error ? (
        <PageErrorState title="ERRO AO CARREGAR INTELLIGENCE" description={dashboard.error} icon={<AlertTriangle className="mb-3 h-10 w-10 text-status-error" />} />
      ) : dashboard.tab === 'overview' ? (
        <IntelligenceHealthScoreGrid healthScores={dashboard.filteredHealthScores} />
      ) : dashboard.tab === 'alerts' ? (
        <IntelligenceAlertsList alerts={dashboard.filteredAlerts} onAcknowledge={setSelectedAlert} />
      ) : dashboard.tab === 'consistency' ? (
        <IntelligenceConsistencyPanel issues={dashboard.filteredConsistencyIssues} />
      ) : (
        <IntelligenceRecommendationsList recommendations={dashboard.filteredRecommendations} />
      )}

      {selectedAlert ? (
        <AlertAcknowledgeModal
          alert={selectedAlert}
          saving={mutations.acknowledgingAlert}
          onClose={() => setSelectedAlert(null)}
          onConfirm={async (notes) => {
            await mutations.acknowledgeAlert({
              organizationId: organization.id,
              eventId: selectedAlert.event_id,
              alertId: selectedAlert.id,
              acknowledgedBy: profile?.id ?? null,
              notes,
            })
            setSelectedAlert(null)
          }}
        />
      ) : null}
    </div>
  )
}
