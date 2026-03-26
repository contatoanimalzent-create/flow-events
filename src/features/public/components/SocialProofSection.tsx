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
  eyebrow = 'Social proof',
  title,
  description,
  metrics,
}: SocialProofSectionProps) {
  return (
    <section className="px-5 py-12 md:px-10 lg:px-16 lg:py-16">
      <div className="mx-auto max-w-7xl rounded-[2.6rem] border border-[#e5d9c7] bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(248,241,232,0.92))] p-8 shadow-[0_18px_55px_rgba(48,35,18,0.06)] md:p-12">
        <PublicReveal>
          <div className="max-w-3xl">
            <div className="text-[11px] uppercase tracking-[0.3em] text-[#8b7c69]">{eyebrow}</div>
            <h2 className="mt-4 font-display text-[clamp(2.8rem,4.5vw,4.7rem)] font-semibold leading-[0.9] tracking-[-0.05em] text-[#1f1a15]">
              {title}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#5f5549] md:text-lg">{description}</p>
          </div>
        </PublicReveal>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {metrics.map((metric, index) => (
            <PublicReveal key={metric.label} delayMs={index * 90}>
              <div className="rounded-[1.8rem] border border-[#e9dfd0] bg-[#fcfaf6] p-6">
                <div className="text-[11px] uppercase tracking-[0.26em] text-[#8b7c69]">{metric.label}</div>
                <div className="mt-4 font-display text-[2.8rem] font-semibold leading-none tracking-[-0.05em] text-[#1f1a15]">
                  {metric.value}
                </div>
                <p className="mt-4 text-sm leading-7 text-[#665948]">{metric.note}</p>
              </div>
            </PublicReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
