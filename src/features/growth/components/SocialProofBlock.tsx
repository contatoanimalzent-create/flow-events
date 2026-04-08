import { PublicReveal } from '@/features/public'
import { usePublicLocale } from '@/features/public/lib/public-locale'

interface SocialProofItem {
  label: string
  value: string
  note: string
}

interface SocialProofBlockProps {
  eyebrow?: string
  title: string
  description: string
  items: SocialProofItem[]
}

export function SocialProofBlock({ eyebrow, title, description, items }: SocialProofBlockProps) {
  const { isPortuguese } = usePublicLocale()
  const resolvedEyebrow = eyebrow || (isPortuguese ? 'Numeros reais' : 'Real numbers')

  return (
    <PublicReveal className="px-5 py-10 md:px-10 lg:px-16">
      <section className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-[rgba(255,255,255,0.08)] bg-[#0e0c0a] p-8 shadow-[0_28px_80px_rgba(0,0,0,0.58)] md:p-12">
        <div className="pointer-events-none absolute right-[-4rem] top-[-4rem] h-56 w-56 rounded-full bg-[#4285F4]/05 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-4rem] left-[-3rem] h-48 w-48 rounded-full bg-[#4285F4]/04 blur-3xl" />

        <div className="relative max-w-3xl">
          <div className="text-[11px] uppercase tracking-[0.32em] text-[#4285F4]">{resolvedEyebrow}</div>
          <h2 className="mt-4 font-display text-[clamp(2.6rem,4vw,4.4rem)] font-semibold leading-[0.92] tracking-[-0.04em] text-[#f0ebe2]">
            {title}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[#9a9088]">{description}</p>
        </div>

        <div className="relative mt-10 grid gap-5 md:grid-cols-3">
          {items.map((item, index) => (
            <div
              key={`${item.label}-${index}`}
              className="rounded-[2rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#4285F4]/20"
            >
              <div className="text-[11px] uppercase tracking-[0.28em] text-[#6a6058]">{item.label}</div>
              <div className="mt-4 font-display text-[2.8rem] font-semibold leading-none tracking-[-0.05em] text-[#4285F4]">
                {item.value}
              </div>
              <p className="mt-4 text-sm leading-7 text-[#9a9088]">{item.note}</p>
            </div>
          ))}
        </div>
      </section>
    </PublicReveal>
  )
}
