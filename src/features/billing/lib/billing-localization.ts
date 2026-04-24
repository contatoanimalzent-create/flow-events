import type { AppLocale } from '@/shared/i18n/app-locale'
import type { BillingFeatureKey } from '@/features/billing/types'

function translate(locale: AppLocale, english: string, portuguese: string) {
  return locale === 'pt-BR' ? portuguese : english
}

export function translateBillingFeature(feature: BillingFeatureKey, locale: AppLocale) {
  switch (feature) {
    case 'standard_checkout':
      return translate(locale, 'Standard purchase flow', 'Fluxo padrão de compra')
    case 'premium_checkout':
      return translate(locale, 'Premium purchase flow', 'Fluxo premium de compra')
    case 'advanced_analytics':
      return translate(locale, 'Advanced analytics', 'Análises avancadas')
    case 'campaign_automation':
      return translate(locale, 'Campaign automation', 'Automação de campanhas')
    case 'priority_support':
      return translate(locale, 'Priority support', 'Suporte prioritario')
    case 'white_label':
      return translate(locale, 'White-label', 'Marca branca')
    case 'api_access':
      return translate(locale, 'API access', 'Acesso a API')
    case 'custom_domain':
      return translate(locale, 'Custom domain', 'Domínio personalizado')
    case 'enterprise_support':
      return translate(locale, 'Enterprise support', 'Suporte empresarial')
    case 'sso':
      return 'SSO'
    default:
      return String(feature).replace(/_/g, ' ')
  }
}

export function translateBillingPlanName(slug: string, fallback: string, locale: AppLocale) {
  switch (slug) {
    case 'starter':
      return translate(locale, 'Starter', 'Inicial')
    case 'pro':
      return 'Pro'
    case 'business':
      return translate(locale, 'Business', 'Negocios')
    case 'enterprise':
      return translate(locale, 'Enterprise', 'Empresarial')
    default:
      return fallback
  }
}

export function translateBillingPlanDescription(slug: string, fallback: string, locale: AppLocale) {
  switch (slug) {
    case 'starter':
      return translate(
        locale,
        'Entry layer with standard fees and core operating limits.',
        'Camada inicial com taxas padrão e limites essenciais de operação.',
      )
    case 'pro':
      return translate(
        locale,
        'Growing operation with premium purchase flow, automation and analytics.',
        'Operação em crescimento com compra premium, automação e análises.',
      )
    case 'business':
      return translate(
        locale,
        'Brand control, domains and integrations for larger operations.',
        'Controle de marca, domínios e integrações para operações maiores.',
      )
    case 'enterprise':
      return translate(
        locale,
        'Negotiated fees, custom limits and support for large-scale operations.',
        'Taxas negociadas, limites personalizados e suporte para operações em grande escala.',
      )
    default:
      return fallback
  }
}

export function translateBillingEventStatus(status: string, locale: AppLocale) {
  switch (status) {
    case 'draft':
      return translate(locale, 'Draft', 'Rascunho')
    case 'published':
      return translate(locale, 'Published', 'Publicado')
    case 'ongoing':
      return translate(locale, 'Ongoing', 'Em andamento')
    case 'completed':
      return translate(locale, 'Completed', 'Encerrado')
    case 'cancelled':
      return translate(locale, 'Cancelled', 'Cancelado')
    default:
      return status
  }
}
