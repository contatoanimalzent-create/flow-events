import { ArrowRight, Code2, Globe, MessageCircle, Webhook, Zap } from 'lucide-react'
import { PublicLayout } from '@/features/public'
import { usePublicLocale } from '@/features/public/lib/public-locale'
import { useSeoMeta } from '@/shared/lib'

const INTEGRATIONS = [
  { emoji: '💳', name: 'Stripe', descPt: 'Pagamentos seguros e checkout otimizado', descEn: 'Secure payments and optimized checkout' },
  { emoji: '📧', name: 'Mailchimp', descPt: 'Email marketing e automações de campanha', descEn: 'Email marketing and campaign automations' },
  { emoji: '📲', name: 'WhatsApp', descPt: 'Notificacoes de confirmação e lembretes', descEn: 'Confirmation notifications and reminders' },
  { emoji: '📊', name: 'Google Analytics', descPt: 'Rastreamento de conversão e comportamento', descEn: 'Conversion tracking and behavior analysis' },
  { emoji: '🗓️', name: 'Google Calendar', descPt: 'Sincronização automática de eventos', descEn: 'Automatic event synchronization' },
  { emoji: '🔗', name: 'Zapier', descPt: 'Automações com +5.000 apps conectados', descEn: 'Automations with +5,000 connected apps' },
  { emoji: '📱', name: 'Capacitor', descPt: 'App mobile nativo iOS e Android', descEn: 'Native iOS and Android mobile app' },
  { emoji: '🔔', name: 'Push Notifications', descPt: 'Alertas em tempo real para sua equipe', descEn: 'Real-time alerts for your team' },
]

const ENDPOINTS = [
  { method: 'GET', path: '/events', descPt: 'Lista todos os eventos do organizador', descEn: 'List all organizer events' },
  { method: 'POST', path: '/checkins', descPt: 'Registra entrada de um participante', descEn: 'Register attendee check-in' },
  { method: 'GET', path: '/reports', descPt: 'Retorna relatórios consolidados', descEn: 'Returns consolidated reports' },
  { method: 'GET', path: '/tickets', descPt: 'Lista ingressos de um evento', descEn: 'List tickets for an event' },
  { method: 'POST', path: '/occurrences', descPt: 'Cria uma ocorrencia operacional', descEn: 'Create an operational incident' },
]

const WEBHOOKS = [
  { event: 'ticket.sold', descPt: 'Disparado quando um ingresso e vendido', descEn: 'Fired when a ticket is sold' },
  { event: 'checkin.completed', descPt: 'Disparado ao confirmar entrada no evento', descEn: 'Fired when check-in is confirmed' },
  { event: 'occurrence.created', descPt: 'Disparado ao registrar uma ocorrencia', descEn: 'Fired when an incident is recorded' },
  { event: 'approval.requested', descPt: 'Disparado ao solicitar aprovação ao supervisor', descEn: 'Fired when supervisor approval is requested' },
]

const METHOD_COLORS: Record<string, string> = {
  GET: 'text-[#4285F4] bg-[#4285F4]/10 border-[#4285F4]/20',
  POST: 'text-[#d4ff00] bg-[#d4ff00]/10 border-[#d4ff00]/20',
  PUT: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  DELETE: 'text-red-400 bg-red-400/10 border-red-400/20',
}

export function ApiPage({ onLogin }: { onLogin: () => void }) {
  const { isPortuguese } = usePublicLocale()

  useSeoMeta({
    title: isPortuguese ? 'API & Integrações | Pulse' : 'API & Integrations | Pulse',
    description: isPortuguese
      ? 'Conecte a Pulse ao seu ecossistema. API REST, webhooks e integrações nativas com as ferramentas que você já usa.'
      : 'Connect Pulse to your ecosystem. REST API, webhooks and native integrations with the tools you already use.',
  })

  return (
    <PublicLayout onLogin={onLogin}>
      {/* Hero */}
      <section className="relative overflow-hidden px-5 pb-16 pt-12 md:px-8 md:pb-20 md:pt-16 lg:px-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,87,231,0.18),transparent_50%),radial-gradient(circle_at_80%_60%,rgba(66,133,244,0.10),transparent_40%)]" />
        <div className="relative z-10 mx-auto max-w-[1540px]">
          <div className="text-[10px] uppercase tracking-[0.38em] text-[#4285F4]">
            {isPortuguese ? 'API & Integrações' : 'API & Integrations'}
          </div>
          <h1 className="mt-6 max-w-4xl text-[clamp(3rem,7vw,6rem)] font-bold leading-[0.88] tracking-[-0.04em] text-white">
            {isPortuguese
              ? 'A Pulse conecta com o que você já usa.'
              : 'Pulse connects with what you already use.'}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/58">
            {isPortuguese
              ? 'API REST documentada, webhooks em tempo real e integrações nativas com as principais ferramentas do mercado de eventos.'
              : 'Documented REST API, real-time webhooks and native integrations with the leading event industry tools.'}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {['REST', 'JSON', 'Auth Bearer', 'TLS 1.3', 'OpenAPI 3.0'].map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-[#4285F4]/30 bg-[#4285F4]/10 px-3 py-1 text-xs font-mono font-medium text-[#4285F4]"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations grid */}
      <section className="px-5 pb-20 md:px-8 lg:px-10">
        <div className="mx-auto max-w-[1540px]">
          <div className="mb-10">
            <div className="text-[10px] uppercase tracking-[0.38em] text-[#4285F4]">
              <Globe className="mr-2 inline-block h-3.5 w-3.5" />
              {isPortuguese ? 'Integrações nativas' : 'Native integrations'}
            </div>
            <h2 className="mt-4 text-[clamp(2rem,4vw,3.4rem)] font-bold leading-[0.9] tracking-[-0.03em] text-white">
              {isPortuguese ? 'Conectado ao seu ecossistema.' : 'Connected to your ecosystem.'}
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {INTEGRATIONS.map((integration) => (
              <div
                key={integration.name}
                className="rounded-2xl border border-white/8 bg-white/[0.03] p-5 transition-all hover:border-white/14 hover:bg-white/[0.05]"
              >
                <div className="text-3xl">{integration.emoji}</div>
                <div className="mt-3 font-semibold text-white">{integration.name}</div>
                <p className="mt-2 text-sm leading-6 text-white/48">
                  {isPortuguese ? integration.descPt : integration.descEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* API REST */}
      <section className="px-5 pb-20 md:px-8 lg:px-10">
        <div className="mx-auto max-w-[1540px]">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <div>
              <div className="text-[10px] uppercase tracking-[0.38em] text-[#4285F4]">
                <Code2 className="mr-2 inline-block h-3.5 w-3.5" />
                API REST
              </div>
              <h2 className="mt-4 text-[clamp(2rem,4vw,3.4rem)] font-bold leading-[0.9] tracking-[-0.03em] text-white">
                {isPortuguese ? 'Acesso programatico completo.' : 'Complete programmatic access.'}
              </h2>
              <p className="mt-5 text-sm leading-7 text-white/50">
                {isPortuguese
                  ? 'Todos os recursos da plataforma expostos via REST. Autenticação Bearer token, respostas em JSON, documentação OpenAPI disponível.'
                  : 'All platform resources exposed via REST. Bearer token authentication, JSON responses, OpenAPI documentation available.'}
              </p>
            </div>

            <div className="rounded-2xl border border-white/8 bg-[#060d1f] p-6 font-mono">
              <div className="mb-4 flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-white/30">
                <Code2 className="h-3.5 w-3.5" />
                {isPortuguese ? 'Endpoints disponíveis' : 'Available endpoints'}
              </div>
              <div className="space-y-3">
                {ENDPOINTS.map((ep) => (
                  <div key={ep.path} className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 shrink-0 rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${METHOD_COLORS[ep.method] ?? 'text-white/40 bg-white/5 border-white/10'}`}
                    >
                      {ep.method}
                    </span>
                    <div>
                      <span className="text-sm text-white/80">{ep.path}</span>
                      <p className="mt-0.5 text-xs text-white/35">
                        {isPortuguese ? ep.descPt : ep.descEn}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Webhooks */}
      <section className="px-5 pb-20 md:px-8 lg:px-10">
        <div className="mx-auto max-w-[1540px]">
          <div className="rounded-2xl border border-white/8 bg-[linear-gradient(135deg,rgba(0,87,231,0.10)_0%,rgba(10,10,10,0.98)_50%,rgba(66,133,244,0.06)_100%)] p-8 lg:p-12">
            <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-start">
              <div>
                <div className="text-[10px] uppercase tracking-[0.38em] text-[#4285F4]">
                  <Webhook className="mr-2 inline-block h-3.5 w-3.5" />
                  Webhooks
                </div>
                <h2 className="mt-4 text-[clamp(2rem,4vw,3.2rem)] font-bold leading-[0.9] tracking-[-0.03em] text-white">
                  {isPortuguese ? 'Eventos em tempo real.' : 'Real-time events.'}
                </h2>
                <p className="mt-5 text-sm leading-7 text-white/50">
                  {isPortuguese
                    ? 'Configure endpoints para receber notificações instantâneas quando algo acontece na plataforma. Ideal para integrações customizadas e automações.'
                    : 'Configure endpoints to receive instant notifications when something happens on the platform. Ideal for custom integrations and automations.'}
                </p>
              </div>

              <div className="space-y-3">
                {WEBHOOKS.map((wh) => (
                  <div
                    key={wh.event}
                    className="flex items-start gap-4 rounded-xl border border-white/6 bg-white/[0.03] px-5 py-4"
                  >
                    <Zap className="mt-0.5 h-4 w-4 shrink-0 text-[#d4ff00]" />
                    <div>
                      <code className="text-sm font-medium text-[#d4ff00]">{wh.event}</code>
                      <p className="mt-1 text-xs text-white/40">
                        {isPortuguese ? wh.descPt : wh.descEn}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
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
              <h2 className="text-[clamp(2.4rem,5vw,4.4rem)] font-bold leading-[0.88] tracking-[-0.04em] text-white">
                {isPortuguese ? 'Pronto para integrar?' : 'Ready to integrate?'}
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-white/50">
                {isPortuguese
                  ? 'Acesse a documentação completa ou fale diretamente com o time técnico.'
                  : 'Access the full documentation or talk directly to the technical team.'}
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <a
                  href="/api/docs"
                  className="inline-flex items-center gap-2 rounded-full bg-[#0057E7] px-7 py-4 text-sm font-bold uppercase tracking-[0.18em] text-white shadow-[0_16px_40px_rgba(0,87,231,0.35)] transition-all hover:-translate-y-0.5 hover:bg-[#4285F4]"
                >
                  {isPortuguese ? 'Ver documentação' : 'View documentation'}
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="https://wa.me/14698629040"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/18 px-7 py-4 text-sm font-medium uppercase tracking-[0.18em] text-white/70 transition-all hover:border-white/28 hover:text-white"
                >
                  <MessageCircle className="h-4 w-4" />
                  {isPortuguese ? 'Falar com o time técnico' : 'Talk to the tech team'}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
