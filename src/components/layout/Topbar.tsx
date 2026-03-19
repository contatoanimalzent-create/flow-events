import { Menu, Bell, Search, LogOut } from 'lucide-react'
import { useAuthStore } from '@/lib/store/auth'
import type { NavSection } from './AppShell'

const sectionTitles: Record<NavSection, string> = {
  dashboard:     'Dashboard',
  events:        'Eventos',
  tickets:       'Ingressos & Lotes',
  sales:         'Vendas',
  checkin:       'Check-in Operacional',
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
    <header className="h-14 bg-bg-secondary border-b border-bg-border flex items-center px-4 gap-4 shrink-0">
      <button
        onClick={onMenuToggle}
        className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-card transition-all"
      >
        <Menu className="w-5 h-5" />
      </button>

      <h1 className="text-sm font-semibold text-text-primary">
        {sectionTitles[activeSection]}
      </h1>

      <div className="flex-1" />

      <button className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-bg-card border border-bg-border
                         rounded-lg text-sm text-text-muted hover:border-brand-acid/30 transition-all">
        <Search className="w-4 h-4" />
        <span>Buscar...</span>
        <span className="text-xs bg-bg-border px-1.5 py-0.5 rounded">⌘K</span>
      </button>

      <button className="relative p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-card transition-all">
        <Bell className="w-5 h-5" />
        <span className="absolute top-1 right-1 w-2 h-2 bg-status-error rounded-full" />
      </button>

      <button
        onClick={signOut}
        className="p-1.5 rounded-lg text-text-muted hover:text-status-error hover:bg-status-error/10 transition-all"
        title="Sair"
      >
        <LogOut className="w-5 h-5" />
      </button>
    </header>
  )
}