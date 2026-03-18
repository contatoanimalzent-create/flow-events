import { Menu, Bell, Search, LogOut, Zap } from 'lucide-react'
import { useAuthStore } from '@/lib/store/auth'
import type { NavSection } from './AppShell'

const sectionTitles: Record<NavSection, string> = {
  dashboard:     'Dashboard',
  events:        'Eventos',
  sales:         'Vendas',
  checkin:       'Check-in',
  credentialing: 'Credenciamento',
  staff:         'Staff',
  suppliers:     'Fornecedores',
  products:      'Produtos & PDV',
  inventory:     'Estoque & Insumos',
  communication: 'Comunicação',
  financial:     'Financeiro',
  growth:        'Growth Services',
  help:          'Ajuda & Treinamento',
  settings:      'Configurações',
}

interface TopbarProps {
  onMenuToggle: () => void
  activeSection: NavSection
}

export function Topbar({ onMenuToggle, activeSection }: TopbarProps) {
  const { signOut } = useAuthStore()

  return (
    <header className="h-14 bg-bg-secondary border-b border-bg-border flex items-center px-4 gap-3 shrink-0">

      <button
        onClick={onMenuToggle}
        className="p-1.5 rounded-sm text-text-muted hover:text-text-primary hover:bg-bg-surface transition-all"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Section title */}
      <div className="flex items-center gap-2">
        <span className="text-text-muted text-xs font-mono tracking-widest uppercase">Flow</span>
        <span className="text-text-muted text-xs">/</span>
        <span className="text-sm font-medium text-text-primary">
          {sectionTitles[activeSection]}
        </span>
      </div>

      <div className="flex-1" />

      {/* Search */}
      <button className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-bg-surface border border-bg-border
                         rounded-sm text-xs text-text-muted hover:border-brand-acid/25 transition-all group">
        <Search className="w-3.5 h-3.5 group-hover:text-brand-acid transition-colors" />
        <span>Buscar...</span>
        <span className="text-[10px] bg-bg-border px-1.5 py-0.5 rounded-sm font-mono">⌘K</span>
      </button>

      {/* Live indicator */}
      <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-status-success/8 border border-status-success/15 rounded-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse-slow" />
        <span className="text-[11px] text-status-success font-mono tracking-wide">LIVE</span>
      </div>

      {/* Notifications */}
      <button className="relative p-1.5 rounded-sm text-text-muted hover:text-text-primary hover:bg-bg-surface transition-all">
        <Bell className="w-4 h-4" />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-status-error rounded-full" />
      </button>

      {/* Sign out */}
      <button
        onClick={signOut}
        className="p-1.5 rounded-sm text-text-muted hover:text-status-error hover:bg-status-error/8 transition-all"
        title="Sair"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </header>
  )
}