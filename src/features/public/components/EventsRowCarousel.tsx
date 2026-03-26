import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef } from 'react'
import type { PublicEventSummary } from '@/features/public/types/public.types'
import { PremiumEventCard } from './PremiumEventCard'
import { PublicReveal } from './PublicReveal'

interface EventsRowCarouselProps {
  title: string
  description?: string
  events: PublicEventSummary[]
}

export function EventsRowCarousel({ title, description, events }: EventsRowCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null)

  if (events.length === 0) {
    return null
  }

  const scrollByAmount = (direction: 'left' | 'right') => {
    scrollerRef.current?.scrollBy({
      left: direction === 'left' ? -420 : 420,
      behavior: 'smooth',
    })
  }

  return (
    <section className="px-5 py-8 md:px-10 lg:px-16 lg:py-10">
      <div className="mx-auto max-w-[92rem]">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <PublicReveal>
            <div className="max-w-2xl">
              <div className="font-display text-[2.35rem] font-semibold leading-[0.92] tracking-[-0.04em] text-[#1f1a15]">
                {title}
              </div>
              {description ? <p className="mt-2 text-sm leading-7 text-[#5f5549]">{description}</p> : null}
            </div>
          </PublicReveal>

          <PublicReveal delayMs={80} className="hidden gap-2 md:flex">
            <button
              type="button"
              onClick={() => scrollByAmount('left')}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#ddd1bf] bg-white/78 text-[#5f5549] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollByAmount('right')}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#ddd1bf] bg-white/78 text-[#5f5549] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </PublicReveal>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-12 bg-gradient-to-r from-[#f6f1e8] to-transparent md:block" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-12 bg-gradient-to-l from-[#f6f1e8] to-transparent md:block" />
          <div
            ref={scrollerRef}
            className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {events.map((event, index) => (
              <div key={event.id} className="w-[21rem] shrink-0 snap-start md:w-[24rem] xl:w-[25rem]">
                <PremiumEventCard event={event} priority={index < 2} index={index} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
