import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/store/auth'
import { AppRouter } from '@/components/layout/AppRouter'

export default function App() {
  const { fetchProfile, setInitialized } = useAuthStore()

  useEffect(() => {
    // Verifica sessão existente
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        useAuthStore.setState({ user: session.user })
        await fetchProfile(session.user.id)
      }
      setInitialized()
    })

    // Listener de mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        useAuthStore.setState({ user: session.user })
        await fetchProfile(session.user.id)
      } else if (event === 'SIGNED_OUT') {
        useAuthStore.setState({ user: null, profile: null, organization: null })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return <AppRouter />
}
