import { useMemo, useRef, useState } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import type { EventAsset } from '@/lib/supabase'
import { PublicLayout, usePublicEvent } from '@/features/public'
import { formatPublicCurrency, formatPublicDate, formatPublicTime, usePublicLocale, type PublicLocale } from '@/features/public/lib/public-locale'
import {
  AboutSection,
  AgendaSection,
  FAQSection,
  SignupFormSection,
  TicketsSection,
  type AgendaSectionItem,
  type FAQItem,
  type SignupFormValues,
  type TicketOptionCard,
} from '@/features/public/components/landing'
import { eventLandingRegistrationService } from '@/features/public/services/event-landing-registration.service'
import { EventHero } from '@/shared/components/ui'
import { useSeoMeta } from '@/shared/lib'

interface EventLandingPageProps {
  slug: string
}

interface TicketOptionRecord extends TicketOptionCard {
  label: string
}

type EventLandingPageDetail = NonNullable<ReturnType<typeof usePublicEvent>['data']>

function getAssetUrl(asset?: Pick<EventAsset, 'secure_url' | 'url' | 'thumbnail_url'> | null) {
  return asset?.secure_url ?? asset?.url ?? asset?.thumbnail_url ?? ''
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function readAgendaItems(
  settings: Record<string, unknown>,
  startsAt: string,
  endsAt: string | undefined,
  locale: PublicLocale,
  isPortuguese: boolean,
): AgendaSectionItem[] {
  const agenda = settings.agenda

  if (Array.isArray(agenda)) {
    const parsed = agenda
      .map((item, index) => {
        if (!isRecord(item)) {
          return null
        }

        return {
          id: readString(item.id, `agenda-${index}`),
          time: readString(item.time, formatPublicTime(startsAt, locale)),
          title: readString(item.title, isPortuguese ? `Momento ${index + 1}` : `Session ${index + 1}`),
          description: readString(
            item.description,
            isPortuguese ? 'Mais detalhes desta etapa serao divulgados na abertura do evento.' : 'More details for this segment will be announced closer to the event.',
          ),
          category: readString(item.category, isPortuguese ? 'Destaque' : 'Featured'),
        }
      })
      .filter(Boolean) as AgendaSectionItem[]

    if (parsed.length > 0) {
      return parsed
    }
  }

  return [
    {
      id: 'agenda-doors',
      time: formatPublicTime(startsAt, locale),
      title: isPortuguese ? 'Boas-vindas e credenciamento' : 'Welcome and credentialing',
      description: isPortuguese
        ? 'Recepcao fluida, retirada de credenciais e ativacoes iniciais para aquecer a chegada.'
        : 'A smooth arrival with credential pickup and opening activations to set the tone.',
      category: isPortuguese ? 'Abertura' : 'Opening',
    },
    {
      id: 'agenda-main',
      time: isPortuguese ? 'Em seguida' : 'Next',
      title: isPortuguese ? 'Conteúdo principal e momentos de palco' : 'Main content and stage moments',
      description: isPortuguese
        ? 'Bloco central da experiência com palestras, showcases ou apresentacoes principais.'
        : 'The central experience block with talks, showcases or headline presentations.',
      category: isPortuguese ? 'Palco' : 'Stage',
    },
    {
      id: 'agenda-network',
      time: isPortuguese ? 'Entre blocos' : 'Between sets',
      title: isPortuguese ? 'Networking e ativacoes' : 'Networking and activations',
      description: isPortuguese
        ? 'Espacos pensados para conexao, patrocinadores e interacoes de marca.'
        : 'Spaces designed for connection, sponsors and branded interactions.',
      category: isPortuguese ? 'Networking' : 'Networking',
    },
    {
      id: 'agenda-close',
      time: endsAt ? formatPublicTime(endsAt, locale) : isPortuguese ? 'Encerramento' : 'Closing',
      title: isPortuguese ? 'Fechamento da jornada' : 'Closing moment',
      description: isPortuguese
        ? 'Último chamado, orientacoes finais e transicao elegante para a saída.'
        : 'Final call, closing notes and an elegant transition into departure.',
      category: isPortuguese ? 'Final' : 'Finale',
    },
  ]
}

function readFaqItems(settings: Record<string, unknown>, isPortuguese: boolean): FAQItem[] {
  const faq = settings.faq

  if (Array.isArray(faq)) {
    const parsed = faq
      .map((item) => {
        if (!isRecord(item)) {
          return null
        }

        const question = readString(item.question)
        const answer = readString(item.answer)

        if (!question || !answer) {
          return null
        }

        return { question, answer }
      })
      .filter(Boolean) as FAQItem[]

    if (parsed.length > 0) {
      return parsed
    }
  }

  return [
    {
      question: isPortuguese ? 'Como funciona a confirmação da inscrição?' : 'How does registration confirmation work?',
      answer: isPortuguese
        ? 'Assim que o formulário for enviado, o registro entra no fluxo operacional do Pulse e a confirmação segue pelos canais definidos pelo evento.'
        : 'Once the form is submitted, the record enters the Pulse operational flow and confirmation follows the event communication rules.',
    },
    {
      question: isPortuguese ? 'Posso transferir meu ingresso?' : 'Can I transfer my ticket?',
      answer: isPortuguese
        ? 'A disponibilidade de transferência depende da política do evento e do lote selecionado. O time de suporte pode orientar caso a caso.'
        : 'Transfer availability depends on the event policy and the selected ticket release. Support can guide each case.',
    },
    {
      question: isPortuguese ? 'Receberei informações de acesso antes do evento?' : 'Will I receive access details before the event?',
      answer: isPortuguese
        ? 'Sim. Orientacoes de acesso, horario e documentos exigidos podem ser compartilhados por e-mail ou WhatsApp conforme configuração do produtor.'
        : 'Yes. Access guidance, timing and required documents can be shared by email or WhatsApp based on the producer setup.',
    },
  ]
}

function buildTicketOptions(ticketTypes: EventLandingPageDetail['ticketTypes'], locale: PublicLocale, isPortuguese: boolean): TicketOptionRecord[] {
  const options = ticketTypes.flatMap((ticketType) => {
    const visibleBatches = ticketType.batches.filter((batch) => batch.is_active && batch.is_visible)

    return visibleBatches.map((batch) => {
      const isFree = batch.price <= 0
      const available = Math.max(batch.quantity - batch.sold_count - (batch.reserved_count ?? 0), 0)

      return {
        id: batch.id,
        name: `${ticketType.name} - ${batch.name}`,
        description:
          ticketType.description ||
          (isPortuguese
            ? 'Acesso pensado para manter clareza de valor, disponibilidade e decisão rápida.'
            : 'Access designed to keep value, availability and decision-making clear.'),
        price: batch.price,
        isFree,
        badge: isFree ? (isPortuguese ? 'Gratuito' : 'Free') : batch.name,
        availability: isPortuguese ? `${available} disponíveis` : `${available} available`,
        label: `${ticketType.name} - ${batch.name}${isFree ? '' : ` - ${formatPublicCurrency(batch.price, locale)}`}`,
      }
    })
  })

  if (options.length > 0) {
    return options
  }

  return [
    {
      id: 'pulse-general-registration',
      name: isPortuguese ? 'Inscrição geral' : 'General registration',
      description: isPortuguese
        ? 'Confirmação de interesse para acesso, lista ou liberacao posterior.'
        : 'A general registration for access, waitlist or a later release.',
      price: 0,
      isFree: true,
      badge: isPortuguese ? 'Gratuito' : 'Free',
      availability: isPortuguese ? 'Vagas mediante confirmação' : 'Spots subject to confirmation',
      label: isPortuguese ? 'Inscrição geral - Gratuito' : 'General registration - Free',
    },
  ]
}

function LoadingState() {
  return (
    <PublicLayout showFooter={false}>
      <div className="bg-[var(--pulse-color-surface)] px-6 py-12 md:px-10">
        <div className="mx-auto h-[80vh] max-w-[1280px] animate-pulse rounded-[calc(var(--pulse-radius-lg)+0.5rem)] bg-[var(--pulse-color-background)] shadow-[var(--pulse-shadow-soft)]" />
      </div>
    </PublicLayout>
  )
}

function NotFoundState({ isPortuguese }: { isPortuguese: boolean }) {
  return (
    <PublicLayout showFooter={false}>
      <div className="flex min-h-[70vh] items-center justify-center bg-[var(--pulse-color-surface)] px-6 py-16 text-center">
        <div className="max-w-xl rounded-[calc(var(--pulse-radius-lg)+0.35rem)] border border-[var(--pulse-color-border)] bg-[var(--pulse-color-background)] px-8 py-10 shadow-[var(--pulse-shadow-medium)]">
          <h1 className="text-4xl font-semibold tracking-[-0.05em] text-[var(--pulse-color-primary)]">
            {isPortuguese ? 'Evento não encontrado' : 'Event not found'}
          </h1>
          <p className="mt-4 text-base leading-8 text-[var(--pulse-color-text-secondary)]">
            {isPortuguese
              ? 'O link pode ter expirado ou esta experiência não esta mais pública.'
              : 'This link may have expired or the experience is no longer public.'}
          </p>
          <a
            href="/events"
            className="mt-7 inline-flex items-center justify-center rounded-full bg-[var(--pulse-color-primary)] px-5 py-3 text-sm font-semibold text-[var(--pulse-color-text-inverse)]"
          >
            {isPortuguese ? 'Voltar para eventos' : 'Back to events'}
          </a>
        </div>
      </div>
    </PublicLayout>
  )
}

interface PrivateEventGateProps {
  eventName: string
  onUnlock: (password: string) => boolean
  isPortuguese: boolean
}

function PrivateEventGate({ eventName, onUnlock, isPortuguese }: PrivateEventGateProps) {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(false)
  const [shaking, setShaking] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const ok = onUnlock(password)
    if (!ok) {
      setError(true)
      setShaking(true)
      setPassword('')
      setTimeout(() => setShaking(false), 500)
      setTimeout(() => inputRef.current?.focus(), 10)
    }
  }

  return (
    <PublicLayout showFooter={false}>
      <div className="flex min-h-screen items-center justify-center bg-[#090c12] px-6 py-16">
        <div
          className={`w-full max-w-md rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,#0d1117_0%,#121823_100%)] p-8 shadow-[0_24px_64px_rgba(0,0,0,0.45)] md:p-10 ${shaking ? 'animate-[shake_0.4s_ease-in-out]' : ''}`}
          style={
            shaking
              ? {
                  animation: 'shake 0.4s ease-in-out',
                }
              : undefined
          }
        >
          <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
            <Lock className="h-6 w-6 text-[#ff6a5c]" />
          </div>

          <h1 className="font-display text-3xl font-semibold leading-tight tracking-[-0.04em] text-white md:text-4xl">
            {isPortuguese ? 'Evento privado' : 'Private event'}
          </h1>
          <p className="mt-3 text-sm leading-7 text-white/60">
            <span className="font-medium text-white">{eventName}</span>{' '}
            {isPortuguese
              ? 'requer uma senha de acesso. Insira a senha fornecida pelo organizador para continuar.'
              : 'requires an access password. Enter the password provided by the organizer to continue.'}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="relative">
              <input
                ref={inputRef}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError(false)
                }}
                placeholder={isPortuguese ? 'Senha de acesso' : 'Access password'}
                autoFocus
                className={`w-full rounded-[1.2rem] border px-5 py-4 pr-12 text-sm text-white placeholder-white/30 outline-none transition-all duration-200 bg-white/[0.04] ${
                  error
                    ? 'border-[#ff2d2d]/60 bg-[#ff2d2d]/5 focus:border-[#ff2d2d]'
                    : 'border-white/10 focus:border-white/30 focus:bg-white/[0.07]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-white/70"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {error && (
              <p className="text-xs text-[#ff6a5c]">
                {isPortuguese ? 'Senha incorreta. Tente novamente.' : 'Incorrect password. Please try again.'}
              </p>
            )}

            <button
              type="submit"
              disabled={!password.trim()}
              className="w-full rounded-[1.2rem] bg-[#ff2d2d] py-4 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#ff4133] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isPortuguese ? 'Acessar evento' : 'Access event'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-white/30">
            {isPortuguese
              ? 'Não tem a senha? Fale com o organizador do evento.'
              : "Don't have the password? Contact the event organizer."}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
      `}</style>
    </PublicLayout>
  )
}

export function EventLandingPage({ slug }: EventLandingPageProps) {
  const { locale, isPortuguese } = usePublicLocale()
  const publicEventQuery = usePublicEvent(slug)
  const [selectedTicketId, setSelectedTicketId] = useState<string>()
  const [unlockedPrivate, setUnlockedPrivate] = useState(false)
  const detail = publicEventQuery.data
  const event = detail?.event ?? null
  const mediaPresentation = detail?.mediaPresentation ?? null
  const settings = event?.settings ?? {}

  const heroVideoUrl = mediaPresentation ? getAssetUrl(mediaPresentation.heroAsset) : ''
  const heroImageUrl = mediaPresentation ? getAssetUrl(mediaPresentation.coverAsset) : event?.cover_url ?? ''
  const heroPoster = mediaPresentation ? getAssetUrl(mediaPresentation.coverAsset) : event?.cover_url ?? ''
  const galleryImages = mediaPresentation
    ? [mediaPresentation.coverAsset, mediaPresentation.galleryImages[0], mediaPresentation.galleryImages[1]]
        .filter(Boolean)
        .map((asset, index) => ({
          src: getAssetUrl(asset),
          alt: asset?.alt_text || event?.name || `Pulse image ${index + 1}`,
        }))
        .filter((asset) => Boolean(asset.src))
    : []

  const agendaItems = useMemo(
    () => (event ? readAgendaItems(settings, event.starts_at, event.ends_at, locale, isPortuguese) : []),
    [event, isPortuguese, locale, settings],
  )
  const faqItems = useMemo(() => readFaqItems(settings, isPortuguese), [isPortuguese, settings])
  const ticketOptions = useMemo(() => (detail ? buildTicketOptions(detail.ticketTypes, locale, isPortuguese) : []), [detail, isPortuguese, locale])

  const supportEmail = readString(settings.supportEmail, 'suporte@pulse.so')
  const supportWhatsapp = readString(settings.supportWhatsapp, '+55 11 99999-0000')
  const contentTone = readString(settings.heroTone, heroVideoUrl || heroImageUrl ? 'light' : 'dark') === 'dark' ? 'dark' : 'light'

  useSeoMeta({
    title: event ? `${event.name} | Pulse` : isPortuguese ? 'Evento | Pulse' : 'Event | Pulse',
    description:
      event?.short_description ||
      event?.full_description ||
      (isPortuguese
        ? 'Inscrições, agenda e informações do evento em uma landing Pulse mais clara e premium.'
        : 'Registrations, agenda and event information in a clearer premium Pulse landing page.'),
    image: heroImageUrl,
    url: typeof window !== 'undefined' ? window.location.href : `/e/${slug}`,
  })

  if (publicEventQuery.isPending) {
    return <LoadingState />
  }

  if (!event || !detail) {
    return <NotFoundState isPortuguese={isPortuguese} />
  }

  if (event.is_private && !unlockedPrivate) {
    return (
      <PrivateEventGate
        eventName={event.name}
        isPortuguese={isPortuguese}
        onUnlock={(password) => {
          if (password === event.access_password) {
            setUnlockedPrivate(true)
            return true
          }
          return false
        }}
      />
    )
  }

  const eventRecord = event
  const selectedTicket = ticketOptions.find((ticket) => ticket.id === selectedTicketId) ?? ticketOptions[0]

  async function handleSignupSubmit(values: SignupFormValues) {
    const selectedOption = ticketOptions.find((ticket) => ticket.id === values.ticketOptionId)

    await eventLandingRegistrationService.submit({
      organizationId: eventRecord.organization_id,
      eventId: eventRecord.id,
      fullName: values.fullName,
      email: values.email,
      phone: values.phone,
      cpf: values.cpf,
      additionalInfo: values.additionalInfo,
      ticketOptionId: values.ticketOptionId,
      ticketOptionLabel: selectedOption?.label || values.ticketOptionId,
    })
  }

  function scrollToSection(sectionId: string) {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <PublicLayout showFooter={false} heroPage>
      <EventHero
        title={eventRecord.name}
        subtitle={eventRecord.subtitle || eventRecord.short_description || eventRecord.full_description || ''}
        eventDate={eventRecord.starts_at}
        primaryActionLabel={
          selectedTicket?.isFree
            ? isPortuguese
              ? 'Inscreva-se agora'
              : 'Register now'
            : isPortuguese
              ? 'Compre / Inscreva-se'
              : 'Buy / Register'
        }
        onPrimaryAction={() => scrollToSection(eventRecord.registration_mode === 'tickets' ? 'ingressos' : 'inscricao')}
        secondaryActionLabel={isPortuguese ? 'Saiba mais' : 'Learn more'}
        onSecondaryAction={() => scrollToSection('sobre')}
        backgroundMediaUrl={heroVideoUrl || heroImageUrl}
        backgroundMediaType={heroVideoUrl ? 'video' : 'image'}
        contentTone={contentTone}
        posterUrl={heroPoster}
        eyebrow={`${formatPublicDate(eventRecord.starts_at, locale)} - ${eventRecord.venue_name || (isPortuguese ? 'Pulse Experience' : 'Pulse Experience')}`}
      />

      <AboutSection
        description={eventRecord.full_description || eventRecord.short_description || (isPortuguese ? 'Uma experiência premium com narrativa clara, agenda objetiva e foco em conversão.' : 'A premium experience with clear storytelling, objective scheduling and conversion focus.')}
        startsAt={eventRecord.starts_at}
        endsAt={eventRecord.ends_at}
        doorsOpenAt={eventRecord.doors_open_at}
        venueName={eventRecord.venue_name}
        venueAddress={eventRecord.venue_address}
        images={galleryImages}
      />

      <AgendaSection items={agendaItems} />

      <TicketsSection
        tickets={ticketOptions}
        selectedTicketId={selectedTicket?.id}
        onSelect={(ticketId) => {
          setSelectedTicketId(ticketId)
          scrollToSection('inscricao')
        }}
      />

      <SignupFormSection
        ticketOptions={ticketOptions.map((ticket) => ({
          value: ticket.id,
          label: ticket.label,
        }))}
        defaultTicketOptionId={selectedTicket?.id}
        onSubmit={handleSignupSubmit}
      />

      <FAQSection items={faqItems} supportEmail={supportEmail} supportWhatsapp={supportWhatsapp} />
    </PublicLayout>
  )
}

export default EventLandingPage
