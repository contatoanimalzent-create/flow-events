import { mutationOptions, queryOptions } from '@tanstack/react-query'
import type { AcknowledgeIntelligenceAlertInput } from '@/features/intelligence/types'
import { intelligenceService } from './intelligence.service'

export const intelligenceKeys = {
  all: ['intelligence'] as const,
  overview: (organizationId: string) => [...intelligenceKeys.all, 'overview', organizationId] as const,
  alertStates: (organizationId: string) => [...intelligenceKeys.all, 'alert-states', organizationId] as const,
  actions: () => [...intelligenceKeys.all, 'actions'] as const,
}

export const intelligenceQueries = {
  overview: (organizationId: string) =>
    queryOptions({
      queryKey: intelligenceKeys.overview(organizationId),
      queryFn: () => intelligenceService.getOverview(organizationId),
    }),
  alertStates: (organizationId: string) =>
    queryOptions({
      queryKey: intelligenceKeys.alertStates(organizationId),
      queryFn: () => intelligenceService.listAlertStates(organizationId),
    }),
}

export const intelligenceMutations = {
  acknowledgeAlert: () =>
    mutationOptions({
      mutationKey: [...intelligenceKeys.actions(), 'acknowledge-alert'] as const,
      mutationFn: (input: AcknowledgeIntelligenceAlertInput) => intelligenceService.acknowledgeAlert(input),
    }),
}
