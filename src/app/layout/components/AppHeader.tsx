import { useMemo, useState } from 'react'
import { Bell, ChevronRight, Menu, Search, Sparkles } from 'lucide-react'
import { NotificationsPanel, useNotificationsCenter } from '@/features/notifications'
import { useAuthStore } from '@/features/auth'
import { createAppNavigation, getSectionBreadcrumbs, type NavSection } from '@/app/layout/navigation'
import { useAccessControl } from '@/features/access-control'
import { useAppLocale } from '@/shared/i18n/app-locale'
import { cn } from '@/shared/lib'

interface AppHeaderProps {
  activeSection: NavSection
  onNavigate: (section: NavSection) => void
  onOpenMobileMenu: () => void
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function AppHeader({ activeSection, onNavigate, onOpenMobileMenu }: AppHeaderProps) {
  const { isPortuguese, t } = useAppLocale()
  const access = useAccessControl()
  const notifications = useNotificationsCenter()
  const { profile, organization, signOut } = useAuthStore()
  const [query, setQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const navigationItems = useMemo(
    () =>
      createAppNavigation(isPortuguese)
        .flatMap((group) => group.items)
        .filter((item) => access.canAccessSection(item.id)),
    [access, isPortuguese],
  )

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase()

    if (!normalized) {
      return navigationItems.slice(0, 6)
    }

    return navigationItems.filter((item) => {
      return `${item.label} ${item.description}`.toLowerCase().includes(normalized)
    })
  }, [navigationItems, query])

  const breadcrumbs = getSectionBreadcrumbs(activeSection, isPortuguese)
  const fullName = `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim()
  const initials = getInitials(fullName || organization?.name || 'Pulse')

  return (
    <header className="sticky top-0 z-30 border-b border-[color:var(--pulse-app-header-border)] bg-[var(--pulse-app-header-bg)] backdrop-blur-xl">
      <div className="mx-auto flex min-h-[var(--pulse-app-header-height)] w-full max-w-[var(--pulse-app-content-max-width-wide)] items-center gap-3 px-[var(--pulse-app-content-padding-x-mobile)] lg:px-[var(--pulse-app-content-padding-x-desktop)]">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--pulse-app-surface-border)] bg-white/[0.84] text-[var(--pulse-color-text-primary)] shadow-[var(--pulse-shadow-soft)] transition hover:translate-y-[-1px] lg:hidden"
          title={t('Open navigation', 'Abrir navegacao')}
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap text-[0.73rem] font-medium uppercase tracking-[0.18em] text-[var(--pulse-color-text-secondary)]">
            {breadcrumbs.map((crumb, index) => (
              <div key={`${crumb.label}-${index}`} className="flex items-center gap-2">
                <span className={cn(crumb.current && 'text-[var(--pulse-color-primary)]')}>{crumb.label}</span>
                {index < breadcrumbs.length - 1 ? <ChevronRight className="h-3.5 w-3.5 text-[var(--pulse-color-text-secondary)]/60" /> : null}
              </div>
            ))}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <div className="font-display text-[2rem] leading-none tracking-[-0.04em] text-[var(--pulse-color-text-primary)]">
              {breadcrumbs[breadcrumbs.length - 1]?.label}
            </div>
            <span className="hidden rounded-full border border-[color:var(--pulse-app-surface-border)] bg-white/70 px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--pulse-color-primary)] sm:inline-flex">
              Pulse
            </span>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="relative hidden min-w-[17rem] md:block lg:min-w-[22rem]">
            <div className="flex items-center gap-2 rounded-full border border-[color:var(--pulse-app-surface-border)] bg-white/[0.88] px-4 py-3 shadow-[var(--pulse-shadow-soft)]">
              <Search className="h-4 w-4 text-[var(--pulse-color-text-secondary)]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => window.setTimeout(() => setSearchFocused(false), 120)}
                placeholder={t('Search modules and flows', 'Buscar modulos e fluxos')}
                className="w-full bg-transparent text-sm text-[var(--pulse-color-text-primary)] outline-none placeholder:text-[var(--pulse-color-text-secondary)]"
              />
              <span className="rounded-full bg-[var(--pulse-color-surface)] px-2 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--pulse-color-text-secondary)]">
                /
              </span>
            </div>

            {searchFocused ? (
              <div className="absolute inset-x-0 top-[calc(100%+0.75rem)] overflow-hidden rounded-[1.5rem] border border-[color:var(--pulse-app-surface-border)] bg-white/[0.96] p-2 shadow-[var(--pulse-shadow-strong)]">
                <div className="px-3 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--pulse-color-text-secondary)]">
                  {filteredItems.length
                    ? t('Quick navigation', 'Navegacao rapida')
                    : t('No matching area', 'Nenhuma area encontrada')}
                </div>

                <div className="space-y-1">
                  {filteredItems.map((item) => {
                    const Icon = item.icon

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onNavigate(item.id)
                          setQuery('')
                          setSearchFocused(false)
                        }}
                        className="flex w-full items-center gap-3 rounded-[1rem] px-3 py-3 text-left transition hover:bg-[var(--pulse-color-surface)]"
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-[0.9rem] bg-[var(--pulse-surface-accent)] text-[var(--pulse-color-primary)]">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-[var(--pulse-color-text-primary)]">
                            {item.label}
                          </span>
                          <span className="mt-1 block truncate text-xs text-[var(--pulse-color-text-secondary)]">
                            {item.description}
                          </span>
                        </span>
                        <Sparkles className="h-4 w-4 text-[var(--pulse-color-primary-soft)]" />
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : null}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setNotificationsOpen((current) => !current)
                setUserMenuOpen(false)
              }}
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--pulse-app-surface-border)] bg-white/[0.84] text-[var(--pulse-color-text-primary)] shadow-[var(--pulse-shadow-soft)] transition hover:translate-y-[-1px]"
              title={t('Notifications', 'Notificacoes')}
            >
              <Bell className="h-4 w-4" />
              {notifications.unreadCount > 0 ? (
                <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-[var(--pulse-color-primary-soft)]" />
              ) : null}
            </button>

            {notificationsOpen ? (
              <div className="absolute right-0 top-[calc(100%+0.8rem)] w-[22rem] overflow-hidden rounded-[1.6rem] border border-[color:var(--pulse-app-surface-border)] bg-white/[0.96] shadow-[var(--pulse-shadow-strong)]">
                <div className="border-b border-[color:var(--pulse-app-surface-border)] px-5 py-4">
                  <div className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[var(--pulse-color-text-secondary)]">
                    {t('Pulse center', 'Centro Pulse')}
                  </div>
                  <div className="mt-2 font-display text-[1.8rem] leading-none tracking-[-0.04em] text-[var(--pulse-color-text-primary)]">
                    {t('Notifications', 'Notificacoes')}
                  </div>
                </div>
                <div className="max-h-[26rem] overflow-y-auto p-4">
                  <NotificationsPanel
                    notifications={notifications.notifications}
                    onMarkAsRead={notifications.markAsRead}
                    pagination={notifications.pagination}
                    onPageChange={notifications.setPage}
                  />
                </div>
              </div>
            ) : null}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setUserMenuOpen((current) => !current)
                setNotificationsOpen(false)
              }}
              className="inline-flex items-center gap-3 rounded-full border border-[color:var(--pulse-app-surface-border)] bg-white/[0.88] py-1.5 pl-1.5 pr-3 shadow-[var(--pulse-shadow-soft)] transition hover:translate-y-[-1px]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--pulse-color-primary)] text-sm font-semibold text-white">
                {initials || 'P'}
              </span>
              <span className="hidden min-w-0 text-left sm:block">
                <span className="block max-w-[10rem] truncate text-sm font-semibold text-[var(--pulse-color-text-primary)]">
                  {fullName || organization?.name || 'Pulse Team'}
                </span>
                <span className="block max-w-[10rem] truncate text-[0.74rem] text-[var(--pulse-color-text-secondary)]">
                  {organization?.name || t('Internal workspace', 'Workspace interno')}
                </span>
              </span>
            </button>

            {userMenuOpen ? (
              <div className="absolute right-0 top-[calc(100%+0.8rem)] w-[18rem] overflow-hidden rounded-[1.6rem] border border-[color:var(--pulse-app-surface-border)] bg-white/[0.96] p-2 shadow-[var(--pulse-shadow-strong)]">
                <div className="rounded-[1.2rem] bg-[var(--pulse-color-surface)] px-4 py-4">
                  <div className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--pulse-color-text-secondary)]">
                    {t('Signed in as', 'Logado como')}
                  </div>
                  <div className="mt-2 text-sm font-semibold text-[var(--pulse-color-text-primary)]">
                    {fullName || 'Pulse Team'}
                  </div>
                  <div className="mt-1 text-xs text-[var(--pulse-color-text-secondary)]">
                    {organization?.name || t('Main workspace', 'Workspace principal')}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => signOut()}
                  className="mt-2 flex w-full items-center justify-center rounded-[1rem] bg-[var(--pulse-color-primary)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--pulse-color-primary-soft)]"
                >
                  {t('Sign out', 'Sair')}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}
