import { useDeferredValue, useMemo, useState, useTransition } from 'react'
import { EmptyState, LoadingState } from '@/shared/components'
import type { PublicEventSummary } from '@/features/public/types/public.types'
import { EventsFilterBar } from './EventsFilterBar'
import { EventsRowCarousel } from './EventsRowCarousel'
import { FeaturedEventBlock } from './FeaturedEventBlock'
import { PremiumBadge } from './PremiumBadge'
import { PublicLayout } from './PublicLayout'
import { PublicReveal } from './PublicReveal'
import { usePublicEvents } from '../hooks/usePublicEvents'

function takeUnique(source: PublicEventSummary[], usedIds: Set<string>, size: number) {
  const unique = source.filter((event) => !usedIds.has(event.id)).slice(0, size)

  unique.forEach((event) => usedIds.add(event.id))

  if (unique.length < size) {
    const fallback = source.filter((event) => !unique.some((item) => item.id === event.id)).slice(0, size - unique.length)
    return [...unique, ...fallback]
  }

  return unique
}

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

  const discoveryRows = useMemo(() => {
    const now = new Date()
    const futureEvents = [...filteredEvents].filter((event) => new Date(event.starts_at) >= now)
    const byPopularity = [...filteredEvents].sort((left, right) => right.sold_tickets - left.sold_tickets)
    const byPrice = [...filteredEvents].sort((left, right) => (right.minPrice ?? 0) - (left.minPrice ?? 0))
    const byRecentStart = [...filteredEvents].sort(
      (left, right) => new Date(right.starts_at).getTime() - new Date(left.starts_at).getTime(),
    )

    const usedIds = new Set<string>()
    const highlights = takeUnique(byPopularity, usedIds, 6)
    const upcoming = takeUnique(
      [...futureEvents].sort((left, right) => new Date(left.starts_at).getTime() - new Date(right.starts_at).getTime()),
      usedIds,
      8,
    )
    const premium = takeUnique(byPrice.filter((event) => (event.minPrice ?? 0) > 0), usedIds, 8)
    const popular = takeUnique(byPopularity, usedIds, 8)
    const newArrivals = takeUnique(byRecentStart, usedIds, 8)

    return {
      highlights,
      upcoming,
      premium,
      popular,
      newArrivals,
    }
  }, [filteredEvents])

  const featuredPrimary = discoveryRows.highlights[0] ?? filteredEvents[0] ?? null
  const featuredSecondary = (discoveryRows.upcoming.length > 0 ? discoveryRows.upcoming : filteredEvents).filter(
    (event) => event.id !== featuredPrimary?.id,
  ).slice(0, 2)

  return (
    <PublicLayout onLogin={onLogin}>
      <section className="px-5 pb-8 pt-12 md:px-10 lg:px-16 lg:pb-10 lg:pt-16">
        <div className="mx-auto max-w-7xl">
          <PublicReveal>
            <div className="max-w-4xl">
              <h1 className="font-display text-[clamp(3.5rem,7vw,6.5rem)] font-semibold leading-[0.9] tracking-[-0.05em] text-[#f0ebe2]">
                Todos os eventos
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[#9a9088] md:text-lg">
                Encontre eventos por cidade, categoria ou data. Compre ingressos com facilidade e garanta seu lugar.
              </p>
            </div>
          </PublicReveal>

          <PublicReveal delayMs={80} className="mt-7 flex flex-wrap gap-3">
            <PremiumBadge tone="default" className="border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.06)] text-[#9a9088]">
              Ingressos online
            </PremiumBadge>
            <PremiumBadge tone="accent" className="border-[#c49a50]/25 bg-[#c49a50]/10 text-[#c49a50]">
              Acesso via QR code
            </PremiumBadge>
          </PublicReveal>

          <div className="mt-10">
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
        </div>
      </section>

      {publicEventsQuery.isPending ? (
        <div className="px-5 pb-24 md:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <LoadingState
              title="Carregando eventos"
              description="Buscando os eventos disponiveis."
              className="min-h-[18rem]"
            />
          </div>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="px-5 pb-24 md:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <EmptyState
              title="Nenhum evento encontrado"
              description="Tente outros filtros ou limpe a busca para ver todos os eventos disponiveis."
              className="min-h-[20rem]"
            />
          </div>
        </div>
      ) : (
        <>
          <FeaturedEventBlock primaryEvent={featuredPrimary} secondaryEvents={featuredSecondary} />
          <EventsRowCarousel
            title="Destaques"
            description="Os eventos com maior demanda e ingressos se esgotando."
            events={discoveryRows.highlights}
          />
          <EventsRowCarousel
            title="Proximos eventos"
            description="Reserve com antecedencia e garanta seu lugar."
            events={discoveryRows.upcoming}
          />
          <EventsRowCarousel
            title="Eventos premium"
            description="Experiencias exclusivas com acesso limitado."
            events={discoveryRows.premium}
          />
          <EventsRowCarousel
            title="Mais populares"
            description="Os eventos preferidos de quem ja comprou."
            events={discoveryRows.popular}
          />
          <EventsRowCarousel
            title="Novidades"
            description="Eventos recentes adicionados a plataforma."
            events={discoveryRows.newArrivals}
          />
        </>
      )}
    </PublicLayout>
  )
}
