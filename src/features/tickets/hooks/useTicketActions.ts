import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth'
import { auditService } from '@/features/audit'
import { ticketKeys, ticketMutations } from '@/features/tickets/services'
import type { TicketBatch, TicketTypeWithBatches } from '@/features/tickets/types'

interface UseTicketActionsParams {
  selectedEventId?: string
}

export function useTicketActions({ selectedEventId }: UseTicketActionsParams) {
  const queryClient = useQueryClient()
  const profile = useAuthStore((state) => state.profile)

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
    if (selectedEventId) {
      await auditService.record({
        organization_id: useAuthStore.getState().organization?.id ?? '',
        user_id: profile?.id ?? null,
        user_name: `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || null,
        event_id: selectedEventId,
        entity_type: 'ticket',
        entity_id: ticketId,
        action_type: 'status_change',
        title: 'Status do tipo de ingresso alterado',
        description: currentStatus ? 'Tipo desativado.' : 'Tipo ativado.',
      })
    }
  }

  async function deleteTicket(ticketId: string) {
    if (!confirm('Excluir este tipo de ingresso e todos os seus lotes?')) {
      return false
    }

    await deleteTicketMutation.mutateAsync({ ticketId })
    const organizationId = useAuthStore.getState().organization?.id
    if (organizationId) {
      await auditService.record({
        organization_id: organizationId,
        user_id: profile?.id ?? null,
        user_name: `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || null,
        event_id: selectedEventId ?? null,
        entity_type: 'ticket',
        entity_id: ticketId,
        action_type: 'delete',
        title: 'Tipo de ingresso removido',
      })
    }
    return true
  }

  async function duplicateTicket(ticket: TicketTypeWithBatches) {
    await duplicateTicketMutation.mutateAsync({ ticket })
    const organizationId = useAuthStore.getState().organization?.id
    if (organizationId) {
      await auditService.record({
        organization_id: organizationId,
        user_id: profile?.id ?? null,
        user_name: `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || null,
        event_id: selectedEventId ?? null,
        entity_type: 'ticket',
        entity_id: ticket.id,
        action_type: 'create',
        title: 'Tipo de ingresso duplicado',
        description: ticket.name,
      })
    }
  }

  async function toggleBatchStatus(batchId: string, currentStatus: boolean) {
    await toggleBatchStatusMutation.mutateAsync({ batchId, currentStatus })
    const organizationId = useAuthStore.getState().organization?.id
    if (organizationId) {
      await auditService.record({
        organization_id: organizationId,
        user_id: profile?.id ?? null,
        user_name: `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || null,
        event_id: selectedEventId ?? null,
        entity_type: 'ticket',
        entity_id: batchId,
        action_type: 'status_change',
        title: 'Status do lote alterado',
        description: currentStatus ? 'Lote desativado.' : 'Lote ativado.',
      })
    }
  }

  async function deleteBatch(batch: TicketBatch) {
    if (!confirm('Excluir este lote?')) {
      return false
    }

    await deleteBatchMutation.mutateAsync({ batchId: batch.id })
    const organizationId = useAuthStore.getState().organization?.id
    if (organizationId) {
      await auditService.record({
        organization_id: organizationId,
        user_id: profile?.id ?? null,
        user_name: `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || null,
        event_id: selectedEventId ?? null,
        entity_type: 'ticket',
        entity_id: batch.id,
        action_type: 'delete',
        title: 'Lote removido',
        description: batch.name,
      })
    }
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
