import { useAuthStore } from '@/lib/store/auth'
import { LoginPage } from '@/pages/auth/LoginPage'
import { ChangePasswordPage } from '@/pages/auth/ChangePasswordPage'
import { AppShell } from '@/components/layout/AppShell'
import { LoadingScreen } from '@/components/ui/LoadingScreen'

export function AppRouter() {
  const { user, profile, initialized } = useAuthStore()

  if (!initialized) return <LoadingScreen />
  if (!user) return <LoginPage />
  if (profile?.must_change_password) return <ChangePasswordPage />

  return <AppShell />
}
