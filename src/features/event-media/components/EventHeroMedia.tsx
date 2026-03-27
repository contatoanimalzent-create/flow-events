import { useEffect, useState } from 'react'
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
  const heroVideoUrl = getEventAssetUrl(heroAsset)
  const resolvedCoverUrl = getEventAssetUrl(coverAsset) || fallbackImage
  const [videoFailed, setVideoFailed] = useState(false)
  const [imageSrc, setImageSrc] = useState(resolvedCoverUrl)

  useEffect(() => {
    setVideoFailed(false)
    setImageSrc(resolvedCoverUrl)
  }, [resolvedCoverUrl, heroVideoUrl, eventName])

  if (heroVideoUrl && !videoFailed) {
    const posterUrl = heroAsset?.thumbnail_url ?? resolvedCoverUrl

    return (
      <video
        src={heroVideoUrl}
        poster={posterUrl}
        preload="metadata"
        autoPlay
        muted
        loop
        playsInline
        onError={() => setVideoFailed(true)}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ transform: 'scale(1.05)' }}
      />
    )
  }

  return (
    <img
      src={imageSrc}
      alt=""
      aria-hidden="true"
      loading="eager"
      decoding="async"
      fetchPriority="high"
      className="absolute inset-0 h-full w-full object-cover"
      onError={() => {
        if (imageSrc !== fallbackImage) {
          setImageSrc(fallbackImage)
        }
      }}
      style={{ transform: `scale(1.1) translateY(${scrollY * 0.15}px)`, transition: 'transform 0.1s ease-out' }}
    />
  )
}
