import type { LucideIcon } from 'lucide-react'
import {
  BellRing,
  CalendarDays,
  ClipboardCheck,
  CreditCard,
  LayoutDashboard,
  MessageSquareMore,
  ScanLine,
  Settings2,
  ShieldCheck,
  Ticket,
  Users,
  Wallet,
  BrainCircuit,
  CircleHelp,
  Handshake,
  Package,
  TrendingUp,
  UserRoundSearch,
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
    core: isPortuguese ? 'Nucleo operacional' : 'Operational core',
    access: isPortuguese ? 'Fluxo e acesso' : 'Flow and access',
    relationship: isPortuguese ? 'Receita e relacionamento' : 'Revenue and relationship',
    system: isPortuguese ? 'Sistema' : 'System',
  }

  return [
    {
      key: 'core',
      label: labels.core,
      items: [
        createItem(
          'dashboard',
          isPortuguese ? 'Dashboard' : 'Dashboard',
          isPortuguese ? 'Painel' : 'Panel',
          isPortuguese ? 'Visao executiva do produto e da operacao.' : 'Executive view of product and operations.',
          labels.core,
          LayoutDashboard,
        ),
        createItem(
          'events',
          isPortuguese ? 'Eventos' : 'Events',
          isPortuguese ? 'Eventos' : 'Events',
          isPortuguese ? 'Catalogo, agenda e controle central dos eventos.' : 'Catalog, schedule and central event control.',
          labels.core,
          CalendarDays,
        ),
        createItem(
          'tickets',
          isPortuguese ? 'Ingressos' : 'Tickets',
          isPortuguese ? 'Ingressos' : 'Tickets',
          isPortuguese ? 'Lotes, disponibilidade e regras de venda.' : 'Releases, availability and selling rules.',
          labels.core,
          Ticket,
        ),
      ],
    },
    {
      key: 'access',
      label: labels.access,
      items: [
        createItem(
          'registrations',
          isPortuguese ? 'Credenciamento' : 'Credentialing',
          isPortuguese ? 'Credenciamento' : 'Credentials',
          isPortuguese ? 'Listas, emissoes e fluxo de habilitacao.' : 'Lists, badge issuance and enablement flow.',
          labels.access,
          ShieldCheck,
        ),
        createItem(
          'staff',
          isPortuguese ? 'Equipe' : 'Team',
          isPortuguese ? 'Equipe' : 'Team',
          isPortuguese ? 'Pessoas, funcoes e distribuicao operacional.' : 'People, roles and operational allocation.',
          labels.access,
          Users,
        ),
        createItem(
          'checkin',
          isPortuguese ? 'Check-in' : 'Check-in',
          isPortuguese ? 'Check-in' : 'Check-in',
          isPortuguese ? 'Entrada, leitura e controle de acesso em campo.' : 'Entry, scanning and field access control.',
          labels.access,
          ScanLine,
        ),
      ],
    },
    {
      key: 'relationship',
      label: labels.relationship,
      items: [
        createItem(
          'financial',
          isPortuguese ? 'Financeiro' : 'Financial',
          isPortuguese ? 'Financeiro' : 'Finance',
          isPortuguese ? 'Receita, margem e leitura de resultado.' : 'Revenue, margin and outcome readout.',
          labels.relationship,
          Wallet,
        ),
        createItem(
          'crm',
          isPortuguese ? 'CRM' : 'CRM',
          isPortuguese ? 'CRM' : 'CRM',
          isPortuguese ? 'Base de publico, relacionamento e recorrencia.' : 'Audience base, relationship and retention.',
          labels.relationship,
          UserRoundSearch,
        ),
        createItem(
          'communication',
          isPortuguese ? 'Comunicacao' : 'Communication',
          isPortuguese ? 'Comunicacao' : 'Comms',
          isPortuguese ? 'Campanhas, jornadas e mensagens do produto.' : 'Campaigns, journeys and product messaging.',
          labels.relationship,
          MessageSquareMore,
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
          isPortuguese ? 'Marca, governanca e preferencias do sistema.' : 'Brand, governance and system preferences.',
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
      Handshake,
      false,
    ),
    products: createItem(
      'products',
      isPortuguese ? 'PDV' : 'POS',
      isPortuguese ? 'PDV' : 'POS',
      isPortuguese ? 'Catalogo, atendimento e venda assistida.' : 'Catalog, checkout and assisted sales.',
      advancedGroupLabel,
      CreditCard,
      false,
    ),
    inventory: createItem(
      'inventory',
      isPortuguese ? 'Estoque' : 'Inventory',
      isPortuguese ? 'Estoque' : 'Inventory',
      isPortuguese ? 'Saldo, reposicao e ruptura operacional.' : 'Stock, replenishment and stockout monitoring.',
      advancedGroupLabel,
      Package,
      false,
    ),
    intelligence: createItem(
      'intelligence',
      isPortuguese ? 'Inteligencia' : 'Intelligence',
      isPortuguese ? 'Inteligencia' : 'Intel',
      isPortuguese ? 'Alertas, leitura executiva e saude da operacao.' : 'Alerts, executive readout and operational health.',
      advancedGroupLabel,
      BrainCircuit,
      false,
    ),
    billing: createItem(
      'billing',
      isPortuguese ? 'Cobranca' : 'Billing',
      isPortuguese ? 'Cobranca' : 'Billing',
      isPortuguese ? 'Planos, faturamento e monetizacao.' : 'Plans, billing and monetization.',
      advancedGroupLabel,
      BellRing,
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
      ClipboardCheck,
      false,
    ),
  }

  return hiddenItems[section]
}

export function getSectionBreadcrumbs(section: NavSection, isPortuguese: boolean) {
  const sectionMeta = getSectionMeta(section, isPortuguese)

  return [
    { label: 'Pulse', current: false },
    { label: sectionMeta.groupLabel, current: false },
    { label: sectionMeta.label, current: true },
  ]
}
