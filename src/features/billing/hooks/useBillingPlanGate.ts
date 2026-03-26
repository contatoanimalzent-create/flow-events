import { useQuery } from '@tanstack/react-query'
import { billingKeys, billingService } from '@/features/billing/services'

export function useBillingPlanGate(organizationId?: string | null, eventId?: string) {
  return useQuery({
    queryKey: organizationId ? billingKeys.gate(organizationId, eventId ?? 'all') : (['billing', 'gate', 'missing-org', eventId ?? 'all'] as const),
    queryFn: () => billingService.getPlanGateSnapshot(organizationId!, eventId),
    enabled: Boolean(organizationId),
  })
}
