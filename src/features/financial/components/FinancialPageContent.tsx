import { useMemo, useState } from 'react'
import { AlertTriangle, Download, Loader2, Plus, Receipt, RefreshCw, Wallet } from 'lucide-react'
import { useAuthStore } from '@/features/auth'
import { FinancialExecutiveCards } from './FinancialExecutiveCards'
import { FinancialEventsTable } from './FinancialEventsTable'
import { FinancialReconciliationTable } from './FinancialReconciliationTable'
import { useFinancialDashboard, useFinancialMutations } from '@/features/financial/hooks'
import { CostEntryModal } from '@/features/financial/modals'
import { FINANCIAL_COST_CATEGORY_LABELS, FINANCIAL_COST_STATUS_LABELS } from '@/features/financial/types'
import { cn, formatCurrency } from '@/shared/lib'

export function FinancialPageContent() {
  const organization = useAuthStore((state) => state.organization)
  const dashboard = useFinancialDashboard(organization?.id)
  const mutations = useFinancialMutations({
    organizationId: organization?.id,
    selectedEventId: dashboard.selectedEventId,
  })
  const [editingCostId, setEditingCostId] = useState<string | null>(null)
  const [showCostModal, setShowCostModal] = useState(false)

  const editingCostEntry = useMemo(
    () => dashboard.filteredCostEntries.find((entry) => entry.id === editingCostId) ?? null,
    [dashboard.filteredCostEntries, editingCostId],
  )

  if (!organization) {
    return null
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-5 p-6">
      <div className="reveal flex items-start justify-between">
        <div>
          <h1 className="font-display text-4xl leading-none tracking-wide text-text-primary">
            FINANCEIRO<span className="text-brand-acid">.</span>
          </h1>
          <p className="mt-1 text-xs font-mono tracking-wider text-text-muted">Receita, custos, conciliacao e DRE por evento</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => void dashboard.refresh()} className="btn-secondary flex items-center gap-2 text-xs">
            <RefreshCw className="h-3.5 w-3.5" /> Atualizar
          </button>
          <button className="btn-secondary flex items-center gap-2 text-xs">
            <Download className="h-3.5 w-3.5" /> Exportar visao executiva
          </button>
          {dashboard.tab === 'costs' && (
            <button
              onClick={() => {
                setEditingCostId(null)
                setShowCostModal(true)
              }}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Novo lancamento
            </button>
          )}
        </div>
      </div>

      <div className="reveal flex items-center gap-1 border-b border-bg-border">
        {([
          { key: 'overview', label: 'Visao geral' },
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
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-brand-acid" />
        </div>
      ) : dashboard.error ? (
        <div className="card flex flex-col items-center justify-center p-16 text-center">
          <AlertTriangle className="mb-3 h-10 w-10 text-status-error" />
          <div className="font-display text-2xl text-text-primary">ERRO AO CARREGAR FINANCEIRO</div>
          <p className="mt-2 text-sm text-text-muted">{dashboard.error}</p>
        </div>
      ) : !dashboard.overview ? (
        <div className="card p-16 text-center text-sm text-text-muted">Nenhum dado financeiro disponivel.</div>
      ) : (
        <>
          {(dashboard.tab === 'overview' || dashboard.tab === 'dre') && <FinancialExecutiveCards overview={dashboard.overview} />}

          {(dashboard.tab === 'overview' || dashboard.tab === 'reconciliation' || dashboard.tab === 'costs') && (
            <div className="reveal flex flex-wrap items-center gap-3">
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
          )}

          {dashboard.tab === 'overview' && (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr]">
              <FinancialEventsTable
                reports={dashboard.selectedEventId === 'all' ? dashboard.reports : dashboard.reports.filter((report) => report.event_id === dashboard.selectedEventId)}
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
                      <span className="text-text-secondary">Reembolsos</span>
                      <span className="font-mono text-status-error">{formatCurrency(dashboard.overview.refunded_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Chargebacks base</span>
                      <span className="font-mono text-status-error">{formatCurrency(dashboard.overview.chargeback_amount)}</span>
                    </div>
                  </div>
                </div>

                <div className="card p-5">
                  <div className="mb-3 text-[10px] font-mono uppercase tracking-widest text-text-muted">Evento selecionado</div>
                  {dashboard.selectedEventReport ? (
                    <div className="space-y-2 text-sm">
                      <div className="font-medium text-text-primary">{dashboard.selectedEventReport.event_name}</div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Receita liquida</span>
                        <span className="font-mono text-status-success">{formatCurrency(dashboard.selectedEventReport.net_sales)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Custos</span>
                        <span className="font-mono text-status-error">{formatCurrency(dashboard.selectedEventReport.operational_costs)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Margem</span>
                        <span className={cn('font-mono', dashboard.selectedEventReport.result >= 0 ? 'text-brand-acid' : 'text-status-error')}>
                          {dashboard.selectedEventReport.margin_percent.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">E-mails enviados</span>
                        <span className="font-mono text-text-primary">
                          {dashboard.selectedEventReport.order_confirmation_emails_sent + dashboard.selectedEventReport.ticket_emails_sent}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-text-muted">Selecione um evento para ver o detalhamento executivo.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {dashboard.tab === 'dre' && (
            <FinancialEventsTable
              reports={dashboard.reports}
              expandedEventId={dashboard.expandedEventId}
              onToggleEvent={(eventId) => dashboard.setExpandedEventId(dashboard.expandedEventId === eventId ? null : eventId)}
            />
          )}

          {dashboard.tab === 'reconciliation' && (
            <FinancialReconciliationTable rows={dashboard.reconciliationRows} selectedEventId={dashboard.selectedEventId} />
          )}

          {dashboard.tab === 'costs' && (
            <div className="space-y-4">
              <div className="reveal flex flex-wrap items-center gap-3">
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
                <div className="card flex flex-col items-center justify-center p-16 text-center">
                  <Wallet className="mb-3 h-10 w-10 text-text-muted" />
                  <div className="font-display text-2xl text-text-primary">NENHUM LANCAMENTO</div>
                  <p className="mt-2 text-sm text-text-muted">Crie custos manuais para fortalecer a governanca financeira por evento.</p>
                </div>
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
                      {dashboard.filteredCostEntries.map((entry) => (
                        <tr key={entry.id} className="table-row">
                          <td className="table-cell">
                            <div className="text-[13px] font-medium text-text-primary">{entry.description}</div>
                            {entry.notes ? <div className="text-[11px] text-text-muted">{entry.notes}</div> : null}
                          </td>
                          <td className="table-cell text-xs text-text-secondary">{FINANCIAL_COST_CATEGORY_LABELS[entry.category]}</td>
                          <td className="table-cell font-mono font-semibold text-status-error">{formatCurrency(entry.amount)}</td>
                          <td className="table-cell text-xs text-text-secondary">{FINANCIAL_COST_STATUS_LABELS[entry.status]}</td>
                          <td className="table-cell text-[11px] font-mono text-text-muted">{entry.due_date ? entry.due_date.slice(0, 10) : '—'}</td>
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
                              <button
                                onClick={() => void mutations.deleteCostEntry({ costEntryId: entry.id })}
                                className="btn-secondary text-xs"
                              >
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
          )}
        </>
      )}

      {showCostModal && (
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
      )}
    </div>
  )
}
