import { supabase } from '@/lib/supabase'
import type { AppMode } from '../context/app-context.types'
import type { EffectivePermission, PermissionModule } from './permissions.types'

// Which app modes each DB role can access
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

// Modules unlocked per mode
const MODE_MODULES: Record<AppMode, PermissionModule[]> = {
  operator: ['checkin', 'manual-check', 'checkin-history', 'flow', 'operator-alerts'],
  staff: ['shift', 'presence', 'location', 'instructions', 'occurrences'],
  supervisor: ['team-live', 'team-map', 'delays', 'absences', 'approvals', 'occurrences', 'operator-alerts'],
  attendee: ['tickets', 'agenda', 'event-map', 'feed', 'networking', 'upgrades'],
  promoter: ['sales', 'commission', 'ranking', 'goals'],
}

// Supervisor gets full actions on team modules
const SUPERVISOR_FULL_MODULES: PermissionModule[] = ['team-live', 'team-map', 'delays', 'absences', 'approvals']

export const permissionsService = {
  async getEffectivePermissions(
    userId: string,
    orgId: string,
    eventId: string
  ): Promise<{ permissions: EffectivePermission[]; modes: AppMode[] }> {
    // 1. Profile role (org-level)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    // 2. Staff roles in this event
    const { data: staffRows } = await supabase
      .from('staff_members')
      .select('role')
      .eq('user_id', userId)
      .eq('event_id', eventId)

    // 3. Ticket presence (attendee role)
    const { count: ticketCount } = await supabase
      .from('digital_tickets')
      .select('id', { count: 'exact', head: true })
      .eq('attendee_id', userId)
      .eq('event_id', eventId)

    // 4. Referral link (promoter role)
    const { count: referralCount } = await supabase
      .from('referral_links')
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', userId)
      .eq('event_id', eventId)

    // Collect all roles
    const roles: string[] = []
    if (profile?.role) roles.push(profile.role)
    staffRows?.forEach((s: any) => roles.push(s.role))
    if ((ticketCount ?? 0) > 0) roles.push('attendee')
    if ((referralCount ?? 0) > 0) roles.push('promoter')

    // Derive available modes
    const modeSet = new Set<AppMode>()
    roles.forEach((role) => {
      const modes = ROLE_MODE_MAP[role] ?? []
      modes.forEach((m) => modeSet.add(m))
    })
    const modes = Array.from(modeSet)

    // Build permissions
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

    // Global always-available modules
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
