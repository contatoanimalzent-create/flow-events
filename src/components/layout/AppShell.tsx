import { useState, Suspense, lazy } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { CustomCursor } from '@/components/ui/CustomCursor'

// Lazy load every page — splits the 1.1MB bundle into ~13 small chunks
const DashboardPage     = lazy(() => import('@/pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const EventsPage        = lazy(() => import('@/pages/EventsPage').then(m => ({ default: m.EventsPage })))
const TicketsPage       = lazy(() => import('@/pages/TicketsPage').then(m => ({ default: m.TicketsPage })))
const SalesPage         = lazy(() => import('@/pages/SalesPage').then(m => ({ default: m.SalesPage })))
const CheckinPage       = lazy(() => import('@/pages/CheckinPage').then(m => ({ default: m.CheckinPage })))
const StaffPage         = lazy(() => import('@/pages/StaffPage').then(m => ({ default: m.StaffPage })))
const SuppliersPage     = lazy(() => import('@/pages/SuppliersPage').then(m => ({ default: m.SuppliersPage })))
const ProductsPage      = lazy(() => import('@/pages/ProductsPage').then(m => ({ default: m.ProductsPage })))
const FinancialPage     = lazy(() => import('@/pages/FinancialPage').then(m => ({ default: m.FinancialPage })))
const CommunicationPage = lazy(() => import('@/pages/CommunicationPage').then(m => ({ default: m.CommunicationPage })))
const GrowthPage        = lazy(() => import('@/pages/GrowthPage').then(m => ({ default: m.GrowthPage })))
const HelpPage          = lazy(() => import('@/pages/HelpPage').then(m => ({ default: m.HelpPage })))
const SettingsPage      = lazy(() => import('@/pages/SettingsPage').then(m => ({ default: m.SettingsPage })))

export type NavSection =
  | 'dashboard' | 'events' | 'tickets' | 'sales' | 'checkin'
  | 'staff' | 'suppliers' | 'products' | 'inventory'
  | 'communication' | 'financial' | 'growth' | 'help' | 'settings'

function PageFallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-2 h-2 rounded-full bg-brand-acid animate-bounce"
            style={{ animationDelay: `${i * 100}ms` }} />
        ))}
      </div>
    </div>
  )
}

export function AppShell() {
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':     return <DashboardPage />
      case 'events':        return <EventsPage />
      case 'tickets':       return <TicketsPage />
      case 'sales':         return <SalesPage />
      case 'checkin':       return <CheckinPage />
      case 'staff':         return <StaffPage />
      case 'suppliers':     return <SuppliersPage />
      case 'products':
      case 'inventory':     return <ProductsPage />
      case 'financial':     return <FinancialPage />
      case 'communication': return <CommunicationPage />
      case 'growth':        return <GrowthPage />
      case 'help':          return <HelpPage />
      case 'settings':      return <SettingsPage />
      default:              return <DashboardPage />
    }
  }

  return (
    <div className="flex h-screen bg-bg-primary overflow-hidden" style={{ cursor: 'none' }}>
      <CustomCursor />
      <Sidebar
        activeSection={activeSection}
        onNavigate={setActiveSection}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} activeSection={activeSection} />
        <main className="flex-1 overflow-y-auto main-grid-bg">
          <Suspense fallback={<PageFallback />}>
            <div className="animate-fade-in">
              {renderContent()}
            </div>
          </Suspense>
        </main>
      </div>
    </div>
  )
}
