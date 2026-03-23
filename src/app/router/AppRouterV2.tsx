import { useState } from 'react'
import { AppShellV2 } from '@/app/layout'
import {
  AuthLoadingGate,
  RequireAuth,
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
            onBackToHome={() => setPublicRoute('home')}
          />
        }
      >
        {user ? (
          <RequirePasswordChange>
            <AppShellV2 />
          </RequirePasswordChange>
        ) : null}
      </RequireAuth>
    </AuthLoadingGate>
  )
}
