import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type PublicLocale = 'en-US' | 'pt-BR'

interface PublicLocaleContextValue {
  locale: PublicLocale
  setLocale: (locale: PublicLocale) => void
  isPortuguese: boolean
}

const STORAGE_KEY = 'animalz-public-locale-v2'

const PublicLocaleContext = createContext<PublicLocaleContextValue | null>(null)

export function PublicLocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<PublicLocale>('en-US')

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const storedLocale = window.localStorage.getItem(STORAGE_KEY)

    if (storedLocale === 'pt-BR' || storedLocale === 'en-US') {
      setLocaleState(storedLocale)
    }
  }, [])

  function setLocale(localeValue: PublicLocale) {
    setLocaleState(localeValue)

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, localeValue)
    }
  }

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      isPortuguese: locale === 'pt-BR',
    }),
    [locale],
  )

  return <PublicLocaleContext.Provider value={value}>{children}</PublicLocaleContext.Provider>
}

export function usePublicLocale() {
  const context = useContext(PublicLocaleContext)

  if (!context) {
    throw new Error('usePublicLocale must be used within PublicLocaleProvider')
  }

  return context
}

export function formatPublicDate(
  value: string | number | Date,
  locale: PublicLocale,
  options?: Intl.DateTimeFormatOptions,
) {
  return new Intl.DateTimeFormat(locale, options).format(new Date(value))
}

export function formatPublicTime(
  value: string | number | Date,
  locale: PublicLocale,
  options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' },
) {
  return new Intl.DateTimeFormat(locale, options).format(new Date(value))
}

export function formatPublicNumber(value: number, locale: PublicLocale) {
  return new Intl.NumberFormat(locale).format(value)
}

export function formatPublicCurrency(value: number, locale: PublicLocale) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}
