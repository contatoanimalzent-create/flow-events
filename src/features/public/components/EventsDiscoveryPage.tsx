import { useDeferredValue, useMemo, useState, useTransition } from 'react'
import { ArrowRight, CalendarDays, MapPin, Ticket } from 'lucide-react'
import { EmptyState, LoadingState } from '@/shared/components'
import { EventsFilterBar, PublicLayout, PublicReveal } from '@/features/public'
import { usePublicLocale, formatPublicCurrency, formatPublicDate, formatPublicNumber } from '../lib/public-locale'
import { usePublicEvents } from '../hooks/usePublicEvents'

function getCardImage(coverUrl?: string | null) {
  if (coverUrl) return coverUrl
  return 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1800&q=80&fit=crop'
}

export function EventsDiscoveryPage({ onLogin }: { onLogin: () => void }) {
  const { isPortuguese, locale } = usePublicLocale()
  const [search, setSearch] = useState('')
  const [city, setCity] = useState('all')
  const [dateRange, setDateRange] = useState('all')
  const [category, setCategory] = useState('all')
  const [isPending, startTransition] = useTransition()
  const deferredSearch = useDeferredValue(search)

  const publicEventsQuery = usePublicEvents()
  const events = publicEventsQuery.data ?? []

  const cityOptions = useMemo(
    () => Array.from(new Set(events.map((event) => event.city).filter(Boolean))).sort(),
    [events],
  )
  const categoryOptions = useMemo(
    () => Array.from(new Set(events.map((event) => event.category).filter(Boolean))).sort(),
    [events],
  )

  const filteredEvents = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase()
    const now = new Date()
    const plus30Days = new Date(now)
    plus30Days.setDate(plus30Days.getDate() + 30)
    const plus90Days = new Date(now)
    plus90Days.setDate(plus90Days.getDate() + 90)

    return events.filter((event) => {
      const eventDate = new Date(event.starts_at)
      const matchesCity = city === 'all' || event.city === city
      const matchesCategory = category === 'all' || event.category === category
      const haystack = [event.name, event.subtitle, event.city, event.venue_name, event.category]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      const matchesDate =
        dateRange === 'all' ||
        (dateRange === '30d' && eventDate <= plus30Days) ||
        (dateRange === '90d' && eventDate <= plus90Days) ||
        (dateRange === 'later' && eventDate > plus90Days)

      return matchesCity && matchesCategory && matchesDate && haystack.includes(normalizedSearch)
    })
  }, [category, city, dateRange, deferredSearch, events])

  const featuredEvent = useMemo(
    () => [...filteredEvents].sort((left, right) => right.sold_tickets - left.sold_tickets)[0] ?? null,
    [filteredEvents],
  )

  return (
    <PublicLayout onLogin={onLogin}>
      <section className="px-5 pb-8 pt-6 md:px-8 lg:px-10 lg:pb-10 lg:pt-8">
        <div className="mx-auto max-w-[1540px]">
          <PublicReveal>
            <div className="grid gap-6 rounded-[2.6rem] border border-white/8 bg-[linear-gradient(135deg,rgba(0,87,231,0.16)_0%,rgba(11,13,18,0.98)_36%,rgba(66,133,244,0.08)_100%)] px-8 py-10 shadow-[0_28px_90px_rgba(0,0,0,0.3)] lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-end">
              <div className="max-w-4xl">
                <div className="text-[11px] uppercase tracking-[0.34em] text-[#4285F4]">
                  {isPortuguese ? 'Catalogo operacional de eventos' : 'Operational event catalog'}
                </div>
                <h1 className="mt-5 font-display text-[clamp(3.6rem,8vw,6.8rem)] uppercase leading-[0.84] tracking-[-0.04em] text-[#FFFFFF]">
                  {isPortuguese ? 'Descubra e compre sem cair em um marketplace comum.' : 'Discover and buy without falling into a generic marketplace.'}
                </h1>
                <p className="mt-5 max-w-3xl text-base leading-8 text-white/62 md:text-lg">
                  {isPortuguese
                    ? 'Cada evento tem atmosfera propria, mas todos compartilham a mesma fundacao premium de venda, agenda, acesso e operacao.'
                    : 'Each event has its own atmosphere, but all share the same premium foundation for sales, schedule, access and operations.'}
                </p>
              </div>

              <div className="grid gap-4">
                {[
                  { label: isPortuguese ? 'Eventos visiveis' : 'Visible events', value: `${filteredEvents.length || events.length}` },
                  { label: isPortuguese ? 'Cidades ativas' : 'Active cities', value: `${cityOptions.length}` },
                  { label: isPortuguese ? 'Categorias' : 'Categories', value: `${categoryOptions.length}` },
                ].map((item) => (
                  <div key={item.label} className="rounded-[1.6rem] border border-white/8 bg-black/20 p-5">
                    <div className="text-[10px] uppercase tracking-[0.28em] text-white/40">{item.label}</div>
                    <div className="mt-3 font-display text-[2rem] uppercase tracking-[-0.04em] text-[#FFFFFF]">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </PublicReveal>
        </div>
      </section>

      <section className="px-5 pb-6 md:px-8 lg:px-10">
        <div className="mx-auto max-w-[1540px]">
          <EventsFilterBar
            search={search}
            onSearchChange={(value) => startTransition(() => setSearch(value))}
            city={city}
            onCityChange={(value) => startTransition(() => setCity(value))}
            dateRange={dateRange}
            onDateRangeChange={(value) => startTransition(() => setDateRange(value))}
            category={category}
            onCategoryChange={(value) => startTransition(() => setCategory(value))}
            cityOptions={cityOptions}
            categoryOptions={categoryOptions}
            resultCount={filteredEvents.length}
            isPending={isPending}
            tone="dark"
          />
        </div>
      </section>

      {publicEventsQuery.isPending ? (
        <div className="px-5 pb-24 md:px-8 lg:px-10">
          <div className="mx-auto max-w-[1540px]">
            <LoadingState
              title={isPortuguese ? 'Carregando eventos' : 'Loading events'}
              description={isPortuguese ? 'Montando o catalogo operacional.' : 'Building the operational catalog.'}
              className="min-h-[18rem]"
            />
          </div>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="px-5 pb-24 md:px-8 lg:px-10">
          <div className="mx-auto max-w-[1540px]">
            <EmptyState
              title={isPortuguese ? 'Nenhum evento encontrado' : 'No events found'}
              description={isPortuguese ? 'Ajuste cidade, data ou categoria para abrir uma nova selecao.' : 'Adjust city, date or category to open a new selection.'}
              className="min-h-[20rem]"
            />
          </div>
        </div>
      ) : (
        <>
          {featuredEvent ? (
            <section className="px-5 py-6 md:px-8 lg:px-10 lg:py-8">
              <div className="mx-auto max-w-[1540px]">
                <PublicReveal>
                  <a
                    href={`/e/${featuredEvent.slug}`}
                    className="group relative block overflow-hidden rounded-[2.7rem] border border-white/8 bg-[#0d1118] shadow-[0_28px_90px_rgba(0,0,0,0.3)]"
                  >
                    <img
                      src={
                        featuredEvent.mediaPresentation.coverAsset?.secure_url ||
                        featuredEvent.mediaPresentation.heroAsset?.secure_url ||
                        getCardImage(featuredEvent.cover_url)
                      }
                      alt={featuredEvent.name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(6,7,10,0.96)_0%,rgba(6,7,10,0.84)_42%,rgba(6,7,10,0.28)_78%,rgba(6,7,10,0.12)_100%)]" />
                    <div className="relative z-10 grid gap-8 p-8 md:p-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:p-12">
                      <div className="max-w-3xl">
                        <div className="inline-flex rounded-full border border-[#4285F4]/22 bg-[#4285F4]/8 px-4 py-2 text-[10px] uppercase tracking-[0.28em] text-[#4285F4]">
                          {isPortuguese ? 'Evento em destaque' : 'Featured event'}
                        </div>
                        <h2 className="mt-6 font-display text-[clamp(3rem,6vw,5.2rem)] uppercase leading-[0.86] tracking-[-0.05em] text-[#FFFFFF]">
                          {featuredEvent.name}
                        </h2>
                        <p className="mt-5 max-w-2xl text-base leading-8 text-white/64">
                          {featuredEvent.subtitle || featuredEvent.short_description}
                        </p>
                        <div className="mt-8 flex flex-wrap items-center gap-5 text-sm text-white/72">
                          <span className="inline-flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-[#4285F4]" />
                            {formatPublicDate(featuredEvent.starts_at, locale, {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </span>
                          <span className="inline-flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-[#4285F4]" />
                            {[featuredEvent.venue_name, featuredEvent.city].filter(Boolean).join(' / ')}
                          </span>
                        </div>
                      </div>

                      <div className="grid gap-4 self-end">
                        <div className="rounded-[1.6rem] border border-white/10 bg-black/24 p-5 backdrop-blur-xl">
                          <div className="text-[10px] uppercase tracking-[0.24em] text-white/42">
                            {isPortuguese ? 'Ticketing' : 'Ticketing'}
                          </div>
                          <div className="mt-3 font-display text-[2rem] uppercase leading-none tracking-[-0.04em] text-[#FFFFFF]">
                            {featuredEvent.minPrice && featuredEvent.minPrice > 0
                              ? formatPublicCurrency(featuredEvent.minPrice, locale)
                              : isPortuguese
                                ? 'Inscricao'
                                : 'Registration'}
                          </div>
                          <div className="mt-2 text-sm text-white/54">
                            {formatPublicNumber(featuredEvent.sold_tickets, locale)} {isPortuguese ? 'acessos vendidos' : 'accesses sold'}
                          </div>
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-[#0057E7] px-5 py-3 text-xs font-bold uppercase tracking-[0.22em] text-white">
                          {isPortuguese ? 'Ver evento' : 'View event'}
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </a>
                </PublicReveal>
              </div>
            </section>
          ) : null}

          <section className="px-5 pb-20 pt-4 md:px-8 lg:px-10 lg:pb-24">
            <div className="mx-auto max-w-[1540px]">
              <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.32em] text-[#4285F4]">
                    {isPortuguese ? 'Lista ativa' : 'Active list'}
                  </div>
                  <h2 className="mt-4 font-display text-[clamp(2.8rem,4vw,4.4rem)] uppercase leading-[0.9] tracking-[-0.04em] text-[#FFFFFF]">
                    {isPortuguese ? 'Eventos prontos para venda, inscricao e acesso.' : 'Events ready for sales, registration and access.'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onLogin}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-xs font-bold uppercase tracking-[0.22em] text-white/74 transition-all hover:border-[#4285F4]/25 hover:text-white"
                >
                  {isPortuguese ? 'Acesso do produtor' : 'Producer access'}
                </button>
              </div>

              <div className="grid gap-5 xl:grid-cols-2">
                {filteredEvents.map((event, index) => {
                  const cover =
                    event.mediaPresentation.coverAsset?.secure_url ||
                    event.mediaPresentation.heroAsset?.secure_url ||
                    getCardImage(event.cover_url)

                  return (
                    <PublicReveal key={event.id} delayMs={index * 45}>
                      <a
                        href={`/e/${event.slug}`}
                        className="group overflow-hidden rounded-[2rem] border border-white/8 bg-[#0d1118] shadow-[0_24px_80px_rgba(0,0,0,0.26)] transition-all duration-500 hover:-translate-y-1 hover:border-white/14"
                      >
                        <div className="grid gap-0 md:grid-cols-[15rem_minmax(0,1fr)]">
                          <div className="relative min-h-[18rem] overflow-hidden">
                            <img
                              src={cover}
                              alt={event.name}
                              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                            />
                            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,10,0.1)_0%,rgba(5,7,10,0.78)_100%)]" />
                            <div className="absolute inset-x-5 bottom-5">
                              <div className="text-[10px] uppercase tracking-[0.26em] text-[#4285F4]">
                                {event.category || (isPortuguese ? 'Evento' : 'Event')}
                              </div>
                              <div className="mt-2 font-display text-[3rem] uppercase leading-none tracking-[-0.05em] text-[#FFFFFF]">
                                {formatPublicDate(event.starts_at, locale, { day: '2-digit' })}
                              </div>
                            </div>
                          </div>

                          <div className="flex min-w-0 flex-col justify-between p-6 md:p-7">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full border border-[#0057E7]/22 bg-[#0057E7]/12 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-[#93B4F4]">
                                  {index < 2 ? (isPortuguese ? 'Alta demanda' : 'High demand') : isPortuguese ? 'Venda aberta' : 'Open sales'}
                                </span>
                                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-white/46">
                                  {[event.city, event.state].filter(Boolean).join(' / ')}
                                </span>
                              </div>

                              <h3 className="mt-5 font-display text-[clamp(2.2rem,3vw,3.2rem)] uppercase leading-[0.9] tracking-[-0.04em] text-[#FFFFFF]">
                                {event.name}
                              </h3>
                              <p className="mt-4 text-sm leading-7 text-white/60">
                                {event.subtitle || event.short_description}
                              </p>
                            </div>

                            <div className="mt-6 space-y-4">
                              <div className="grid gap-3 sm:grid-cols-2">
                                <div className="flex items-center gap-2 text-sm text-white/64">
                                  <CalendarDays className="h-4 w-4 text-[#4285F4]" />
                                  {formatPublicDate(event.starts_at, locale, {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric',
                                  })}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-white/64">
                                  <MapPin className="h-4 w-4 text-[#4285F4]" />
                                  {[event.venue_name, event.city].filter(Boolean).join(' / ')}
                                </div>
                              </div>

                              <div className="flex flex-wrap items-end justify-between gap-4 border-t border-white/8 pt-4">
                                <div>
                                  <div className="text-[10px] uppercase tracking-[0.24em] text-white/40">
                                    {isPortuguese ? 'Ticketing' : 'Ticketing'}
                                  </div>
                                  <div className="mt-2 font-display text-[2rem] uppercase leading-none tracking-[-0.04em] text-[#FFFFFF]">
                                    {event.minPrice && event.minPrice > 0
                                      ? formatPublicCurrency(event.minPrice, locale)
                                      : isPortuguese
                                        ? 'Inscricao'
                                        : 'Registration'}
                                  </div>
                                  <div className="mt-2 inline-flex items-center gap-2 text-sm text-white/46">
                                    <Ticket className="h-4 w-4 text-[#4285F4]" />
                                    {formatPublicNumber(event.sold_tickets, locale)} {isPortuguese ? 'confirmados' : 'confirmed'}
                                  </div>
                                </div>

                                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/78 transition-all group-hover:border-white/16 group-hover:text-white">
                                  {isPortuguese ? 'Ver detalhes' : 'View details'}
                                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </a>
                    </PublicReveal>
                  )
                })}
              </div>
            </div>
          </section>
        </>
      )}
    </PublicLayout>
  )
}
