import { create } from 'zustand'
import { supabase, type Profile, type Organization } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  profile: Profile | null
  organization: Organization | null
  loading: boolean
  initialized: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  updatePassword: (password: string) => Promise<{ error?: string }>
  fetchProfile: (userId: string) => Promise<void>
  setInitialized: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  organization: null,
  loading: false,
  initialized: false,

  setInitialized: () => set({ initialized: true }),

  signIn: async (email, password) => {
    set({ loading: true })
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      set({ loading: false })
      return { error: error.message }
    }
    if (data.user) {
      await get().fetchProfile(data.user.id)
    }
    set({ user: data.user, loading: false })
    return {}
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null, organization: null })
  },

  updatePassword: async (password) => {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) return { error: error.message }
    // Marca que a senha foi trocada
    const { profile } = get()
    if (profile) {
      await supabase
        .from('profiles')
        .update({ must_change_password: false })
        .eq('id', profile.id)
      set({ profile: { ...profile, must_change_password: false } })
    }
    return {}
  },

  fetchProfile: async (userId) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profile) {
      set({ profile })
      if (profile.organization_id) {
        const { data: org } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', profile.organization_id)
          .single()
        if (org) set({ organization: org })
      }
    }
  },
}))
