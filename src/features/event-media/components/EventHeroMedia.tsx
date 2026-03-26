import { getEventAssetUrl } from '@/features/event-media/types'
import type { EventMediaAsset } from '@/features/event-media/types'

interface EventHeroMediaProps {
  eventName: string
  coverAsset: EventMediaAsset | null
  heroAsset: EventMediaAsset | null
  fallbackImage: string
  scrollY: number
}

export function EventHeroMedia({ eventName, coverAsset, heroAsset, fallbackImage, scrollY }: EventHeroMediaProps) {
  if (heroAsset) {
    const posterUrl = heroAsset.thumbnail_url ?? getEventAssetUrl(coverAsset) ?? fallbackImage

    return (
      <video
        src={getEventAssetUrl(heroAsset)}
        poster={posterUrl}
        preload="metadata"
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        style={{ transform: 'scale(1.05)' }}
      />
    )
  }

  const coverUrl = getEventAssetUrl(coverAsset) || fallbackImage

  return (
    <img
      src={coverUrl}
      alt={coverAsset?.alt_text ?? eventName}
      loading="eager"
      decoding="async"
      fetchPriority="high"
      className="absolute inset-0 h-full w-full object-cover"
      style={{ transform: `scale(1.1) translateY(${scrollY * 0.15}px)`, transition: 'transform 0.1s ease-out' }}
    />
  )
}
