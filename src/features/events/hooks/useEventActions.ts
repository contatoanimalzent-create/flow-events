import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth'
import { auditService } from '@/features/audit'
import { eventsKeys, eventsMutations } from '@/features/events/services'
import type { EventRow, EventStatus } from '@/features/events/types'

interface UseEventActionsParams {
  organizationId?: string
}

export function useEventActions({ organizationId }: UseEventActionsParams) {
  const queryClient = useQueryClient()
  const profile = useAuthStore((state) => state.profile)

  async function invalidateEventQueries(eventId?: string) {
    if (!organizationId) {
      return
    }

    const invalidations = [queryClient.invalidateQueries({ queryKey: eventsKeys.list(organizationId) })]

    if (eventId) {
      invalidations.push(queryClient.invalidateQueries({ queryKey: eventsKeys.detail(eventId) }))
    }

    await Promise.all(invalidations)
  }

  const publishMutation = useMutation({
    ...eventsMutations.publish(),
    onSuccess: async (_, variables) => {
      await invalidateEventQueries(variables.eventId)
    },
  })

  const deleteMutation = useMutation({
    ...eventsMutations.remove(),
    onSuccess: async (_, variables) => {
      await invalidateEventQueries(variables.eventId)
    },
  })

  const duplicateMutation = useMutation({
    ...eventsMutations.duplicate(),
    onSuccess: async () => {
      await invalidateEventQueries()
    },
  })

  async function publishEvent(eventId: string, currentStatus: EventStatus) {
    await publishMutation.mutateAsync({ eventId, currentStatus })
    if (organizationId) {
      await auditService.record({
        organization_id: organizationId,
        user_id: profile?.id ?? null,
        user_name: `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || null,
        entity_type: 'event',
        entity_id: eventId,
        action_type: 'status_change',
        title: 'Status do evento atualizado',
        description: `Evento ${currentStatus === 'published' ? 'despublicado' : 'publicado'} no backoffice.`,
      })
    }
  }

  async function deleteEvent(eventId: string) {
    await deleteMutation.mutateAsync({ eventId })
    if (organizationId) {
      await auditService.record({
        organization_id: organizationId,
        user_id: profile?.id ?? null,
        user_name: `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || null,
        entity_type: 'event',
        entity_id: eventId,
        action_type: 'delete',
        title: 'Evento removido',
        description: 'Registro excluido a partir da lista de eventos.',
      })
    }
    return true
  }

  async function duplicateEvent(event: EventRow) {
    if (!organizationId) {
      return
    }

    await duplicateMutation.mutateAsync({ event, organizationId })
    await auditService.record({
      organization_id: organizationId,
      user_id: profile?.id ?? null,
      user_name: `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || null,
      entity_type: 'event',
      entity_id: event.id,
      action_type: 'create',
      title: 'Evento duplicado',
      description: `Duplicacao iniciada a partir do evento ${event.name}.`,
      event_id: event.id,
    })
  }

  return {
    publishEvent,
    deleteEvent,
    duplicateEvent,
    publishing: publishMutation.isPending,
    deleting: deleteMutation.isPending,
    duplicating: duplicateMutation.isPending,
  }
}
