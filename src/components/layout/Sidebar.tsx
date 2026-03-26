import {
  BrainCircuit,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  HelpCircle,
  LayoutDashboard,
  WalletCards,
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
      { id: 'billing', label: 'Billing', icon: WalletCards },
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
    <aside className={cn('relative z-20 flex shrink-0 flex-col border-r border-bg-border bg-[#fbf8f2]/92 backdrop-blur-xl transition-all duration-300', isOpen ? 'w-72' : 'w-20')}>
      <div className={cn('flex shrink-0 items-center border-b border-bg-border/80', isOpen ? 'gap-4 px-6 py-5' : 'justify-center px-4 py-5')}>
        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-brand-acid/20 bg-white shadow-card shrink-0">
          <span className="font-serif text-xl font-semibold leading-none text-brand-acid">A</span>
        </div>
        {isOpen ? (
          <div className="min-w-0 animate-fade-in">
            <div className="font-serif text-2xl font-semibold leading-none text-text-primary">
              Animalz Events
            </div>
            <div className="mt-1 truncate text-[11px] uppercase tracking-[0.26em] text-text-muted">{organization?.name ?? 'Plataforma'}</div>
          </div>
        ) : null}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {isOpen
          ? visibleGroups.map((group) => (
              <div key={group.label} className="mb-5">
                <div className="mb-2 px-3 text-[10px] uppercase tracking-[0.24em] text-text-muted">{group.label}</div>
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive = activeSection === item.id

                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className={cn(
                        'mb-1 flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left transition-all duration-200',
                        isActive ? 'bg-white text-text-primary shadow-card' : 'text-text-muted hover:bg-white/85 hover:text-text-primary',
                      )}
                    >
                      <div className={cn('flex h-9 w-9 items-center justify-center rounded-full shrink-0', isActive ? 'bg-brand-acid/12 text-brand-acid' : 'bg-bg-surface text-text-muted')}>
                        <Icon className="h-4 w-4 shrink-0" />
                      </div>
                      <span className="flex-1 truncate text-sm font-medium">{item.label}</span>
                      {isActive ? <span className="h-2 w-2 shrink-0 rounded-full bg-brand-acid" /> : null}
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
                    'mb-1 flex w-full justify-center rounded-xl p-3 transition-all duration-200',
                    isActive ? 'bg-white text-brand-acid shadow-card' : 'text-text-muted hover:bg-white hover:text-text-primary',
                  )}
                >
                  <Icon className="h-5 w-5" />
                </button>
              )
            })}
      </nav>

      <div className={cn('shrink-0 border-t border-bg-border/80', isOpen ? 'p-5' : 'p-3')}>
        {isOpen ? (
          <div className="surface-panel flex items-center gap-3 p-3 animate-fade-in">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-purple/14 shrink-0">
              <span className="text-xs font-semibold text-brand-purple">{getInitials(`${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`)}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-text-primary">
                {profile?.first_name} {profile?.last_name}
              </div>
              <div className="truncate text-[11px] capitalize text-text-muted">{access.role}</div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-purple/14">
              <span className="text-xs font-semibold text-brand-purple">{getInitials(`${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`)}</span>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={onToggle}
        className="absolute -right-3 top-8 flex h-7 w-7 items-center justify-center rounded-full border border-bg-border bg-white text-text-muted shadow-card transition-all hover:border-brand-acid/40 hover:text-brand-acid"
      >
        {isOpen ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </button>
    </aside>
  )
}
