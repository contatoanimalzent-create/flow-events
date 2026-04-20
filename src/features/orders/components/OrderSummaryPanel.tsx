import { Check, Lock, Tag, Ticket } from 'lucide-react'
import type { CheckoutCartItem, CheckoutSummary } from '@/features/orders/types'
import { formatPublicCurrency, usePublicLocale } from '@/features/public/lib/public-locale'

interface OrderSummaryPanelProps {
  eventName: string
  cart: CheckoutCartItem[]
  summary: CheckoutSummary
  editable?: boolean
  onAdd: (ticketTypeId: string, batchId: string) => void
  onRemove: (batchId: string) => void
  reserveCountdown?: string | null
  couponCode?: string | null
  couponDiscount?: number
}

export function OrderSummaryPanel({
  eventName,
  cart,
  summary,
  editable = false,
  onAdd,
  onRemove,
  reserveCountdown,
  couponCode,
  couponDiscount = 0,
}: OrderSummaryPanelProps) {
  const { locale, isPortuguese } = usePublicLocale()
  return (
    <aside className="lg:sticky lg:top-28 lg:self-start">
      <div className="rounded-[2.1rem] border border-white/8 bg-[linear-gradient(180deg,#0d1117_0%,#121823_100%)] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.28)] md:p-7">
        <div className="text-[11px] uppercase tracking-[0.32em] text-white/46">
          {isPortuguese ? 'Resumo do pedido' : 'Order summary'}
        </div>
        <div className="mt-4 font-display text-[2.5rem] font-semibold uppercase leading-[0.92] tracking-[-0.04em] text-white">
          {eventName}
        </div>
        <p className="mt-3 text-sm leading-7 text-white/66">
          {isPortuguese
            ? 'Resumo sempre visivel, atualizado em tempo real enquanto voce ajusta a selecao, confirma os dados e conclui o pagamento.'
            : 'Always-visible summary, updated in real time while you adjust selection, confirm details and complete payment.'}
        </p>

        {reserveCountdown ? (
          <div className="mt-5 rounded-[1.4rem] border border-[#ff2d2d]/26 bg-[#ff2d2d]/10 px-4 py-3 text-sm text-white">
            {isPortuguese ? 'Reserva ativa por mais' : 'Reservation active for'} {reserveCountdown}
          </div>
        ) : null}

        <div className="mt-6 space-y-3">
          {cart.map((item) => (
            <div key={item.batch_id} className="rounded-[1.5rem] border border-white/8 bg-white/[0.05] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ background: item.color ?? '#b79e74' }} />
                    <div className="text-sm font-semibold text-white">{item.ticket_name}</div>
                  </div>
                  <div className="mt-1 text-xs text-white/50">{item.batch_name}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-white">{item.quantity}x</div>
                  <div className="mt-1 text-xs text-white/50">
                    {item.price === 0 ? (isPortuguese ? 'Gratuito' : 'Free') : formatPublicCurrency(item.price * item.quantity, locale)}
                  </div>
                </div>
              </div>

              {editable ? (
                <div className="mt-4 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onRemove(item.batch_id)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-sm text-white transition-all duration-300 hover:-translate-y-0.5"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm text-white">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => onAdd(item.ticket_type_id, item.batch_id)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#ff2d2d] text-sm text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#ff4133]"
                  >
                    +
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-[1.7rem] border border-white/8 bg-black/18 p-5">
          <div className="flex items-center justify-between text-sm text-white/50">
            <span>Subtotal</span>
            <span>{summary.subtotal === 0 ? (isPortuguese ? 'Gratuito' : 'Free') : formatPublicCurrency(summary.subtotal, locale)}</span>
          </div>
          {couponCode && couponDiscount > 0 && (
            <div className="mt-3 flex items-center justify-between text-sm text-[#22c55e]">
              <span className="flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" />
                {couponCode}
              </span>
              <span>-{formatPublicCurrency(couponDiscount, locale)}</span>
            </div>
          )}
          <div className="mt-3 flex items-center justify-between text-sm text-white/50">
            <span>{summary.absorb_fee ? (isPortuguese ? 'Taxa absorvida' : 'Absorbed fee') : (isPortuguese ? 'Taxa aplicada' : 'Applied fee')}</span>
            <span>
              {summary.absorb_fee
                ? summary.absorbed_fee_amount === 0
                  ? isPortuguese ? 'Sem absorcao' : 'No absorption'
                  : formatPublicCurrency(summary.absorbed_fee_amount, locale)
                : summary.customer_fee_amount === 0
                  ? isPortuguese ? 'Sem taxa nesta etapa' : 'No fee at this stage'
                  : formatPublicCurrency(summary.customer_fee_amount, locale)}
            </span>
          </div>
          {summary.absorb_fee && summary.customer_fee_amount === 0 ? (
            <div className="mt-2 text-xs leading-5 text-white/46">
              {isPortuguese
                ? `O comprador ve um total limpo. A plataforma ainda gera ${formatPublicCurrency(summary.platform_fee_amount, locale)} e esse valor e descontado no repasse do produtor.`
                : `The buyer sees a clean total. The platform still generates ${formatPublicCurrency(summary.platform_fee_amount, locale)} and that amount is deducted from the producer payout.`}
            </div>
          ) : null}
          <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-4">
            <span className="text-sm font-medium text-white">Total</span>
            <span className="font-display text-[2.4rem] font-semibold leading-none tracking-[-0.04em] text-white">
              {summary.total_amount === 0 ? (isPortuguese ? 'Gratuito' : 'Free') : formatPublicCurrency(summary.total_amount, locale)}
            </span>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {[
            { icon: Lock, text: isPortuguese ? 'Reserva com expiracao automatica' : 'Reservation with automatic expiration' },
            { icon: Ticket, text: isPortuguese ? 'Inventario controlado por lote' : 'Batch-controlled inventory' },
            { icon: Check, text: isPortuguese ? 'Emissao automatica apos confirmacao' : 'Automatic issuance after confirmation' },
          ].map((item) => {
            const Icon = item.icon

            return (
              <div key={item.text} className="flex items-start gap-3 text-sm text-white/66">
                <Icon className="mt-0.5 h-4 w-4 text-[#ff6a5c]" />
                <span>{item.text}</span>
              </div>
            )
          })}
        </div>
      </div>
    </aside>
  )
}
