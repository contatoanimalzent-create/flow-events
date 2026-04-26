import { useEffect, useRef, useState } from 'react'
import { Bell, LogOut, Menu, Settings as SettingsIcon, X } from 'lucide-react'
import { useAuthStore } from '@/features/auth'
import { useAppLocale } from '@/shared/i18n/app-locale'
import { getSectionBreadcrumbs, type NavSection } from '@/app/layout/navigation'
import { NotificationsPanel, useNotificationsCenter } from '@/features/notifications'

export interface HeaderProps {
  activeSection: NavSection
  onOpenMobileMenu: () => void
  onNavigate?: (section: NavSection) => void
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function Header({ activeSection, onOpenMobileMenu, onNavigate }: HeaderProps) {
  const { isPortuguese, t } = useAppLocale()
  const { profile, organization, signOut } = useAuthStore()
  const notifications = useNotificationsCenter()
  const breadcrumbs = getSectionBreadcrumbs(activeSection, isPortuguese)
  const fullName = `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim()
  const initials = getInitials(fullName || organization?.name || 'Pulse')

  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current) return
      if (!containerRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
        setShowProfileMenu(false)
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setShowNotifications(false)
        setShowProfileMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <header
      className="app-safe-top sticky top-0 z-20 border-b border-[var(--pulse-app-header-border)] bg-[var(--pulse-app-header-bg)] backdrop-blur-xl"
      style={{ paddingTop: 'env(safe-área-inset-top, 0px)' }}
    >
      <div className="flex h-[var(--pulse-app-header-height)] items-center gap-3 px-3 sm:gap-4 sm:px-4 lg:px-6">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white lg:hidden"
          title={t('Open navigation', 'Abrir navegação')}
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="min-w-0">
          <nav className="flex items-center gap-2 overflow-x-auto whitespace-nowrap text-sm text-white/40">
            {breadcrumbs.map((crumb, index) => (
              <span key={`${crumb.label}-${index}`} className="flex items-center gap-2">
                <span className={crumb.current ? 'font-bold text-white' : ''}>
                  {crumb.label}
                </span>
                {index < breadcrumbs.length - 1 ? <span className="text-white/20">/</span> : null}
              </span>
            ))}
          </nav>
        </div>

        <div className="flex-1" />

        <div ref={containerRef} className="relative flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => {
              setShowProfileMenu(false)
              setShowNotifications((current) => !current)
            }}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white/80"
            title={t('Notifications', 'Notificacoes')}
          >
            <Bell className="h-4 w-4" />
            {notifications.unreadCount > 0 ? (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#0057E7]" />
            ) : null}
          </button>

          <button
            type="button"
            onClick={() => {
              setShowNotifications(false)
              setShowProfileMenu((current) => !current)
            }}
            className="flex items-center rounded-xl p-1 transition-colors hover:bg-white/[0.06]"
            title={fullName || t('Account', 'Conta')}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-[#0057E7]/20 text-sm font-semibold text-[#4285F4]">
              {initials || 'P'}
            </div>
          </button>

          {showNotifications ? (
            <div className="absolute right-0 top-[calc(100%+0.5rem)] z-40 w-[min(420px,calc(100vw-1rem))] overflow-hidden rounded-2xl border border-white/10 bg-[var(--pulse-app-header-bg,#0b0d12)] shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <h3 className="text-base font-semibold text-white">
                  {t('Notifications', 'Notificacoes')}
                </h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="rounded-full p-1.5 text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="max-h-[28rem] overflow-y-auto p-4 [&_button]:!bg-white/[0.05] [&_button]:!border-white/10 [&_button]:hover:!bg-white/[0.09] [&_.text-text-primary]:!text-white [&_.text-text-muted]:!text-white/50 [&_div.rounded-2xl]:!bg-white/[0.04] [&_div.rounded-2xl]:!border-white/10 [&_div.rounded-2xl]:!text-white/50">
                <NotificationsPanel
                  notifications={notifications.notifications}
                  onMarkAsRead={notifications.markAsRead}
                  pagination={notifications.pagination}
                  onPageChange={notifications.setPage}
                />
              </div>
            </div>
          ) : null}

          {showProfileMenu ? (
            <div className="absolute right-0 top-[calc(100%+0.5rem)] z-40 w-60 overflow-hidden rounded-2xl border border-white/10 bg-[var(--pulse-app-header-bg,#0b0d12)] shadow-2xl">
              <div className="border-b border-white/10 px-4 py-3">
                <div className="text-sm font-semibold text-white">{fullName || 'Pulse'}</div>
                {profile?.role ? (
                  <div className="mt-0.5 truncate text-xs uppercase tracking-[0.18em] text-white/50">
                    {profile.role}
                  </div>
                ) : null}
              </div>
              <div className="p-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false)
                    onNavigate?.('settings')
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/80 transition-colors hover:bg-white/[0.06] hover:text-white"
                >
                  <SettingsIcon className="h-4 w-4" />
                  {t('Settings', 'Configuracoes')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false)
                    void signOut()
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/80 transition-colors hover:bg-red-500/10 hover:text-red-300"
                >
                  <LogOut className="h-4 w-4" />
                  {t('Sign out', 'Sair')}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}

export const AppHeader = Header
