import { Suspense, lazy } from 'react'
import type { PublicRoute } from './public-routes'
import { AuthLoadingGate, useAuthStore } from '@/features/auth'
import { LoadingState } from '@/shared/components'
import { OperatorPage } from '@/features/checkin/pages/OperatorPage'

const AboutPage = lazy(() => import('@/pages/public/AboutPage').then((m) => ({ default: m.AboutPage })))
const ComoFuncionaPage = lazy(() => import('@/pages/public/ComoFuncionaPage').then((m) => ({ default: m.ComoFuncionaPage })))
const PrecosPage = lazy(() => import('@/pages/public/PrecosPage').then((m) => ({ default: m.PrecosPage })))
const DemoPage = lazy(() => import('@/pages/public/DemoPage').then((m) => ({ default: m.DemoPage })))
const ApiPage = lazy(() => import('@/pages/public/ApiPage').then((m) => ({ default: m.ApiPage })))
const FuncionalidadesPage = lazy(() => import('@/pages/public/FuncionalidadesPage').then((m) => ({ default: m.FuncionalidadesPage })))
const CarreirasPage = lazy(() => import('@/pages/public/CarreirasPage').then((m) => ({ default: m.CarreirasPage })))
const BlogPage = lazy(() => import('@/pages/public/BlogPage').then((m) => ({ default: m.BlogPage })))
const CasesPage = lazy(() => import('@/pages/public/CasesPage').then((m) => ({ default: m.CasesPage })))
const ImprensaPage = lazy(() => import('@/pages/public/ImprensaPage').then((m) => ({ default: m.ImprensaPage })))
const AjudaPage = lazy(() => import('@/pages/public/AjudaPage').then((m) => ({ default: m.AjudaPage })))
const AjudaCompradoresPage = lazy(() => import('@/pages/public/AjudaCompradoresPage').then((m) => ({ default: m.AjudaCompradoresPage })))
const AjudaProdutoresPage = lazy(() => import('@/pages/public/AjudaProdutoresPage').then((m) => ({ default: m.AjudaProdutoresPage })))
const StatusPage = lazy(() => import('@/pages/public/StatusPage').then((m) => ({ default: m.StatusPage })))
const EventosCategoriPage = lazy(() => import('@/pages/public/EventosCategoriaPage').then((m) => ({ default: m.EventosCategoriaPage })))
const StaffJoinPage = lazy(() => import('@/pages/public/StaffJoinPage').then((m) => ({ default: m.StaffJoinPage })))
const StaffTimeclockPage = lazy(() => import('@/pages/public/StaffTimeclockPage').then((m) => ({ default: m.StaffTimeclockPage })))
const ContactPage = lazy(() => import('@/pages/public/ContactPage').then((m) => ({ default: m.ContactPage })))
const ProducerPage = lazy(() => import('@/pages/public/ProducerPage').then((m) => ({ default: m.ProducerPage })))
const AccountPage = lazy(() => import('@/pages/public/AccountPage').then((m) => ({ default: m.AccountPage })))
const CreateEventPage = lazy(() => import('@/pages/public/CreateEventPage').then((m) => ({ default: m.CreateEventPage })))
const EventPage = lazy(() => import('@/pages/public/EventPage').then((m) => ({ default: m.EventPage })))
const EventsCatalogPage = lazy(() => import('@/pages/public/EventsCatalogPage').then((m) => ({ default: m.EventsCatalogPage })))
const HomePage = lazy(() => import('@/pages/public/HomePage').then((m) => ({ default: m.HomePage })))
const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })))
const SignupPage = lazy(() => import('@/pages/auth/SignupPage').then((m) => ({ default: m.SignupPage })))
const PrivacyPage = lazy(() => import('@/pages/public/PrivacyPage').then((m) => ({ default: m.PrivacyPage })))
const TermsPage = lazy(() => import('@/pages/public/TermsPage').then((m) => ({ default: m.TermsPage })))

const StaffApp = lazy(() => import('@/features/mobile/staff/StaffApp').then((m) => ({ default: m.StaffApp })))
const SupervisorApp = lazy(() => import('@/features/mobile/supervisor/SupervisorApp').then((m) => ({ default: m.SupervisorApp })))
const ParticipantApp = lazy(() => import('@/features/mobile/participant/ParticipantApp').then((m) => ({ default: m.ParticipantApp })))
const PromoterApp = lazy(() => import('@/features/mobile/promoter/PromoterApp').then((m) => ({ default: m.PromoterApp })))
const OperatorApp = lazy(() => import('@/features/mobile/operator/OperatorApp').then((m) => ({ default: m.OperatorApp })))

// Unified Pulse app — single app, single auth, multi-role
const PulseApp = lazy(() => import('@/features/pulse/PulseApp').then((m) => ({ default: m.PulseApp })))

function PublicFallback() {
  return <LoadingState title="Loading" description="" className="min-h-screen" />
}

function MobileLoader() {
  return (
    <div className="flex h-screen items-center justify-center bg-black">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-white/60" />
    </div>
  )
}

interface PublicRouteViewProps {
  route: PublicRoute
  onLogin: () => void
  onSignup: () => void
  onBackToHome: () => void
}

export function PublicRouteView({ route, onLogin, onSignup, onBackToHome }: PublicRouteViewProps) {
  const user = useAuthStore((state) => state.user)

  // ── Unified Pulse app (NEW — replaces individual profile apps) ──
  if (route === 'pulse-app') return <Suspense fallback={<MobileLoader />}><PulseApp /></Suspense>

  // Legacy individual mobile apps (kept for backward compat at /op, /staff, /supervisor, /app, /promoter)
  if (route === 'staff-app') return <Suspense fallback={<MobileLoader />}><StaffApp /></Suspense>
  if (route === 'supervisor-app') return <Suspense fallback={<MobileLoader />}><SupervisorApp /></Suspense>
  if (route === 'participant-app') return <Suspense fallback={<MobileLoader />}><ParticipantApp /></Suspense>
  if (route === 'promoter-app') return <Suspense fallback={<MobileLoader />}><PromoterApp /></Suspense>
  if (route === 'operator') return <Suspense fallback={<MobileLoader />}><OperatorApp /></Suspense>

  return (
    <Suspense fallback={<PublicFallback />}>
      {typeof route === 'object' && route.type === 'staff-join' ? (
        <StaffJoinPage />
      ) : typeof route === 'object' && route.type === 'timeclock' ? (
        <StaffTimeclockPage />
      ) : typeof route === 'object' && route.type === 'event' ? (
        <EventPage slug={route.slug} />
      ) : route === 'terms' ? (
        <TermsPage />
      ) : route === 'privacy' ? (
        <PrivacyPage />
      ) : route === 'producer' ? (
        <ProducerPage onLogin={onLogin} />
      ) : route === 'contact' ? (
        <ContactPage onLogin={onLogin} />
      ) : route === 'about' ? (
        <AboutPage onLogin={onLogin} />
      ) : route === 'create-event' ? (
        <CreateEventPage onLogin={onLogin} />
      ) : route === 'account' ? (
        <AuthLoadingGate>
          {user ? <AccountPage /> : <LoginPage onBack={onBackToHome} onSignup={onSignup} />}
        </AuthLoadingGate>
      ) : route === 'events' ? (
        <EventsCatalogPage onLogin={onLogin} />
      ) : route === 'login' ? (
        <LoginPage onBack={onBackToHome} onSignup={onSignup} />
      ) : route === 'signup' ? (
        <SignupPage onBack={onBackToHome} onLogin={onLogin} />
      ) : route === 'como-funciona' ? (
        <ComoFuncionaPage onLogin={onLogin} />
      ) : route === 'precos' ? (
        <PrecosPage onLogin={onLogin} />
      ) : route === 'demo' ? (
        <DemoPage onLogin={onLogin} />
      ) : route === 'api' ? (
        <ApiPage onLogin={onLogin} />
      ) : route === 'funcionalidades' ? (
        <FuncionalidadesPage onLogin={onLogin} />
      ) : route === 'carreiras' ? (
        <CarreirasPage onLogin={onLogin} />
      ) : route === 'blog' ? (
        <BlogPage onLogin={onLogin} />
      ) : route === 'cases' ? (
        <CasesPage onLogin={onLogin} />
      ) : route === 'imprensa' ? (
        <ImprensaPage onLogin={onLogin} />
      ) : route === 'ajuda' ? (
        <AjudaPage onLogin={onLogin} />
      ) : route === 'ajuda-compradores' ? (
        <AjudaCompradoresPage onLogin={onLogin} />
      ) : route === 'ajuda-produtores' ? (
        <AjudaProdutoresPage onLogin={onLogin} />
      ) : route === 'status' ? (
        <StatusPage onLogin={onLogin} />
      ) : route === 'eventos-categoria' ? (
        <EventosCategoriPage onLogin={onLogin} />
      ) : (
        <HomePage onLogin={onLogin} />
      )}
    </Suspense>
  )
}
