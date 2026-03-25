import { PlayCircle } from 'lucide-react'
import { getEventAssetUrl } from '@/features/event-media/types'
import type { EventMediaAsset } from '@/features/event-media/types'

interface EventVideoBlockProps {
  asset: EventMediaAsset
}

export function EventVideoBlock({ asset }: EventVideoBlockProps) {
  return (
    <div className="group overflow-hidden rounded-sm border border-[#1a1a1a] bg-[#0e0e0e]">
      <div className="relative aspect-video overflow-hidden">
        <video
          src={getEventAssetUrl(asset)}
          poster={asset.thumbnail_url ?? undefined}
          controls
          className="h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-sm bg-black/50 px-3 py-1.5 backdrop-blur-sm">
          <PlayCircle className="h-4 w-4 text-[#d4ff00]" />
          <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/80">Video</span>
        </div>
      </div>
      {(asset.caption || asset.alt_text) && (
        <div className="space-y-1 px-4 py-3">
          {asset.caption ? <div className="text-sm font-semibold text-[#f5f5f0]">{asset.caption}</div> : null}
          {asset.alt_text ? <div className="text-xs text-[#9a9a9a]">{asset.alt_text}</div> : null}
        </div>
      )}
    </div>
  )
}
