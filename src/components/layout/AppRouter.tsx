import { useState } from 'react'
import { useAuthStore } from '@/lib/store/auth'
import { LoginPage } from '@/pages/auth/LoginPage'
import { ChangePasswordPage } from '@/pages/auth/ChangePasswordPage'
import { AppShell } from '@/components/layout/AppShell'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { HomePage } from '@/pages/public/HomePage'
import { EventPage } from '@/pages/public/EventPage'
import { TermsPage } from '@/pages/public/TermsPage'
import { PrivacyPage } from '@/pages/public/PrivacyPage'
import { ContactPage } from '@/pages/public/ContactPage'

type PublicRoute = 'home' | 'login' | 'terms' | 'privacy' | 'contact' | { type: 'event'; slug: string }

function getInitialRoute(): PublicRoute {
  const path = window.location.pathname
  if (path === '/terms') return 'terms'
  if (path === '/privacy') return 'privacy'
  if (path === '/contact') return 'contact'
  const match = path.match(/^\/e\/([^/]+)/)
  if (match) return { type: 'event', slug: match[1] }
  return 'home'
}

export function AppRouter() {
  const { user, profile, initialized } = useAuthStore()
  const [publicRoute, setPublicRoute] = useState<PublicRoute>(getInitialRoute)

  // Public event pages load immediately — no auth needed
  if (typeof publicRoute === 'object' && publicRoute.type === 'event') {
    return <EventPage slug={publicRoute.slug} />
  }

  // Public static pages
  if (publicRoute === 'terms') return <TermsPage />
  if (publicRoute === 'privacy') return <PrivacyPage />
  if (publicRoute === 'contact') return <ContactPage />

  if (!initialized) return <LoadingScreen />

  if (user) {
    if (profile?.must_change_password) return <ChangePasswordPage />
    return <AppShell />
  }

  if (publicRoute === 'login') {
    return <LoginPage onBack={() => setPublicRoute('home')} />
  }

  return <HomePage onLogin={() => setPublicRoute('login')} />
}