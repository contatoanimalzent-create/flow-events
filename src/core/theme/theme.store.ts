import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'dark' | 'light'

interface ThemeStore {
  theme: Theme
  setTheme: (t: Theme) => void
  toggle: () => void
}

export const useTheme = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      setTheme: (theme) => {
        set({ theme })
        applyTheme(theme)
      },
      toggle: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark'
        set({ theme: next })
        applyTheme(next)
      },
    }),
    { name: 'pulse-theme' }
  )
)

export function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-pulse-theme', theme)
}

// Apply on import (hydration)
applyTheme(
  (JSON.parse(localStorage.getItem('pulse-theme') ?? '{}').state?.theme) ?? 'dark'
)
