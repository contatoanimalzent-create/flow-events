'use client'

import { useEffect, useState } from 'react'
import { Bell, LogOut, Menu, Search, X } from 'lucide-react'
import type { NavSection } from '@/app/layout'
import { AuditFeedPanel } from '@/features/audit'
import { useAccessControl } from '@/features/access-control'
import { NotificationsPanel, useNotificationsCenter } from '@/features/notifications'
import { useAuthStore } from '@/lib/store/auth'
import { logError } from '@/shared/lib'

const sectionTitles: Record<NavSection, string> = {
  dashboard: 'Dashboard',
  events: 'Eventos',
  tickets: 'Ingressos & Lotes',
  sales: 'Vendas',
  crm: 'CRM & Customers',
  checkin: 'Check-in Operacional',
  staff: 'Staff & Equipe',
  suppliers: 'Fornecedores',
  products: 'Produtos & PDV',
  inventory: 'Estoque & Insumos',
  intelligence: 'Intelligence',
  communication: 'Comunicacao',
  financial: 'Financeiro',
  growth: 'Growth Services',
  help: 'Ajuda & Treinamento',
  settings: 'Configuracoes',
}

interface TopbarProps {
  onMenuToggle: () => void
  activeSection: NavSection
}

export function Topbar({ onMenuToggle, activeSection }: TopbarProps) {
  const { signOut } = useAuthStore()
  const access = useAccessControl()
  const notifications = useNotificationsCenter()
  const [showSearch, setShowSearch] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [panelTab, setPanelTab] = useState<'notifications' | 'activity'>('notifications')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault()
        setShowSearch(true)
      }

      if (event.key === 'Escape') {
        setShowSearch(false)
        setShowNotifications(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  function handleSearch() {
    if (!searchQuery.trim()) {
      return
    }

    logError(`Search not implemented: ${searchQuery}`, {
      scope: 'topbar',
      action: 'search',
    })
    setShowSearch(false)
  }

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-4 border-b border-bg-border bg-bg-secondary px-4">
        <button onClick={onMenuToggle} className="rounded-lg p-1.5 text-text-muted transition-all hover:bg-bg-card hover:text-text-primary">
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-sm font-semibold text-text-primary">{sectionTitles[activeSection]}</h1>
          <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted">{access.role}</div>
        </div>
        <div className="flex-1" />
        <button
          onClick={() => setShowSearch(true)}
          className="hidden items-center gap-2 rounded-lg border border-bg-border bg-bg-card px-3 py-1.5 text-sm text-text-muted transition-all hover:border-brand-acid/30 md:flex"
        >
          <Search className="h-4 w-4" />
          <span>Buscar...</span>
          <span className="rounded bg-bg-border px-1.5 py-0.5 text-xs">Ctrl K</span>
        </button>
        <button
          onClick={() => setShowNotifications((current) => !current)}
          className="relative rounded-lg p-1.5 text-text-muted transition-all hover:bg-bg-card hover:text-text-primary"
        >
          <Bell className="h-5 w-5" />
          {notifications.unreadCount > 0 ? <span className="absolute right-1 top-1 h-2 w-2 animate-pulse rounded-full bg-status-error" /> : null}
        </button>
        <button onClick={signOut} className="rounded-lg p-1.5 text-text-muted transition-all hover:bg-status-error/10 hover:text-status-error" title="Sair">
          <LogOut className="h-5 w-5" />
        </button>
      </header>

      {showSearch ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-20 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-xl border border-bg-border bg-bg-secondary shadow-2xl">
            <div className="flex items-center gap-3 border-b border-bg-border px-4 py-3">
              <Search className="h-5 w-5 text-text-muted" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleSearch()
                  }
                }}
                type="text"
                placeholder="Buscar eventos, ingressos, clientes..."
                className="flex-1 bg-transparent text-text-primary outline-none placeholder-text-muted"
              />
              <button onClick={() => setShowSearch(false)} className="rounded p-1 text-text-muted hover:bg-bg-card hover:text-text-primary">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 text-center text-text-muted">{searchQuery ? 'Pesquisa registrada para integracao futura.' : 'Digite para buscar'}</div>
          </div>
        </div>
      ) : null}

      {showNotifications ? (
        <div className="absolute right-4 top-14 z-40 w-[360px] rounded-lg border border-bg-border bg-bg-secondary shadow-xl">
          <div className="flex items-center justify-between border-b border-bg-border p-4">
            <div>
              <h3 className="font-semibold text-text-primary">Centro interno</h3>
              <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted">{access.role}</div>
            </div>
            <button onClick={() => setShowNotifications(false)} className="rounded p-1 text-text-muted hover:bg-bg-card hover:text-text-primary">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-1 border-b border-bg-border p-2">
            <button
              onClick={() => setPanelTab('notifications')}
              className={`rounded-sm px-3 py-1.5 text-xs font-medium transition-all ${panelTab === 'notifications' ? 'bg-brand-acid text-bg-primary' : 'text-text-muted hover:text-text-primary'}`}
            >
              Notificacoes
            </button>
            <button
              onClick={() => setPanelTab('activity')}
              className={`rounded-sm px-3 py-1.5 text-xs font-medium transition-all ${panelTab === 'activity' ? 'bg-brand-blue text-bg-primary' : 'text-text-muted hover:text-text-primary'}`}
            >
              Atividade
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto p-4">
            {panelTab === 'notifications' ? (
              <NotificationsPanel notifications={notifications.notifications} onMarkAsRead={notifications.markAsRead} />
            ) : (
              <AuditFeedPanel />
            )}
          </div>
        </div>
      ) : null}
    </>
  )
}
