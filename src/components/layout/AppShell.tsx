import { useState, useEffect, useRef } from 'react'
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
  | 'dashboard' | 'events' | 'sales' | 'checkin' | 'credentialing'
  | 'staff' | 'suppliers' | 'products' | 'inventory' | 'communication'
  | 'financial' | 'growth' | 'help' | 'settings'

export function AppShell() {
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [transitioning, setTransitioning] = useState(false)
  const [displaySection, setDisplaySection] = useState<NavSection>('dashboard')
  const dotRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  /* ── Cursor ─────────────────────────────── */
  useEffect(() => {
    const dot  = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    let ringX = 0, ringY = 0

    const onMove = (e: MouseEvent) => {
      dot.style.left = e.clientX + 'px'
      dot.style.top  = e.clientY + 'px'
      setTimeout(() => {
        ring.style.left = e.clientX + 'px'
        ring.style.top  = e.clientY + 'px'
      }, 55)
    }

    const onEnter = () => {
      dot.classList.add('hovered')
      ring.classList.add('hovered')
    }
    const onLeave = () => {
      dot.classList.remove('hovered')
      ring.classList.remove('hovered')
    }

    document.addEventListener('mousemove', onMove)
    document.querySelectorAll('a,button,[role="button"]').forEach(el => {
      el.addEventListener('mouseenter', onEnter)
      el.addEventListener('mouseleave', onLeave)
    })
    return () => document.removeEventListener('mousemove', onMove)
  }, [])

  /* ── Page transition ─────────────────────── */
  const navigate = (section: NavSection) => {
    if (section === activeSection) return
    setTransitioning(true)
    setTimeout(() => {
      setActiveSection(section)
      setDisplaySection(section)
      setTransitioning(false)
    }, 280)
  }

  /* ── Scroll reveal ───────────────────────── */
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && e.target.classList.add('visible')),
      { threshold: 0.12, rootMargin: '0px 0px -30px 0px' }
    )
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [displaySection])

  const renderContent = () => {
    switch (displaySection) {
      case 'dashboard':     return <DashboardPage />
      case 'events':        return <EventsPage />
      case 'checkin':       return <CheckinPage />
      case 'staff':         return <StaffPage />
      case 'suppliers':     return <SuppliersPage />
      case 'products':      return <ProductsPage />
      case 'financial':     return <FinancialPage />
      case 'communication': return <CommunicationPage />
      case 'growth':        return <GrowthPage />
      case 'help':          return <HelpPage />
      case 'settings':      return <SettingsPage />
      default:              return <DashboardPage />
    }
  }

  return (
    <>
      {/* Custom cursor */}
      <div ref={dotRef}  className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />

      {/* Page transition overlay */}
      <div className={`page-transition ${transitioning ? 'entering' : 'leaving'}`} />

      <div className="flex h-screen bg-bg-primary overflow-hidden">
        <Sidebar
          activeSection={activeSection}
          onNavigate={navigate}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Topbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} activeSection={activeSection} />
          <main className="flex-1 overflow-y-auto">
            <div className="animate-fade-in">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </>
  )
}