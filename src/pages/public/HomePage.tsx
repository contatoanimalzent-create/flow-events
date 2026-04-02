import {
  ArrowRight,
  BellRing,
  BriefcaseBusiness,
  CalendarRange,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Cpu,
  FileCheck2,
  Gauge,
  LayoutDashboard,
  Layers3,
  MapPinned,
  MessageSquareMore,
  MonitorSmartphone,
  Orbit,
  QrCode,
  ShieldCheck,
  Sparkles,
  Ticket,
  Users,
  WalletCards,
  Waypoints,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { useSeoMeta } from '@/shared/lib'

type DiagnosticSignal = {
  source: string
  summary: string
  absorbed: string[]
  translated: string
  avoid: string
}

type Principle = {
  title: string
  copy: string
  icon: LucideIcon
}

type ArchitectureLayer = {
  eyebrow: string
  title: string
  copy: string
  modules: string[]
  navigation: string
  icon: LucideIcon
}

type ThemeCard = {
  name: string
  mood: string
  accent: string
  support: string
  copy: string
}

const diagnosticSignals: DiagnosticSignal[] = [
  {
    source: 'Reference video',
    summary: 'Immersive pacing, dark atmosphere, editorial framing, and premium restraint.',
    absorbed: [
      'Cinematic contrast with deep blacks and bright focal highlights.',
      'Image-led depth, where content feels staged rather than simply placed in cards.',
      'Motion used as cadence, not decoration.',
      'Controlled blur, glow, and layering to imply value and exclusivity.',
    ],
    translated:
      'Animalz keeps the cinematic energy, but applies it to a more operational, high-trust product surface.',
    avoid:
      'We do not literalize the same shots, social vibe, or party-first storytelling.',
  },
  {
    source: 'Reference mobile UI',
    summary: 'Bold typography, full-bleed media, soft translucent overlays, and very direct CTAs.',
    absorbed: [
      'Strong hero-led mobile composition with large headlines and minimal actions.',
      'Premium mobile panels with translucent depth and rounded silhouettes.',
      'Simple, decisive CTA hierarchy instead of clutter.',
      'A sense of status and invitation when entering an event experience.',
    ],
    translated:
      'Animalz borrows the premium intimacy of the mobile composition, then upgrades it into a multi-event operational companion.',
    avoid:
      'We do not copy the social invitation app look, party semantics, or playful informality.',
  },
  {
    source: 'Official Animalz logo',
    summary: 'The mark carries aggression, velocity, ownership, and a premium signature palette.',
    absorbed: [
      'Deep black foundation with purple and gold as controlled brand signatures.',
      'Diagonal energy and sharp directional geometry.',
      'A proprietary presence that feels stronger than generic SaaS branding.',
      'A premium tension between performance and elegance.',
    ],
    translated:
      'Animalz becomes a command-grade event operating system with a brand that can stretch from motorsport to festivals without losing authority.',
    avoid:
      'We do not turn the logo language into excessive flames, neon streaks, or noisy decorative chrome.',
  },
]

const principles: Principle[] = [
  {
    title: 'System First',
    copy: 'Every screen must feel like part of one operating model: public demand, participant access, and producer control share a common core.',
    icon: Waypoints,
  },
  {
    title: 'Premium Precision',
    copy: 'The visual language signals price, trust, and operational maturity through spacing, contrast, and disciplined detail.',
    icon: Sparkles,
  },
  {
    title: 'Editorial Power',
    copy: 'Campaign surfaces can feel cinematic and aspirational while the structure underneath remains rigid and reusable.',
    icon: Orbit,
  },
  {
    title: 'Operational Calm',
    copy: 'Backoffice interactions prioritize scanning, decisions, and accountability over decorative dashboards.',
    icon: Gauge,
  },
  {
    title: 'Themeable Consistency',
    copy: 'Event categories change the atmosphere, not the product grammar. The system remains recognizable in every vertical.',
    icon: Layers3,
  },
]

const layers: ArchitectureLayer[] = [
  {
    eyebrow: 'Layer 01',
    title: 'Public front',
    copy: 'Aspirational, cinematic, and conversion-ready. Built to communicate range, authority, and high-value event presence.',
    modules: [
      'Institutional homepage',
      'Event catalog and discovery',
      'Individual event page',
      'Checkout and registration flow',
      'Public participant area',
    ],
    navigation:
      'Discover -> evaluate -> select event -> register or buy -> receive participant access.',
    icon: MonitorSmartphone,
  },
  {
    eyebrow: 'Layer 02',
    title: 'Participant mobile app',
    copy: 'An immersive access layer for ticket, credential, agenda, map, notifications, and premium event presence on the phone.',
    modules: [
      'Discovery home',
      'Event home and credential',
      'Agenda and programming',
      'Map and key information',
      'Profile and preferences',
    ],
    navigation:
      'Open app -> see live event state -> access credential -> move through agenda, map, and communications.',
    icon: BellRing,
  },
  {
    eyebrow: 'Layer 03',
    title: 'Producer backoffice',
    copy: 'A premium command center for decisions, execution, staffing, financial control, and governance.',
    modules: [
      'Executive dashboard',
      'Events, sales, and pricing',
      'Check-in and accreditation',
      'CRM, communication, and staff',
      'Finance, documents, and branding',
    ],
    navigation:
      'Executive overview -> module workspace -> event-level control -> action logs, status, and governance.',
    icon: LayoutDashboard,
  },
]

const categoryThemes: ThemeCard[] = [
  {
    name: 'Motorsport',
    mood: 'Mechanical velocity',
    accent: '#e7ded0',
    support: '#9b1b1f',
    copy: 'Sharper contrast, brushed metallic notes, telemetry lines, and colder highlights without losing the Animalz dark core.',
  },
  {
    name: 'Festival',
    mood: 'Cinematic warmth',
    accent: '#d6b06f',
    support: '#6f2a8e',
    copy: 'A warmer editorial skin with sunset golds and deeper plum highlights, still elegant and disciplined.',
  },
  {
    name: 'Tactical',
    mood: 'Field command',
    accent: '#8f9b71',
    support: '#1b1d1b',
    copy: 'Muted military greens and smoke neutrals to reinforce utility, access control, and mission-grade clarity.',
  },
  {
    name: 'Fight',
    mood: 'Controlled intensity',
    accent: '#c68663',
    support: '#7d1919',
    copy: 'Dense shadows, warm impact tones, and sharp information hierarchy to evoke pressure, timing, and authority.',
  },
]

const frontModules = [
  'Hero impactante com prova de capacidade',
  'Catalogo por categoria e curadoria',
  'Pagina de evento com narrativa e ticketing',
  'Checkout premium com lotes, cupom e beneficios',
  'Area publica do participante',
]

const mobileModules = [
  'Home contextual por evento',
  'Credencial digital e ingresso',
  'Agenda por trilha ou arena',
  'Mapa, acessos e info util',
  'Perfil, status e notificacoes',
]

const backofficeModules = [
  'Dashboard executivo',
  'Eventos',
  'Vendas e inscricoes',
  'Lotes e cupons',
  'Credenciamento e check-in',
  'Participantes e CRM',
  'Comunicacao',
  'Equipe e operacao',
  'Fornecedores',
  'Financeiro',
  'Documentos e governanca',
  'Branding e configuracoes',
]

const paletteGroups = [
  {
    title: 'Core surfaces',
    items: [
      ['Pitch black', '#050507'],
      ['Carbon', '#0d0f14'],
      ['Graphite', '#181b22'],
      ['Steel mist', '#2a303b'],
      ['Refined bone', '#f1ece3'],
    ],
  },
  {
    title: 'Brand signatures',
    items: [
      ['Animalz purple', '#5c1eb2'],
      ['Night plum', '#2f0f52'],
      ['Controlled gold', '#c79b44'],
      ['Champagne line', '#d8c39a'],
      ['Signal white', '#fffaf0'],
    ],
  },
  {
    title: 'System accents',
    items: [
      ['Success', '#4d9d72'],
      ['Warning', '#ce9250'],
      ['Critical', '#c15b5b'],
      ['Info', '#7c94d8'],
      ['Mute', '#7f8797'],
    ],
  },
]

const componentCards = [
  { title: 'CTA', value: 'Primary / Secondary / Ghost' },
  { title: 'Table state', value: 'Readable rows with quiet separators' },
  { title: 'Filters', value: 'Rounded chips with executive density' },
  { title: 'Status', value: 'Premium badges and activity rails' },
  { title: 'Panels', value: 'Command cards with depth and grid logic' },
  { title: 'Loading', value: 'Dark skeletons with subtle pulse' },
]

function SectionHeading({
  index,
  title,
  copy,
}: {
  index: string
  title: string
  copy: string
}) {
  return (
    <div className="max-w-[840px]">
      <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[11px] uppercase tracking-[0.34em] text-[#d8c39a]">
        <span className="font-mono text-white/45">{index}</span>
        {title}
      </div>
      <h2 className="mt-5 font-display text-[clamp(2.9rem,7vw,5.8rem)] uppercase leading-[0.9] tracking-[-0.05em] text-[#f5f2ec]">
        {title}
      </h2>
      <p className="mt-5 max-w-[760px] text-[15px] leading-8 text-white/62">{copy}</p>
    </div>
  )
}

function SurfaceCard({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={`rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.03)_100%)] shadow-[0_24px_80px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl ${className ?? ''}`}
    >
      {children}
    </div>
  )
}

function PhoneFrame({
  title,
  eyebrow,
  children,
}: {
  title: string
  eyebrow: string
  children: ReactNode
}) {
  return (
    <div className="relative mx-auto w-[250px] rounded-[38px] border border-white/12 bg-[#08080b] p-3 shadow-[0_28px_80px_rgba(0,0,0,0.45)]">
      <div className="absolute left-1/2 top-3 h-6 w-28 -translate-x-1/2 rounded-full bg-black/70" />
      <div className="overflow-hidden rounded-[30px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(124,53,225,0.55),rgba(9,10,14,0.98)_42%),linear-gradient(180deg,#17141d_0%,#090a0e_100%)] p-5">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.26em] text-white/45">
          <span>{eyebrow}</span>
          <span>09:41</span>
        </div>
        <div className="mt-5 font-display text-[2.7rem] uppercase leading-[0.88] tracking-[-0.05em] text-[#fff8ef]">
          {title}
        </div>
        {children}
      </div>
    </div>
  )
}

export function HomePage({ onLogin }: { onLogin: () => void }) {
  useSeoMeta({
    title: 'Animalz Events | Premium event operating system',
    description:
      'Animalz Events is positioned as a premium event operating system spanning public acquisition, participant experience, and producer backoffice control.',
    image: '/logo.png',
    url: typeof window !== 'undefined' ? window.location.href : '/',
  })

  return (
    <div className="min-h-screen bg-[#050507] text-[#f5f2ec]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(92,30,178,0.22),transparent_26%),radial-gradient(circle_at_82%_18%,rgba(199,155,68,0.16),transparent_18%),linear-gradient(180deg,#060608_0%,#050507_42%,#09090d_100%)]" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
            backgroundSize: '88px 88px',
            maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.95), rgba(0,0,0,0.15))',
          }}
        />
        <div className="absolute left-[-10rem] top-[8rem] h-[30rem] w-[30rem] rounded-full bg-[#6d2fe5]/20 blur-[120px]" />
        <div className="absolute bottom-[-8rem] right-[-3rem] h-[26rem] w-[26rem] rounded-full bg-[#c79b44]/12 blur-[120px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/8 bg-[#070709]/72 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1540px] items-center justify-between gap-5 px-5 py-4 md:px-8 lg:px-10">
          <a href="/" className="inline-flex items-center gap-4">
            <img src="/logo.png" alt="Animalz Events" className="h-10 w-auto object-contain" />
            <div>
              <div className="text-[11px] uppercase tracking-[0.34em] text-white/44">Animalz Events</div>
              <div className="text-sm text-white/76">Premium event operating system</div>
            </div>
          </a>

          <nav className="hidden items-center gap-2 xl:flex">
            {[
              ['#diagnostico', 'Diagnostico'],
              ['#direcao', 'Brand UI'],
              ['#arquitetura', 'Arquitetura'],
              ['#sistema', 'Design system'],
              ['#ui-final', 'UI final'],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="rounded-full border border-transparent px-4 py-2 text-xs uppercase tracking-[0.22em] text-white/54 transition-all hover:border-white/10 hover:bg-white/[0.04] hover:text-white"
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#ui-final"
              className="hidden rounded-full border border-white/10 px-5 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-white/76 transition-all hover:bg-white/[0.04] sm:inline-flex"
            >
              View concept
            </a>
            <button
              type="button"
              onClick={onLogin}
              className="inline-flex items-center gap-2 rounded-full bg-[#f5f2ec] px-5 py-3 text-xs font-bold uppercase tracking-[0.24em] text-[#09090c] transition-all hover:-translate-y-0.5 hover:bg-[#c79b44]"
            >
              Producer login
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="px-5 pb-20 pt-14 md:px-8 lg:px-10 lg:pb-28 lg:pt-20">
          <div className="mx-auto grid max-w-[1540px] gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-end">
            <div className="max-w-[820px]">
              <div className="inline-flex items-center gap-3 rounded-full border border-[#d8c39a]/25 bg-[#d8c39a]/8 px-4 py-2 text-[11px] uppercase tracking-[0.34em] text-[#d8c39a]">
                <Sparkles className="h-3.5 w-3.5" />
                Redesigned from system to brand to experience
              </div>

              <h1 className="mt-8 font-display text-[clamp(4.8rem,12vw,11rem)] uppercase leading-[0.84] tracking-[-0.06em] text-[#fff8ef]">
                Animalz
                <span className="block text-[#7a3ff0]">events</span>
              </h1>

              <p className="mt-8 max-w-[720px] text-[19px] leading-9 text-white/66">
                A premium event operating system for public launch, participant access, and
                producer command. Cinematic where it should sell. Executive where it should
                decide. Cohesive everywhere.
              </p>

              <div className="mt-10 flex flex-wrap gap-3">
                {[
                  'Front aspiracional',
                  'Mobile premium',
                  'Backoffice enterprise',
                  'Themeable by category',
                ].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/64"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-12 grid gap-4 md:grid-cols-3">
                {[
                  ['03', 'Connected layers'],
                  ['12+', 'Producer modules'],
                  ['04', 'Category skins'],
                ].map(([value, label]) => (
                  <SurfaceCard key={label} className="p-5">
                    <div className="font-display text-[3rem] leading-none tracking-[-0.05em] text-[#fff8ef]">
                      {value}
                    </div>
                    <div className="mt-2 text-[11px] uppercase tracking-[0.28em] text-white/44">
                      {label}
                    </div>
                  </SurfaceCard>
                ))}
              </div>
            </div>

            <SurfaceCard className="overflow-hidden p-6 lg:p-8">
              <div className="grid gap-5">
                <div className="flex items-center justify-between border-b border-white/8 pb-5">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.34em] text-white/42">
                      Product architecture
                    </div>
                    <div className="mt-2 font-display text-[2.2rem] uppercase leading-none tracking-[-0.04em]">
                      Unified control surface
                    </div>
                  </div>
                  <div className="rounded-full border border-[#c79b44]/30 bg-[#c79b44]/10 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-[#d8c39a]">
                    Premium neutral core
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-[0.95fr_1.05fr]">
                  <div className="space-y-4">
                    {[
                      {
                        label: 'Public',
                        title: 'Demand engine',
                        copy: 'Brand, discovery, event pages, checkout.',
                        accent: '#7a3ff0',
                      },
                      {
                        label: 'Mobile',
                        title: 'Experience layer',
                        copy: 'Credential, schedule, map, status, alerts.',
                        accent: '#c79b44',
                      },
                      {
                        label: 'Backoffice',
                        title: 'Command center',
                        copy: 'Operations, finance, staff, CRM, governance.',
                        accent: '#f5f2ec',
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-[24px] border border-white/8 bg-black/18 p-5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">
                            {item.label}
                          </div>
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: item.accent }}
                          />
                        </div>
                        <div className="mt-4 font-display text-[1.8rem] uppercase leading-none tracking-[-0.04em] text-white">
                          {item.title}
                        </div>
                        <p className="mt-3 text-sm leading-7 text-white/56">{item.copy}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        ['Executive pulse', 'Gross revenue + access + risk + occupancy'],
                        ['Credential state', 'VIP / guest / sector / QR / alerts'],
                        ['Sales system', 'Batches, coupons, public demand, channels'],
                        ['Governance', 'Contracts, approvals, audit trail, finance'],
                      ].map(([title, copy]) => (
                        <div
                          key={title}
                          className="rounded-[22px] border border-white/8 bg-black/16 p-4"
                        >
                          <div className="text-[10px] uppercase tracking-[0.28em] text-white/38">
                            Node
                          </div>
                          <div className="mt-3 font-semibold text-white/92">{title}</div>
                          <div className="mt-2 text-sm leading-6 text-white/50">{copy}</div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center justify-between rounded-[22px] border border-white/8 bg-black/18 px-4 py-4 text-sm text-white/58">
                      <span>Navigation logic</span>
                      <span className="inline-flex items-center gap-2 text-[#d8c39a]">
                        public
                        <ChevronRight className="h-4 w-4" />
                        mobile
                        <ChevronRight className="h-4 w-4" />
                        backoffice
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </SurfaceCard>
          </div>
        </section>

        <section id="diagnostico" className="px-5 py-20 md:px-8 lg:px-10 lg:py-28">
          <div className="mx-auto max-w-[1540px]">
            <SectionHeading
              index="01"
              title="Diagnostico da referencia"
              copy="The attached references were treated as mandatory directional inputs for atmosphere, hierarchy, finish, and brand presence. The goal is translation, not imitation."
            />

            <div className="mt-12 grid gap-5 xl:grid-cols-3">
              {diagnosticSignals.map((signal) => (
                <SurfaceCard key={signal.source} className="p-7">
                  <div className="text-[10px] uppercase tracking-[0.34em] text-[#d8c39a]">
                    {signal.source}
                  </div>
                  <div className="mt-4 font-display text-[2rem] uppercase leading-[0.92] tracking-[-0.04em] text-white">
                    {signal.summary}
                  </div>

                  <div className="mt-6 space-y-3">
                    {signal.absorbed.map((item) => (
                      <div key={item} className="flex items-start gap-3 text-sm leading-7 text-white/64">
                        <CheckCircle2 className="mt-1 h-4 w-4 flex-none text-[#c79b44]" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 rounded-[22px] border border-white/8 bg-black/18 p-4">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-white/36">
                      Translation
                    </div>
                    <p className="mt-3 text-sm leading-7 text-white/60">{signal.translated}</p>
                  </div>

                  <div className="mt-4 rounded-[22px] border border-[#7a3ff0]/20 bg-[#7a3ff0]/8 p-4">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-white/36">
                      Not copied literally
                    </div>
                    <p className="mt-3 text-sm leading-7 text-white/60">{signal.avoid}</p>
                  </div>
                </SurfaceCard>
              ))}
            </div>
          </div>
        </section>

        <section id="direcao" className="px-5 py-20 md:px-8 lg:px-10 lg:py-28">
          <div className="mx-auto max-w-[1540px]">
            <SectionHeading
              index="02"
              title="Brand UI direction"
              copy="Animalz Events is positioned as a premium event operating platform for high-performance productions. The visual language balances authority, energy, exclusivity, and operational confidence."
            />

            <div className="mt-12 grid gap-5 lg:grid-cols-[0.92fr_1.08fr]">
              <SurfaceCard className="p-7">
                <div className="text-[10px] uppercase tracking-[0.34em] text-[#d8c39a]">
                  Official concept
                </div>
                <div className="mt-4 font-display text-[clamp(3rem,6vw,5rem)] uppercase leading-[0.88] tracking-[-0.05em] text-white">
                  Editorial command
                </div>
                <p className="mt-5 max-w-[540px] text-[15px] leading-8 text-white/64">
                  The product behaves like a premium operating room for events. Public surfaces sell
                  desire. Mobile surfaces reinforce status and access. Producer surfaces organize
                  complexity with control, speed, and calm.
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {[
                    'Dark premium foundation',
                    'Cinematic contrast',
                    'Controlled purple and gold',
                    'Real breathing space',
                    'High-trust operational UI',
                    'International polish',
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-[20px] border border-white/8 bg-black/18 px-4 py-4 text-sm text-white/68"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </SurfaceCard>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {principles.map((principle) => {
                  const Icon = principle.icon
                  return (
                    <SurfaceCard key={principle.title} className="p-6">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                        <Icon className="h-5 w-5 text-[#d8c39a]" />
                      </div>
                      <div className="mt-6 font-display text-[2rem] uppercase leading-[0.92] tracking-[-0.04em] text-white">
                        {principle.title}
                      </div>
                      <p className="mt-4 text-sm leading-7 text-white/58">{principle.copy}</p>
                    </SurfaceCard>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        <section id="arquitetura" className="px-5 py-20 md:px-8 lg:px-10 lg:py-28">
          <div className="mx-auto max-w-[1540px]">
            <SectionHeading
              index="03"
              title="Product architecture"
              copy="The platform is organized as three connected layers with one shared event core. Each layer has its own intensity, but the navigation logic stays coherent from discovery to execution."
            />

            <div className="mt-12 grid gap-5 xl:grid-cols-3">
              {layers.map((layer) => {
                const Icon = layer.icon
                return (
                  <SurfaceCard key={layer.title} className="p-7">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] uppercase tracking-[0.34em] text-[#d8c39a]">
                        {layer.eyebrow}
                      </div>
                      <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                        <Icon className="h-5 w-5 text-white/80" />
                      </div>
                    </div>

                    <div className="mt-5 font-display text-[2.2rem] uppercase leading-[0.92] tracking-[-0.04em] text-white">
                      {layer.title}
                    </div>
                    <p className="mt-4 text-sm leading-7 text-white/58">{layer.copy}</p>

                    <div className="mt-6 space-y-3 rounded-[24px] border border-white/8 bg-black/18 p-5">
                      <div className="text-[10px] uppercase tracking-[0.3em] text-white/36">
                        Sitemap / module structure
                      </div>
                      {layer.modules.map((item) => (
                        <div key={item} className="flex items-start gap-3 text-sm leading-7 text-white/62">
                          <ChevronRight className="mt-1 h-4 w-4 flex-none text-[#7a3ff0]" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 rounded-[24px] border border-white/8 bg-black/18 p-5">
                      <div className="text-[10px] uppercase tracking-[0.3em] text-white/36">
                        Navigation logic
                      </div>
                      <p className="mt-3 text-sm leading-7 text-white/58">{layer.navigation}</p>
                    </div>
                  </SurfaceCard>
                )
              })}
            </div>

            <SurfaceCard className="mt-5 p-7">
              <div className="grid gap-5 lg:grid-cols-[0.78fr_1.22fr]">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.34em] text-[#d8c39a]">
                    Backoffice module map
                  </div>
                  <div className="mt-4 font-display text-[2.6rem] uppercase leading-[0.9] tracking-[-0.05em] text-white">
                    Producer command structure
                  </div>
                  <p className="mt-4 text-sm leading-7 text-white/58">
                    The producer environment should feel like an executive cockpit, not a
                    commodity dashboard. Modules are organized by business outcome and event
                    operation priority.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {backofficeModules.map((module) => (
                    <div
                      key={module}
                      className="rounded-[20px] border border-white/8 bg-black/18 px-4 py-4 text-sm text-white/64"
                    >
                      {module}
                    </div>
                  ))}
                </div>
              </div>
            </SurfaceCard>
          </div>
        </section>

        <section id="sistema" className="px-5 py-20 md:px-8 lg:px-10 lg:py-28">
          <div className="mx-auto max-w-[1540px]">
            <SectionHeading
              index="04"
              title="Design system"
              copy="The system is built around dark premium surfaces, controlled signature accents, disciplined spacing, and a strict separation between aspirational display moments and operational interface typography."
            />

            <div className="mt-12 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-5">
                <SurfaceCard className="p-7">
                  <div className="text-[10px] uppercase tracking-[0.34em] text-[#d8c39a]">
                    Color tokens
                  </div>
                  <div className="mt-5 space-y-6">
                    {paletteGroups.map((group) => (
                      <div key={group.title}>
                        <div className="text-xs uppercase tracking-[0.22em] text-white/44">
                          {group.title}
                        </div>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                          {group.items.map(([label, color]) => (
                            <div key={label} className="space-y-3">
                              <div
                                className="h-20 rounded-[18px] border border-white/10"
                                style={{ backgroundColor: color }}
                              />
                              <div className="text-xs text-white/72">{label}</div>
                              <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/34">
                                {color}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </SurfaceCard>

                <SurfaceCard className="p-7">
                  <div className="text-[10px] uppercase tracking-[0.34em] text-[#d8c39a]">
                    Grid, spacing, radius, shadows
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {[
                      ['Grid', '12-column public grid, 4-column mobile logic, 12-column backoffice shell.'],
                      ['Spacing', '4 / 8 / 12 / 16 / 24 / 32 / 48 / 72 / 96 rhythm.'],
                      ['Radius', '18-20 for components, 28-32 for hero or editorial containers.'],
                      ['Shadows', 'Soft depth, long dark falloff, no candy glow.'],
                    ].map(([title, copy]) => (
                      <div
                        key={title}
                        className="rounded-[22px] border border-white/8 bg-black/18 p-5"
                      >
                        <div className="text-[10px] uppercase tracking-[0.3em] text-white/36">
                          {title}
                        </div>
                        <p className="mt-3 text-sm leading-7 text-white/58">{copy}</p>
                      </div>
                    ))}
                  </div>
                </SurfaceCard>
              </div>

              <div className="space-y-5">
                <SurfaceCard className="p-7">
                  <div className="text-[10px] uppercase tracking-[0.34em] text-[#d8c39a]">
                    Typography system
                  </div>
                  <div className="mt-5 rounded-[26px] border border-white/8 bg-black/18 p-6">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-white/34">
                      Display
                    </div>
                    <div className="mt-4 font-display text-[clamp(3rem,7vw,5.8rem)] uppercase leading-[0.86] tracking-[-0.05em] text-white">
                      Brand headlines
                    </div>
                    <p className="mt-4 max-w-[420px] text-sm leading-7 text-white/58">
                      Compressed, assertive, cinematic. Used for front heroes, event chapters, and
                      major system moments.
                    </p>
                  </div>

                  <div className="mt-4 rounded-[26px] border border-white/8 bg-black/18 p-6">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-white/34">
                      Interface
                    </div>
                    <div className="mt-4 text-[2rem] font-semibold leading-tight text-white">
                      Operational reading and decision support
                    </div>
                    <p className="mt-4 max-w-[420px] text-sm leading-7 text-white/58">
                      Cleaner, quieter, and more neutral. Optimized for tables, forms, metrics,
                      filters, and layered navigation.
                    </p>
                  </div>
                </SurfaceCard>

                <SurfaceCard className="p-7">
                  <div className="text-[10px] uppercase tracking-[0.34em] text-[#d8c39a]">
                    Core components
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {componentCards.map((card) => (
                      <div
                        key={card.title}
                        className="rounded-[22px] border border-white/8 bg-black/18 p-5"
                      >
                        <div className="text-[10px] uppercase tracking-[0.3em] text-white/36">
                          {card.title}
                        </div>
                        <div className="mt-3 text-sm leading-7 text-white/60">{card.value}</div>
                      </div>
                    ))}
                  </div>
                </SurfaceCard>
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 py-20 md:px-8 lg:px-10 lg:py-28">
          <div className="mx-auto max-w-[1540px]">
            <SectionHeading
              index="05"
              title="Category theme logic"
              copy="Animalz keeps a premium neutral system core, then applies editorial atmosphere per event category. Themes alter image treatment, accent balance, and contextual storytelling without breaking the platform grammar."
            />

            <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {categoryThemes.map((theme) => (
                <SurfaceCard key={theme.name} className="overflow-hidden p-0">
                  <div
                    className="h-36 border-b border-white/8"
                    style={{
                      background: `radial-gradient(circle at top, ${theme.accent}55, transparent 38%), linear-gradient(145deg, ${theme.support}, #09090c 72%)`,
                    }}
                  />
                  <div className="p-6">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-white/36">
                      {theme.mood}
                    </div>
                    <div className="mt-4 font-display text-[2rem] uppercase leading-[0.92] tracking-[-0.04em] text-white">
                      {theme.name}
                    </div>
                    <p className="mt-4 text-sm leading-7 text-white/58">{theme.copy}</p>
                    <div className="mt-5 flex items-center gap-2">
                      <span
                        className="h-3 w-16 rounded-full"
                        style={{ backgroundColor: theme.accent }}
                      />
                      <span
                        className="h-3 w-16 rounded-full"
                        style={{ backgroundColor: theme.support }}
                      />
                    </div>
                  </div>
                </SurfaceCard>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-20 md:px-8 lg:px-10 lg:py-28">
          <div className="mx-auto max-w-[1540px]">
            <SectionHeading
              index="06"
              title="Wireframes de alto nivel"
              copy="These are high-level structural blueprints for the three connected layers. The focus is hierarchy, module composition, and navigation behavior before final polish."
            />

            <div className="mt-12 grid gap-5 xl:grid-cols-3">
              <SurfaceCard className="p-7">
                <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-[#d8c39a]">
                  <MonitorSmartphone className="h-4 w-4" />
                  Front publico
                </div>
                <div className="mt-5 rounded-[24px] border border-white/8 bg-black/18 p-4">
                  <div className="h-40 rounded-[20px] border border-white/8 bg-[linear-gradient(180deg,rgba(124,53,225,0.26),rgba(7,7,10,0.96))] p-4">
                    <div className="h-3 w-28 rounded-full bg-white/24" />
                    <div className="mt-8 h-5 w-4/5 rounded-full bg-white/12" />
                    <div className="mt-3 h-5 w-3/5 rounded-full bg-white/12" />
                    <div className="mt-8 flex gap-3">
                      <div className="h-11 w-36 rounded-full bg-[#f5f2ec]" />
                      <div className="h-11 w-32 rounded-full border border-white/12" />
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3">
                    {[frontModules[0], frontModules[1], frontModules[2], frontModules[3], frontModules[4]].map((item) => (
                      <div key={item} className="rounded-[18px] border border-white/8 px-4 py-4 text-sm text-white/60">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </SurfaceCard>

              <SurfaceCard className="p-7">
                <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-[#d8c39a]">
                  <BellRing className="h-4 w-4" />
                  Mobile participante
                </div>
                <div className="mt-5 flex justify-center rounded-[24px] border border-white/8 bg-black/18 p-4">
                  <div className="relative w-[240px] rounded-[34px] border border-white/10 bg-[#08080b] p-3">
                    <div className="absolute left-1/2 top-3 h-6 w-24 -translate-x-1/2 rounded-full bg-black/80" />
                    <div className="overflow-hidden rounded-[28px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(199,155,68,0.34),rgba(8,8,11,0.98)_44%),linear-gradient(180deg,#1a151d_0%,#09090d_100%)] p-4">
                      <div className="h-28 rounded-[20px] border border-white/8 bg-white/6" />
                      <div className="mt-4 h-4 w-2/3 rounded-full bg-white/12" />
                      <div className="mt-3 h-4 w-1/2 rounded-full bg-white/12" />
                      <div className="mt-6 space-y-3">
                        {mobileModules.slice(0, 4).map((item) => (
                          <div
                            key={item}
                            className="rounded-[16px] border border-white/8 bg-black/14 px-3 py-3 text-xs text-white/60"
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </SurfaceCard>

              <SurfaceCard className="p-7">
                <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-[#d8c39a]">
                  <LayoutDashboard className="h-4 w-4" />
                  Backoffice produtor
                </div>
                <div className="mt-5 rounded-[24px] border border-white/8 bg-black/18 p-4">
                  <div className="grid gap-3 lg:grid-cols-[220px_1fr]">
                    <div className="rounded-[20px] border border-white/8 bg-white/[0.03] p-4">
                      <div className="h-5 w-28 rounded-full bg-white/12" />
                      <div className="mt-6 space-y-3">
                        {['Pulse', 'Eventos', 'Vendas', 'Acesso', 'Financeiro', 'Governanca'].map((item) => (
                          <div key={item} className="h-10 rounded-[14px] bg-white/8" />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="grid gap-3 sm:grid-cols-3">
                        {[1, 2, 3].map((item) => (
                          <div key={item} className="h-24 rounded-[18px] border border-white/8 bg-white/[0.04]" />
                        ))}
                      </div>
                      <div className="grid gap-3 sm:grid-cols-[1.1fr_0.9fr]">
                        <div className="h-52 rounded-[20px] border border-white/8 bg-white/[0.04]" />
                        <div className="space-y-3">
                          <div className="h-[100px] rounded-[20px] border border-white/8 bg-white/[0.04]" />
                          <div className="h-[100px] rounded-[20px] border border-white/8 bg-white/[0.04]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </SurfaceCard>
            </div>
          </div>
        </section>

        <section id="ui-final" className="px-5 py-20 md:px-8 lg:px-10 lg:py-28">
          <div className="mx-auto max-w-[1540px]">
            <SectionHeading
              index="07"
              title="UI final"
              copy="The final expression turns the strategy into one cohesive visual system. The front is more emotional, the mobile more immersive, and the backoffice more executive, while all three keep the same Animalz signature."
            />

            <div className="mt-12 grid gap-5">
              <SurfaceCard className="overflow-hidden p-0">
                <div className="grid gap-0 lg:grid-cols-[1.08fr_0.92fr]">
                  <div className="relative overflow-hidden border-b border-white/8 p-7 lg:border-b-0 lg:border-r lg:p-10">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(122,63,240,0.22),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(199,155,68,0.18),transparent_24%)]" />
                    <div className="relative">
                      <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[10px] uppercase tracking-[0.34em] text-[#d8c39a]">
                        Public platform front
                      </div>
                      <div className="mt-7 font-display text-[clamp(3.5rem,7vw,7rem)] uppercase leading-[0.84] tracking-[-0.05em] text-white">
                        Run event worlds
                        <span className="block text-[#c79b44]">from one core</span>
                      </div>
                      <p className="mt-5 max-w-[520px] text-[15px] leading-8 text-white/60">
                        Homepage, event catalog, event page, checkout, and participant access
                        behave like one editorial commerce system instead of disconnected pages.
                      </p>

                      <div className="mt-9 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                        <div className="rounded-[28px] border border-white/10 bg-black/24 p-5">
                          <div className="aspect-[16/10] rounded-[22px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02)),radial-gradient(circle_at_top,rgba(122,63,240,0.3),transparent_40%),linear-gradient(180deg,#15131b_0%,#08080b_100%)] p-5">
                            <div className="flex items-center justify-between">
                              <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-white/56">
                                Hero
                              </span>
                              <span className="rounded-full bg-[#f5f2ec] px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-[#09090c]">
                                CTA
                              </span>
                            </div>
                            <div className="mt-8 h-5 w-4/5 rounded-full bg-white/12" />
                            <div className="mt-3 h-5 w-3/5 rounded-full bg-white/12" />
                            <div className="mt-8 grid gap-3 sm:grid-cols-3">
                              {[1, 2, 3].map((item) => (
                                <div key={item} className="h-20 rounded-[18px] border border-white/8 bg-white/[0.04]" />
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {[
                            ['Discovery grid', 'Editorial cards by category and season'],
                            ['Event detail', 'Storytelling, ticketing, schedule, and access'],
                            ['Checkout', 'Batches, coupons, benefits, and confidence cues'],
                          ].map(([title, copy]) => (
                            <div
                              key={title}
                              className="rounded-[24px] border border-white/8 bg-black/18 p-5"
                            >
                              <div className="text-[10px] uppercase tracking-[0.28em] text-white/36">
                                Module
                              </div>
                              <div className="mt-3 font-semibold text-white">{title}</div>
                              <div className="mt-2 text-sm leading-7 text-white/56">{copy}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-7 lg:p-10">
                    <div className="text-[10px] uppercase tracking-[0.34em] text-[#d8c39a]">
                      Participant mobile
                    </div>
                    <div className="mt-4 font-display text-[2.8rem] uppercase leading-[0.9] tracking-[-0.05em] text-white">
                      Premium access on hand
                    </div>
                    <div className="mt-7 flex flex-wrap justify-center gap-6">
                      <PhoneFrame title="Access" eyebrow="Credential">
                        <div className="mt-8 rounded-[26px] border border-white/10 bg-black/24 p-4">
                          <div className="text-[10px] uppercase tracking-[0.26em] text-white/36">
                            VIP credential
                          </div>
                          <div className="mt-4 font-display text-[2rem] uppercase leading-none tracking-[-0.04em] text-white">
                            BSB Fight
                          </div>
                          <div className="mt-4 flex items-center justify-between rounded-[18px] border border-white/8 bg-white/[0.04] px-4 py-3 text-sm text-white/62">
                            <span>Sector A1</span>
                            <QrCode className="h-4 w-4 text-[#d8c39a]" />
                          </div>
                        </div>
                        <div className="mt-4 flex items-center gap-3 rounded-[18px] border border-white/8 bg-white/[0.04] px-4 py-3 text-sm text-white/58">
                          <ShieldCheck className="h-4 w-4 text-[#d8c39a]" />
                          Gate access, parking, and host status
                        </div>
                      </PhoneFrame>

                      <PhoneFrame title="Agenda" eyebrow="Live program">
                        <div className="mt-8 space-y-3">
                          {[
                            ['09:30', 'Doors and accreditation'],
                            ['11:00', 'Warmup and grid access'],
                            ['14:15', 'Main session'],
                          ].map(([time, item]) => (
                            <div
                              key={time}
                              className="rounded-[18px] border border-white/8 bg-black/18 px-4 py-4"
                            >
                              <div className="text-[10px] uppercase tracking-[0.28em] text-[#d8c39a]">
                                {time}
                              </div>
                              <div className="mt-2 text-sm text-white/66">{item}</div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 rounded-[18px] border border-white/8 bg-white/[0.04] px-4 py-3 text-sm text-white/58">
                          Live updates, route changes, and schedule reminders
                        </div>
                      </PhoneFrame>

                      <PhoneFrame title="Explore" eyebrow="Map and info">
                        <div className="mt-8 h-40 rounded-[24px] border border-white/8 bg-[radial-gradient(circle_at_center,rgba(199,155,68,0.2),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))]" />
                        <div className="mt-4 grid gap-3">
                          {[
                            'Food court and hospitality',
                            'Arena map and best routes',
                            'Parking and credential desk',
                          ].map((item) => (
                            <div
                              key={item}
                              className="rounded-[16px] border border-white/8 bg-black/18 px-4 py-3 text-sm text-white/58"
                            >
                              {item}
                            </div>
                          ))}
                        </div>
                      </PhoneFrame>
                    </div>
                  </div>
                </div>
              </SurfaceCard>

              <SurfaceCard className="p-7 lg:p-10">
                <div className="grid gap-6 lg:grid-cols-[0.3fr_0.7fr]">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.34em] text-[#d8c39a]">
                      Producer backoffice
                    </div>
                    <div className="mt-4 font-display text-[clamp(2.8rem,6vw,5.5rem)] uppercase leading-[0.88] tracking-[-0.05em] text-white">
                      Executive cockpit
                    </div>
                    <p className="mt-4 max-w-[360px] text-sm leading-8 text-white/58">
                      A premium command layer for sales, access, CRM, operations, finance, and
                      governance. Cleaner, calmer, and more expensive-looking than a commodity admin.
                    </p>

                    <div className="mt-6 space-y-3">
                      {[
                        { icon: LayoutDashboard, label: 'Executive dashboard' },
                        { icon: Ticket, label: 'Sales and registrations' },
                        { icon: QrCode, label: 'Accreditation and check-in' },
                        { icon: Users, label: 'Staff and operations' },
                        { icon: CircleDollarSign, label: 'Finance and closure' },
                        { icon: FileCheck2, label: 'Documents and governance' },
                      ].map(({ icon: ItemIcon, label }) => {
                        return (
                          <div
                            key={label}
                            className="flex items-center gap-3 rounded-[18px] border border-white/8 bg-black/18 px-4 py-3 text-sm text-white/62"
                          >
                            <ItemIcon className="h-4 w-4 text-[#d8c39a]" />
                            {label}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-4">
                    <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
                      <div className="rounded-[24px] border border-white/8 bg-black/22 p-4">
                        <div className="flex items-center gap-3 border-b border-white/8 pb-4">
                          <img src="/logo.png" alt="" aria-hidden="true" className="h-8 w-auto" />
                          <div>
                            <div className="text-[10px] uppercase tracking-[0.26em] text-white/36">
                              Event core
                            </div>
                            <div className="text-sm text-white/76">Capital Strike 2026</div>
                          </div>
                        </div>
                        <div className="mt-5 space-y-2">
                          {[
                            'Pulse',
                            'Events',
                            'Orders',
                            'Access',
                            'CRM',
                            'Communication',
                            'Staff',
                            'Suppliers',
                            'Finance',
                            'Governance',
                            'Branding',
                          ].map((item, index) => (
                            <div
                              key={item}
                              className={`rounded-[16px] px-4 py-3 text-sm ${
                                index === 0
                                  ? 'border border-[#d8c39a]/20 bg-[#d8c39a]/8 text-[#f5f2ec]'
                                  : 'border border-white/8 bg-white/[0.03] text-white/54'
                              }`}
                            >
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-4">
                          {[
                            { icon: Gauge, label: 'Occupancy', value: '92%' },
                            { icon: WalletCards, label: 'Gross revenue', value: 'R$ 4.8M' },
                            { icon: QrCode, label: 'Check-in pace', value: '4.2k/h' },
                            { icon: MessageSquareMore, label: 'Alerts', value: '03' },
                          ].map(({ icon: ItemIcon, label, value }) => {
                            return (
                              <div
                                key={label}
                                className="rounded-[22px] border border-white/8 bg-black/18 p-4"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="text-[10px] uppercase tracking-[0.28em] text-white/36">
                                    {label}
                                  </div>
                                  <ItemIcon className="h-4 w-4 text-[#d8c39a]" />
                                </div>
                                <div className="mt-5 font-display text-[2.4rem] leading-none tracking-[-0.05em] text-white">
                                  {value}
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        <div className="grid gap-4 lg:grid-cols-[1.18fr_0.82fr]">
                          <div className="rounded-[24px] border border-white/8 bg-black/18 p-5">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-[10px] uppercase tracking-[0.28em] text-white/36">
                                  Revenue and conversion
                                </div>
                                <div className="mt-2 text-sm text-white/72">
                                  Ticket sales, registrations, and payment health
                                </div>
                              </div>
                              <CircleDollarSign className="h-5 w-5 text-[#d8c39a]" />
                            </div>
                            <div className="mt-8 h-52 rounded-[20px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-4">
                              <div className="flex h-full items-end gap-3">
                                {[30, 48, 38, 56, 62, 74, 68, 86].map((height, index) => (
                                  <div
                                    key={`${height}-${index}`}
                                    className="flex-1 rounded-t-[14px] bg-[linear-gradient(180deg,#7a3ff0,#c79b44)] opacity-90"
                                    style={{ height: `${height}%` }}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="rounded-[24px] border border-white/8 bg-black/18 p-5">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-[10px] uppercase tracking-[0.28em] text-white/36">
                                    Accreditation
                                  </div>
                                  <div className="mt-2 text-sm text-white/72">
                                    Gate pressure and sector control
                                  </div>
                                </div>
                                <ShieldCheck className="h-5 w-5 text-[#d8c39a]" />
                              </div>
                              <div className="mt-5 space-y-3">
                                {[
                                  ['Main gate', 'Stable'],
                                  ['VIP lane', 'Attention'],
                                  ['Arena 02', 'Nominal'],
                                ].map(([lane, state]) => (
                                  <div
                                    key={lane}
                                    className="flex items-center justify-between rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm"
                                  >
                                    <span className="text-white/68">{lane}</span>
                                    <span className="text-[#d8c39a]">{state}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="rounded-[24px] border border-white/8 bg-black/18 p-5">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-[10px] uppercase tracking-[0.28em] text-white/36">
                                    Governance rail
                                  </div>
                                  <div className="mt-2 text-sm text-white/72">
                                    Documents, approvals, and financial closure
                                  </div>
                                </div>
                                <Cpu className="h-5 w-5 text-[#d8c39a]" />
                              </div>
                              <div className="mt-5 space-y-3">
                                {[
                                  { icon: CalendarRange, label: 'Supplier contract review' },
                                  { icon: BriefcaseBusiness, label: 'Payout forecast confirmed' },
                                  { icon: MapPinned, label: 'Operational map published' },
                                ].map(({ icon: ItemIcon, label }) => {
                                  return (
                                    <div
                                      key={label}
                                      className="flex items-center gap-3 rounded-[18px] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/64"
                                    >
                                      <ItemIcon className="h-4 w-4 text-[#7a3ff0]" />
                                      {label}
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </SurfaceCard>
            </div>
          </div>
        </section>

        <section className="px-5 pb-20 pt-10 md:px-8 lg:px-10 lg:pb-28">
          <div className="mx-auto max-w-[1540px]">
            <SurfaceCard className="overflow-hidden p-7 lg:p-10">
              <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.34em] text-[#d8c39a]">
                    Outcome
                  </div>
                  <div className="mt-4 font-display text-[clamp(3rem,7vw,6.6rem)] uppercase leading-[0.86] tracking-[-0.05em] text-white">
                    One platform.
                    <span className="block text-[#c79b44]">No weak layer.</span>
                  </div>
                  <p className="mt-5 max-w-[760px] text-[15px] leading-8 text-white/60">
                    Animalz Events now reads as a premium operational product with a cinematic public
                    face, an immersive participant mobile experience, and a producer backoffice that
                    feels reliable, expensive, and in control.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <a
                    href="#diagnostico"
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white/74 transition-all hover:bg-white/[0.04]"
                  >
                    Review direction
                  </a>
                  <button
                    type="button"
                    onClick={onLogin}
                    className="inline-flex items-center gap-2 rounded-full bg-[#f5f2ec] px-5 py-3 text-xs font-bold uppercase tracking-[0.22em] text-[#09090c] transition-all hover:-translate-y-0.5 hover:bg-[#c79b44]"
                  >
                    Enter producer area
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </SurfaceCard>
          </div>
        </section>
      </main>
    </div>
  )
}

export default HomePage
