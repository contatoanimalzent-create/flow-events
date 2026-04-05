import { useQuery } from '@tanstack/react-query'
import { eventsService, type EventsListFilters } from '@/features/public/services/events.service'

export const eventsQueryKeys = {
  all: ['public-events'] as const,
  list: (filters?: EventsListFilters) =>
    [
      ...eventsQueryKeys.all,
      'list',
      filters?.date ?? null,
      filters?.location ?? null,
    ] as const,
}

export function useEventsQuery(filters: EventsListFilters = {}) {
  const query = useQuery({
    queryKey: eventsQueryKeys.list(filters),
    queryFn: () => eventsService.list(filters),
  })

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error : query.error ? new Error('Unable to load public events') : null,
  }
}
