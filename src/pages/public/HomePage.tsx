import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, CalendarDays, MapPin, Play, ShieldCheck, Sparkles, Ticket, Users } from 'lucide-react'
import { EventHeroMedia, getEventAssetUrl } from '@/features/event-media'
import {
  EditorialContentBlock,
  PremiumBadge,
  PremiumEventCard,
  PremiumSection,
  PublicLayout,
  PublicReveal,
  usePublicEvents,
} from '@/features/public'

function HeroSkeleton() {
  return (
    <div className="overflow-hidden rounded-[40px] border border-white/70 bg-white/70 p-6 shadow-[0_24px_90px_rgba(46,34,17,0.08)]">
      <div className="h-[72svh] animate-pulse rounded-[32px] bg-[#eadfcd]" />
    </div>
  )
}

export function HomePage({ onLogin }: { onLogin: () => void }) {
  const [scrollY, setScrollY] = useState(0)
  const publicEventsQuery = usePublicEvents()
  const events = publicEventsQuery.data ?? []

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const heroEvent = useMemo(
    () => [...events].sort((left, right) => right.sold_tickets - left.sold_tickets)[0] ?? null,
    [events],
  )

  const featuredEvents = useMemo(() => events.slice(0, 3), [events])

  const stats = useMemo(() => {
    const cityCount = new Set(events.map((event) => event.city).filter(Boolean)).size

    return [
      { label: 'Ingressos vendidos', value: events.reduce((sum, event) => sum + event.sold_tickets, 0).toLocaleString('pt-BR') },
      { label: 'Experiencias ativas', value: String(events.length) },
      { label: 'Destinos em curadoria', value: String(cityCount) },
      { label: 'Capacidade total', value: events.reduce((sum, event) => sum + (event.total_capacity ?? 0), 0).toLocaleString('pt-BR') },
    ]
  }, [events])

  return (
    <PublicLayout onLogin={onLogin}>
      <PremiumSection className="pb-10 pt-8 md:pt-10 lg:pb-14">
        {publicEventsQuery.isPending ? (
          <HeroSkeleton />
        ) : (
          <div className="overflow-hidden rounded-[40px] border border-white/70 bg-white/75 p-4 shadow-[0_24px_90px_rgba(46,34,17,0.08)] md:p-6">
            <div className="relative min-h-[72svh] overflow-hidden rounded-[32px]">
              {heroEvent ? (
                <>
                  <EventHeroMedia
                    eventName={heroEvent.name}
                    coverAsset={heroEvent.mediaPresentation.coverAsset}
                    heroAsset={heroEvent.mediaPresentation.heroAsset}
                    fallbackImage={
                      getEventAssetUrl(heroEvent.mediaPresentation.coverAsset) ||
                      heroEvent.cover_url ||
                      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1800&q=80&fit=crop'
                    }
                    scrollY={scrollY}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#201913]/70 via-[#201913]/32 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#201913]/72 via-transparent to-transparent" />
                </>
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#f2e0bd,transparent_36%),linear-gradient(135deg,#efe6d7_0%,#e6d7c2_48%,#efe7db_100%)]" />
              )}

              <div className="relative z-10 flex min-h-[72svh] flex-col justify-between p-7 text-white md:p-10 lg:p-14">
                <div className="flex flex-wrap items-center gap-3">
                  <PremiumBadge tone="default">Curadoria premium</PremiumBadge>
                  {heroEvent?.mediaPresentation.heroAsset ? (
                    <PremiumBadge tone="accent" className="gap-2">
                      <Play className="h-3.5 w-3.5" />
                      Hero video ativo
                    </PremiumBadge>
                  ) : null}
                </div>

                <div className="max-w-3xl">
                  <PublicReveal>
                    <div className="text-[11px] uppercase tracking-[0.32em] text-white/72">
                      {heroEvent ? 'Experiencias em destaque' : 'Plataforma premium para grandes experiencias'}
                    </div>
                    <h1 className="mt-5 max-w-4xl font-serif text-5xl font-semibold leading-[0.92] md:text-7xl">
                      Descubra eventos que comecam antes da abertura dos portoes.
                    </h1>
                    <p className="mt-6 max-w-2xl text-base leading-7 text-white/82 md:text-lg">
                      Animalz Events transforma descoberta, compra e operacao em uma unica jornada editorial. Use o ambiente demo completo para apresentar experiencias sofisticadas com dados reais, landing pages ricas e checkout pronto para conversao.
                    </p>
                  </PublicReveal>

                  <PublicReveal className="mt-8 flex flex-wrap items-center gap-4" delayMs={120}>
                    <a
                      href="/events"
                      className="inline-flex items-center gap-3 rounded-full bg-[#f8f3ea] px-6 py-3 text-sm font-semibold text-[#1f1a15] transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(20,12,3,0.18)]"
                    >
                      Explorar eventos
                      <ArrowRight className="h-4 w-4" />
                    </a>
                    {heroEvent ? (
                      <a
                        href={`/e/${heroEvent.slug}`}
                        className="inline-flex items-center gap-3 rounded-full border border-white/50 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
                      >
                        Ver landing do evento principal
                      </a>
                    ) : null}
                  </PublicReveal>
                </div>

                {heroEvent ? (
                  <PublicReveal className="grid gap-4 lg:grid-cols-[1.3fr_0.9fr]" delayMs={200}>
                    <div className="rounded-[28px] border border-white/20 bg-white/10 p-5 backdrop-blur-md">
                      <div className="flex flex-wrap items-center gap-3">
                        <PremiumBadge tone="default">{heroEvent.category || 'Evento premium'}</PremiumBadge>
                        {heroEvent.minPrice !== null ? (
                          <span className="text-sm text-white/76">
                            {heroEvent.minPrice === 0 ? 'Inscricao gratuita' : `a partir de R$ ${heroEvent.minPrice.toLocaleString('pt-BR')}`}
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-4 font-serif text-3xl leading-none">{heroEvent.name}</div>
                      <p className="mt-3 max-w-xl text-sm leading-6 text-white/76">
                        {heroEvent.subtitle || heroEvent.short_description}
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                      {[
                        {
                          icon: CalendarDays,
                          label: 'Data',
                          value: new Date(heroEvent.starts_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
                        },
                        {
                          icon: MapPin,
                          label: 'Local',
                          value: [heroEvent.venue_name, heroEvent.city].filter(Boolean).join(' · '),
                        },
                        {
                          icon: Users,
                          label: 'Demanda',
                          value: `${heroEvent.sold_tickets.toLocaleString('pt-BR')} ingressos vendidos`,
                        },
                      ].map((item) => {
                        const Icon = item.icon

                        return (
                          <div key={item.label} className="rounded-[24px] border border-white/20 bg-white/10 p-4 backdrop-blur-md">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/14">
                                <Icon className="h-4 w-4" />
                              </div>
                              <div>
                                <div className="text-[10px] uppercase tracking-[0.24em] text-white/58">{item.label}</div>
                                <div className="mt-1 text-sm font-medium text-white">{item.value}</div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </PublicReveal>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </PremiumSection>

      <PremiumSection
        eyebrow="Selecao em destaque"
        title="Eventos que ja chegam com narrativa, prova social e operacao pronta."
        description="Use o demo como uma vitrine real do produto: eventos publicados, assets hero, vendas, check-in, CRM e campanhas alimentando a percepcao de plataforma viva."
      >
        {publicEventsQuery.isPending ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-[34rem] animate-pulse rounded-[32px] bg-white/75" />
            ))}
          </div>
        ) : featuredEvents.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featuredEvents.map((event, index) => (
              <PremiumEventCard key={event.id} event={event} priority={index === 0} index={index} />
            ))}
          </div>
        ) : (
          <div className="rounded-[32px] border border-white/70 bg-white/75 p-8 text-center text-[#5f5549]">
            Nenhum evento publico encontrado no momento.
          </div>
        )}
      </PremiumSection>

      <PremiumSection className="pt-0">
        <EditorialContentBlock
          eyebrow="Plataforma de experiencia"
          title="A percepcao de exclusividade nasce nos detalhes visiveis e nos fluxos invisiveis."
          description="Do primeiro frame da landing ao momento em que o ingresso digital chega por e-mail, cada touchpoint foi pensado para parecer confiavel, respirado e desejavel."
          note="Usando os dados reais do ambiente demo"
        >
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                icon: Sparkles,
                title: 'Camada editorial',
                text: 'Homepage, listagem e paginas de evento usam assets reais, tipografia refinada e muito respiro para vender experiencia antes de vender lote.',
              },
              {
                icon: Ticket,
                title: 'Checkout com confianca',
                text: 'Reserva, pagamento e confirmacao ficam mais claros sem alterar a logica que ja controla estoque, draft order e tickets digitais.',
              },
              {
                icon: ShieldCheck,
                title: 'Operacao elegante',
                text: 'A plataforma parece premium sem esconder a robustez: campanhas, intelligence, check-in e financeiro continuam integrados por tras.',
              },
              {
                icon: Users,
                title: 'Demo com vida real',
                text: 'O seed traz 7.000 ingressos vendidos, 300 pessoas de staff, CRM rico e dashboards executivos para apresentacoes e validacao comercial.',
              },
            ].map((item) => {
              const Icon = item.icon

              return (
                <div key={item.title} className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_14px_50px_rgba(48,35,18,0.05)]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f2e6d5] text-[#7b6440]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="mt-5 font-serif text-2xl font-semibold leading-none text-[#1f1a15]">
                    {item.title}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#5f5549]">{item.text}</p>
                </div>
              )
            })}
          </div>
        </EditorialContentBlock>
      </PremiumSection>

      <PremiumSection
        eyebrow="Sinais do demo"
        title="Uma superficie publica bonita precisa parecer sustentada por operacao real."
        description="Os indicadores abaixo puxam direto do que ja esta populado no ambiente demo, reforcando a narrativa de plataforma pronta para venda, gestao e escala."
        className="pt-0"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => (
            <PublicReveal key={stat.label} delayMs={index * 90}>
              <div className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_14px_50px_rgba(48,35,18,0.05)]">
                <div className="text-[11px] uppercase tracking-[0.28em] text-[#8e7f68]">{stat.label}</div>
                <div className="mt-4 font-serif text-4xl font-semibold leading-none text-[#1f1a15]">
                  {stat.value}
                </div>
              </div>
            </PublicReveal>
          ))}
        </div>
      </PremiumSection>
    </PublicLayout>
  )
}
