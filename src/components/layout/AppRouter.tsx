import { useState } from 'react'
import { useAuthStore } from '@/lib/store/auth'
import { LoginPage } from '@/pages/auth/LoginPage'
import { ChangePasswordPage } from '@/pages/auth/ChangePasswordPage'
import { AppShell } from '@/components/layout/AppShell'
import { LoadingScreen } from '@/components/ui/LoadingScreen'
import { HomePage } from '@/pages/public/HomePage'

type PublicRoute = 'home' | 'login'

export function AppRouter() {
  const { user, profile, initialized } = useAuthStore()
  const [publicRoute, setPublicRoute] = useState<PublicRoute>('home')

  if (!initialized) return <LoadingScreen />

  // Usuário autenticado
  if (user) {
    if (profile?.must_change_password) return <ChangePasswordPage />
    return <AppShell />
  }

  // Rotas públicas
  if (publicRoute === 'login') {
    return <LoginPage onBack={() => setPublicRoute('home')} />
  }

  return <HomePage onLogin={() => setPublicRoute('login')} />
}
