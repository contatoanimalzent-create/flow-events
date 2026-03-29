import { Minus, Plus, Sparkles } from 'lucide-react'
import { PremiumBadge } from '@/features/public'
import { PublicReveal } from '@/features/public/components/PublicReveal'
import { formatPublicCurrency, formatPublicDate, formatPublicNumber, usePublicLocale } from '@/features/public/lib/public-locale'
import type { PublicTicketType } from '@/features/public/types/public.types'
import type { CheckoutCartItem } from '@/features/orders/types'

interface TicketSelectorProps {
  ticketTypes: PublicTicketType[]
  cart: CheckoutCartItem[]
  onAdd: (ticketTypeId: string, batchId: string) => void
  onRemove: (batchId: string) => void
}

export function TicketSelector({ ticketTypes, cart, onAdd, onRemove }: TicketSelectorProps) {
  const { locale, isPortuguese } = usePublicLocale()
  return (
    <div className="space-y-4">
      {ticketTypes.map((ticketType, ticketTypeIndex) => {
        const visibleBatches = ticketType.batches.filter((batch) => batch.is_active && batch.is_visible)

        if (visibleBatches.length === 0) {
          return null
        }

        return (
          <PublicReveal key={ticketType.id} delayMs={ticketTypeIndex * 60}>
            <div className="rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,#0d1117_0%,#121823_100%)] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.24)]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.26em] text-white/46">{ticketType.name}</div>
                  {ticketType.description ? (
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-white/66">{ticketType.description}</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  {ticketType.is_nominal ? <PremiumBadge tone="default">{isPortuguese ? 'Nominal' : 'Named'}</PremiumBadge> : null}
                  {ticketType.is_transferable ? <PremiumBadge tone="success">{isPortuguese ? 'Transferivel' : 'Transferable'}</PremiumBadge> : null}
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
                    <div key={batch.id} className="rounded-[1.7rem] border border-white/8 bg-white/[0.05] p-5">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full" style={{ background: ticketType.color || '#b79e74' }} />
                            <div className="text-sm font-semibold text-white">{batch.name}</div>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-3 text-xs text-white/50">
                            <span>{formatPublicNumber(available, locale)} {isPortuguese ? 'disponiveis' : 'available'}</span>
                            <span>{isPortuguese ? 'limite' : 'max'} {maxPerOrder} {isPortuguese ? 'por pedido' : 'per order'}</span>
                            {batch.ends_at ? <span>{isPortuguese ? 'encerra em' : 'ends on'} {formatPublicDate(batch.ends_at, locale)}</span> : null}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                          <div>
                            <div className="font-display text-[2.1rem] font-semibold leading-none tracking-[-0.04em] text-white">
                              {batch.price === 0 ? (isPortuguese ? 'Gratuito' : 'Free') : formatPublicCurrency(batch.price, locale)}
                            </div>
                            <div className="mt-1 inline-flex items-center gap-2 text-xs text-white/50">
                              <Sparkles className="h-3.5 w-3.5 text-[#ff6a5c]" />
                              {isPortuguese ? 'Estoque validado ao reservar' : 'Inventory validated when reserved'}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => onRemove(batch.id)}
                              disabled={!selectedQuantity}
                              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-10 text-center text-sm font-medium text-white">{selectedQuantity}</span>
                            <button
                              type="button"
                              onClick={() => onAdd(ticketType.id, batch.id)}
                              disabled={isDisabled}
                              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#ff2d2d] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#ff4133] disabled:cursor-not-allowed disabled:opacity-40"
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
