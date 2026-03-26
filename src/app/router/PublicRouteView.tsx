import type { PublicRoute } from './public-routes'
import { AuthLoadingGate, useAuthStore } from '@/features/auth'
import { AboutPage } from '@/pages/public/AboutPage'
import { ContactPage } from '@/pages/public/ContactPage'
import { AccountPage } from '@/pages/public/AccountPage'
import { CreateEventPage } from '@/pages/public/CreateEventPage'
import { EventPage } from '@/pages/public/EventPage'
import { EventsCatalogPage } from '@/pages/public/EventsCatalogPage'
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
  const user = useAuthStore((state) => state.user)

  if (typeof route === 'object' && route.type === 'event') {
    return <EventPage slug={route.slug} />
  }

  if (route === 'terms') return <TermsPage />
  if (route === 'privacy') return <PrivacyPage />
  if (route === 'contact') return <ContactPage />
  if (route === 'about') return <AboutPage onLogin={onLogin} />
  if (route === 'create-event') return <CreateEventPage onLogin={onLogin} />
  if (route === 'account') {
    return (
      <AuthLoadingGate>
        {user ? <AccountPage /> : <LoginPage onBack={onBackToHome} />}
      </AuthLoadingGate>
    )
  }
  if (route === 'events') return <EventsCatalogPage onLogin={onLogin} />
  if (route === 'login') return <LoginPage onBack={onBackToHome} />

  return <HomePage onLogin={onLogin} />
}
