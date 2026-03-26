import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { growthService } from '@/features/growth/services/growth.service'
import type { CaptureLeadInput } from '@/features/growth/types/growth.types'

export const growthKeys = {
  all: ['growth'] as const,
  overview: (organizationId: string) => [...growthKeys.all, 'overview', organizationId] as const,
}

export function useGrowthOverview(organizationId?: string | null) {
  return useQuery({
    queryKey: growthKeys.overview(organizationId ?? 'anonymous'),
    queryFn: () => growthService.getGrowthOverview(organizationId ?? ''),
    enabled: Boolean(organizationId),
  })
}

export function useLeadCapture() {
  return useMutation({
    mutationFn: (input: CaptureLeadInput) => growthService.captureLead(input),
  })
}

export function useReferralLinkAction(organizationId?: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: growthService.getOrCreateReferralLink,
    onSuccess: async () => {
      if (organizationId) {
        await queryClient.invalidateQueries({ queryKey: growthKeys.overview(organizationId) })
      }
    },
  })
}
