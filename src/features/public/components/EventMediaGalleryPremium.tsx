import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { getEventAssetUrl, isVideoAsset } from '@/features/event-media'
import type { EventMediaAsset, EventMediaPresentation } from '@/features/event-media/types'
import { PublicReveal } from './PublicReveal'

interface EventMediaGalleryPremiumProps {
  presentation: EventMediaPresentation
  eventName: string
}

export function EventImagePreviewCard({
  asset,
  className,
  onClick,
}: {
  asset: EventMediaAsset
  className?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative overflow-hidden rounded-[1.8rem] border border-white/70 shadow-[0_18px_55px_rgba(48,35,18,0.08)] ${className ?? ''}`}
    >
      <img
        src={getEventAssetUrl(asset)}
        alt={asset.alt_text ?? asset.caption ?? 'Imagem do evento'}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(19,14,10,0.04)_0%,rgba(19,14,10,0.1)_40%,rgba(19,14,10,0.72)_100%)]" />
      {asset.caption || asset.alt_text ? (
        <div className="absolute inset-x-0 bottom-0 p-5 text-left text-white">
          {asset.caption ? <div className="font-display text-[1.8rem] font-semibold leading-[0.92] tracking-[-0.03em]">{asset.caption}</div> : null}
          {asset.alt_text ? <div className="mt-2 text-sm text-white/78">{asset.alt_text}</div> : null}
        </div>
      ) : null}
    </button>
  )
}

export function EventVideoPreviewCard({
  asset,
  className,
  onClick,
}: {
  asset: EventMediaAsset
  className?: string
  onClick: () => void
}) {
  const previewUrl = asset.thumbnail_url ?? getEventAssetUrl(asset)

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative overflow-hidden rounded-[1.8rem] border border-white/70 bg-[#1f1813] shadow-[0_18px_55px_rgba(48,35,18,0.08)] ${className ?? ''}`}
    >
      <img
        src={previewUrl}
        alt={asset.alt_text ?? asset.caption ?? 'Video do evento'}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(19,14,10,0.06)_0%,rgba(19,14,10,0.16)_40%,rgba(19,14,10,0.8)_100%)]" />
      <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-white/86 backdrop-blur-md">
        <Play className="h-3.5 w-3.5" />
        Video
      </div>
      {asset.caption || asset.alt_text ? (
        <div className="absolute inset-x-0 bottom-0 p-5 text-left text-white">
          {asset.caption ? <div className="font-display text-[1.8rem] font-semibold leading-[0.92] tracking-[-0.03em]">{asset.caption}</div> : null}
          {asset.alt_text ? <div className="mt-2 text-sm text-white/78">{asset.alt_text}</div> : null}
        </div>
      ) : null}
    </button>
  )
}

export function EventGalleryLightbox({
  assets,
  activeIndex,
  eventName,
  onClose,
  onPrevious,
  onNext,
}: {
  assets: EventMediaAsset[]
  activeIndex: number
  eventName: string
  onClose: () => void
  onPrevious: () => void
  onNext: () => void
}) {
  const asset = assets[activeIndex]

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft') onPrevious()
      if (event.key === 'ArrowRight') onNext()
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, onNext, onPrevious])

  if (!asset) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[90] bg-[rgba(15,11,8,0.92)] px-4 py-6 backdrop-blur-xl md:px-8">
      <div className="mx-auto flex h-full max-w-6xl flex-col">
        <div className="flex items-center justify-between gap-4 text-white">
          <div>
            <div className="text-[11px] uppercase tracking-[0.28em] text-white/54">Event gallery</div>
            <div className="mt-2 font-display text-3xl font-semibold leading-none tracking-[-0.04em]">
              {asset.caption || asset.alt_text || eventName}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/14 bg-white/10 text-white transition-all duration-300 hover:bg-white/16"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative mt-6 flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-[2rem] border border-white/12 bg-black/30">
          {isVideoAsset(asset) ? (
            <video
              src={getEventAssetUrl(asset)}
              poster={asset.thumbnail_url ?? undefined}
              controls
              autoPlay
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <img
              src={getEventAssetUrl(asset)}
              alt={asset.alt_text ?? asset.caption ?? eventName}
              className="max-h-full max-w-full object-contain"
            />
          )}

          <button
            type="button"
            onClick={onPrevious}
            className="absolute left-4 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/14 bg-white/10 text-white transition-all duration-300 hover:bg-white/16"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onNext}
            className="absolute right-4 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/14 bg-white/10 text-white transition-all duration-300 hover:bg-white/16"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function EventMediaGalleryPremium({ presentation, eventName }: EventMediaGalleryPremiumProps) {
  const galleryAssets = useMemo(
    () => presentation.assets.filter((asset) => asset.usage_type === 'gallery'),
    [presentation.assets],
  )
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  if (galleryAssets.length === 0) {
    return null
  }

  return (
    <section className="px-5 py-10 md:px-10 lg:px-16 lg:py-14">
      <div className="mx-auto max-w-7xl">
        <PublicReveal>
          <div className="max-w-3xl">
            <div className="text-[11px] uppercase tracking-[0.32em] text-[#8e7f68]">Gallery</div>
            <h2 className="mt-4 font-display text-[clamp(2.7rem,4vw,4.2rem)] font-semibold leading-[0.92] tracking-[-0.04em] text-[#1f1a15]">
              Midia real do evento, organizada como uma vitrine premium.
            </h2>
          </div>
        </PublicReveal>

        <div className="mt-8 grid gap-4 md:grid-cols-12">
          {galleryAssets.map((asset, index) => {
            const layoutClassName =
              index === 0
                ? 'md:col-span-7 min-h-[28rem]'
                : index === 1
                  ? 'md:col-span-5 min-h-[28rem]'
                  : 'md:col-span-6 min-h-[20rem]'

            const commonProps = {
              asset,
              className: layoutClassName,
              onClick: () => setActiveIndex(index),
            }

            return (
              <PublicReveal key={asset.id} delayMs={index * 70}>
                {isVideoAsset(asset) ? <EventVideoPreviewCard {...commonProps} /> : <EventImagePreviewCard {...commonProps} />}
              </PublicReveal>
            )
          })}
        </div>
      </div>

      {activeIndex !== null ? (
        <EventGalleryLightbox
          assets={galleryAssets}
          activeIndex={activeIndex}
          eventName={eventName}
          onClose={() => setActiveIndex(null)}
          onPrevious={() => setActiveIndex((current) => (current === null ? null : (current - 1 + galleryAssets.length) % galleryAssets.length))}
          onNext={() => setActiveIndex((current) => (current === null ? null : (current + 1) % galleryAssets.length))}
        />
      ) : null}
    </section>
  )
}
