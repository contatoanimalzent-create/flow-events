import { useQuery } from '@tanstack/react-query'
import { billingQueries } from '@/features/billing/services'

export function useSubscriptionPlans() {
  return useQuery(billingQueries.plans())
}
