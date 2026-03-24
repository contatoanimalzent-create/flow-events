import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ticketKeys, ticketQueries } from '@/features/tickets/services'
import type { TicketBatch, TicketTypeWithBatches } from '@/features/tickets/types'
import { formatCurrency, formatNumber } from '@/shared/lib'
import { paginateItems } from '@/shared/api'

export function useTicketsList(organizationId?: string) {
  const [selectedEventId, setSelectedEventId] = useState('')
  const [expandedType, setExpandedType] = useState<string | null>(null)
  const [showTypeForm, setShowTypeForm] = useState(false)
  const [showBatchForm, setShowBatchForm] = useState(false)
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null)
  const [editingBatchId, setEditingBatchId] = useState<string | null>(null)
  const [batchParentId, setBatchParentId] = useState('')
  const [page, setPage] = useState(1)

  const saleEventsQuery = useQuery({
    ...(organizationId ? ticketQueries.saleEvents(organizationId) : { queryKey: ticketKeys.events('anonymous'), queryFn: async () => [] }),
    enabled: Boolean(organizationId),
  })

  const ticketsQuery = useQuery({
    ...(selectedEventId ? ticketQueries.listByEvent(selectedEventId) : { queryKey: ticketKeys.byEvent('empty'), queryFn: async () => [] }),
    enabled: Boolean(selectedEventId),
  })

  useEffect(() => {
    const firstEventId = saleEventsQuery.data?.[0]?.id

    if (!firstEventId) {
      setSelectedEventId('')
      return
    }

    setSelectedEventId((current) => current || firstEventId)
  }, [saleEventsQuery.data])

  useEffect(() => {
    setPage(1)
  }, [selectedEventId])

  const events = saleEventsQuery.data ?? []
  const ticketTypes = ticketsQuery.data ?? []
  const loading = saleEventsQuery.isPending || (Boolean(selectedEventId) && ticketsQuery.isPending)
  const error =
    (saleEventsQuery.error instanceof Error ? saleEventsQuery.error.message : '') ||
    (ticketsQuery.error instanceof Error ? ticketsQuery.error.message : '')

  const stats = useMemo(() => {
    const totalTickets = ticketTypes.reduce((sum, ticketType) => sum + ticketType.batches.reduce((batchSum, batch) => batchSum + batch.quantity, 0), 0)
    const totalSold = ticketTypes.reduce((sum, ticketType) => sum + ticketType.batches.reduce((batchSum, batch) => batchSum + batch.sold_count, 0), 0)
    const totalRevenue = ticketTypes.reduce(
      (sum, ticketType) => sum + ticketType.batches.reduce((batchSum, batch) => batchSum + batch.price * batch.sold_count, 0),
      0,
    )
    const activeBatches = ticketTypes.reduce((sum, ticketType) => sum + ticketType.batches.filter((batch) => batch.is_active).length, 0)

    return [
      { label: 'Capacidade total', value: formatNumber(totalTickets) },
      { label: 'Vendidos', value: formatNumber(totalSold) },
      { label: 'Receita bruta', value: formatCurrency(totalRevenue) },
      { label: 'Lotes ativos', value: activeBatches.toString() },
    ]
  }, [ticketTypes])

  const paginatedTicketTypes = useMemo(() => paginateItems(ticketTypes, { page, pageSize: 6 }), [ticketTypes, page])

  const selectedEvent = events.find((event) => event.id === selectedEventId)

  function openCreateTypeModal() {
    setEditingTypeId(null)
    setShowTypeForm(true)
  }

  function openEditTypeModal(ticketType: TicketTypeWithBatches) {
    setEditingTypeId(ticketType.id)
    setShowTypeForm(true)
  }

  function closeTypeModal() {
    setShowTypeForm(false)
    setEditingTypeId(null)
  }

  function openCreateBatchModal(ticketTypeId: string) {
    setBatchParentId(ticketTypeId)
    setEditingBatchId(null)
    setShowBatchForm(true)
  }

  function openEditBatchModal(ticketTypeId: string, batch: TicketBatch) {
    setBatchParentId(ticketTypeId)
    setEditingBatchId(batch.id)
    setShowBatchForm(true)
  }

  function closeBatchModal() {
    setShowBatchForm(false)
    setEditingBatchId(null)
  }

  async function refreshTickets() {
    await Promise.all([saleEventsQuery.refetch(), ticketsQuery.refetch()])
  }

  return {
    events,
    selectedEvent,
    selectedEventId,
    setSelectedEventId,
    ticketTypes: paginatedTicketTypes.items,
    allTicketTypes: ticketTypes,
    loading,
    error,
    stats,
    expandedType,
    setExpandedType,
    showTypeForm,
    showBatchForm,
    editingTypeId,
    editingBatchId,
    batchParentId,
    page,
    setPage,
    pagination: paginatedTicketTypes.pagination,
    refreshTickets,
    openCreateTypeModal,
    openEditTypeModal,
    closeTypeModal,
    openCreateBatchModal,
    openEditBatchModal,
    closeBatchModal,
  }
}
