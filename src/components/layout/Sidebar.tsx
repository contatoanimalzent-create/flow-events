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
    <aside
      className={cn(
        'relative z-20 flex shrink-0 flex-col border-r transition-all duration-300',
        'bg-[#0d0c0b] border-[rgba(255,255,255,0.06)]',
        isOpen ? 'w-72' : 'w-20',
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex shrink-0 items-center border-b border-[rgba(255,255,255,0.06)]',
          isOpen ? 'gap-4 px-6 py-5' : 'justify-center px-4 py-5',
        )}
      >
        {isOpen ? (
          <div className="flex items-center gap-3 animate-fade-in min-w-0">
            <img
              src="/logo.png"
              alt="Animalz Events"
              className="h-10 w-auto shrink-0 object-contain"
              style={{ filter: 'drop-shadow(0 0 6px rgba(196,154,80,0.15))' }}
            />
            <div className="min-w-0">
              <div className="mt-1 truncate text-[10px] uppercase tracking-[0.26em] text-[#6a6058]">
                {organization?.name ?? 'Plataforma'}
              </div>
            </div>
          </div>
        ) : (
          <img
            src="/logo.png"
            alt="A"
            className="h-9 w-9 object-contain shrink-0"
            style={{ filter: 'drop-shadow(0 0 5px rgba(196,154,80,0.2))' }}
          />
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {isOpen
          ? visibleGroups.map((group) => (
              <div key={group.label} className="mb-6">
                <div className="mb-2 px-3 text-[10px] uppercase tracking-[0.28em] text-[#4a4540]">
                  {group.label}
                </div>
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive = activeSection === item.id

                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className={cn(
                        'mb-1 flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left transition-all duration-200',
                        isActive
                          ? 'bg-[#c49a50]/12 text-[#f0ebe2] border border-[#c49a50]/20'
                          : 'text-[#6a6058] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#f0ebe2]',
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-lg shrink-0 transition-colors duration-200',
                          isActive ? 'bg-[#c49a50]/18 text-[#c49a50]' : 'bg-transparent text-[#6a6058]',
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                      </div>
                      <span className="flex-1 truncate text-sm font-medium">{item.label}</span>
                      {isActive ? (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#c49a50]" />
                      ) : null}
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
                    isActive
                      ? 'bg-[#c49a50]/15 text-[#c49a50] border border-[#c49a50]/20'
                      : 'text-[#6a6058] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#f0ebe2]',
                  )}
                >
                  <Icon className="h-5 w-5" />
                </button>
              )
            })}
      </nav>

      {/* User profile */}
      <div className={cn('shrink-0 border-t border-[rgba(255,255,255,0.06)]', isOpen ? 'p-4' : 'p-3')}>
        {isOpen ? (
          <div
            className="flex items-center gap-3 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.04)] p-3 animate-fade-in"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#9b8ab8]/18 shrink-0">
              <span className="text-xs font-semibold text-[#9b8ab8]">
                {getInitials(`${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`)}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-[#f0ebe2]">
                {profile?.first_name} {profile?.last_name}
              </div>
              <div className="truncate text-[11px] capitalize text-[#6a6058]">{access.role}</div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#9b8ab8]/18">
              <span className="text-xs font-semibold text-[#9b8ab8]">
                {getInitials(`${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-8 flex h-7 w-7 items-center justify-center rounded-full border border-[rgba(255,255,255,0.1)] bg-[#1c1a16] text-[#6a6058] shadow-card transition-all hover:border-[#c49a50]/40 hover:text-[#c49a50]"
      >
        {isOpen ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </button>
    </aside>
  )
}
