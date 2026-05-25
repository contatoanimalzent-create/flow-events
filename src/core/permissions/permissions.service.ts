import { supabase } from '@/lib/supabase'
import type { AppMode } from '../context/app-context.types'
import type { EffectivePermission, PermissionModule } from './permissions.types'

const ROLE_MODE_MAP: Record<string, AppMode[]> = {
  super_admin: ['operator', 'staff', 'supervisor', 'attendee', 'promoter'],
  org_admin: ['operator', 'staff', 'supervisor', 'attendee', 'promoter'],
  org_manager: ['supervisor', 'staff', 'attendee'],
  checkin_operator: ['operator'],
  pdv_operator: ['operator'],
  staff_member: ['staff'],
  attendee: ['attendee'],
  promoter: ['promoter'],
}

const MODE_MODULES: Record<AppMode, PermissionModule[]> = {
  operator: ['checkin', 'manual-check', 'checkin-history', 'flow', 'operator-alerts'],
  staff: ['shift', 'presence', 'location', 'instructions', 'occurrences'],
  supervisor: ['team-live', 'team-map', 'delays', 'absences', 'approvals', 'occurrences', 'operator-alerts'],
  attendee: ['tickets', 'agenda', 'event-map', 'feed', 'networking', 'upgrades'],
  promoter: ['sales', 'commission', 'ranking', 'goals'],
}

const SUPERVISOR_FULL_MODULES: PermissionModule[] = ['team-live', 'team-map', 'delays', 'absences', 'approvals']

export const permissionsService = {
  async getEffectivePermissions(
    userId: string,
    orgId: string,
    eventId: string
  ): Promise<{ permissions: EffectivePermission[]; modes: AppMode[] }> {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    const { data: authUser } = await supabase.auth.getUser()
    const userEmail = authUser?.user?.email ?? ''

    const [staffResult, ticketResult, referralResult] = await Promise.all([
      supabase
        .from('staff_members')
        .select('role_title')
        .eq('email', userEmail)
        .eq('event_id', eventId),
      userEmail
        ? supabase
            .from('digital_tickets')
            .select('id', { count: 'exact', head: true })
            .eq('holder_email', userEmail)
            .eq('event_id', eventId)
        : Promise.resolve({ count: 0 }),
      supabase
        .from('referral_links')
        .select('id', { count: 'exact', head: true })
        .eq('referrer_id', userId)
        .eq('event_id', eventId),
    ])

    const roles: string[] = []
    if (profile?.role) roles.push(profile.role)
    ;(staffResult.data ?? []).forEach(() => roles.push('staff_member'))
    if ((ticketResult.count ?? 0) > 0) roles.push('attendee')
    if ((referralResult.count ?? 0) > 0) roles.push('promoter')

    const modeSet = new Set<AppMode>()
    roles.forEach((role) => {
      const modes = ROLE_MODE_MAP[role] ?? []
      modes.forEach((m) => modeSet.add(m))
    })
    const modes = Array.from(modeSet)

    const permMap = new Map<PermissionModule, Set<string>>()

    const addPerms = (modules: PermissionModule[], actions: string[]) => {
      modules.forEach((mod) => {
        if (!permMap.has(mod)) permMap.set(mod, new Set())
        actions.forEach((a) => permMap.get(mod)!.add(a))
      })
    }

    modes.forEach((mode) => {
      const isSupervisor = mode === 'supervisor'
      const mods = MODE_MODULES[mode] ?? []
      mods.forEach((mod) => {
        const actions = isSupervisor && SUPERVISOR_FULL_MODULES.includes(mod)
          ? ['view', 'create', 'edit', 'approve', 'manage']
          : ['view', 'create', 'edit']
        addPerms([mod], actions)
      })
    })

    addPerms(['profile', 'settings', 'notifications', 'help'], ['view', 'edit'])

    const permissions: EffectivePermission[] = Array.from(permMap.entries()).map(
      ([module, actionsSet]) => ({
        module,
        actions: Array.from(actionsSet) as any,
      })
    )

    return { permissions, modes }
  },
}
