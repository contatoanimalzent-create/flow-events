import { useDeferredValue, useMemo, useState, useTransition } from 'react'
import { EmptyState, LoadingState } from '@/shared/components'
import {
  EventsFilterBar,
  EventsScheduleList,
  ExploreMoreSection,
  FeaturedEventBanner,
  PublicLayout,
  PublicReveal,
  RelatedExperiencesGrid,
} from '@/features/public'
import { usePublicLocale } from '../lib/public-locale'
import { usePublicEvents } from '../hooks/usePublicEvents'

export function EventsDiscoveryPage({ onLogin }: { onLogin: () => void }) {
  const { isPortuguese } = usePublicLocale()
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

  const scheduleEvents = useMemo(
    () =>
      [...filteredEvents]
        .sort((left, right) => new Date(left.starts_at).getTime() - new Date(right.starts_at).getTime())
        .slice(0, 8),
    [filteredEvents],
  )

  const relatedEvents = useMemo(
    () => filteredEvents.filter((event) => event.id !== featuredEvent?.id).slice(0, 4),
    [featuredEvent?.id, filteredEvents],
  )

  const cityCount = useMemo(() => new Set(events.map((event) => event.city).filter(Boolean)).size, [events])
  const categories = useMemo(
    () =>
      Array.from(new Set(events.map((event) => event.category).filter(Boolean)))
        .slice(0, 6)
        .map((item) => String(item)),
    [events],
  )

  return (
    <PublicLayout onLogin={onLogin}>
      <section className="px-5 pb-8 pt-8 md:px-10 lg:px-16 lg:pb-10 lg:pt-10">
        <div className="mx-auto max-w-7xl">
          <PublicReveal>
            <div className="grid gap-6 rounded-[2.6rem] border border-white/8 bg-[linear-gradient(135deg,#0d1117_0%,#121823_100%)] px-8 py-10 shadow-[0_24px_80px_rgba(0,0,0,0.28)] lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-end">
              <div className="max-w-4xl">
                <div className="text-[11px] uppercase tracking-[0.34em] text-white/48">Experiences calendar</div>
                <h1 className="mt-5 font-display text-[clamp(3.6rem,8vw,6.8rem)] font-semibold uppercase leading-[0.84] tracking-[-0.04em] text-white">
                  {isPortuguese ? 'Agenda premium de experiencias.' : 'Premium experiences calendar.'}
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-white/68 md:text-lg">
                  {isPortuguese
                    ? 'Descubra eventos por cidade, periodo e categoria em uma camada mais direta, mais comercial e muito menos parecida com um marketplace generico.'
                    : 'Discover events by city, date range and category through a more direct, more commercial layer that feels far less like a generic marketplace.'}
                </p>
                {categories.length > 0 ? (
                  <div className="mt-7 flex flex-wrap gap-3">
                    {categories.slice(0, 6).map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => startTransition(() => setCategory(item))}
                        className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-medium text-white/72 transition-all duration-300 hover:border-[#ff2d2d]/36 hover:text-white"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="grid gap-4">
                {[
                  { label: isPortuguese ? 'Eventos visiveis' : 'Visible events', value: `${filteredEvents.length || events.length}` },
                  { label: isPortuguese ? 'Cidades ativas' : 'Active cities', value: `${cityCount}` },
                  { label: isPortuguese ? 'Categorias' : 'Categories', value: `${categories.length}` },
                ].map((item) => (
                  <div key={item.label} className="rounded-[1.7rem] border border-white/10 bg-black/24 p-5">
                    <div className="text-[10px] uppercase tracking-[0.28em] text-white/42">{item.label}</div>
                    <div className="mt-3 font-display text-[2rem] font-semibold uppercase tracking-[-0.03em] text-white">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </PublicReveal>
        </div>
      </section>

      <section className="px-5 pb-6 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
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
          />
        </div>
      </section>

      {publicEventsQuery.isPending ? (
        <div className="px-5 pb-24 md:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <LoadingState
              title={isPortuguese ? 'Carregando experiencias' : 'Loading experiences'}
              description={isPortuguese ? 'Buscando os eventos disponiveis agora.' : 'Loading currently available events.'}
              className="min-h-[18rem]"
            />
          </div>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="px-5 pb-24 md:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <EmptyState
              title={isPortuguese ? 'Nenhuma experiencia encontrada' : 'No experiences found'}
              description={isPortuguese ? 'Ajuste cidade, data ou categoria para abrir uma nova selecao de experiencias.' : 'Adjust city, date or category to open a new selection of experiences.'}
              className="min-h-[20rem]"
            />
          </div>
        </div>
      ) : (
        <>
          {featuredEvent ? <FeaturedEventBanner event={featuredEvent} /> : null}

          <EventsScheduleList
            events={scheduleEvents}
            title={isPortuguese ? 'Agenda de proximas experiencias' : 'Upcoming schedule'}
            subtitle={
              isPortuguese
                ? 'Uma listagem comercial e muito mais facil de percorrer para comparar datas, venues, demanda e acessos disponiveis.'
                : 'A commercial list that is much easier to scan for dates, venues, demand and available access.'
            }
          />

          <RelatedExperiencesGrid
            events={relatedEvents.length > 0 ? relatedEvents : filteredEvents.slice(0, 4)}
            title={isPortuguese ? 'Explore experiencias relacionadas' : 'Explore related experiences'}
          />
          <ExploreMoreSection currentEventId={featuredEvent?.id ?? ''} events={filteredEvents} />
        </>
      )}
    </PublicLayout>
  )
}
