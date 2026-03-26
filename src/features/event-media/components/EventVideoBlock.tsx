import { useEffect, useRef, useState } from 'react'
import { PlayCircle } from 'lucide-react'
import { getEventAssetUrl } from '@/features/event-media/types'
import type { EventMediaAsset } from '@/features/event-media/types'

interface EventVideoBlockProps {
  asset: EventMediaAsset
}

export function EventVideoBlock({ asset }: EventVideoBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [src, setSrc] = useState<string | undefined>(undefined)

  useEffect(() => {
    const node = containerRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSrc(getEventAssetUrl(asset))
          observer.disconnect()
        }
      },
      { rootMargin: '200px' },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [asset])

  return (
    <div className="group overflow-hidden rounded-[28px] border border-white/70 bg-white/80 shadow-[0_16px_60px_rgba(48,35,18,0.05)]">
      <div ref={containerRef} className="relative aspect-video overflow-hidden">
        <video
          src={src}
          poster={asset.thumbnail_url ?? undefined}
          preload="none"
          controls
          className="h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#201913]/45 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/45 bg-white/82 px-3 py-1.5 backdrop-blur-sm">
          <PlayCircle className="h-4 w-4 text-[#7b6440]" />
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#5f5549]">Video</span>
        </div>
      </div>
      {(asset.caption || asset.alt_text) && (
        <div className="space-y-1 px-5 py-4">
          {asset.caption ? <div className="font-serif text-2xl font-semibold leading-none text-[#1f1a15]">{asset.caption}</div> : null}
          {asset.alt_text ? <div className="text-sm text-[#5f5549]">{asset.alt_text}</div> : null}
        </div>
      )}
    </div>
  )
}
