import { Suspense, lazy, useMemo, useState } from 'react'
import { OperationalAssistant } from '@/features/ai/OperationalAssistant'
import { LoadingState } from '@/shared/components'
import { useAppLocale } from '@/shared/i18n/app-locale'
import { MotionPage } from '@/shared/motion'
import { useUIStore } from '@/shared/store'
import { AppGrid, AppGridItem, AppHeader, AppSidebar, PageContainer } from './components'
import { getAppLayoutVariables } from './layout-tokens'
import { defaultNavSection, type NavSection } from './navigation'

const DashboardPage = lazy(() => import('@/pages/DashboardPage').then((module) => ({ default: module.DashboardPage })))
const EventsPage = lazy(() => import('@/pages/EventsPage').then((module) => ({ default: module.EventsPage })))
const TicketsPage = lazy(() => import('@/pages/TicketsPage').then((module) => ({ default: module.TicketsPage })))
const SalesPage = lazy(() => import('@/pages/SalesPage').then((module) => ({ default: module.SalesPage })))
const CRMPage = lazy(() => import('@/pages/CRMPage').then((module) => ({ default: module.CRMPage })))
const CheckinPage = lazy(() => import('@/pages/CheckinPage').then((module) => ({ default: module.CheckinPage })))
const StaffPage = lazy(() => import('@/pages/StaffPage').then((module) => ({ default: module.StaffPage })))
const SuppliersPage = lazy(() => import('@/pages/SuppliersPage').then((module) => ({ default: module.SuppliersPage })))
const ProductsPage = lazy(() => import('@/pages/ProductsPage').then((module) => ({ default: module.ProductsPage })))
const InventoryPage = lazy(() => import('@/pages/InventoryPage').then((module) => ({ default: module.InventoryPage })))
const IntelligencePage = lazy(() => import('@/pages/IntelligencePage').then((module) => ({ default: module.IntelligencePage })))
const FinancialPage = lazy(() => import('@/pages/FinancialPage').then((module) => ({ default: module.FinancialPage })))
const BillingPage = lazy(() => import('@/pages/BillingPage').then((module) => ({ default: module.BillingPage })))
const CommunicationPage = lazy(() => import('@/pages/CommunicationPage').then((module) => ({ default: module.CommunicationPage })))
const GrowthPage = lazy(() => import('@/pages/GrowthPage').then((module) => ({ default: module.GrowthPage })))
const HelpPage = lazy(() => import('@/pages/HelpPage').then((module) => ({ default: module.HelpPage })))
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then((module) => ({ default: module.SettingsPage })))
const RegistrationsPage = lazy(() => import('@/pages/RegistrationsPage').then((module) => ({ default: module.RegistrationsPage })))
const SponsorsPage = lazy(() => import('@/pages/SponsorsPage').then((module) => ({ default: module.SponsorsPage })))

function PageFallback() {
  const { t } = useAppLocale()

  return (
    <LoadingState
      title={t('Preparing the workspace', 'Preparando o workspace')}
      description={t(
        'We are loading the new internal Pulse foundation for this area.',
        'Estamos carregando a nova fundacao interna do Pulse para esta area.',
      )}
      className="mx-auto my-10 max-w-2xl"
    />
  )
}

function renderSection(activeSection: NavSection) {
  switch (activeSection) {
    case 'dashboard':
      return <DashboardPage />
    case 'events':
      return <EventsPage />
    case 'tickets':
      return <TicketsPage />
    case 'sales':
      return <SalesPage />
    case 'crm':
      return <CRMPage />
    case 'checkin':
      return <CheckinPage />
    case 'staff':
      return <StaffPage />
    case 'suppliers':
      return <SuppliersPage />
    case 'products':
      return <ProductsPage />
    case 'inventory':
      return <InventoryPage />
    case 'intelligence':
      return <IntelligencePage />
    case 'financial':
      return <FinancialPage />
    case 'billing':
      return <BillingPage />
    case 'communication':
      return <CommunicationPage />
    case 'growth':
      return <GrowthPage />
    case 'help':
      return <HelpPage />
    case 'settings':
      return <SettingsPage />
    case 'registrations':
      return <RegistrationsPage />
    case 'sponsors':
      return <SponsorsPage />
    default:
      return <DashboardPage />
  }
}

export function AppShell() {
  const [activeSection, setActiveSection] = useState<NavSection>(defaultNavSection)
  const sidebarOpen = useUIStore((state) => state.sidebarOpen)
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed)
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen)
  const toggleSidebarCollapsed = useUIStore((state) => state.toggleSidebarCollapsed)

  const shellVariables = useMemo(
    () => ({
      ...getAppLayoutVariables(),
      '--pulse-app-sidebar-width': sidebarCollapsed
        ? 'var(--pulse-app-sidebar-collapsed-width)'
        : 'var(--pulse-app-sidebar-expanded-width)',
    }),
    [sidebarCollapsed],
  )

  function handleNavigate(section: NavSection) {
    setActiveSection(section)
    setSidebarOpen(false)
  }

  return (
    <div
      className="min-h-screen bg-[var(--pulse-app-shell-bg)] text-[var(--pulse-color-text-primary)]"
      style={shellVariables}
    >
      <div className="relative min-h-screen overflow-x-clip">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[var(--pulse-app-shell-bg)]" />
          <div
            className="absolute inset-0 opacity-70"
            style={{
              backgroundImage:
                'linear-gradient(var(--pulse-app-canvas-grid) 1px, transparent 1px), linear-gradient(90deg, var(--pulse-app-canvas-grid) 1px, transparent 1px)',
              backgroundSize: '56px 56px',
            }}
          />
          <div className="absolute right-[-8rem] top-[-6rem] h-[24rem] w-[24rem] rounded-full bg-[var(--pulse-app-canvas-glow)] blur-[140px]" />
          <div className="absolute bottom-[-12rem] left-[25%] h-[28rem] w-[28rem] rounded-full bg-[var(--pulse-surface-accent)] blur-[180px]" />
        </div>

        <AppSidebar
          activeSection={activeSection}
          onNavigate={handleNavigate}
          isMobileOpen={sidebarOpen}
          onCloseMobile={() => setSidebarOpen(false)}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapsed}
        />

        <div className="relative min-h-screen transition-[padding-left] duration-[var(--pulse-app-motion-duration)] lg:pl-[var(--pulse-app-sidebar-width)]">
          <AppHeader
            activeSection={activeSection}
            onNavigate={handleNavigate}
            onOpenMobileMenu={() => setSidebarOpen(true)}
          />

          <main className="relative">
            <PageContainer as="div" size="wide" className="pb-[var(--pulse-app-content-padding-y)] pt-6 lg:pt-8">
              <div className="overflow-hidden rounded-[2rem] border border-[color:var(--pulse-app-surface-border)] bg-[var(--pulse-app-content-bg)] shadow-[var(--pulse-shadow-medium)]">
                <AppGrid className="p-4 md:p-5 xl:p-6">
                  <AppGridItem span={12}>
                    <Suspense fallback={<PageFallback />}>
                      <MotionPage>{renderSection(activeSection)}</MotionPage>
                    </Suspense>
                  </AppGridItem>
                </AppGrid>
              </div>
            </PageContainer>
          </main>
        </div>

        <OperationalAssistant activeSection={activeSection} onNavigate={handleNavigate} />
      </div>
    </div>
  )
}

export const AppShellV2 = AppShell
