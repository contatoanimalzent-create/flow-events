import { Play } from 'lucide-react'
import { getEventAssetUrl } from '@/features/event-media'
import type { PublicEventSummary } from '@/features/public/types/public.types'
import { PremiumSection } from './PremiumSection'
import { PublicReveal } from './PublicReveal'

interface ExperienceVisualSectionProps {
  events: PublicEventSummary[]
}

function VisualTile({
  event,
  className,
  priority = false,
}: {
  event: PublicEventSummary
  className?: string
  priority?: boolean
}) {
  const heroUrl = getEventAssetUrl(event.mediaPresentation.heroAsset)
  const coverUrl =
    getEventAssetUrl(event.mediaPresentation.coverAsset) ||
    event.cover_url ||
    'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1800&q=80&fit=crop'

  return (
    <div className={`group relative overflow-hidden rounded-[2rem] border border-white/70 bg-[#201913] shadow-[0_24px_80px_rgba(41,29,15,0.1)] ${className ?? ''}`}>
      {heroUrl ? (
        <video
          src={heroUrl}
          poster={event.mediaPresentation.heroAsset?.thumbnail_url ?? coverUrl}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
      ) : (
        <img
          src={coverUrl}
          alt={event.name}
          loading={priority ? 'eager' : 'lazy'}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
      )}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(19,14,10,0.08)_0%,rgba(19,14,10,0.16)_38%,rgba(19,14,10,0.86)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 z-10 p-6 text-white">
        <div className="flex items-center gap-3">
          {heroUrl ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.24em] text-white/82 backdrop-blur-md">
              <Play className="h-3 w-3" />
              Motion
            </span>
          ) : null}
          {event.category ? (
            <span className="inline-flex rounded-full border border-white/12 bg-white/10 px-3 py-1.5 text-[10px] uppercase tracking-[0.24em] text-white/82 backdrop-blur-md">
              {event.category}
            </span>
          ) : null}
        </div>
        <div className="mt-4 max-w-sm font-display text-[2rem] font-semibold leading-[0.92] tracking-[-0.04em] text-white">
          {event.name}
        </div>
      </div>
    </div>
  )
}

export function ExperienceVisualSection({ events }: ExperienceVisualSectionProps) {
  if (events.length === 0) {
    return null
  }

  const [primary, secondary, tertiary] = events
  const sideEvents = [secondary, tertiary].filter(Boolean) as PublicEventSummary[]

  return (
    <PremiumSection
      eyebrow="Atmosfera"
      title="Uma linguagem visual que vende presenca, escala e desejo."
      description="Imagem, video e composicao trabalham como prova emocional de que cada experiencia tem identidade propria."
    >
      <div className="grid gap-6 lg:grid-cols-[1.18fr_0.82fr]">
        <PublicReveal>
          <VisualTile event={primary} priority className="min-h-[28rem] md:min-h-[40rem]" />
        </PublicReveal>

        <div className="grid gap-6">
          {sideEvents.map((event, index) => (
            <PublicReveal key={event.id} delayMs={index * 100 + 80}>
              <VisualTile event={event} className="min-h-[16rem] md:min-h-[19rem]" />
            </PublicReveal>
          ))}

          <PublicReveal delayMs={220}>
            <div className="rounded-[2rem] border border-[#eadfce] bg-[linear-gradient(135deg,rgba(255,255,255,0.84),rgba(244,236,224,0.78))] p-7 shadow-[0_22px_70px_rgba(48,35,18,0.07)]">
              <div className="text-[11px] uppercase tracking-[0.3em] text-[#8e7f68]">Direcao</div>
              <div className="mt-4 font-display text-[2.1rem] font-semibold leading-[0.94] tracking-[-0.04em] text-[#1f1a15]">
                Menos vitrine tecnica. Mais atmosfera, ritmo e vontade de entrar.
              </div>
              <p className="mt-4 text-sm leading-7 text-[#5f5549]">
                O design foi pensado para sustentar experiencias aspiracionais, com presenca cinematografica, tipografia editorial e um senso de curadoria constante.
              </p>
            </div>
          </PublicReveal>
        </div>
      </div>
    </PremiumSection>
  )
}
