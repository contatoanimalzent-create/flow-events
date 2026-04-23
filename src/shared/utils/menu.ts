import type { AppMode } from '@/core/context/app-context.types'

export interface TabItem {
  id: string
  label: string
  icon: string
  path: string
  badge?: number
}

export function buildTabsForMode(mode: AppMode, badge?: number): TabItem[] {
  const profileTab: TabItem = {
    id: 'profile',
    label: 'Perfil',
    icon: 'User',
    path: '/pulse/profile',
    badge,
  }

  switch (mode) {
    case 'attendee':
      return [
        { id: 'home', label: 'Início', icon: 'Home', path: '/pulse/attendee' },
        { id: 'tickets', label: 'Ingressos', icon: 'Ticket', path: '/pulse/attendee/tickets' },
        { id: 'agenda', label: 'Agenda', icon: 'Calendar', path: '/pulse/attendee/agenda' },
        { id: 'map', label: 'Mapa', icon: 'Map', path: '/pulse/attendee/map' },
        profileTab,
      ]
    case 'operator':
      return [
        { id: 'home', label: 'Início', icon: 'Home', path: '/pulse/operator' },
        { id: 'scanner', label: 'Scanner', icon: 'ScanLine', path: '/pulse/operator/scanner' },
        { id: 'history', label: 'Histórico', icon: 'History', path: '/pulse/operator/history' },
        { id: 'flow', label: 'Fluxo', icon: 'BarChart2', path: '/pulse/operator/flow' },
        profileTab,
      ]
    case 'staff':
      return [
        { id: 'home', label: 'Turno', icon: 'Home', path: '/pulse/staff' },
        { id: 'presence', label: 'Presença', icon: 'MapPin', path: '/pulse/staff/presence' },
        { id: 'instructions', label: 'Instruções', icon: 'FileText', path: '/pulse/staff/instructions' },
        { id: 'occurrences', label: 'Ocorrências', icon: 'AlertTriangle', path: '/pulse/staff/occurrences' },
        profileTab,
      ]
    case 'supervisor':
      return [
        { id: 'home', label: 'Início', icon: 'Home', path: '/pulse/supervisor' },
        { id: 'team', label: 'Equipe', icon: 'Users', path: '/pulse/supervisor/team-live' },
        { id: 'alerts', label: 'Alertas', icon: 'BellRing', path: '/pulse/supervisor/alerts' },
        { id: 'approvals', label: 'Aprovações', icon: 'CheckSquare', path: '/pulse/supervisor/approvals' },
        profileTab,
      ]
    case 'promoter':
      return [
        { id: 'home', label: 'Início', icon: 'Home', path: '/pulse/promoter' },
        { id: 'sales', label: 'Vendas', icon: 'ShoppingCart', path: '/pulse/promoter/sales' },
        { id: 'commission', label: 'Comissão', icon: 'DollarSign', path: '/pulse/promoter/commission' },
        { id: 'ranking', label: 'Ranking', icon: 'Trophy', path: '/pulse/promoter/ranking' },
        profileTab,
      ]
    default:
      return []
  }
}

export function buildModeLabel(mode: AppMode): string {
  const labels: Record<AppMode, string> = {
    operator: 'Operador',
    staff: 'Staff',
    supervisor: 'Supervisor',
    attendee: 'Participante',
    promoter: 'Promoter',
  }
  return labels[mode]
}

export function buildModeAccent(mode: AppMode): string {
  const accents: Record<AppMode, string> = {
    operator: '#0057E7',
    staff: '#22C55E',
    supervisor: '#7C3AED',
    attendee: '#4285F4',
    promoter: '#F97316',
  }
  return accents[mode]
}

export function buildModeIcon(mode: AppMode): string {
  const icons: Record<AppMode, string> = {
    operator: 'ScanLine',
    staff: 'Clock',
    supervisor: 'Users',
    attendee: 'Ticket',
    promoter: 'Tag',
  }
  return icons[mode]
}

export function buildHomeRoute(mode: AppMode): string {
  const routes: Record<AppMode, string> = {
    operator: '/pulse/operator',
    staff: '/pulse/staff',
    supervisor: '/pulse/supervisor',
    attendee: '/pulse/attendee',
    promoter: '/pulse/promoter',
  }
  return routes[mode]
}
