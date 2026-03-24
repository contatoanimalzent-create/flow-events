import { useMutation, useQueryClient } from '@tanstack/react-query'
import { financialKeys, financialMutations } from '@/features/financial/services'

interface UseFinancialMutationsParams {
  organizationId?: string | null
  selectedEventId?: string
}

export function useFinancialMutations({ organizationId, selectedEventId = 'all' }: UseFinancialMutationsParams) {
  const queryClient = useQueryClient()

  async function invalidateFinancialQueries() {
    if (!organizationId) {
      return
    }

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: financialKeys.overview(organizationId) }),
      queryClient.invalidateQueries({
        queryKey: financialKeys.costs(organizationId, selectedEventId === 'all' ? undefined : selectedEventId),
      }),
      queryClient.invalidateQueries({ queryKey: financialKeys.costs(organizationId) }),
      queryClient.invalidateQueries({ queryKey: financialKeys.payouts(organizationId) }),
      queryClient.invalidateQueries({ queryKey: financialKeys.forecasts(organizationId) }),
      queryClient.invalidateQueries({ queryKey: financialKeys.closures(organizationId) }),
    ])
  }

  const saveCostEntryMutation = useMutation({
    ...financialMutations.saveCostEntry(),
    onSuccess: invalidateFinancialQueries,
  })

  const deleteCostEntryMutation = useMutation({
    ...financialMutations.deleteCostEntry(),
    onSuccess: invalidateFinancialQueries,
  })

  const savePayoutMutation = useMutation({
    ...financialMutations.savePayout(),
    onSuccess: invalidateFinancialQueries,
  })

  const saveForecastMutation = useMutation({
    ...financialMutations.saveForecast(),
    onSuccess: invalidateFinancialQueries,
  })

  const saveClosureMutation = useMutation({
    ...financialMutations.saveClosure(),
    onSuccess: invalidateFinancialQueries,
  })

  return {
    saveCostEntry: saveCostEntryMutation.mutateAsync,
    deleteCostEntry: deleteCostEntryMutation.mutateAsync,
    savePayout: savePayoutMutation.mutateAsync,
    saveForecast: saveForecastMutation.mutateAsync,
    saveClosure: saveClosureMutation.mutateAsync,
    savingCostEntry: saveCostEntryMutation.isPending,
    deletingCostEntry: deleteCostEntryMutation.isPending,
    savingPayout: savePayoutMutation.isPending,
    savingForecast: saveForecastMutation.isPending,
    savingClosure: saveClosureMutation.isPending,
  }
}
