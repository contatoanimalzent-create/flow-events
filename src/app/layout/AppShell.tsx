import { Suspense, lazy, useMemo, useState } from 'react'
import { LoadingState } from '@/shared/components'
import { useAppLocale } from '@/shared/i18n/app-locale'
import { useUIStore } from '@/shared/store'
import { Header, PageContainer, Sidebar } from './components'
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
const CouponsPage = lazy(() => import('@/pages/CouponsPage').then((module) => ({ default: module.CouponsPage })))
const WaitlistPage = lazy(() => import('@/pages/WaitlistPage').then((module) => ({ default: module.WaitlistPage })))
const OrganizationsPage = lazy(() => import('@/pages/OrganizationsPage').then((module) => ({ default: module.OrganizationsPage })))
const MapPage = lazy(() => import('@/pages/MapPage').then((module) => ({ default: module.MapPage })))
const CommunityPage = lazy(() => import('@/pages/CommunityPage').then((module) => ({ default: module.CommunityPage })))
const MonetizationPage = lazy(() => import('@/pages/MonetizationPage').then((module) => ({ default: module.MonetizationPage })))
const AuditPage = lazy(() => import('@/pages/AuditPage').then((module) => ({ default: module.AuditPage })))

function PageFallback() {
  const { t } = useAppLocale()

  return (
    <LoadingState
      title={t('Loading area', 'Carregando area')}
      description={t(
        'We are preparing this internal Pulse workspace.',
        'Estamos preparando este workspace interno do Pulse.',
      )}
      className="mx-auto my-16 max-w-xl"
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
    case 'coupons':
      return <CouponsPage />
    case 'waitlist':
      return <WaitlistPage />
    case 'organizations':
      return <OrganizationsPage />
    case 'map':
      return <MapPage />
    case 'community':
      return <CommunityPage />
    case 'monetization':
      return <MonetizationPage />
    case 'audit':
      return <AuditPage />
    default:
      return <DashboardPage />
  }
}

export function AppShell() {
  const [activeSection, setActiveSection] = useState<NavSection>(defaultNavSection)
  const sidebarOpen = useUIStore((state) => state.sidebarOpen)
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen)

  const shellVariables = useMemo(
    () => ({
      ...getAppLayoutVariables(),
      '--pulse-app-sidebar-width': 'var(--pulse-app-sidebar-expanded-width)',
    }),
    [],
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
      <Sidebar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        isMobileOpen={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
        isCollapsed={false}
        onToggleCollapse={() => undefined}
      />

      <div className="min-w-0 min-h-screen lg:pl-[var(--pulse-app-sidebar-width)]">
        <Header activeSection={activeSection} onOpenMobileMenu={() => setSidebarOpen(true)} />

        <main className="min-w-0 min-h-[calc(100vh-var(--pulse-app-header-height))] bg-[var(--pulse-app-shell-bg)]">
          <PageContainer as="div" className="space-y-4 sm:space-y-6">
            <div className="min-h-[calc(100vh-var(--pulse-app-header-height)-3rem)]">
              <Suspense fallback={<PageFallback />}>{renderSection(activeSection)}</Suspense>
            </div>
          </PageContainer>
        </main>
      </div>
    </div>
  )
}

export const AppLayout = AppShell
export const AppShellV2 = AppShell
