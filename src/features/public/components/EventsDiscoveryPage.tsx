import { useDeferredValue, useMemo, useState, useTransition } from 'react'
import { EmptyState, LoadingState } from '@/shared/components'
import {
  EventsFilterBar,
  EventsHero,
  EventsScheduleList,
  ExploreMoreSection,
  FeaturedEventBanner,
  PublicLayout,
  RelatedExperiencesGrid,
} from '@/features/public'
import { usePublicEvents } from '../hooks/usePublicEvents'

export function EventsDiscoveryPage({ onLogin }: { onLogin: () => void }) {
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
      <EventsHero
        eventCount={filteredEvents.length || events.length}
        cityCount={cityCount}
        categories={categories}
        onCategorySelect={(value) => startTransition(() => setCategory(value))}
      />

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
              title="Carregando experiencias"
              description="Buscando os eventos disponiveis agora."
              className="min-h-[18rem]"
            />
          </div>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="px-5 pb-24 md:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <EmptyState
              title="Nenhum evento encontrado"
              description="Ajuste cidade, data ou categoria para abrir uma nova selecao de experiencias."
              className="min-h-[20rem]"
            />
          </div>
        </div>
      ) : (
        <>
          {featuredEvent ? <FeaturedEventBanner event={featuredEvent} /> : null}

          <EventsScheduleList
            events={scheduleEvents}
            title="Agenda premium"
            subtitle="Uma listagem clara, comercial e facil de percorrer para comparar datas, venues e acessos disponiveis."
          />

          <RelatedExperiencesGrid events={relatedEvents.length > 0 ? relatedEvents : filteredEvents.slice(0, 4)} title="Explore mais experiencias" />
          <ExploreMoreSection currentEventId={featuredEvent?.id ?? ''} events={filteredEvents} />
        </>
      )}
    </PublicLayout>
  )
}
