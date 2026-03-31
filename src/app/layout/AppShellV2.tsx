import { Suspense, lazy, useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { OperationalAssistant } from '@/features/ai/OperationalAssistant'
import { AdminShell, LoadingState } from '@/shared/components'
import { useAppLocale } from '@/shared/i18n/app-locale'
import { MotionPage } from '@/shared/motion'
import { useUIStore } from '@/shared/store'
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

function PageFallback() {
  const { t } = useAppLocale()

  return (
    <LoadingState
      title={t('Preparing the experience', 'Preparando a experiencia')}
      description={t('We are assembling this area with the new visual foundation.', 'Estamos montando esta area com a nova fundacao visual.')}
      className="mx-6 my-8"
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
    default:
      return <DashboardPage />
  }
}

export function AppShellV2() {
  const [activeSection, setActiveSection] = useState<NavSection>(defaultNavSection)
  const sidebarOpen = useUIStore((state) => state.sidebarOpen)
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen)
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)

  function handleNavigate(section: NavSection) {
    setActiveSection(section)
    setSidebarOpen(false)
  }

  return (
    <AdminShell>
      <Sidebar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar
          onMenuToggle={toggleSidebar}
          onNavigate={handleNavigate}
          activeSection={activeSection}
        />
        <main className="relative flex-1 overflow-y-auto">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-40 bg-[linear-gradient(180deg,rgba(7,6,7,0.94)_0%,rgba(7,6,7,0)_100%)]" />
          <div className="main-grid-bg min-h-full">
            <Suspense fallback={<PageFallback />}>
              <MotionPage>{renderSection(activeSection)}</MotionPage>
            </Suspense>
          </div>
        </main>
      </div>
      <OperationalAssistant activeSection={activeSection} onNavigate={handleNavigate} />
    </AdminShell>
  )
}
