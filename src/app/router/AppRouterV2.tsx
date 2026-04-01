import { useState } from 'react'
import { AppShellV2 } from '@/app/layout'
import {
  AuthLoadingGate,
  RequireAuth,
  RequireOrganization,
  RequirePasswordChange,
  useAuthStore,
} from '@/features/auth'
import { PublicRouteView } from './PublicRouteView'
import { getInitialPublicRoute, isImmediatePublicRoute } from './public-routes'

export function AppRouterV2() {
  const user = useAuthStore((state) => state.user)
  const [publicRoute, setPublicRoute] = useState(getInitialPublicRoute)

  if (isImmediatePublicRoute(publicRoute)) {
    return (
      <PublicRouteView
        route={publicRoute}
        onLogin={() => setPublicRoute('login')}
        onSignup={() => setPublicRoute('signup')}
        onBackToHome={() => setPublicRoute('home')}
      />
    )
  }

  return (
    <AuthLoadingGate>
      <RequireAuth
        fallback={
          <PublicRouteView
            route={publicRoute}
            onLogin={() => setPublicRoute('login')}
            onSignup={() => setPublicRoute('signup')}
            onBackToHome={() => setPublicRoute('home')}
          />
        }
      >
        {user ? (
          <RequirePasswordChange>
            <RequireOrganization>
              <AppShellV2 />
            </RequireOrganization>
          </RequirePasswordChange>
        ) : null}
      </RequireAuth>
    </AuthLoadingGate>
  )
}
