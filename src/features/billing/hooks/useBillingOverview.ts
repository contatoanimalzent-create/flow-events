import { useQuery } from '@tanstack/react-query'
import { billingKeys, billingService } from '@/features/billing/services'

export function useBillingOverview(organizationId?: string | null) {
  return useQuery({
    queryKey: organizationId ? billingKeys.overview(organizationId) : (['billing', 'overview', 'missing-org'] as const),
    queryFn: () => billingService.getOverview(organizationId!),
    enabled: Boolean(organizationId),
  })
}
