import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Heart,
  MapPin,
  Share2,
  ShieldCheck,
  Sparkles,
  Ticket,
  Users,
} from 'lucide-react'
import { EventHeroMedia, EventMediaGallery } from '@/features/event-media'
import { PublicCheckoutContent } from '@/features/orders'
import {
  EventInfoBlock,
  PremiumBadge,
  PremiumSection,
  PublicLayout,
  PublicReveal,
  usePublicEvent,
} from '@/features/public'
import { formatCurrency, formatDate } from '@/shared/lib'

interface CartItem {
  ticketTypeId: string
  batchId: string
  ticketName: string
  batchName: string
  price: number
  qty: number
  color: string
}

function trackEvent(_name: string, _data?: Record<string, unknown>) {
  return undefined
}

function getFallbackImage(category: string, coverUrl?: string | null) {
  if (coverUrl) {
    return coverUrl
  }

  const normalizedCategory = (category || '').toLowerCase()

  if (normalizedCategory.includes('festival') || normalizedCategory.includes('show') || normalizedCategory.includes('musica')) {
    return 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1800&q=80&fit=crop'
  }

  if (normalizedCategory.includes('corporativo') || normalizedCategory.includes('summit')) {
    return 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1800&q=80&fit=crop'
  }

  return 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1800&q=80&fit=crop'
}

function LoadingState() {
  return (
    <PublicLayout showFooter={false}>
      <div className="px-5 py-8 md:px-10 lg:px-16">
        <div className="mx-auto h-[82svh] max-w-7xl animate-pulse rounded-[40px] bg-white/75" />
      </div>
    </PublicLayout>
  )
}

function NotFoundState() {
  return (
    <PublicLayout showFooter={false}>
      <div className="flex min-h-[70svh] items-center justify-center px-5 text-center md:px-10 lg:px-16">
        <div className="rounded-[36px] border border-white/70 bg-white/80 px-10 py-12 shadow-[0_16px_60px_rgba(48,35,18,0.05)]">
          <div className="font-serif text-5xl font-semibold leading-none text-[#1f1a15]">Evento nao encontrado</div>
          <p className="mt-4 text-sm leading-7 text-[#5f5549]">
            O link pode ter expirado ou o evento nao esta mais publico.
          </p>
          <a
            href="/events"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#1f1a15] px-5 py-3 text-sm font-medium text-[#f8f3ea]"
          >
            Voltar para o catalogo
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </PublicLayout>
  )
}

function SuccessScreen({
  slug,
  eventName,
  cart,
  total,
  isFreeOrder,
}: {
  slug: string
  eventName: string
  cart: CartItem[]
  total: number
  isFreeOrder: boolean
}) {
  return (
    <PublicLayout showFooter={false} compactHeader>
      <div className="flex min-h-[74svh] items-center justify-center px-5 py-12 md:px-10 lg:px-16">
        <div className="w-full max-w-3xl rounded-[36px] border border-white/70 bg-white/80 p-8 text-center shadow-[0_16px_60px_rgba(48,35,18,0.05)] md:p-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#eef5ef] text-[#335741]">
            <Check className="h-9 w-9" />
          </div>
          <div className="mt-8 text-[11px] uppercase tracking-[0.3em] text-[#8e7f68]">
            Pedido confirmado
          </div>
          <h1 className="mt-4 font-serif text-5xl font-semibold leading-none text-[#1f1a15] md:text-6xl">
            {isFreeOrder ? 'Sua inscricao foi confirmada.' : 'Sua compra foi concluida.'}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[#5f5549]">
            {isFreeOrder
              ? 'O QR code e a confirmacao serao enviados por e-mail em instantes. A experiencia ja esta reservada para voce.'
              : 'Os ingressos digitais serao enviados por e-mail assim que o pagamento for confirmado pelo gateway.'}
          </p>

          <div className="mt-8 rounded-[28px] border border-[#eee2cf] bg-[#fbf7f1] p-6 text-left">
            <div className="text-[11px] uppercase tracking-[0.28em] text-[#8e7f68]">Resumo</div>
            <div className="mt-4 space-y-3">
              {cart.map((item) => (
                <div key={item.batchId} className="flex items-center justify-between gap-4 text-sm text-[#5f5549]">
                  <span>{item.qty}x {item.ticketName}</span>
                  <span>{item.price === 0 ? 'Gratuito' : formatCurrency(item.price * item.qty)}</span>
                </div>
              ))}
            </div>
            {!isFreeOrder ? (
              <div className="mt-5 border-t border-[#eee2cf] pt-4 font-serif text-2xl text-[#1f1a15]">
                {formatCurrency(total)}
              </div>
            ) : null}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href={`/e/${slug}`}
              className="inline-flex items-center gap-2 rounded-full border border-[#ddd1bf] px-5 py-3 text-sm font-medium text-[#1f1a15]"
            >
              Voltar para {eventName}
            </a>
            <a
              href="/events"
              className="inline-flex items-center gap-2 rounded-full bg-[#1f1a15] px-5 py-3 text-sm font-medium text-[#f8f3ea]"
            >
              Explorar outros eventos
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}

export function EventPage({ slug }: { slug: string }) {
  const publicEventQuery = usePublicEvent(slug)
  const detail = publicEventQuery.data
  const event = detail?.event ?? null
  const ticketTypes = detail?.ticketTypes ?? []
  const mediaPresentation = detail?.mediaPresentation ?? null

  const [cart, setCart] = useState<CartItem[]>([])
  const [liked, setLiked] = useState(false)
  const [step, setStep] = useState<'landing' | 'checkout' | 'success'>('landing')
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    trackEvent('PageView', { slug })

    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => window.removeEventListener('scroll', handleScroll)
  }, [slug])

  const cartQty = cart.reduce((sum, item) => sum + item.qty, 0)
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
  const isFreeMode = event ? event.is_free || event.registration_mode === 'registration' : false
  const isFreeOrder = cartTotal === 0
  const activeBatches = useMemo(
    () =>
      ticketTypes.flatMap((ticketType) =>
        ticketType.batches
          .filter((batch) => batch.is_active && batch.is_visible)
          .map((batch) => batch.price),
      ),
    [ticketTypes],
  )
  const minPrice = useMemo(
    () => {
      const prices = activeBatches.filter((price) => price > 0)
      return prices.length > 0 ? Math.min(...prices) : 0
    },
    [activeBatches],
  )

  function addToCart(ticketTypeId: string, batchId: string) {
    const ticketType = ticketTypes.find((item) => item.id === ticketTypeId)
    const batch = ticketType?.batches.find((item) => item.id === batchId)

    if (!ticketType || !batch) {
      return
    }

    const existing = cart.find((item) => item.batchId === batch.id)
    const currentQuantity = existing?.qty ?? 0
    const available = Math.max(batch.quantity - batch.sold_count - (batch.reserved_count ?? 0), 0)
    const maxPerOrder = batch.max_per_order ?? ticketType.max_per_order ?? available

    if (currentQuantity >= available || currentQuantity >= maxPerOrder) {
      return
    }

    if (existing) {
      setCart((current) => current.map((item) => item.batchId === batch.id ? { ...item, qty: item.qty + 1 } : item))
      return
    }

    setCart((current) => [
      ...current,
      {
        ticketTypeId: ticketType.id,
        batchId: batch.id,
        ticketName: ticketType.name,
        batchName: batch.name,
        price: batch.price,
        qty: 1,
        color: ticketType.color || '#b79e74',
      },
    ])
  }

  function removeFromCart(batchId: string) {
    setCart((current) => {
      const existing = current.find((item) => item.batchId === batchId)

      if (!existing) {
        return current
      }

      if (existing.qty === 1) {
        return current.filter((item) => item.batchId !== batchId)
      }

      return current.map((item) => item.batchId === batchId ? { ...item, qty: item.qty - 1 } : item)
    })
  }

  function shareEvent() {
    const url = window.location.href

    if (navigator.share) {
      void navigator.share({ title: event?.name, url })
      return
    }

    void navigator.clipboard.writeText(url)
  }

  if (publicEventQuery.isPending) {
    return <LoadingState />
  }

  if (!event || !mediaPresentation) {
    return <NotFoundState />
  }

  if (step === 'checkout') {
    return (
      <PublicCheckoutContent
        event={{
          id: event.id,
          organization_id: event.organization_id,
          name: event.name,
        }}
        cart={cart.map((item) => ({
          ticket_type_id: item.ticketTypeId,
          batch_id: item.batchId,
          ticket_name: item.ticketName,
          batch_name: item.batchName,
          price: item.price,
          quantity: item.qty,
          color: item.color,
          max_per_order: ticketTypes.find((ticketType) => ticketType.id === item.ticketTypeId)?.max_per_order ?? null,
        }))}
        onBack={() => setStep('landing')}
        onSuccess={() => setStep('success')}
        onAdd={addToCart}
        onRemove={removeFromCart}
        onInventoryChanged={async () => {
          await publicEventQuery.refetch()
        }}
      />
    )
  }

  if (step === 'success') {
    return (
      <SuccessScreen
        slug={event.slug}
        eventName={event.name}
        cart={cart}
        total={cartTotal}
        isFreeOrder={isFreeOrder}
      />
    )
  }

  const fallbackImage = getFallbackImage(event.category, event.cover_url)
  const occupancy = event.total_capacity > 0 ? Math.round((event.sold_tickets / event.total_capacity) * 100) : 0

  return (
    <PublicLayout
      showFooter={false}
      headerActionSlot={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLiked((current) => !current)}
            className={[
              'flex h-11 w-11 items-center justify-center rounded-full border transition-colors',
              liked ? 'border-[#f0c7cc] bg-[#fff4f5] text-[#a5505b]' : 'border-[#ddd1bf] bg-white/85 text-[#5f5549]',
            ].join(' ')}
          >
            <Heart className={['h-4 w-4', liked ? 'fill-current' : ''].join(' ')} />
          </button>
          <button
            type="button"
            onClick={shareEvent}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#ddd1bf] bg-white/85 text-[#5f5549]"
          >
            <Share2 className="h-4 w-4" />
          </button>
          {cartQty > 0 ? (
            <button
              type="button"
              onClick={() => setStep('checkout')}
              className="inline-flex items-center gap-2 rounded-full bg-[#1f1a15] px-4 py-2.5 text-sm font-medium text-[#f8f3ea]"
            >
              <Ticket className="h-4 w-4" />
              {cartQty} selecionado{cartQty > 1 ? 's' : ''}
            </button>
          ) : null}
        </div>
      }
    >
      <PremiumSection className="pb-10 pt-6 lg:pt-8">
        <div className="overflow-hidden rounded-[40px] border border-white/70 bg-white/80 p-4 shadow-[0_24px_90px_rgba(46,34,17,0.08)] md:p-6">
          <div className="relative min-h-[78svh] overflow-hidden rounded-[32px]">
            <EventHeroMedia
              eventName={event.name}
              coverAsset={mediaPresentation.coverAsset}
              heroAsset={mediaPresentation.heroAsset}
              fallbackImage={fallbackImage}
              scrollY={scrollY}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#201913]/60 via-[#201913]/28 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#201913]/75 via-transparent to-transparent" />

            <div className="relative z-10 flex min-h-[78svh] flex-col justify-between p-7 text-white md:p-10 lg:p-14">
              <div className="flex flex-wrap items-center gap-3">
                <PremiumBadge tone="default">{event.category || 'Evento premium'}</PremiumBadge>
                <PremiumBadge tone="muted">{event.status === 'ongoing' ? 'Ao vivo' : 'Publico'}</PremiumBadge>
                {isFreeMode ? <PremiumBadge tone="success">Inscricao gratuita</PremiumBadge> : null}
              </div>

              <div className="max-w-4xl">
                <PublicReveal>
                  <div className="text-[11px] uppercase tracking-[0.32em] text-white/70">
                    Landing publica com media library real
                  </div>
                  <h1 className="mt-5 font-serif text-5xl font-semibold leading-[0.92] md:text-7xl">
                    {event.name}
                  </h1>
                  {(event.subtitle || event.short_description) ? (
                    <p className="mt-5 max-w-2xl text-base leading-7 text-white/82 md:text-lg">
                      {event.subtitle || event.short_description}
                    </p>
                  ) : null}
                </PublicReveal>

                <PublicReveal className="mt-8 flex flex-wrap items-center gap-4" delayMs={120}>
                  <a
                    href="#tickets"
                    className="inline-flex items-center gap-3 rounded-full bg-[#f8f3ea] px-6 py-3 text-sm font-semibold text-[#1f1a15] transition-all hover:-translate-y-0.5"
                  >
                    {isFreeMode ? 'Garantir inscricao' : 'Comprar ingressos'}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  {!isFreeMode && minPrice > 0 ? (
                    <span className="text-sm text-white/82">a partir de {formatCurrency(minPrice)}</span>
                  ) : null}
                </PublicReveal>
              </div>

              <PublicReveal className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]" delayMs={180}>
                <div className="rounded-[28px] border border-white/20 bg-white/10 p-5 backdrop-blur-md">
                  <div className="grid gap-4 md:grid-cols-3">
                    {[
                      {
                        label: 'Data',
                        value: formatDate(event.starts_at, "dd 'de' MMMM 'de' yyyy"),
                      },
                      {
                        label: 'Venue',
                        value: [event.venue_name, event.venue_address?.city].filter(Boolean).join(' · '),
                      },
                      {
                        label: 'Capacidade',
                        value: `${event.total_capacity.toLocaleString('pt-BR')} pessoas`,
                      },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="text-[10px] uppercase tracking-[0.24em] text-white/56">{item.label}</div>
                        <div className="mt-2 text-sm font-medium text-white">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/20 bg-white/10 p-5 backdrop-blur-md">
                  <div className="text-[10px] uppercase tracking-[0.24em] text-white/56">Procura</div>
                  <div className="mt-3 font-serif text-4xl leading-none">{occupancy}%</div>
                  <p className="mt-2 text-sm leading-6 text-white/76">
                    {event.sold_tickets.toLocaleString('pt-BR')} ingressos vendidos de um total de {event.total_capacity.toLocaleString('pt-BR')}.
                  </p>
                </div>
              </PublicReveal>
            </div>
          </div>
        </div>
      </PremiumSection>

      <PremiumSection className="pt-0">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <EventInfoBlock
            icon={CalendarDays}
            label="Data e horario"
            value={`${formatDate(event.starts_at, "dd 'de' MMMM 'de' yyyy")} · ${formatDate(event.starts_at, 'HH:mm')}`}
          />
          <EventInfoBlock
            icon={Clock3}
            label="Abertura"
            value={event.doors_open_at ? `Portoes as ${formatDate(event.doors_open_at, 'HH:mm')}` : 'Horario confirmado no e-mail'}
          />
          <EventInfoBlock
            icon={MapPin}
            label="Local"
            value={[event.venue_name, event.venue_address?.city, event.venue_address?.state].filter(Boolean).join(' · ')}
          />
          <EventInfoBlock
            icon={ShieldCheck}
            label="Acesso"
            value={isFreeMode ? 'Inscricao validada com QR code digital' : 'Ingresso digital com QR code antifraude'}
          />
        </div>
      </PremiumSection>

      {(event.short_description || event.full_description) ? (
        <PremiumSection
          eyebrow="Narrativa do evento"
          title="Uma pagina de experiencia, nao apenas uma ficha tecnica."
          description={event.short_description}
          className="pt-0"
        >
          {event.full_description ? (
            <div className="rounded-[32px] border border-white/70 bg-white/80 p-7 text-base leading-8 text-[#5f5549] shadow-[0_16px_60px_rgba(48,35,18,0.05)] md:p-10">
              {event.full_description}
            </div>
          ) : null}
        </PremiumSection>
      ) : null}

      <EventMediaGallery presentation={mediaPresentation} />

      <PremiumSection
        eyebrow="Ingressos e acessos"
        title={isFreeMode ? 'Escolha sua modalidade de inscricao.' : 'Selecione a experiencia ideal para o seu publico.'}
        description="Todos os lotes abaixo respeitam disponibilidade real, contagem de vendidos e regras de compra por pedido."
        className="pt-0"
      >
        <div id="tickets" className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            {ticketTypes.map((ticketType, ticketTypeIndex) => {
              const visibleBatches = ticketType.batches.filter((batch) => batch.is_active && batch.is_visible)
              const soldOut = visibleBatches.every((batch) => batch.quantity - batch.sold_count - batch.reserved_count <= 0)

              return (
                <PublicReveal key={ticketType.id} delayMs={ticketTypeIndex * 80}>
                  <div className="rounded-[32px] border border-white/70 bg-white/82 p-6 shadow-[0_16px_60px_rgba(48,35,18,0.05)] md:p-7">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="text-[11px] uppercase tracking-[0.28em] text-[#8e7f68]">
                          {ticketType.sector || 'Ticket type'}
                        </div>
                        <h3 className="mt-3 font-serif text-3xl font-semibold leading-none text-[#1f1a15]">
                          {ticketType.name}
                        </h3>
                        {ticketType.description ? (
                          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5f5549]">
                            {ticketType.description}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {ticketType.is_nominal ? <PremiumBadge tone="default">Nominal</PremiumBadge> : null}
                        {ticketType.is_transferable ? <PremiumBadge tone="muted">Transferivel</PremiumBadge> : null}
                        {soldOut ? <PremiumBadge tone="accent">Esgotando</PremiumBadge> : null}
                      </div>
                    </div>

                    {ticketType.benefits?.length ? (
                      <div className="mt-5 flex flex-wrap gap-2">
                        {ticketType.benefits.map((benefit) => (
                          <span
                            key={benefit}
                            className="rounded-full border border-[#eee2cf] bg-[#fbf7f1] px-3 py-1.5 text-xs text-[#6e6253]"
                          >
                            {benefit}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <div className="mt-6 space-y-3">
                      {visibleBatches.length > 0 ? (
                        visibleBatches.map((batch) => {
                          const available = Math.max(batch.quantity - batch.sold_count - batch.reserved_count, 0)
                          const selectedItem = cart.find((item) => item.batchId === batch.id)
                          const selectedQuantity = selectedItem?.qty ?? 0
                          const maxPerOrder = batch.max_per_order ?? ticketType.max_per_order ?? available
                          const isDisabled = available === 0 || selectedQuantity >= maxPerOrder

                          return (
                            <div
                              key={batch.id}
                              className="rounded-[26px] border border-[#eee2cf] bg-[#fbf7f1] p-5"
                            >
                              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="h-2.5 w-2.5 rounded-full"
                                      style={{ background: ticketType.color || '#b79e74' }}
                                    />
                                    <div className="text-sm font-semibold text-[#1f1a15]">{batch.name}</div>
                                  </div>
                                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-[#7c6f60]">
                                    <span>{available.toLocaleString('pt-BR')} disponiveis</span>
                                    {batch.ends_at ? <span>encerra em {formatDate(batch.ends_at, "dd/MM 'as' HH:mm")}</span> : null}
                                    <span>max {maxPerOrder} por pedido</span>
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-4">
                                  <div className="font-serif text-3xl leading-none text-[#1f1a15]">
                                    {batch.price === 0 ? 'Gratuito' : formatCurrency(batch.price)}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => removeFromCart(batch.id)}
                                      disabled={!selectedQuantity}
                                      className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ddd1bf] text-[#5f5549] disabled:opacity-40"
                                    >
                                      −
                                    </button>
                                    <span className="w-10 text-center text-sm font-medium text-[#1f1a15]">
                                      {selectedQuantity}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => addToCart(ticketType.id, batch.id)}
                                      disabled={isDisabled}
                                      className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1f1a15] text-[#f8f3ea] disabled:opacity-40"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        <div className="rounded-[26px] border border-[#eee2cf] bg-[#fbf7f1] p-5 text-sm text-[#7c6f60]">
                          Nenhum lote disponivel para este ticket no momento.
                        </div>
                      )}
                    </div>
                  </div>
                </PublicReveal>
              )
            })}
          </div>

          <div className="lg:sticky lg:top-28 lg:self-start">
            <PublicReveal>
              <div className="rounded-[34px] border border-white/70 bg-white/82 p-6 shadow-[0_16px_60px_rgba(48,35,18,0.05)] md:p-7">
                <div className="text-[11px] uppercase tracking-[0.28em] text-[#8e7f68]">Seu pedido</div>
                <div className="mt-4 font-serif text-4xl font-semibold leading-none text-[#1f1a15]">
                  {cartQty > 0 ? `${cartQty} selecionado${cartQty > 1 ? 's' : ''}` : 'Monte sua experiencia'}
                </div>
                <p className="mt-3 text-sm leading-7 text-[#5f5549]">
                  {cartQty > 0
                    ? 'Revise seus lotes e siga para o checkout premium. A reserva de inventario acontece no proximo passo.'
                    : 'Escolha lotes ou modalidades acima para liberar o checkout. A reserva so comeca quando voce avancar.'}
                </p>

                <div className="mt-6 space-y-3">
                  {cart.length > 0 ? (
                    cart.map((item) => (
                      <div key={item.batchId} className="rounded-[24px] border border-[#eee2cf] bg-[#fbf7f1] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold text-[#1f1a15]">{item.ticketName}</div>
                            <div className="mt-1 text-xs text-[#7c6f60]">{item.batchName}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-[#1f1a15]">{item.qty}x</div>
                            <div className="mt-1 text-xs text-[#7c6f60]">
                              {item.price === 0 ? 'Gratuito' : formatCurrency(item.price * item.qty)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[24px] border border-dashed border-[#ddd1bf] bg-[#fbf7f1] p-5 text-sm text-[#7c6f60]">
                      Ainda nao ha lotes selecionados.
                    </div>
                  )}
                </div>

                <div className="mt-6 rounded-[26px] border border-[#eee2cf] bg-[#fbf7f1] p-5">
                  <div className="flex items-center justify-between text-sm text-[#7c6f60]">
                    <span>Subtotal</span>
                    <span>{cartTotal === 0 ? 'Gratuito' : formatCurrency(cartTotal)}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-[#eee2cf] pt-4">
                    <span className="text-sm font-medium text-[#1f1a15]">Total nesta selecao</span>
                    <span className="font-serif text-3xl leading-none text-[#1f1a15]">
                      {cartTotal === 0 ? 'Gratuito' : formatCurrency(cartTotal)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep('checkout')}
                  disabled={cartQty === 0}
                  className="mt-6 flex w-full items-center justify-center gap-3 rounded-full bg-[#1f1a15] px-5 py-4 text-sm font-semibold text-[#f8f3ea] transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Ir para o checkout
                  <ChevronRight className="h-4 w-4" />
                </button>

                <div className="mt-6 space-y-3 text-sm text-[#5f5549]">
                  {[
                    'Reserva temporaria de inventario no checkout',
                    'Pagamento protegido e emissao automatica de ticket digital',
                    isFreeMode ? 'Inscricao com validacao por QR code' : 'Acesso com QR code antifraude',
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <Sparkles className="mt-0.5 h-4 w-4 text-[#7b6440]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </PublicReveal>
          </div>
        </div>
      </PremiumSection>

      <PremiumSection className="pt-0">
        <div className="rounded-[36px] border border-white/70 bg-[linear-gradient(135deg,#1f1a15_0%,#2d241d_100%)] p-8 text-white shadow-[0_20px_80px_rgba(20,12,3,0.16)] md:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.7fr] lg:items-end">
            <div>
              <div className="text-[11px] uppercase tracking-[0.32em] text-white/55">Confirmação instantanea</div>
              <div className="mt-4 font-serif text-4xl font-semibold leading-none md:text-5xl">
                Uma jornada de compra mais limpa, confiavel e pronta para conversao.
              </div>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/72">
                O checkout da camada publica foi refinado para transmitir seguranca, clareza de valor e sensacao de experiencia premium, sem alterar a logica de pagamento, reserva e emissao que ja sustenta o produto.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {[
                `${event.checked_in_count?.toLocaleString('pt-BR') ?? '0'} check-ins registrados`,
                `${event.sold_tickets.toLocaleString('pt-BR')} tickets ja emitidos`,
                event.age_rating ? `Classificacao ${event.age_rating}` : 'Politica de acesso enviada por e-mail',
              ].map((item) => (
                <div key={item} className="rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm text-white/76">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </PremiumSection>
    </PublicLayout>
  )
}
