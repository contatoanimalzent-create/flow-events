import { useDeferredValue, useMemo, useState, useTransition } from 'react'
import { Search } from 'lucide-react'
import {
  PremiumBadge,
  PremiumEventCard,
  PremiumSection,
  PublicLayout,
  PublicReveal,
  usePublicEvents,
} from '@/features/public'

const STATUS_FILTERS = [
  { label: 'Todos', value: 'all' },
  { label: 'Proximos', value: 'published' },
  { label: 'Ao vivo', value: 'ongoing' },
] as const

export function EventsCatalogPage({ onLogin }: { onLogin: () => void }) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]['value']>('all')
  const [category, setCategory] = useState('all')
  const [isPending, startTransition] = useTransition()
  const deferredSearch = useDeferredValue(search)

  const publicEventsQuery = usePublicEvents()
  const events = publicEventsQuery.data ?? []

  const categories = useMemo(
    () => ['all', ...Array.from(new Set(events.map((event) => event.category).filter(Boolean)))],
    [events],
  )

  const filteredEvents = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase()

    return events.filter((event) => {
      const matchesStatus = status === 'all' || event.status === status
      const matchesCategory = category === 'all' || event.category === category
      const haystack = [event.name, event.subtitle, event.city, event.venue_name, event.category]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return matchesStatus && matchesCategory && haystack.includes(normalizedSearch)
    })
  }, [category, deferredSearch, events, status])

  return (
    <PublicLayout onLogin={onLogin}>
      <PremiumSection
        eyebrow="Calendario publico"
        title="Uma selecao viva de experiencias premium, pronta para descoberta e conversao."
        description="Use busca e filtros elegantes para navegar pelos eventos publicados no demo. Os cards abaixo usam cover real, metadados do evento e precificacao dos lotes ativos."
      >
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <PublicReveal>
            <div className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_16px_60px_rgba(48,35,18,0.05)]">
              <label className="block text-[11px] uppercase tracking-[0.28em] text-[#8e7f68]">
                Buscar experiencias
              </label>
              <div className="relative mt-4">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8e7f68]" />
                <input
                  value={search}
                  onChange={(event) => {
                    const nextValue = event.target.value
                    startTransition(() => setSearch(nextValue))
                  }}
                  placeholder="Nome, cidade, venue ou categoria"
                  className="w-full rounded-full border border-[#ddd1bf] bg-[#fbf7f1] px-12 py-3.5 text-sm text-[#1f1a15] outline-none transition-colors placeholder:text-[#a2927e] focus:border-[#b79e74]"
                />
              </div>
            </div>
          </PublicReveal>

          <PublicReveal delayMs={80}>
            <div className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_16px_60px_rgba(48,35,18,0.05)]">
              <div className="text-[11px] uppercase tracking-[0.28em] text-[#8e7f68]">Panorama</div>
              <div className="mt-4 flex flex-wrap gap-3">
                <PremiumBadge tone="default">{events.length} eventos no ar</PremiumBadge>
                <PremiumBadge tone="accent">{filteredEvents.length} resultados</PremiumBadge>
                {isPending ? <PremiumBadge tone="muted">Atualizando busca</PremiumBadge> : null}
              </div>
            </div>
          </PublicReveal>
        </div>

        <div className="mt-8 grid gap-4 rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_16px_60px_rgba(48,35,18,0.05)]">
          <div>
            <div className="text-[11px] uppercase tracking-[0.28em] text-[#8e7f68]">Status</div>
            <div className="mt-3 flex flex-wrap gap-3">
              {STATUS_FILTERS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setStatus(item.value)}
                  className={[
                    'rounded-full px-4 py-2 text-sm transition-all',
                    status === item.value
                      ? 'bg-[#1f1a15] text-[#f8f3ea]'
                      : 'border border-[#ddd1bf] bg-[#fbf7f1] text-[#5f5549] hover:border-[#b79e74]',
                  ].join(' ')}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-[0.28em] text-[#8e7f68]">Categoria</div>
            <div className="mt-3 flex flex-wrap gap-3">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className={[
                    'rounded-full px-4 py-2 text-sm capitalize transition-all',
                    category === item
                      ? 'bg-[#efe2c7] text-[#6d5324]'
                      : 'border border-[#ddd1bf] bg-[#fbf7f1] text-[#5f5549] hover:border-[#b79e74]',
                  ].join(' ')}
                >
                  {item === 'all' ? 'Todas' : item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </PremiumSection>

      <PremiumSection className="pt-0">
        {publicEventsQuery.isPending ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-[34rem] animate-pulse rounded-[32px] bg-white/75" />
            ))}
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredEvents.map((event, index) => (
              <PremiumEventCard key={event.id} event={event} priority={index < 2} index={index} />
            ))}
          </div>
        ) : (
          <div className="rounded-[32px] border border-white/70 bg-white/80 p-10 text-center shadow-[0_16px_60px_rgba(48,35,18,0.05)]">
            <div className="font-serif text-4xl font-semibold leading-none text-[#1f1a15]">
              Nenhum evento encontrado.
            </div>
            <p className="mt-4 text-sm leading-7 text-[#5f5549]">
              Ajuste busca ou filtros para encontrar outra experiencia dentro do ambiente demo.
            </p>
          </div>
        )}
      </PremiumSection>
    </PublicLayout>
  )
}
