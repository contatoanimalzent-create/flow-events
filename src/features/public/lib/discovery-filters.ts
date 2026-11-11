interface DiscoveryEvent {
  id: string
  name: string
  slug: string
  starts_at: string
  ends_at?: string | null
  subtitle?: string
  category?: string
  city?: string
  venue_name?: string
  is_private?: boolean | null
}
export function normalizeDiscovery(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}
export function isPastEvent(event: Pick<DiscoveryEvent, 'starts_at' | 'ends_at'>, now: number) {
  return new Date(event.ends_at || event.starts_at).getTime() < now
}
export function selectDiscoveryEvents<T extends DiscoveryEvent>(events: T[], filters: {
  search: string; category: string; period: 'upcoming' | 'past' | 'all'; city: string; savedOnly: boolean; saved: string[]
}, now: number): T[] {
  const needle = normalizeDiscovery(filters.search)
  return events.filter(e => !e.is_private)
    .filter(e => !filters.savedOnly || filters.saved.includes(e.id))
    .filter(e => filters.category === 'all' || e.category === filters.category)
    .filter(e => filters.city === 'all' || e.city === filters.city)
    .filter(e => filters.period === 'all' || isPastEvent(e, now) === (filters.period === 'past'))
    .filter(e => normalizeDiscovery([e.name,e.subtitle,e.city,e.venue_name,e.category].filter(Boolean).join(' ')).includes(needle))
    .sort((a,b) => {
      const aPast = isPastEvent(a, now), bPast = isPastEvent(b, now)
      if (aPast !== bPast) return aPast ? 1 : -1
      const delta = new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
      return aPast ? -delta : delta
    })
}
