import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Check, Heart, Share2, Ticket } from 'lucide-react'
import type { EventMediaAsset } from '@/features/event-media/types'
import { PublicCheckoutContent } from '@/features/orders'
import {
  EventCinematicHero,
  EventFinalCTA,
  EventInformationHighlights,
  EventManifestSection,
  EventMediaGalleryPremium,
  EventStorySection,
  EventTicketPanelPremium,
  PublicLayout,
  StickyPurchaseCTA,
  usePublicEvent,
} from '@/features/public'
import { formatCurrency } from '@/shared/lib'

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
        <div className="mx-auto h-[82svh] max-w-7xl animate-pulse rounded-[2.6rem] bg-white/75" />
      </div>
    </PublicLayout>
  )
}

function NotFoundState() {
  return (
    <PublicLayout showFooter={false}>
      <div className="flex min-h-[70svh] items-center justify-center px-5 text-center md:px-10 lg:px-16">
        <div className="rounded-[2.2rem] border border-white/70 bg-white/80 px-10 py-12 shadow-[0_18px_55px_rgba(48,35,18,0.06)]">
          <div className="font-display text-[3.4rem] font-semibold leading-[0.9] tracking-[-0.04em] text-[#1f1a15]">Evento nao encontrado</div>
          <p className="mt-4 text-sm leading-7 text-[#5f5549]">
            O link pode ter expirado ou a experiencia nao esta mais publica.
          </p>
          <a
            href="/events"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#1f1a15] px-5 py-3 text-sm font-medium text-[#f8f3ea]"
          >
            Voltar para experiencias
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
        <div className="w-full max-w-3xl rounded-[2.3rem] border border-white/70 bg-white/80 p-8 text-center shadow-[0_18px_55px_rgba(48,35,18,0.06)] md:p-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#eef5ef] text-[#335741]">
            <Check className="h-9 w-9" />
          </div>
          <div className="mt-8 text-[11px] uppercase tracking-[0.3em] text-[#8e7f68]">Pedido confirmado</div>
          <h1 className="mt-4 font-display text-[clamp(3rem,5vw,5rem)] font-semibold leading-[0.9] tracking-[-0.04em] text-[#1f1a15]">
            {isFreeOrder ? 'Sua inscricao foi confirmada.' : 'Sua compra foi concluida.'}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[#5f5549]">
            {isFreeOrder
              ? 'O QR code e a confirmacao chegam por e-mail em instantes. A experiencia ja esta reservada para voce.'
              : 'Os ingressos digitais serao enviados assim que o pagamento for confirmado pelo gateway.'}
          </p>

          <div className="mt-8 rounded-[1.8rem] border border-[#eee2cf] bg-[#fbf7f1] p-6 text-left">
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
              <div className="mt-5 border-t border-[#eee2cf] pt-4 font-display text-[2.2rem] font-semibold leading-none tracking-[-0.04em] text-[#1f1a15]">
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
  const storySections = [
    {
      eyebrow: 'A experiencia',
      title: 'Uma narrativa pensada para criar expectativa antes da primeira entrada.',
      description:
        event.full_description ||
        `${event.name} combina ritmo visual, presenca de marca e uma operacao pronta para sustentar uma experiencia de alto nivel do primeiro clique ao ultimo check-in.`,
      asset: storyAssets[0] ?? mediaPresentation.coverAsset,
      highlights: [
        { label: 'Abertura', value: event.doors_open_at ? new Date(event.doors_open_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Horario confirmado por e-mail' },
        { label: 'Cidade', value: event.venue_address?.city || event.venue_name || 'Local em curadoria' },
        { label: 'Capacidade', value: `${event.total_capacity.toLocaleString('pt-BR')} pessoas` },
        { label: 'Status', value: event.status === 'ongoing' ? 'Experiencia em andamento' : 'Experiencia com acesso publico' },
      ],
    },
    {
      eyebrow: 'O ambiente',
      title: 'Um contexto visual que faz o evento parecer inevitavel.',
      description:
        `${event.venue_name || 'O venue'} recebe ${event.name} como um espaco de atmosfera controlada, pensado para destacar luz, escala, chegada e memorabilidade.` +
        ` A pagina traduz isso com composicao editorial e assets reais da media library.`,
      asset: storyAssets[1] ?? mediaPresentation.galleryImages[0] ?? mediaPresentation.coverAsset,
      reverse: true,
      highlights: [
        { label: 'Venue', value: event.venue_name || 'Venue principal' },
        { label: 'Categoria', value: event.category || 'Experiencia premium' },
        { label: 'Demanda', value: `${event.sold_tickets.toLocaleString('pt-BR')} acessos vendidos` },
        { label: 'Classificacao', value: event.age_rating || 'Consulte politicas de acesso' },
      ],
    },
    {
      eyebrow: 'A jornada',
      title: 'Do acesso ao QR code, a experiencia continua organizada ate a ultima etapa.',
      description:
        isFreeMode
          ? 'Inscricao, confirmacao e entrada foram pensadas para transmitir clareza e exclusividade, sem friccao desnecessaria.'
          : 'Selecao de lotes, checkout refinado e emissao automatica de tickets digitais sustentam a jornada com a mesma elegancia do restante da pagina.',
      asset: storyAssets[2] ?? mediaPresentation.galleryVideos[0] ?? mediaPresentation.galleryImages[1] ?? mediaPresentation.coverAsset,
      highlights: [
        { label: 'Acesso', value: isFreeMode ? 'Inscricao com QR code digital' : 'Ingresso digital com validacao antifraude' },
        { label: 'Check-ins', value: `${event.checked_in_count.toLocaleString('pt-BR')} registros operacionais` },
        { label: 'Conversao', value: minPrice > 0 ? `a partir de ${formatCurrency(minPrice)}` : 'Acesso gratuito' },
        { label: 'Fluxo', value: 'Compra, pagamento e emissao sustentados pelo sistema real' },
      ],
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

      <EventManifestSection event={event} />
      <EventInformationHighlights event={event} isFreeMode={isFreeMode} />

      {storySections.map((section, index) => (
        <EventStorySection
          key={section.eyebrow}
          eyebrow={section.eyebrow}
          title={section.title}
          description={section.description}
          asset={section.asset}
          reverse={Boolean(section.reverse)}
          highlights={section.highlights}
        />
      ))}

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

      <EventFinalCTA event={event} isFreeMode={isFreeMode} />
    </PublicLayout>
  )
}
