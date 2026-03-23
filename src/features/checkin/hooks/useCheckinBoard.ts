import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { checkinKeys, checkinQueries } from '@/features/checkin/services'
import type { CheckinStats } from '@/features/checkin/types'

const EMPTY_STATS: CheckinStats = {
  totalIn: 0,
  totalOut: 0,
  currentOccupancy: 0,
  successRate: 0,
  invalidAttempts: 0,
}

export function useCheckinBoard(organizationId?: string) {
  const [selectedEventId, setSelectedEventId] = useState('')
  const [selectedGateId, setSelectedGateId] = useState('all')
  const [search, setSearch] = useState('')
  const [scanMode, setScanMode] = useState(false)
  const [historyTicketId, setHistoryTicketId] = useState<string | null>(null)

  const eventsQuery = useQuery({
    ...(organizationId ? checkinQueries.events(organizationId) : { queryKey: ['checkin', 'events', 'empty'], queryFn: async () => [] }),
    enabled: Boolean(organizationId),
  })

  useEffect(() => {
    if (!selectedEventId && eventsQuery.data?.[0]) {
      setSelectedEventId(eventsQuery.data[0].id)
    }
  }, [eventsQuery.data, selectedEventId])

  useEffect(() => {
    setSelectedGateId('all')
  }, [selectedEventId])

  const gatesQuery = useQuery({
    ...(selectedEventId ? checkinQueries.gates(selectedEventId) : { queryKey: ['checkin', 'gates', 'empty'], queryFn: async () => [] }),
    enabled: Boolean(selectedEventId),
  })

  const recentCheckinsQuery = useQuery({
    ...(selectedEventId
      ? checkinQueries.recent(selectedEventId, selectedGateId === 'all' ? null : selectedGateId)
      : { queryKey: checkinKeys.recent('empty', null), queryFn: async () => [] }),
    enabled: Boolean(selectedEventId),
  })

  const statsQuery = useQuery({
    ...(selectedEventId ? checkinQueries.stats(selectedEventId) : { queryKey: checkinKeys.stats('empty'), queryFn: async () => EMPTY_STATS }),
    enabled: Boolean(selectedEventId),
  })

  const filteredCheckins = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return (recentCheckinsQuery.data ?? []).filter((checkin) => {
      if (!normalizedSearch) {
        return true
      }

      return (
        checkin.digital_ticket?.holder_name?.toLowerCase().includes(normalizedSearch) ||
        checkin.digital_ticket?.holder_email?.toLowerCase().includes(normalizedSearch) ||
        checkin.digital_ticket?.ticket_number?.toLowerCase().includes(normalizedSearch)
      )
    })
  }, [recentCheckinsQuery.data, search])

  const event = useMemo(
    () => (eventsQuery.data ?? []).find((item) => item.id === selectedEventId) ?? null,
    [eventsQuery.data, selectedEventId],
  )

  const occupancyPct = event?.total_capacity ? Math.round(((statsQuery.data?.currentOccupancy ?? 0) / event.total_capacity) * 100) : 0

  async function refreshBoard() {
    await Promise.all([recentCheckinsQuery.refetch(), statsQuery.refetch(), gatesQuery.refetch()])
  }

  return {
    events: eventsQuery.data ?? [],
    selectedEventId,
    setSelectedEventId,
    gates: gatesQuery.data ?? [],
    selectedGateId,
    setSelectedGateId,
    search,
    setSearch,
    scanMode,
    setScanMode,
    filteredCheckins,
    stats: statsQuery.data ?? EMPTY_STATS,
    loading: eventsQuery.isPending || recentCheckinsQuery.isPending,
    event,
    occupancyPct,
    refreshBoard,
    historyTicketId,
    openHistory: (ticketId: string) => setHistoryTicketId(ticketId),
    closeHistory: () => setHistoryTicketId(null),
  }
}
