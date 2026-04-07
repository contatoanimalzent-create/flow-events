import { Clock3 } from 'lucide-react'
import { motion } from 'framer-motion'
import { usePublicLocale } from '@/features/public/lib/public-locale'
import { useAnimationPreset } from '@/shared/motion'

export interface AgendaSectionItem {
  id: string
  time: string
  title: string
  description: string
  category: string
}

interface AgendaSectionProps {
  items: AgendaSectionItem[]
}

export function AgendaSection({ items }: AgendaSectionProps) {
  const { isPortuguese } = usePublicLocale()
  const sectionAnimation = useAnimationPreset('fadeIn', { durationMs: 420 })
  const cardAnimation = useAnimationPreset('slideUp', { durationMs: 460, distance: 18 })

  return (
    <motion.section
      id="agenda"
      className="bg-[var(--pulse-color-surface)] py-20 md:py-28"
      initial={sectionAnimation.initial}
      whileInView={sectionAnimation.whileInView}
      viewport={sectionAnimation.viewport}
      variants={sectionAnimation.variants}
    >
      <div className="mx-auto max-w-[1280px] px-6 md:px-8 lg:px-10">
        <div className="max-w-3xl">
          <div className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--pulse-color-primary)]">
            {isPortuguese ? 'Programacao' : 'Agenda'}
          </div>
          <h2 className="mt-4 text-[clamp(2rem,4vw,3.2rem)] font-semibold leading-[1.04] tracking-[-0.05em] text-[var(--pulse-color-primary)]">
            {isPortuguese ? 'Uma agenda clara para guiar a jornada do publico.' : 'A clear agenda that guides the attendee journey.'}
          </h2>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {items.map((item, index) => (
            <motion.article
              key={item.id}
              className="flex h-full flex-col rounded-[calc(var(--pulse-radius-lg)+0.25rem)] border border-[var(--pulse-color-border)] bg-[var(--pulse-color-background)] p-6 shadow-[var(--pulse-shadow-soft)]"
              initial={cardAnimation.initial}
              whileInView={cardAnimation.whileInView}
              viewport={cardAnimation.viewport}
              variants={cardAnimation.variants}
              transition={{ delay: index * 0.04 }}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--pulse-color-primary)_9%,white)] px-3 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[var(--pulse-color-primary)]">
                  <Clock3 className="h-3.5 w-3.5" />
                  {item.time}
                </span>
                <span className="text-[0.72rem] font-medium uppercase tracking-[0.16em] text-[var(--pulse-color-text-secondary)]">
                  {item.category}
                </span>
              </div>

              <h3 className="mt-5 text-xl font-semibold leading-tight text-[var(--pulse-color-text-primary)]">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--pulse-color-text-secondary)]">{item.description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
