import { Suspense, lazy, useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
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
const IntelligencePage = lazy(() => import('@/pages/IntelligencePage').then((module) => ({ default: module.IntelligencePage })))
const FinancialPage = lazy(() => import('@/pages/FinancialPage').then((module) => ({ default: module.FinancialPage })))
const CommunicationPage = lazy(() => import('@/pages/CommunicationPage').then((module) => ({ default: module.CommunicationPage })))
const GrowthPage = lazy(() => import('@/pages/GrowthPage').then((module) => ({ default: module.GrowthPage })))
const HelpPage = lazy(() => import('@/pages/HelpPage').then((module) => ({ default: module.HelpPage })))
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then((module) => ({ default: module.SettingsPage })))

function PageFallback() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="surface-panel flex items-center gap-2 px-5 py-4">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="h-2.5 w-2.5 animate-bounce rounded-full bg-brand-acid"
            style={{ animationDelay: `${index * 100}ms` }}
          />
        ))}
      </div>
    </div>
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
    case 'inventory':
      return <ProductsPage />
    case 'intelligence':
      return <IntelligencePage />
    case 'financial':
      return <FinancialPage />
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
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)

  return (
    <div className="flex h-screen overflow-hidden bg-bg-primary">
      <Sidebar
        activeSection={activeSection}
        onNavigate={setActiveSection}
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar onMenuToggle={toggleSidebar} activeSection={activeSection} />
        <main className="main-grid-bg flex-1 overflow-y-auto">
          <Suspense fallback={<PageFallback />}>
            <div className="animate-fade-in">{renderSection(activeSection)}</div>
          </Suspense>
        </main>
      </div>
    </div>
  )
}
