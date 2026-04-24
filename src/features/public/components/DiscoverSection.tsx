import { ArrowRight } from 'lucide-react'
import { EmptyState } from '@/shared/components'
import { formatCurrency } from '@/shared/lib'
import { getEventAssetUrl } from '@/features/event-media'
import type { PublicEventSummary } from '@/features/public/types/public.types'
import { PremiumSection } from './PremiumSection'
import { PublicReveal } from './PublicReveal'

interface DiscoverSectionProps {
  events: PublicEventSummary[]
  categories: string[]
}

function DiscoverCard({ event, index }: { event: PublicEventSummary; index: number }) {
  const imageUrl =
    getEventAssetUrl(event.mediaPresentation.coverAsset) ||
    event.cover_url ||
    'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1800&q=80&fit=crop'

  const layoutClassName =
    index % 3 === 0
      ? 'md:col-span-7 min-h-[28rem]'
      : index % 3 === 1
        ? 'md:col-span-5 min-h-[28rem]'
        : 'md:col-span-6 min-h-[24rem]'

  return (
    <PublicReveal delayMs={index * 80}>
      <a
        href={`/e/${event.slug}`}
        className={`group relative block overflow-hidden rounded-[2rem] border border-white/10 bg-[#201913] shadow-[0_20px_70px_rgba(0,0,0,0.2)] ${layoutClassName}`}
      >
        <img
          src={imageUrl}
          alt={event.name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(23,16,10,0.04)_0%,rgba(23,16,10,0.16)_32%,rgba(23,16,10,0.82)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 z-10 p-6 text-white">
          <div className="text-[11px] uppercase tracking-[0.28em] text-white/70">{event.category || 'Experiencia'}</div>
          <div className="mt-3 max-w-md font-display text-[2.2rem] font-semibold leading-[0.92] tracking-[-0.04em]">
            {event.name}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-white/74">
            <span>{[event.city, event.state].filter(Boolean).join(', ')}</span>
            <span className="h-1 w-1 rounded-full bg-white/36" />
            <span>
              {event.minPrice === null
                ? 'Sob consulta'
                : event.minPrice === 0
                  ? 'Inscrição gratuita'
                  : formatCurrency(event.minPrice)}
            </span>
          </div>
          <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-white">
            Descobrir experiência
            <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
          </div>
        </div>
      </a>
    </PublicReveal>
  )
}

export function DiscoverSection({ events, categories }: DiscoverSectionProps) {
  return (
    <PremiumSection
      eyebrow="Mais eventos"
      title="Continue explorando."
      description="Filtre por cidade, categoria ou data e encontre o próximo evento que vale a sua presença."
    >
      <div className="flex flex-wrap gap-3">
        {categories.map((category, index) => (
          <PublicReveal key={category} delayMs={index * 60}>
            <span className="inline-flex rounded-full border border-white/10 bg-white/6 px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-white/70">
              {category}
            </span>
          </PublicReveal>
        ))}
      </div>

      <div className="mt-8">
        {events.length === 0 ? (
          <EmptyState
            title="Nenhum evento encontrado"
            description="Tente outros filtros ou volte em breve para conferir novidades."
            className="min-h-[18rem]"
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-12">
            {events.map((event, index) => (
              <DiscoverCard key={event.id} event={event} index={index} />
            ))}
          </div>
        )}
      </div>
    </PremiumSection>
  )
}
