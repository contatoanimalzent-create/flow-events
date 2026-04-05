import { ArrowRight, BarChart3, LayoutDashboard, QrCode } from 'lucide-react'
import { useMemo, useRef } from 'react'
import { PublicLayout, PublicReveal, useEventsQuery, type PublicEventSummary } from '@/features/public'
import { formatPublicDate, usePublicLocale } from '@/features/public/lib/public-locale'
import { EventCard, PulseHero } from '@/shared/components'
import { useSeoMeta } from '@/shared/lib'

interface HomeEventCardModel {
  id: string
  imageUrl: string
  eventName: string
  date: string
  location: string
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

function BenefitCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof LayoutDashboard
  title: string
  description: string
}) {
  return (
    <div className="pulse-home__benefit-card">
      <div className="pulse-home__benefit-icon">
        <Icon size={22} aria-hidden="true" />
      </div>
      <h3 className="pulse-home__benefit-title">{title}</h3>
      <p className="pulse-home__benefit-copy">{description}</p>
    </div>
  )
}

export function HomePage({ onLogin }: { onLogin: () => void }) {
  const { isPortuguese, locale } = usePublicLocale()
  const publicEventsQuery = useEventsQuery()
  const upcomingEventsRef = useRef<HTMLElement | null>(null)

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
        href: '/events',
      },
      {
        id: 'creator-lab',
        imageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1600&q=80&fit=crop',
        eventName: isPortuguese ? 'Creator Lab Sessions' : 'Creator Lab Sessions',
        date: isPortuguese ? '18 de maio' : 'May 18',
        location: isPortuguese ? 'Rio de Janeiro / Pier Stage' : 'Rio de Janeiro / Pier Stage',
        href: '/events',
      },
      {
        id: 'future-nights',
        imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&q=80&fit=crop',
        eventName: isPortuguese ? 'Future Nights Experience' : 'Future Nights Experience',
        date: isPortuguese ? '24 de maio' : 'May 24',
        location: isPortuguese ? 'Belo Horizonte / Distrito Pulse' : 'Belo Horizonte / Pulse District',
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
        .pulse-home {
          color: var(--pulse-color-text-primary, #000000);
        }

        .pulse-home__hero-bleed {
          width: 100vw;
          margin-left: calc(50% - 50vw);
          margin-right: calc(50% - 50vw);
        }

        .pulse-home__shell {
          width: min(calc(100% - (2 * var(--pulse-grid-gutter-mobile, 1.25rem))), var(--pulse-grid-max-width, 78rem));
          margin: 0 auto;
        }

        .pulse-home__hero-meta {
          margin-top: calc(var(--pulse-spacing-xl, 2rem) * -1);
          position: relative;
          z-index: 2;
        }

        .pulse-home__hero-panel {
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 1.75rem;
          background: rgba(255, 255, 255, 0.92);
          box-shadow: 0 24px 60px rgba(0, 26, 84, 0.14);
          backdrop-filter: blur(18px);
          padding: 1rem;
        }

        .pulse-home__hero-strip {
          display: grid;
          grid-template-columns: repeat(var(--pulse-grid-columns-mobile, 4), minmax(0, 1fr));
          gap: var(--pulse-grid-gap-sm, 1rem);
        }

        .pulse-home__hero-stat {
          grid-column: span 4;
          border-radius: 1.25rem;
          background: linear-gradient(180deg, rgba(255,255,255,0.95), rgba(243,247,255,0.95));
          padding: 1rem 1.1rem;
        }

        .pulse-home__hero-stat-label {
          color: var(--pulse-color-primary-base, #0033A0);
          font-family: var(--pulse-font-family, Inter, sans-serif);
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .pulse-home__hero-stat-value {
          margin-top: 0.45rem;
          color: var(--pulse-color-text-primary, #000000);
          font-family: var(--pulse-font-family, Inter, sans-serif);
          font-size: 1rem;
          line-height: 1.5;
        }

        .pulse-home__section {
          padding: var(--pulse-spacing-xxl, 3rem) 0 0;
        }

        .pulse-home__surface {
          border: 1px solid rgba(229, 229, 229, 0.9);
          border-radius: 2rem;
          background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(247,250,255,0.98));
          box-shadow: 0 24px 64px rgba(0, 26, 84, 0.09);
          padding: 1.35rem;
        }

        .pulse-home__surface--why {
          background:
            radial-gradient(circle at top right, rgba(0, 123, 255, 0.12), transparent 28%),
            linear-gradient(180deg, rgba(255,255,255,0.98), rgba(244,248,255,0.98));
        }

        .pulse-home__section-head {
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
        }

        .pulse-home__eyebrow {
          color: var(--pulse-color-primary-accent, #007BFF);
          font-family: var(--pulse-font-family, Inter, sans-serif);
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .pulse-home__heading-row {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .pulse-home__title {
          margin: 0;
          color: var(--pulse-color-primary-base, #0033A0);
          font-family: var(--pulse-font-family, Inter, sans-serif);
          font-size: var(--pulse-font-size-h2, 2.5rem);
          font-weight: 800;
          line-height: 1.1;
        }

        .pulse-home__copy {
          margin: 0;
          max-width: 44rem;
          color: var(--pulse-color-text-primary, #000000);
          font-family: var(--pulse-font-family, Inter, sans-serif);
          font-size: 1rem;
          line-height: 1.7;
        }

        .pulse-home__link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0;
          border: 0;
          background: transparent;
          cursor: pointer;
          color: var(--pulse-color-primary-base, #0033A0);
          font-family: var(--pulse-font-family, Inter, sans-serif);
          font-size: 0.9rem;
          font-weight: 700;
          text-decoration: none;
          transition: transform 180ms ease, color 180ms ease;
        }

        .pulse-home__link:hover {
          color: var(--pulse-color-primary-accent, #007BFF);
          transform: translateX(2px);
        }

        .pulse-home__cards-grid,
        .pulse-home__benefits-grid {
          display: grid;
          grid-template-columns: repeat(var(--pulse-grid-columns-mobile, 4), minmax(0, 1fr));
          gap: var(--pulse-grid-gap-md, 1.5rem);
          margin-top: var(--pulse-spacing-xl, 2rem);
        }

        .pulse-home__card-item,
        .pulse-home__benefit-item {
          grid-column: span 4;
        }

        .pulse-home__benefit-card {
          height: 100%;
          border: 1px solid rgba(229, 229, 229, 0.9);
          border-radius: 1.6rem;
          background: rgba(255, 255, 255, 0.94);
          padding: 1.4rem;
          box-shadow: 0 16px 40px rgba(0, 26, 84, 0.08);
        }

        .pulse-home__benefit-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 3rem;
          height: 3rem;
          border-radius: 999px;
          background: rgba(0, 123, 255, 0.12);
          color: var(--pulse-color-primary-accent, #007BFF);
        }

        .pulse-home__benefit-title {
          margin: 1rem 0 0;
          color: var(--pulse-color-primary-base, #0033A0);
          font-family: var(--pulse-font-family, Inter, sans-serif);
          font-size: 1.2rem;
          font-weight: 800;
          line-height: 1.3;
        }

        .pulse-home__benefit-copy {
          margin: 0.85rem 0 0;
          color: var(--pulse-color-text-primary, #000000);
          font-family: var(--pulse-font-family, Inter, sans-serif);
          font-size: 0.98rem;
          line-height: 1.7;
        }

        @media (min-width: 768px) {
          .pulse-home__shell {
            width: min(calc(100% - (2 * var(--pulse-grid-gutter-tablet, 2rem))), var(--pulse-grid-max-width, 78rem));
          }

          .pulse-home__hero-panel,
          .pulse-home__surface {
            padding: 1.75rem;
          }

          .pulse-home__hero-strip,
          .pulse-home__cards-grid,
          .pulse-home__benefits-grid {
            grid-template-columns: repeat(var(--pulse-grid-columns-tablet, 8), minmax(0, 1fr));
          }

          .pulse-home__hero-stat {
            grid-column: span 4;
          }

          .pulse-home__card-item,
          .pulse-home__benefit-item {
            grid-column: span 4;
          }

          .pulse-home__heading-row {
            align-items: end;
            justify-content: space-between;
            flex-direction: row;
          }
        }

        @media (min-width: 1100px) {
          .pulse-home__shell {
            width: min(calc(100% - (2 * var(--pulse-grid-gutter-desktop, 3rem))), var(--pulse-grid-max-width, 78rem));
          }

          .pulse-home__hero-strip,
          .pulse-home__cards-grid,
          .pulse-home__benefits-grid {
            grid-template-columns: repeat(var(--pulse-grid-columns-desktop, 12), minmax(0, 1fr));
            gap: var(--pulse-grid-gap-lg, 2rem);
          }

          .pulse-home__hero-stat,
          .pulse-home__card-item,
          .pulse-home__benefit-item {
            grid-column: span 4;
          }
        }
      `}</style>

      <PublicLayout onLogin={onLogin}>
        <div className="pulse-home">
          <div className="pulse-home__hero-bleed">
            <PulseHero
              title={
                isPortuguese
                  ? 'Pulse organiza o evento antes, durante e depois.'
                  : 'Pulse runs the event before, during and after showtime.'
              }
              subtitle={
                isPortuguese
                  ? 'Uma home feita para descoberta, com credenciamento, inteligencia operacional e relatorios conectados na mesma experiencia.'
                  : 'A home built for discovery, with accreditation, operational intelligence and reporting connected in the same experience.'
              }
              callToActionLabel={isPortuguese ? 'Ver proximos eventos' : 'See upcoming events'}
              onCallToAction={scrollToUpcomingEvents}
              backgroundVideoUrl="/videos/video.mp4"
            />
          </div>

          <div className="pulse-home__hero-meta">
            <div className="pulse-home__shell">
              <div className="pulse-home__hero-panel">
                <div className="pulse-home__hero-strip">
                  {[
                    {
                      label: isPortuguese ? 'Operacao conectada' : 'Connected operation',
                      value: isPortuguese
                        ? 'Vendas, check-in e relatorios em uma unica base.'
                        : 'Sales, check-in and reporting in one shared foundation.',
                    },
                    {
                      label: isPortuguese ? 'Catalogo vivo' : 'Live catalog',
                      value:
                        liveEvents.length > 0
                          ? isPortuguese
                            ? `${liveEvents.length} eventos ja publicados agora.`
                            : `${liveEvents.length} events already published now.`
                          : isPortuguese
                            ? 'Exemplos prontos para apresentar a experiencia Pulse.'
                            : 'Ready-made examples to showcase the Pulse experience.',
                    },
                    {
                      label: isPortuguese ? 'Acao imediata' : 'Immediate action',
                      value: isPortuguese
                        ? 'Entre no cockpit ou avance para os proximos eventos.'
                        : 'Enter the cockpit or move straight into upcoming events.',
                    },
                  ].map((item) => (
                    <div key={item.label} className="pulse-home__hero-stat">
                      <div className="pulse-home__hero-stat-label">{item.label}</div>
                      <div className="pulse-home__hero-stat-value">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <section ref={upcomingEventsRef} className="pulse-home__section">
            <div className="pulse-home__shell">
              <PublicReveal>
                <div className="pulse-home__surface">
                  <div className="pulse-home__section-head">
                    <div className="pulse-home__eyebrow">
                      {isPortuguese ? 'Proximos Eventos' : 'Upcoming Events'}
                    </div>
                    <div className="pulse-home__heading-row">
                      <div>
                        <h2 className="pulse-home__title">
                          {isPortuguese
                            ? 'Eventos desenhados para uma operacao fluida.'
                            : 'Events designed for a smoother operation.'}
                        </h2>
                        <p className="pulse-home__copy">
                          {isPortuguese
                            ? 'Use os eventos publicados quando a consulta estiver ativa ou apresente a experiencia com dados de exemplo enquanto o catalogo cresce.'
                            : 'Use published events when the query is active, or showcase the experience with sample data while the catalog grows.'}
                        </p>
                      </div>

                      <a className="pulse-home__link" href="/events">
                        {isPortuguese ? 'Abrir catalogo completo' : 'Open full catalog'}
                        <ArrowRight size={16} aria-hidden="true" />
                      </a>
                    </div>
                  </div>

                  <div className="pulse-home__cards-grid">
                    {upcomingEvents.map((event, index) => (
                      <PublicReveal key={event.id} delayMs={index * 80}>
                        <div className="pulse-home__card-item">
                          <EventCard
                            imageUrl={event.imageUrl}
                            eventName={event.eventName}
                            date={event.date}
                            location={event.location}
                            onClick={() => navigateTo(event.href)}
                          />
                        </div>
                      </PublicReveal>
                    ))}
                  </div>
                </div>
              </PublicReveal>
            </div>
          </section>

          <section className="pulse-home__section">
            <div className="pulse-home__shell">
              <PublicReveal delayMs={60}>
                <div className="pulse-home__surface pulse-home__surface--why">
                  <div className="pulse-home__section-head">
                    <div className="pulse-home__eyebrow">
                      {isPortuguese ? 'Por que Pulse?' : 'Why Pulse?'}
                    </div>
                    <div className="pulse-home__heading-row">
                      <div>
                        <h2 className="pulse-home__title">
                          {isPortuguese
                            ? 'Uma pilha unica para governar toda a experiencia.'
                            : 'One stack to govern the whole experience.'}
                        </h2>
                        <p className="pulse-home__copy">
                          {isPortuguese
                            ? 'A hierarquia visual destaca o que importa: titulos fortes em azul profundo, narrativa objetiva e icones em azul vibrante para guiar o olhar.'
                            : 'The visual hierarchy highlights what matters: strong deep-blue titles, clear copy and vibrant-blue icons guiding the eye.'}
                        </p>
                      </div>

                      <button type="button" className="pulse-home__link" onClick={onLogin}>
                        {isPortuguese ? 'Entrar no Pulse' : 'Enter Pulse'}
                        <ArrowRight size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  <div className="pulse-home__benefits-grid">
                    {benefits.map((benefit, index) => (
                      <PublicReveal key={benefit.title} delayMs={index * 90}>
                        <div className="pulse-home__benefit-item">
                          <BenefitCard
                            icon={benefit.icon}
                            title={benefit.title}
                            description={benefit.description}
                          />
                        </div>
                      </PublicReveal>
                    ))}
                  </div>
                </div>
              </PublicReveal>
            </div>
          </section>
        </div>
      </PublicLayout>
    </>
  )
}

export default HomePage
