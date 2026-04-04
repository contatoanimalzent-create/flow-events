import {
  ArrowRight,
  CalendarDays,
  CircleDollarSign,
  FileCheck2,
  MapPinned,
  MessageSquareMore,
  QrCode,
  ShieldCheck,
  Sparkles,
  Ticket,
  Users,
  Waypoints,
} from 'lucide-react'
import { useMemo } from 'react'
import { PublicLayout, PublicReveal, usePublicEvents } from '@/features/public'
import { formatPublicCurrency, formatPublicDate, type PublicLocale, usePublicLocale } from '@/features/public/lib/public-locale'
import type { PublicEventSummary } from '@/features/public/types/public.types'
import { useSeoMeta } from '@/shared/lib'

function getEventImage(coverUrl?: string | null) {
  if (coverUrl) return coverUrl
  return 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=2200&q=80&fit=crop'
}

function MetricCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-[1.9rem] border border-white/8 bg-white/[0.04] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
      <div className="text-[10px] uppercase tracking-[0.32em] text-white/44">{label}</div>
      <div className="mt-4 font-display text-[2.5rem] uppercase leading-none tracking-[-0.05em] text-[#fff8ef]">
        {value}
      </div>
      <div className="mt-2 text-sm leading-7 text-white/58">{detail}</div>
    </div>
  )
}

function CapabilityCard({
  icon: Icon,
  title,
  copy,
}: {
  icon: typeof ShieldCheck
  title: string
  copy: string
}) {
  return (
    <div className="rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_22px_60px_rgba(0,0,0,0.22)]">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#c79b44]/20 bg-[#5c1eb2]/16 text-[#f3e8ff]">
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-5 font-display text-[1.9rem] uppercase leading-none tracking-[-0.04em] text-[#fff8ef]">
        {title}
      </div>
      <p className="mt-3 text-sm leading-7 text-white/62">{copy}</p>
    </div>
  )
}

function EventCard({
  event,
  eyebrow,
  isPortuguese,
  locale,
}: {
  event: PublicEventSummary
  eyebrow: string
  isPortuguese: boolean
  locale: PublicLocale
}) {
  const cover =
    event.mediaPresentation.heroAsset?.thumbnail_url ||
    event.mediaPresentation.heroAsset?.secure_url ||
    event.mediaPresentation.coverAsset?.secure_url ||
    getEventImage(event.cover_url)

  return (
    <a
      href={`/e/${event.slug}`}
      className="group overflow-hidden rounded-[2rem] border border-white/8 bg-[#0d1118] shadow-[0_24px_80px_rgba(0,0,0,0.28)] transition-all duration-500 hover:-translate-y-1 hover:border-white/14"
    >
      <div className="relative h-[22rem] overflow-hidden">
        <img
          src={cover}
          alt={event.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,8,12,0.04)_0%,rgba(7,8,12,0.42)_48%,rgba(7,8,12,0.94)_100%)]" />
        <div className="absolute left-5 top-5 rounded-full border border-white/12 bg-black/26 px-3 py-1.5 text-[10px] uppercase tracking-[0.28em] text-white/74 backdrop-blur-md">
          {eyebrow}
        </div>
        <div className="absolute inset-x-0 bottom-0 p-5">
          <div className="text-[11px] uppercase tracking-[0.28em] text-[#d8c39a]">
            {event.category || (isPortuguese ? 'Experiencia' : 'Experience')}
          </div>
          <div className="mt-3 font-display text-[2.2rem] uppercase leading-[0.92] tracking-[-0.04em] text-[#fff8ef]">
            {event.name}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-white/72">
            <span>{formatPublicDate(event.starts_at, locale, { day: '2-digit', month: 'short' })}</span>
            <span>{[event.venue_name, event.city].filter(Boolean).join(' / ')}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="text-sm leading-7 text-white/60">
            {event.short_description ||
              (isPortuguese
                ? 'Venda, credenciamento, agenda e acesso digital centralizados em uma unica operacao.'
                : 'Sales, accreditation, schedule and digital access unified in one operation.')}
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/82">
          {event.minPrice && event.minPrice > 0
            ? formatPublicCurrency(event.minPrice, locale)
            : isPortuguese
              ? 'Inscricao'
              : 'Registration'}
          <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </a>
  )
}

export function HomePage({ onLogin }: { onLogin: () => void }) {
  const { isPortuguese, locale } = usePublicLocale()
  const publicEventsQuery = usePublicEvents()
  const events = publicEventsQuery.data ?? []

  const featuredEvent = useMemo(
    () => [...events].sort((left, right) => right.sold_tickets - left.sold_tickets)[0] ?? null,
    [events],
  )
  const showcaseEvents = useMemo(() => events.slice(0, 3), [events])
  const cityCount = useMemo(() => new Set(events.map((event) => event.city).filter(Boolean)).size, [events])
  const totalTickets = useMemo(
    () => events.reduce((sum, event) => sum + (event.sold_tickets ?? 0), 0),
    [events],
  )

  useSeoMeta({
    title: isPortuguese ? 'Animalz Events | Operacao premium de eventos' : 'Animalz Events | Premium event operations',
    description: isPortuguese
      ? 'Crie, venda e opere eventos em uma unica plataforma com paginas publicas premium, acesso do participante e cockpit completo do produtor.'
      : 'Create, sell and operate events in one platform with premium public pages, participant access and a complete producer cockpit.',
    image:
      featuredEvent?.mediaPresentation.heroAsset?.thumbnail_url ||
      featuredEvent?.mediaPresentation.heroAsset?.secure_url ||
      featuredEvent?.mediaPresentation.coverAsset?.secure_url ||
      featuredEvent?.cover_url ||
      '/logo.png',
    url: typeof window !== 'undefined' ? window.location.href : '/',
  })

  return (
    <PublicLayout onLogin={onLogin}>
      <section className="px-5 pb-8 pt-6 md:px-8 lg:px-10 lg:pb-14 lg:pt-8">
        <div className="mx-auto max-w-[1540px]">
          <div className="relative overflow-hidden rounded-[2.8rem] border border-white/8 bg-[#090b10] shadow-[0_32px_120px_rgba(0,0,0,0.34)]">
            <div className="absolute inset-0">
              <img
                src={
                  featuredEvent?.mediaPresentation.heroAsset?.thumbnail_url ||
                  featuredEvent?.mediaPresentation.heroAsset?.secure_url ||
                  featuredEvent?.mediaPresentation.coverAsset?.secure_url ||
                  getEventImage(featuredEvent?.cover_url)
                }
                alt={featuredEvent?.name ?? 'Animalz Events'}
                className="h-full w-full object-cover opacity-46"
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(92,30,178,0.28),transparent_28%),radial-gradient(circle_at_84%_22%,rgba(199,155,68,0.18),transparent_22%),linear-gradient(104deg,rgba(6,7,10,0.96)_0%,rgba(6,7,10,0.72)_38%,rgba(6,7,10,0.34)_70%,rgba(6,7,10,0.94)_100%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,7,10,0.18)_0%,rgba(6,7,10,0)_30%,rgba(6,7,10,0.95)_100%)]" />
            </div>

            <div className="relative z-10 grid gap-10 px-6 py-8 md:px-8 md:py-10 xl:grid-cols-[1.04fr_0.96fr] xl:items-end xl:px-12 xl:py-14">
              <div className="max-w-[820px]">
                <PublicReveal>
                  <div className="inline-flex items-center gap-3 rounded-full border border-[#c79b44]/22 bg-[#c79b44]/8 px-4 py-2 text-[10px] uppercase tracking-[0.34em] text-[#d8c39a]">
                    <Sparkles className="h-3.5 w-3.5" />
                    {isPortuguese ? 'Plataforma operacional premium de eventos' : 'Premium event operating platform'}
                  </div>
                </PublicReveal>

                <PublicReveal delayMs={70}>
                  <h1 className="mt-7 font-display text-[clamp(4.1rem,10vw,9.4rem)] uppercase leading-[0.82] tracking-[-0.06em] text-[#fff8ef]">
                    {isPortuguese ? 'Crie, venda e opere eventos sem trocar de sistema.' : 'Create, sell and operate events without switching systems.'}
                  </h1>
                  <p className="mt-6 max-w-[690px] text-base leading-8 text-white/68 md:text-lg">
                    {isPortuguese
                      ? 'A Animalz Events unifica front publico, jornada do participante, credenciamento, comunicacao, financeiro e governanca em uma operacao premium de ponta a ponta.'
                      : 'Animalz Events unifies public front, participant journey, accreditation, communication, finance and governance in one premium end-to-end operation.'}
                  </p>
                </PublicReveal>

                <PublicReveal className="mt-8 flex flex-wrap gap-3" delayMs={130}>
                  <a
                    href="/events"
                    className="inline-flex items-center gap-2 rounded-full bg-[#f5f0e8] px-6 py-3 text-xs font-bold uppercase tracking-[0.24em] text-[#0a0b0f] transition-all hover:-translate-y-0.5 hover:bg-[#c79b44]"
                  >
                    {isPortuguese ? 'Explorar eventos' : 'Explore events'}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <button
                    type="button"
                    onClick={onLogin}
                    className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-6 py-3 text-xs font-bold uppercase tracking-[0.24em] text-[#fff8ef] transition-all hover:border-[#c79b44]/30 hover:bg-white/[0.08]"
                  >
                    {isPortuguese ? 'Area do produtor' : 'Producer area'}
                  </button>
                </PublicReveal>

                <div className="mt-10 grid gap-4 md:grid-cols-3">
                  <PublicReveal delayMs={160}>
                    <MetricCard
                      label={isPortuguese ? 'Eventos publicos' : 'Public events'}
                      value={String(events.length || 0)}
                      detail={isPortuguese ? 'Catalogo vivo e pronto para conversao.' : 'Live catalog ready for conversion.'}
                    />
                  </PublicReveal>
                  <PublicReveal delayMs={200}>
                    <MetricCard
                      label={isPortuguese ? 'Cidades ativas' : 'Active cities'}
                      value={String(cityCount || 0)}
                      detail={isPortuguese ? 'Operacao pronta para multiplos formatos.' : 'Operation built for multiple formats.'}
                    />
                  </PublicReveal>
                  <PublicReveal delayMs={240}>
                    <MetricCard
                      label={isPortuguese ? 'Acessos emitidos' : 'Accesses issued'}
                      value={String(totalTickets || 0)}
                      detail={isPortuguese ? 'Ticketing, check-in e relacao com publico.' : 'Ticketing, check-in and audience relationships.'}
                    />
                  </PublicReveal>
                </div>
              </div>

              <PublicReveal delayMs={180}>
                <div className="rounded-[2.2rem] border border-white/10 bg-black/24 p-6 backdrop-blur-xl">
                  <div className="flex items-center justify-between gap-4 border-b border-white/8 pb-5">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.32em] text-[#d8c39a]">
                        {isPortuguese ? 'Evento em operacao' : 'Event in operation'}
                      </div>
                      <div className="mt-3 font-display text-[2.1rem] uppercase leading-none tracking-[-0.04em] text-[#fff8ef]">
                        {featuredEvent?.name ?? 'Animalz showcase'}
                      </div>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] uppercase tracking-[0.28em] text-white/62">
                      {featuredEvent?.category || (isPortuguese ? 'Premium event' : 'Premium event')}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3">
                    {[
                      {
                        icon: CalendarDays,
                        label: isPortuguese ? 'Janela' : 'Window',
                        value: featuredEvent
                          ? formatPublicDate(featuredEvent.starts_at, locale, {
                              weekday: 'short',
                              day: '2-digit',
                              month: 'short',
                            })
                          : '--',
                      },
                      {
                        icon: MapPinned,
                        label: isPortuguese ? 'Venue' : 'Venue',
                        value: featuredEvent
                          ? [featuredEvent.venue_name, featuredEvent.city].filter(Boolean).join(' / ')
                          : '--',
                      },
                      {
                        icon: Ticket,
                        label: isPortuguese ? 'Acesso inicial' : 'Starting access',
                        value:
                          featuredEvent?.minPrice && featuredEvent.minPrice > 0
                            ? formatPublicCurrency(featuredEvent.minPrice, locale)
                            : isPortuguese
                              ? 'Inscricao digital'
                              : 'Digital registration',
                      },
                      {
                        icon: Users,
                        label: isPortuguese ? 'Base ativa' : 'Active audience',
                        value: featuredEvent ? `${featuredEvent.sold_tickets} ${isPortuguese ? 'confirmados' : 'confirmed'}` : '--',
                      },
                    ].map(({ icon: Icon, label, value }) => (
                      <div
                        key={label}
                        className="flex items-center gap-4 rounded-[1.5rem] border border-white/8 bg-white/[0.04] px-4 py-3"
                      >
                        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#5c1eb2]/24 bg-[#5c1eb2]/14 text-[#e7d7ff]">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-[0.24em] text-white/42">{label}</div>
                          <div className="mt-1 text-sm font-medium text-white">{value}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-[1.6rem] border border-[#c79b44]/16 bg-[#c79b44]/8 p-4">
                    <div className="text-[10px] uppercase tracking-[0.28em] text-[#d8c39a]">
                      {isPortuguese ? 'Operacao conectada' : 'Connected operation'}
                    </div>
                    <p className="mt-3 text-sm leading-7 text-white/66">
                      {isPortuguese
                        ? 'Venda publica, QR code, jornada do participante, equipe, financeiro e documentos trabalhando na mesma base.'
                        : 'Public sales, QR code, participant journey, staff, finance and documents working from the same foundation.'}
                    </p>
                  </div>
                </div>
              </PublicReveal>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-8 md:px-8 lg:px-10 lg:py-14">
        <div className="mx-auto max-w-[1540px]">
          <PublicReveal>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-[760px]">
                <div className="text-[10px] uppercase tracking-[0.34em] text-[#d8c39a]">
                  {isPortuguese ? 'Sistema completo' : 'Complete system'}
                </div>
                <h2 className="mt-4 font-display text-[clamp(2.8rem,6vw,5.3rem)] uppercase leading-[0.88] tracking-[-0.05em] text-[#fff8ef]">
                  {isPortuguese ? 'Tudo o que sustenta o evento em uma unica plataforma.' : 'Everything that keeps the event running in one platform.'}
                </h2>
              </div>
              <a
                href="/events"
                className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/66 transition-colors hover:text-white"
              >
                {isPortuguese ? 'Ver eventos publicos' : 'View public events'}
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </PublicReveal>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[
              {
                icon: Ticket,
                title: isPortuguese ? 'Vendas e inscricoes' : 'Sales and registrations',
                copy: isPortuguese
                  ? 'Lotes, cortesias, cupons, checkout e emissao digital sem dependencia externa.'
                  : 'Releases, comps, coupons, checkout and digital issuance without external dependencies.',
              },
              {
                icon: QrCode,
                title: isPortuguese ? 'Credenciamento e check-in' : 'Accreditation and check-in',
                copy: isPortuguese
                  ? 'Controle de acesso, QR code antifraude, staff de portaria e leitura por setores.'
                  : 'Access control, anti-fraud QR, gate staff and sector-based scanning.',
              },
              {
                icon: MessageSquareMore,
                title: isPortuguese ? 'Participantes e comunicacao' : 'Participants and communication',
                copy: isPortuguese
                  ? 'CRM, campanhas, relacionamento, agenda e instrucoes operacionais no mesmo fluxo.'
                  : 'CRM, campaigns, relationships, schedule and operational guidance in the same flow.',
              },
              {
                icon: FileCheck2,
                title: isPortuguese ? 'Financeiro e governanca' : 'Finance and governance',
                copy: isPortuguese
                  ? 'Repasse, fechamento, documentos, autorizacoes e trilha de confianca executiva.'
                  : 'Payouts, closeout, documents, approvals and an executive trust trail.',
              },
            ].map((item, index) => (
              <PublicReveal key={item.title} delayMs={index * 70}>
                <CapabilityCard icon={item.icon} title={item.title} copy={item.copy} />
              </PublicReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-8 md:px-8 lg:px-10 lg:py-14">
        <div className="mx-auto grid max-w-[1540px] gap-5 xl:grid-cols-[0.92fr_1.08fr]">
          <PublicReveal>
            <div className="rounded-[2.3rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.24)] md:p-8">
              <div className="text-[10px] uppercase tracking-[0.34em] text-[#d8c39a]">
                {isPortuguese ? 'Experiencia do participante' : 'Participant experience'}
              </div>
              <div className="mt-4 font-display text-[3rem] uppercase leading-[0.9] tracking-[-0.05em] text-[#fff8ef]">
                {isPortuguese ? 'Acesso premium no bolso.' : 'Premium access in hand.'}
              </div>
              <p className="mt-4 text-sm leading-8 text-white/62">
                {isPortuguese
                  ? 'Credencial digital, agenda, orientacoes, QR code e status do evento em uma camada mobile que parece parte natural do ecossistema.'
                  : 'Digital credential, schedule, guidance, QR code and event status in a mobile layer that feels native to the ecosystem.'}
              </p>

              <div className="mt-6 space-y-3">
                {[
                  isPortuguese ? 'Credencial por perfil e setor' : 'Credential by profile and sector',
                  isPortuguese ? 'Agenda, mapa e informacoes operacionais' : 'Agenda, map and operational information',
                  isPortuguese ? 'Notificacoes e mudancas em tempo real' : 'Notifications and real-time changes',
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-[1.4rem] border border-white/8 bg-white/[0.04] px-4 py-3 text-sm text-white/66"
                  >
                    <ShieldCheck className="h-4 w-4 text-[#c79b44]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </PublicReveal>

          <PublicReveal delayMs={100}>
            <div className="rounded-[2.3rem] border border-white/8 bg-[#0d1118] p-7 shadow-[0_24px_80px_rgba(0,0,0,0.24)] md:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-[560px]">
                  <div className="text-[10px] uppercase tracking-[0.34em] text-[#d8c39a]">
                    {isPortuguese ? 'Cockpit do produtor' : 'Producer cockpit'}
                  </div>
                  <div className="mt-4 font-display text-[3rem] uppercase leading-[0.9] tracking-[-0.05em] text-[#fff8ef]">
                    {isPortuguese ? 'Centro de comando do evento.' : 'Event command center.'}
                  </div>
                  <p className="mt-4 text-sm leading-8 text-white/62">
                    {isPortuguese
                      ? 'Leitura executiva, saude comercial, fluxo de acesso, equipe, caixa e documentos com a mesma hierarquia premium.'
                      : 'Executive readout, commercial health, access flow, staff, cash and documents with the same premium hierarchy.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onLogin}
                  className="inline-flex items-center gap-2 rounded-full border border-[#c79b44]/20 bg-[#c79b44]/10 px-5 py-3 text-xs font-bold uppercase tracking-[0.22em] text-[#fff8ef] transition-all hover:border-[#c79b44]/35 hover:bg-[#c79b44]/14"
                >
                  {isPortuguese ? 'Entrar no cockpit' : 'Enter cockpit'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-8 grid gap-4 xl:grid-cols-[250px_1fr]">
                <div className="rounded-[1.8rem] border border-white/8 bg-black/18 p-4">
                  <div className="text-[10px] uppercase tracking-[0.28em] text-white/38">
                    {isPortuguese ? 'Modulos' : 'Modules'}
                  </div>
                  <div className="mt-4 space-y-2">
                    {[
                      isPortuguese ? 'Dashboard' : 'Dashboard',
                      isPortuguese ? 'Eventos' : 'Events',
                      isPortuguese ? 'Vendas' : 'Sales',
                      isPortuguese ? 'Credenciamento' : 'Check-in',
                      isPortuguese ? 'Participantes' : 'Participants',
                      isPortuguese ? 'Financeiro' : 'Financial',
                      isPortuguese ? 'Governanca' : 'Governance',
                    ].map((item, index) => (
                      <div
                        key={item}
                        className={`rounded-[1rem] px-4 py-3 text-sm ${
                          index === 0
                            ? 'border border-[#c79b44]/18 bg-[#c79b44]/10 text-white'
                            : 'border border-white/8 bg-white/[0.03] text-white/56'
                        }`}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="grid gap-4 md:grid-cols-4">
                    {[
                      { icon: CircleDollarSign, label: isPortuguese ? 'Receita bruta' : 'Gross revenue', value: 'R$ 4.8M' },
                      { icon: Waypoints, label: isPortuguese ? 'Conversao' : 'Conversion', value: '31.4%' },
                      { icon: QrCode, label: isPortuguese ? 'Check-in/h' : 'Check-in/h', value: '4.2k' },
                      { icon: FileCheck2, label: isPortuguese ? 'Aprovacoes' : 'Approvals', value: '12' },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="rounded-[1.5rem] border border-white/8 bg-white/[0.04] p-4">
                        <div className="flex items-center justify-between">
                          <div className="text-[10px] uppercase tracking-[0.24em] text-white/38">{label}</div>
                          <Icon className="h-4 w-4 text-[#c79b44]" />
                        </div>
                        <div className="mt-4 font-display text-[2rem] uppercase leading-none tracking-[-0.05em] text-[#fff8ef]">
                          {value}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                    <div className="rounded-[1.8rem] border border-white/8 bg-white/[0.04] p-5">
                      <div className="text-[10px] uppercase tracking-[0.28em] text-white/38">
                        {isPortuguese ? 'Operacao do dia' : 'Today operation'}
                      </div>
                      <div className="mt-5 flex h-44 items-end gap-3">
                        {[34, 52, 44, 60, 68, 74, 70, 86].map((height, index) => (
                          <div
                            key={`${height}-${index}`}
                            className="flex-1 rounded-t-[14px] bg-[linear-gradient(180deg,#7a3ff0,#c79b44)]"
                            style={{ height: `${height}%` }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      {[
                        isPortuguese ? 'VIP lane em observacao' : 'VIP lane under watch',
                        isPortuguese ? 'Repasse validado para fechamento' : 'Payout validated for closeout',
                        isPortuguese ? 'Mapa operacional publicado' : 'Operational map published',
                      ].map((item) => (
                        <div
                          key={item}
                          className="flex items-center gap-3 rounded-[1.5rem] border border-white/8 bg-white/[0.04] px-4 py-4 text-sm text-white/64"
                        >
                          <Sparkles className="h-4 w-4 text-[#c79b44]" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </PublicReveal>
        </div>
      </section>

      <section className="px-5 pb-16 pt-8 md:px-8 lg:px-10 lg:pb-20 lg:pt-14">
        <div className="mx-auto max-w-[1540px]">
          <PublicReveal>
            <div className="rounded-[2.6rem] border border-white/8 bg-[linear-gradient(135deg,rgba(92,30,178,0.2)_0%,rgba(12,14,19,0.98)_35%,rgba(199,155,68,0.12)_100%)] px-8 py-10 shadow-[0_28px_100px_rgba(0,0,0,0.28)] md:px-10 md:py-12">
              <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
                <div className="max-w-[760px]">
                  <div className="text-[10px] uppercase tracking-[0.34em] text-[#d8c39a]">
                    {isPortuguese ? 'Proximo passo' : 'Next step'}
                  </div>
                  <h2 className="mt-4 font-display text-[clamp(2.8rem,6vw,5.6rem)] uppercase leading-[0.86] tracking-[-0.05em] text-[#fff8ef]">
                    {isPortuguese ? 'Leve o evento inteiro para a mesma operacao.' : 'Bring the whole event into the same operation.'}
                  </h2>
                  <p className="mt-5 text-base leading-8 text-white/66 md:text-lg">
                    {isPortuguese
                      ? 'Use o front publico para gerar demanda e o cockpit para vender, credenciar, comunicar, operar e fechar com governanca.'
                      : 'Use the public front to generate demand and the cockpit to sell, accredit, communicate, operate and close with governance.'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <a
                    href="/events"
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 px-6 py-3 text-xs font-bold uppercase tracking-[0.22em] text-white/78 transition-all hover:bg-white/[0.05]"
                  >
                    {isPortuguese ? 'Ver catalogo' : 'View catalog'}
                  </a>
                  <button
                    type="button"
                    onClick={onLogin}
                    className="inline-flex items-center gap-2 rounded-full bg-[#f5f0e8] px-6 py-3 text-xs font-bold uppercase tracking-[0.22em] text-[#090a0d] transition-all hover:-translate-y-0.5 hover:bg-[#c79b44]"
                  >
                    {isPortuguese ? 'Acessar produtor' : 'Access producer'}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </PublicReveal>
        </div>
      </section>
    </PublicLayout>
  )
}

export default HomePage
