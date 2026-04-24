import {
  ArrowRight,
  BarChart3,
  Bell,
  CreditCard,
  Globe,
  Layers,
  Monitor,
  QrCode,
  Shield,
  Smartphone,
  Tag,
  Users,
} from 'lucide-react'
import { PublicLayout } from '@/features/public'
import { usePublicLocale } from '@/features/public/lib/public-locale'
import { useSeoMeta } from '@/shared/lib'

const FEATURES = [
  {
    icon: QrCode,
    titlePt: 'Check-in Mobile',
    titleEn: 'Mobile Check-in',
    descPt: 'QR code por camera, válidação offline e anti-fraude. Suporta 500 leituras por minuto com zero latencia.',
    descEn: 'QR code via camera, offline and anti-fraud validation. Supports 500 reads per minute with zero latency.',
  },
  {
    icon: Users,
    titlePt: 'Gestão de Staff',
    titleEn: 'Staff Management',
    descPt: 'Convide por link, defina funções e permissões, registre ponto e acompanhe presença em tempo real.',
    descEn: 'Invite via link, set roles and permissions, clock in/out and track presence in real time.',
  },
  {
    icon: Layers,
    titlePt: 'Controle de Fluxo',
    titleEn: 'Flow Control',
    descPt: 'Gerencie filas, capacidade por setor e receba alertas automáticos de lotacao crítica.',
    descEn: 'Manage queues, capacity per sector and receive automatic critical capacity alerts.',
  },
  {
    icon: Monitor,
    titlePt: 'Supervisor ao Vivo',
    titleEn: 'Live Supervisor',
    descPt: 'Health score do evento em tempo real, registro de ocorrências, aprovações e mapa interativo da equipe.',
    descEn: 'Real-time event health score, incident logging, approvals and interactive staff map.',
  },
  {
    icon: Tag,
    titlePt: 'Virada de Lote',
    titleEn: 'Batch Turnover',
    descPt: 'Automação por data ou por quantidade vendida. Compradores recebem notificacao automática de mudanca de preço.',
    descEn: 'Automation by date or sold quantity. Buyers receive automatic price change notifications.',
  },
  {
    icon: BarChart3,
    titlePt: 'Relatórios ao Vivo',
    titleEn: 'Live Reports',
    descPt: 'Receita, conversão, ticket medio e presença por hora. Atualizacao em tempo real durante o evento.',
    descEn: 'Revenue, conversion, average ticket and hourly attendance. Real-time updates during the event.',
  },
  {
    icon: CreditCard,
    titlePt: 'Pagamento Antecipado',
    titleEn: 'Early Payment',
    descPt: 'Repasse em D+2, conciliação automática de transações e exportacao contábil pronta para uso.',
    descEn: 'Transfer in D+2, automatic transaction reconciliation and accounting exports ready to use.',
  },
  {
    icon: Shield,
    titlePt: 'Credenciamento',
    titleEn: 'Credentialing',
    descPt: 'Formularios personalizados, aprovação manual ou automática e QR code único por participante.',
    descEn: 'Custom forms, manual or automatic approval and unique QR code per participant.',
  },
]

const PLATFORMS = [
  {
    icon: Monitor,
    labelPt: 'Web',
    labelEn: 'Web',
    descPt: 'Dashboard completo no navegador',
    descEn: 'Full dashboard in the browser',
  },
  {
    icon: Smartphone,
    labelPt: 'Mobile',
    labelEn: 'Mobile',
    descPt: 'App Pulse para iOS e Android',
    descEn: 'Pulse app for iOS and Android',
  },
  {
    icon: Globe,
    labelPt: 'Kiosk',
    labelEn: 'Kiosk',
    descPt: 'Totem de check-in autonomo',
    descEn: 'Autonomous check-in kiosk',
  },
  {
    icon: Bell,
    labelPt: 'API',
    labelEn: 'API',
    descPt: 'Integração com seu ecossistema',
    descEn: 'Integration with your ecosystem',
  },
]

export function FuncionalidadesPage({ onLogin }: { onLogin: () => void }) {
  const { isPortuguese } = usePublicLocale()

  useSeoMeta({
    title: isPortuguese ? 'Funcionalidades | Pulse' : 'Features | Pulse',
    description: isPortuguese
      ? 'Check-in mobile, gestão de staff, relatórios ao vivo, virada de lote e muito mais. Tudo que você precisa para operar um evento profissional.'
      : 'Mobile check-in, staff management, live reports, batch turnover and much more. Everything you need to run a professional event.',
  })

  return (
    <PublicLayout onLogin={onLogin}>
      {/* Hero */}
      <section className="relative overflow-hidden px-5 pb-16 pt-12 md:px-8 md:pb-24 md:pt-16 lg:px-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,87,231,0.18),transparent_50%),radial-gradient(circle_at_80%_60%,rgba(66,133,244,0.10),transparent_40%)]" />
        <div className="relative z-10 mx-auto max-w-[1540px]">
          <div className="text-[10px] uppercase tracking-[0.38em] text-[#4285F4]">
            {isPortuguese ? 'Funcionalidades' : 'Features'}
          </div>
          <h1 className="mt-6 max-w-4xl text-[clamp(3rem,7vw,6rem)] font-bold leading-[0.88] tracking-[-0.04em] text-white">
            {isPortuguese
              ? 'Cada detalhe do seu evento. Sob controle.'
              : 'Every detail of your event. Under control.'}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/58">
            {isPortuguese
              ? 'Uma plataforma construida por quem já operou eventos de verdade. Sem feature inutil, sem limite artificial.'
              : 'A platform built by people who have run real events. No useless features, no artificial limits.'}
          </p>
        </div>
      </section>

      {/* Features grid */}
      <section className="px-5 pb-20 md:px-8 lg:px-10">
        <div className="mx-auto max-w-[1540px]">
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

      {/* Platform availability */}
      <section className="px-5 pb-20 md:px-8 lg:px-10">
        <div className="mx-auto max-w-[1540px]">
          <div className="rounded-2xl border border-white/8 bg-[linear-gradient(135deg,rgba(0,87,231,0.12)_0%,rgba(10,10,10,0.98)_40%,rgba(66,133,244,0.06)_100%)] p-8 lg:p-12">
            <div className="mb-10">
              <div className="text-[10px] uppercase tracking-[0.38em] text-[#4285F4]">
                {isPortuguese ? 'Disponível onde você precisar' : 'Available where you need it'}
              </div>
              <h2 className="mt-4 max-w-xl text-[clamp(2rem,4vw,3.4rem)] font-bold leading-[0.9] tracking-[-0.03em] text-white">
                {isPortuguese
                  ? 'Uma plataforma. Quatro pontos de acesso.'
                  : 'One platform. Four access points.'}
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {PLATFORMS.map((platform) => {
                const Icon = platform.icon
                return (
                  <div
                    key={platform.labelPt}
                    className="rounded-xl border border-white/6 bg-white/[0.04] p-5 transition-all hover:border-white/12 hover:bg-white/[0.06]"
                  >
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-[#0057E7]/20 bg-[#0057E7]/10 text-[#4285F4]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="font-bold text-white">
                      {isPortuguese ? platform.labelPt : platform.labelEn}
                    </div>
                    <p className="mt-2 text-sm text-white/45">
                      {isPortuguese ? platform.descPt : platform.descEn}
                    </p>
                  </div>
                )
              })}
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
                {isPortuguese ? 'Pronto para operar.' : 'Ready to operate.'}
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-white/50">
                {isPortuguese
                  ? 'Configure seu evento em minutos. A equipe e a tecnologia estao prontos para o seu próximo evento.'
                  : 'Set up your event in minutes. The team and technology are ready for your next event.'}
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <a
                  href="/create-event"
                  className="inline-flex items-center gap-2 rounded-full bg-[#0057E7] px-8 py-4 text-sm font-bold uppercase tracking-[0.18em] text-white shadow-[0_16px_40px_rgba(0,87,231,0.35)] transition-all hover:-translate-y-0.5 hover:bg-[#4285F4]"
                >
                  {isPortuguese ? 'Criar evento grátis' : 'Create free event'}
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="https://wa.me/14698629040"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/18 px-8 py-4 text-sm font-medium uppercase tracking-[0.18em] text-white/70 transition-all hover:border-white/28 hover:text-white"
                >
                  {isPortuguese ? 'Falar com a equipe' : 'Talk to the team'}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
