import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { staffKeys, staffQueries } from '@/features/staff/services'
import type { StaffStatus } from '@/features/staff/types'

export function useStaffList(organizationId?: string) {
  const [selectedEventId, setSelectedEventId] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | StaffStatus>('all')
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const eventsQuery = useQuery({
    ...(organizationId ? staffQueries.events(organizationId) : { queryKey: staffKeys.events('empty'), queryFn: async () => [] }),
    enabled: Boolean(organizationId),
  })

  useEffect(() => {
    if (!selectedEventId && eventsQuery.data?.[0]) {
      setSelectedEventId(eventsQuery.data[0].id)
    }
  }, [eventsQuery.data, selectedEventId])

  const staffQuery = useQuery({
    ...(selectedEventId ? staffQueries.listByEvent(selectedEventId, statusFilter) : { queryKey: staffKeys.byEvent('empty'), queryFn: async () => [] }),
    enabled: Boolean(selectedEventId),
  })

  const summaryQuery = useQuery({
    ...(selectedEventId
      ? staffQueries.summary(selectedEventId)
      : {
          queryKey: staffKeys.summary('empty'),
          queryFn: async () => ({ total: 0, confirmed: 0, active: 0, allocatedToGates: 0, totalDailyCost: 0 }),
        }),
    enabled: Boolean(selectedEventId),
  })

  const filteredStaff = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    return (staffQuery.data ?? []).filter((member) => {
      if (!normalizedSearch) {
        return true
      }

      return (
        `${member.first_name} ${member.last_name ?? ''}`.toLowerCase().includes(normalizedSearch) ||
        (member.email ?? '').toLowerCase().includes(normalizedSearch) ||
        (member.role_title ?? '').toLowerCase().includes(normalizedSearch)
      )
    })
  }, [search, staffQuery.data])

  return {
    events: eventsQuery.data ?? [],
    selectedEventId,
    setSelectedEventId,
    staff: filteredStaff,
    rawStaff: staffQuery.data ?? [],
    loading: staffQuery.isPending || eventsQuery.isPending,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    expandedId,
    setExpandedId,
    stats: summaryQuery.data ?? { total: 0, confirmed: 0, active: 0, allocatedToGates: 0, totalDailyCost: 0 },
    refreshStaff: async () => {
      await Promise.all([staffQuery.refetch(), summaryQuery.refetch()])
    },
  }
}
