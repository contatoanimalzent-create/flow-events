import { supabase, type Organization, type Profile } from '@/lib/supabase'

export const authService = {
  getSession: () => supabase.auth.getSession(),
  onAuthStateChange: (callback: Parameters<typeof supabase.auth.onAuthStateChange>[0]) =>
    supabase.auth.onAuthStateChange(callback),
  signInWithPassword: (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password }),
  signUp: (email: string, password: string, firstName: string, lastName: string) =>
    supabase.auth.signUp({
      email,
      password,
      options: { data: { first_name: firstName, last_name: lastName } },
    }),
  signInWithGoogle: () =>
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    }),
  resetPasswordForEmail: (email: string) =>
    supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    }),
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
  createOrganizationForUser: async (_userId: string, orgName: string, userEmail?: string) => {
    // Usa RPC SECURITY DEFINER, contorna RLS e executa tudo atomicamente:
    // 1) cria a org  2) adiciona em organization_members  3) atualiza profile
    const { data, error } = await supabase
      .rpc('create_organization', {
        org_name:  orgName,
        org_email: userEmail ?? null,
        org_plan:  'starter',
        org_slug:  null,
      })

    if (error) return { error: error.message }

    return { org: data as unknown as Organization }
  },
}
