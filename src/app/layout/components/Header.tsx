import { Bell, Menu } from 'lucide-react'
import { useAuthStore } from '@/features/auth'
import { useAppLocale } from '@/shared/i18n/app-locale'
import { getSectionBreadcrumbs, type NavSection } from '@/app/layout/navigation'

export interface HeaderProps {
  activeSection: NavSection
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

export function Header({ activeSection, onOpenMobileMenu }: HeaderProps) {
  const { isPortuguese, t } = useAppLocale()
  const { profile, organization } = useAuthStore()
  const breadcrumbs = getSectionBreadcrumbs(activeSection, isPortuguese)
  const fullName = `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim()
  const initials = getInitials(fullName || organization?.name || 'Pulse')

  return (
    <header className="sticky top-0 z-20 h-[var(--pulse-app-header-height)] border-b border-[var(--pulse-app-header-border)] bg-[var(--pulse-app-header-bg)]">
      <div className="flex h-full items-center gap-4 px-4 lg:px-6">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-[var(--pulse-color-text-secondary)] transition-colors hover:bg-[var(--pulse-app-hover-surface)] hover:text-[var(--pulse-color-text-primary)] lg:hidden"
          title={t('Open navigation', 'Abrir navegacao')}
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="min-w-0">
          <nav className="flex items-center gap-2 overflow-x-auto whitespace-nowrap text-sm text-[var(--pulse-color-text-secondary)]">
            {breadcrumbs.map((crumb, index) => (
              <span key={`${crumb.label}-${index}`} className="flex items-center gap-2">
                <span className={crumb.current ? 'font-medium text-[var(--pulse-color-text-primary)]' : ''}>
                  {crumb.label}
                </span>
                {index < breadcrumbs.length - 1 ? <span>/</span> : null}
              </span>
            ))}
          </nav>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-[var(--pulse-color-text-secondary)] transition-colors hover:bg-[var(--pulse-app-hover-surface)] hover:text-[var(--pulse-color-text-primary)]"
            title={t('Notifications', 'Notificacoes')}
          >
            <Bell className="h-4 w-4" />
          </button>

          <div className="flex items-center rounded-xl p-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--pulse-color-surface)] text-sm font-semibold text-[var(--pulse-color-text-primary)]">
              {initials || 'P'}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export const AppHeader = Header
