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
          className={`group overflow-hidden rounded-[28px] border border-white/70 bg-white/80 shadow-[0_16px_60px_rgba(48,35,18,0.05)] ${index === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}
        >
          <div className="overflow-hidden">
            <img
              src={getEventAssetUrl(asset)}
              alt={asset.alt_text ?? asset.caption ?? 'Imagem do evento'}
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding="async"
              className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${index === 0 ? 'h-[420px]' : 'h-[200px]'}`}
            />
          </div>
          {(asset.caption || asset.alt_text) && (
            <figcaption className="space-y-1 px-5 py-4">
              {asset.caption ? <div className="font-serif text-2xl font-semibold leading-none text-[#1f1a15]">{asset.caption}</div> : null}
              {asset.alt_text ? <div className="text-sm text-[#5f5549]">{asset.alt_text}</div> : null}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  )
}
