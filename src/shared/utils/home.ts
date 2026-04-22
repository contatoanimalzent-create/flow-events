import type { AppMode } from '@/core/context/app-context.types'

export interface HomeCard {
  id: string
  title: string
  subtitle: string
  icon: string
  color: string
  path: string
  size?: 'normal' | 'large'
}

export function resolveHomeCards(mode: AppMode): HomeCard[] {
  switch (mode) {
    case 'operator':
      return [
        {
          id: 'scanner',
          title: 'Scanner QR',
          subtitle: 'Validar ingressos',
          icon: 'ScanLine',
          color: '#0057E7',
          path: '/app/operator/scanner',
          size: 'large',
        },
        {
          id: 'history',
          title: 'Histórico',
          subtitle: 'Últimos check-ins',
          icon: 'History',
          color: '#1e293b',
          path: '/app/operator/history',
        },
        {
          id: 'flow',
          title: 'Fluxo',
          subtitle: 'Métricas da portaria',
          icon: 'BarChart2',
          color: '#1e293b',
          path: '/app/operator/flow',
        },
        {
          id: 'manual',
          title: 'Busca Manual',
          subtitle: 'Verificar por nome/CPF',
          icon: 'Search',
          color: '#1e293b',
          path: '/app/operator/manual-check',
        },
        {
          id: 'alerts',
          title: 'Alertas',
          subtitle: 'Tentativas inválidas',
          icon: 'BellRing',
          color: '#7f1d1d',
          path: '/app/operator/alerts',
        },
      ]

    case 'staff':
      return [
        {
          id: 'shift',
          title: 'Meu Turno',
          subtitle: 'Ver detalhes do turno',
          icon: 'Clock',
          color: '#22C55E',
          path: '/app/staff/shift',
          size: 'large',
        },
        {
          id: 'presence',
          title: 'Presença',
          subtitle: 'Registrar presença',
          icon: 'MapPin',
          color: '#1e293b',
          path: '/app/staff/presence',
        },
        {
          id: 'instructions',
          title: 'Instruções',
          subtitle: 'Orientações do turno',
          icon: 'FileText',
          color: '#1e293b',
          path: '/app/staff/instructions',
        },
        {
          id: 'occurrences',
          title: 'Ocorrências',
          subtitle: 'Registrar ocorrência',
          icon: 'AlertTriangle',
          color: '#78350f',
          path: '/app/staff/occurrences',
        },
        {
          id: 'history',
          title: 'Histórico',
          subtitle: 'Meus turnos anteriores',
          icon: 'ClipboardList',
          color: '#1e293b',
          path: '/app/staff/history',
        },
      ]

    case 'supervisor':
      return [
        {
          id: 'team',
          title: 'Equipe Ao Vivo',
          subtitle: 'Status em tempo real',
          icon: 'Users',
          color: '#7C3AED',
          path: '/app/supervisor/team-live',
          size: 'large',
        },
        {
          id: 'map',
          title: 'Mapa da Equipe',
          subtitle: 'Posições no evento',
          icon: 'Map',
          color: '#1e293b',
          path: '/app/supervisor/team-map',
        },
        {
          id: 'approvals',
          title: 'Aprovações',
          subtitle: 'Pendentes',
          icon: 'CheckSquare',
          color: '#1e293b',
          path: '/app/supervisor/approvals',
        },
        {
          id: 'delays',
          title: 'Atrasos',
          subtitle: 'Staff com atraso',
          icon: 'Clock',
          color: '#7f1d1d',
          path: '/app/supervisor/delays',
        },
        {
          id: 'occurrences',
          title: 'Ocorrências',
          subtitle: 'Ver todas',
          icon: 'AlertTriangle',
          color: '#78350f',
          path: '/app/supervisor/occurrences',
        },
      ]

    case 'attendee':
      return [
        {
          id: 'tickets',
          title: 'Meu Ingresso',
          subtitle: 'Ver QR Code',
          icon: 'Ticket',
          color: '#4285F4',
          path: '/app/attendee/tickets',
          size: 'large',
        },
        {
          id: 'agenda',
          title: 'Agenda',
          subtitle: 'Programação completa',
          icon: 'Calendar',
          color: '#1e293b',
          path: '/app/attendee/agenda',
        },
        {
          id: 'map',
          title: 'Mapa',
          subtitle: 'Planta do evento',
          icon: 'Map',
          color: '#1e293b',
          path: '/app/attendee/map',
        },
        {
          id: 'feed',
          title: 'Feed',
          subtitle: 'Novidades',
          icon: 'Rss',
          color: '#1e293b',
          path: '/app/attendee/feed',
        },
        {
          id: 'networking',
          title: 'Networking',
          subtitle: 'Conectar com pessoas',
          icon: 'Users',
          color: '#1e293b',
          path: '/app/attendee/networking',
        },
        {
          id: 'upgrades',
          title: 'Upgrades',
          subtitle: 'Ofertas exclusivas',
          icon: 'Sparkles',
          color: '#78350f',
          path: '/app/attendee/upgrades',
        },
      ]

    case 'promoter':
      return [
        {
          id: 'code',
          title: 'Meu Código',
          subtitle: 'Compartilhar link de venda',
          icon: 'QrCode',
          color: '#F97316',
          path: '/app/promoter',
          size: 'large',
        },
        {
          id: 'sales',
          title: 'Vendas',
          subtitle: 'Histórico',
          icon: 'ShoppingCart',
          color: '#1e293b',
          path: '/app/promoter/sales',
        },
        {
          id: 'commission',
          title: 'Comissão',
          subtitle: 'Ganhos acumulados',
          icon: 'DollarSign',
          color: '#14532d',
          path: '/app/promoter/commission',
        },
        {
          id: 'ranking',
          title: 'Ranking',
          subtitle: 'Sua posição',
          icon: 'Trophy',
          color: '#78350f',
          path: '/app/promoter/ranking',
        },
        {
          id: 'goals',
          title: 'Metas',
          subtitle: 'Progresso',
          icon: 'Target',
          color: '#1e293b',
          path: '/app/promoter/goals',
        },
      ]

    default:
      return []
  }
}

export function resolveModeTitle(mode: AppMode): string {
  const titles: Record<AppMode, string> = {
    operator: 'Controle de Acesso',
    staff: 'Meu Turno',
    supervisor: 'Supervisão',
    attendee: 'Meu Evento',
    promoter: 'Central de Vendas',
  }
  return titles[mode]
}
