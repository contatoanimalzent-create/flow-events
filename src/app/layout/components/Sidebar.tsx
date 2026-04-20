import { AnimatePresence, motion } from 'framer-motion'
import { LogOut, X } from 'lucide-react'
import { useEffect } from 'react'
import type { ElementType } from 'react'
import { createAppNavigation, type NavSection } from '@/app/layout/navigation'
import { useAccessControl } from '@/features/access-control'
import { useAuthStore } from '@/features/auth'
import { useAppLocale } from '@/shared/i18n/app-locale'
import { cn } from '@/shared/lib'

export interface SidebarProps {
  activeSection: NavSection
  onNavigate: (section: NavSection) => void
  isMobileOpen: boolean
  onCloseMobile: () => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function SidebarItem({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string
  icon: ElementType
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={cn(
        'relative flex h-11 w-full items-center gap-3 rounded-[var(--pulse-radius-md)] px-4 text-left transition-colors duration-[var(--pulse-app-motion-duration)]',
        active
          ? 'bg-[#0057E7]/12 text-[#4285F4]'
          : 'text-white/44 hover:bg-white/[0.04] hover:text-white/80',
      )}
    >
      <span
        className={cn(
          'absolute bottom-2 left-0 top-2 w-[2px] rounded-full',
          active ? 'bg-[var(--pulse-color-primary)]' : 'bg-transparent',
        )}
        aria-hidden="true"
      />
      <Icon className={cn('h-4 w-4 shrink-0', active && 'text-[var(--pulse-color-primary)]')} />
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{label}</span>
    </button>
  )
}

function SidebarSurface({
  activeSection,
  onNavigate,
  onCloseMobile,
  mobile = false,
}: Omit<SidebarProps, 'isMobileOpen'> & { mobile?: boolean }) {
  const { isPortuguese, t } = useAppLocale()
  const access = useAccessControl()
  const { profile, organization, signOut } = useAuthStore()

  const navigation = createAppNavigation(isPortuguese)
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => access.canAccessSection(item.id)),
    }))
    .filter((group) => group.items.length > 0)

  const fullName = `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim()
  const initials = getInitials(fullName || organization?.name || 'Pulse')

  return (
    <div
      className="flex h-full flex-col bg-[var(--pulse-app-sidebar-bg)]"
      style={{
        paddingTop: mobile ? 'env(safe-area-inset-top, 0px)' : undefined,
        paddingBottom: mobile ? 'env(safe-area-inset-bottom, 0px)' : undefined,
      }}
    >
      <div className="flex h-[var(--pulse-app-header-height)] items-center justify-between border-b border-[var(--pulse-app-sidebar-border)] px-5">
        <div className="flex flex-col">
          <img src="/logo.png" alt="Pulse" className="h-10 w-auto brightness-0 invert" />
          <span className="text-[10px] uppercase tracking-widest text-white/30 mt-1">Platform</span>
        </div>

        {mobile ? (
          <button
            type="button"
            onClick={onCloseMobile}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/44 transition hover:bg-white/[0.04] hover:text-white/80"
            title={t('Close navigation', 'Fechar navegacao')}
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-6">
          {navigation.map((group) => (
            <section key={group.key}>
              <div className="mb-2 px-4 text-[11px] font-medium uppercase tracking-[0.14em] text-white/24">
                {group.label}
              </div>

              <div className="space-y-1">
                {group.items.map((item) => (
                  <SidebarItem
                    key={item.id}
                    label={item.label}
                    icon={item.icon}
                    active={item.id === activeSection}
                    onClick={() => {
                      onNavigate(item.id)
                      if (mobile) {
                        onCloseMobile()
                      }
                    }}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <div className="border-t border-[var(--pulse-app-sidebar-border)] px-4 py-4">
        <div className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/12 bg-[#0057E7]/20 text-sm font-semibold text-[#4285F4]">
            {initials || 'P'}
          </div>

          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-white/90">
              {fullName || 'Pulse User'}
            </div>
            <div className="truncate text-xs text-white/40">
              {organization?.name || t('Internal workspace', 'Workspace interno')}
            </div>
          </div>

          <button
            type="button"
            onClick={() => signOut()}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/[0.06] hover:text-white/80"
            title={t('Sign out', 'Sair')}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function Sidebar({
  activeSection,
  onNavigate,
  isMobileOpen,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  useEffect(() => {
    if (!isMobileOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isMobileOpen])

  return (
    <>
      <aside
        className="fixed inset-y-0 left-0 z-30 hidden border-r border-[var(--pulse-app-sidebar-border)] lg:block"
        style={{ width: 'var(--pulse-app-sidebar-width)' }}
      >
        <SidebarSurface
          activeSection={activeSection}
          onNavigate={onNavigate}
          isCollapsed={false}
          onToggleCollapse={onToggleCollapse}
          onCloseMobile={onCloseMobile}
        />
      </aside>

      <AnimatePresence>
        {isMobileOpen ? (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              aria-label="Close navigation"
              className="absolute inset-0"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--pulse-color-text-primary) 12%, transparent)',
              }}
              onClick={onCloseMobile}
            />

            <motion.aside
              className="absolute inset-y-0 left-0 border-r border-[var(--pulse-app-sidebar-border)] bg-[var(--pulse-app-sidebar-bg)]"
              style={{ width: 'var(--pulse-app-sidebar-mobile-width)' }}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              <SidebarSurface
                activeSection={activeSection}
                onNavigate={onNavigate}
                isCollapsed={false}
                onToggleCollapse={onToggleCollapse}
                onCloseMobile={onCloseMobile}
                mobile
              />
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
