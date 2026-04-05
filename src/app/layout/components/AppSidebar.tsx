import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from 'lucide-react'
import { useEffect, type ElementType } from 'react'
import { createAppNavigation, type NavSection } from '@/app/layout/navigation'
import { useAccessControl } from '@/features/access-control'
import { useAuthStore } from '@/features/auth'
import { useAppLocale } from '@/shared/i18n/app-locale'
import { cn } from '@/shared/lib'

interface AppSidebarProps {
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

function SidebarNavItem({
  id,
  label,
  shortLabel,
  description,
  icon: Icon,
  active,
  collapsed,
  onClick,
}: {
  id: NavSection
  label: string
  shortLabel: string
  description: string
  icon: ElementType
  active: boolean
  collapsed: boolean
  onClick: () => void
}) {
  return (
    <button
      key={id}
      type="button"
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={cn(
        'group relative flex w-full items-center gap-3 overflow-hidden rounded-[1.35rem] border px-3 py-3 text-left transition-all duration-[var(--pulse-app-motion-duration)]',
        active
          ? 'border-white/10 bg-white text-[var(--pulse-color-primary)] shadow-[0_18px_40px_rgba(10,26,255,0.16)]'
          : 'border-transparent bg-transparent text-[var(--pulse-app-sidebar-muted)] hover:border-white/10 hover:bg-white/[0.06] hover:text-white',
      )}
    >
      <span
        className={cn(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] border transition-all duration-[var(--pulse-app-motion-duration)]',
          active
            ? 'border-[color:var(--pulse-color-primary-soft)] bg-[color:var(--pulse-surface-accent)] text-[var(--pulse-color-primary)]'
            : 'border-white/10 bg-white/5 text-white/80 group-hover:border-white/20 group-hover:bg-white/10',
        )}
      >
        <Icon className="h-[1.05rem] w-[1.05rem]" />
      </span>

      <span className={cn('min-w-0 flex-1 transition-all duration-[var(--pulse-app-motion-duration)]', collapsed && 'pointer-events-none w-0 opacity-0')}>
        <span className="block truncate text-[0.96rem] font-semibold tracking-[-0.02em]">
          {collapsed ? shortLabel : label}
        </span>
        <span className="mt-1 block truncate text-[0.75rem] leading-5 text-current/70">
          {description}
        </span>
      </span>

      {active ? (
        <span className="absolute inset-y-3 left-0 w-1 rounded-full bg-[var(--pulse-color-primary-soft)]" aria-hidden="true" />
      ) : null}
    </button>
  )
}

function SidebarPanel({
  activeSection,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  mobile,
  onCloseMobile,
}: Omit<AppSidebarProps, 'isMobileOpen'> & { mobile?: boolean }) {
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
      className={cn(
        'relative flex h-full flex-col overflow-hidden border-r bg-[var(--pulse-app-sidebar-bg)] text-[var(--pulse-app-sidebar-text)]',
        mobile ? 'w-[var(--pulse-app-sidebar-mobile-width)]' : 'w-full',
      )}
      style={{ borderColor: 'var(--pulse-app-sidebar-border)' }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.05)_0%,transparent_16%,transparent_100%)]" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'linear-gradient(var(--pulse-app-sidebar-border) 1px, transparent 1px), linear-gradient(90deg, var(--pulse-app-sidebar-border) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      <div className="relative flex items-center gap-3 border-b border-white/10 px-4 py-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.15rem] bg-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
          <span className="font-display text-[1.55rem] leading-none tracking-[-0.04em] text-white">P</span>
        </div>

        <div className={cn('min-w-0 flex-1 transition-all duration-[var(--pulse-app-motion-duration)]', isCollapsed && !mobile && 'w-0 opacity-0')}>
          <div className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-white/50">
            {t('Internal command', 'Comando interno')}
          </div>
          <div className="mt-1 font-display text-[2rem] leading-none tracking-[-0.05em] text-white">Pulse</div>
        </div>

        {mobile ? (
          <button
            type="button"
            onClick={onCloseMobile}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/80 transition hover:bg-white/10"
            title={t('Close navigation', 'Fechar navegacao')}
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/80 transition hover:bg-white/10 lg:inline-flex"
            title={isCollapsed ? t('Expand sidebar', 'Expandir sidebar') : t('Collapse sidebar', 'Recolher sidebar')}
          >
            {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        )}
      </div>

      <div className="relative flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-6">
          {navigation.map((group) => (
            <section key={group.key}>
              <div
                className={cn(
                  'mb-2 px-3 text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-white/40 transition-opacity duration-[var(--pulse-app-motion-duration)]',
                  isCollapsed && !mobile && 'opacity-0',
                )}
              >
                {group.label}
              </div>

              <div className="space-y-1.5">
                {group.items.map((item) => (
                  <SidebarNavItem
                    key={item.id}
                    {...item}
                    active={item.id === activeSection}
                    collapsed={Boolean(isCollapsed && !mobile)}
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

      <div className="relative border-t border-white/10 p-3">
        <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.06] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[0.85rem] font-semibold text-[var(--pulse-color-primary)]">
              {initials || 'P'}
            </div>

            <div className={cn('min-w-0 flex-1 transition-all duration-[var(--pulse-app-motion-duration)]', isCollapsed && !mobile && 'w-0 opacity-0')}>
              <div className="truncate text-[0.95rem] font-semibold text-white">
                {fullName || organization?.name || 'Pulse Team'}
              </div>
              <div className="truncate text-[0.72rem] text-white/60">
                {organization?.name || t('Internal workspace', 'Workspace interno')}
              </div>
            </div>

            <button
              type="button"
              onClick={() => signOut()}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/75 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
              title={t('Sign out', 'Sair')}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {!mobile ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="mt-3 hidden w-full items-center justify-center gap-2 rounded-[1rem] border border-white/10 bg-white/[0.06] px-3 py-2 text-[0.76rem] font-medium text-white/75 transition hover:bg-white/10 lg:inline-flex"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            <span className={cn(isCollapsed && 'hidden')}>{t('Adjust navigation', 'Ajustar navegacao')}</span>
          </button>
        ) : null}
      </div>
    </div>
  )
}

export function AppSidebar({
  activeSection,
  onNavigate,
  isMobileOpen,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
}: AppSidebarProps) {
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
        className="fixed inset-y-0 left-0 z-40 hidden transition-[width] duration-[var(--pulse-app-motion-duration)] lg:block"
        style={{ width: 'var(--pulse-app-sidebar-width)' }}
      >
        <SidebarPanel
          activeSection={activeSection}
          onNavigate={onNavigate}
          onCloseMobile={onCloseMobile}
          isCollapsed={isCollapsed}
          onToggleCollapse={onToggleCollapse}
        />
      </aside>

      <AnimatePresence>
        {isMobileOpen ? (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              aria-label="Close navigation"
              className="absolute inset-0 bg-[rgba(7,18,37,0.52)] backdrop-blur-sm"
              onClick={onCloseMobile}
            />

            <motion.div
              className="relative h-full"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            >
              <SidebarPanel
                activeSection={activeSection}
                onNavigate={onNavigate}
                onCloseMobile={onCloseMobile}
                isCollapsed={false}
                onToggleCollapse={onToggleCollapse}
                mobile
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
