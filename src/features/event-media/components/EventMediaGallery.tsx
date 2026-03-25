import type { EventMediaPresentation } from '@/features/event-media/types'
import { EventImageGallery } from './EventImageGallery'
import { EventVideoBlock } from './EventVideoBlock'

interface EventMediaGalleryProps {
  presentation: EventMediaPresentation
}

export function EventMediaGallery({ presentation }: EventMediaGalleryProps) {
  if (presentation.galleryImages.length === 0 && presentation.galleryVideos.length === 0) {
    return null
  }

  return (
    <section className="px-5 py-6 md:px-10 lg:px-16 lg:py-10">
      <div className="mx-auto max-w-7xl space-y-10">
        <div>
          <div className="mb-4 text-[11px] uppercase tracking-[0.32em] text-[#8e7f68]">Galeria de midia</div>
          <h2 className="font-serif text-4xl font-semibold leading-none text-[#1f1a15] md:text-6xl">
            Assets reais para uma landing mais aspiracional.
          </h2>
        </div>

        {presentation.galleryVideos.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {presentation.galleryVideos.map((asset) => (
              <EventVideoBlock key={asset.id} asset={asset} />
            ))}
          </div>
        ) : null}

        {presentation.galleryImages.length > 0 ? <EventImageGallery assets={presentation.galleryImages} /> : null}
      </div>
    </section>
  )
}
