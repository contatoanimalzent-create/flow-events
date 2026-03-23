import { eventsService } from '@/features/events/services'
import type { EventRow, EventStatus } from '@/features/events/types'

interface UseEventActionsParams {
  organizationId?: string
  onChanged: () => Promise<void> | void
}

export function useEventActions({ organizationId, onChanged }: UseEventActionsParams) {
  async function publishEvent(eventId: string, currentStatus: EventStatus) {
    await eventsService.togglePublishEvent(eventId, currentStatus)
    await onChanged()
  }

  async function deleteEvent(eventId: string) {
    if (!confirm('Tem certeza que deseja excluir este evento?')) {
      return false
    }

    await eventsService.deleteEvent(eventId)
    await onChanged()
    return true
  }

  async function duplicateEvent(event: EventRow) {
    if (!organizationId) return

    await eventsService.duplicateEvent(event, organizationId)
    await onChanged()
  }

  return {
    publishEvent,
    deleteEvent,
    duplicateEvent,
  }
}
