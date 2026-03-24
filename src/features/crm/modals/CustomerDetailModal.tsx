import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2, Save, X } from 'lucide-react'
import { crmKeys, crmQueries } from '@/features/crm/services'
import { CRM_ATTENDANCE_STATUS_LABELS, CRM_CUSTOMER_STATUS_LABELS } from '@/features/crm/types'
import type { CustomerListRow } from '@/features/crm/types'
import { cn, formatCurrency, formatDate } from '@/shared/lib'

interface CustomerDetailModalProps {
  organizationId: string
  customer: CustomerListRow
  savingNotes: boolean
  savingTags: boolean
  onClose: () => void
  onSaveNotes: (notes: string) => Promise<void>
  onSaveTags: (tags: string[]) => Promise<void>
}

export function CustomerDetailModal({
  organizationId,
  customer,
  savingNotes,
  savingTags,
  onClose,
  onSaveNotes,
  onSaveTags,
}: CustomerDetailModalProps) {
  const detailQuery = useQuery({
    ...(organizationId
      ? crmQueries.customerDetail(organizationId, customer.id)
      : {
          queryKey: crmKeys.customer('empty', customer.id),
          queryFn: async () => ({ customer: null, metrics: null, orderHistory: [], attendanceHistory: [] }),
        }),
    enabled: Boolean(organizationId),
  })

  const detail = detailQuery.data
  const [notesDraft, setNotesDraft] = useState(customer.notes ?? '')
  const [tagsDraft, setTagsDraft] = useState(customer.tags.join(', '))

  const metrics = detail?.metrics
  const tags = useMemo(
    () =>
      tagsDraft
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    [tagsDraft],
  )

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-bg-primary/80 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-sm border border-bg-border bg-bg-card shadow-card">
        <div className="flex items-start justify-between border-b border-bg-border px-6 py-4">
          <div>
            <h2 className="font-display text-2xl leading-none text-text-primary">
              CUSTOMER<span className="text-brand-acid">.</span>
            </h2>
            <p className="mt-1 text-sm text-text-secondary">{customer.full_name} - {customer.email}</p>
          </div>
          <button onClick={onClose} className="rounded-sm p-2 text-text-muted transition-all hover:bg-bg-surface hover:text-text-primary">
            <X className="h-4 w-4" />
          </button>
        </div>

        {detailQuery.isPending ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-6 w-6 animate-spin text-brand-acid" />
          </div>
        ) : detailQuery.error instanceof Error ? (
          <div className="p-8 text-sm text-status-error">{detailQuery.error.message}</div>
        ) : (
          <div className="grid flex-1 grid-cols-1 gap-0 overflow-hidden xl:grid-cols-[1.15fr_0.85fr]">
            <div className="overflow-y-auto border-r border-bg-border p-6">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Status', value: CRM_CUSTOMER_STATUS_LABELS[customer.status], color: 'text-brand-blue' },
                  { label: 'Receita', value: formatCurrency(metrics?.total_revenue ?? 0), color: 'text-status-success' },
                  { label: 'Pedidos', value: String(metrics?.total_orders ?? 0), color: 'text-text-primary' },
                  { label: 'Compareceu', value: String(metrics?.attended_events_count ?? 0), color: 'text-brand-acid' },
                ].map((item) => (
                  <div key={item.label} className="card p-4">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted">{item.label}</div>
                    <div className={cn('mt-2 text-xl font-bold', item.color)}>{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-4">
                <div className="card p-5">
                  <div className="mb-3 text-[10px] font-mono uppercase tracking-widest text-text-muted">Historico de pedidos</div>
                  <div className="space-y-3">
                    {(detail?.orderHistory ?? []).map((order) => (
                      <div key={order.id} className="rounded-sm border border-bg-border bg-bg-surface p-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-sm font-medium text-text-primary">{order.event_name}</div>
                            <div className="text-[11px] text-text-muted">
                              {formatDate(order.created_at, 'dd/MM/yyyy HH:mm')} - {order.tickets_count} ingressos
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono text-sm font-semibold text-status-success">{formatCurrency(order.total_amount)}</div>
                            <div className="text-[11px] uppercase tracking-wider text-text-muted">{order.payment_status}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card p-5">
                  <div className="mb-3 text-[10px] font-mono uppercase tracking-widest text-text-muted">Eventos frequentados</div>
                  <div className="space-y-3">
                    {(detail?.attendanceHistory ?? []).map((event) => (
                      <div key={event.event_id} className="rounded-sm border border-bg-border bg-bg-surface p-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-sm font-medium text-text-primary">{event.event_name}</div>
                            <div className="text-[11px] text-text-muted">
                              {event.event_starts_at ? formatDate(event.event_starts_at, 'dd/MM/yyyy HH:mm') : 'Data pendente'}
                            </div>
                          </div>
                          <span
                            className={cn(
                              'rounded-sm px-2 py-1 text-[10px] font-mono uppercase tracking-widest',
                              event.status === 'attended'
                                ? 'bg-status-success/10 text-status-success'
                                : event.status === 'no_show'
                                  ? 'bg-status-warning/10 text-status-warning'
                                  : 'bg-brand-blue/10 text-brand-blue',
                            )}
                          >
                            {CRM_ATTENDANCE_STATUS_LABELS[event.status]}
                          </span>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-text-secondary md:grid-cols-4">
                          <div>Tickets: <span className="font-mono text-text-primary">{event.tickets_count}</span></div>
                          <div>Check-ins: <span className="font-mono text-text-primary">{event.attended_count}</span></div>
                          <div>No-show: <span className="font-mono text-text-primary">{event.no_show_count}</span></div>
                          <div>Receita: <span className="font-mono text-status-success">{formatCurrency(event.net_revenue)}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-y-auto p-6">
              <div className="card p-5">
                <div className="mb-3 text-[10px] font-mono uppercase tracking-widest text-text-muted">Relacionamento</div>
                <div className="space-y-4">
                  <div>
                    <label className="input-label">Tags</label>
                    <input
                      className="input"
                      value={tagsDraft}
                      onChange={(event) => setTagsDraft(event.target.value)}
                      placeholder="vip, recorrente, festival, backstage"
                    />
                    <div className="mt-2 flex flex-wrap gap-1">
                      {tags.length > 0 ? tags.map((tag) => (
                        <span key={tag} className="rounded-sm bg-brand-acid/10 px-2 py-1 text-[10px] font-mono text-brand-acid">
                          {tag}
                        </span>
                      )) : <span className="text-[11px] text-text-muted">Nenhuma tag definida.</span>}
                    </div>
                    <button
                      onClick={() => void onSaveTags(tags)}
                      disabled={savingTags}
                      className="btn-secondary mt-3 flex items-center gap-2 text-xs"
                    >
                      {savingTags ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                      Salvar tags
                    </button>
                  </div>

                  <div>
                    <label className="input-label">Notas</label>
                    <textarea
                      className="input min-h-40 resize-none"
                      value={notesDraft}
                      onChange={(event) => setNotesDraft(event.target.value)}
                      placeholder="Preferencias do cliente, contexto comercial, observacoes de atendimento..."
                    />
                    <button
                      onClick={() => void onSaveNotes(notesDraft)}
                      disabled={savingNotes}
                      className="btn-primary mt-3 flex items-center gap-2 text-xs"
                    >
                      {savingNotes ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                      Salvar notas
                    </button>
                  </div>

                  <div className="rounded-sm border border-bg-border bg-bg-surface p-4 text-sm">
                    <div className="mb-2 text-[10px] font-mono uppercase tracking-widest text-text-muted">Resumo rapido</div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Ultima compra</span>
                        <span className="font-mono text-text-primary">
                          {customer.last_purchase_at ? formatDate(customer.last_purchase_at, 'dd/MM/yyyy') : '-'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Ultimo check-in</span>
                        <span className="font-mono text-text-primary">
                          {customer.last_attendance_at ? formatDate(customer.last_attendance_at, 'dd/MM/yyyy HH:mm') : '-'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">No-show</span>
                        <span className="font-mono text-status-warning">{customer.no_show_count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-secondary">Ticket medio</span>
                        <span className="font-mono text-status-success">{formatCurrency(customer.average_ticket)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
