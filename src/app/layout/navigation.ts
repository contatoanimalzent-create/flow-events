import type { LucideIcon } from 'lucide-react'
import {
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  CircleHelp,
  LayoutDashboard,
  MessageSquare,
  ScanLine,
  Settings2,
  Shield,
  Ticket,
  TrendingUp,
  UsersRound,
  Wallet,
} from 'lucide-react'

export type NavSection =
  | 'dashboard'
  | 'events'
  | 'tickets'
  | 'sales'
  | 'crm'
  | 'checkin'
  | 'staff'
  | 'suppliers'
  | 'products'
  | 'inventory'
  | 'intelligence'
  | 'communication'
  | 'financial'
  | 'billing'
  | 'growth'
  | 'help'
  | 'settings'
  | 'registrations'
  | 'sponsors'

export interface AppNavItem {
  id: NavSection
  label: string
  shortLabel: string
  description: string
  groupLabel: string
  icon: LucideIcon
  visibleInSidebar: boolean
}

export interface AppNavGroup {
  key: string
  label: string
  items: AppNavItem[]
}

export const defaultNavSection: NavSection = 'dashboard'

function createItem(
  id: NavSection,
  label: string,
  shortLabel: string,
  description: string,
  groupLabel: string,
  icon: LucideIcon,
  visibleInSidebar = true,
): AppNavItem {
  return {
    id,
    label,
    shortLabel,
    description,
    groupLabel,
    icon,
    visibleInSidebar,
  }
}

export function createAppNavigation(isPortuguese: boolean): AppNavGroup[] {
  const labels = {
    operation: isPortuguese ? 'Operacao' : 'Operations',
    people: isPortuguese ? 'Pessoas e acesso' : 'People and access',
    business: isPortuguese ? 'Receita e relacionamento' : 'Revenue and relationship',
    system: isPortuguese ? 'Sistema' : 'System',
  }

  return [
    {
      key: 'operation',
      label: labels.operation,
      items: [
        createItem(
          'dashboard',
          isPortuguese ? 'Dashboard' : 'Dashboard',
          isPortuguese ? 'Dash' : 'Dash',
          isPortuguese ? 'Visao executiva do sistema.' : 'Executive view of the system.',
          labels.operation,
          LayoutDashboard,
        ),
        createItem(
          'events',
          isPortuguese ? 'Eventos' : 'Events',
          isPortuguese ? 'Eventos' : 'Events',
          isPortuguese ? 'Gestao central do portfolio de eventos.' : 'Central management for the event portfolio.',
          labels.operation,
          CalendarDays,
        ),
        createItem(
          'tickets',
          isPortuguese ? 'Ingressos' : 'Tickets',
          isPortuguese ? 'Ingressos' : 'Tickets',
          isPortuguese ? 'Lotes, regras e disponibilidade comercial.' : 'Releases, rules and commercial availability.',
          labels.operation,
          Ticket,
        ),
        createItem(
          'financial',
          isPortuguese ? 'Financeiro' : 'Financial',
          isPortuguese ? 'Financeiro' : 'Finance',
          isPortuguese ? 'Receita, repasses e leitura financeira.' : 'Revenue, payouts and financial readouts.',
          labels.operation,
          Wallet,
        ),
      ],
    },
    {
      key: 'people',
      label: labels.people,
      items: [
        createItem(
          'registrations',
          isPortuguese ? 'Credenciamento' : 'Credentialing',
          isPortuguese ? 'Credenciamento' : 'Credentials',
          isPortuguese ? 'Listas, emissoes e fluxos de habilitacao.' : 'Lists, badge issuing and enablement flows.',
          labels.people,
          BadgeCheck,
        ),
        createItem(
          'staff',
          isPortuguese ? 'Equipe' : 'Team',
          isPortuguese ? 'Equipe' : 'Team',
          isPortuguese ? 'Pessoas, cargos e operacao de campo.' : 'People, roles and field operations.',
          labels.people,
          BriefcaseBusiness,
        ),
        createItem(
          'checkin',
          isPortuguese ? 'Check-in' : 'Check-in',
          isPortuguese ? 'Check-in' : 'Check-in',
          isPortuguese ? 'Leitura, filas e validacao em campo.' : 'Scanning, queues and field validation.',
          labels.people,
          ScanLine,
        ),
      ],
    },
    {
      key: 'business',
      label: labels.business,
      items: [
        createItem(
          'crm',
          isPortuguese ? 'CRM' : 'CRM',
          isPortuguese ? 'CRM' : 'CRM',
          isPortuguese ? 'Relacionamento com publico e recorrencia.' : 'Audience relationship and retention.',
          labels.business,
          UsersRound,
        ),
        createItem(
          'communication',
          isPortuguese ? 'Comunicacao' : 'Communication',
          isPortuguese ? 'Comunicacao' : 'Comms',
          isPortuguese ? 'Mensagens, campanhas e operacao de comunicacao.' : 'Messages, campaigns and communication operations.',
          labels.business,
          MessageSquare,
        ),
      ],
    },
    {
      key: 'system',
      label: labels.system,
      items: [
        createItem(
          'settings',
          isPortuguese ? 'Configuracoes' : 'Settings',
          isPortuguese ? 'Configuracoes' : 'Settings',
          isPortuguese ? 'Preferencias, governanca e ajustes da conta.' : 'Preferences, governance and account settings.',
          labels.system,
          Settings2,
        ),
      ],
    },
  ]
}

export function getSectionMeta(section: NavSection, isPortuguese: boolean): AppNavItem {
  const visibleItems = createAppNavigation(isPortuguese).flatMap((group) => group.items)
  const visibleItem = visibleItems.find((item) => item.id === section)

  if (visibleItem) {
    return visibleItem
  }

  const advancedGroupLabel = isPortuguese ? 'Modulos conectados' : 'Connected modules'
  const hiddenItems: Record<NavSection, AppNavItem> = {
    dashboard: visibleItems.find((item) => item.id === 'dashboard')!,
    events: visibleItems.find((item) => item.id === 'events')!,
    tickets: visibleItems.find((item) => item.id === 'tickets')!,
    registrations: visibleItems.find((item) => item.id === 'registrations')!,
    staff: visibleItems.find((item) => item.id === 'staff')!,
    checkin: visibleItems.find((item) => item.id === 'checkin')!,
    financial: visibleItems.find((item) => item.id === 'financial')!,
    crm: visibleItems.find((item) => item.id === 'crm')!,
    communication: visibleItems.find((item) => item.id === 'communication')!,
    settings: visibleItems.find((item) => item.id === 'settings')!,
    sales: createItem(
      'sales',
      isPortuguese ? 'Vendas' : 'Sales',
      isPortuguese ? 'Vendas' : 'Sales',
      isPortuguese ? 'Pedidos, conversao e performance comercial.' : 'Orders, conversion and sales performance.',
      advancedGroupLabel,
      TrendingUp,
      false,
    ),
    suppliers: createItem(
      'suppliers',
      isPortuguese ? 'Fornecedores' : 'Suppliers',
      isPortuguese ? 'Fornecedores' : 'Suppliers',
      isPortuguese ? 'Operacao terceirizada e parceiros de entrega.' : 'Third-party operations and delivery partners.',
      advancedGroupLabel,
      CircleHelp,
      false,
    ),
    products: createItem(
      'products',
      isPortuguese ? 'PDV' : 'POS',
      isPortuguese ? 'PDV' : 'POS',
      isPortuguese ? 'Catalogo, atendimento e venda assistida.' : 'Catalog, checkout and assisted sales.',
      advancedGroupLabel,
      TrendingUp,
      false,
    ),
    inventory: createItem(
      'inventory',
      isPortuguese ? 'Estoque' : 'Inventory',
      isPortuguese ? 'Estoque' : 'Inventory',
      isPortuguese ? 'Saldo, reposicao e ruptura operacional.' : 'Stock, replenishment and stockout monitoring.',
      advancedGroupLabel,
      Shield,
      false,
    ),
    intelligence: createItem(
      'intelligence',
      isPortuguese ? 'Inteligencia' : 'Intelligence',
      isPortuguese ? 'Inteligencia' : 'Intel',
      isPortuguese ? 'Alertas, leitura executiva e saude da operacao.' : 'Alerts, executive readout and operational health.',
      advancedGroupLabel,
      CircleHelp,
      false,
    ),
    billing: createItem(
      'billing',
      isPortuguese ? 'Cobranca' : 'Billing',
      isPortuguese ? 'Cobranca' : 'Billing',
      isPortuguese ? 'Planos, faturamento e monetizacao.' : 'Plans, billing and monetization.',
      advancedGroupLabel,
      Wallet,
      false,
    ),
    growth: createItem(
      'growth',
      isPortuguese ? 'Crescimento' : 'Growth',
      isPortuguese ? 'Crescimento' : 'Growth',
      isPortuguese ? 'Aquisicao, canais e retorno de investimento.' : 'Acquisition, channels and return on investment.',
      advancedGroupLabel,
      TrendingUp,
      false,
    ),
    help: createItem(
      'help',
      isPortuguese ? 'Ajuda' : 'Help',
      isPortuguese ? 'Ajuda' : 'Help',
      isPortuguese ? 'Guias, suporte e orientacao de uso.' : 'Guides, support and usage guidance.',
      advancedGroupLabel,
      CircleHelp,
      false,
    ),
    sponsors: createItem(
      'sponsors',
      isPortuguese ? 'Patrocinios' : 'Sponsors',
      isPortuguese ? 'Patrocinios' : 'Sponsors',
      isPortuguese ? 'Relacionamento comercial com patrocinadores.' : 'Commercial relationship with sponsors.',
      advancedGroupLabel,
      CircleHelp,
      false,
    ),
  }

  return hiddenItems[section]
}

export function getSectionBreadcrumbs(section: NavSection, isPortuguese: boolean) {
  const sectionMeta = getSectionMeta(section, isPortuguese)

  return [
    { label: isPortuguese ? 'Dashboard' : 'Dashboard', current: false },
    { label: sectionMeta.label, current: true },
  ]
}
