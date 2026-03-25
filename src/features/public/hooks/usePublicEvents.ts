import { useQuery } from '@tanstack/react-query'
import { publicEventsService } from '@/features/public/services/public-events.service'

export const publicEventsKeys = {
  all: ['public-events'] as const,
  list: () => [...publicEventsKeys.all, 'list'] as const,
  detail: (slug: string) => [...publicEventsKeys.all, 'detail', slug] as const,
}

export function usePublicEvents() {
  return useQuery({
    queryKey: publicEventsKeys.list(),
    queryFn: () => publicEventsService.listPublicEvents(),
  })
}

export function usePublicEvent(slug: string) {
  return useQuery({
    queryKey: publicEventsKeys.detail(slug),
    queryFn: () => publicEventsService.getPublicEventDetail(slug),
    enabled: Boolean(slug),
  })
}
