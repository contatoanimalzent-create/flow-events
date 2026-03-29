import { useQuery } from '@tanstack/react-query'
import { billingKeys, billingService } from '@/features/billing/services'
import { useAppLocale } from '@/shared/i18n/app-locale'

export function useBillingOverview(organizationId?: string | null) {
  const { locale } = useAppLocale()

  return useQuery({
    queryKey: organizationId ? billingKeys.overview(organizationId, locale) : (['billing', 'overview', 'missing-org', locale] as const),
    queryFn: () => billingService.getOverview(organizationId!, locale),
    enabled: Boolean(organizationId),
  })
}
