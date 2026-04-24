import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth'
import { auditService } from '@/features/audit'
import { eventsKeys } from '@/features/events/services'
import { eventMediaKeys, eventMediaMutations } from '@/features/event-media/services'
import type { EventMediaAsset, EventMediaUsageType } from '@/features/event-media/types'

interface UseEventAssetActionsParams {
  eventId?: string
  organizationId?: string
}

export function useEventAssetActions({ eventId, organizationId }: UseEventAssetActionsParams) {
  const queryClient = useQueryClient()
  const profile = useAuthStore((state) => state.profile)

  async function invalidate() {
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
  }

  const updateMutation = useMutation({
    ...eventMediaMutations.update(),
    onSuccess: async () => {
      await invalidate()
    },
  })

  const deleteMutation = useMutation({
    ...eventMediaMutations.remove(),
    onSuccess: async () => {
      await invalidate()
    },
  })

  const reorderMutation = useMutation({
    ...eventMediaMutations.reorder(),
    onSuccess: async () => {
      await invalidate()
    },
  })

  const setCoverMutation = useMutation({
    ...eventMediaMutations.setCover(),
    onSuccess: async () => {
      await invalidate()
    },
  })

  const setHeroMutation = useMutation({
    ...eventMediaMutations.setHero(),
    onSuccess: async () => {
      await invalidate()
    },
  })

  async function recordAudit(actionType: 'update' | 'delete', title: string, description: string) {
    if (!organizationId || !eventId) {
      return
    }

    await auditService.record({
      organization_id: organizationId,
      event_id: eventId,
      user_id: profile?.id ?? null,
      user_name: `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || null,
      entity_type: 'event_media_asset',
      entity_id: eventId,
      action_type: actionType,
      title,
      description,
    })
  }

  async function updateAsset(asset: EventMediaAsset, updates: { usageType?: EventMediaUsageType; altText?: string | null; caption?: string | null; isActive?: boolean; thumbnailUrl?: string | null }) {
    await updateMutation.mutateAsync({
      assetId: asset.id,
      usageType: updates.usageType,
      altText: updates.altText,
      caption: updates.caption,
      isActive: updates.isActive,
      thumbnailUrl: updates.thumbnailUrl,
    })

    await recordAudit('update', 'Asset de evento atualizado', `${asset.asset_type} ajustado na biblioteca de mídia.`)
  }

  async function deleteAsset(asset: EventMediaAsset) {
    await deleteMutation.mutateAsync(asset.id)
    await recordAudit('delete', 'Asset de evento removido', `${asset.asset_type} removido da biblioteca de mídia.`)
  }

  async function reorderAssets(orderedIds: string[]) {
    if (!eventId) {
      return
    }

    await reorderMutation.mutateAsync({ eventId, orderedIds })
    await recordAudit('update', 'Ordem dos assets atualizada', `Biblioteca de mídia reorganizada com ${orderedIds.length} itens.`)
  }

  async function setCoverAsset(asset: EventMediaAsset) {
    if (!eventId) {
      return
    }

    await setCoverMutation.mutateAsync({ eventId, assetId: asset.id })
    await recordAudit('update', 'Capa do evento atualizada', `Asset ${asset.id} definido como capa do evento.`)
  }

  async function setHeroAsset(asset: EventMediaAsset) {
    if (!eventId) {
      return
    }

    await setHeroMutation.mutateAsync({ eventId, assetId: asset.id })
    await recordAudit('update', 'Hero do evento atualizado', `Asset ${asset.id} definido como hero principal.`)
  }

  return {
    updateAsset,
    deleteAsset,
    reorderAssets,
    setCoverAsset,
    setHeroAsset,
    saving:
      updateMutation.isPending ||
      deleteMutation.isPending ||
      reorderMutation.isPending ||
      setCoverMutation.isPending ||
      setHeroMutation.isPending,
  }
}
