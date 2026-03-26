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
    if (!searchQuery.trim()) return
    logError(`Search not implemented: ${searchQuery}`, { scope: 'topbar', action: 'search' })
    setShowSearch(false)
  }

  return (
    <>
      <header className="flex h-[72px] shrink-0 items-center gap-4 border-b border-[rgba(255,255,255,0.06)] bg-[#0d0c0b] px-6">
        <button
          onClick={onMenuToggle}
          className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-2 text-[#6a6058] transition-all hover:bg-[rgba(255,255,255,0.08)] hover:text-[#f0ebe2]"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#c49a50]">{access.role}</div>
          <h1 className="mt-0.5 font-serif text-[1.8rem] font-semibold leading-none text-[#f0ebe2]">
            {sectionTitles[activeSection]}
          </h1>
        </div>

        <div className="flex-1" />

        <button
          onClick={() => setShowSearch(true)}
          className="hidden items-center gap-2 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-4 py-2 text-sm text-[#6a6058] transition-all hover:border-[#c49a50]/30 hover:text-[#f0ebe2] md:flex"
        >
          <Search className="h-4 w-4" />
          <span>Buscar...</span>
          <span className="rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-2 py-0.5 text-[11px]">
            Ctrl K
          </span>
        </button>

        <button
          onClick={() => setShowNotifications((current) => !current)}
          className="relative rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-2.5 text-[#6a6058] transition-all hover:bg-[rgba(255,255,255,0.08)] hover:text-[#f0ebe2]"
        >
          <Bell className="h-5 w-5" />
          {notifications.unreadCount > 0 ? (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 animate-pulse rounded-full bg-[#c49a50]" />
          ) : null}
        </button>

        <button
          onClick={signOut}
          className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-2.5 text-[#6a6058] transition-all hover:border-[#c45c6a]/25 hover:text-[#c45c6a]"
          title="Sair"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </header>

      {showSearch ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-20 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#131110] shadow-[0_24px_80px_rgba(0,0,0,0.7)]">
            <div className="flex items-center gap-3 border-b border-[rgba(255,255,255,0.06)] px-4 py-3">
              <Search className="h-5 w-5 text-[#6a6058]" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={(event) => { if (event.key === 'Enter') handleSearch() }}
                type="text"
                placeholder="Buscar eventos, ingressos, clientes..."
                className="flex-1 bg-transparent text-[#f0ebe2] outline-none placeholder:text-[#4a4540]"
              />
              <button
                onClick={() => setShowSearch(false)}
                className="rounded-full p-1.5 text-[#6a6058] hover:bg-[rgba(255,255,255,0.06)] hover:text-[#f0ebe2]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 text-center text-sm text-[#6a6058]">
              {searchQuery ? 'Pesquisa registrada para integracao futura.' : 'Digite para buscar'}
            </div>
          </div>
        </div>
      ) : null}

      {showNotifications ? (
        <div className="absolute right-6 top-[80px] z-40 w-[420px] overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#131110] shadow-[0_24px_80px_rgba(0,0,0,0.7)]">
          <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] p-5">
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-[#c49a50]">{access.role}</div>
              <h3 className="mt-1 font-serif text-2xl font-semibold leading-none text-[#f0ebe2]">
                Centro interno
              </h3>
            </div>
            <button
              onClick={() => setShowNotifications(false)}
              className="rounded-full p-1.5 text-[#6a6058] hover:bg-[rgba(255,255,255,0.06)] hover:text-[#f0ebe2]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 border-b border-[rgba(255,255,255,0.06)] p-3">
            <button
              onClick={() => setPanelTab('notifications')}
              className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${
                panelTab === 'notifications'
                  ? 'bg-[#c49a50] text-[#0a0908] shadow-[0_4px_12px_rgba(196,154,80,0.3)]'
                  : 'text-[#6a6058] hover:bg-[rgba(255,255,255,0.06)] hover:text-[#f0ebe2]'
              }`}
            >
              Notificacoes
            </button>
            <button
              onClick={() => setPanelTab('activity')}
              className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${
                panelTab === 'activity'
                  ? 'bg-[rgba(255,255,255,0.08)] text-[#f0ebe2]'
                  : 'text-[#6a6058] hover:bg-[rgba(255,255,255,0.06)] hover:text-[#f0ebe2]'
              }`}
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
