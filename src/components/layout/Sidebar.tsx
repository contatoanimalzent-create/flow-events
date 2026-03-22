import {
  LayoutDashboard, CalendarDays, Ticket, ScanLine, Users,
  Truck, ShoppingBag, Package, MessageSquare, DollarSign,
  Zap, HelpCircle, Settings, ChevronLeft, ChevronRight,
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/lib/store/auth'
import { getInitials } from '@/lib/utils'
import type { NavSection } from './AppShell'

interface SidebarProps {
  activeSection: NavSection
  onNavigate: (section: NavSection) => void
  isOpen: boolean
  onToggle: () => void
}

interface NavItem { id: NavSection; label: string; icon: React.ElementType }
interface NavGroup { label: string; items: NavItem[] }

const navGroups: NavGroup[] = [
  {
    label: 'Visão Geral',
    items: [
      { id: 'dashboard', label: 'Dashboard',    icon: LayoutDashboard },
      { id: 'events',    label: 'Eventos',       icon: CalendarDays },
    ],
  },
  {
    label: 'Vendas & Ingressos',
    items: [
      { id: 'tickets', label: 'Ingressos',  icon: Ticket },
      { id: 'sales',   label: 'Vendas',     icon: TrendingUp },
    ],
  },
  {
    label: 'Operações',
    items: [
      { id: 'checkin',   label: 'Check-in',     icon: ScanLine },
      { id: 'staff',     label: 'Staff',         icon: Users },
      { id: 'suppliers', label: 'Fornecedores',  icon: Truck },
    ],
  },
  {
    label: 'Loja & Estoque',
    items: [
      { id: 'products',  label: 'Produtos & PDV', icon: ShoppingBag },
      { id: 'inventory', label: 'Estoque',         icon: Package },
    ],
  },
  {
    label: 'Crescimento',
    items: [
      { id: 'communication', label: 'Comunicação', icon: MessageSquare },
      { id: 'financial',     label: 'Financeiro',  icon: DollarSign },
      { id: 'growth',        label: 'Growth AI',   icon: Zap },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { id: 'settings', label: 'Configurações', icon: Settings },
      { id: 'help',     label: 'Ajuda',          icon: HelpCircle },
    ],
  },
]

export function Sidebar({ activeSection, onNavigate, isOpen, onToggle }: SidebarProps) {
  const { profile, organization } = useAuthStore()

  return (
    <aside className={cn('flex flex-col bg-bg-secondary border-r border-bg-border transition-all duration-300 shrink-0 relative z-20', isOpen ? 'w-60' : 'w-16')}>
      {/* Logo */}
      <div className={cn('flex items-center border-b border-bg-border shrink-0', isOpen ? 'px-5 py-4 gap-3' : 'px-4 py-4 justify-center')}>
        <div className="w-7 h-7 rounded-sm bg-brand-acid flex items-center justify-center shrink-0">
          <span className="font-display text-bg-primary leading-none" style={{ fontSize: 13 }}>F</span>
        </div>
        {isOpen && (
          <div className="animate-fade-in min-w-0">
            <div className="font-display text-xl leading-none text-text-primary tracking-wide">
              FLOW<span className="text-brand-acid">.</span>EVENTS
            </div>
            <div className="text-[10px] text-text-muted truncate mt-0.5 font-mono tracking-widest uppercase">
              {organization?.name ?? 'Plataforma'}
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {isOpen ? (
          navGroups.map((group) => (
            <div key={group.label} className="mb-3">
              <div className="px-3 mb-1 text-[9px] font-mono tracking-[0.15em] uppercase text-text-muted/50 select-none">
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
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all duration-150 mb-0.5',
                      isActive
                        ? 'bg-brand-acid/10 text-brand-acid'
                        : 'text-text-muted hover:text-text-primary hover:bg-bg-surface'
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-sm font-medium truncate flex-1 text-left">{item.label}</span>
                    {isActive && <span className="w-1 h-1 rounded-full bg-brand-acid shrink-0" />}
                  </button>
                )
              })}
            </div>
          ))
        ) : (
          // Collapsed: all icons flat
          navGroups.flatMap(g => g.items).map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                title={item.label}
                className={cn(
                  'w-full flex justify-center p-2.5 rounded-sm transition-all duration-150 mb-0.5',
                  isActive
                    ? 'bg-brand-acid/10 text-brand-acid'
                    : 'text-text-muted hover:text-text-primary hover:bg-bg-surface'
                )}
              >
                <Icon className="w-5 h-5" />
              </button>
            )
          })
        )}
      </nav>

      {/* Profile */}
      <div className={cn('border-t border-bg-border shrink-0', isOpen ? 'p-4' : 'p-2')}>
        {isOpen ? (
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-sm bg-brand-purple/20 flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-brand-purple">
                {getInitials(`${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`)}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-text-primary truncate">{profile?.first_name} {profile?.last_name}</div>
              <div className="text-xs text-text-muted truncate capitalize">{profile?.role?.replace(/_/g, ' ')}</div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-sm bg-brand-purple/20 flex items-center justify-center">
              <span className="text-xs font-semibold text-brand-purple">
                {getInitials(`${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-bg-card border border-bg-border flex items-center justify-center text-text-muted hover:text-brand-acid hover:border-brand-acid/40 transition-all z-10"
      >
        {isOpen ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
      </button>
    </aside>
  )
}
