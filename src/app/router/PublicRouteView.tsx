import { Suspense, lazy } from 'react'
import type { PublicRoute } from './public-routes'
import { AuthLoadingGate, useAuthStore } from '@/features/auth'
import { LoadingState } from '@/shared/components'
import { OperatorPage } from '@/features/checkin/pages/OperatorPage'

const AboutPage = lazy(() => import('@/pages/public/AboutPage').then((m) => ({ default: m.AboutPage })))
const StaffJoinPage = lazy(() => import('@/pages/public/StaffJoinPage').then((m) => ({ default: m.StaffJoinPage })))
const StaffTimeclockPage = lazy(() => import('@/pages/public/StaffTimeclockPage').then((m) => ({ default: m.StaffTimeclockPage })))
const ContactPage = lazy(() => import('@/pages/public/ContactPage').then((m) => ({ default: m.ContactPage })))
const ProducerPage = lazy(() => import('@/pages/public/ProducerPage').then((m) => ({ default: m.ProducerPage })))
const AccountPage = lazy(() => import('@/pages/public/AccountPage').then((m) => ({ default: m.AccountPage })))
const CreateEventPage = lazy(() => import('@/pages/public/CreateEventPage').then((m) => ({ default: m.CreateEventPage })))
const EventPage = lazy(() => import('@/pages/public/EventPage').then((m) => ({ default: m.EventPage })))
const EventsCatalogPage = lazy(() => import('@/pages/public/EventsCatalogPage').then((m) => ({ default: m.EventsCatalogPage })))
const HomePage = lazy(() => import('@/pages/public/HomePage').then((m) => ({ default: m.HomePage })))
const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })))
const SignupPage = lazy(() => import('@/pages/auth/SignupPage').then((m) => ({ default: m.SignupPage })))
const PrivacyPage = lazy(() => import('@/pages/public/PrivacyPage').then((m) => ({ default: m.PrivacyPage })))
const TermsPage = lazy(() => import('@/pages/public/TermsPage').then((m) => ({ default: m.TermsPage })))

function PublicFallback() {
  return <LoadingState title="Loading" description="" className="min-h-screen" />
}

interface PublicRouteViewProps {
  route: PublicRoute
  onLogin: () => void
  onSignup: () => void
  onBackToHome: () => void
}

export function PublicRouteView({ route, onLogin, onSignup, onBackToHome }: PublicRouteViewProps) {
  const user = useAuthStore((state) => state.user)

  return (
    <Suspense fallback={<PublicFallback />}>
      {typeof route === 'object' && route.type === 'staff-join' ? (
        <StaffJoinPage />
      ) : typeof route === 'object' && route.type === 'timeclock' ? (
        <StaffTimeclockPage />
      ) : typeof route === 'object' && route.type === 'event' ? (
        <EventPage slug={route.slug} />
      ) : route === 'terms' ? (
        <TermsPage />
      ) : route === 'privacy' ? (
        <PrivacyPage />
      ) : route === 'producer' ? (
        <ProducerPage onLogin={onLogin} />
      ) : route === 'contact' ? (
        <ContactPage onLogin={onLogin} />
      ) : route === 'about' ? (
        <AboutPage onLogin={onLogin} />
      ) : route === 'create-event' ? (
        <CreateEventPage onLogin={onLogin} />
      ) : route === 'account' ? (
        <AuthLoadingGate>
          {user ? <AccountPage /> : <LoginPage onBack={onBackToHome} onSignup={onSignup} />}
        </AuthLoadingGate>
      ) : route === 'events' ? (
        <EventsCatalogPage onLogin={onLogin} />
      ) : route === 'login' ? (
        <LoginPage onBack={onBackToHome} onSignup={onSignup} />
      ) : route === 'signup' ? (
        <SignupPage onBack={onBackToHome} onLogin={onLogin} />
      ) : route === 'operator' ? (
        <OperatorPage />
      ) : (
        <HomePage onLogin={onLogin} />
      )}
    </Suspense>
  )
}
