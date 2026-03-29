import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { growthService } from '@/features/growth/services/growth.service'
import { useAppLocale } from '@/shared/i18n/app-locale'
import type { CaptureLeadInput } from '@/features/growth/types/growth.types'

export const growthKeys = {
  all: ['growth'] as const,
  overview: (organizationId: string, locale: string) => [...growthKeys.all, 'overview', organizationId, locale] as const,
}

export function useGrowthOverview(organizationId?: string | null) {
  const { locale } = useAppLocale()

  return useQuery({
    queryKey: growthKeys.overview(organizationId ?? 'anonymous', locale),
    queryFn: () => growthService.getGrowthOverview(organizationId ?? '', locale),
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
  const { locale } = useAppLocale()

  return useMutation({
    mutationFn: growthService.getOrCreateReferralLink,
    onSuccess: async () => {
      if (organizationId) {
        await queryClient.invalidateQueries({ queryKey: growthKeys.overview(organizationId, locale) })
      }
    },
  })
}
