import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppContextState, ActiveContext, AppMode } from './app-context.types'

export const useAppContext = create<AppContextState>()(
  persist(
    (set) => ({
      context: null,
      availableModes: [],
      isContextReady: false,
      isLoading: false,

      setContext(context: ActiveContext) {
        set({ context, isContextReady: true, isLoading: false })
      },

      setMode(mode: AppMode) {
        set((state) => ({
          context: state.context ? { ...state.context, mode } : null,
        }))
      },

      clearContext() {
        set({ context: null, availableModes: [], isContextReady: false })
      },

      setAvailableModes(modes: AppMode[]) {
        set({ availableModes: modes })
      },

      setLoading(loading: boolean) {
        set({ isLoading: loading })
      },
    }),
    {
      name: 'pulse-context-v1',
      partialize: (state) => ({
        context: state.context,
        availableModes: state.availableModes,
      }),
    }
  )
)
