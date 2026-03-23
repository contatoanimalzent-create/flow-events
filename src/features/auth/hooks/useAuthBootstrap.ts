import { useEffect } from 'react'
import { authService, useAuthStore } from '@/features/auth/services'

export function useAuthBootstrap() {
  const bootstrapSession = useAuthStore((state) => state.bootstrapSession)
  const clearSession = useAuthStore((state) => state.clearSession)
  const setInitialized = useAuthStore((state) => state.setInitialized)

  useEffect(() => {
    let active = true

    async function initializeSession() {
      const { data } = await authService.getSession()

      if (!active) return

      await bootstrapSession(data.session?.user ?? null)

      if (active) {
        setInitialized(true)
      }
    }

    void initializeSession()

    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      if (!active) return

      if (event === 'SIGNED_OUT') {
        clearSession()
        return
      }

      await bootstrapSession(session?.user ?? null)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [bootstrapSession, clearSession, setInitialized])
}
