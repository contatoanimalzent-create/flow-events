import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Heart, MapPin, ShieldCheck, Ticket } from 'lucide-react'
import type { EventMediaAsset } from '@/features/event-media/types'
import { ReferralTracker, ShareButtons } from '@/features/growth'
import { CheckoutSuccessPage, PublicCheckoutContent } from '@/features/orders'
import {
  EventCinematicHero,
  EventInformationHighlights,
  EventMediaGalleryPremium,
  EventTicketPanelPremium,
  ExploreMoreSection,
  PublicLayout,
  PublicReveal,
  RelatedExperiencesGrid,
  StickyPurchaseCTA,
  usePublicEvent,
  usePublicEvents,
} from '@/features/public'
import { formatCurrency, useSeoMeta } from '@/shared/lib'

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
    return 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=2200&q=80&fit=crop'
  }

  if (normalizedCategory.includes('corporativo') || normalizedCategory.includes('summit')) {
    return 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=2200&q=80&fit=crop'
  }

  return 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=2200&q=80&fit=crop'
}

function LoadingState() {
  return (
    <PublicLayout showFooter={false}>
      <div className="px-5 py-8 md:px-10 lg:px-16">
        <div className="mx-auto h-[82svh] max-w-7xl animate-pulse rounded-[2.6rem] bg-white/5" />
      </div>
    </PublicLayout>
  )
}

function NotFoundState() {
  return (
    <PublicLayout showFooter={false}>
      <div className="flex min-h-[70svh] items-center justify-center px-5 text-center md:px-10 lg:px-16">
        <div className="rounded-[2.2rem] border border-white/8 bg-[linear-gradient(180deg,#0d1117_0%,#121823_100%)] px-10 py-12 shadow-[0_18px_55px_rgba(0,0,0,0.24)]">
          <div className="font-display text-[3.4rem] font-semibold uppercase leading-[0.9] tracking-[-0.04em] text-white">Evento nao encontrado</div>
          <p className="mt-4 text-sm leading-7 text-white/66">
            O link pode ter expirado ou a experiencia nao esta mais publica.
          </p>
          <a
            href="/events"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#ff2d2d] px-5 py-3 text-sm font-medium uppercase tracking-[0.12em] text-white"
          >
            Voltar para experiencias
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </PublicLayout>
  )
}

export function EventPage({ slug }: { slug: string }) {
  const publicEventQuery = usePublicEvent(slug)
  const publicEventsQuery = usePublicEvents()
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

  const minPrice = useMemo(() => {
    const prices = activeBatches.filter((price) => price > 0)
    return prices.length > 0 ? Math.min(...prices) : 0
  }, [activeBatches])

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
      setCart((current) => current.map((item) => (item.batchId === batch.id ? { ...item, qty: item.qty + 1 } : item)))
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

      return current.map((item) => (item.batchId === batchId ? { ...item, qty: item.qty - 1 } : item))
    })
  }

  const storyAssets = useMemo(() => {
    if (!mediaPresentation) {
      return []
    }

    return [
      mediaPresentation.heroAsset,
      mediaPresentation.galleryImages[0],
      mediaPresentation.galleryVideos[0] ?? mediaPresentation.galleryImages[1],
      mediaPresentation.galleryImages[2] ?? mediaPresentation.coverAsset,
    ].filter(Boolean) as EventMediaAsset[]
  }, [mediaPresentation])

  useSeoMeta({
    title: event ? `${event.name} | Animalz Events` : 'Experiencia | Animalz Events',
    description:
      event?.short_description ||
      event?.full_description ||
      'Experiencias premium com narrativa forte, agenda clara e checkout refinado.',
    image:
      mediaPresentation?.heroAsset?.thumbnail_url ||
      mediaPresentation?.heroAsset?.secure_url ||
      mediaPresentation?.coverAsset?.secure_url ||
      event?.cover_url ||
      getFallbackImage(event?.category ?? '', event?.cover_url),
    url: typeof window !== 'undefined' ? window.location.href : event ? `/e/${event.slug}` : '/events',
  })

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
          fee_type: event.fee_type,
          fee_value: event.fee_value,
          absorb_fee: event.absorb_fee,
        }}
        ticketTypes={ticketTypes}
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
      <CheckoutSuccessPage
        slug={event.slug}
        eventName={event.name}
        cart={cart}
        total={cartTotal}
        isFreeOrder={isFreeOrder}
      />
    )
  }

  const fallbackImage = getFallbackImage(event.category, event.cover_url)
  const relatedEvents = (publicEventsQuery.data ?? []).filter((item) => item.id !== event.id)
  const storySections = [
    {
      eyebrow: 'The experience',
      title: 'Uma pagina de evento pensada para vender atmosfera antes de vender acesso.',
      description:
        event.full_description ||
        `${event.name} combina narrativa visual, descoberta premium e uma camada de compra pronta para converter sem perder clareza.`,
      asset: storyAssets[0] ?? mediaPresentation.coverAsset,
      reverse: false,
    },
    {
      eyebrow: 'The venue and journey',
      title: 'Venue, chegada e beneficios apresentados como parte da experiencia comercial.',
      description:
        `${event.venue_name || 'O venue'} entra como parte da promessa da pagina: local, horario, capacidade e regras aparecem com leitura rapida, sem cara de ficha tecnica.` +
        ` O resultado e uma landing mais proxima de um mini-site de evento do que de uma pagina utilitaria.`,
      asset: storyAssets[1] ?? mediaPresentation.galleryImages[0] ?? mediaPresentation.coverAsset,
      reverse: true,
    },
  ]

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
              liked ? 'border-[#ff2d2d]/28 bg-[#ff2d2d]/14 text-white' : 'border-white/10 bg-white/[0.06] text-white',
            ].join(' ')}
          >
            <Heart className={['h-4 w-4', liked ? 'fill-current' : ''].join(' ')} />
          </button>
          {cartQty > 0 ? (
            <button
              type="button"
              onClick={() => setStep('checkout')}
              className="inline-flex items-center gap-2 rounded-full bg-[#ff2d2d] px-4 py-2.5 text-sm font-medium uppercase tracking-[0.12em] text-white"
            >
              <Ticket className="h-4 w-4" />
              {cartQty} selecionado{cartQty > 1 ? 's' : ''}
            </button>
          ) : null}
        </div>
      }
    >
      <ReferralTracker eventId={event.id} />
      <StickyPurchaseCTA
        cartQty={cartQty}
        cartTotal={cartTotal}
        minPrice={minPrice}
        isFreeMode={isFreeMode}
        onCheckout={() => setStep('checkout')}
      />

      <EventCinematicHero
        event={event}
        presentation={mediaPresentation}
        fallbackImage={fallbackImage}
        scrollY={scrollY}
        isFreeMode={isFreeMode}
        minPrice={minPrice}
      />

      <div className="px-5 pt-6 md:px-10 lg:px-16">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,#0d1117_0%,#121823_100%)] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.24)]">
          <div className="max-w-2xl">
            <div className="text-[11px] uppercase tracking-[0.32em] text-white/48">Share and plan</div>
            <p className="mt-3 text-sm leading-7 text-white/66">
              Compartilhe o link do evento, convide seu grupo e avance para a compra quando estiver pronto.
            </p>
          </div>
          <ShareButtons
            organizationId={event.organization_id}
            eventId={event.id}
            eventName={event.name}
            eventSlug={event.slug}
            description={event.short_description}
            tone="dark"
          />
        </div>
      </div>

      <EventInformationHighlights event={event} isFreeMode={isFreeMode} />

      <section className="px-5 py-10 md:px-10 lg:px-16 lg:py-14">
        <div className="mx-auto max-w-7xl space-y-8">
          {storySections.map((section, index) => {
            const assetUrl =
              section.asset?.thumbnail_url ||
              section.asset?.secure_url ||
              fallbackImage

            return (
              <PublicReveal key={section.eyebrow} delayMs={index * 80}>
                <div className="grid gap-6 overflow-hidden rounded-[2.4rem] border border-white/8 bg-[linear-gradient(180deg,#0d1117_0%,#121823_100%)] shadow-[0_20px_60px_rgba(0,0,0,0.24)] lg:grid-cols-2">
                  <div className={section.reverse ? 'order-2 p-8 md:p-10 lg:order-1 lg:p-12' : 'p-8 md:p-10 lg:p-12'}>
                    <div className="text-[11px] uppercase tracking-[0.34em] text-white/48">{section.eyebrow}</div>
                    <h2 className="mt-4 font-display text-[clamp(2.4rem,4vw,3.8rem)] font-semibold uppercase leading-[0.92] tracking-[-0.04em] text-white">
                      {section.title}
                    </h2>
                    <p className="mt-5 text-base leading-8 text-white/66">{section.description}</p>

                    <div className="mt-6 grid gap-3 md:grid-cols-2">
                      {[
                        { icon: MapPin, label: 'Venue', value: event.venue_name || 'Venue em curadoria' },
                        {
                          icon: ShieldCheck,
                          label: 'Acesso',
                          value: isFreeMode ? 'Inscricao digital' : 'Ingresso digital e check-in via QR',
                        },
                      ].map((item) => {
                        const Icon = item.icon

                        return (
                          <div key={item.label} className="rounded-[1.4rem] border border-white/8 bg-white/[0.05] p-4">
                            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.26em] text-white/46">
                              <Icon className="h-4 w-4 text-[#ff6a5c]" />
                              {item.label}
                            </div>
                            <div className="mt-3 text-sm font-medium text-white">{item.value}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className={section.reverse ? 'order-1 min-h-[22rem] lg:order-2' : 'min-h-[22rem]'}>
                    <img src={assetUrl} alt={event.name} className="h-full w-full object-cover" />
                  </div>
                </div>
              </PublicReveal>
            )
          })}
        </div>
      </section>

      <EventMediaGalleryPremium presentation={mediaPresentation} eventName={event.name} />

      <EventTicketPanelPremium
        ticketTypes={ticketTypes}
        cart={cart}
        cartQty={cartQty}
        cartTotal={cartTotal}
        isFreeMode={isFreeMode}
        onAdd={addToCart}
        onRemove={removeFromCart}
        onCheckout={() => setStep('checkout')}
      />

      <section className="px-5 py-10 md:px-10 lg:px-16 lg:py-14">
        <div className="mx-auto max-w-7xl">
          <PublicReveal>
            <div className="rounded-[2.5rem] border border-white/8 bg-[linear-gradient(135deg,#0d1117_0%,#121823_100%)] px-8 py-10 shadow-[0_22px_70px_rgba(0,0,0,0.26)] md:px-10 md:py-12">
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                <div className="max-w-3xl">
                  <div className="text-[11px] uppercase tracking-[0.34em] text-white/48">Final call</div>
                  <h2 className="mt-4 font-display text-[clamp(2.8rem,4vw,4.2rem)] font-semibold uppercase leading-[0.92] tracking-[-0.04em] text-white">
                    {isFreeMode ? 'Confirme sua inscricao enquanto o acesso ainda esta aberto.' : 'Garanta seu lugar antes que os lotes avancem.'}
                  </h2>
                  <p className="mt-4 text-base leading-8 text-white/66 md:text-lg">
                    {isFreeMode
                      ? 'A confirmacao acontece em poucos passos e o QR code chega assim que a inscricao for concluida.'
                      : minPrice > 0
                        ? `Os acessos comecam em ${formatCurrency(minPrice)} e o checkout segue a mesma base operacional do restante da plataforma.`
                        : 'O checkout foi refinado para manter clareza, velocidade e confianca na ultima etapa da compra.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (cartQty > 0) {
                      setStep('checkout')
                      return
                    }

                    document.getElementById('tickets')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#ff2d2d] px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.12em] text-white"
                >
                  {cartQty > 0 ? 'Ir para checkout' : 'Selecionar ingressos'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </PublicReveal>
        </div>
      </section>

      <RelatedExperiencesGrid events={relatedEvents.slice(0, 4)} title="Continue explorando" />
      <ExploreMoreSection currentEventId={event.id} events={publicEventsQuery.data ?? []} />
    </PublicLayout>
  )
}
