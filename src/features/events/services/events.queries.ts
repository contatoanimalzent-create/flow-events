import { mutationOptions, queryOptions } from '@tanstack/react-query'
import type { EventFormData, EventRow, EventStatus } from '@/features/events/types'
import { eventsService } from './events.service'

interface CreateEventVariables {
  organizationId: string
  form: EventFormData
}

interface UpdateEventVariables {
  eventId: string
  form: EventFormData
}

interface DeleteEventVariables {
  eventId: string
}

interface DuplicateEventVariables {
  event: EventRow
  organizationId: string
}

interface PublishEventVariables {
  eventId: string
  currentStatus: EventStatus
}

interface UploadEventCoverVariables {
  organizationId: string
  file: File
}

export const eventsKeys = {
  all: ['events'] as const,
  lists: () => [...eventsKeys.all, 'list'] as const,
  list: (organizationId: string) => [...eventsKeys.lists(), organizationId] as const,
  details: () => [...eventsKeys.all, 'detail'] as const,
  detail: (eventId: string) => [...eventsKeys.details(), eventId] as const,
  actions: () => [...eventsKeys.all, 'actions'] as const,
}

export const eventsQueries = {
  list: (organizationId: string) =>
    queryOptions({
      queryKey: eventsKeys.list(organizationId),
      queryFn: () => eventsService.listEvents(organizationId),
    }),
  detail: (eventId: string) =>
    queryOptions({
      queryKey: eventsKeys.detail(eventId),
      queryFn: () => eventsService.getEventById(eventId),
    }),
}

export const eventsMutations = {
  create: () =>
    mutationOptions({
      mutationKey: [...eventsKeys.actions(), 'create'] as const,
      mutationFn: ({ organizationId, form }: CreateEventVariables) => eventsService.createEvent(organizationId, form),
    }),
  update: () =>
    mutationOptions({
      mutationKey: [...eventsKeys.actions(), 'update'] as const,
      mutationFn: ({ eventId, form }: UpdateEventVariables) => eventsService.updateEvent(eventId, form),
    }),
  remove: () =>
    mutationOptions({
      mutationKey: [...eventsKeys.actions(), 'delete'] as const,
      mutationFn: ({ eventId }: DeleteEventVariables) => eventsService.deleteEvent(eventId),
    }),
  duplicate: () =>
    mutationOptions({
      mutationKey: [...eventsKeys.actions(), 'duplicate'] as const,
      mutationFn: ({ event, organizationId }: DuplicateEventVariables) => eventsService.duplicateEvent(event, organizationId),
    }),
  publish: () =>
    mutationOptions({
      mutationKey: [...eventsKeys.actions(), 'publish'] as const,
      mutationFn: ({ eventId, currentStatus }: PublishEventVariables) => eventsService.togglePublishEvent(eventId, currentStatus),
    }),
  uploadCover: () =>
    mutationOptions({
      mutationKey: [...eventsKeys.actions(), 'upload-cover'] as const,
      mutationFn: ({ organizationId, file }: UploadEventCoverVariables) => eventsService.uploadEventCover(organizationId, file),
    }),
}
