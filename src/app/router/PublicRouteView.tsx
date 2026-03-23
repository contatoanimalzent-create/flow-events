import type { PublicRoute } from './public-routes'
import { ContactPage } from '@/pages/public/ContactPage'
import { EventPage } from '@/pages/public/EventPage'
import { HomePage } from '@/pages/public/HomePage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { PrivacyPage } from '@/pages/public/PrivacyPage'
import { TermsPage } from '@/pages/public/TermsPage'

interface PublicRouteViewProps {
  route: PublicRoute
  onLogin: () => void
  onBackToHome: () => void
}

export function PublicRouteView({ route, onLogin, onBackToHome }: PublicRouteViewProps) {
  if (typeof route === 'object' && route.type === 'event') {
    return <EventPage slug={route.slug} />
  }

  if (route === 'terms') return <TermsPage />
  if (route === 'privacy') return <PrivacyPage />
  if (route === 'contact') return <ContactPage />
  if (route === 'login') return <LoginPage onBack={onBackToHome} />

  return <HomePage onLogin={onLogin} />
}
