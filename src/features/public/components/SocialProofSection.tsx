import { PublicReveal } from './PublicReveal'

interface SocialProofSectionProps {
  eyebrow?: string
  title: string
  description: string
  metrics: Array<{
    label: string
    value: string
    note: string
  }>
}

export function SocialProofSection({
  eyebrow = 'Numeros reais',
  title,
  description,
  metrics,
}: SocialProofSectionProps) {
  return (
    <section className="px-5 py-12 md:px-10 lg:px-16 lg:py-16">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.6rem] border border-[rgba(255,255,255,0.08)] bg-[#0e0c0a] p-8 shadow-[0_18px_55px_rgba(0,0,0,0.5)] md:p-12">
        <div className="pointer-events-none absolute right-[-4rem] top-[-4rem] h-56 w-56 rounded-full bg-[#ae936f]/06 blur-3xl" />
        <PublicReveal>
          <div className="max-w-3xl">
            <div className="text-[11px] uppercase tracking-[0.3em] text-[#ae936f]">{eyebrow}</div>
            <h2 className="mt-4 font-display text-[clamp(2.8rem,4.5vw,4.7rem)] font-semibold leading-[0.9] tracking-[-0.05em] text-[#f0ebe2]">
              {title}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#9a9088] md:text-lg">{description}</p>
          </div>
        </PublicReveal>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {metrics.map((metric, index) => (
            <PublicReveal key={metric.label} delayMs={index * 90}>
              <div className="rounded-[1.8rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#ae936f]/20">
                <div className="text-[11px] uppercase tracking-[0.26em] text-[#6a6058]">{metric.label}</div>
                <div className="mt-4 font-display text-[2.8rem] font-semibold leading-none tracking-[-0.05em] text-[#ae936f]">
                  {metric.value}
                </div>
                <p className="mt-4 text-sm leading-7 text-[#9a9088]">{metric.note}</p>
              </div>
            </PublicReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
