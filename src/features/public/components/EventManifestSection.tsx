import type { PublicEventRecord } from '@/features/public/types/public.types'
import { PublicReveal } from './PublicReveal'

interface EventManifestSectionProps {
  event: PublicEventRecord
}

export function EventManifestSection({ event }: EventManifestSectionProps) {
  return (
    <section className="px-5 py-10 md:px-10 lg:px-16 lg:py-14">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <PublicReveal>
          <div className="max-w-xl">
            <div className="text-[11px] uppercase tracking-[0.34em] text-[#c49a50]">Manifesto</div>
            <h2 className="mt-5 font-display text-[clamp(2.8rem,4.5vw,4.5rem)] font-semibold leading-[0.9] tracking-[-0.04em] text-[#f0ebe2]">
              Uma experiencia pensada para ser sentida antes mesmo da chegada.
            </h2>
          </div>
        </PublicReveal>

        <PublicReveal delayMs={120}>
          <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-7 shadow-[0_18px_55px_rgba(0,0,0,0.3)] md:p-8">
            <p className="text-base leading-8 text-white/70 md:text-lg">
              {event.short_description ||
                `${event.name} foi desenhado para transformar presenca em atmosfera: uma narrativa visual forte, chegada marcada e um ritmo que valoriza cada detalhe da jornada.`}
            </p>
            <div className="mt-6 border-t border-white/10 pt-5 text-sm leading-7 text-white/56">
              De {event.venue_address?.city || 'uma cidade em curadoria'} para um publico que espera mais do que acesso. Espera contexto, presenca e memoria.
            </div>
          </div>
        </PublicReveal>
      </div>
    </section>
  )
}
