import { eventsService } from './events.service'

export const eventsKeys = {
  all: ['events'] as const,
  lists: () => [...eventsKeys.all, 'list'] as const,
  list: (organizationId: string) => [...eventsKeys.lists(), organizationId] as const,
  details: () => [...eventsKeys.all, 'detail'] as const,
  detail: (eventId: string) => [...eventsKeys.details(), eventId] as const,
  actions: () => [...eventsKeys.all, 'actions'] as const,
}

export const eventsQueries = {
  list: (organizationId: string) => ({
    queryKey: eventsKeys.list(organizationId),
    queryFn: () => eventsService.listEvents(organizationId),
  }),
  detail: (eventId: string) => ({
    queryKey: eventsKeys.detail(eventId),
    queryFn: () => eventsService.getEventById(eventId),
  }),
}

export const eventsMutations = {
  create: () => ({
    mutationKey: [...eventsKeys.actions(), 'create'] as const,
  }),
  update: (eventId: string) => ({
    mutationKey: [...eventsKeys.actions(), 'update', eventId] as const,
  }),
  remove: (eventId: string) => ({
    mutationKey: [...eventsKeys.actions(), 'delete', eventId] as const,
  }),
  duplicate: (eventId: string) => ({
    mutationKey: [...eventsKeys.actions(), 'duplicate', eventId] as const,
  }),
  publish: (eventId: string) => ({
    mutationKey: [...eventsKeys.actions(), 'publish', eventId] as const,
  }),
}
