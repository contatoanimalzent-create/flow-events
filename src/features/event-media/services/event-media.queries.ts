import { mutationOptions, queryOptions } from '@tanstack/react-query'
import type {
  EventAssetListOptions,
  EventAssetReorderInput,
  EventAssetUpdateInput,
  EventAssetUploadInput,
} from '@/features/event-media/types'
import { eventMediaService } from './event-media.service'

export const eventMediaKeys = {
  all: ['event-media'] as const,
  lists: () => [...eventMediaKeys.all, 'list'] as const,
  list: (eventId: string, options?: EventAssetListOptions) => [...eventMediaKeys.lists(), eventId, options?.activeOnly ? 'active' : 'all'] as const,
  actions: () => [...eventMediaKeys.all, 'actions'] as const,
}

export const eventMediaQueries = {
  list: (eventId: string, options?: EventAssetListOptions) =>
    queryOptions({
      queryKey: eventMediaKeys.list(eventId, options),
      queryFn: () => eventMediaService.listEventAssets(eventId, options),
    }),
}

export const eventMediaMutations = {
  upload: () =>
    mutationOptions({
      mutationKey: [...eventMediaKeys.actions(), 'upload'] as const,
      mutationFn: (input: EventAssetUploadInput) => eventMediaService.uploadEventAsset(input),
    }),
  update: () =>
    mutationOptions({
      mutationKey: [...eventMediaKeys.actions(), 'update'] as const,
      mutationFn: (input: EventAssetUpdateInput) => eventMediaService.updateEventAsset(input),
    }),
  remove: () =>
    mutationOptions({
      mutationKey: [...eventMediaKeys.actions(), 'delete'] as const,
      mutationFn: (assetId: string) => eventMediaService.deleteEventAsset(assetId),
    }),
  reorder: () =>
    mutationOptions({
      mutationKey: [...eventMediaKeys.actions(), 'reorder'] as const,
      mutationFn: (input: EventAssetReorderInput) => eventMediaService.reorderEventAssets(input),
    }),
  setCover: () =>
    mutationOptions({
      mutationKey: [...eventMediaKeys.actions(), 'set-cover'] as const,
      mutationFn: ({ eventId, assetId }: { eventId: string; assetId: string }) => eventMediaService.setEventCoverAsset(eventId, assetId),
    }),
  setHero: () =>
    mutationOptions({
      mutationKey: [...eventMediaKeys.actions(), 'set-hero'] as const,
      mutationFn: ({ eventId, assetId }: { eventId: string; assetId: string }) => eventMediaService.setEventHeroAsset(eventId, assetId),
    }),
}
