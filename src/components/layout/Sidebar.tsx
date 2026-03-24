import {
  BrainCircuit,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  HelpCircle,
  LayoutDashboard,
  MessageSquare,
  Package,
  ScanLine,
  Settings,
  ShoppingBag,
  Ticket,
  TrendingUp,
  Truck,
  Users,
  Zap,
} from 'lucide-react'
import type { NavSection } from '@/app/layout'
import { useAccessControl } from '@/features/access-control'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/lib/store/auth'
import { getInitials } from '@/lib/utils'

interface SidebarProps {
  activeSection: NavSection
  onNavigate: (section: NavSection) => void
  isOpen: boolean
  onToggle: () => void
}

interface NavItem {
  id: NavSection
  label: string
  icon: React.ElementType
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    label: 'Visao Geral',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'events', label: 'Eventos', icon: CalendarDays },
    ],
  },
  {
    label: 'Vendas & Ingressos',
    items: [
      { id: 'tickets', label: 'Ingressos', icon: Ticket },
      { id: 'sales', label: 'Vendas', icon: TrendingUp },
      { id: 'crm', label: 'CRM', icon: Users },
    ],
  },
  {
    label: 'Operacoes',
    items: [
      { id: 'checkin', label: 'Check-in', icon: ScanLine },
      { id: 'staff', label: 'Staff', icon: Users },
      { id: 'suppliers', label: 'Fornecedores', icon: Truck },
    ],
  },
  {
    label: 'Loja & Estoque',
    items: [
      { id: 'products', label: 'Produtos & PDV', icon: ShoppingBag },
      { id: 'inventory', label: 'Estoque', icon: Package },
    ],
  },
  {
    label: 'Crescimento',
    items: [
      { id: 'intelligence', label: 'Intelligence', icon: BrainCircuit },
      { id: 'communication', label: 'Comunicacao', icon: MessageSquare },
      { id: 'financial', label: 'Financeiro', icon: DollarSign },
      { id: 'growth', label: 'Growth AI', icon: Zap },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { id: 'settings', label: 'Configuracoes', icon: Settings },
      { id: 'help', label: 'Ajuda', icon: HelpCircle },
    ],
  },
]

export function Sidebar({ activeSection, onNavigate, isOpen, onToggle }: SidebarProps) {
  const { profile, organization } = useAuthStore()
  const access = useAccessControl()
  const visibleGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => access.canAccessSection(item.id)),
    }))
    .filter((group) => group.items.length > 0)

  return (
    <aside className={cn('relative z-20 flex shrink-0 flex-col border-r border-bg-border bg-bg-secondary transition-all duration-300', isOpen ? 'w-60' : 'w-16')}>
      <div className={cn('flex shrink-0 items-center border-b border-bg-border', isOpen ? 'gap-3 px-5 py-4' : 'justify-center px-4 py-4')}>
        <div className="flex h-7 w-7 items-center justify-center rounded-sm bg-brand-acid shrink-0">
          <span className="font-display leading-none text-bg-primary" style={{ fontSize: 13 }}>
            A
          </span>
        </div>
        {isOpen ? (
          <div className="min-w-0 animate-fade-in">
            <div className="font-display text-xl leading-none tracking-wide text-text-primary">
              ANIMALZ<span className="text-brand-acid">.</span>EVENTS
            </div>
            <div className="mt-0.5 truncate text-[10px] font-mono uppercase tracking-widest text-text-muted">{organization?.name ?? 'Plataforma'}</div>
          </div>
        ) : null}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {isOpen
          ? visibleGroups.map((group) => (
              <div key={group.label} className="mb-3">
                <div className="mb-1 px-3 text-[9px] font-mono uppercase tracking-[0.15em] text-text-muted/50">{group.label}</div>
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive = activeSection === item.id

                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className={cn(
                        'mb-0.5 flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-left transition-all duration-150',
                        isActive ? 'bg-brand-acid/10 text-brand-acid' : 'text-text-muted hover:bg-bg-surface hover:text-text-primary',
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1 truncate text-sm font-medium">{item.label}</span>
                      {isActive ? <span className="h-1 w-1 shrink-0 rounded-full bg-brand-acid" /> : null}
                    </button>
                  )
                })}
              </div>
            ))
          : visibleGroups.flatMap((group) => group.items).map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  title={item.label}
                  className={cn(
                    'mb-0.5 flex w-full justify-center rounded-sm p-2.5 transition-all duration-150',
                    isActive ? 'bg-brand-acid/10 text-brand-acid' : 'text-text-muted hover:bg-bg-surface hover:text-text-primary',
                  )}
                >
                  <Icon className="h-5 w-5" />
                </button>
              )
            })}
      </nav>

      <div className={cn('shrink-0 border-t border-bg-border', isOpen ? 'p-4' : 'p-2')}>
        {isOpen ? (
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-brand-purple/20 shrink-0">
              <span className="text-xs font-semibold text-brand-purple">{getInitials(`${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`)}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-text-primary">
                {profile?.first_name} {profile?.last_name}
              </div>
              <div className="truncate text-xs capitalize text-text-muted">{access.role}</div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-brand-purple/20">
              <span className="text-xs font-semibold text-brand-purple">{getInitials(`${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`)}</span>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={onToggle}
        className="absolute -right-3 top-6 flex h-6 w-6 items-center justify-center rounded-full border border-bg-border bg-bg-card text-text-muted transition-all hover:border-brand-acid/40 hover:text-brand-acid"
      >
        {isOpen ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </button>
    </aside>
  )
}
