import type { LucideIcon } from 'lucide-react'
import {
  BadgeCheck,
  BrainCircuit,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CircleHelp,
  Clock,
  ClipboardList,
  Globe,
  LayoutDashboard,
  Map,
  MessageSquare,
  ScanLine,
  Settings2,
  Shield,
  Sparkles,
  Tag,
  Ticket,
  TrendingUp,
  UsersRound,
  Wallet,
  Zap,
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
  | 'coupons'
  | 'waitlist'
  | 'organizations'
  | 'map'
  | 'community'
  | 'monetization'
  | 'audit'

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
    operation: isPortuguese ? 'Operacoes' : 'Operations',
    people: isPortuguese ? 'Pessoas & Acesso' : 'People & Access',
    business: isPortuguese ? 'Receita' : 'Revenue',
    system: isPortuguese ? 'Sistema' : 'System',
  }

  const labels2 = {
    intelligence: isPortuguese ? 'Inteligência & Dados' : 'Intelligence & Data',
  }

  return [
    {
      key: 'operation',
      label: labels.operation,
      items: [
        createItem('dashboard', isPortuguese ? 'Dashboard' : 'Dashboard', 'Dashboard',
          isPortuguese ? 'Visão executiva do sistema.' : 'Executive view of the system.', labels.operation, LayoutDashboard),
        createItem('events', isPortuguese ? 'Eventos' : 'Events', isPortuguese ? 'Eventos' : 'Events',
          isPortuguese ? 'Gestão central do portfolio de eventos.' : 'Central management for the event portfolio.', labels.operation, CalendarDays),
        createItem('tickets', isPortuguese ? 'Ingressos' : 'Tickets', isPortuguese ? 'Ingressos' : 'Tickets',
          isPortuguese ? 'Lotes, regras e disponibilidade comercial.' : 'Releases, rules and commercial availability.', labels.operation, Ticket),
        createItem('financial', isPortuguese ? 'Financeiro' : 'Financial', isPortuguese ? 'Financeiro' : 'Financial',
          isPortuguese ? 'Receita, repasses e leitura financeira.' : 'Revenue, payouts and financial readouts.', labels.operation, Wallet),
        createItem('map', isPortuguese ? 'Mapa Operacional' : 'Operational Map', isPortuguese ? 'Mapa' : 'Map',
          isPortuguese ? 'Visualizacao em tempo real de zonas, staff e densidade.' : 'Real-time zones, staff and density visualization.', labels.operation, Map),
      ],
    },
    {
      key: 'people',
      label: labels.people,
      items: [
        createItem('registrations', isPortuguese ? 'Credenciamento' : 'Credentialing', isPortuguese ? 'Credenciamento' : 'Credentialing',
          isPortuguese ? 'Listas, emissoes e fluxos de habilitacao.' : 'Lists, badge issuing and enablement flows.', labels.people, BadgeCheck),
        createItem('staff', isPortuguese ? 'Equipe' : 'Team', isPortuguese ? 'Equipe' : 'Team',
          isPortuguese ? 'Pessoas, cargos e operação de campo.' : 'People, roles and field operations.', labels.people, BriefcaseBusiness),
        createItem('checkin', isPortuguese ? 'Check-in' : 'Check-in', 'Check-in',
          isPortuguese ? 'Leitura, filas e válidação em campo.' : 'Scanning, queues and field validation.', labels.people, ScanLine),
      ],
    },
    {
      key: 'business',
      label: labels.business,
      items: [
        createItem('crm', 'CRM', 'CRM',
          isPortuguese ? 'Relacionamento com público e recorrência.' : 'Audience relationship and retention.', labels.business, UsersRound),
        createItem('community', isPortuguese ? 'Comunidade' : 'Community', isPortuguese ? 'Comunidade' : 'Community',
          isPortuguese ? 'Feed, posts, reacoes e networking pós-evento.' : 'Feed, posts, reactions and post-event networking.', labels.business, Globe),
        createItem('monetization', isPortuguese ? 'Monetizacao' : 'Monetization', isPortuguese ? 'Monetizacao' : 'Monetization',
          isPortuguese ? 'Upgrades, experiências premium e ativacoes internas.' : 'Upgrades, premium experiences and internal activations.', labels.business, Sparkles),
        createItem('communication', isPortuguese ? 'Comunicacao' : 'Communication', isPortuguese ? 'Comunicacao' : 'Communication',
          isPortuguese ? 'Mensagens, campanhas e operação de comunicacao.' : 'Messages, campaigns and communication operations.', labels.business, MessageSquare),
        createItem('coupons', isPortuguese ? 'Cupons' : 'Coupons', isPortuguese ? 'Cupons' : 'Coupons',
          isPortuguese ? 'Codigos promocionais e descontos estrategicos.' : 'Promo codes and strategic discounts.', labels.business, Tag),
        createItem('waitlist', isPortuguese ? 'Lista de Espera' : 'Waitlist', isPortuguese ? 'Lista de Espera' : 'Waitlist',
          isPortuguese ? 'Demanda reprimida e conversão de fila.' : 'Suppressed demand and queue conversion.', labels.business, Clock),
      ],
    },
    {
      key: 'intelligence',
      label: labels2.intelligence,
      items: [
        createItem('intelligence', isPortuguese ? 'IA Operacional' : 'AI Operational', isPortuguese ? 'IA' : 'AI',
          isPortuguese ? 'Alertas, recomendações e previsões em tempo real.' : 'Real-time alerts, recommendations and forecasts.', labels2.intelligence, BrainCircuit),
        createItem('audit', isPortuguese ? 'Auditoria' : 'Audit', isPortuguese ? 'Auditoria' : 'Audit',
          isPortuguese ? 'Logs, segurança, webhooks e histórico de ações.' : 'Logs, security, webhooks and action history.', labels2.intelligence, ClipboardList),
      ],
    },
    {
      key: 'system',
      label: labels.system,
      items: [
        createItem('organizations', isPortuguese ? 'Organizacao' : 'Organization', isPortuguese ? 'Org' : 'Org',
          isPortuguese ? 'Dados, membros, permissões e integrações da org.' : 'Org data, members, permissions and integrations.', labels.system, Building2),
        createItem('settings', isPortuguese ? 'Configuracoes' : 'Settings', isPortuguese ? 'Configuracoes' : 'Settings',
          isPortuguese ? 'Preferências, governança e ajustes da conta.' : 'Preferences, governance and account settings.', labels.system, Settings2),
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

  const advancedGroupLabel = isPortuguese ? 'Módulos conectados' : 'Connected modules'
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
      isPortuguese ? 'Pedidos, conversão e performance comercial.' : 'Orders, conversion and sales performance.',
      advancedGroupLabel,
      TrendingUp,
      false,
    ),
    suppliers: createItem(
      'suppliers',
      isPortuguese ? 'Fornecedores' : 'Suppliers',
      isPortuguese ? 'Fornecedores' : 'Suppliers',
      isPortuguese ? 'Operação terceirizada e parceiros de entrega.' : 'Third-party operations and delivery partners.',
      advancedGroupLabel,
      CircleHelp,
      false,
    ),
    products: createItem(
      'products',
      isPortuguese ? 'PDV' : 'POS',
      isPortuguese ? 'PDV' : 'POS',
      isPortuguese ? 'Catálogo, atendimento e venda assistida.' : 'Catalog, checkout and assisted sales.',
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
      isPortuguese ? 'Inteligência' : 'Intelligence',
      isPortuguese ? 'Inteligência' : 'Intel',
      isPortuguese ? 'Alertas, leitura executiva e saude da operação.' : 'Alerts, executive readout and operational health.',
      advancedGroupLabel,
      CircleHelp,
      false,
    ),
    billing: createItem(
      'billing',
      isPortuguese ? 'Cobranca' : 'Billing',
      isPortuguese ? 'Cobranca' : 'Billing',
      isPortuguese ? 'Planos, faturamento e monetização.' : 'Plans, billing and monetization.',
      advancedGroupLabel,
      Wallet,
      false,
    ),
    growth: createItem(
      'growth',
      isPortuguese ? 'Crescimento' : 'Growth',
      isPortuguese ? 'Crescimento' : 'Growth',
      isPortuguese ? 'Aquisição, canais e retorno de investimento.' : 'Acquisition, channels and return on investment.',
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
    coupons: createItem(
      'coupons',
      isPortuguese ? 'Cupons' : 'Coupons',
      isPortuguese ? 'Cupons' : 'Coupons',
      isPortuguese ? 'Codigos promocionais e descontos estrategicos.' : 'Promo codes and strategic discounts.',
      advancedGroupLabel,
      Tag,
      false,
    ),
    waitlist: createItem('waitlist', isPortuguese ? 'Lista de Espera' : 'Waitlist', isPortuguese ? 'Lista de Espera' : 'Waitlist',
      isPortuguese ? 'Demanda reprimida e conversão de fila.' : 'Suppressed demand and queue conversion.', advancedGroupLabel, Clock, false),
    organizations: createItem('organizations', isPortuguese ? 'Organizacao' : 'Organization', isPortuguese ? 'Org' : 'Org',
      isPortuguese ? 'Dados, membros, permissões e integrações da org.' : 'Org data, members, permissions and integrations.', advancedGroupLabel, Building2, false),
    map: createItem('map', isPortuguese ? 'Mapa Operacional' : 'Operational Map', isPortuguese ? 'Mapa' : 'Map',
      isPortuguese ? 'Visualizacao em tempo real de zonas, staff e densidade.' : 'Real-time zones, staff and density.', advancedGroupLabel, Map, false),
    community: createItem('community', isPortuguese ? 'Comunidade' : 'Community', isPortuguese ? 'Comunidade' : 'Community',
      isPortuguese ? 'Feed, posts, reacoes e networking pós-evento.' : 'Feed, posts, reactions and post-event networking.', advancedGroupLabel, Globe, false),
    monetization: createItem('monetization', isPortuguese ? 'Monetizacao' : 'Monetization', isPortuguese ? 'Monetizacao' : 'Monetization',
      isPortuguese ? 'Upgrades, experiências premium e ativacoes internas.' : 'Upgrades, premium experiences and activations.', advancedGroupLabel, Sparkles, false),
    audit: createItem('audit', isPortuguese ? 'Auditoria' : 'Audit', isPortuguese ? 'Auditoria' : 'Audit',
      isPortuguese ? 'Logs, segurança, webhooks e histórico de ações.' : 'Logs, security, webhooks and action history.', advancedGroupLabel, ClipboardList, false),
  }

  return hiddenItems[section]
}

export function getSectionBreadcrumbs(section: NavSection, isPortuguese: boolean) {
  const sectionMeta = getSectionMeta(section, isPortuguese)

  if (section === 'dashboard') {
    return [{ label: sectionMeta.label, current: true }]
  }

  return [
    { label: isPortuguese ? 'Dashboard' : 'Dashboard', current: false },
    { label: sectionMeta.label, current: true },
  ]
}
