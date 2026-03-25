import { getEventAssetUrl } from '@/features/event-media/types'
import type { EventMediaAsset } from '@/features/event-media/types'

interface EventImageGalleryProps {
  assets: EventMediaAsset[]
}

export function EventImageGallery({ assets }: EventImageGalleryProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {assets.map((asset, index) => (
        <figure
          key={asset.id}
          className={`group overflow-hidden rounded-sm border border-[#1a1a1a] bg-[#0e0e0e] ${index === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}
        >
          <div className="overflow-hidden">
            <img
              src={getEventAssetUrl(asset)}
              alt={asset.alt_text ?? asset.caption ?? 'Imagem do evento'}
              className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${index === 0 ? 'h-[420px]' : 'h-[200px]'}`}
            />
          </div>
          {(asset.caption || asset.alt_text) && (
            <figcaption className="space-y-1 px-4 py-3">
              {asset.caption ? <div className="text-sm font-semibold text-[#f5f5f0]">{asset.caption}</div> : null}
              {asset.alt_text ? <div className="text-xs text-[#9a9a9a]">{asset.alt_text}</div> : null}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  )
}
