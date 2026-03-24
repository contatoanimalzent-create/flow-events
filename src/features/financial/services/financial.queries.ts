import { mutationOptions, queryOptions } from '@tanstack/react-query'
import type { UpsertFinancialCostEntryInput } from '@/features/financial/types'
import { financialService } from './financial.service'

interface DeleteFinancialCostEntryVariables {
  costEntryId: string
}

export const financialKeys = {
  all: ['financial'] as const,
  overview: (organizationId: string) => [...financialKeys.all, 'overview', organizationId] as const,
  costs: (organizationId: string, eventId?: string) => [...financialKeys.all, 'costs', organizationId, eventId ?? 'all'] as const,
  actions: () => [...financialKeys.all, 'actions'] as const,
}

export const financialQueries = {
  overview: (organizationId: string) =>
    queryOptions({
      queryKey: financialKeys.overview(organizationId),
      queryFn: () => financialService.getFinancialOverview(organizationId),
    }),
  costs: (organizationId: string, eventId?: string) =>
    queryOptions({
      queryKey: financialKeys.costs(organizationId, eventId),
      queryFn: () => financialService.listCostEntries(organizationId, eventId),
    }),
}

export const financialMutations = {
  saveCostEntry: () =>
    mutationOptions({
      mutationKey: [...financialKeys.actions(), 'save-cost-entry'] as const,
      mutationFn: (input: UpsertFinancialCostEntryInput) => financialService.saveCostEntry(input),
    }),
  deleteCostEntry: () =>
    mutationOptions({
      mutationKey: [...financialKeys.actions(), 'delete-cost-entry'] as const,
      mutationFn: ({ costEntryId }: DeleteFinancialCostEntryVariables) => financialService.deleteCostEntry(costEntryId),
    }),
}
