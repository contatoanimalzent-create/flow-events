import { useEffect, useState } from 'react'
import { eventsQueries } from '@/features/events/services'
import type { EventListFilter, EventRow, EventViewMode } from '@/features/events/types'
import { formatNumber } from '@/shared/lib'

export function useEventsList(organizationId?: string) {
  const [events, setEvents] = useState<EventRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<EventListFilter>('all')
  const [view, setView] = useState<EventViewMode>('grid')
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [menuId, setMenuId] = useState<string | null>(null)

  async function refreshEvents() {
    if (!organizationId) {
      setEvents([])
      setLoading(false)
      setError('')
      return
    }

    setLoading(true)
    setError('')

    try {
      const data = await eventsQueries.list(organizationId).queryFn()
      setEvents(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar eventos'
      setError(message)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refreshEvents()
  }, [organizationId])

  const filteredEvents = events.filter((event) => {
    const matchesStatus = filter === 'all' || event.status === filter
    const normalizedSearch = search.toLowerCase()
    const matchesSearch =
      event.name.toLowerCase().includes(normalizedSearch) ||
      (event.venue_address?.city ?? '').toLowerCase().includes(normalizedSearch)

    return matchesStatus && matchesSearch
  })

  const statsBar = [
    { label: 'Total', value: events.length },
    { label: 'Publicados', value: events.filter((event) => event.status === 'published').length },
    { label: 'Ao vivo', value: events.filter((event) => event.status === 'ongoing').length },
    { label: 'Ingressos', value: formatNumber(events.reduce((sum, event) => sum + event.sold_tickets, 0)) },
  ]

  function openCreateForm() {
    setEditingId(null)
    setShowForm(true)
  }

  function openEditForm(eventId: string) {
    setEditingId(eventId)
    setShowForm(true)
    setMenuId(null)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
  }

  function closeMenu() {
    setMenuId(null)
  }

  function toggleMenu(eventId: string) {
    setMenuId((current) => (current === eventId ? null : eventId))
  }

  return {
    events,
    filteredEvents,
    loading,
    error,
    search,
    setSearch,
    filter,
    setFilter,
    view,
    setView,
    showForm,
    editingId,
    menuId,
    statsBar,
    refreshEvents,
    openCreateForm,
    openEditForm,
    closeForm,
    closeMenu,
    toggleMenu,
  }
}
