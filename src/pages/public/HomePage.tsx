import { ArrowRight, BarChart3, LayoutDashboard, QrCode } from 'lucide-react'
import { useMemo, useRef } from 'react'
import { PublicLayout, PublicReveal, useEventsQuery, type PublicEventSummary } from '@/features/public'
import { formatPublicDate, usePublicLocale } from '@/features/public/lib/public-locale'
import { useSeoMeta } from '@/shared/lib'

interface HomeEventCardModel {
  id: string
  imageUrl: string
  eventName: string
  date: string
  location: string
  badge?: string
  badgeTone?: 'default' | 'live' | 'warning'
  href: string
}

function getEventCover(event: PublicEventSummary) {
  return (
    event.mediaPresentation.heroAsset?.thumbnail_url ||
    event.mediaPresentation.heroAsset?.secure_url ||
    event.mediaPresentation.coverAsset?.secure_url ||
    event.cover_url ||
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1600&q=80&fit=crop'
  )
}

function getEventLocation(event: PublicEventSummary, isPortuguese: boolean) {
  const location = [event.venue_name, event.city].filter(Boolean).join(' / ')
  return location || (isPortuguese ? 'Local a confirmar' : 'Venue to be announced')
}

function navigateTo(url: string) {
  if (typeof window !== 'undefined') {
    window.location.assign(url)
  }
}

export function HomePage({ onLogin }: { onLogin: () => void }) {
  const { isPortuguese, locale } = usePublicLocale()
  const publicEventsQuery = useEventsQuery()
  const upcomingEventsRef = useRef<HTMLDivElement | null>(null)

  const liveEvents = useMemo<HomeEventCardModel[]>(
    () =>
      publicEventsQuery.data.slice(0, 3).map((event) => ({
        id: event.id,
        imageUrl: getEventCover(event),
        eventName: event.name,
        date: formatPublicDate(event.starts_at, locale, {
          weekday: 'short',
          day: '2-digit',
          month: 'long',
        }),
        location: getEventLocation(event, isPortuguese),
        badge:
          event.status === 'published'
            ? isPortuguese
              ? 'Destaque'
              : 'Featured'
            : undefined,
        href: `/e/${event.slug}`,
      })),
    [publicEventsQuery.data, locale, isPortuguese],
  )

  const fallbackEvents = useMemo<HomeEventCardModel[]>(
    () => [
      {
        id: 'pulse-summit',
        imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1600&q=80&fit=crop',
        eventName: isPortuguese ? 'Pulse Summit 2026' : 'Pulse Summit 2026',
        date: isPortuguese ? '12 de maio' : 'May 12',
        location: isPortuguese ? 'Sao Paulo / Expo Hall' : 'Sao Paulo / Expo Hall',
        badge: isPortuguese ? 'Ao vivo' : 'Live',
        badgeTone: 'live',
        href: '/events',
      },
      {
        id: 'creator-lab',
        imageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1600&q=80&fit=crop',
        eventName: isPortuguese ? 'Creator Lab Sessions' : 'Creator Lab Sessions',
        date: isPortuguese ? '18 de maio' : 'May 18',
        location: isPortuguese ? 'Rio de Janeiro / Pier Stage' : 'Rio de Janeiro / Pier Stage',
        badge: isPortuguese ? 'Ultimos ingressos' : 'Last tickets',
        badgeTone: 'warning',
        href: '/events',
      },
      {
        id: 'future-nights',
        imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&q=80&fit=crop',
        eventName: isPortuguese ? 'Future Nights Experience' : 'Future Nights Experience',
        date: isPortuguese ? '24 de maio' : 'May 24',
        location: isPortuguese ? 'Belo Horizonte / Distrito Pulse' : 'Belo Horizonte / Pulse District',
        badge: isPortuguese ? 'Selecionado' : 'Curated',
        href: '/events',
      },
    ],
    [isPortuguese],
  )

  const upcomingEvents = liveEvents.length > 0 ? liveEvents : fallbackEvents

  const benefits = useMemo(
    () => [
      {
        icon: LayoutDashboard,
        title: isPortuguese ? 'Gestao 360' : '360 Management',
        description: isPortuguese
          ? 'Ingressos, equipes, agenda, financeiro e comunicacao trabalhando na mesma camada operacional.'
          : 'Tickets, teams, schedule, finance and communication working from the same operational layer.',
      },
      {
        icon: QrCode,
        title: isPortuguese ? 'Credenciamento inteligente' : 'Smart Accreditation',
        description: isPortuguese
          ? 'Check-in rapido, QR code confiavel e leitura por area para acelerar a experiencia de entrada.'
          : 'Faster check-in, reliable QR codes and zone-based scanning to accelerate entry experience.',
      },
      {
        icon: BarChart3,
        title: isPortuguese ? 'Relatorios em tempo real' : 'Real-Time Reporting',
        description: isPortuguese
          ? 'Acompanhe vendas, ocupacao e fluxo de acesso com leitura executiva durante toda a operacao.'
          : 'Track sales, occupancy and access flow with an executive readout throughout the operation.',
      },
    ],
    [isPortuguese],
  )

  useSeoMeta({
    title: isPortuguese ? 'Pulse | Operacao inteligente para eventos' : 'Pulse | Smart event operations',
    description: isPortuguese
      ? 'Pulse conecta descoberta, credenciamento e inteligencia operacional em uma experiencia premium para eventos.'
      : 'Pulse connects discovery, accreditation and operational intelligence in a premium event experience.',
    image: upcomingEvents[0]?.imageUrl ?? '/logo.png',
    url: typeof window !== 'undefined' ? window.location.href : '/',
  })

  function scrollToUpcomingEvents() {
    upcomingEventsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
        .home-marquee-track {
          animation: marquee 22s linear infinite;
          display: flex;
          width: max-content;
        }
        .home-hero-eyebrow-dot {
          animation: pulseDot 1.8s ease-in-out infinite;
        }
        .home-event-card-img {
          transition: transform 700ms cubic-bezier(0.16,1,0.3,1);
        }
        .home-event-card:hover .home-event-card-img {
          transform: scale(1.04);
        }
      `}</style>

      <PublicLayout onLogin={onLogin}>
        <div style={{ background: '#050505', color: '#FFFFFF' }}>

          {/* ── HERO ── */}
          <section
            style={{
              position: 'relative',
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Video background */}
            <video
              autoPlay
              muted
              loop
              playsInline
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                zIndex: 0,
              }}
            >
              <source src="/videos/video.mp4" type="video/mp4" />
            </video>
            {/* Dark overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(5,5,5,0.72)',
                zIndex: 1,
              }}
            />
            {/* Blue glow top */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(ellipse at 50% -10%, rgba(0,87,231,0.28) 0%, transparent 55%)',
                zIndex: 2,
              }}
            />

            {/* Hero center content */}
            <div
              style={{
                position: 'relative',
                zIndex: 10,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '0 1.5rem',
              }}
            >
              {/* Eyebrow badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.35rem 1rem',
                  borderRadius: '999px',
                  border: '1px solid rgba(0,87,231,0.4)',
                  background: 'rgba(0,87,231,0.12)',
                  marginBottom: '2rem',
                }}
              >
                <span
                  className="home-hero-eyebrow-dot"
                  style={{ width: 6, height: 6, borderRadius: '50%', background: '#4285F4', display: 'inline-block' }}
                />
                <span
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '0.28em',
                    textTransform: 'uppercase',
                    color: '#4285F4',
                  }}
                >
                  {isPortuguese ? 'PLATAFORMA DE EVENTOS' : 'EVENT PLATFORM'}
                </span>
              </div>

              {/* H1 */}
              <h1
                style={{
                  margin: 0,
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 'clamp(4.5rem, 9vw, 9rem)',
                  fontWeight: 900,
                  lineHeight: 0.86,
                  letterSpacing: '-0.05em',
                  color: '#FFFFFF',
                  maxWidth: '14ch',
                }}
              >
                {isPortuguese
                  ? 'Onde os grandes eventos são construídos.'
                  : 'Where great events are built.'}
              </h1>

              {/* Subtitle */}
              <p
                style={{
                  marginTop: '1.75rem',
                  maxWidth: '36rem',
                  color: 'rgba(255,255,255,0.62)',
                  fontSize: '1.125rem',
                  lineHeight: 2,
                }}
              >
                {isPortuguese
                  ? 'Credenciamento, vendas, relatorios e equipes — tudo em uma operacao conectada.'
                  : 'Accreditation, sales, reporting and teams — all in one connected operation.'}
              </p>

              {/* CTA buttons */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={scrollToUpcomingEvents}
                  style={{
                    background: '#0057E7',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '1rem',
                    padding: '1rem 2rem',
                    borderRadius: '999px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 200ms ease',
                    boxShadow: '0 16px 40px rgba(0,87,231,0.35)',
                  }}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.background = '#4285F4'
                    ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.background = '#0057E7'
                    ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'
                  }}
                >
                  {isPortuguese ? 'Ver eventos' : 'See events'}
                </button>
                <button
                  type="button"
                  onClick={onLogin}
                  style={{
                    background: 'transparent',
                    color: 'rgba(255,255,255,0.80)',
                    fontWeight: 600,
                    fontSize: '1rem',
                    padding: '1rem 2rem',
                    borderRadius: '999px',
                    border: '1px solid rgba(255,255,255,0.20)',
                    cursor: 'pointer',
                    transition: 'all 200ms ease',
                  }}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.4)'
                    ;(e.currentTarget as HTMLButtonElement).style.color = '#FFFFFF'
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.20)'
                    ;(e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.80)'
                  }}
                >
                  {isPortuguese ? 'Entrar na plataforma' : 'Enter platform'}
                </button>
              </div>
            </div>

            {/* Stats bar */}
            <div style={{ position: 'relative', zIndex: 10, padding: '0 1.5rem 3rem' }}>
              <div
                style={{
                  maxWidth: '56rem',
                  margin: '0 auto',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  borderRadius: '1.5rem',
                  backdropFilter: 'blur(20px)',
                  padding: '1.5rem 2.5rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '1rem',
                }}
              >
                {[
                  { value: '12+', label: isPortuguese ? 'Eventos ativos' : 'Active events' },
                  { value: '50k+', label: isPortuguese ? 'Ingressos vendidos' : 'Tickets sold' },
                  { value: '200+', label: isPortuguese ? 'Produtores' : 'Producers' },
                ].map((stat, i) => (
                  <div
                    key={stat.label}
                    style={{
                      textAlign: 'center',
                      borderRight: i < 2 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '2rem',
                        fontWeight: 900,
                        letterSpacing: '-0.04em',
                        color: '#FFFFFF',
                        lineHeight: 1,
                      }}
                    >
                      {stat.value}
                    </div>
                    <div
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        letterSpacing: '0.18em',
                        textTransform: 'uppercase',
                        color: 'rgba(255,255,255,0.40)',
                        marginTop: '0.4rem',
                      }}
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── MARQUEE STRIP ── */}
          <section style={{ background: '#050505', overflow: 'hidden', padding: '1.25rem 0', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="home-marquee-track">
              {['EVENTOS • ', 'CREDENCIAMENTO • ', 'RELATORIOS • ', 'FINANCEIRO • ', 'EQUIPES • ', 'QR CODE • ', 'EVENTOS • ', 'CREDENCIAMENTO • ', 'RELATORIOS • ', 'FINANCEIRO • ', 'EQUIPES • ', 'QR CODE • '].map(
                (item, i) => (
                  <span
                    key={i}
                    style={{
                      color: 'rgba(255,255,255,0.20)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.4em',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      paddingRight: '0.5rem',
                    }}
                  >
                    {item}
                  </span>
                ),
              )}
            </div>
          </section>

          {/* ── FEATURED EVENTS ── */}
          <section ref={upcomingEventsRef} style={{ background: '#050505', padding: '6rem 1.5rem' }}>
            <div style={{ maxWidth: '78rem', margin: '0 auto' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      letterSpacing: '0.28em',
                      textTransform: 'uppercase',
                      color: '#0057E7',
                      marginBottom: '0.75rem',
                    }}
                  >
                    {isPortuguese ? 'EM DESTAQUE' : 'FEATURED'}
                  </div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: 'clamp(2.5rem, 4vw, 4rem)',
                      fontWeight: 700,
                      letterSpacing: '-0.04em',
                      color: '#FFFFFF',
                      lineHeight: 1,
                    }}
                  >
                    {isPortuguese ? 'Eventos em destaque' : 'Featured events'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={scrollToUpcomingEvents}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'rgba(255,255,255,0.50)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    transition: 'color 180ms ease',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#4285F4' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.50)' }}
                >
                  {isPortuguese ? 'Ver todos' : 'View all'}
                  <ArrowRight size={16} />
                </button>
              </div>

              {/* Magazine grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: upcomingEvents.length >= 2 ? '2fr 1fr' : '1fr',
                  gap: '1.25rem',
                }}
              >
                {/* First event — large */}
                {upcomingEvents[0] ? (
                  <div
                    className="home-event-card"
                    onClick={() => navigateTo(upcomingEvents[0].href)}
                    style={{
                      position: 'relative',
                      minHeight: '36rem',
                      borderRadius: '1.5rem',
                      overflow: 'hidden',
                      cursor: 'pointer',
                    }}
                  >
                    <img
                      src={upcomingEvents[0].imageUrl}
                      alt={upcomingEvents[0].eventName}
                      className="home-event-card-img"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(to top, #050607 0%, rgba(5,6,7,0.20) 50%, transparent 100%)',
                      }}
                    />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '2rem' }}>
                      {upcomingEvents[0].badge ? (
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '999px',
                            background: upcomingEvents[0].badgeTone === 'live' ? 'rgba(34,197,94,0.18)' : 'rgba(0,87,231,0.22)',
                            border: `1px solid ${upcomingEvents[0].badgeTone === 'live' ? 'rgba(34,197,94,0.4)' : 'rgba(0,87,231,0.4)'}`,
                            color: upcomingEvents[0].badgeTone === 'live' ? '#22C55E' : '#4285F4',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            letterSpacing: '0.16em',
                            textTransform: 'uppercase',
                            marginBottom: '0.75rem',
                          }}
                        >
                          {upcomingEvents[0].badge}
                        </div>
                      ) : null}
                      <h3 style={{ margin: 0, fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                        {upcomingEvents[0].eventName}
                      </h3>
                      <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.50)' }}>
                        {upcomingEvents[0].date} &nbsp;·&nbsp; {upcomingEvents[0].location}
                      </p>
                    </div>
                  </div>
                ) : null}

                {/* Right column — stacked small cards */}
                {upcomingEvents.length >= 2 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {upcomingEvents.slice(1, 3).map((event) => (
                      <div
                        key={event.id}
                        className="home-event-card"
                        onClick={() => navigateTo(event.href)}
                        style={{
                          position: 'relative',
                          flex: 1,
                          minHeight: '17rem',
                          borderRadius: '1.5rem',
                          overflow: 'hidden',
                          cursor: 'pointer',
                        }}
                      >
                        <img
                          src={event.imageUrl}
                          alt={event.eventName}
                          className="home-event-card-img"
                          style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to top, #050607 0%, rgba(5,6,7,0.20) 55%, transparent 100%)',
                          }}
                        />
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.5rem' }}>
                          {event.badge ? (
                            <div
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '0.2rem 0.6rem',
                                borderRadius: '999px',
                                background: event.badgeTone === 'live' ? 'rgba(34,197,94,0.18)' : event.badgeTone === 'warning' ? 'rgba(217,119,6,0.18)' : 'rgba(0,87,231,0.22)',
                                border: `1px solid ${event.badgeTone === 'live' ? 'rgba(34,197,94,0.4)' : event.badgeTone === 'warning' ? 'rgba(217,119,6,0.4)' : 'rgba(0,87,231,0.4)'}`,
                                color: event.badgeTone === 'live' ? '#22C55E' : event.badgeTone === 'warning' ? '#F59E0B' : '#4285F4',
                                fontSize: '0.6rem',
                                fontWeight: 700,
                                letterSpacing: '0.14em',
                                textTransform: 'uppercase',
                                marginBottom: '0.5rem',
                              }}
                            >
                              {event.badge}
                            </div>
                          ) : null}
                          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                            {event.eventName}
                          </h3>
                          <p style={{ margin: '0.35rem 0 0', fontSize: '0.78rem', color: 'rgba(255,255,255,0.50)' }}>
                            {event.date} &nbsp;·&nbsp; {event.location}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          {/* ── STATS SECTION ── */}
          <section
            style={{
              background: 'linear-gradient(135deg, #050505 0%, #080D1A 100%)',
              position: 'relative',
              overflow: 'hidden',
              padding: '6rem 1.5rem',
            }}
          >
            {/* Blue glow top */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at 50% 0%, rgba(0,87,231,0.20), transparent 50%)',
                pointerEvents: 'none',
              }}
            />
            <div style={{ maxWidth: '56rem', margin: '0 auto', position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
                {[
                  { value: '98%', label: isPortuguese ? 'Taxa de check-in' : 'Check-in rate' },
                  { value: '< 2s', label: isPortuguese ? 'Tempo de leitura' : 'Scan speed' },
                  { value: '24/7', label: isPortuguese ? 'Operacao continua' : 'Non-stop operation' },
                ].map((stat, i) => (
                  <div
                    key={stat.label}
                    style={{
                      textAlign: 'center',
                      borderRight: i < 2 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 'clamp(4rem, 8vw, 7rem)',
                        fontWeight: 900,
                        letterSpacing: '-0.05em',
                        color: '#FFFFFF',
                        lineHeight: 1,
                      }}
                    >
                      {stat.value}
                    </div>
                    <div
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        letterSpacing: '0.28em',
                        textTransform: 'uppercase',
                        color: 'rgba(255,255,255,0.48)',
                        marginTop: '1rem',
                      }}
                    >
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── FEATURES SECTION ── */}
          <section style={{ background: '#0A0A0A', padding: '6rem 1.5rem' }}>
            <div style={{ maxWidth: '78rem', margin: '0 auto' }}>
              {/* Header */}
              <div style={{ marginBottom: '3.5rem' }}>
                <div
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '0.28em',
                    textTransform: 'uppercase',
                    color: '#0057E7',
                    marginBottom: '0.75rem',
                  }}
                >
                  {isPortuguese ? 'POR QUE PULSE?' : 'WHY PULSE?'}
                </div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 'clamp(2rem, 3.5vw, 3.5rem)',
                    fontWeight: 700,
                    letterSpacing: '-0.04em',
                    color: '#FFFFFF',
                    lineHeight: 1.1,
                    maxWidth: '22ch',
                  }}
                >
                  {isPortuguese
                    ? 'Uma pilha unica para governar toda a experiencia.'
                    : 'One stack to govern the whole experience.'}
                </h2>
              </div>

              {/* Feature cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))', gap: '1.5rem' }}>
                {benefits.map((benefit, index) => (
                  <PublicReveal key={benefit.title} delayMs={index * 90}>
                    <div
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '1.5rem',
                        padding: '2rem',
                        height: '100%',
                        transition: 'background 200ms ease, border-color 200ms ease, transform 200ms ease',
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget as HTMLDivElement
                        el.style.background = 'rgba(255,255,255,0.06)'
                        el.style.borderColor = 'rgba(255,255,255,0.12)'
                        el.style.transform = 'translateY(-3px)'
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget as HTMLDivElement
                        el.style.background = 'rgba(255,255,255,0.04)'
                        el.style.borderColor = 'rgba(255,255,255,0.08)'
                        el.style.transform = 'translateY(0)'
                      }}
                    >
                      <div
                        style={{
                          width: '3.5rem',
                          height: '3.5rem',
                          borderRadius: '0.875rem',
                          background: 'rgba(0,87,231,0.12)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#4285F4',
                        }}
                      >
                        <benefit.icon size={22} />
                      </div>
                      <h3
                        style={{
                          margin: '1.5rem 0 0',
                          fontSize: '1.2rem',
                          fontWeight: 700,
                          color: '#FFFFFF',
                          letterSpacing: '-0.02em',
                        }}
                      >
                        {benefit.title}
                      </h3>
                      <p
                        style={{
                          margin: '0.75rem 0 0',
                          fontSize: '0.875rem',
                          lineHeight: 1.75,
                          color: 'rgba(255,255,255,0.56)',
                        }}
                      >
                        {benefit.description}
                      </p>
                    </div>
                  </PublicReveal>
                ))}
              </div>
            </div>
          </section>

          {/* ── CTA SECTION ── */}
          <section
            style={{
              background: '#050505',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              position: 'relative',
              overflow: 'hidden',
              padding: '8rem 1.5rem',
              textAlign: 'center',
            }}
          >
            {/* Blue gradient top */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(0,87,231,0.6), transparent)',
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '60%',
                height: '40%',
                background: 'radial-gradient(ellipse at top, rgba(0,87,231,0.15), transparent 70%)',
                pointerEvents: 'none',
              }}
            />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: 'clamp(3rem, 6vw, 6rem)',
                  fontWeight: 900,
                  letterSpacing: '-0.05em',
                  color: '#FFFFFF',
                  lineHeight: 0.92,
                }}
              >
                {isPortuguese ? 'Comece agora.' : 'Start now.'}
              </h2>
              <p
                style={{
                  marginTop: '1.5rem',
                  fontSize: '1.1rem',
                  color: 'rgba(255,255,255,0.56)',
                  maxWidth: '36rem',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  lineHeight: 1.8,
                }}
              >
                {isPortuguese
                  ? 'Entre no cockpit e gerencie seu proximo evento com total controle operacional.'
                  : 'Enter the cockpit and manage your next event with full operational control.'}
              </p>
              <button
                type="button"
                onClick={onLogin}
                style={{
                  marginTop: '2.5rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  background: '#0057E7',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  padding: '1.25rem 2.5rem',
                  borderRadius: '999px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 20px 60px rgba(0,87,231,0.35)',
                  transition: 'all 200ms ease',
                }}
                onMouseEnter={(e) => {
                  const btn = e.currentTarget as HTMLButtonElement
                  btn.style.background = '#4285F4'
                  btn.style.transform = 'translateY(-3px)'
                  btn.style.boxShadow = '0 28px 80px rgba(0,87,231,0.45)'
                }}
                onMouseLeave={(e) => {
                  const btn = e.currentTarget as HTMLButtonElement
                  btn.style.background = '#0057E7'
                  btn.style.transform = 'translateY(0)'
                  btn.style.boxShadow = '0 20px 60px rgba(0,87,231,0.35)'
                }}
              >
                {isPortuguese ? 'Entrar na plataforma' : 'Enter platform'}
                <ArrowRight size={18} />
              </button>
            </div>
          </section>

        </div>
      </PublicLayout>
    </>
  )
}

export default HomePage
