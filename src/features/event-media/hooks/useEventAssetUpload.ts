import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth'
import { auditService } from '@/features/audit'
import { eventsKeys } from '@/features/events/services'
import { eventMediaKeys, eventMediaMutations } from '@/features/event-media/services'
import type { EventAssetUploadInput } from '@/features/event-media/types'

interface UseEventAssetUploadParams {
  eventId?: string
  organizationId?: string
}

export function useEventAssetUpload({ eventId, organizationId }: UseEventAssetUploadParams) {
  const queryClient = useQueryClient()
  const profile = useAuthStore((state) => state.profile)

  const uploadMutation = useMutation({
    ...eventMediaMutations.upload(),
    onSuccess: async () => {
      if (!eventId) {
        return
      }

      const invalidations = [
        queryClient.invalidateQueries({ queryKey: eventMediaKeys.list(eventId) }),
        queryClient.invalidateQueries({ queryKey: eventMediaKeys.list(eventId, { activeOnly: true }) }),
        queryClient.invalidateQueries({ queryKey: eventsKeys.detail(eventId) }),
      ]

      if (organizationId) {
        invalidations.push(queryClient.invalidateQueries({ queryKey: eventsKeys.list(organizationId) }))
      }

      await Promise.all(invalidations)
    },
  })

  async function uploadAsset(input: Omit<EventAssetUploadInput, 'organizationId' | 'eventId' | 'createdBy'>) {
    if (!organizationId || !eventId) {
      throw new Error('Evento ou organização não informados')
    }

    const asset = await uploadMutation.mutateAsync({
      ...input,
      organizationId,
      eventId,
      createdBy: profile?.id ?? null,
    })

    await auditService.record({
      organization_id: organizationId,
      event_id: eventId,
      user_id: profile?.id ?? null,
      user_name: `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || null,
      entity_type: 'event_media_asset',
      entity_id: asset.id,
      action_type: 'create',
      title: 'Novo asset publicado',
      description: `${asset.asset_type} adicionado a biblioteca de mídia do evento.`,
    })

    return asset
  }

  return {
    uploadAsset,
    uploading: uploadMutation.isPending,
  }
}
