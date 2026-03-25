import { useQuery } from '@tanstack/react-query'
import { eventMediaKeys, eventMediaQueries } from '@/features/event-media/services'
import type { EventAssetListOptions } from '@/features/event-media/types'

export function useEventAssets(eventId?: string, options?: EventAssetListOptions) {
  const query = useQuery({
    ...(eventId ? eventMediaQueries.list(eventId, options) : { queryKey: eventMediaKeys.list('empty', options), queryFn: async () => [] }),
    enabled: Boolean(eventId),
  })

  return {
    assets: query.data ?? [],
    loading: query.isPending,
    error: query.error instanceof Error ? query.error.message : '',
    refetch: query.refetch,
  }
}
