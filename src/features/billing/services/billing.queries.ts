import { mutationOptions, queryOptions } from '@tanstack/react-query'
import { billingService } from './billing.service'

interface UpdateOrganizationPlanVariables {
  organizationId: string
  planId: string
}

export const billingKeys = {
  all: ['billing'] as const,
  overview: (organizationId: string) => [...billingKeys.all, 'overview', organizationId] as const,
  plans: () => [...billingKeys.all, 'plans'] as const,
  gate: (organizationId: string, eventId = 'all') => [...billingKeys.all, 'gate', organizationId, eventId] as const,
  actions: () => [...billingKeys.all, 'actions'] as const,
}

export const billingQueries = {
  overview: (organizationId: string) =>
    queryOptions({
      queryKey: billingKeys.overview(organizationId),
      queryFn: () => billingService.getOverview(organizationId),
    }),
  plans: () =>
    queryOptions({
      queryKey: billingKeys.plans(),
      queryFn: () => billingService.listSubscriptionPlans(),
    }),
  gate: (organizationId: string, eventId?: string) =>
    queryOptions({
      queryKey: billingKeys.gate(organizationId, eventId ?? 'all'),
      queryFn: () => billingService.getPlanGateSnapshot(organizationId, eventId),
    }),
}

export const billingMutations = {
  updatePlan: () =>
    mutationOptions({
      mutationKey: [...billingKeys.actions(), 'update-plan'] as const,
      mutationFn: ({ organizationId, planId }: UpdateOrganizationPlanVariables) =>
        billingService.updateOrganizationPlan(organizationId, planId),
    }),
}
