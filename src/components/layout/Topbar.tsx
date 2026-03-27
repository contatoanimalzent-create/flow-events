'use client'

import { useEffect, useState } from 'react'
import { Bell, Globe, LogOut, Menu, Search, X } from 'lucide-react'
import type { NavSection } from '@/app/layout'
import { AuditFeedPanel } from '@/features/audit'
import { useAccessControl } from '@/features/access-control'
import { NotificationsPanel, useNotificationsCenter } from '@/features/notifications'
import { useAuthStore } from '@/lib/store/auth'
import { useAppLocale } from '@/shared/i18n/app-locale'
import { logError } from '@/shared/lib'

function getSectionTitles(isPortuguese: boolean): Record<NavSection, string> {
  return {
    dashboard: 'Dashboard',
    events: isPortuguese ? 'Eventos' : 'Events',
    tickets: isPortuguese ? 'Ingressos e lotes' : 'Tickets & releases',
    sales: isPortuguese ? 'Vendas' : 'Sales',
    crm: isPortuguese ? 'CRM e clientes' : 'CRM & customers',
    checkin: isPortuguese ? 'Check-in operacional' : 'Operational check-in',
    staff: isPortuguese ? 'Equipe e operacao' : 'Staff & crew',
    suppliers: isPortuguese ? 'Fornecedores' : 'Suppliers',
    products: isPortuguese ? 'Produtos e PDV' : 'Products & POS',
    inventory: isPortuguese ? 'Estoque e inventario' : 'Inventory & stock',
    intelligence: isPortuguese ? 'Inteligencia' : 'Intelligence',
    communication: isPortuguese ? 'Comunicacao' : 'Communications',
    financial: isPortuguese ? 'Financeiro' : 'Financial',
    billing: isPortuguese ? 'Billing e monetizacao' : 'Billing & monetization',
    growth: isPortuguese ? 'Crescimento' : 'Growth services',
    help: isPortuguese ? 'Ajuda e treinamento' : 'Help & training',
    settings: isPortuguese ? 'Configuracoes' : 'Settings',
  }
}

interface TopbarProps {
  onMenuToggle: () => void
  activeSection: NavSection
}

export function Topbar({ onMenuToggle, activeSection }: TopbarProps) {
  const { signOut } = useAuthStore()
  const access = useAccessControl()
  const notifications = useNotificationsCenter()
  const { locale, setLocale, isPortuguese, t } = useAppLocale()
  const [showSearch, setShowSearch] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [panelTab, setPanelTab] = useState<'notifications' | 'activity'>('notifications')
  const [searchQuery, setSearchQuery] = useState('')
  const sectionTitles = getSectionTitles(isPortuguese)

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
      <header className="flex h-[72px] shrink-0 items-center gap-4 border-b border-[rgba(255,255,255,0.05)] bg-[linear-gradient(180deg,#0b0e13_0%,#090c11_100%)] px-6">
        <button
          onClick={onMenuToggle}
          className="rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] p-2 text-[#7b8390] transition-all hover:bg-[rgba(255,255,255,0.06)] hover:text-[#f5f7fa]"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#ff6a5c]">{access.role}</div>
          <h1 className="mt-0.5 font-display text-[1.9rem] font-semibold leading-none tracking-[-0.03em] text-[#f5f7fa]">
            {sectionTitles[activeSection]}
          </h1>
        </div>

        <div className="flex-1" />

        <button
          onClick={() => setShowSearch(true)}
          className="hidden items-center gap-2 rounded-full border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] px-4 py-2 text-sm text-[#7b8390] transition-all hover:border-[#ff2d2d]/30 hover:text-[#f5f7fa] md:flex"
        >
          <Search className="h-4 w-4" />
          <span>{t('Search...', 'Buscar...')}</span>
          <span className="rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-2 py-0.5 text-[11px]">
            Ctrl K
          </span>
        </button>

        <button
          onClick={() => setLocale(locale === 'en-US' ? 'pt-BR' : 'en-US')}
          className="inline-flex items-center gap-2 rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] text-[#7b8390] transition-all hover:border-[#ff2d2d]/30 hover:text-[#f5f7fa]"
          title={t('Switch language', 'Trocar idioma')}
        >
          <Globe className="h-4 w-4" />
          {locale === 'en-US' ? 'EN' : 'PT'}
        </button>

        <button
          onClick={() => setShowNotifications((current) => !current)}
          className="relative rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] p-2.5 text-[#7b8390] transition-all hover:bg-[rgba(255,255,255,0.06)] hover:text-[#f5f7fa]"
        >
          <Bell className="h-5 w-5" />
          {notifications.unreadCount > 0 ? (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 animate-pulse rounded-full bg-[#ff2d2d]" />
          ) : null}
        </button>

        <button
          onClick={signOut}
          className="rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] p-2.5 text-[#7b8390] transition-all hover:border-[#ff453a]/25 hover:text-[#ff453a]"
          title={t('Sign out', 'Sair')}
        >
          <LogOut className="h-5 w-5" />
        </button>
      </header>

      {showSearch ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-20 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#11141a] shadow-[0_24px_80px_rgba(0,0,0,0.7)]">
            <div className="flex items-center gap-3 border-b border-[rgba(255,255,255,0.06)] px-4 py-3">
              <Search className="h-5 w-5 text-[#7b8390]" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={(event) => { if (event.key === 'Enter') handleSearch() }}
                type="text"
                placeholder={t('Search events, tickets, customers...', 'Busque eventos, ingressos, clientes...')}
                className="flex-1 bg-transparent text-[#f5f7fa] outline-none placeholder:text-[#596271]"
              />
              <button
                onClick={() => setShowSearch(false)}
                className="rounded-full p-1.5 text-[#7b8390] hover:bg-[rgba(255,255,255,0.06)] hover:text-[#f5f7fa]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 text-center text-sm text-[#7b8390]">
              {searchQuery
                ? t('Search captured for future integration.', 'Busca registrada para integracao futura.')
                : t('Type to search', 'Digite para buscar')}
            </div>
          </div>
        </div>
      ) : null}

      {showNotifications ? (
        <div className="absolute right-6 top-[80px] z-40 w-[420px] overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#11141a] shadow-[0_24px_80px_rgba(0,0,0,0.7)]">
          <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] p-5">
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-[#ff6a5c]">{access.role}</div>
              <h3 className="mt-1 font-display text-2xl font-semibold leading-none tracking-[-0.03em] text-[#f5f7fa]">
                {t('Internal center', 'Centro interno')}
              </h3>
            </div>
            <button
              onClick={() => setShowNotifications(false)}
              className="rounded-full p-1.5 text-[#7b8390] hover:bg-[rgba(255,255,255,0.06)] hover:text-[#f5f7fa]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 border-b border-[rgba(255,255,255,0.06)] p-3">
            <button
              onClick={() => setPanelTab('notifications')}
              className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${
                panelTab === 'notifications'
                  ? 'bg-[#ff2d2d] text-[#f5f7fa] shadow-[0_6px_18px_rgba(255,45,45,0.28)]'
                  : 'text-[#7b8390] hover:bg-[rgba(255,255,255,0.06)] hover:text-[#f5f7fa]'
              }`}
            >
              {t('Notifications', 'Notificacoes')}
            </button>
            <button
              onClick={() => setPanelTab('activity')}
              className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${
                panelTab === 'activity'
                  ? 'bg-[rgba(255,255,255,0.08)] text-[#f5f7fa]'
                  : 'text-[#7b8390] hover:bg-[rgba(255,255,255,0.06)] hover:text-[#f5f7fa]'
              }`}
            >
              {t('Activity', 'Atividade')}
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
