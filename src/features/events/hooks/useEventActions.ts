import { useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsKeys, eventsMutations } from '@/features/events/services'
import type { EventRow, EventStatus } from '@/features/events/types'

interface UseEventActionsParams {
  organizationId?: string
}

export function useEventActions({ organizationId }: UseEventActionsParams) {
  const queryClient = useQueryClient()

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
  }

  async function deleteEvent(eventId: string) {
    if (!confirm('Tem certeza que deseja excluir este evento?')) {
      return false
    }

    await deleteMutation.mutateAsync({ eventId })
    return true
  }

  async function duplicateEvent(event: EventRow) {
    if (!organizationId) {
      return
    }

    await duplicateMutation.mutateAsync({ event, organizationId })
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
