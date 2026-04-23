import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Locale = 'pt-BR' | 'en-US'

interface LocaleState {
  locale: Locale
  setLocale(l: Locale): void
}

export const useLocale = create<LocaleState>()(
  persist(
    (set) => ({
      locale: 'pt-BR',
      setLocale: (locale) => set({ locale }),
    }),
    { name: 'pulse-locale-v1' }
  )
)
