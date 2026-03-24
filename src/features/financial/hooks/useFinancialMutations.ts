import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth'
import { auditService } from '@/features/audit'
import { financialKeys, financialMutations } from '@/features/financial/services'

interface UseFinancialMutationsParams {
  organizationId?: string | null
  selectedEventId?: string
}

export function useFinancialMutations({ organizationId, selectedEventId = 'all' }: UseFinancialMutationsParams) {
  const queryClient = useQueryClient()
  const profile = useAuthStore((state) => state.profile)

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
    saveCostEntry: async (input: Parameters<typeof saveCostEntryMutation.mutateAsync>[0]) => {
      const result = await saveCostEntryMutation.mutateAsync(input)
      if (organizationId) {
        await auditService.record({
          organization_id: organizationId,
          user_id: profile?.id ?? null,
          user_name: `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || null,
          event_id: input.eventId ?? null,
          entity_type: 'financial',
          entity_id: input.costEntryId ?? null,
          action_type: input.costEntryId ? 'update' : 'create',
          title: input.costEntryId ? 'Lancamento financeiro atualizado' : 'Lancamento financeiro criado',
          description: input.values.description,
        })
      }
      return result
    },
    deleteCostEntry: async (input: Parameters<typeof deleteCostEntryMutation.mutateAsync>[0]) => {
      const result = await deleteCostEntryMutation.mutateAsync(input)
      if (organizationId) {
        await auditService.record({
          organization_id: organizationId,
          user_id: profile?.id ?? null,
          user_name: `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || null,
          event_id: selectedEventId === 'all' ? null : selectedEventId,
          entity_type: 'financial',
          entity_id: input.costEntryId,
          action_type: 'delete',
          title: 'Lancamento financeiro removido',
        })
      }
      return result
    },
    savePayout: async (input: Parameters<typeof savePayoutMutation.mutateAsync>[0]) => {
      const result = await savePayoutMutation.mutateAsync(input)
      if (organizationId) {
        await auditService.record({
          organization_id: organizationId,
          user_id: profile?.id ?? null,
          user_name: `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || null,
          event_id: input.values.event_id,
          entity_type: 'financial',
          entity_id: input.payoutId ?? null,
          action_type: input.payoutId ? 'update' : 'create',
          title: 'Repasse salvo',
        })
      }
      return result
    },
    saveForecast: async (input: Parameters<typeof saveForecastMutation.mutateAsync>[0]) => {
      const result = await saveForecastMutation.mutateAsync(input)
      if (organizationId) {
        await auditService.record({
          organization_id: organizationId,
          user_id: profile?.id ?? null,
          user_name: `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || null,
          event_id: input.values.event_id,
          entity_type: 'financial',
          entity_id: input.forecastId ?? null,
          action_type: input.forecastId ? 'update' : 'create',
          title: 'Forecast salvo',
        })
      }
      return result
    },
    saveClosure: async (input: Parameters<typeof saveClosureMutation.mutateAsync>[0]) => {
      const result = await saveClosureMutation.mutateAsync(input)
      if (organizationId) {
        await auditService.record({
          organization_id: organizationId,
          user_id: profile?.id ?? null,
          user_name: `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || null,
          event_id: input.values.event_id,
          entity_type: 'financial',
          entity_id: input.closureId ?? null,
          action_type: input.closureId ? 'update' : 'create',
          title: 'Fechamento salvo',
        })
      }
      return result
    },
    savingCostEntry: saveCostEntryMutation.isPending,
    deletingCostEntry: deleteCostEntryMutation.isPending,
    savingPayout: savePayoutMutation.isPending,
    savingForecast: saveForecastMutation.isPending,
    savingClosure: saveClosureMutation.isPending,
  }
}
