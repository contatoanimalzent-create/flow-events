import { create } from 'zustand'
import type { User } from '@supabase/supabase-js'
import type { Organization, Profile } from '@/lib/supabase'
import { authService } from './auth.service'
import type { AuthActionResult } from '@/features/auth/types'

interface AuthState {
  user: User | null
  profile: Profile | null
  organization: Organization | null
  loading: boolean
  initialized: boolean
  signIn: (email: string, password: string) => Promise<AuthActionResult>
  signOut: () => Promise<void>
  updatePassword: (password: string) => Promise<AuthActionResult>
  fetchProfile: (userId: string) => Promise<void>
  bootstrapSession: (user: User | null) => Promise<void>
  clearSession: () => void
  setInitialized: (value?: boolean) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  organization: null,
  loading: false,
  initialized: false,

  setInitialized: (value = true) => set({ initialized: value }),

  clearSession: () =>
    set({
      user: null,
      profile: null,
      organization: null,
      loading: false,
    }),

  bootstrapSession: async (user) => {
    if (!user) {
      get().clearSession()
      return
    }

    set({ user })
    await get().fetchProfile(user.id)
  },

  signIn: async (email, password) => {
    set({ loading: true })
    const { data, error } = await authService.signInWithPassword(email, password)

    if (error) {
      set({ loading: false })
      return { error: error.message }
    }

    await get().bootstrapSession(data.user)
    set({ loading: false })
    return {}
  },

  signOut: async () => {
    await authService.signOut()
    get().clearSession()
  },

  updatePassword: async (password) => {
    const { error } = await authService.updatePassword(password)
    if (error) return { error: error.message }

    const { profile } = get()
    if (profile) {
      await authService.markPasswordChanged(profile.id)
      set({ profile: { ...profile, must_change_password: false } })
    }

    return {}
  },

  fetchProfile: async (userId) => {
    const profile = await authService.getProfileById(userId)

    if (!profile) {
      set({ profile: null, organization: null })
      return
    }

    let organization: Organization | null = null

    if (profile.organization_id) {
      organization = await authService.getOrganizationById(profile.organization_id)
    }

    set({
      profile,
      organization,
    })
  },
}))
