import { supabase, type Organization, type Profile } from '@/lib/supabase'

export const authService = {
  getSession: () => supabase.auth.getSession(),
  onAuthStateChange: (callback: Parameters<typeof supabase.auth.onAuthStateChange>[0]) =>
    supabase.auth.onAuthStateChange(callback),
  signInWithPassword: (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password }),
  signOut: () => supabase.auth.signOut(),
  updatePassword: (password: string) => supabase.auth.updateUser({ password }),
  getProfileById: async (userId: string): Promise<Profile | null> => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    return data ?? null
  },
  getOrganizationById: async (organizationId: string): Promise<Organization | null> => {
    const { data } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .single()

    return data ?? null
  },
  markPasswordChanged: async (profileId: string) => {
    await supabase
      .from('profiles')
      .update({ must_change_password: false })
      .eq('id', profileId)
  },
}
