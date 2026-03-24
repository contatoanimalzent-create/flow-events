import { useMutation, useQueryClient } from '@tanstack/react-query'
import { campaignsKeys, campaignsMutations } from '@/features/campaigns/services'

interface UseCampaignsMutationsParams {
  organizationId?: string | null
}

export function useCampaignsMutations({ organizationId }: UseCampaignsMutationsParams) {
  const queryClient = useQueryClient()

  async function invalidateCampaigns() {
    if (!organizationId) {
      return
    }

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: campaignsKeys.overview(organizationId) }),
      queryClient.invalidateQueries({ queryKey: campaignsKeys.drafts(organizationId) }),
    ])
  }

  const createSegmentMutation = useMutation({
    ...campaignsMutations.createSegment(),
    onSuccess: invalidateCampaigns,
  })

  const updateSegmentMutation = useMutation({
    ...campaignsMutations.updateSegment(),
    onSuccess: invalidateCampaigns,
  })

  const deleteSegmentMutation = useMutation({
    ...campaignsMutations.deleteSegment(),
    onSuccess: invalidateCampaigns,
  })

  const createDraftMutation = useMutation({
    ...campaignsMutations.createCampaignDraft(),
    onSuccess: invalidateCampaigns,
  })

  const updateDraftMutation = useMutation({
    ...campaignsMutations.updateCampaignDraft(),
    onSuccess: invalidateCampaigns,
  })

  const deleteDraftMutation = useMutation({
    ...campaignsMutations.deleteCampaignDraft(),
    onSuccess: invalidateCampaigns,
  })

  const launchCampaignMutation = useMutation({
    ...campaignsMutations.launchCampaign(),
    onSuccess: invalidateCampaigns,
  })

  async function launchCampaign(params: Parameters<typeof launchCampaignMutation.mutateAsync>[0]) {
    if (!confirm('Lancar esta campanha agora?')) {
      return false
    }

    await launchCampaignMutation.mutateAsync(params)
    return true
  }

  return {
    createSegment: createSegmentMutation.mutateAsync,
    updateSegment: updateSegmentMutation.mutateAsync,
    deleteSegment: deleteSegmentMutation.mutateAsync,
    createDraft: createDraftMutation.mutateAsync,
    updateDraft: updateDraftMutation.mutateAsync,
    deleteDraft: deleteDraftMutation.mutateAsync,
    launchCampaign,
    savingSegment: createSegmentMutation.isPending || updateSegmentMutation.isPending,
    deletingSegment: deleteSegmentMutation.isPending,
    savingDraft: createDraftMutation.isPending || updateDraftMutation.isPending,
    deletingDraft: deleteDraftMutation.isPending,
    launchingCampaign: launchCampaignMutation.isPending,
    launchingDraftId: launchCampaignMutation.variables?.draftId ?? null,
  }
}
