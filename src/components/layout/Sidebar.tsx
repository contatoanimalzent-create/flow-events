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
import { useAppLocale } from '@/shared/i18n/app-locale'

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

function createNavGroups(isPortuguese: boolean): NavGroup[] {
  return [
    {
      label: isPortuguese ? 'Visao geral' : 'Overview',
      items: [
        { id: 'dashboard', label: isPortuguese ? 'Painel' : 'Dashboard', icon: LayoutDashboard },
        { id: 'events', label: isPortuguese ? 'Eventos' : 'Events', icon: CalendarDays },
      ],
    },
    {
      label: isPortuguese ? 'Vendas e ingressos' : 'Sales & ticketing',
      items: [
        { id: 'tickets', label: isPortuguese ? 'Ingressos' : 'Tickets', icon: Ticket },
        { id: 'sales', label: isPortuguese ? 'Vendas' : 'Sales', icon: TrendingUp },
        { id: 'crm', label: isPortuguese ? 'Relacionamento' : 'CRM', icon: Users },
      ],
    },
    {
      label: isPortuguese ? 'Operacao' : 'Operations',
      items: [
        { id: 'checkin', label: isPortuguese ? 'Credenciamento' : 'Check-in', icon: ScanLine },
        { id: 'staff', label: isPortuguese ? 'Equipe' : 'Staff', icon: Users },
        { id: 'suppliers', label: isPortuguese ? 'Fornecedores' : 'Suppliers', icon: Truck },
      ],
    },
    {
      label: isPortuguese ? 'Comercio e estoque' : 'Commerce & inventory',
      items: [
        { id: 'products', label: isPortuguese ? 'Produtos e PDV' : 'Products & POS', icon: ShoppingBag },
        { id: 'inventory', label: isPortuguese ? 'Estoque' : 'Inventory', icon: Package },
      ],
    },
    {
      label: isPortuguese ? 'Crescimento' : 'Growth',
      items: [
        { id: 'intelligence', label: isPortuguese ? 'Inteligencia' : 'Intelligence', icon: BrainCircuit },
        { id: 'communication', label: isPortuguese ? 'Comunicacao' : 'Communications', icon: MessageSquare },
        { id: 'financial', label: isPortuguese ? 'Financeiro' : 'Financial', icon: DollarSign },
        { id: 'billing', label: isPortuguese ? 'Cobranca' : 'Billing', icon: WalletCards },
        { id: 'growth', label: isPortuguese ? 'Crescimento com IA' : 'Growth AI', icon: Zap },
      ],
    },
    {
      label: isPortuguese ? 'Sistema' : 'System',
      items: [
        { id: 'settings', label: isPortuguese ? 'Configuracoes' : 'Settings', icon: Settings },
        { id: 'help', label: isPortuguese ? 'Ajuda' : 'Help', icon: HelpCircle },
      ],
    },
  ]
}

export function Sidebar({ activeSection, onNavigate, isOpen, onToggle }: SidebarProps) {
  const { profile, organization } = useAuthStore()
  const access = useAccessControl()
  const { isPortuguese } = useAppLocale()
  const navGroups = createNavGroups(isPortuguese)
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
        'bg-[linear-gradient(180deg,rgba(14,12,11,0.96)_0%,rgba(7,6,7,0.98)_100%)] border-[rgba(255,255,255,0.05)]',
        isOpen ? 'w-72' : 'w-20',
      )}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-0 h-48 w-full bg-[radial-gradient(circle_at_top,rgba(214,42,11,0.07),transparent_62%)]" />
        <div className="absolute bottom-0 left-0 h-56 w-full bg-[radial-gradient(circle_at_bottom,rgba(174,147,111,0.08),transparent_68%)]" />
      </div>

      {/* Logo */}
      <div
        className={cn(
          'relative z-10 flex shrink-0 items-center border-b border-[rgba(255,255,255,0.06)]',
          isOpen ? 'gap-4 px-6 py-5' : 'justify-center px-4 py-5',
        )}
      >
        {isOpen ? (
          <div className="flex flex-col gap-2 animate-fade-in min-w-0 w-full">
            <img
              src="/logo.png"
              alt="Animalz Events"
              className="h-16 w-auto object-contain"
              style={{ filter: 'drop-shadow(0 0 12px rgba(174,147,111,0.22))' }}
            />
            <div className="truncate text-[10px] uppercase tracking-[0.26em] text-[#6f6660]">
              {organization?.name ?? (isPortuguese ? 'Plataforma' : 'Platform')}
            </div>
          </div>
        ) : (
          <img
            src="/logo.png"
            alt="A"
            className="w-12 h-auto object-contain"
            style={{ filter: 'drop-shadow(0 0 8px rgba(174,147,111,0.22))' }}
          />
        )}
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex-1 overflow-y-auto px-3 py-5">
        {isOpen
          ? visibleGroups.map((group) => (
              <div key={group.label} className="mb-6">
                <div className="mb-2 px-3 text-[10px] uppercase tracking-[0.32em] text-[#8e847d]">
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
                          ? 'border border-[#d62a0b]/22 bg-[linear-gradient(135deg,rgba(214,42,11,0.18),rgba(174,147,111,0.06))] text-[#ebe7e0] shadow-[0_12px_24px_rgba(214,42,11,0.08)]'
                          : 'text-[#8e847d] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#ebe7e0]',
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-lg shrink-0 transition-colors duration-200',
                          isActive ? 'bg-[#d62a0b]/16 text-[#d62a0b]' : 'bg-transparent text-[#8e847d]',
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                      </div>
                      <span className="flex-1 truncate text-sm font-medium">{item.label}</span>
                      {isActive ? (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#d62a0b]" />
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
                      ? 'border border-[#d62a0b]/22 bg-[#d62a0b]/12 text-[#d62a0b]'
                      : 'text-[#8e847d] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#ebe7e0]',
                  )}
                >
                  <Icon className="h-5 w-5" />
                </button>
              )
            })}
      </nav>

      {/* User profile */}
      <div className={cn('relative z-10 shrink-0 border-t border-[rgba(255,255,255,0.06)]', isOpen ? 'p-4' : 'p-3')}>
        {isOpen ? (
          <div
            className="flex items-center gap-3 rounded-[24px] border border-[rgba(255,255,255,0.06)] bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.02)_100%)] p-3.5 animate-fade-in shadow-[0_18px_44px_rgba(0,0,0,0.26)]"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d62a0b]/12 shrink-0">
              <span className="text-xs font-semibold text-[#d62a0b]">
                {getInitials(`${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`)}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-[#ebe7e0]">
                {profile?.first_name} {profile?.last_name}
              </div>
              <div className="truncate text-[11px] capitalize text-[#8e847d]">{access.role}</div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d62a0b]/12">
              <span className="text-xs font-semibold text-[#d62a0b]">
                {getInitials(`${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-8 flex h-7 w-7 items-center justify-center rounded-full border border-[rgba(255,255,255,0.08)] bg-[#12100f] text-[#8e847d] shadow-card transition-all hover:border-[#d62a0b]/35 hover:text-[#d62a0b]"
      >
        {isOpen ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </button>
    </aside>
  )
}
