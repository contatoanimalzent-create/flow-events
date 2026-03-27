import { Compass, Gem, Orbit, Sparkles } from 'lucide-react'
import { PublicReveal } from './PublicReveal'

const pillars = [
  {
    icon: Compass,
    title: 'Events with intent',
    description: 'Curated events across culture, gastronomy, music and lifestyle. Only what deserves your presence.',
  },
  {
    icon: Orbit,
    title: 'Purchase in seconds',
    description: 'From discovery to QR code in a few clicks. No bureaucracy. No unnecessary friction.',
  },
  {
    icon: Gem,
    title: 'Control for producers',
    description: 'Sell tickets, manage check-in, track revenue and understand your audience in one place.',
  },
]

export function BrandSection() {
  return (
    <section className="px-5 py-14 md:px-10 lg:px-16 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <PublicReveal>
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.06)] px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-[#6a6058]">
                <Sparkles className="h-4 w-4" />
                How it works
              </div>
              <h2 className="mt-6 font-display text-[clamp(3rem,5vw,5rem)] font-semibold leading-[0.9] tracking-[-0.05em] text-[#f0ebe2]">
                For people who chase great events. And for the teams who build them.
              </h2>
              <p className="mt-6 max-w-lg text-base leading-8 text-[#9a9088] md:text-lg">
                Animalz Events connects buyers and producers through a platform that is easy to use, strong to present and reliable when access matters.
              </p>
            </div>
          </PublicReveal>

          <div className="grid gap-4 md:grid-cols-3">
            {pillars.map((pillar, index) => {
              const Icon = pillar.icon

              return (
                <PublicReveal key={pillar.title} delayMs={index * 90}>
                  <article className="h-full rounded-[2rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.5)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(0,0,0,0.6)]">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#c49a50]/15 text-[#c49a50]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="mt-6 font-display text-[2rem] font-semibold leading-[0.94] tracking-[-0.03em] text-[#f0ebe2]">
                      {pillar.title}
                    </div>
                    <p className="mt-4 text-sm leading-7 text-[#9a9088]">{pillar.description}</p>
                  </article>
                </PublicReveal>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
