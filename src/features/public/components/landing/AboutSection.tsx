import { CalendarDays, Clock3, MapPin, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatPublicDate, formatPublicTime, usePublicLocale } from '@/features/public/lib/public-locale'
import { useAnimationPreset } from '@/shared/motion'

interface AboutSectionImage {
  src: string
  alt: string
}

export interface AboutSectionProps {
  title?: string
  description: string
  startsAt: string
  endsAt?: string
  doorsOpenAt?: string
  venueName?: string
  venueAddress?: Record<string, string> | null
  images?: AboutSectionImage[]
}

function getAddressLabel(address?: Record<string, string> | null) {
  if (!address) {
    return ''
  }

  return [address.street, address.number, address.district, address.city, address.state].filter(Boolean).join(', ')
}

export function AboutSection({
  title,
  description,
  startsAt,
  endsAt,
  doorsOpenAt,
  venueName,
  venueAddress,
  images = [],
}: AboutSectionProps) {
  const { locale, isPortuguese } = usePublicLocale()
  const sectionAnimation = useAnimationPreset('fadeIn', { durationMs: 420, amount: 0.05 })
  const blockAnimation = useAnimationPreset('slideUp', { durationMs: 460, distance: 22, amount: 0.1 })
  const addressLabel = getAddressLabel(venueAddress)

  const infoItems = [
    {
      icon: CalendarDays,
      label: isPortuguese ? 'Data' : 'Date',
      value: endsAt
        ? `${formatPublicDate(startsAt, locale)} - ${formatPublicDate(endsAt, locale)}`
        : formatPublicDate(startsAt, locale),
    },
    {
      icon: Clock3,
      label: isPortuguese ? 'Horario' : 'Time',
      value: doorsOpenAt
        ? isPortuguese
          ? `Abertura ${formatPublicTime(doorsOpenAt, locale)}`
          : `Doors ${formatPublicTime(doorsOpenAt, locale)}`
        : formatPublicTime(startsAt, locale),
    },
    {
      icon: MapPin,
      label: isPortuguese ? 'Local' : 'Venue',
      value: [venueName, addressLabel].filter(Boolean).join(' - ') || (isPortuguese ? 'Local a confirmar' : 'Venue to be announced'),
    },
  ]

  const gallery = images.slice(0, 2)

  return (
    <motion.section
      id="sobre"
      className="bg-[var(--pulse-color-background)] py-20 md:py-28"
      initial={sectionAnimation.initial}
      whileInView={sectionAnimation.whileInView}
      viewport={sectionAnimation.viewport}
      variants={sectionAnimation.variants}
    >
      <div className="mx-auto grid max-w-[1280px] gap-10 px-6 md:px-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(22rem,0.92fr)] lg:gap-14 lg:px-10">
        <motion.div
          initial={blockAnimation.initial}
          whileInView={blockAnimation.whileInView}
          viewport={blockAnimation.viewport}
          variants={blockAnimation.variants}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--pulse-color-border)] bg-[var(--pulse-color-surface)] px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--pulse-color-primary)]">
            <Sparkles className="h-4 w-4" />
            {isPortuguese ? 'Sobre o evento' : 'About the event'}
          </div>

          <h2 className="mt-5 text-[clamp(2rem,4vw,3.25rem)] font-semibold leading-[1.02] tracking-[-0.05em] text-[var(--pulse-color-primary)]">
            {title || (isPortuguese ? 'Uma experiência desenhada para gerar presença e decisão.' : 'An experience designed to create presence and momentum.')}
          </h2>

          <p className="mt-6 max-w-[42rem] text-[1rem] leading-8 text-[var(--pulse-color-text-secondary)] md:text-[1.06rem]">
            {description}
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {infoItems.map((item) => {
              const Icon = item.icon

              return (
                <div
                  key={item.label}
                  className="rounded-[var(--pulse-radius-lg)] border border-[rgba(255,255,255,0.10)] bg-[var(--pulse-surface-elevated)] p-5 shadow-[var(--pulse-shadow-soft)]"
                >
                  <div className="flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[var(--pulse-color-primary)]">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--pulse-color-text-primary)]">{item.value}</p>
                </div>
              )
            })}
          </div>
        </motion.div>

        <motion.div
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-1"
          initial={blockAnimation.initial}
          whileInView={blockAnimation.whileInView}
          viewport={blockAnimation.viewport}
          variants={blockAnimation.variants}
        >
          {gallery.length > 0 ? (
            gallery.map((image, index) => (
              <div
                key={`${image.src}-${index}`}
                className="overflow-hidden rounded-[calc(var(--pulse-radius-lg)+0.25rem)] border border-[var(--pulse-color-border)] bg-[var(--pulse-color-surface)] shadow-[var(--pulse-shadow-medium)]"
              >
                <img src={image.src} alt={image.alt} className="h-[18rem] w-full object-cover md:h-[20rem]" />
              </div>
            ))
          ) : (
            <>
              <div className="rounded-[calc(var(--pulse-radius-lg)+0.25rem)] border border-[rgba(255,255,255,0.10)] bg-[linear-gradient(180deg,var(--pulse-surface-elevated)_0%,rgba(255,255,255,0.06)_100%)] p-7 shadow-[var(--pulse-shadow-medium)]">
                <div className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[var(--pulse-color-primary)]">
                  {isPortuguese ? 'Mapa conceitual' : 'Concept map'}
                </div>
                <div className="mt-5 grid gap-3">
                  <div className="rounded-[var(--pulse-radius-md)] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-4 text-sm text-[var(--pulse-color-text-secondary)]">
                    {isPortuguese ? 'Recepcao, credenciamento e fluxo principal em um único eixo claro.' : 'Reception, credentialing and the main flow aligned into one clear axis.'}
                  </div>
                  <div className="rounded-[var(--pulse-radius-md)] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-4 text-sm text-[var(--pulse-color-text-secondary)]">
                    {isPortuguese ? 'Palco, lounges e ativacoes distribuidos para gerar circulacao natural.' : 'Stage, lounges and activations distributed to create natural movement.'}
                  </div>
                </div>
              </div>

              <div className="rounded-[calc(var(--pulse-radius-lg)+0.25rem)] border border-[var(--pulse-color-border)] bg-[var(--pulse-color-primary)] p-7 text-[var(--pulse-color-text-inverse)] shadow-[var(--pulse-shadow-medium)]">
                <div className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white/80">
                  {isPortuguese ? 'Operação no detalhe' : 'Operational detail'}
                </div>
                <p className="mt-4 text-lg leading-8 text-white/88">
                  {isPortuguese
                    ? 'Cada camada da landing ajuda a reduzir friccao entre descoberta, contexto e inscrição.'
                    : 'Each layer of the landing reduces friction between discovery, context and registration.'}
                </p>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </motion.section>
  )
}
