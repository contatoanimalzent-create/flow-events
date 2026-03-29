import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth'
import { billingKeys, billingMutations } from '@/features/billing/services'

export function useBillingActions() {
  const queryClient = useQueryClient()
  const organizationId = useAuthStore((state) => state.organization?.id)

  const updatePlanMutation = useMutation({
    ...billingMutations.updatePlan(),
    onSuccess: async (plan) => {
      useAuthStore.setState((state) => ({
        organization: state.organization
          ? {
              ...state.organization,
              plan: plan.slug,
              subscription_plan_id: plan.id,
            }
          : null,
      }))

      if (!organizationId) {
        return
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: billingKeys.overviewScope(organizationId) }),
        queryClient.invalidateQueries({ queryKey: billingKeys.gate(organizationId, 'all') }),
        queryClient.invalidateQueries({ queryKey: billingKeys.plans() }),
      ])
    },
  })

  return {
    updatePlan: updatePlanMutation.mutateAsync,
    updatingPlan: updatePlanMutation.isPending,
  }
}
