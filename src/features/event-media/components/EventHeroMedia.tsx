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
  const [displayImageSrc, setDisplayImageSrc] = useState(fallbackImage)

  useEffect(() => {
    setVideoFailed(false)
    setDisplayImageSrc(fallbackImage)

    if (!resolvedCoverUrl) {
      return
    }

    const image = new window.Image()
    image.decoding = 'async'
    image.onload = () => setDisplayImageSrc(resolvedCoverUrl)
    image.onerror = () => setDisplayImageSrc(fallbackImage)
    image.src = resolvedCoverUrl
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
    <div
      aria-hidden="true"
      className="absolute inset-0 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url("${displayImageSrc}")`,
        transform: `scale(1.1) translateY(${scrollY * 0.15}px)`,
        transition: 'transform 0.1s ease-out',
      }}
    />
  )
}
