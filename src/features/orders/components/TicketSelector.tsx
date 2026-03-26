import { Minus, Plus, Sparkles } from 'lucide-react'
import type { CheckoutCartItem } from '@/features/orders/types'
import type { PublicTicketType } from '@/features/public/types/public.types'
import { formatCurrency } from '@/shared/lib'
import { PremiumBadge } from '@/features/public'
import { PublicReveal } from '@/features/public/components/PublicReveal'

interface TicketSelectorProps {
  ticketTypes: PublicTicketType[]
  cart: CheckoutCartItem[]
  onAdd: (ticketTypeId: string, batchId: string) => void
  onRemove: (batchId: string) => void
}

export function TicketSelector({ ticketTypes, cart, onAdd, onRemove }: TicketSelectorProps) {
  return (
    <div className="space-y-4">
      {ticketTypes.map((ticketType, ticketTypeIndex) => {
        const visibleBatches = ticketType.batches.filter((batch) => batch.is_active && batch.is_visible)

        if (visibleBatches.length === 0) {
          return null
        }

        return (
          <PublicReveal key={ticketType.id} delayMs={ticketTypeIndex * 60}>
            <div className="rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(250,244,236,0.78))] p-6 shadow-[0_18px_55px_rgba(48,35,18,0.06)]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.26em] text-[#8e7f68]">{ticketType.name}</div>
                  {ticketType.description ? (
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5f5549]">{ticketType.description}</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  {ticketType.is_nominal ? <PremiumBadge tone="default">Nominal</PremiumBadge> : null}
                  {ticketType.is_transferable ? <PremiumBadge tone="success">Transferivel</PremiumBadge> : null}
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {visibleBatches.map((batch) => {
                  const available = Math.max(batch.quantity - batch.sold_count - batch.reserved_count, 0)
                  const selectedItem = cart.find((item) => item.batch_id === batch.id)
                  const selectedQuantity = selectedItem?.quantity ?? 0
                  const maxPerOrder = batch.max_per_order ?? ticketType.max_per_order ?? available
                  const isDisabled = available === 0 || selectedQuantity >= maxPerOrder

                  return (
                    <div key={batch.id} className="rounded-[1.6rem] border border-[#eee2cf] bg-[#fbf7f1] p-5">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full" style={{ background: ticketType.color || '#b79e74' }} />
                            <div className="text-sm font-semibold text-[#1f1a15]">{batch.name}</div>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-3 text-xs text-[#7c6f60]">
                            <span>{available.toLocaleString('pt-BR')} disponiveis</span>
                            <span>max {maxPerOrder} por pedido</span>
                            {batch.ends_at ? <span>encerra em {new Date(batch.ends_at).toLocaleDateString('pt-BR')}</span> : null}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                          <div>
                            <div className="font-display text-[2.1rem] font-semibold leading-none tracking-[-0.04em] text-[#1f1a15]">
                              {batch.price === 0 ? 'Gratuito' : formatCurrency(batch.price)}
                            </div>
                            <div className="mt-1 inline-flex items-center gap-2 text-xs text-[#7c6f60]">
                              <Sparkles className="h-3.5 w-3.5 text-[#7b6440]" />
                              Estoque validado ao reservar
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => onRemove(batch.id)}
                              disabled={!selectedQuantity}
                              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#ddd1bf] bg-white text-[#5f5549] transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-10 text-center text-sm font-medium text-[#1f1a15]">{selectedQuantity}</span>
                            <button
                              type="button"
                              onClick={() => onAdd(ticketType.id, batch.id)}
                              disabled={isDisabled}
                              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#1f1a15] text-[#f8f3ea] transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </PublicReveal>
        )
      })}
    </div>
  )
}
