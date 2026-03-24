import { mutationOptions, queryOptions } from '@tanstack/react-query'
import type { AudienceSegmentRules, LaunchCampaignInput, UpsertAudienceSegmentInput, UpsertCampaignDraftInput } from '@/features/campaigns/types'
import { campaignsService } from './campaigns.service'

export const campaignsKeys = {
  all: ['campaigns'] as const,
  overview: (organizationId: string) => [...campaignsKeys.all, 'overview', organizationId] as const,
  segment: (segmentId: string) => [...campaignsKeys.all, 'segment', segmentId] as const,
  preview: (organizationId: string, rulesHash: string) => [...campaignsKeys.all, 'preview', organizationId, rulesHash] as const,
  drafts: (organizationId: string) => [...campaignsKeys.all, 'drafts', organizationId] as const,
  actions: () => [...campaignsKeys.all, 'actions'] as const,
}

export const campaignsQueries = {
  overview: (organizationId: string) =>
    queryOptions({
      queryKey: campaignsKeys.overview(organizationId),
      queryFn: () => campaignsService.getOverview(organizationId),
    }),
  segment: (segmentId: string) =>
    queryOptions({
      queryKey: campaignsKeys.segment(segmentId),
      queryFn: () => campaignsService.getSegmentById(segmentId),
    }),
  preview: (organizationId: string, rules: AudienceSegmentRules) =>
    queryOptions({
      queryKey: campaignsKeys.preview(organizationId, JSON.stringify(rules)),
      queryFn: () => campaignsService.previewSegmentAudience(organizationId, rules),
    }),
}

export const campaignsMutations = {
  createSegment: () =>
    mutationOptions({
      mutationKey: [...campaignsKeys.actions(), 'create-segment'] as const,
      mutationFn: (input: UpsertAudienceSegmentInput) => campaignsService.createSegment(input),
    }),
  updateSegment: () =>
    mutationOptions({
      mutationKey: [...campaignsKeys.actions(), 'update-segment'] as const,
      mutationFn: (input: UpsertAudienceSegmentInput) => campaignsService.updateSegment(input),
    }),
  deleteSegment: () =>
    mutationOptions({
      mutationKey: [...campaignsKeys.actions(), 'delete-segment'] as const,
      mutationFn: (segmentId: string) => campaignsService.deleteSegment(segmentId),
    }),
  createCampaignDraft: () =>
    mutationOptions({
      mutationKey: [...campaignsKeys.actions(), 'create-draft'] as const,
      mutationFn: (input: UpsertCampaignDraftInput) => campaignsService.createCampaignDraft(input),
    }),
  updateCampaignDraft: () =>
    mutationOptions({
      mutationKey: [...campaignsKeys.actions(), 'update-draft'] as const,
      mutationFn: (input: UpsertCampaignDraftInput) => campaignsService.updateCampaignDraft(input),
    }),
  deleteCampaignDraft: () =>
    mutationOptions({
      mutationKey: [...campaignsKeys.actions(), 'delete-draft'] as const,
      mutationFn: (draftId: string) => campaignsService.deleteCampaignDraft(draftId),
    }),
  launchCampaign: () =>
    mutationOptions({
      mutationKey: [...campaignsKeys.actions(), 'launch-campaign'] as const,
      mutationFn: (input: LaunchCampaignInput) => campaignsService.launchCampaign(input),
    }),
}
