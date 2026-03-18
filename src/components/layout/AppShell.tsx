import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { DashboardPage } from '@/pages/DashboardPage'
import { EventsPage } from '@/pages/EventsPage'
import { CheckinPage } from '@/pages/CheckinPage'
import { StaffPage } from '@/pages/StaffPage'
import { SuppliersPage } from '@/pages/SuppliersPage'
import { ProductsPage } from '@/pages/ProductsPage'
import { FinancialPage } from '@/pages/FinancialPage'
import { CommunicationPage } from '@/pages/CommunicationPage'
import { GrowthPage } from '@/pages/GrowthPage'
import { HelpPage } from '@/pages/HelpPage'
import { SettingsPage } from '@/pages/SettingsPage'

export type NavSection =
  | 'dashboard'
  | 'events'
  | 'sales'
  | 'checkin'
  | 'credentialing'
  | 'staff'
  | 'suppliers'
  | 'products'
  | 'inventory'
  | 'communication'
  | 'financial'
  | 'growth'
  | 'help'
  | 'settings'

export function AppShell() {
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':    return <DashboardPage />
      case 'events':       return <EventsPage />
      case 'checkin':      return <CheckinPage />
      case 'staff':        return <StaffPage />
      case 'suppliers':    return <SuppliersPage />
      case 'products':     return <ProductsPage />
      case 'financial':    return <FinancialPage />
      case 'communication': return <CommunicationPage />
      case 'growth':       return <GrowthPage />
      case 'help':         return <HelpPage />
      case 'settings':     return <SettingsPage />
      default:             return <DashboardPage />
    }
  }

  return (
    <div className="app-active flex h-screen bg-bg-primary overflow-hidden">
      <Sidebar
        activeSection={activeSection}
        onNavigate={setActiveSection}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          activeSection={activeSection}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="animate-fade-in">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
}