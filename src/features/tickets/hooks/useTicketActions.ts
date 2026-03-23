import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ticketKeys, ticketMutations } from '@/features/tickets/services'
import type { TicketBatch, TicketTypeWithBatches } from '@/features/tickets/types'

interface UseTicketActionsParams {
  selectedEventId?: string
}

export function useTicketActions({ selectedEventId }: UseTicketActionsParams) {
  const queryClient = useQueryClient()

  async function invalidateTicketCatalog() {
    if (!selectedEventId) {
      return
    }

    await queryClient.invalidateQueries({ queryKey: ticketKeys.byEvent(selectedEventId) })
  }

  const toggleTicketStatusMutation = useMutation({
    ...ticketMutations.toggleStatus(),
    onSuccess: async () => {
      await invalidateTicketCatalog()
    },
  })

  const deleteTicketMutation = useMutation({
    ...ticketMutations.remove(),
    onSuccess: async (_, variables) => {
      await Promise.all([
        invalidateTicketCatalog(),
        queryClient.invalidateQueries({ queryKey: ticketKeys.detail(variables.ticketId) }),
      ])
    },
  })

  const duplicateTicketMutation = useMutation({
    ...ticketMutations.duplicate(),
    onSuccess: async () => {
      await invalidateTicketCatalog()
    },
  })

  const toggleBatchStatusMutation = useMutation({
    ...ticketMutations.toggleBatchStatus(),
    onSuccess: async (_, variables) => {
      await Promise.all([
        invalidateTicketCatalog(),
        queryClient.invalidateQueries({ queryKey: ticketKeys.batchDetail(variables.batchId) }),
      ])
    },
  })

  const deleteBatchMutation = useMutation({
    ...ticketMutations.removeBatch(),
    onSuccess: async (_, variables) => {
      await Promise.all([
        invalidateTicketCatalog(),
        queryClient.invalidateQueries({ queryKey: ticketKeys.batchDetail(variables.batchId) }),
      ])
    },
  })

  async function toggleTicketStatus(ticketId: string, currentStatus: boolean) {
    await toggleTicketStatusMutation.mutateAsync({ ticketId, currentStatus })
  }

  async function deleteTicket(ticketId: string) {
    if (!confirm('Excluir este tipo de ingresso e todos os seus lotes?')) {
      return false
    }

    await deleteTicketMutation.mutateAsync({ ticketId })
    return true
  }

  async function duplicateTicket(ticket: TicketTypeWithBatches) {
    await duplicateTicketMutation.mutateAsync({ ticket })
  }

  async function toggleBatchStatus(batchId: string, currentStatus: boolean) {
    await toggleBatchStatusMutation.mutateAsync({ batchId, currentStatus })
  }

  async function deleteBatch(batch: TicketBatch) {
    if (!confirm('Excluir este lote?')) {
      return false
    }

    await deleteBatchMutation.mutateAsync({ batchId: batch.id })
    return true
  }

  return {
    toggleTicketStatus,
    deleteTicket,
    duplicateTicket,
    toggleBatchStatus,
    deleteBatch,
  }
}
