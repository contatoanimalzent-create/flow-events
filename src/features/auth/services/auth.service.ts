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
  createOrganizationForUser: async (userId: string, orgName: string, userEmail?: string) => {
    const base = orgName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    const slug = `${base}-${Date.now().toString(36)}`

    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({ name: orgName, slug, plan: 'starter', is_active: true, email: userEmail })
      .select()
      .single()

    if (orgError) return { error: orgError.message }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ organization_id: org.id, role: 'org_admin' })
      .eq('id', userId)

    if (profileError) return { error: profileError.message }

    return { org: org as Organization }
  },
}
