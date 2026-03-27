import { Suspense, lazy } from 'react'
import type { PublicRoute } from './public-routes'
import { AuthLoadingGate, useAuthStore } from '@/features/auth'
import { PublicLocaleProvider } from '@/features/public/lib/public-locale'
import { LoadingState } from '@/shared/components'

const AboutPage = lazy(() => import('@/pages/public/AboutPage').then((m) => ({ default: m.AboutPage })))
const CapitalStrikeLanding = lazy(() => import('@/pages/public/CapitalStrikeLanding').then((m) => ({ default: m.CapitalStrikeLanding })))
const ContactPage = lazy(() => import('@/pages/public/ContactPage').then((m) => ({ default: m.ContactPage })))
const AccountPage = lazy(() => import('@/pages/public/AccountPage').then((m) => ({ default: m.AccountPage })))
const CreateEventPage = lazy(() => import('@/pages/public/CreateEventPage').then((m) => ({ default: m.CreateEventPage })))
const EventPage = lazy(() => import('@/pages/public/EventPage').then((m) => ({ default: m.EventPage })))
const EventsCatalogPage = lazy(() => import('@/pages/public/EventsCatalogPage').then((m) => ({ default: m.EventsCatalogPage })))
const HomePage = lazy(() => import('@/pages/public/HomePage').then((m) => ({ default: m.HomePage })))
const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })))
const PrivacyPage = lazy(() => import('@/pages/public/PrivacyPage').then((m) => ({ default: m.PrivacyPage })))
const TermsPage = lazy(() => import('@/pages/public/TermsPage').then((m) => ({ default: m.TermsPage })))

function PublicFallback() {
  return <LoadingState title="Loading" description="" className="min-h-screen" />
}

interface PublicRouteViewProps {
  route: PublicRoute
  onLogin: () => void
  onBackToHome: () => void
}

export function PublicRouteView({ route, onLogin, onBackToHome }: PublicRouteViewProps) {
  const user = useAuthStore((state) => state.user)

  return (
    <PublicLocaleProvider>
      <Suspense fallback={<PublicFallback />}>
        {typeof route === 'object' && route.type === 'event' ? (
          <EventPage slug={route.slug} />
        ) : route === 'terms' ? (
          <TermsPage />
        ) : route === 'privacy' ? (
          <PrivacyPage />
        ) : route === 'contact' ? (
          <ContactPage onLogin={onLogin} />
        ) : route === 'about' ? (
          <AboutPage onLogin={onLogin} />
        ) : route === 'create-event' ? (
          <CreateEventPage onLogin={onLogin} />
        ) : route === 'capital-strike' ? (
          <CapitalStrikeLanding />
        ) : route === 'account' ? (
          <AuthLoadingGate>
            {user ? <AccountPage /> : <LoginPage onBack={onBackToHome} />}
          </AuthLoadingGate>
        ) : route === 'events' ? (
          <EventsCatalogPage onLogin={onLogin} />
        ) : route === 'login' ? (
          <LoginPage onBack={onBackToHome} />
        ) : (
          <HomePage onLogin={onLogin} />
        )}
      </Suspense>
    </PublicLocaleProvider>
  )
}
