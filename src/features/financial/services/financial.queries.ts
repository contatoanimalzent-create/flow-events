import { mutationOptions, queryOptions } from '@tanstack/react-query'
import type {
  UpsertEventFinancialClosureInput,
  UpsertEventPayoutInput,
  UpsertFinancialCostEntryInput,
  UpsertFinancialForecastInput,
} from '@/features/financial/types'
import { financialService } from './financial.service'

interface DeleteFinancialCostEntryVariables {
  costEntryId: string
}

export const financialKeys = {
  all: ['financial'] as const,
  overview: (organizationId: string) => [...financialKeys.all, 'overview', organizationId] as const,
  costs: (organizationId: string, eventId?: string) => [...financialKeys.all, 'costs', organizationId, eventId ?? 'all'] as const,
  payouts: (organizationId: string) => [...financialKeys.all, 'payouts', organizationId] as const,
  forecasts: (organizationId: string) => [...financialKeys.all, 'forecasts', organizationId] as const,
  closures: (organizationId: string) => [...financialKeys.all, 'closures', organizationId] as const,
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
  payouts: (organizationId: string) =>
    queryOptions({
      queryKey: financialKeys.payouts(organizationId),
      queryFn: () => financialService.listEventPayouts(organizationId),
    }),
  forecasts: (organizationId: string) =>
    queryOptions({
      queryKey: financialKeys.forecasts(organizationId),
      queryFn: () => financialService.listFinancialForecasts(organizationId),
    }),
  closures: (organizationId: string) =>
    queryOptions({
      queryKey: financialKeys.closures(organizationId),
      queryFn: () => financialService.listEventFinancialClosures(organizationId),
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
  savePayout: () =>
    mutationOptions({
      mutationKey: [...financialKeys.actions(), 'save-payout'] as const,
      mutationFn: (input: UpsertEventPayoutInput) => financialService.saveEventPayout(input),
    }),
  saveForecast: () =>
    mutationOptions({
      mutationKey: [...financialKeys.actions(), 'save-forecast'] as const,
      mutationFn: (input: UpsertFinancialForecastInput) => financialService.saveFinancialForecast(input),
    }),
  saveClosure: () =>
    mutationOptions({
      mutationKey: [...financialKeys.actions(), 'save-closure'] as const,
      mutationFn: (input: UpsertEventFinancialClosureInput) => financialService.saveEventFinancialClosure(input),
    }),
}
