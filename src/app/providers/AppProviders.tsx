import type { ReactNode } from 'react'
import { AuthProvider } from '@/features/auth'
import { ThemeProvider } from '@/shared'
import { AppLocaleProvider } from '@/shared/i18n/app-locale'
import { QueryProvider } from './QueryProvider'

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AppLocaleProvider>
          <AuthProvider>{children}</AuthProvider>
        </AppLocaleProvider>
      </QueryProvider>
    </ThemeProvider>
  )
}
