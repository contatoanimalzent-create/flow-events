import { mutationOptions, queryOptions } from '@tanstack/react-query'
import type { UpdateCustomerNotesInput, UpdateCustomerTagsInput } from '@/features/crm/types'
import { crmService } from './crm.service'

export const crmKeys = {
  all: ['crm'] as const,
  overview: (organizationId: string) => [...crmKeys.all, 'overview', organizationId] as const,
  customer: (organizationId: string, customerId: string) => [...crmKeys.all, 'customer', organizationId, customerId] as const,
  actions: () => [...crmKeys.all, 'actions'] as const,
}

export const crmQueries = {
  overview: (organizationId: string) =>
    queryOptions({
      queryKey: crmKeys.overview(organizationId),
      queryFn: () => crmService.getOverview(organizationId),
    }),
  customerDetail: (organizationId: string, customerId: string) =>
    queryOptions({
      queryKey: crmKeys.customer(organizationId, customerId),
      queryFn: () => crmService.getCustomerDetailBundle(organizationId, customerId),
    }),
}

export const crmMutations = {
  updateTags: () =>
    mutationOptions({
      mutationKey: [...crmKeys.actions(), 'update-tags'] as const,
      mutationFn: (input: UpdateCustomerTagsInput) => crmService.updateCustomerTags(input),
    }),
  updateNotes: () =>
    mutationOptions({
      mutationKey: [...crmKeys.actions(), 'update-notes'] as const,
      mutationFn: (input: UpdateCustomerNotesInput) => crmService.updateCustomerNotes(input),
    }),
}
