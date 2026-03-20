import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import {
  MapPin, Calendar, Clock, Users, ChevronDown, ChevronRight,
  Check, Shield, Zap, Star, ArrowRight, Share2, Heart,
  Ticket, Info, Lock, CreditCard, Smartphone, FileText,
} from 'lucide-react'

/* ── Types ──────────────────────────────────────────────────── */
interface EventData {
  id: string
  name: string
  subtitle: string
  short_description: string
  full_description: string
  category: string
  starts_at: string
  ends_at: string
  doors_open_at: string
  venue_name: string
  venue_address: Record<string, string>
  total_capacity: number
  sold_tickets: number
  age_rating: string
  cover_url?: string
  settings: Record<string, any>
  is_free: boolean
  registration_mode: 'tickets' | 'registration' | 'both'
}

interface TicketType {
  id: string
  name: string
  description: string
  benefits: string[]
  color: string
  sector: string
  is_nominal: boolean
  batches: Batch[]
}

interface Batch {
  id: string
  ticket_type_id: string
  name: string
  price: number
  quantity: number
  sold_count: number
  ends_at?: string
  is_active: boolean
}

interface CartItem {
  ticketTypeId: string
  batchId: string
  ticketName: string
  batchName: string
  price: number
  qty: number
  color: string
}

function trackEvent(name: string, data?: Record<string, any>) {
  console.log('[PIXEL]', name, data)
}

/* ── Copy helper — muda texto baseado em pago/gratuito ──────── */
function copy(isFree: boolean, paid: string, free: string) {
  return isFree ? free : paid
}

/* ── Main ───────────────────────────────────────────────────── */
export function EventPage({ slug }: { slug: string }) {
  const [event, setEvent] = useState<EventData | null>(null)
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<CartItem[]>([])
  const [step, setStep] = useState<'landing' | 'checkout' | 'success'>('landing')
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [scrollY, setScrollY] = useState(0)
  const [liked, setLiked] = useState(false)
  const ticketsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchEvent()
    trackEvent('PageView', { slug })
    const onScroll = () => setScrollY(window.scrollY)
    const onMove = (e: MouseEvent) => setMousePos({
      x: (e.clientX / window.innerWidth - 0.5) * 20,
      y: (e.clientY / window.innerHeight - 0.5) * 20,
    })
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('mousemove', onMove)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('mousemove', onMove)
    }
  }, [slug])

  async function fetchEvent() {
    const { data: ev } = await supabase
      .from('events').select('*').eq('slug', slug).single()
    if (!ev) { setLoading(false); return }
    setEvent(ev)

    const { data: types } = await supabase
      .from('ticket_types').select('*')
      .eq('event_id', ev.id).eq('is_active', true).order('position')
    const { data: batches } = await supabase
      .from('ticket_batches').select('*')
      .eq('event_id', ev.id).order('position')

    const merged = (types ?? []).map(t => ({
      ...t,
      batches: (batches ?? []).filter(b => b.ticket_type_id === t.id),
    }))
    setTicketTypes(merged)
    setLoading(false)
    trackEvent('ViewContent', { event_id: ev.id, event_name: ev.name })
  }

  function addToCart(type: TicketType, batch: Batch) {
    const existing = cart.find(c => c.batchId === batch.id)
    if (existing) {
      setCart(cart.map(c => c.batchId === batch.id ? { ...c, qty: c.qty + 1 } : c))
    } else {
      setCart([...cart, {
        ticketTypeId: type.id, batchId: batch.id,
        ticketName: type.name, batchName: batch.name,
        price: batch.price, qty: 1, color: type.color,
      }])
    }
    trackEvent('AddToCart', { ticket: type.name, price: batch.price })
  }

  function removeFromCart(batchId: string) {
    const existing = cart.find(c => c.batchId === batchId)
    if (!existing) return
    if (existing.qty <= 1) setCart(cart.filter(c => c.batchId !== batchId))
    else setCart(cart.map(c => c.batchId === batchId ? { ...c, qty: c.qty - 1 } : c))
  }

  const cartTotal = cart.reduce((s, c) => s + c.price * c.qty, 0)
  const cartQty   = cart.reduce((s, c) => s + c.qty, 0)
  const occupancy = event ? Math.round((event.sold_tickets / event.total_capacity) * 100) : 0
  const remaining = event ? event.total_capacity - event.sold_tickets : 0
  const isFree    = event?.is_free || event?.registration_mode === 'registration' || cartTotal === 0

  function scrollToTickets() {
    ticketsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    trackEvent('InitiateCheckout')
  }

  function share() {
    if (navigator.share) navigator.share({ title: event?.name, url: window.location.href })
    else navigator.clipboard.writeText(window.location.href)
  }

  if (loading) return <Skeleton />
  if (!event)  return <NotFound />

  if (step === 'checkout') return (
    <CheckoutScreen
      event={event} cart={cart} total={cartTotal} isFree={!!isFree}
      onBack={() => setStep('landing')}
      onSuccess={() => setStep('success')}
      onAdd={addToCart} onRemove={removeFromCart}
      ticketTypes={ticketTypes}
    />
  )
  if (step === 'success') return (
    <SuccessScreen event={event} cart={cart} total={cartTotal} isFree={!!isFree} />
  )

  const minPrice = ticketTypes.length > 0
    ? Math.min(...ticketTypes.flatMap(t => t.batches.filter(b => b.is_active).map(b => b.price)).filter(p => p > 0))
    : 0

  return (
    <div className="min-h-screen bg-[#080808] text-[#f5f5f0] overflow-x-hidden">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
        style={{
          background: scrollY > 60 ? 'rgba(8,8,8,0.96)' : 'transparent',
          backdropFilter: scrollY > 60 ? 'blur(20px)' : 'none',
          borderBottom: scrollY > 60 ? '1px solid rgba(255,255,255,0.06)' : 'none',
          transition: 'all 0.3s',
        }}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#d4ff00] rounded-sm flex items-center justify-center">
            <span style={{ fontFamily: 'Bebas Neue, sans-serif', color: '#080808', fontSize: 11 }}>A</span>
          </div>
          <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 15, letterSpacing: 2 }}>
            ANIMALZ<span style={{ color: '#d4ff00' }}>.</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setLiked(!liked)}
            className={cn('p-2 rounded-sm transition-all', liked ? 'text-[#FF5A6B]' : 'text-[#6b6b6b] hover:text-[#f5f5f0]')}>
            <Heart className={cn('w-4 h-4', liked && 'fill-current')} />
          </button>
          <button onClick={share} className="p-2 rounded-sm text-[#6b6b6b] hover:text-[#f5f5f0] transition-all">
            <Share2 className="w-4 h-4" />
          </button>
          {cartQty > 0 && (
            <button onClick={() => setStep('checkout')}
              className="flex items-center gap-2 bg-[#d4ff00] text-[#080808] px-4 py-2 rounded-sm text-xs font-bold tracking-wider hover:shadow-[0_0_20px_rgba(212,255,0,0.4)] transition-all">
              <Ticket className="w-3.5 h-3.5" />
              {cartQty} {copy(!!isFree, `ingresso${cartQty > 1 ? 's' : ''}`, `inscrição${cartQty > 1 ? 'ões' : ''}`)}
              {!isFree && ` · ${formatCurrency(cartTotal)}`}
            </button>
          )}
        </div>
      </nav>

      {/* HERO */}
      <div className="relative min-h-[100svh] flex flex-col overflow-hidden">
        {event.cover_url ? (
          <img src={event.cover_url} alt={event.name}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ transform: `scale(1.1) translateY(${scrollY * 0.15}px)`, transition: 'transform 0.1s ease-out' }} />
        ) : (
          <div className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse 80% 60% at 50% 30%, rgba(212,255,0,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 80% at 80% 80%, rgba(139,124,255,0.06) 0%, transparent 60%), #080808',
              transform: `translate(${mousePos.x * 0.3}px, ${mousePos.y * 0.3}px)`,
              transition: 'transform 0.15s ease-out',
            }} />
        )}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#d4ff00 1px, transparent 1px), linear-gradient(90deg, #d4ff00 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(8,8,8,0.4) 0%, rgba(8,8,8,0.2) 40%, rgba(8,8,8,0.9) 85%, #080808 100%)' }} />

        <div className="relative z-10 flex flex-col justify-end flex-1 px-6 md:px-16 pb-16 pt-28 max-w-5xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-[10px] font-mono tracking-[0.3em] text-[#d4ff00] uppercase border border-[#d4ff00]/30 px-3 py-1.5 rounded-sm">
              {event.category}
            </span>
            {/* Badge gratuito/pago */}
            {isFree ? (
              <span className="text-[10px] font-mono text-[#5BE7C4] border border-[#5BE7C4]/30 px-3 py-1.5 rounded-sm">
                INSCRIÇÃO GRATUITA
              </span>
            ) : remaining < 200 && remaining > 0 ? (
              <span className="flex items-center gap-1.5 text-[10px] font-mono text-[#FFB020] border border-[#FFB020]/30 px-3 py-1.5 rounded-sm animate-pulse">
                <Zap className="w-3 h-3" /> Apenas {remaining} ingressos restantes
              </span>
            ) : null}
          </div>

          <h1 className="leading-none mb-4"
            style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(52px, 9vw, 120px)', letterSpacing: '-0.02em', transform: `translateY(${scrollY * 0.08}px)` }}>
            {event.name}<span style={{ color: '#d4ff00' }}>.</span>
          </h1>

          {event.subtitle && (
            <p className="text-[#9a9a9a] text-lg max-w-xl mb-8 leading-relaxed">{event.subtitle}</p>
          )}

          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 mb-10">
            <span className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-[#d4ff00]" />
              {formatDate(event.starts_at, "dd 'de' MMMM 'de' yyyy")}
            </span>
            <span className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-[#d4ff00]" />
              {formatDate(event.starts_at, 'HH:mm')}
              {event.doors_open_at && ` · Portas às ${formatDate(event.doors_open_at, 'HH:mm')}`}
            </span>
            <span className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-[#d4ff00]" />
              {event.venue_name} · {event.venue_address?.city}/{event.venue_address?.state}
            </span>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <button onClick={scrollToTickets}
              className="flex items-center gap-3 bg-[#d4ff00] text-[#080808] px-8 py-4 rounded-sm text-sm font-bold tracking-wider hover:shadow-[0_0_50px_rgba(212,255,0,0.5)] transition-all duration-300 hover:scale-105 active:scale-95">
              {copy(!!isFree, 'GARANTIR INGRESSO', 'FAZER INSCRIÇÃO')}
              <ArrowRight className="w-4 h-4" />
            </button>
            {!isFree && minPrice > 0 && (
              <div className="text-xs text-[#6b6b6b]">
                a partir de <span className="text-[#f5f5f0] font-semibold">{formatCurrency(minPrice)}</span>
              </div>
            )}
            {isFree && (
              <span className="text-xs text-[#5BE7C4] font-mono">100% gratuito</span>
            )}
          </div>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce">
          <ChevronDown className="w-5 h-5 text-[#6b6b6b]" />
        </div>
      </div>

      {/* OCCUPANCY BAR */}
      {event.settings?.show_remaining_tickets && (
        <div className="px-6 md:px-16 py-4 bg-[#0e0e0e] border-b border-[#1a1a1a]">
          <div className="max-w-4xl flex items-center gap-4">
            <div className="flex-1 h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
              <div className={cn('h-full rounded-full transition-all duration-1000',
                occupancy > 80 ? 'bg-[#FF5A6B]' : occupancy > 60 ? 'bg-[#FFB020]' : 'bg-[#d4ff00]')}
                style={{ width: `${Math.max(occupancy, 2)}%` }} />
            </div>
            <span className="text-xs font-mono text-[#9a9a9a] whitespace-nowrap">
              {occupancy > 0
                ? `${occupancy}% ${copy(!!isFree, 'vendido', 'inscrito')}`
                : `${event.total_capacity.toLocaleString('pt-BR')} vagas disponíveis`}
            </span>
          </div>
        </div>
      )}

      {/* ABOUT */}
      {event.short_description && (
        <section className="px-6 md:px-16 py-20 max-w-4xl mx-auto">
          <div className="text-[10px] font-mono tracking-[0.3em] text-[#d4ff00] mb-4 uppercase">Sobre o evento</div>
          <p className="text-[#9a9a9a] text-lg leading-relaxed">{event.short_description}</p>
        </section>
      )}

      {/* HIGHLIGHTS */}
      <section className="px-6 md:px-16 py-10 border-y border-[#1a1a1a]">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Users,  label: `${event.total_capacity.toLocaleString('pt-BR')} vagas`, desc: 'capacidade total' },
            { icon: Star,   label: 'Classificação', desc: event.age_rating === 'livre' ? 'Livre para todos' : `+${event.age_rating} anos` },
            { icon: Shield, label: isFree ? 'Inscrição segura' : 'Ingresso seguro', desc: 'QR code antifraude' },
            { icon: Zap,    label: 'Acesso digital', desc: 'Receba por e-mail' },
          ].map((h, i) => {
            const Icon = h.icon
            return (
              <div key={i} className="flex items-start gap-3">
                <div className="w-9 h-9 bg-[#d4ff00]/8 border border-[#d4ff00]/15 rounded-sm flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-[#d4ff00]" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#f5f5f0]">{h.label}</div>
                  <div className="text-xs text-[#6b6b6b] mt-0.5">{h.desc}</div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* TICKETS / INSCRIÇÕES */}
      <section ref={ticketsRef} className="px-6 md:px-16 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-[10px] font-mono tracking-[0.3em] text-[#d4ff00] mb-4 uppercase">
            {copy(!!isFree, 'Ingressos', 'Inscrições')}
          </div>
          <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(36px, 5vw, 64px)', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 32 }}>
            {copy(!!isFree, 'ESCOLHA SUA', 'ESCOLHA SUA')}<br />
            {copy(!!isFree, 'EXPERIÊNCIA', 'MODALIDADE')}<span style={{ color: '#d4ff00' }}>.</span>
          </h2>

          <div className="space-y-4">
            {ticketTypes.map((type, i) => {
              const activeBatch = type.batches.find(b => b.is_active)
              if (!activeBatch) return null
              const cartItem = cart.find(c => c.batchId === activeBatch.id)
              const available = activeBatch.quantity - activeBatch.sold_count
              const isSoldOut = available <= 0
              const typeFree  = activeBatch.price === 0

              return (
                <div key={type.id}
                  className={cn('border rounded-sm overflow-hidden transition-all duration-300',
                    cartItem ? 'border-[#d4ff00]/40 bg-[#d4ff00]/3' : 'border-[#1a1a1a] hover:border-[#d4ff00]/20 bg-[#0e0e0e]',
                    isSoldOut && 'opacity-50'
                  )}>
                  <div className="p-6 flex items-start gap-6">
                    <div className="w-1 self-stretch rounded-full shrink-0" style={{ background: type.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 24, letterSpacing: 1, color: '#f5f5f0', lineHeight: 1 }}>
                              {type.name}
                            </h3>
                            {typeFree && (
                              <span className="text-[10px] font-mono text-[#5BE7C4] border border-[#5BE7C4]/30 px-2 py-0.5 rounded-sm">
                                GRATUITO
                              </span>
                            )}
                          </div>
                          {type.description && <p className="text-xs text-[#6b6b6b] mb-3">{type.description}</p>}
                          {type.benefits?.length > 0 && (
                            <ul className="space-y-1">
                              {type.benefits.map((b, bi) => (
                                <li key={bi} className="flex items-center gap-2 text-xs text-[#9a9a9a]">
                                  <Check className="w-3 h-3 text-[#d4ff00] shrink-0" />{b}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-3 shrink-0">
                          <div className="text-right">
                            {typeFree ? (
                              <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 28, color: '#5BE7C4', lineHeight: 1 }}>
                                GRATUITO
                              </div>
                            ) : (
                              <>
                                <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 32, color: '#d4ff00', lineHeight: 1 }}>
                                  {formatCurrency(activeBatch.price)}
                                </div>
                                <div className="text-[11px] text-[#6b6b6b] font-mono">por pessoa</div>
                              </>
                            )}
                          </div>

                          {isSoldOut ? (
                            <div className="text-xs text-[#6b6b6b] font-mono border border-[#242424] px-4 py-2 rounded-sm">
                              {copy(typeFree, 'ESGOTADO', 'VAGAS ESGOTADAS')}
                            </div>
                          ) : cartItem ? (
                            <div className="flex items-center gap-2">
                              <button onClick={() => removeFromCart(activeBatch.id)}
                                className="w-8 h-8 border border-[#242424] rounded-sm text-[#f5f5f0] hover:border-[#d4ff00]/40 transition-all flex items-center justify-center text-lg font-light">−</button>
                              <span className="w-8 text-center text-sm font-mono text-[#d4ff00]">{cartItem.qty}</span>
                              <button onClick={() => addToCart(type, activeBatch)}
                                className="w-8 h-8 border border-[#d4ff00]/40 rounded-sm text-[#d4ff00] hover:bg-[#d4ff00]/10 transition-all flex items-center justify-center text-lg font-light">+</button>
                            </div>
                          ) : (
                            <button onClick={() => addToCart(type, activeBatch)}
                              className="bg-[#d4ff00] text-[#080808] px-5 py-2.5 rounded-sm text-xs font-bold tracking-wider hover:shadow-[0_0_20px_rgba(212,255,0,0.4)] transition-all active:scale-95">
                              {copy(typeFree, 'INSCREVER', 'ADICIONAR')}
                            </button>
                          )}

                          {!isSoldOut && available < 50 && (
                            <span className="text-[10px] text-[#FFB020] font-mono">
                              {copy(typeFree, `Restam ${available} vagas`, `Restam ${available}`)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-8 flex items-center gap-6 flex-wrap">
            {[
              { icon: Shield,  text: copy(!!isFree, 'Compra 100% segura', 'Inscrição 100% segura') },
              { icon: Lock,    text: 'Dados criptografados' },
              { icon: Ticket,  text: 'QR code antifraude' },
            ].map((g, i) => {
              const Icon = g.icon
              return (
                <span key={i} className="flex items-center gap-1.5 text-[11px] text-[#6b6b6b]">
                  <Icon className="w-3.5 h-3.5 text-[#d4ff00]" />{g.text}
                </span>
              )
            })}
          </div>
        </div>
      </section>

      {/* LOCAL */}
      <section className="px-6 md:px-16 py-16 border-t border-[#1a1a1a]">
        <div className="max-w-4xl mx-auto">
          <div className="text-[10px] font-mono tracking-[0.3em] text-[#d4ff00] mb-4 uppercase">Local</div>
          <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(28px, 4vw, 48px)', letterSpacing: '-0.01em', lineHeight: 1, marginBottom: 16 }}>
            {event.venue_name}
          </h2>
          <p className="text-[#9a9a9a] text-sm mb-6">
            {event.venue_address?.street}, {event.venue_address?.city} — {event.venue_address?.state}
          </p>
          <a href={`https://maps.google.com/?q=${encodeURIComponent(`${event.venue_name}, ${event.venue_address?.city}`)}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs text-[#d4ff00] border border-[#d4ff00]/30 px-4 py-2.5 rounded-sm hover:bg-[#d4ff00]/8 transition-all">
            <MapPin className="w-3.5 h-3.5" /> Ver no Google Maps
          </a>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="px-6 md:px-16 py-20 relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(212,255,0,0.05) 0%, transparent 70%)' }} />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(36px, 6vw, 80px)', letterSpacing: '-0.02em', lineHeight: 0.95, marginBottom: 16 }}>
            {copy(!!isFree, 'NÃO FIQUE', 'NÃO PERCA')}<br />
            {copy(!!isFree, 'DE FORA', 'SUA VAGA')}<span style={{ color: '#d4ff00' }}>.</span>
          </h2>
          <p className="text-[#9a9a9a] mb-10 text-sm">
            {copy(!!isFree,
              'Os ingressos acabam antes do evento. Garanta o seu agora.',
              'As vagas são limitadas. Faça sua inscrição gratuita agora.'
            )}
          </p>
          <button onClick={scrollToTickets}
            className="inline-flex items-center gap-3 bg-[#d4ff00] text-[#080808] px-10 py-5 rounded-sm text-sm font-bold tracking-wider hover:shadow-[0_0_50px_rgba(212,255,0,0.5)] transition-all hover:scale-105 active:scale-95">
            {copy(!!isFree, 'GARANTIR INGRESSO', 'FAZER INSCRIÇÃO')} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#1a1a1a] px-6 py-8 text-center">
        <div className="text-[11px] text-[#6b6b6b] font-mono">
          Realização:{' '}
          <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 14, color: '#f5f5f0', letterSpacing: 1 }}>
            ANIMALZ<span style={{ color: '#d4ff00' }}>.</span>EVENTS
          </span>{' '}· Plataforma certificada de {copy(!!isFree, 'venda de ingressos', 'inscrições')}
        </div>
      </footer>

      {/* FLOATING CART */}
      {cartQty > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <button onClick={() => setStep('checkout')}
            className="flex items-center gap-4 bg-[#d4ff00] text-[#080808] px-6 py-4 rounded-sm shadow-[0_8px_32px_rgba(212,255,0,0.4)] hover:shadow-[0_8px_40px_rgba(212,255,0,0.6)] transition-all hover:scale-105 active:scale-95">
            <div className="flex items-center gap-2 font-mono font-bold text-sm">
              <Ticket className="w-4 h-4" />
              {cartQty} {copy(!!isFree, `ingresso${cartQty > 1 ? 's' : ''}`, `inscrição${cartQty > 1 ? 'ões' : ''}`)}
            </div>
            {!isFree && cartTotal > 0 && (
              <>
                <div className="w-px h-5 bg-[#080808]/20" />
                <div className="font-bold text-base">{formatCurrency(cartTotal)}</div>
              </>
            )}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Checkout ───────────────────────────────────────────────── */
function CheckoutScreen({ event, cart, total, isFree, onBack, onSuccess, onAdd, onRemove, ticketTypes }: {
  event: EventData; cart: CartItem[]; total: number; isFree: boolean
  onBack: () => void; onSuccess: () => void
  onAdd: (type: any, batch: any) => void; onRemove: (id: string) => void
  ticketTypes: TicketType[]
}) {
  const [form, setForm] = useState({ name: '', email: '', cpf: '', phone: '' })
  const [method, setMethod] = useState<'pix' | 'credit_card' | 'boleto' | 'free'>('pix')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isFree) setMethod('free')
  }, [isFree])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit() {
    if (!form.name.trim() || !form.email.trim()) { setError('Preencha nome e e-mail'); return }
    setSaving(true); setError('')

    const { data: order, error: err } = await supabase.from('orders').insert({
      event_id: event.id,
      organization_id: '00000000-0000-0000-0000-000000000001',
      buyer_name: form.name,
      buyer_email: form.email,
      buyer_cpf: form.cpf,
      buyer_phone: form.phone,
      subtotal: total,
      discount_amount: 0,
      fee_amount: 0,
      total_amount: total,
      status: isFree ? 'paid' : 'pending',
      payment_method: method,
    }).select().single()

    if (err || !order) { setError('Erro ao processar. Tente novamente.'); setSaving(false); return }

    for (const item of cart) {
      await supabase.from('order_items').insert({
        order_id: order.id,
        ticket_type_id: item.ticketTypeId,
        batch_id: item.batchId,
        holder_name: form.name,
        holder_email: form.email,
        unit_price: item.price,
        quantity: item.qty,
        total_price: item.price * item.qty,
      })
    }

    trackEvent(isFree ? 'CompleteRegistration' : 'Purchase', { value: total, currency: 'BRL' })
    setSaving(false)
    onSuccess()
  }

  return (
    <div className="min-h-screen bg-[#080808] text-[#f5f5f0]">
      <nav className="sticky top-0 z-50 flex items-center gap-4 px-6 py-4 bg-[#080808]/95 border-b border-[#1a1a1a] backdrop-blur-sm">
        <button onClick={onBack} className="text-[#6b6b6b] hover:text-[#f5f5f0] text-xs font-mono transition-colors">← VOLTAR</button>
        <div className="flex-1" />
        <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 16, letterSpacing: 2 }}>
          ANIMALZ<span style={{ color: '#d4ff00' }}>.</span>
        </span>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12 space-y-8">
        <div>
          <div className="text-[10px] font-mono tracking-[0.3em] text-[#d4ff00] mb-2">
            {copy(isFree, 'CHECKOUT', 'INSCRIÇÃO')}
          </div>
          <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 40, letterSpacing: '-0.01em', lineHeight: 1 }}>
            {copy(isFree, 'FINALIZE SEU', 'CONFIRME SUA')}<br />
            {copy(isFree, 'PEDIDO', 'INSCRIÇÃO')}<span style={{ color: '#d4ff00' }}>.</span>
          </h1>
        </div>

        {/* Resumo */}
        <div className="border border-[#1a1a1a] rounded-sm overflow-hidden">
          <div className="px-5 py-3 bg-[#0e0e0e] border-b border-[#1a1a1a]">
            <span className="text-[10px] font-mono tracking-widest text-[#6b6b6b] uppercase">Resumo</span>
          </div>
          {cart.map(item => (
            <div key={item.batchId} className="flex items-center justify-between px-5 py-3.5 border-b border-[#1a1a1a] last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
                <div>
                  <div className="text-sm font-medium">{item.ticketName}</div>
                  <div className="text-[11px] text-[#6b6b6b] font-mono">{item.batchName} · {item.qty}x</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[#d4ff00]">
                  {item.price === 0 ? 'Gratuito' : formatCurrency(item.price * item.qty)}
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => onRemove(item.batchId)}
                    className="w-6 h-6 border border-[#242424] rounded-sm text-[#9a9a9a] hover:text-[#f5f5f0] flex items-center justify-center text-sm">−</button>
                  <span className="w-5 text-center text-xs font-mono">{item.qty}</span>
                  <button onClick={() => {
                    const type = ticketTypes.find(t => t.id === item.ticketTypeId)
                    const batch = type?.batches.find(b => b.id === item.batchId)
                    if (type && batch) onAdd(type, batch)
                  }} className="w-6 h-6 border border-[#242424] rounded-sm text-[#9a9a9a] hover:text-[#f5f5f0] flex items-center justify-center text-sm">+</button>
                </div>
              </div>
            </div>
          ))}
          <div className="flex justify-between items-center px-5 py-4 bg-[#0e0e0e]">
            <span className="text-sm font-semibold">Total</span>
            <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 24, color: '#d4ff00' }}>
              {isFree ? 'GRATUITO' : formatCurrency(total)}
            </span>
          </div>
        </div>

        {/* Dados */}
        <div className="space-y-3">
          <div className="text-[10px] font-mono tracking-[0.3em] text-[#6b6b6b] uppercase">Seus dados</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { label: 'Nome completo *', key: 'name',  type: 'text',  placeholder: 'Seu nome' },
              { label: 'E-mail *',        key: 'email', type: 'email', placeholder: 'seu@email.com' },
              { label: 'CPF',             key: 'cpf',   type: 'text',  placeholder: '000.000.000-00' },
              { label: 'WhatsApp',        key: 'phone', type: 'tel',   placeholder: '(00) 00000-0000' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-[10px] font-mono tracking-wider text-[#6b6b6b] uppercase mb-1.5">{f.label}</label>
                <input type={f.type} placeholder={f.placeholder}
                  value={(form as any)[f.key]} onChange={e => set(f.key, e.target.value)}
                  className="w-full bg-[#0e0e0e] border border-[#242424] text-[#f5f5f0] placeholder-[#4b4b4b] rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-[#d4ff00]/40 transition-colors" />
              </div>
            ))}
          </div>
        </div>

        {/* Pagamento — só mostra se não for gratuito */}
        {!isFree && (
          <div className="space-y-3">
            <div className="text-[10px] font-mono tracking-[0.3em] text-[#6b6b6b] uppercase">Forma de pagamento</div>
            <div className="grid grid-cols-3 gap-3">
              {([
                { id: 'pix', icon: Smartphone, label: 'PIX' },
                { id: 'credit_card', icon: CreditCard, label: 'Cartão' },
                { id: 'boleto', icon: FileText, label: 'Boleto' },
              ] as const).map(m => {
                const Icon = m.icon
                return (
                  <button key={m.id} onClick={() => setMethod(m.id)}
                    className={cn('flex flex-col items-center gap-2 p-4 rounded-sm border transition-all',
                      method === m.id ? 'border-[#d4ff00]/40 bg-[#d4ff00]/5 text-[#d4ff00]' : 'border-[#242424] text-[#9a9a9a] hover:border-[#d4ff00]/20')}>
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-mono">{m.label}</span>
                  </button>
                )
              })}
            </div>
            {method === 'pix' && (
              <div className="p-3 bg-[#d4ff00]/5 border border-[#d4ff00]/15 rounded-sm text-xs text-[#9a9a9a]">
                ✓ Aprovação instantânea · Sem taxa adicional
              </div>
            )}
          </div>
        )}

        {/* Banner gratuito */}
        {isFree && (
          <div className="p-4 bg-[#5BE7C4]/8 border border-[#5BE7C4]/20 rounded-sm flex items-center gap-3">
            <Check className="w-5 h-5 text-[#5BE7C4] shrink-0" />
            <div>
              <div className="text-sm font-semibold text-[#5BE7C4]">Inscrição gratuita</div>
              <div className="text-xs text-[#9a9a9a] mt-0.5">Nenhum pagamento será cobrado. Você receberá o QR code por e-mail.</div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-xs text-[#FF5A6B] bg-[#FF5A6B]/8 border border-[#FF5A6B]/20 rounded-sm px-4 py-3">
            <Info className="w-3.5 h-3.5 shrink-0" /> {error}
          </div>
        )}

        <button onClick={handleSubmit} disabled={saving}
          className="w-full flex items-center justify-center gap-3 bg-[#d4ff00] text-[#080808] py-5 rounded-sm text-sm font-bold tracking-wider hover:shadow-[0_0_40px_rgba(212,255,0,0.4)] transition-all disabled:opacity-50 active:scale-95">
          {saving ? <span className="font-mono">PROCESSANDO...</span> : (
            <>
              {copy(isFree, `FINALIZAR COMPRA · ${formatCurrency(total)}`, 'CONFIRMAR INSCRIÇÃO')}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <p className="text-center text-[11px] text-[#6b6b6b]">
          {copy(isFree,
            'Ao finalizar você concorda com os termos de uso. Ingressos enviados por e-mail.',
            'Ao confirmar você concorda com os termos de uso. QR code enviado por e-mail.'
          )}
        </p>
      </div>
    </div>
  )
}

/* ── Success ────────────────────────────────────────────────── */
function SuccessScreen({ event, cart, total, isFree }: { event: EventData; cart: CartItem[]; total: number; isFree: boolean }) {
  return (
    <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 bg-[#d4ff00]/10 border border-[#d4ff00]/30 rounded-full flex items-center justify-center mb-8">
        <Check className="w-10 h-10 text-[#d4ff00]" />
      </div>
      <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 'clamp(36px, 6vw, 64px)', letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 16 }}>
        {copy(isFree, 'PEDIDO CONFIRMADO', 'INSCRIÇÃO CONFIRMADA')}<span style={{ color: '#d4ff00' }}>.</span>
      </h1>
      <p className="text-[#9a9a9a] mb-4 max-w-md">
        {copy(isFree,
          'Seus ingressos serão enviados por e-mail em instantes.',
          'Sua inscrição está confirmada! O QR code chegará por e-mail.'
        )}
      </p>
      {!isFree && total > 0 && (
        <div className="font-display text-2xl text-[#d4ff00] mb-6">{formatCurrency(total)}</div>
      )}
      <div className="space-y-2 mb-10">
        {cart.map(item => (
          <div key={item.batchId} className="flex items-center gap-2 text-sm text-[#9a9a9a] justify-center">
            <span className="w-2 h-2 rounded-full" style={{ background: item.color }} />
            {item.qty}x {item.ticketName}
          </div>
        ))}
      </div>
      <a href={`/e/${event.slug ?? ''}`}
        className="text-xs text-[#6b6b6b] hover:text-[#d4ff00] transition-colors font-mono">
        ← Voltar para o evento
      </a>
    </div>
  )
}

function Skeleton() {
  return (
    <div className="min-h-screen bg-[#080808] animate-pulse">
      <div className="h-[100svh] bg-[#0e0e0e]" />
    </div>
  )
}

function NotFound() {
  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center text-center px-6">
      <div>
        <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 80, color: '#d4ff00' }}>404</div>
        <p className="text-[#9a9a9a] mt-4">Evento não encontrado.</p>
      </div>
    </div>
  )
}