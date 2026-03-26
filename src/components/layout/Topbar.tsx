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
  billing: 'Billing & Monetizacao',
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
      <header className="flex h-[76px] shrink-0 items-center gap-4 border-b border-bg-border/80 bg-[#fbf8f2]/92 px-6 backdrop-blur-xl">
        <button onClick={onMenuToggle} className="rounded-full border border-bg-border bg-white/80 p-2 text-text-muted transition-all hover:bg-white hover:text-text-primary">
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <div className="text-[11px] uppercase tracking-[0.28em] text-text-muted">{access.role}</div>
          <h1 className="mt-1 font-serif text-3xl font-semibold leading-none text-text-primary">{sectionTitles[activeSection]}</h1>
        </div>
        <div className="flex-1" />
        <button
          onClick={() => setShowSearch(true)}
          className="hidden items-center gap-2 rounded-full border border-bg-border bg-white/80 px-4 py-2.5 text-sm text-text-muted transition-all hover:border-brand-acid/30 hover:bg-white md:flex"
        >
          <Search className="h-4 w-4" />
          <span>Buscar...</span>
          <span className="rounded-full bg-bg-surface px-2 py-1 text-[11px]">Ctrl K</span>
        </button>
        <button
          onClick={() => setShowNotifications((current) => !current)}
          className="relative rounded-full border border-bg-border bg-white/80 p-2 text-text-muted transition-all hover:bg-white hover:text-text-primary"
        >
          <Bell className="h-5 w-5" />
          {notifications.unreadCount > 0 ? <span className="absolute right-1 top-1 h-2 w-2 animate-pulse rounded-full bg-status-error" /> : null}
        </button>
        <button onClick={signOut} className="rounded-full border border-bg-border bg-white/80 p-2 text-text-muted transition-all hover:border-status-error/25 hover:text-status-error" title="Sair">
          <LogOut className="h-5 w-5" />
        </button>
      </header>

      {showSearch ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-[#211d18]/18 pt-20 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-bg-border bg-bg-secondary shadow-[0_24px_80px_rgba(50,38,20,0.16)]">
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
              <button onClick={() => setShowSearch(false)} className="rounded-full p-1.5 text-text-muted hover:bg-white hover:text-text-primary">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 text-center text-sm text-text-muted">{searchQuery ? 'Pesquisa registrada para integracao futura.' : 'Digite para buscar'}</div>
          </div>
        </div>
      ) : null}

      {showNotifications ? (
        <div className="absolute right-6 top-[84px] z-40 w-[420px] rounded-2xl border border-bg-border bg-bg-secondary shadow-[0_24px_80px_rgba(50,38,20,0.16)]">
          <div className="flex items-center justify-between border-b border-bg-border p-5">
            <div>
              <div className="text-[11px] uppercase tracking-[0.28em] text-text-muted">{access.role}</div>
              <h3 className="mt-1 font-serif text-2xl font-semibold leading-none text-text-primary">Centro interno</h3>
            </div>
            <button onClick={() => setShowNotifications(false)} className="rounded-full p-1.5 text-text-muted hover:bg-white hover:text-text-primary">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 border-b border-bg-border p-3">
            <button
              onClick={() => setPanelTab('notifications')}
              className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${panelTab === 'notifications' ? 'bg-text-primary text-bg-secondary shadow-card' : 'text-text-muted hover:bg-white hover:text-text-primary'}`}
            >
              Notificacoes
            </button>
            <button
              onClick={() => setPanelTab('activity')}
              className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${panelTab === 'activity' ? 'bg-white text-text-primary shadow-card' : 'text-text-muted hover:bg-white hover:text-text-primary'}`}
            >
              Atividade
            </button>
          </div>
          <div className="max-h-[28rem] overflow-y-auto p-4">
            {panelTab === 'notifications' ? (
              <NotificationsPanel
                notifications={notifications.notifications}
                onMarkAsRead={notifications.markAsRead}
                pagination={notifications.pagination}
                onPageChange={notifications.setPage}
              />
            ) : (
              <AuditFeedPanel />
            )}
          </div>
        </div>
      ) : null}
    </>
  )
}
