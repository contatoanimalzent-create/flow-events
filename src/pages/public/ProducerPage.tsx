import {
  ArrowRight,
  BarChart3,
  Check,
  CreditCard,
  Globe,
  LineChart,
  QrCode,
  Shield,
  Ticket,
  Users,
  Zap,
} from 'lucide-react'
import { PublicLayout } from '@/features/public'
import { usePublicLocale } from '@/features/public/lib/public-locale'

const FEATURES = [
  {
    icon: Ticket,
    titlePt: 'Venda de ingressos',
    titleEn: 'Ticket sales',
    descPt: 'Crie lotes, cupons, cortesias e controle estoque em tempo real. Checkout otimizado com taxa de conversao acima de 94%.',
    descEn: 'Create batches, coupons, complimentary tickets and control inventory in real time. Optimized checkout with 94%+ conversion rate.',
  },
  {
    icon: QrCode,
    titlePt: 'Check-in com QR Code',
    titleEn: 'QR Code check-in',
    descPt: 'Leitura instantanea por camera, validacao anti-fraude e controle de acesso por area. Funciona offline.',
    descEn: 'Instant camera scanning, anti-fraud validation and area-based access control. Works offline.',
  },
  {
    icon: Users,
    titlePt: 'Gestao de equipe',
    titleEn: 'Team management',
    descPt: 'Convide staff via link, defina funcoes e permissoes, controle ponto e avalie performance apos o evento.',
    descEn: 'Invite staff via link, set roles and permissions, track attendance and evaluate performance after the event.',
  },
  {
    icon: BarChart3,
    titlePt: 'Dashboard executivo',
    titleEn: 'Executive dashboard',
    descPt: 'Receita, conversao, ticket medio, ranking de eventos e clientes, tudo consolidado em um cockpit visual.',
    descEn: 'Revenue, conversion, average ticket, event and customer rankings, all consolidated in a visual cockpit.',
  },
  {
    icon: CreditCard,
    titlePt: 'Financeiro integrado',
    titleEn: 'Integrated finance',
    descPt: 'Receita bruta, taxas, repasses e conciliacao automatica. Exportacao contabil pronta para seu escritorio.',
    descEn: 'Gross revenue, fees, transfers and automatic reconciliation. Accounting exports ready for your office.',
  },
  {
    icon: Shield,
    titlePt: 'Credenciamento inteligente',
    titleEn: 'Smart credentialing',
    descPt: 'Inscricoes externas, formularios personalizados, aprovacao manual ou automatica e comunicacao por email.',
    descEn: 'External registrations, custom forms, manual or automatic approval and email communication.',
  },
  {
    icon: LineChart,
    titlePt: 'CRM e inteligencia',
    titleEn: 'CRM and intelligence',
    descPt: 'Base de clientes unificada, historico de compras, segmentacao e insights automaticos sobre comportamento.',
    descEn: 'Unified customer base, purchase history, segmentation and automatic behavioral insights.',
  },
  {
    icon: Globe,
    titlePt: 'Pagina publica do evento',
    titleEn: 'Public event page',
    descPt: 'Cada evento ganha uma landing page propria com galeria, programacao, mapa e checkout integrado.',
    descEn: 'Each event gets its own landing page with gallery, schedule, map and integrated checkout.',
  },
  {
    icon: Zap,
    titlePt: 'Comunicacao e notificacoes',
    titleEn: 'Communication and notifications',
    descPt: 'Emails automaticos de confirmacao, lembretes pre-evento e mensagens segmentadas para sua base.',
    descEn: 'Automatic confirmation emails, pre-event reminders and segmented messages to your audience.',
  },
]

const STATS = [
  { valuePt: '94%', valueEn: '94%', labelPt: 'Taxa de conversao', labelEn: 'Conversion rate' },
  { valuePt: '< 2s', valueEn: '< 2s', labelPt: 'Tempo de check-in', labelEn: 'Check-in time' },
  { valuePt: '24/7', valueEn: '24/7', labelPt: 'Suporte operacional', labelEn: 'Operational support' },
  { valuePt: 'R$ 0', valueEn: '$0', labelPt: 'Para comecar', labelEn: 'To get started' },
]

export function ProducerPage({ onLogin }: { onLogin: () => void }) {
  const { isPortuguese } = usePublicLocale()

  return (
    <PublicLayout onLogin={onLogin}>
      {/* Hero */}
      <section className="relative overflow-hidden px-5 pb-16 pt-12 md:px-8 md:pb-24 md:pt-16 lg:px-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,87,231,0.18),transparent_50%),radial-gradient(circle_at_80%_60%,rgba(66,133,244,0.10),transparent_40%)]" />
        <div className="relative z-10 mx-auto max-w-[1540px]">
          <div className="max-w-4xl">
            <div className="text-[10px] uppercase tracking-[0.38em] text-[#4285F4]">
              {isPortuguese ? 'Para produtores de eventos' : 'For event producers'}
            </div>
            <h1 className="mt-6 text-[clamp(3rem,7vw,6rem)] font-bold leading-[0.88] tracking-[-0.04em] text-white">
              {isPortuguese
                ? 'Tudo que voce precisa para operar eventos de verdade.'
                : 'Everything you need to run real events.'}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/58">
              {isPortuguese
                ? 'Venda, credenciamento, check-in, equipe, financeiro e inteligencia, uma plataforma completa para produtores que exigem controle total.'
                : 'Sales, credentialing, check-in, staff, finance and intelligence, a complete platform for producers who demand total control.'}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={onLogin}
                className="inline-flex items-center gap-2 rounded-full bg-[#0057E7] px-7 py-4 text-sm font-bold uppercase tracking-[0.18em] text-white shadow-[0_16px_40px_rgba(0,87,231,0.35)] transition-all hover:-translate-y-0.5 hover:bg-[#4285F4] hover:shadow-[0_20px_50px_rgba(0,87,231,0.45)]"
              >
                {isPortuguese ? 'Comecar agora' : 'Get started'}
                <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href="/events"
                className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-7 py-4 text-sm font-medium uppercase tracking-[0.18em] text-white/70 transition-all hover:border-white/20 hover:text-white"
              >
                {isPortuguese ? 'Ver eventos ativos' : 'See active events'}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-5 pb-16 md:px-8 lg:px-10">
        <div className="mx-auto max-w-[1540px]">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((stat) => (
              <div
                key={stat.labelPt}
                className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 transition-all hover:border-white/14 hover:bg-white/[0.05]"
              >
                <div className="text-[clamp(2.4rem,4vw,3.4rem)] font-bold leading-none tracking-[-0.03em] text-white">
                  {isPortuguese ? stat.valuePt : stat.valueEn}
                </div>
                <div className="mt-3 text-[11px] uppercase tracking-[0.26em] text-white/42">
                  {isPortuguese ? stat.labelPt : stat.labelEn}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="px-5 pb-20 md:px-8 lg:px-10">
        <div className="mx-auto max-w-[1540px]">
          <div className="mb-12 max-w-2xl">
            <div className="text-[10px] uppercase tracking-[0.38em] text-[#4285F4]">
              {isPortuguese ? 'Modulos da plataforma' : 'Platform modules'}
            </div>
            <h2 className="mt-5 text-[clamp(2.4rem,5vw,4rem)] font-bold leading-[0.9] tracking-[-0.03em] text-white">
              {isPortuguese
                ? 'Uma pilha unica para governar toda a operacao.'
                : 'One stack to govern the entire operation.'}
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.titlePt}
                  className="group rounded-2xl border border-white/8 bg-white/[0.03] p-7 transition-all duration-300 hover:border-white/14 hover:bg-white/[0.05]"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-[#0057E7]/20 bg-[#0057E7]/10 text-[#4285F4] transition-colors group-hover:bg-[#0057E7]/16">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {isPortuguese ? feature.titlePt : feature.titleEn}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-white/50">
                    {isPortuguese ? feature.descPt : feature.descEn}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-5 pb-20 md:px-8 lg:px-10">
        <div className="mx-auto max-w-[1540px]">
          <div className="rounded-2xl border border-white/8 bg-[linear-gradient(135deg,rgba(0,87,231,0.12)_0%,rgba(10,10,10,0.98)_40%,rgba(66,133,244,0.06)_100%)] p-8 lg:p-12">
            <div className="mb-10 text-[10px] uppercase tracking-[0.38em] text-[#4285F4]">
              {isPortuguese ? 'Como funciona' : 'How it works'}
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  step: '01',
                  titlePt: 'Crie sua conta',
                  titleEn: 'Create your account',
                  descPt: 'Cadastro gratuito em 30 segundos. Sem cartao de credito, sem compromisso.',
                  descEn: 'Free signup in 30 seconds. No credit card, no commitment.',
                },
                {
                  step: '02',
                  titlePt: 'Configure seu evento',
                  titleEn: 'Set up your event',
                  descPt: 'Defina ingressos, equipe, areas de acesso e personalize a pagina publica do evento.',
                  descEn: 'Define tickets, staff, access areas and customize the public event page.',
                },
                {
                  step: '03',
                  titlePt: 'Venda e opere',
                  titleEn: 'Sell and operate',
                  descPt: 'Publique, venda e acompanhe tudo em tempo real pelo dashboard executivo.',
                  descEn: 'Publish, sell and track everything in real time from the executive dashboard.',
                },
              ].map((item) => (
                <div key={item.step}>
                  <div className="mb-4 font-mono text-3xl font-bold text-[#0057E7]">{item.step}</div>
                  <h3 className="text-xl font-bold text-white">
                    {isPortuguese ? item.titlePt : item.titleEn}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-white/50">
                    {isPortuguese ? item.descPt : item.descEn}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits checklist */}
      <section className="px-5 pb-20 md:px-8 lg:px-10">
        <div className="mx-auto max-w-[1540px]">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="text-[10px] uppercase tracking-[0.38em] text-[#4285F4]">
                {isPortuguese ? 'Por que Pulse?' : 'Why Pulse?'}
              </div>
              <h2 className="mt-5 text-[clamp(2.2rem,4vw,3.6rem)] font-bold leading-[0.9] tracking-[-0.03em] text-white">
                {isPortuguese
                  ? 'Construido para produtores que nao aceitam gambiarra.'
                  : 'Built for producers who refuse workarounds.'}
              </h2>
              <p className="mt-5 text-sm leading-7 text-white/50">
                {isPortuguese
                  ? 'Cada funcionalidade foi pensada por quem ja operou evento de verdade. Sem friccao, sem planilha, sem improvisar.'
                  : 'Every feature was designed by people who have run real events. No friction, no spreadsheets, no improvising.'}
              </p>
            </div>

            <div className="grid gap-3">
              {(isPortuguese
                ? [
                    'Zero custo para comecar, pague apenas quando vender',
                    'Checkout com taxa de conversao superior a 94%',
                    'Check-in por QR Code em menos de 2 segundos',
                    'Controle financeiro com conciliacao automatica',
                    'Gestao completa de equipe com convites por link',
                    'Dashboard executivo em tempo real',
                    'Pagina publica personalizada para cada evento',
                    'Suporte operacional 24/7 durante o evento',
                    'CRM com historico completo de participantes',
                    'Relatorios exportaveis para contabilidade',
                  ]
                : [
                    'Zero cost to start, pay only when you sell',
                    'Checkout with 94%+ conversion rate',
                    'QR Code check-in in under 2 seconds',
                    'Financial control with automatic reconciliation',
                    'Complete team management with link invites',
                    'Real-time executive dashboard',
                    'Custom public page for each event',
                    '24/7 operational support during events',
                    'CRM with complete attendee history',
                    'Exportable reports for accounting',
                  ]
              ).map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-xl border border-white/6 bg-white/[0.02] px-4 py-3 transition-all hover:border-white/12 hover:bg-white/[0.04]"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0057E7]/16 text-[#4285F4]">
                    <Check className="h-3 w-3" />
                  </span>
                  <span className="text-sm text-white/72">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 pb-20 md:px-8 lg:px-10">
        <div className="mx-auto max-w-[1540px]">
          <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-[linear-gradient(135deg,rgba(0,87,231,0.20)_0%,rgba(10,10,10,0.96)_50%,rgba(10,26,255,0.10)_100%)] px-8 py-16 text-center lg:px-16 lg:py-20">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(0,87,231,0.25),transparent_60%)]" />
            <div className="relative z-10">
              <h2 className="text-[clamp(2.6rem,5vw,4.8rem)] font-bold leading-[0.88] tracking-[-0.04em] text-white">
                {isPortuguese ? 'Comece agora.' : 'Start now.'}
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-white/50">
                {isPortuguese
                  ? 'Crie sua conta gratuita e configure seu primeiro evento em minutos. Sem cartao, sem contrato.'
                  : 'Create your free account and set up your first event in minutes. No card, no contract.'}
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={onLogin}
                  className="inline-flex items-center gap-2 rounded-full bg-[#0057E7] px-8 py-4 text-sm font-bold uppercase tracking-[0.18em] text-white shadow-[0_16px_40px_rgba(0,87,231,0.35)] transition-all hover:-translate-y-0.5 hover:bg-[#4285F4]"
                >
                  {isPortuguese ? 'Criar conta gratuita' : 'Create free account'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
