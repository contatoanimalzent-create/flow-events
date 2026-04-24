import { useState } from 'react'
import { CheckCircle2, CreditCard, FileText, Loader2, Smartphone, Ticket } from 'lucide-react'
import {
  ActionConfirmationDialog,
  ConfirmActionBox,
  FormSection,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalShell,
} from '@/shared/components'
import { cn, formatCurrency, formatDate } from '@/shared/lib'
import { DIGITAL_TICKET_STATUS_LABELS, ORDER_PAYMENT_METHOD_CONFIG, ORDER_STATUS_CONFIG } from '@/features/orders/types'
import type { DigitalTicketRow, OrderItemRow, OrderRow } from '@/features/orders/types'

interface OrderDetailModalProps {
  order: OrderRow
  items: OrderItemRow[]
  digitalTickets: DigitalTicketRow[]
  loading: boolean
  cancelling?: boolean
  onClose: () => void
  onConfirm: () => void
  onCancel: () => void
  onIssueDigitalTickets: () => void
  onResendTickets: () => void
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
  cancelling = false,
  onClose,
  onConfirm,
  onCancel,
  onIssueDigitalTickets,
  onResendTickets,
}: OrderDetailModalProps) {
  const statusConfig = ORDER_STATUS_CONFIG[order.status] ?? ORDER_STATUS_CONFIG.pending
  const paymentMethod = order.payment_method ? ORDER_PAYMENT_METHOD_CONFIG[order.payment_method] : undefined
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false)

  return (
    <ModalShell size="4xl">
      <ModalHeader
        eyebrow="Orders"
        title={
          <>
            Pedido<span className="admin-title-accent">.</span>
          </>
        }
        subtitle={`#${order.id.slice(0, 8).toUpperCase()}`}
        onClose={onClose}
      />

      <ModalBody>
        <div className="flex flex-wrap items-center gap-3">
          <span className={cn('badge', statusConfig.badge)}>
            <span className={cn('mr-1 h-1.5 w-1.5 rounded-full', statusConfig.dot)} />
            {statusConfig.label}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-text-secondary">
            <PaymentMethodIcon method={order.payment_method} />
            {paymentMethod?.label ?? 'Forma de pagamento não definida'}
          </span>
          {order.paid_at ? (
            <span className="text-[11px] font-mono text-status-success">Pago em {formatDate(order.paid_at, 'dd/MM/yyyy HH:mm')}</span>
          ) : null}
        </div>

        <FormSection title="Comprador">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {[
              { label: 'Nome', value: order.buyer_name },
              { label: 'E-mail', value: order.buyer_email },
              { label: 'Telefone', value: order.buyer_phone },
              { label: 'CPF', value: order.buyer_cpf },
            ]
              .filter((field) => field.value)
              .map((field) => (
                <div key={field.label} className="rounded-[20px] border border-bg-border bg-bg-secondary/70 px-4 py-3">
                  <div className="text-[10px] uppercase tracking-[0.24em] text-text-muted">{field.label}</div>
                  <div className="mt-1 text-sm font-medium text-text-primary">{field.value}</div>
                </div>
              ))}
          </div>
        </FormSection>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <FormSection title="Itens do pedido">
            {loading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-brand-acid" />
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-[22px] border border-dashed border-bg-border p-4 text-sm text-text-muted">Nenhum item registrado.</div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-[22px] border border-bg-border bg-bg-secondary/65 p-4">
                    <div>
                      <div className="text-sm font-medium text-text-primary">
                        {item.ticket_type?.name ?? 'Ingresso'}
                        {item.batch?.name ? <span className="ml-2 text-[10px] font-mono text-text-muted">{item.batch.name}</span> : null}
                      </div>
                      <div className="mt-1 text-[11px] text-text-muted">
                        {item.holder_name || order.buyer_name} · {item.quantity}x
                      </div>
                    </div>
                    <span className="font-mono text-sm font-semibold text-brand-acid">{formatCurrency(item.total_price)}</span>
                  </div>
                ))}
              </div>
            )}
          </FormSection>

          <FormSection title="Tickets digitais">
            {loading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-brand-acid" />
              </div>
            ) : digitalTickets.length === 0 ? (
              <div className="rounded-[22px] border border-dashed border-bg-border p-4 text-sm text-text-muted">
                Nenhum ticket digital emitido ainda.
              </div>
            ) : (
              <div className="space-y-3">
                {digitalTickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between rounded-[22px] border border-bg-border bg-bg-secondary/65 p-4">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
                        <Ticket className="h-3.5 w-3.5 text-brand-acid" />
                        {ticket.ticket_number}
                      </div>
                      <div className="mt-1 text-[11px] text-text-muted">
                        {ticket.holder_name || ticket.holder_email || 'Titular não definido'}
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-text-muted">{DIGITAL_TICKET_STATUS_LABELS[ticket.status]}</span>
                  </div>
                ))}
              </div>
            )}
          </FormSection>
        </div>

        <FormSection title="Resumo financeiro">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-text-secondary">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            {order.discount_amount > 0 ? (
              <div className="flex justify-between text-status-success">
                <span>Desconto</span>
                <span>-{formatCurrency(order.discount_amount)}</span>
              </div>
            ) : null}
            {order.fee_amount > 0 ? (
              <div className="flex justify-between text-text-secondary">
                <span>Taxas</span>
                <span>{formatCurrency(order.fee_amount)}</span>
              </div>
            ) : null}
            <div className="mt-2 flex justify-between border-t border-bg-border pt-3 font-semibold text-text-primary">
              <span>Total</span>
              <span className="text-brand-acid">{formatCurrency(order.total_amount)}</span>
            </div>
          </div>
        </FormSection>

        {order.notes ? (
          <ConfirmActionBox title="Observacoes internas" description={order.notes} />
        ) : null}
      </ModalBody>

      <ModalFooter className="flex-wrap">
        <div className="flex flex-wrap items-center gap-2">
          {order.status !== 'paid' ? (
            <button onClick={onConfirm} className="btn-primary text-sm">
              Confirmar pedido
            </button>
          ) : null}
          {order.status === 'paid' && digitalTickets.length === 0 ? (
            <button onClick={onIssueDigitalTickets} className="btn-secondary text-sm">
              Emitir tickets digitais
            </button>
          ) : null}
          {digitalTickets.length > 0 ? (
            <button onClick={onResendTickets} className="btn-secondary text-sm">
              Reenviar e-mail
            </button>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {order.status !== 'cancelled' ? (
            <button onClick={() => setConfirmCancelOpen(true)} className="btn-danger text-sm">
              Cancelar pedido
            </button>
          ) : null}
          <button onClick={onClose} className="btn-secondary text-sm">
            Fechar
          </button>
        </div>
      </ModalFooter>

      <ActionConfirmationDialog
        open={confirmCancelOpen}
        title="Cancelar pedido"
        description={`O pedido #${order.id.slice(0, 8).toUpperCase()} deixara de seguir no fluxo comercial.`}
        impact="Pagamentos, emissão digital e acompanhamento operacional deste comprador podem precisar de nova revisao após o cancelamento."
        confirmLabel="Cancelar pedido"
        confirming={cancelling}
        onCancel={() => setConfirmCancelOpen(false)}
        onConfirm={async () => {
          await onCancel()
          setConfirmCancelOpen(false)
        }}
      />
    </ModalShell>
  )
}
