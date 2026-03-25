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
    <section className="px-6 py-20 md:px-16">
      <div className="mx-auto max-w-6xl space-y-10">
        <div>
          <div className="mb-4 text-[10px] font-mono uppercase tracking-[0.3em] text-[#d4ff00]">Media gallery</div>
          <h2
            style={{
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: 'clamp(36px, 5vw, 72px)',
              letterSpacing: '-0.02em',
              lineHeight: 1,
            }}
          >
            EXPERIÊNCIA VISUAL<span style={{ color: '#d4ff00' }}>.</span>
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
