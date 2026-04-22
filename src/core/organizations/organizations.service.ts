import { supabase } from '@/lib/supabase'
import type { UserOrganization } from './organizations.types'

export const organizationsService = {
  async getUserOrganizations(userId: string): Promise<UserOrganization[]> {
    // Get profile with org
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, organization_id, organizations(id, name, slug, logo_url, plan)')
      .eq('id', userId)
      .single()

    if (!profile?.organizations) return []

    const org = profile.organizations as any

    const { count } = await supabase
      .from('events')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', org.id)

    return [
      {
        id: org.id,
        name: org.name,
        slug: org.slug,
        logo_url: org.logo_url ?? null,
        plan: org.plan ?? 'starter',
        userRole: profile.role ?? 'member',
        eventCount: count ?? 0,
      },
    ]
  },
}
