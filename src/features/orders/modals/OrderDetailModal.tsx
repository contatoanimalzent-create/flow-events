import { CheckCircle2, CreditCard, FileText, Loader2, Smartphone, Ticket, X } from 'lucide-react'
import { DIGITAL_TICKET_STATUS_LABELS, ORDER_PAYMENT_METHOD_CONFIG, ORDER_STATUS_CONFIG } from '@/features/orders/types'
import type { DigitalTicketRow, OrderItemRow, OrderRow } from '@/features/orders/types'
import { cn, formatCurrency, formatDate } from '@/shared/lib'

interface OrderDetailModalProps {
  order: OrderRow
  items: OrderItemRow[]
  digitalTickets: DigitalTicketRow[]
  loading: boolean
  onClose: () => void
  onConfirm: () => void
  onCancel: () => void
  onIssueDigitalTickets: () => void
}

function PaymentMethodIcon({ method }: { method?: OrderRow['payment_method'] | null }) {
  const icon = method ? ORDER_PAYMENT_METHOD_CONFIG[method]?.icon : 'pix'

  switch (icon) {
    case 'card':
      return <CreditCard className="h-3.5 w-3.5 text-brand-acid" />
    case 'boleto':
      return <FileText className="h-3.5 w-3.5 text-brand-acid" />
    case 'free':
      return <CheckCircle2 className="h-3.5 w-3.5 text-status-success" />
    case 'pix':
    default:
      return <Smartphone className="h-3.5 w-3.5 text-brand-acid" />
  }
}

export function OrderDetailModal({
  order,
  items,
  digitalTickets,
  loading,
  onClose,
  onConfirm,
  onCancel,
  onIssueDigitalTickets,
}: OrderDetailModalProps) {
  const statusConfig = ORDER_STATUS_CONFIG[order.status] ?? ORDER_STATUS_CONFIG.pending
  const paymentMethod = order.payment_method ? ORDER_PAYMENT_METHOD_CONFIG[order.payment_method] : undefined

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-bg-primary/80 p-4 backdrop-blur-sm">
      <div className="animate-slide-up w-full max-w-2xl overflow-hidden rounded-sm border border-bg-border bg-bg-card">
        <div className="flex items-center justify-between border-b border-bg-border px-6 py-4">
          <div>
            <h2 className="font-display text-xl leading-none tracking-wide text-text-primary">
              PEDIDO<span className="text-brand-acid">.</span>
            </h2>
            <p className="mt-0.5 text-[11px] font-mono text-text-muted">#{order.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <button onClick={onClose} className="rounded-sm p-1.5 text-text-muted transition-all hover:bg-bg-surface hover:text-text-primary">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-5 overflow-y-auto p-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className={cn('badge', statusConfig.badge)}>
              <span className={cn('mr-1 h-1.5 w-1.5 rounded-full', statusConfig.dot)} />
              {statusConfig.label}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-text-secondary">
              <PaymentMethodIcon method={order.payment_method} />
              {paymentMethod?.label ?? 'Forma de pagamento n\u00e3o definida'}
            </span>
            {order.paid_at && (
              <span className="text-[11px] font-mono text-status-success">Pago em {formatDate(order.paid_at, 'dd/MM/yyyy HH:mm')}</span>
            )}
          </div>

          <div className="space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted">Comprador</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                { label: 'Nome', value: order.buyer_name },
                { label: 'E-mail', value: order.buyer_email },
                { label: 'Telefone', value: order.buyer_phone },
                { label: 'CPF', value: order.buyer_cpf },
              ]
                .filter((field) => field.value)
                .map((field) => (
                  <div key={field.label} className="rounded-sm bg-bg-surface px-3 py-2">
                    <div className="text-[10px] text-text-muted">{field.label}</div>
                    <div className="mt-0.5 text-xs font-mono text-text-primary">{field.value}</div>
                  </div>
                ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted">Itens do pedido</div>
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-brand-acid" />
              </div>
            ) : items.length === 0 ? (
              <div className="py-4 text-center text-xs text-text-muted">Nenhum item</div>
            ) : (
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-sm border border-bg-border bg-bg-surface p-3">
                    <div>
                      <div className="text-sm font-medium text-text-primary">
                        {item.ticket_type?.name ?? 'Ingresso'}
                        {item.batch?.name && <span className="ml-2 text-[10px] font-mono text-text-muted">{item.batch.name}</span>}
                      </div>
                      <div className="mt-0.5 text-[11px] text-text-muted">
                        {item.holder_name || order.buyer_name} · {item.quantity}x
                      </div>
                    </div>
                    <span className="text-sm font-semibold font-mono text-brand-acid">{formatCurrency(item.total_price)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted">Tickets digitais</div>
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-brand-acid" />
              </div>
            ) : digitalTickets.length === 0 ? (
              <div className="rounded-sm border border-dashed border-bg-border p-4 text-xs text-text-muted">
                Nenhum ticket digital emitido ainda.
              </div>
            ) : (
              <div className="space-y-2">
                {digitalTickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between rounded-sm border border-bg-border bg-bg-surface p-3">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
                        <Ticket className="h-3.5 w-3.5 text-brand-acid" />
                        {ticket.ticket_number}
                      </div>
                      <div className="mt-0.5 text-[11px] text-text-muted">
                        {ticket.holder_name || ticket.holder_email || 'Titular n\u00e3o definido'}
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-text-muted">{DIGITAL_TICKET_STATUS_LABELS[ticket.status]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1.5 rounded-sm border border-bg-border bg-bg-surface p-3 text-xs font-mono">
            <div className="mb-2 text-[10px] uppercase tracking-widest text-text-muted">Resumo financeiro</div>
            <div className="flex justify-between text-text-secondary">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-status-success">
                <span>Desconto</span>
                <span>-{formatCurrency(order.discount_amount)}</span>
              </div>
            )}
            {order.fee_amount > 0 && (
              <div className="flex justify-between text-text-secondary">
                <span>Taxas</span>
                <span>{formatCurrency(order.fee_amount)}</span>
              </div>
            )}
            <div className="mt-1.5 flex justify-between border-t border-bg-border pt-1.5 font-semibold text-text-primary">
              <span>Total</span>
              <span className="text-brand-acid">{formatCurrency(order.total_amount)}</span>
            </div>
          </div>

          {order.notes && (
            <div className="rounded-sm border border-bg-border bg-bg-surface p-3 text-xs text-text-secondary">{order.notes}</div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-bg-border px-6 py-4">
          <div className="flex items-center gap-2">
            {order.status !== 'paid' && (
              <button onClick={onConfirm} className="btn-primary text-sm">
                Confirmar pedido
              </button>
            )}
            {digitalTickets.length === 0 && (
              <button onClick={onIssueDigitalTickets} className="btn-secondary text-sm">
                Emitir tickets digitais
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {order.status !== 'cancelled' && (
              <button onClick={onCancel} className="btn-secondary text-sm">
                Cancelar pedido
              </button>
            )}
            <button onClick={onClose} className="btn-secondary text-sm">
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
