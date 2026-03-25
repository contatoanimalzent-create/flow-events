import { useMemo, useState } from 'react'
import { AlertTriangle, Download, Loader2, Plus, Receipt, RefreshCw, Wallet } from 'lucide-react'
import { useAuthStore } from '@/features/auth'
import { useAccessControl } from '@/features/access-control'
import {
  FINANCIAL_CLOSURE_STATUS_LABELS,
  FINANCIAL_COST_CATEGORY_LABELS,
  FINANCIAL_COST_STATUS_LABELS,
  FINANCIAL_FORECAST_RISK_LABELS,
  FINANCIAL_PAYOUT_STATUS_LABELS,
} from '@/features/financial/types'
import { useFinancialDashboard, useFinancialMutations } from '@/features/financial/hooks'
import { ClosureReviewModal, CostEntryModal, ForecastModal, PayoutModal } from '@/features/financial/modals'
import { PageEmptyState, PageErrorState, PageLoadingState, PaginationControls } from '@/shared/components'
import { cn, formatCurrency } from '@/shared/lib'
import { FinancialClosuresTable } from './FinancialClosuresTable'
import { FinancialEventsTable } from './FinancialEventsTable'
import { FinancialExecutiveCards } from './FinancialExecutiveCards'
import { FinancialForecastCards } from './FinancialForecastCards'
import { FinancialForecastTable } from './FinancialForecastTable'
import { FinancialPayoutsTable } from './FinancialPayoutsTable'
import { FinancialReconciliationTable } from './FinancialReconciliationTable'

export function FinancialPageContent() {
  const organization = useAuthStore((state) => state.organization)
  const access = useAccessControl()
  const canManageFinancial = access.can('financial', 'manage')
  const dashboard = useFinancialDashboard(organization?.id)
  const mutations = useFinancialMutations({
    organizationId: organization?.id,
    selectedEventId: dashboard.selectedEventId,
  })

  const [editingCostId, setEditingCostId] = useState<string | null>(null)
  const [editingForecastEventId, setEditingForecastEventId] = useState<string | null>(null)
  const [editingPayoutEventId, setEditingPayoutEventId] = useState<string | null>(null)
  const [editingClosureEventId, setEditingClosureEventId] = useState<string | null>(null)
  const [showCostModal, setShowCostModal] = useState(false)
  const [showForecastModal, setShowForecastModal] = useState(false)
  const [showPayoutModal, setShowPayoutModal] = useState(false)
  const [showClosureModal, setShowClosureModal] = useState(false)

  const editingCostEntry = useMemo(
    () => dashboard.filteredCostEntries.find((entry) => entry.id === editingCostId) ?? null,
    [dashboard.filteredCostEntries, editingCostId],
  )

  const editingForecastReport = useMemo(
    () => dashboard.reports.find((report) => report.event_id === editingForecastEventId) ?? null,
    [dashboard.reports, editingForecastEventId],
  )

  const editingPayoutReport = useMemo(
    () => dashboard.reports.find((report) => report.event_id === editingPayoutEventId) ?? null,
    [dashboard.reports, editingPayoutEventId],
  )

  const editingClosureReport = useMemo(
    () => dashboard.reports.find((report) => report.event_id === editingClosureEventId) ?? null,
    [dashboard.reports, editingClosureEventId],
  )

  if (!organization) {
    return null
  }

  const openForecastModal = (eventId?: string | null) => {
    setEditingForecastEventId(eventId ?? (dashboard.selectedEventId === 'all' ? null : dashboard.selectedEventId))
    setShowForecastModal(true)
  }

  const openPayoutModal = (eventId?: string | null) => {
    setEditingPayoutEventId(eventId ?? (dashboard.selectedEventId === 'all' ? null : dashboard.selectedEventId))
    setShowPayoutModal(true)
  }

  const openClosureModal = (eventId?: string | null) => {
    setEditingClosureEventId(eventId ?? (dashboard.selectedEventId === 'all' ? null : dashboard.selectedEventId))
    setShowClosureModal(true)
  }

  const filteredReports = dashboard.filteredReports
  const paginatedReports = dashboard.paginatedReports

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <div className="admin-eyebrow">Finance governance</div>
          <h1 className="admin-title">
            Financeiro<span className="admin-title-accent">.</span>
          </h1>
          <p className="admin-subtitle">Receita, repasse, forecast e fechamento por evento.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => void dashboard.refresh()} className="btn-secondary flex items-center gap-2 text-xs">
            <RefreshCw className="h-3.5 w-3.5" /> Atualizar
          </button>
          <button className="btn-secondary flex items-center gap-2 text-xs">
            <Download className="h-3.5 w-3.5" /> Exportar visao executiva
          </button>
          {dashboard.tab === 'costs' && canManageFinancial ? (
            <button
              onClick={() => {
                setEditingCostId(null)
                setShowCostModal(true)
              }}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Novo lancamento
            </button>
          ) : null}
          {dashboard.tab === 'forecast' && canManageFinancial ? (
            <button onClick={() => openForecastModal()} className="btn-primary flex items-center gap-2">
              <Plus className="h-4 w-4" /> Atualizar forecast
            </button>
          ) : null}
          {dashboard.tab === 'payouts' && canManageFinancial ? (
            <button onClick={() => openPayoutModal()} className="btn-primary flex items-center gap-2">
              <Plus className="h-4 w-4" /> Revisar repasse
            </button>
          ) : null}
          {dashboard.tab === 'closure' && canManageFinancial ? (
            <button onClick={() => openClosureModal()} className="btn-primary flex items-center gap-2">
              <Plus className="h-4 w-4" /> Fechar evento
            </button>
          ) : null}
        </div>
      </div>

      <div className="surface-panel reveal flex items-center gap-1 p-2">
        {([
          { key: 'overview', label: 'Visao geral' },
          { key: 'forecast', label: 'Forecast' },
          { key: 'payouts', label: 'Repasses' },
          { key: 'closure', label: 'Fechamento' },
          { key: 'dre', label: 'DRE por evento' },
          { key: 'reconciliation', label: 'Conciliacao' },
          { key: 'costs', label: 'Lancamentos' },
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

      {dashboard.loading ? (
        <PageLoadingState title="Carregando financeiro" description="Atualizando previsoes, conciliacao e fechamento por evento." />
      ) : dashboard.error ? (
        <PageErrorState title="ERRO AO CARREGAR FINANCEIRO" description={dashboard.error} icon={<AlertTriangle className="mb-3 h-10 w-10 text-status-error" />} />
      ) : !dashboard.overview ? (
        <PageEmptyState title="NENHUM DADO FINANCEIRO" description="Ainda nao ha dados suficientes para consolidar a visao executiva." icon={<Wallet className="mb-3 h-10 w-10 text-text-muted" />} />
      ) : (
        <>
          {(dashboard.tab === 'overview' || dashboard.tab === 'dre') && <FinancialExecutiveCards overview={dashboard.overview} />}
          {(dashboard.tab === 'overview' || dashboard.tab === 'forecast') && <FinancialForecastCards overview={dashboard.overview} />}

          <div className="admin-filterbar">
            <span className="text-xs font-mono text-text-muted">EVENTO:</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => dashboard.setSelectedEventId('all')}
                className={cn(
                  'rounded-sm px-3 py-1.5 text-xs font-medium transition-all',
                  dashboard.selectedEventId === 'all'
                    ? 'bg-brand-acid text-bg-primary'
                    : 'border border-bg-border text-text-muted hover:text-text-primary',
                )}
              >
                Todos
              </button>
              {dashboard.events.map((event) => (
                <button
                  key={event.id}
                  onClick={() => dashboard.setSelectedEventId(event.id)}
                  className={cn(
                    'rounded-sm px-3 py-1.5 text-xs font-medium transition-all',
                    dashboard.selectedEventId === event.id
                      ? 'bg-brand-acid text-bg-primary'
                      : 'border border-bg-border text-text-muted hover:text-text-primary',
                  )}
                >
                  {event.name}
                </button>
              ))}
            </div>
          </div>

          {dashboard.tab === 'overview' ? (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr]">
              <FinancialEventsTable
                reports={paginatedReports}
                expandedEventId={dashboard.expandedEventId}
                onToggleEvent={(eventId) => dashboard.setExpandedEventId(dashboard.expandedEventId === eventId ? null : eventId)}
              />

              <div className="space-y-4">
                <div className="card p-5">
                  <div className="mb-3 text-[10px] font-mono uppercase tracking-widest text-text-muted">Governanca</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Pagamentos aprovados</span>
                      <span className="font-mono text-text-primary">{formatCurrency(dashboard.overview.approved_payments_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Falhas</span>
                      <span className="font-mono text-status-warning">{formatCurrency(dashboard.overview.failed_payments_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Retido</span>
                      <span className="font-mono text-status-warning">{formatCurrency(dashboard.overview.total_retained_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Repasse liquido</span>
                      <span className="font-mono text-status-success">{formatCurrency(dashboard.overview.total_event_organizer_net)}</span>
                    </div>
                  </div>
                </div>

                <div className="card p-5">
                  <div className="mb-3 text-[10px] font-mono uppercase tracking-widest text-text-muted">Evento selecionado</div>
                  {dashboard.selectedEventReport ? (
                    <div className="space-y-2 text-sm">
                      <div className="font-medium text-text-primary">{dashboard.selectedEventReport.event_name}</div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Forecast</span>
                        <span className="font-mono text-brand-blue">{formatCurrency(dashboard.selectedEventReport.projected_revenue)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Repasse liquido</span>
                        <span className="font-mono text-status-success">{formatCurrency(dashboard.selectedEventReport.event_organizer_net)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Fechamento</span>
                        <span className="font-mono text-text-primary">{FINANCIAL_CLOSURE_STATUS_LABELS[dashboard.selectedEventReport.closure_status]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Pendencias</span>
                        <span className={cn('font-mono', dashboard.selectedEventReport.closure_pending_count === 0 ? 'text-status-success' : 'text-status-warning')}>
                          {dashboard.selectedEventReport.closure_pending_count}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-text-muted">Selecione um evento para ver o detalhamento executivo.</div>
                  )}
                </div>

                <div className="card p-5">
                  <div className="mb-3 text-[10px] font-mono uppercase tracking-widest text-text-muted">Alertas executivos</div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Eventos em risco</span>
                      <span className="font-mono text-status-error">{dashboard.overview.events_at_risk_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Repasses agendados</span>
                      <span className="font-mono text-brand-blue">{dashboard.overview.scheduled_payouts_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Eventos prontos para fechar</span>
                      <span className="font-mono text-status-success">{dashboard.overview.events_ready_to_close_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Divergencias</span>
                      <span className="font-mono text-status-warning">{dashboard.overview.divergence_count}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {dashboard.tab === 'overview' || dashboard.tab === 'dre' || dashboard.tab === 'forecast' || dashboard.tab === 'payouts' || dashboard.tab === 'closure' ? (
            <PaginationControls pagination={dashboard.reportsPagination} onPageChange={dashboard.setReportsPage} />
          ) : null}

          {dashboard.tab === 'forecast' ? <FinancialForecastTable reports={paginatedReports} onEditForecast={(report) => openForecastModal(report.event_id)} /> : null}

          {dashboard.tab === 'payouts' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="card p-4">
                  <div className="text-[10px] font-mono uppercase text-text-muted">Payable consolidado</div>
                  <div className="mt-2 font-mono text-2xl font-bold text-text-primary">{formatCurrency(dashboard.overview.total_payable_amount)}</div>
                </div>
                <div className="card p-4">
                  <div className="text-[10px] font-mono uppercase text-text-muted">Repasse liquido</div>
                  <div className="mt-2 font-mono text-2xl font-bold text-status-success">{formatCurrency(dashboard.overview.total_event_organizer_net)}</div>
                </div>
                <div className="card p-4">
                  <div className="text-[10px] font-mono uppercase text-text-muted">Pagos x agendados</div>
                  <div className="mt-2 font-mono text-2xl font-bold text-brand-blue">
                    {dashboard.overview.paid_payouts_count} / {dashboard.overview.scheduled_payouts_count}
                  </div>
                </div>
              </div>

              <FinancialPayoutsTable reports={paginatedReports} onEditPayout={(report) => openPayoutModal(report.event_id)} />
            </div>
          ) : null}

          {dashboard.tab === 'closure' ? <FinancialClosuresTable reports={paginatedReports} onReviewClosure={(report) => openClosureModal(report.event_id)} /> : null}

          {dashboard.tab === 'dre' ? (
            <FinancialEventsTable
              reports={paginatedReports}
              expandedEventId={dashboard.expandedEventId}
              onToggleEvent={(eventId) => dashboard.setExpandedEventId(dashboard.expandedEventId === eventId ? null : eventId)}
            />
          ) : null}

          {dashboard.tab === 'reconciliation' ? (
            <div className="space-y-3">
              <FinancialReconciliationTable rows={dashboard.paginatedReconciliationRows} selectedEventId={dashboard.selectedEventId} />
              <PaginationControls pagination={dashboard.reconciliationPagination} onPageChange={dashboard.setReconciliationPage} />
            </div>
          ) : null}

          {dashboard.tab === 'costs' ? (
            <div className="space-y-4">
              <div className="admin-filterbar">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => dashboard.setCategoryFilter('all')}
                    className={cn(
                      'rounded-sm px-3 py-1.5 text-xs font-medium transition-all',
                      dashboard.categoryFilter === 'all'
                        ? 'bg-brand-acid text-bg-primary'
                        : 'border border-bg-border text-text-muted hover:text-text-primary',
                    )}
                  >
                    Todas categorias
                  </button>
                  {Object.entries(FINANCIAL_COST_CATEGORY_LABELS).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => dashboard.setCategoryFilter(key as keyof typeof FINANCIAL_COST_CATEGORY_LABELS)}
                      className={cn(
                        'rounded-sm px-3 py-1.5 text-xs font-medium transition-all',
                        dashboard.categoryFilter === key
                          ? 'bg-brand-acid text-bg-primary'
                          : 'border border-bg-border text-text-muted hover:text-text-primary',
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => dashboard.setStatusFilter('all')}
                    className={cn(
                      'rounded-sm px-3 py-1.5 text-xs font-medium transition-all',
                      dashboard.statusFilter === 'all'
                        ? 'bg-brand-blue text-bg-primary'
                        : 'border border-bg-border text-text-muted hover:text-text-primary',
                    )}
                  >
                    Todos status
                  </button>
                  {Object.entries(FINANCIAL_COST_STATUS_LABELS).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => dashboard.setStatusFilter(key as keyof typeof FINANCIAL_COST_STATUS_LABELS)}
                      className={cn(
                        'rounded-sm px-3 py-1.5 text-xs font-medium transition-all',
                        dashboard.statusFilter === key
                          ? 'bg-brand-blue text-bg-primary'
                          : 'border border-bg-border text-text-muted hover:text-text-primary',
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {dashboard.filteredCostEntries.length === 0 ? (
                <PageEmptyState
                  title="NENHUM LANCAMENTO"
                  description="Crie custos manuais para fortalecer a governanca financeira por evento."
                  icon={<Wallet className="mb-3 h-10 w-10 text-text-muted" />}
                />
              ) : (
                <div className="card overflow-hidden">
                  <table className="w-full">
                    <thead className="border-b border-bg-border">
                      <tr>
                        {['Descricao', 'Categoria', 'Valor', 'Status', 'Vencimento', 'Acoes'].map((header) => (
                          <th key={header} className="table-header">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.paginatedCostEntries.map((entry) => (
                        <tr key={entry.id} className="table-row">
                          <td className="table-cell">
                            <div className="text-[13px] font-medium text-text-primary">{entry.description}</div>
                            {entry.notes ? <div className="text-[11px] text-text-muted">{entry.notes}</div> : null}
                          </td>
                          <td className="table-cell text-xs text-text-secondary">{FINANCIAL_COST_CATEGORY_LABELS[entry.category]}</td>
                          <td className="table-cell font-mono font-semibold text-status-error">{formatCurrency(entry.amount)}</td>
                          <td className="table-cell text-xs text-text-secondary">{FINANCIAL_COST_STATUS_LABELS[entry.status]}</td>
                          <td className="table-cell text-[11px] font-mono text-text-muted">{entry.due_date ? entry.due_date.slice(0, 10) : '-'}</td>
                          <td className="table-cell">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingCostId(entry.id)
                                  setShowCostModal(true)
                                }}
                                className="btn-secondary text-xs"
                              >
                                Editar
                              </button>
                              <button onClick={() => void mutations.deleteCostEntry({ costEntryId: entry.id })} className="btn-secondary text-xs">
                                Excluir
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <PaginationControls pagination={dashboard.costsPagination} onPageChange={dashboard.setCostsPage} />

              <div className="card p-4 text-sm">
                <div className="mb-2 flex items-center gap-2 text-text-primary">
                  <Receipt className="h-4 w-4 text-brand-acid" />
                  Total filtrado
                </div>
                <div className="font-mono text-xl font-bold text-status-error">
                  {formatCurrency(dashboard.filteredCostEntries.filter((entry) => entry.status !== 'cancelled').reduce((total, entry) => total + entry.amount, 0))}
                </div>
              </div>
            </div>
          ) : null}
        </>
      )}

      {showCostModal ? (
        <CostEntryModal
          organizationId={organization.id}
          events={dashboard.events}
          initialCostEntry={editingCostEntry}
          defaultEventId={dashboard.selectedEventId === 'all' ? '' : dashboard.selectedEventId}
          onClose={() => {
            setShowCostModal(false)
            setEditingCostId(null)
          }}
          onSave={async (input) => {
            await mutations.saveCostEntry(input)
            setShowCostModal(false)
            setEditingCostId(null)
          }}
          saving={mutations.savingCostEntry}
        />
      ) : null}

      {showForecastModal ? (
        <ForecastModal
          organizationId={organization.id}
          events={dashboard.events}
          initialReport={editingForecastReport}
          defaultEventId={dashboard.selectedEventId === 'all' ? '' : dashboard.selectedEventId}
          onClose={() => {
            setShowForecastModal(false)
            setEditingForecastEventId(null)
          }}
          onSave={async (input) => {
            await mutations.saveForecast(input)
            setShowForecastModal(false)
            setEditingForecastEventId(null)
          }}
          saving={mutations.savingForecast}
        />
      ) : null}

      {showPayoutModal ? (
        <PayoutModal
          organizationId={organization.id}
          events={dashboard.events}
          initialReport={editingPayoutReport}
          defaultEventId={dashboard.selectedEventId === 'all' ? '' : dashboard.selectedEventId}
          onClose={() => {
            setShowPayoutModal(false)
            setEditingPayoutEventId(null)
          }}
          onSave={async (input) => {
            await mutations.savePayout(input)
            setShowPayoutModal(false)
            setEditingPayoutEventId(null)
          }}
          saving={mutations.savingPayout}
        />
      ) : null}

      {showClosureModal ? (
        <ClosureReviewModal
          organizationId={organization.id}
          events={dashboard.events}
          initialReport={editingClosureReport}
          defaultEventId={dashboard.selectedEventId === 'all' ? '' : dashboard.selectedEventId}
          onClose={() => {
            setShowClosureModal(false)
            setEditingClosureEventId(null)
          }}
          onSave={async (input) => {
            await mutations.saveClosure(input)
            setShowClosureModal(false)
            setEditingClosureEventId(null)
          }}
          saving={mutations.savingClosure}
        />
      ) : null}
    </div>
  )
}
