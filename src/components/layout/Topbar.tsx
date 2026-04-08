'use client'

import { useEffect, useMemo, useState } from 'react'
import { Bell, Globe, LogOut, Menu, Search, X } from 'lucide-react'
import type { NavSection } from '@/app/layout'
import { AuditFeedPanel } from '@/features/audit'
import { useAccessControl } from '@/features/access-control'
import { NotificationsPanel, useNotificationsCenter } from '@/features/notifications'
import { useAuthStore } from '@/lib/store/auth'
import { cn } from '@/shared/lib'
import { useAppLocale } from '@/shared/i18n/app-locale'
import { logError } from '@/shared/lib'

interface TopbarProps {
  activeSection: NavSection
  onNavigate: (section: NavSection) => void
  onMenuToggle: () => void
}

function getPrimaryNav(isPortuguese: boolean): Array<{ id: NavSection; label: string }> {
  return [
    { id: 'dashboard', label: isPortuguese ? 'Painel' : 'Dashboard' },
    { id: 'events', label: isPortuguese ? 'Eventos' : 'Events' },
    { id: 'tickets', label: isPortuguese ? 'Ingressos' : 'Tickets' },
    { id: 'financial', label: isPortuguese ? 'Financeiro' : 'Financial' },
    { id: 'growth', label: isPortuguese ? 'Crescimento' : 'Growth' },
  ]
}

export function Topbar({ activeSection, onNavigate, onMenuToggle }: TopbarProps) {
  const { signOut } = useAuthStore()
  const access = useAccessControl()
  const notifications = useNotificationsCenter()
  const { locale, setLocale, isPortuguese, t } = useAppLocale()
  const [showSearch, setShowSearch] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [panelTab, setPanelTab] = useState<'notifications' | 'activity'>('notifications')
  const [searchQuery, setSearchQuery] = useState('')
  const primaryNav = useMemo(() => getPrimaryNav(isPortuguese), [isPortuguese])

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
      <header className="sticky top-0 z-30 border-b border-[#E5E7EB] bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[72px] w-full max-w-[1720px] items-center gap-4 px-5 md:px-8 lg:px-10">
          <a href="/" className="group flex min-w-0 items-center gap-3">
            <img
              src="/logo.png"
              alt="Pulse"
              className="h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
            />
            <div className="hidden min-w-0 xl:block">
              <div className="text-[10px] uppercase tracking-[0.42em] text-[#0057E7]">{access.role}</div>
              <div className="text-base font-bold leading-none tracking-[-0.02em] text-[#0A0A0A]">
                Pulse
              </div>
            </div>
          </a>

          <nav className="hidden flex-1 items-center justify-center gap-1 xl:flex">
            {primaryNav.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  'rounded-full px-5 py-2.5 text-[13px] font-medium transition-all duration-200',
                  activeSection === item.id
                    ? 'bg-[rgba(0,87,231,0.08)] text-[#0057E7]'
                    : 'text-[#44475A] hover:bg-[#F7F8FA] hover:text-[#0A0A0A]',
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setShowSearch(true)}
              className="hidden items-center gap-2 rounded-full border border-[#E5E7EB] bg-[#F7F8FA] px-4 py-2.5 text-sm text-[#9CA3AF] transition-all hover:border-[#D1D5DB] hover:text-[#0A0A0A] md:flex"
            >
              <Search className="h-4 w-4" />
              <span>{t('Search...', 'Buscar...')}</span>
              <span className="rounded-full border border-[#E5E7EB] bg-white px-2 py-0.5 text-[11px]">Ctrl K</span>
            </button>

            <button
              onClick={() => setLocale(locale === 'en-US' ? 'pt-BR' : 'en-US')}
              className="inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-4 py-2.5 text-xs font-medium uppercase tracking-[0.22em] text-[#44475A] transition-all hover:border-[#D1D5DB] hover:text-[#0A0A0A]"
              title={t('Switch language', 'Trocar idioma')}
            >
              <Globe className="h-4 w-4" />
              {locale === 'en-US' ? 'EN' : 'PT'}
            </button>

            <button
              onClick={() => setShowNotifications((current) => !current)}
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#44475A] transition-all hover:border-[#D1D5DB] hover:text-[#0A0A0A]"
            >
              <Bell className="h-4 w-4" />
              {notifications.unreadCount > 0 ? (
                <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-[#0057E7]" />
              ) : null}
            </button>

            <button
              onClick={signOut}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#44475A] transition-all hover:border-red-200 hover:text-[#EF4444]"
              title={t('Sign out', 'Sair')}
            >
              <LogOut className="h-4 w-4" />
            </button>

            <button
              onClick={onMenuToggle}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#0A0A0A] transition-all hover:border-[#D1D5DB] hover:bg-[#F7F8FA] lg:hidden"
              title={t('Open navigation', 'Abrir navegacao')}
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {showSearch ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 pt-24 backdrop-blur-sm">
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-strong">
            <div className="flex items-center gap-3 border-b border-[#E5E7EB] px-5 py-4">
              <Search className="h-5 w-5 text-[#0057E7]" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleSearch()
                }}
                type="text"
                placeholder={t('Search events, tickets, customers...', 'Busque eventos, ingressos, clientes...')}
                className="flex-1 bg-transparent text-[#0A0A0A] outline-none placeholder:text-[#9CA3AF]"
              />
              <button
                onClick={() => setShowSearch(false)}
                className="rounded-full p-2 text-[#9CA3AF] transition-all hover:bg-[#F7F8FA] hover:text-[#0A0A0A]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-5 py-10 text-center text-sm text-[#9CA3AF]">
              {searchQuery
                ? t('Search captured for future integration.', 'Busca registrada para integracao futura.')
                : t('Type to search', 'Digite para buscar')}
            </div>
          </div>
        </div>
      ) : null}

      {showNotifications ? (
        <div className="absolute right-6 top-[80px] z-40 w-[420px] overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-strong">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] px-5 py-5">
            <div>
              <div className="text-[10px] uppercase tracking-[0.34em] text-[#0057E7]">{access.role}</div>
              <h3 className="mt-2 text-xl font-bold leading-none tracking-[-0.02em] text-[#0A0A0A]">
                {t('Internal center', 'Centro interno')}
              </h3>
            </div>
            <button
              onClick={() => setShowNotifications(false)}
              className="rounded-full p-2 text-[#9CA3AF] transition-all hover:bg-[#F7F8FA] hover:text-[#0A0A0A]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 border-b border-[#E5E7EB] px-4 py-3">
            <button
              onClick={() => setPanelTab('notifications')}
              className={cn(
                'rounded-full px-4 py-2 text-xs font-medium transition-all',
                panelTab === 'notifications'
                  ? 'bg-[#0057E7] text-white'
                  : 'text-[#44475A] hover:bg-[#F7F8FA] hover:text-[#0A0A0A]',
              )}
            >
              {t('Notifications', 'Notificacoes')}
            </button>
            <button
              onClick={() => setPanelTab('activity')}
              className={cn(
                'rounded-full px-4 py-2 text-xs font-medium transition-all',
                panelTab === 'activity'
                  ? 'bg-[#0057E7] text-white'
                  : 'text-[#44475A] hover:bg-[#F7F8FA] hover:text-[#0A0A0A]',
              )}
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
