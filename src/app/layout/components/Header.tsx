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
    <header className="sticky top-0 z-20 h-[var(--pulse-app-header-height)] border-b border-[var(--pulse-app-header-border)] bg-[var(--pulse-app-header-bg)] backdrop-blur-xl">
      <div className="flex h-full items-center gap-4 px-4 lg:px-6">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white lg:hidden"
          title={t('Open navigation', 'Abrir navegacao')}
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

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white/80"
            title={t('Notifications', 'Notificacoes')}
          >
            <Bell className="h-4 w-4" />
          </button>

          <div className="flex items-center rounded-xl p-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-[#0057E7]/20 text-sm font-semibold text-[#4285F4]">
              {initials || 'P'}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export const AppHeader = Header
