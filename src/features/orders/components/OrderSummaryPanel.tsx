import { Check, Lock, Ticket } from 'lucide-react'
import type { CheckoutCartItem, CheckoutSummary } from '@/features/orders/types'
import { formatCurrency } from '@/shared/lib'

interface OrderSummaryPanelProps {
  eventName: string
  cart: CheckoutCartItem[]
  summary: CheckoutSummary
  editable?: boolean
  onAdd: (ticketTypeId: string, batchId: string) => void
  onRemove: (batchId: string) => void
  reserveCountdown?: string | null
}

export function OrderSummaryPanel({
  eventName,
  cart,
  summary,
  editable = false,
  onAdd,
  onRemove,
  reserveCountdown,
}: OrderSummaryPanelProps) {
  return (
    <aside className="lg:sticky lg:top-28 lg:self-start">
      <div className="rounded-[2.1rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(250,244,236,0.78))] p-6 shadow-[0_18px_55px_rgba(48,35,18,0.06)] md:p-7">
        <div className="text-[11px] uppercase tracking-[0.32em] text-[#8e7f68]">Resumo do pedido</div>
        <div className="mt-4 font-display text-[2.5rem] font-semibold leading-[0.92] tracking-[-0.04em] text-[#1f1a15]">
          {eventName}
        </div>
        <p className="mt-3 text-sm leading-7 text-[#5f5549]">
          Resumo sempre visivel, atualizado em tempo real enquanto voce ajusta a selecao, preenche os dados e confirma o pagamento.
        </p>

        {reserveCountdown ? (
          <div className="mt-5 rounded-[1.4rem] border border-[#eadaba] bg-[#faf4e7] px-4 py-3 text-sm text-[#6d5324]">
            Reserva ativa por mais {reserveCountdown}
          </div>
        ) : null}

        <div className="mt-6 space-y-3">
          {cart.map((item) => (
            <div key={item.batch_id} className="rounded-[1.5rem] border border-[#eee2cf] bg-[#fbf7f1] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ background: item.color ?? '#b79e74' }} />
                    <div className="text-sm font-semibold text-[#1f1a15]">{item.ticket_name}</div>
                  </div>
                  <div className="mt-1 text-xs text-[#7c6f60]">{item.batch_name}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-[#1f1a15]">{item.quantity}x</div>
                  <div className="mt-1 text-xs text-[#7c6f60]">
                    {item.price === 0 ? 'Gratuito' : formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              </div>

              {editable ? (
                <div className="mt-4 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onRemove(item.batch_id)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#ddd1bf] bg-white text-sm text-[#5f5549] transition-all duration-300 hover:-translate-y-0.5"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm text-[#1f1a15]">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => onAdd(item.ticket_type_id, item.batch_id)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#1f1a15] text-sm text-[#f8f3ea] transition-all duration-300 hover:-translate-y-0.5"
                  >
                    +
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-[1.7rem] border border-[#eee2cf] bg-[#fbf7f1] p-5">
          <div className="flex items-center justify-between text-sm text-[#7c6f60]">
            <span>Subtotal</span>
            <span>{summary.subtotal === 0 ? 'Gratuito' : formatCurrency(summary.subtotal)}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-[#7c6f60]">
            <span>{summary.absorb_fee ? 'Taxa absorvida' : 'Taxa no checkout'}</span>
            <span>
              {summary.absorb_fee
                ? summary.absorbed_fee_amount === 0
                  ? 'Sem absorcao'
                  : formatCurrency(summary.absorbed_fee_amount)
                : summary.customer_fee_amount === 0
                  ? 'Sem taxa nesta etapa'
                  : formatCurrency(summary.customer_fee_amount)}
            </span>
          </div>
          {summary.absorb_fee && summary.customer_fee_amount === 0 ? (
            <div className="mt-2 text-xs leading-5 text-[#7c6f60]">
              O comprador ve um total limpo. A plataforma ainda gera {formatCurrency(summary.platform_fee_amount)} e esse valor e descontado no repasse do produtor.
            </div>
          ) : null}
          <div className="mt-4 flex items-center justify-between border-t border-[#eee2cf] pt-4">
            <span className="text-sm font-medium text-[#1f1a15]">Total</span>
            <span className="font-display text-[2.4rem] font-semibold leading-none tracking-[-0.04em] text-[#1f1a15]">
              {summary.total_amount === 0 ? 'Gratuito' : formatCurrency(summary.total_amount)}
            </span>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {[
            { icon: Lock, text: 'Reserva com expiracao automatica' },
            { icon: Ticket, text: 'Inventario controlado por lote' },
            { icon: Check, text: 'Emissao automatica apos confirmacao' },
          ].map((item) => {
            const Icon = item.icon
            return (
              <div key={item.text} className="flex items-start gap-3 text-sm text-[#5f5549]">
                <Icon className="mt-0.5 h-4 w-4 text-[#7b6440]" />
                <span>{item.text}</span>
              </div>
            )
          })}
        </div>
      </div>
    </aside>
  )
}
