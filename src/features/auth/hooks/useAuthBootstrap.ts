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
        // getSession lê do localStorage, rápido e síncrono
        const { data } = await authService.getSession()

        if (!active) return

        if (!data.session?.user) {
          clearSession()
          setInitialized(true)
          return
        }

        // Marca inicializado ANTES do fetchProfile para não bloquear a UI
        // O profile é carregado em background
        setInitialized(true)

        bootstrapSession(data.session.user).catch((error) => {
          console.error('Auth bootstrap profile error:', error)
        })
      } catch (error) {
        console.error('Auth bootstrap error:', error)
        if (active) clearSession()
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

        // Atualiza profile em background sem bloquear
        bootstrapSession(session?.user ?? null).catch((error) => {
          console.error('Auth state change error:', error)
        })
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