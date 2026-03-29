import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, CalendarDays, MapPin, MoveUpRight, Sparkles } from 'lucide-react'
import { LoadingState } from '@/shared/components'
import { PublicLayout, PublicReveal, usePublicEvents } from '@/features/public'
import { usePublicLocale, formatPublicCurrency, formatPublicDate, formatPublicNumber } from '@/features/public/lib/public-locale'
import { getEventAssetUrl } from '@/features/event-media/types/event-media.types'
import type { PublicEventSummary } from '@/features/public/types/public.types'
import { useSeoMeta } from '@/shared/lib'

function getEventCover(event?: PublicEventSummary | null) {
  return (
    getEventAssetUrl(event?.mediaPresentation.heroAsset) ||
    getEventAssetUrl(event?.mediaPresentation.coverAsset) ||
    event?.cover_url ||
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=2200&q=80&fit=crop'
  )
}

export function HomePage({ onLogin }: { onLogin: () => void }) {
  const { isPortuguese, locale } = usePublicLocale()
  const publicEventsQuery = usePublicEvents()
  const events = publicEventsQuery.data ?? []
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const heroEvent = useMemo(
    () => [...events].sort((left, right) => right.sold_tickets - left.sold_tickets)[0] ?? null,
    [events],
  )

  const featuredEvents = useMemo(
    () => [...events].sort((left, right) => right.sold_tickets - left.sold_tickets).slice(0, 4),
    [events],
  )

  const seoImage =
    heroEvent?.mediaPresentation.heroAsset?.thumbnail_url ??
    heroEvent?.mediaPresentation.coverAsset?.secure_url ??
    heroEvent?.cover_url ??
    null

  const stats = useMemo(
    () => [
      {
        label: isPortuguese ? 'Eventos curados' : 'Curated events',
        value: formatPublicNumber(events.length, locale),
      },
      {
        label: isPortuguese ? 'Ingressos emitidos' : 'Tickets issued',
        value: formatPublicNumber(events.reduce((sum, event) => sum + event.sold_tickets, 0), locale),
      },
      {
        label: isPortuguese ? 'Cidades ativas' : 'Active cities',
        value: formatPublicNumber(new Set(events.map((event) => event.city).filter(Boolean)).size, locale),
      },
    ],
    [events, isPortuguese, locale],
  )

  useSeoMeta({
    title: isPortuguese ? 'Animalz Events | Experiencias selecionadas' : 'Animalz Events | Curated experiences',
    description: isPortuguese
      ? 'Descoberta editorial para publico e estrutura operacional premium para produtores.'
      : 'Editorial discovery for audiences and premium operational structure for producers.',
    image: seoImage,
    url: typeof window !== 'undefined' ? window.location.href : '/',
  })

  if (publicEventsQuery.isPending) {
    return (
      <PublicLayout onLogin={onLogin}>
        <div className="px-5 pb-20 pt-12 md:px-8 lg:px-10">
          <div className="mx-auto max-w-[1600px]">
            <LoadingState
              title={isPortuguese ? 'Carregando experiencias' : 'Loading experiences'}
              description={
                isPortuguese
                  ? 'Montando a nova camada publica da plataforma.'
                  : 'Building the new public product layer.'
              }
              className="min-h-[22rem]"
            />
          </div>
        </div>
      </PublicLayout>
    )
  }

  return (
    <PublicLayout onLogin={onLogin}>
      <div className="px-5 pb-20 pt-6 md:px-8 lg:px-10">
        <div className="mx-auto max-w-[1600px] space-y-8">
          <section className="relative overflow-hidden rounded-[2.6rem] border border-white/8 bg-[#0c0a09]">
            <div className="pointer-events-none absolute inset-0">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(90deg, rgba(7,6,7,0.95) 0%, rgba(7,6,7,0.84) 36%, rgba(7,6,7,0.42) 68%, rgba(7,6,7,0.7) 100%)',
                }}
              />
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url("${getEventCover(heroEvent)}")`,
                  transform: `scale(1.04) translateY(${scrollY * 0.08}px)`,
                  transition: 'transform 0.12s ease-out',
                  opacity: heroEvent ? 0.54 : 0.18,
                }}
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(214,42,11,0.16),transparent_34%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(174,147,111,0.14),transparent_32%)]" />
              <div
                className="absolute inset-0 opacity-[0.05]"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
                  backgroundSize: '96px 96px',
                }}
              />
            </div>

            <div className="relative z-10 grid min-h-[820px] gap-8 px-6 py-8 md:px-10 lg:grid-cols-[1.12fr_0.88fr] lg:px-12 lg:py-12">
              <div className="flex flex-col justify-between">
                <div>
                  <PublicReveal>
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#ae936f]/20 bg-[#ae936f]/10 px-4 py-2 text-[11px] uppercase tracking-[0.34em] text-[#ae936f]">
                      <Sparkles className="h-3.5 w-3.5" />
                      {isPortuguese ? 'Camada editorial de eventos' : 'Editorial event layer'}
                    </div>
                  </PublicReveal>

                  <PublicReveal delayMs={80}>
                    <h1 className="mt-8 max-w-[11ch] font-display text-[clamp(4.6rem,10vw,9.5rem)] leading-[0.84] tracking-[-0.08em] text-[#ebe7e0]">
                      {isPortuguese ? (
                        <>
                          EXPERIENCIAS
                          <br />
                          <span className="text-[#ae936f]">QUE MOVEM</span>
                          <br />
                          CULTURA.
                        </>
                      ) : (
                        <>
                          EXPERIENCES
                          <br />
                          <span className="text-[#ae936f]">THAT MOVE</span>
                          <br />
                          CULTURE.
                        </>
                      )}
                    </h1>
                  </PublicReveal>

                  <PublicReveal delayMs={140}>
                    <p className="mt-8 max-w-xl text-[1.05rem] leading-8 text-[#b8b0a8]/78">
                      {isPortuguese
                        ? 'Descoberta premium para quem compra e estrutura operacional para quem produz. A mesma plataforma organiza lancamento, venda, acesso e relacionamento.'
                        : 'Premium discovery for buyers and a single operational structure for producers. One platform organizes launch, sales, access and relationship.'}
                    </p>
                  </PublicReveal>

                  <PublicReveal delayMs={200}>
                    <div className="mt-10 flex flex-wrap items-center gap-3">
                      <a
                        href="/events"
                        className="inline-flex items-center gap-2 rounded-full bg-[#d62a0b] px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.16em] text-[#ebe7e0] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#e14425]"
                      >
                        {isPortuguese ? 'Explorar eventos' : 'Explore events'}
                        <ArrowRight className="h-4 w-4" />
                      </a>
                      <a
                        href="/create-event"
                        className="inline-flex items-center gap-2 rounded-full border border-white/12 px-7 py-3.5 text-sm font-medium text-[#ebe7e0] transition-all duration-300 hover:border-[#ae936f]/28 hover:bg-white/5"
                      >
                        {isPortuguese ? 'Criar evento' : 'Create event'}
                      </a>
                    </div>
                  </PublicReveal>
                </div>

                <PublicReveal delayMs={260}>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {stats.map((stat) => (
                      <div key={stat.label} className="rounded-[1.8rem] border border-white/8 bg-white/[0.04] p-5 backdrop-blur-sm">
                        <div className="text-[10px] uppercase tracking-[0.32em] text-[#8e847d]">{stat.label}</div>
                        <div className="mt-4 font-display text-[2.3rem] leading-none tracking-[-0.05em] text-[#ebe7e0]">{stat.value}</div>
                      </div>
                    ))}
                  </div>
                </PublicReveal>
              </div>

              <div className="flex flex-col justify-between">
                <PublicReveal delayMs={140}>
                  <div className="ml-auto w-full max-w-[28rem] rounded-[2rem] border border-white/8 bg-[rgba(12,10,9,0.82)] p-6 backdrop-blur-xl">
                    <div className="text-[10px] uppercase tracking-[0.34em] text-[#ae936f]">
                      {isPortuguese ? 'Para produtores' : 'For producers'}
                    </div>
                    <div className="mt-4 font-display text-[2.3rem] leading-[0.92] tracking-[-0.05em] text-[#ebe7e0]">
                      {isPortuguese ? 'Operar, vender e escalar eventos sem trocar de sistema.' : 'Operate, sell and scale events without switching systems.'}
                    </div>
                    <div className="mt-5 space-y-4 text-sm leading-7 text-[#b8b0a8]/74">
                      <p>{isPortuguese ? 'Checkout, lotes, credenciamento, equipe, CRM e financeiro conectados na mesma base.' : 'Checkout, releases, check-in, staff, CRM and financials connected in one base.'}</p>
                      <p>{isPortuguese ? 'A linguagem publica e o backoffice passam a ler o mesmo produto.' : 'The public layer and the backoffice now read as the same product.'}</p>
                    </div>
                  </div>
                </PublicReveal>

                <div className="space-y-4">
                  {featuredEvents.slice(0, 2).map((event, index) => (
                    <PublicReveal key={event.id} delayMs={220 + index * 60}>
                      <a
                        href={`/e/${event.slug}`}
                        className="group flex items-center gap-4 rounded-[2rem] border border-white/8 bg-white/[0.04] p-5 backdrop-blur-sm transition-all duration-300 hover:border-[#ae936f]/24 hover:bg-white/[0.06]"
                      >
                        <div className="h-24 w-24 overflow-hidden rounded-[1.4rem] bg-[#12100f]">
                          <img src={getEventCover(event)} alt={event.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[10px] uppercase tracking-[0.3em] text-[#ae936f]">
                            {event.category || (isPortuguese ? 'Evento' : 'Event')}
                          </div>
                          <div className="mt-2 font-display text-[2rem] leading-[0.94] tracking-[-0.04em] text-[#ebe7e0]">
                            {event.name}
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-[#8e847d]">
                            <span className="inline-flex items-center gap-1.5">
                              <CalendarDays className="h-3.5 w-3.5" />
                              {formatPublicDate(event.starts_at, locale, { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5" />
                              {event.city}
                            </span>
                          </div>
                        </div>
                        <MoveUpRight className="h-5 w-5 text-[#ae936f] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </a>
                    </PublicReveal>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <PublicReveal>
              <div className="rounded-[2.3rem] border border-white/8 bg-[linear-gradient(180deg,rgba(18,16,15,0.94),rgba(11,10,10,0.9))] p-8">
                <div className="text-[10px] uppercase tracking-[0.4em] text-[#ae936f]">
                  {isPortuguese ? 'Estrutura de produto' : 'Product structure'}
                </div>
                <div className="mt-5 font-display text-[clamp(2.4rem,4vw,4.1rem)] leading-[0.9] tracking-[-0.05em] text-[#ebe7e0]">
                  {isPortuguese ? 'A mesma plataforma organiza descoberta, venda e operacao.' : 'The same platform organizes discovery, sales and operations.'}
                </div>
                <div className="mt-6 space-y-4 text-sm leading-8 text-[#b8b0a8]/74">
                  <p>{isPortuguese ? 'O publico encontra experiencias com curadoria. O produtor controla lancamento, capacidade, acesso e caixa com leitura executiva.' : 'Audiences discover curated experiences. Producers control launch, capacity, access and cash flow with executive visibility.'}</p>
                  <p>{isPortuguese ? 'Nao e uma vitrine separada do sistema. E o mesmo produto, com a mesma assinatura visual.' : 'This is not a disconnected storefront. It is the same product with the same visual signature.'}</p>
                </div>
              </div>
            </PublicReveal>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: isPortuguese ? 'Checkout em ritmo alto' : 'Fast checkout',
                  description: isPortuguese ? 'Compra em poucos passos, com conversao conectada ao backoffice.' : 'Few-step purchase flow with conversion tied back to operations.',
                },
                {
                  title: isPortuguese ? 'Operacao de campo' : 'Field operations',
                  description: isPortuguese ? 'Credenciamento, equipe e acesso funcionando na mesma camada.' : 'Check-in, staff and access running in the same layer.',
                },
                {
                  title: isPortuguese ? 'CRM e recorrencia' : 'CRM and recurrence',
                  description: isPortuguese ? 'Base de publico, campanhas e reativacao sem fragmentacao.' : 'Audience base, campaigns and reactivation without fragmentation.',
                },
                {
                  title: isPortuguese ? 'Financeiro visivel' : 'Visible finance',
                  description: isPortuguese ? 'Receita, margem e repasse voltam como leitura clara para o produtor.' : 'Revenue, margin and payouts return as a clear producer read.',
                },
              ].map((item, index) => (
                <PublicReveal key={item.title} delayMs={index * 70}>
                  <article className="h-full rounded-[2rem] border border-white/8 bg-white/[0.03] p-6">
                    <div className="text-[10px] uppercase tracking-[0.34em] text-[#ae936f]">
                      0{index + 1}
                    </div>
                    <div className="mt-4 font-display text-[2rem] leading-[0.94] tracking-[-0.04em] text-[#ebe7e0]">
                      {item.title}
                    </div>
                    <div className="mt-4 text-sm leading-7 text-[#b8b0a8]/72">{item.description}</div>
                  </article>
                </PublicReveal>
              ))}
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
            <PublicReveal>
              <div className="rounded-[2.3rem] border border-white/8 bg-[#0e0c0b] p-8">
                <div className="text-[10px] uppercase tracking-[0.4em] text-[#ae936f]">
                  {isPortuguese ? 'Selecao atual' : 'Current selection'}
                </div>
                <div className="mt-5 font-display text-[clamp(2.6rem,4vw,4.2rem)] leading-[0.9] tracking-[-0.05em] text-[#ebe7e0]">
                  {isPortuguese ? 'Capitulos que ja estao em circulacao na plataforma.' : 'Chapters already circulating on the platform.'}
                </div>
              </div>
            </PublicReveal>

            <PublicReveal delayMs={90}>
              <div className="rounded-[2.3rem] border border-white/8 bg-white/[0.03] p-8">
                <div className="text-[10px] uppercase tracking-[0.34em] text-[#ae936f]">
                  {isPortuguese ? 'Leitura comercial' : 'Commercial read'}
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  {stats.map((stat) => (
                    <div key={stat.label} className="rounded-[1.5rem] border border-white/8 bg-[#12100f] p-4">
                      <div className="text-[10px] uppercase tracking-[0.28em] text-[#8e847d]">{stat.label}</div>
                      <div className="mt-3 font-display text-[2rem] leading-none tracking-[-0.04em] text-[#ebe7e0]">{stat.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </PublicReveal>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {featuredEvents.map((event, index) => (
              <PublicReveal key={event.id} delayMs={index * 70}>
                <a
                  href={`/e/${event.slug}`}
                  className="group relative overflow-hidden rounded-[2rem] border border-white/8 bg-[#12100f] transition-all duration-300 hover:-translate-y-1 hover:border-[#ae936f]/24"
                >
                  <div className="aspect-[0.86] overflow-hidden">
                    <img src={getEventCover(event)} alt={event.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070607] via-[#070607]/22 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-[#ae936f]">
                      {event.city || event.category || (isPortuguese ? 'Evento' : 'Event')}
                    </div>
                    <div className="mt-3 font-display text-[2rem] leading-[0.94] tracking-[-0.04em] text-[#ebe7e0]">
                      {event.name}
                    </div>
                    <div className="mt-3 text-sm text-[#b8b0a8]/72">
                      {event.minPrice === null
                        ? isPortuguese ? 'Sob consulta' : 'On request'
                        : event.minPrice === 0
                          ? isPortuguese ? 'Acesso livre' : 'Free access'
                          : `${isPortuguese ? 'A partir de' : 'From'} ${formatPublicCurrency(event.minPrice, locale)}`}
                    </div>
                  </div>
                </a>
              </PublicReveal>
            ))}
          </section>
        </div>
      </div>
    </PublicLayout>
  )
}
