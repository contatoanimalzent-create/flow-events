import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type AppLocale = 'en-US' | 'pt-BR'

interface AppLocaleContextValue {
  locale: AppLocale
  setLocale: (locale: AppLocale) => void
  toggleLocale: () => void
  isPortuguese: boolean
  t: <T>(english: T, portuguese: T) => T
}

const STORAGE_KEY = 'animalz-app-locale-v1'

const AppLocaleContext = createContext<AppLocaleContextValue | null>(null)

export function AppLocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>('en-US')

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const storedLocale = window.localStorage.getItem(STORAGE_KEY)

    if (storedLocale === 'pt-BR' || storedLocale === 'en-US') {
      setLocaleState(storedLocale)
      return
    }

    const browserLocale = window.navigator.language
    if (browserLocale.toLowerCase().startsWith('pt')) {
      setLocaleState('pt-BR')
    }
  }, [])

  function setLocale(nextLocale: AppLocale) {
    setLocaleState(nextLocale)

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, nextLocale)
    }
  }

  function toggleLocale() {
    setLocale(locale === 'pt-BR' ? 'en-US' : 'pt-BR')
  }

  const value = useMemo<AppLocaleContextValue>(
    () => ({
      locale,
      setLocale,
      toggleLocale,
      isPortuguese: locale === 'pt-BR',
      t: <T,>(english: T, portuguese: T) => (locale === 'pt-BR' ? portuguese : english),
    }),
    [locale],
  )

  return <AppLocaleContext.Provider value={value}>{children}</AppLocaleContext.Provider>
}

export function useAppLocale() {
  const context = useContext(AppLocaleContext)

  if (!context) {
    throw new Error('useAppLocale must be used within AppLocaleProvider')
  }

  return context
}

export function formatLocaleDate(
  value: string | number | Date,
  locale: AppLocale,
  options?: Intl.DateTimeFormatOptions,
) {
  return new Intl.DateTimeFormat(locale, options).format(new Date(value))
}

export function formatLocaleTime(
  value: string | number | Date,
  locale: AppLocale,
  options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' },
) {
  return new Intl.DateTimeFormat(locale, options).format(new Date(value))
}

export function formatLocaleNumber(value: number, locale: AppLocale) {
  return new Intl.NumberFormat(locale).format(value)
}

export function formatLocaleCurrency(value: number, locale: AppLocale, currency = 'BRL') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value)
}
