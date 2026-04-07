import { useEffect } from 'react'
import { authService, useAuthStore } from '@/features/auth/services'

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Auth bootstrap timeout after ${ms}ms`))
    }, ms)

    promise
      .then((value) => {
        clearTimeout(timer)
        resolve(value)
      })
      .catch((error) => {
        clearTimeout(timer)
        reject(error)
      })
  })
}

export function useAuthBootstrap() {
  const bootstrapSession = useAuthStore((state) => state.bootstrapSession)
  const clearSession = useAuthStore((state) => state.clearSession)
  const setInitialized = useAuthStore((state) => state.setInitialized)

  useEffect(() => {
    let active = true

    async function initializeSession() {
      try {
        const { data } = await withTimeout(authService.getSession(), 5000)

        if (!active) return

        await withTimeout(bootstrapSession(data.session?.user ?? null), 5000)
      } catch (error) {
        console.error('Auth bootstrap error:', error)
        if (active) clearSession()
      } finally {
        if (active) setInitialized(true)
      }
    }

    void initializeSession()

    const {
      data: { subscription },
    } = authService.onAuthStateChange(async (event, session) => {
      if (!active) return

      try {
        if (event === 'SIGNED_OUT') {
          clearSession()
          return
        }

        await withTimeout(bootstrapSession(session?.user ?? null), 5000)
      } catch (error) {
        console.error('Auth state change error:', error)
        clearSession()
      } finally {
        setInitialized(true)
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [bootstrapSession, clearSession, setInitialized])
}