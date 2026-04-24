import { useState } from 'react'
import { ArrowRight, CheckCircle2, Clock, MessageCircle, Shield, Sparkles } from 'lucide-react'
import { PublicLayout } from '@/features/public'
import { usePublicLocale } from '@/features/public/lib/public-locale'
import { useSeoMeta } from '@/shared/lib'

type EventType = '' | 'show_festival' | 'corporativo' | 'esportivo' | 'gastronomico' | 'outro'
type EventSize = '' | 'ate200' | '200_1000' | '1000_5000' | 'mais5000'

interface DemoForm {
  name: string
  email: string
  whatsapp: string
  eventType: EventType
  eventSize: EventSize
}

const EVENT_TYPES: { value: EventType; labelPt: string; labelEn: string }[] = [
  { value: 'show_festival', labelPt: 'Show / Festival', labelEn: 'Show / Festival' },
  { value: 'corporativo', labelPt: 'Corporativo', labelEn: 'Corporate' },
  { value: 'esportivo', labelPt: 'Esportivo', labelEn: 'Sports' },
  { value: 'gastronomico', labelPt: 'Gastronomico', labelEn: 'Food & Beverage' },
  { value: 'outro', labelPt: 'Outro', labelEn: 'Other' },
]

const EVENT_SIZES: { value: EventSize; labelPt: string; labelEn: string }[] = [
  { value: 'ate200', labelPt: 'Até 200 pessoas', labelEn: 'Up to 200 people' },
  { value: '200_1000', labelPt: '200 a 1.000 pessoas', labelEn: '200 to 1,000 people' },
  { value: '1000_5000', labelPt: '1.000 a 5.000 pessoas', labelEn: '1,000 to 5,000 people' },
  { value: 'mais5000', labelPt: 'Mais de 5.000 pessoas', labelEn: 'Over 5,000 people' },
]

const BENEFITS = [
  {
    icon: Clock,
    labelPt: '30 minutos',
    labelEn: '30 minutes',
    descPt: 'Uma conversa objetiva, sem enrolacao.',
    descEn: 'A focused conversation, no fluff.',
  },
  {
    icon: Sparkles,
    labelPt: 'Personalizado para você',
    labelEn: 'Personalized for you',
    descPt: 'Mostramos o que e relevante para o seu tipo de evento.',
    descEn: 'We show what is relevant to your event type.',
  },
  {
    icon: Shield,
    labelPt: 'Sem compromisso',
    labelEn: 'No commitment',
    descPt: 'Você decide se faz sentido para você, sem pressao.',
    descEn: 'You decide if it makes sense for you, no pressure.',
  },
  {
    icon: MessageCircle,
    labelPt: 'Com especialista',
    labelEn: 'With a specialist',
    descPt: 'Alguém que entende de eventos, não só de software.',
    descEn: 'Someone who understands events, not just software.',
  },
]

export function DemoPage({ onLogin }: { onLogin: () => void }) {
  const { isPortuguese } = usePublicLocale()

  const [form, setForm] = useState<DemoForm>({
    name: '',
    email: '',
    whatsapp: '',
    eventType: '',
    eventSize: '',
  })

  useSeoMeta({
    title: isPortuguese ? 'Solicitar Demonstracao | Pulse' : 'Request a Demo | Pulse',
    description: isPortuguese
      ? 'Veja a Pulse em ação. Agende uma demonstracao personalizada com nossa equipe.'
      : 'See Pulse in action. Schedule a personalized demonstration with our team.',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const eventTypeLabel = EVENT_TYPES.find((t) => t.value === form.eventType)
    const eventSizeLabel = EVENT_SIZES.find((s) => s.value === form.eventSize)

    const message = isPortuguese
      ? `Ola! Quero agendar uma demo da Pulse.\n\nNome: ${form.name}\nEmail: ${form.email}\nWhatsApp: ${form.whatsapp}\nTipo de evento: ${eventTypeLabel?.labelPt ?? '-'}\nTamanho estimado: ${eventSizeLabel?.labelPt ?? '-'}`
      : `Hi! I would like to schedule a Pulse demo.\n\nName: ${form.name}\nEmail: ${form.email}\nWhatsApp: ${form.whatsapp}\nEvent type: ${eventTypeLabel?.labelEn ?? '-'}\nEstimated size: ${eventSizeLabel?.labelEn ?? '-'}`

    const encoded = encodeURIComponent(message)
    window.open(`https://wa.me/14698629040?text=${encoded}`, '_blank')
  }

  const inputClass =
    'w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#4285F4]/60 focus:ring-0 transition-colors'

  const selectClass =
    'w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-[#4285F4]/60 focus:ring-0 transition-colors appearance-none'

  return (
    <PublicLayout onLogin={onLogin}>
      {/* Hero */}
      <section className="relative overflow-hidden px-5 pb-12 pt-12 md:px-8 md:pt-16 lg:px-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,87,231,0.18),transparent_50%),radial-gradient(circle_at_80%_60%,rgba(66,133,244,0.10),transparent_40%)]" />
        <div className="relative z-10 mx-auto max-w-[1540px] text-center">
          <div className="text-[10px] uppercase tracking-[0.38em] text-[#4285F4]">
            {isPortuguese ? 'Demonstracao' : 'Demo'}
          </div>
          <h1 className="mx-auto mt-6 max-w-3xl text-[clamp(3rem,6vw,5.4rem)] font-bold leading-[0.88] tracking-[-0.04em] text-white">
            {isPortuguese
              ? 'Veja a Pulse funcionando no seu evento.'
              : 'See Pulse running at your event.'}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-white/58">
            {isPortuguese
              ? 'Agende uma demo personalizada de 30 minutos com nossa equipe. Gratuita e sem compromisso.'
              : 'Schedule a personalized 30-minute demo with our team. Free and no commitment.'}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="px-5 pb-20 md:px-8 lg:px-10">
        <div className="mx-auto max-w-[1540px]">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-start">
            {/* Left: benefits */}
            <div>
              <div className="mb-8 text-[10px] uppercase tracking-[0.38em] text-[#4285F4]">
                {isPortuguese ? 'O que você vai ver' : 'What you will see'}
              </div>
              <div className="grid gap-4">
                {BENEFITS.map((b) => {
                  const Icon = b.icon
                  return (
                    <div
                      key={b.labelPt}
                      className="flex items-start gap-4 rounded-2xl border border-white/8 bg-white/[0.03] p-5"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#0057E7]/20 bg-[#0057E7]/10 text-[#4285F4]">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-white">
                          {isPortuguese ? b.labelPt : b.labelEn}
                        </div>
                        <div className="mt-1 text-sm text-white/50">
                          {isPortuguese ? b.descPt : b.descEn}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Badges */}
              <div className="mt-8 flex flex-wrap gap-3">
                {(isPortuguese
                  ? ['Resposta em até 2 horas uteis', 'Demo gratuita e sem compromisso']
                  : ['Response within 2 business hours', 'Free and no-commitment demo']
                ).map((badge) => (
                  <div
                    key={badge}
                    className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-white/60"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#4285F4]" />
                    {badge}
                  </div>
                ))}
              </div>

              {/* Direct WhatsApp */}
              <div className="mt-10">
                <div className="mb-4 text-sm text-white/40">
                  {isPortuguese ? 'Prefere ir direto?' : 'Prefer to go straight?'}
                </div>
                <a
                  href="https://wa.me/14698629040"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-bold text-white shadow-[0_10px_30px_rgba(37,211,102,0.25)] transition-all hover:-translate-y-0.5 hover:bg-[#22c55e]"
                >
                  <MessageCircle className="h-4 w-4" />
                  {isPortuguese ? 'Falar agora no WhatsApp' : 'Chat on WhatsApp now'}
                </a>
              </div>
            </div>

            {/* Right: form */}
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-8 lg:p-10">
              <div className="mb-6 text-[10px] uppercase tracking-[0.32em] text-[#4285F4]">
                {isPortuguese ? 'Agendar demonstracao' : 'Schedule a demo'}
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-white/40">
                    {isPortuguese ? 'Nome' : 'Name'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isPortuguese ? 'Seu nome completo' : 'Your full name'}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-white/40">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="você@empresa.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-white/40">
                    WhatsApp
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+55 (11) 99999-9999"
                    value={form.whatsapp}
                    onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-white/40">
                    {isPortuguese ? 'Tipo de evento' : 'Event type'}
                  </label>
                  <select
                    required
                    value={form.eventType}
                    onChange={(e) => setForm({ ...form, eventType: e.target.value as EventType })}
                    className={selectClass}
                  >
                    <option value="" disabled>
                      {isPortuguese ? 'Selecione...' : 'Select...'}
                    </option>
                    {EVENT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {isPortuguese ? t.labelPt : t.labelEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-white/40">
                    {isPortuguese ? 'Tamanho estimado do evento' : 'Estimated event size'}
                  </label>
                  <select
                    required
                    value={form.eventSize}
                    onChange={(e) => setForm({ ...form, eventSize: e.target.value as EventSize })}
                    className={selectClass}
                  >
                    <option value="" disabled>
                      {isPortuguese ? 'Selecione...' : 'Select...'}
                    </option>
                    {EVENT_SIZES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {isPortuguese ? s.labelPt : s.labelEn}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-[#0057E7] py-4 text-sm font-bold uppercase tracking-[0.18em] text-white shadow-[0_10px_30px_rgba(0,87,231,0.35)] transition-all hover:-translate-y-0.5 hover:bg-[#4285F4]"
                >
                  {isPortuguese ? 'Agendar via WhatsApp' : 'Schedule via WhatsApp'}
                  <ArrowRight className="h-4 w-4" />
                </button>

                <p className="text-center text-[11px] text-white/28">
                  {isPortuguese
                    ? 'Você sera redirecionado para o WhatsApp com os dados preenchidos.'
                    : 'You will be redirected to WhatsApp with the details pré-filled.'}
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
