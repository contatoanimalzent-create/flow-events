import { ChevronRight, Minus, Plus, Sparkles, Ticket } from 'lucide-react'
import type { PublicTicketType } from '@/features/public/types/public.types'
import { formatCurrency } from '@/shared/lib'
import { PremiumBadge } from './PremiumBadge'
import { PublicReveal } from './PublicReveal'

interface CartItem {
  ticketTypeId: string
  batchId: string
  ticketName: string
  batchName: string
  price: number
  qty: number
  color: string
}

export function TicketAvailabilityBadge({ available }: { available: number }) {
  if (available <= 0) {
    return <PremiumBadge tone="accent" className="border-[#ff2d2d]/28 bg-[#ff2d2d]/12 text-white">Esgotado</PremiumBadge>
  }

  if (available <= 20) {
    return <PremiumBadge tone="accent">Ultimas vagas</PremiumBadge>
  }

  return <PremiumBadge tone="success">Disponivel</PremiumBadge>
}

export function TicketOptionCard({
  ticketType,
  batch,
  selectedQuantity,
  onAdd,
  onRemove,
}: {
  ticketType: PublicTicketType
  batch: PublicTicketType['batches'][number]
  selectedQuantity: number
  onAdd: () => void
  onRemove: () => void
}) {
  const available = Math.max(batch.quantity - batch.sold_count - batch.reserved_count, 0)
  const maxPerOrder = batch.max_per_order ?? ticketType.max_per_order ?? available
  const isDisabled = available === 0 || selectedQuantity >= maxPerOrder

  return (
    <div className="rounded-[1.9rem] border border-white/8 bg-[linear-gradient(180deg,#0d1117_0%,#121823_100%)] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.24)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full" style={{ background: ticketType.color || '#ff2d2d' }} />
            <div className="text-[11px] uppercase tracking-[0.26em] text-white/46">{ticketType.name}</div>
          </div>
          <div className="mt-4 font-display text-[2rem] font-semibold uppercase leading-[0.92] tracking-[-0.03em] text-white">
            {batch.name}
          </div>
          <p className="mt-3 max-w-xl text-sm leading-7 text-white/66">
            {ticketType.description || 'Acesso pensado para uma experiencia bem resolvida, com disponibilidade e operacao refletidas em tempo real.'}
          </p>
        </div>

        <TicketAvailabilityBadge available={available} />
      </div>

      {ticketType.benefits?.length ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {ticketType.benefits.slice(0, 4).map((benefit) => (
            <span key={benefit} className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs text-white/66">
              {benefit}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-white/8 pt-5">
        <div>
          <div className="text-[10px] uppercase tracking-[0.24em] text-white/44">Valor</div>
          <div className="mt-2 font-display text-[2.6rem] font-semibold leading-none tracking-[-0.04em] text-white">
            {batch.price === 0 ? 'Gratuito' : formatCurrency(batch.price)}
          </div>
          <div className="mt-2 text-xs text-white/52">
            {available.toLocaleString('pt-BR')} disponiveis / max {maxPerOrder} por pedido
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRemove}
            disabled={!selectedQuantity}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-white transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-12 text-center text-sm font-medium text-white">{selectedQuantity}</span>
          <button
            type="button"
            onClick={onAdd}
            disabled={isDisabled}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#ff2d2d] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#ff4133] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function StickyPurchaseCTA({
  cartQty,
  cartTotal,
  minPrice,
  isFreeMode,
  onCheckout,
}: {
  cartQty: number
  cartTotal: number
  minPrice: number
  isFreeMode: boolean
  onCheckout: () => void
}) {
  return (
    <div className="fixed inset-x-4 bottom-4 z-40 md:hidden">
      <div className="flex items-center justify-between gap-4 rounded-full border border-white/10 bg-[rgba(8,11,16,0.96)] px-5 py-3 text-white shadow-[0_24px_70px_rgba(0,0,0,0.34)]">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.24em] text-white/54">
            {cartQty > 0 ? `${cartQty} selecionado${cartQty > 1 ? 's' : ''}` : 'Acesso'}
          </div>
          <div className="mt-1 truncate text-sm font-medium text-white">
            {cartQty > 0
              ? cartTotal === 0
                ? 'Gratuito'
                : formatCurrency(cartTotal)
              : isFreeMode || minPrice === 0
                ? 'Inscricao gratuita'
                : `a partir de ${formatCurrency(minPrice)}`}
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (cartQty > 0) {
              onCheckout()
              return
            }

            document.getElementById('tickets')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }}
          className="inline-flex items-center gap-2 rounded-full bg-[#ff2d2d] px-4 py-2 text-sm font-semibold uppercase tracking-[0.12em] text-white"
        >
          {cartQty > 0 ? 'Checkout' : 'Ver ingressos'}
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export function EventTicketPanelPremium({
  ticketTypes,
  cart,
  cartQty,
  cartTotal,
  isFreeMode,
  onAdd,
  onRemove,
  onCheckout,
}: {
  ticketTypes: PublicTicketType[]
  cart: CartItem[]
  cartQty: number
  cartTotal: number
  isFreeMode: boolean
  onAdd: (ticketTypeId: string, batchId: string) => void
  onRemove: (batchId: string) => void
  onCheckout: () => void
}) {
  return (
    <section id="tickets" className="px-5 py-10 md:px-10 lg:px-16 lg:py-14">
      <div className="mx-auto max-w-7xl">
        <PublicReveal>
          <div className="max-w-3xl">
            <div className="text-[11px] uppercase tracking-[0.32em] text-white/48">Premium access</div>
            <h2 className="mt-4 font-display text-[clamp(2.8rem,4vw,4.3rem)] font-semibold uppercase leading-[0.92] tracking-[-0.04em] text-white">
              Escolha seu acesso em um painel comercial, nao em uma tabela fria.
            </h2>
            <p className="mt-4 text-base leading-8 text-white/68 md:text-lg">
              Cada opcao abaixo reflete disponibilidade, regras e inventario reais. A apresentacao ficou premium; a operacao continua precisa.
            </p>
          </div>
        </PublicReveal>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.12fr_0.88fr]">
          <div className="space-y-5">
            {ticketTypes.map((ticketType, ticketTypeIndex) => {
              const visibleBatches = ticketType.batches.filter((batch) => batch.is_active && batch.is_visible)

              if (visibleBatches.length === 0) {
                return null
              }

              return (
                <PublicReveal key={ticketType.id} delayMs={ticketTypeIndex * 70}>
                  <div className="space-y-4">
                    {visibleBatches.map((batch) => {
                      const selectedItem = cart.find((item) => item.batchId === batch.id)

                      return (
                        <TicketOptionCard
                          key={batch.id}
                          ticketType={ticketType}
                          batch={batch}
                          selectedQuantity={selectedItem?.qty ?? 0}
                          onAdd={() => onAdd(ticketType.id, batch.id)}
                          onRemove={() => onRemove(batch.id)}
                        />
                      )
                    })}
                  </div>
                </PublicReveal>
              )
            })}
          </div>

          <div className="lg:sticky lg:top-28 lg:self-start">
            <PublicReveal delayMs={140}>
              <div className="rounded-[2.1rem] border border-white/8 bg-[linear-gradient(180deg,#0d1117_0%,#121823_100%)] p-7 shadow-[0_18px_55px_rgba(0,0,0,0.26)]">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ff2d2d]/12 text-[#ff6a5c]">
                    <Ticket className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.28em] text-white/46">Seu pedido</div>
                    <div className="mt-2 font-display text-[2.2rem] font-semibold uppercase leading-[0.92] tracking-[-0.03em] text-white">
                      {cartQty > 0 ? `${cartQty} selecionado${cartQty > 1 ? 's' : ''}` : 'Escolha seu acesso'}
                    </div>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-7 text-white/66">
                  {cartQty > 0
                    ? 'Revise a selecao e siga para o checkout. A reserva de inventario acontece no passo seguinte.'
                    : 'Adicione uma ou mais opcoes ao carrinho para liberar o checkout e reservar o inventario no momento certo.'}
                </p>

                <div className="mt-6 space-y-3">
                  {cart.length > 0 ? (
                    cart.map((item) => (
                      <div key={item.batchId} className="rounded-[1.5rem] border border-white/8 bg-white/[0.05] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold text-white">{item.ticketName}</div>
                            <div className="mt-1 text-xs text-white/50">{item.batchName}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-white">{item.qty}x</div>
                            <div className="mt-1 text-xs text-white/50">
                              {item.price === 0 ? 'Gratuito' : formatCurrency(item.price * item.qty)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.04] p-5 text-sm leading-7 text-white/62">
                      Nenhuma opcao selecionada ainda.
                    </div>
                  )}
                </div>

                <div className="mt-6 rounded-[1.7rem] border border-white/8 bg-black/18 p-5">
                  <div className="flex items-center justify-between text-sm text-white/54">
                    <span>Subtotal</span>
                    <span>{cartTotal === 0 ? 'Gratuito' : formatCurrency(cartTotal)}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-white/8 pt-4">
                    <span className="text-sm font-medium text-white">Total da selecao</span>
                    <span className="font-display text-[2.5rem] font-semibold leading-none tracking-[-0.04em] text-white">
                      {cartTotal === 0 ? 'Gratuito' : formatCurrency(cartTotal)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onCheckout}
                  disabled={cartQty === 0}
                  className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#ff2d2d] px-5 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#ff4133] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Ir para o checkout
                  <ChevronRight className="h-4 w-4" />
                </button>

                <div className="mt-6 space-y-3 text-sm leading-7 text-white/66">
                  {[
                    'Reserva temporaria de inventario no checkout',
                    'Pagamento protegido e emissao automatica do ticket digital',
                    isFreeMode ? 'Inscricao validada por QR code' : 'Entrada sustentada por QR code antifraude',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <Sparkles className="mt-1 h-4 w-4 text-[#ff6a5c]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </PublicReveal>
          </div>
        </div>
      </div>
    </section>
  )
}
