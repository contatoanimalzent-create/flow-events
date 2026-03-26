import { CalendarDays, MapPin, Sparkles, Users } from 'lucide-react'
import { getEventAssetUrl, isVideoAsset } from '@/features/event-media'
import type { EventMediaAsset } from '@/features/event-media/types'
import { PublicReveal } from './PublicReveal'

interface EventStorySectionProps {
  eyebrow: string
  title: string
  description: string
  asset?: EventMediaAsset | null
  reverse?: boolean
  highlights: Array<{ label: string; value: string }>
}

export function EventExperienceBlock({ highlights }: { highlights: Array<{ label: string; value: string }> }) {
  const icons = [Sparkles, CalendarDays, MapPin, Users]

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {highlights.map((item, index) => {
        const Icon = icons[index % icons.length]

        return (
          <div key={item.label} className="rounded-[1.5rem] border border-[#eee2cf] bg-[#fbf7f1] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f2e6d5] text-[#7b6440]">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.24em] text-[#8e7f68]">{item.label}</div>
                <div className="mt-1 text-sm font-medium leading-6 text-[#1f1a15]">{item.value}</div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function EventStorySection({
  eyebrow,
  title,
  description,
  asset,
  reverse = false,
  highlights,
}: EventStorySectionProps) {
  const media = asset ? (
    isVideoAsset(asset) ? (
      <video
        src={getEventAssetUrl(asset)}
        poster={asset.thumbnail_url ?? undefined}
        autoPlay
        muted
        loop
        playsInline
        className="h-full w-full object-cover"
      />
    ) : (
      <img
        src={getEventAssetUrl(asset)}
        alt={asset.alt_text ?? asset.caption ?? title}
        className="h-full w-full object-cover"
      />
    )
  ) : (
    <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,#f2debf,transparent_28%),linear-gradient(135deg,#f7f1e7_0%,#eadfce_48%,#f5ede2_100%)]" />
  )

  return (
    <section className="px-5 py-8 md:px-10 lg:px-16 lg:py-10">
      <div className={`mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-center ${reverse ? 'lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1' : ''}`}>
        <PublicReveal>
          <div className="overflow-hidden rounded-[2.2rem] border border-white/70 bg-white/78 shadow-[0_22px_70px_rgba(48,35,18,0.08)]">
            <div className="aspect-[16/10] overflow-hidden">{media}</div>
          </div>
        </PublicReveal>

        <PublicReveal delayMs={120}>
          <div className="rounded-[2.1rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(250,244,236,0.78))] p-7 shadow-[0_18px_55px_rgba(48,35,18,0.06)] md:p-8">
            <div className="text-[11px] uppercase tracking-[0.32em] text-[#8e7f68]">{eyebrow}</div>
            <h3 className="mt-5 font-display text-[clamp(2.5rem,4vw,4rem)] font-semibold leading-[0.92] tracking-[-0.04em] text-[#1f1a15]">
              {title}
            </h3>
            <p className="mt-5 text-base leading-8 text-[#5f5549] md:text-lg">{description}</p>
            <div className="mt-7">
              <EventExperienceBlock highlights={highlights} />
            </div>
          </div>
        </PublicReveal>
      </div>
    </section>
  )
}
