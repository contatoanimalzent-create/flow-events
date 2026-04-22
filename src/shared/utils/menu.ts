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
    path: '/app/profile',
    badge,
  }

  switch (mode) {
    case 'attendee':
      return [
        { id: 'tickets', label: 'Ingressos', icon: 'Ticket', path: '/app/attendee/tickets' },
        { id: 'agenda', label: 'Agenda', icon: 'Calendar', path: '/app/attendee/agenda' },
        { id: 'map', label: 'Mapa', icon: 'Map', path: '/app/attendee/map' },
        { id: 'feed', label: 'Feed', icon: 'Rss', path: '/app/attendee/feed' },
        profileTab,
      ]
    case 'operator':
      return [
        { id: 'scanner', label: 'Scanner', icon: 'ScanLine', path: '/app/operator/scanner' },
        { id: 'history', label: 'Histórico', icon: 'History', path: '/app/operator/history' },
        { id: 'flow', label: 'Fluxo', icon: 'BarChart2', path: '/app/operator/flow' },
        { id: 'alerts', label: 'Alertas', icon: 'BellRing', path: '/app/operator/alerts' },
        profileTab,
      ]
    case 'staff':
      return [
        { id: 'home', label: 'Turno', icon: 'Home', path: '/app/staff' },
        { id: 'presence', label: 'Presença', icon: 'MapPin', path: '/app/staff/presence' },
        { id: 'instructions', label: 'Instruções', icon: 'FileText', path: '/app/staff/instructions' },
        { id: 'occurrences', label: 'Ocorrências', icon: 'AlertTriangle', path: '/app/staff/occurrences' },
        profileTab,
      ]
    case 'supervisor':
      return [
        { id: 'team', label: 'Equipe', icon: 'Users', path: '/app/supervisor/team-live' },
        { id: 'map', label: 'Mapa', icon: 'Map', path: '/app/supervisor/team-map' },
        { id: 'alerts', label: 'Alertas', icon: 'BellRing', path: '/app/supervisor/alerts' },
        { id: 'occurrences', label: 'Ocorrências', icon: 'AlertTriangle', path: '/app/supervisor/occurrences' },
        profileTab,
      ]
    case 'promoter':
      return [
        { id: 'sales', label: 'Vendas', icon: 'ShoppingCart', path: '/app/promoter/sales' },
        { id: 'commission', label: 'Comissão', icon: 'DollarSign', path: '/app/promoter/commission' },
        { id: 'ranking', label: 'Ranking', icon: 'Trophy', path: '/app/promoter/ranking' },
        { id: 'goals', label: 'Metas', icon: 'Target', path: '/app/promoter/goals' },
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
    operator: '/app/operator',
    staff: '/app/staff',
    supervisor: '/app/supervisor',
    attendee: '/app/attendee',
    promoter: '/app/promoter',
  }
  return routes[mode]
}
