/**
 * PulseApp — unified mobile app entry point
 *
 * Single app · single auth · multi-org · multi-event · multi-role · dynamic navigation
 *
 * Routes handled internally via usePulseRouter (history.pushState based).
 * Mounted at /pulse by the outer web router (PublicRouteView).
 */

import React, { lazy, Suspense, useState, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAppContext } from '@/core/context/app-context.store'
import { usePermissions } from '@/core/permissions/permissions.store'
import { useOrganizations } from '@/core/organizations/organizations.store'
import { useEvents } from '@/core/events/events.store'
import { useNotifications } from '@/core/notifications/notifications.store'
import { useOffline } from '@/core/offline/offline.store'
import { useOfflineDetection } from '@/core/offline/offline.hooks'
import { buildTabsForMode, buildModeAccent, buildHomeRoute } from '@/shared/utils/menu'
import { BottomTabBar } from '@/shared/components/navigation/BottomTabBar'
import { TopContextBar } from '@/shared/components/navigation/TopContextBar'
import { ModeSwitcher } from '@/shared/components/navigation/ModeSwitcher'
import { buildModeFromPath } from './pulse.utils'
import type { AppMode } from '@/core/context/app-context.types'

// ─── lazy-loaded screen groups ───────────────────────────────────────────────

// Onboarding
const SelectOrganizationPage = lazy(() => import('@/modules/onboarding/pages/SelectOrganizationPage'))
const SelectEventPage = lazy(() => import('@/modules/onboarding/pages/SelectEventPage'))
const SelectModePage = lazy(() => import('@/modules/onboarding/pages/SelectModePage'))

// Shared shell
const NotificationsCenterPage = lazy(() => import('@/modules/shared-shell/pages/NotificationsCenterPage'))
const ProfilePage = lazy(() => import('@/modules/profile-settings/pages/ProfilePage'))

// Operator
const OperatorHomePage = lazy(() => import('@/modules/operator/pages/OperatorHomePage'))
const ScannerPage = lazy(() => import('@/modules/operator/pages/ScannerPage'))
const ManualCheckPage = lazy(() => import('@/modules/operator/pages/ManualCheckPage'))
const CheckinHistoryPage = lazy(() => import('@/modules/operator/pages/CheckinHistoryPage'))
const FlowPage = lazy(() => import('@/modules/operator/pages/FlowPage'))
const OperatorAlertsPage = lazy(() => import('@/modules/operator/pages/OperatorAlertsPage'))

// Staff
const StaffHomePage = lazy(() => import('@/modules/staff/pages/StaffHomePage'))
const MyShiftPage = lazy(() => import('@/modules/staff/pages/MyShiftPage'))
const PresencePage = lazy(() => import('@/modules/staff/pages/PresencePage'))
const StaffInstructionsPage = lazy(() => import('@/modules/staff/pages/StaffInstructionsPage'))
const StaffOccurrencesPage = lazy(() => import('@/modules/staff/pages/StaffOccurrencesPage'))
const StaffHistoryPage = lazy(() => import('@/modules/staff/pages/StaffHistoryPage'))

// Supervisor
const SupervisorHomePage = lazy(() => import('@/modules/supervisor/pages/SupervisorHomePage'))
const TeamLivePage = lazy(() => import('@/modules/supervisor/pages/TeamLivePage'))
const TeamMapPage = lazy(() => import('@/modules/supervisor/pages/TeamMapPage'))
const OccurrencesPage = lazy(() => import('@/modules/supervisor/pages/OccurrencesPage'))
const ApprovalsPage = lazy(() => import('@/modules/supervisor/pages/ApprovalsPage'))
const SupervisorAlertsPage = lazy(() => import('@/modules/supervisor/pages/SupervisorAlertsPage'))

// Attendee
const AttendeeHomePage = lazy(() => import('@/modules/attendee/pages/AttendeeHomePage'))
const MyTicketsPage = lazy(() => import('@/modules/attendee/pages/MyTicketsPage'))
const TicketQrPage = lazy(() => import('@/modules/attendee/pages/TicketQrPage'))
const AgendaPage = lazy(() => import('@/modules/attendee/pages/AgendaPage'))
const AttendeeFeedPage = lazy(() => import('@/modules/attendee/pages/FeedPage'))
const AttendeeMapPage = lazy(() => import('@/modules/attendee/pages/AttendeeMapPage'))
const NetworkingPage = lazy(() => import('@/modules/attendee/pages/NetworkingPage'))
const UpgradesPage = lazy(() => import('@/modules/attendee/pages/UpgradesPage'))

// Promoter
const PromoterHomePage = lazy(() => import('@/modules/promoter/pages/PromoterHomePage'))
const MySalesPage = lazy(() => import('@/modules/promoter/pages/MySalesPage'))
const MyCommissionPage = lazy(() => import('@/modules/promoter/pages/MyCommissionPage'))
const RankingPage = lazy(() => import('@/modules/promoter/pages/RankingPage'))
const GoalsPage = lazy(() => import('@/modules/promoter/pages/GoalsPage'))

// ─── router hook ─────────────────────────────────────────────────────────────

function usePulseRouter() {
  const getPath = () => window.location.pathname

  const [path, setPath] = useState<string>(getPath)

  const navigate = useCallback((to: string) => {
    window.history.pushState({}, '', to)
    setPath(to)
  }, [])

  const replace = useCallback((to: string) => {
    window.history.replaceState({}, '', to)
    setPath(to)
  }, [])

  useEffect(() => {
    const handler = () => setPath(window.location.pathname)
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [])

  return { path, navigate, replace }
}

// ─── spinner fallback ─────────────────────────────────────────────────────────

function ScreenLoader() {
  return (
    <div className="flex-1 flex items-center justify-center bg-[#060d1f]">
      <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-white/60 animate-spin" />
    </div>
  )
}

// ─── page resolver ────────────────────────────────────────────────────────────

function resolveScreen(path: string, navigate: (p: string) => void): React.ReactNode {
  // Exact match helpers
  const is = (p: string) => path === p
  const starts = (p: string) => path.startsWith(p)

  // Onboarding
  if (is('/pulse/select-organization')) return <SelectOrganizationPage onNavigate={navigate} />
  if (is('/pulse/select-event')) return <SelectEventPage onNavigate={navigate} />
  if (is('/pulse/select-mode')) return <SelectModePage onNavigate={navigate} />

  // Shared
  if (starts('/pulse/notifications')) return <NotificationsCenterPage onNavigate={navigate} />
  if (starts('/pulse/profile')) return <ProfilePage onNavigate={navigate} />

  // Operator
  if (is('/pulse/operator')) return <OperatorHomePage onNavigate={navigate} />
  if (is('/pulse/operator/scanner')) return <ScannerPage onNavigate={navigate} />
  if (is('/pulse/operator/manual-check')) return <ManualCheckPage onNavigate={navigate} />
  if (is('/pulse/operator/history')) return <CheckinHistoryPage onNavigate={navigate} />
  if (is('/pulse/operator/flow')) return <FlowPage onNavigate={navigate} />
  if (is('/pulse/operator/alerts')) return <OperatorAlertsPage onNavigate={navigate} />

  // Staff
  if (is('/pulse/staff')) return <StaffHomePage onNavigate={navigate} />
  if (is('/pulse/staff/shift')) return <MyShiftPage onNavigate={navigate} />
  if (is('/pulse/staff/presence')) return <PresencePage onNavigate={navigate} />
  if (is('/pulse/staff/instructions')) return <StaffInstructionsPage onNavigate={navigate} />
  if (is('/pulse/staff/occurrences')) return <StaffOccurrencesPage onNavigate={navigate} />
  if (is('/pulse/staff/history')) return <StaffHistoryPage onNavigate={navigate} />

  // Supervisor
  if (is('/pulse/supervisor')) return <SupervisorHomePage onNavigate={navigate} />
  if (is('/pulse/supervisor/team-live')) return <TeamLivePage onNavigate={navigate} />
  if (is('/pulse/supervisor/team-map')) return <TeamMapPage onNavigate={navigate} />
  if (is('/pulse/supervisor/occurrences')) return <OccurrencesPage onNavigate={navigate} />
  if (is('/pulse/supervisor/approvals')) return <ApprovalsPage onNavigate={navigate} />
  if (is('/pulse/supervisor/alerts')) return <SupervisorAlertsPage onNavigate={navigate} />

  // Attendee
  if (is('/pulse/attendee')) return <AttendeeHomePage onNavigate={navigate} />
  if (is('/pulse/attendee/tickets')) return <MyTicketsPage onNavigate={navigate} />
  if (starts('/pulse/attendee/ticket/')) return <TicketQrPage ticketId={path.split('/').pop()!} onNavigate={navigate} />
  if (is('/pulse/attendee/agenda')) return <AgendaPage onNavigate={navigate} />
  if (is('/pulse/attendee/feed')) return <AttendeeFeedPage onNavigate={navigate} />
  if (is('/pulse/attendee/map')) return <AttendeeMapPage onNavigate={navigate} />
  if (is('/pulse/attendee/networking')) return <NetworkingPage onNavigate={navigate} />
  if (is('/pulse/attendee/upgrades')) return <UpgradesPage onNavigate={navigate} />

  // Promoter
  if (is('/pulse/promoter')) return <PromoterHomePage onNavigate={navigate} />
  if (is('/pulse/promoter/sales')) return <MySalesPage onNavigate={navigate} />
  if (is('/pulse/promoter/commission')) return <MyCommissionPage onNavigate={navigate} />
  if (is('/pulse/promoter/ranking')) return <RankingPage onNavigate={navigate} />
  if (is('/pulse/promoter/goals')) return <GoalsPage onNavigate={navigate} />

  // Fallback
  return null
}

// ─── main component ───────────────────────────────────────────────────────────

export function PulseApp() {
  const { path, navigate, replace } = usePulseRouter()
  const [showModeSwitcher, setShowModeSwitcher] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

  const { context, availableModes, isContextReady, setMode } = useAppContext()
  const unreadCount = useNotifications((s) => s.unreadCount)
  const isOnline = useOffline((s) => s.isOnline)

  // Register offline detection at app root
  useOfflineDetection()

  // ── session guard — usa a sessão Supabase existente, sem login próprio ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthChecked(true)

      if (!session) {
        // Sem sessão → redireciona para o login principal do app
        window.location.replace('/login')
        return
      }

      const isOnboardingRoute = path.startsWith('/pulse/select-')

      // Sessão existe mas sem contexto → onboarding
      if (!isContextReady && !isOnboardingRoute) {
        replace('/pulse/select-organization')
        return
      }

      // Contexto pronto, na raiz → vai para home do modo ativo
      if (path === '/pulse' && isContextReady && context?.mode) {
        replace(buildHomeRoute(context.mode))
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, isContextReady, context])

  // ── mode from path ──
  const modeFromPath = buildModeFromPath(path)

  // ── navigation helpers passed to screens ──
  const handleModeSwitcherSelect = (mode: AppMode) => {
    setMode(mode)
    setShowModeSwitcher(false)
    navigate(buildHomeRoute(mode))
  }

  // ── determine if chrome should show ──
  const noChromePaths = [
    '/pulse/select-organization',
    '/pulse/select-event',
    '/pulse/select-mode',
    '/pulse/operator/scanner', // full-screen scanner
  ]
  const showChrome =
    authChecked &&
    isContextReady &&
    context?.mode != null &&
    !noChromePaths.includes(path)

  // Aguardando verificação de sessão
  if (!authChecked) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#060d1f]">
        <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-white/60 animate-spin" />
      </div>
    )
  }

  const activeMode = context?.mode ?? modeFromPath ?? 'attendee'
  const accent = buildModeAccent(activeMode)
  const tabs = buildTabsForMode(activeMode, unreadCount > 0 ? unreadCount : undefined)

  // ── render ──
  return (
    <div
      className="flex flex-col h-screen max-h-screen overflow-hidden bg-[#060d1f] text-white"
      style={{ '--pulse-accent': accent } as React.CSSProperties}
    >
      {/* Top context bar */}
      {showChrome && context && (
        <TopContextBar
          mode={activeMode}
          eventName={context.eventName}
          organizationName={context.organizationName}
          unreadCount={unreadCount}
          isOnline={isOnline}
          onContextTap={() => setShowModeSwitcher(true)}
          onNotificationsTap={() => navigate('/pulse/notifications')}
        />
      )}

      {/* Screen content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <Suspense fallback={<ScreenLoader />}>
          {resolveScreen(path, navigate)}
        </Suspense>
      </main>

      {/* Bottom tab bar */}
      {showChrome && tabs.length > 0 && (
        <BottomTabBar
          tabs={tabs}
          activePath={path}
          accent={accent}
          onNavigate={navigate}
        />
      )}

      {/* Mode switcher sheet */}
      {showModeSwitcher && (
        <ModeSwitcher
          availableModes={availableModes}
          activeMode={activeMode}
          onSelect={handleModeSwitcherSelect}
          onClose={() => setShowModeSwitcher(false)}
        />
      )}
    </div>
  )
}
