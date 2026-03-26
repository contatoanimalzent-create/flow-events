import { queryOptions } from '@tanstack/react-query'
import { accountService } from './account.service'

interface AccountOverviewQueryInput {
  email: string
  name?: string | null
  phone?: string | null
  avatarUrl?: string | null
}

export const accountKeys = {
  all: ['account'] as const,
  overview: (email: string) => [...accountKeys.all, 'overview', email] as const,
}

export const accountQueries = {
  overview: (input: AccountOverviewQueryInput) =>
    queryOptions({
      queryKey: accountKeys.overview(input.email),
      queryFn: () => accountService.getOverview(input),
    }),
}
