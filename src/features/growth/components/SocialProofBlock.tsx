import { PublicReveal } from '@/features/public'

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

export function SocialProofBlock({ eyebrow = 'Sinais em movimento', title, description, items }: SocialProofBlockProps) {
  return (
    <PublicReveal className="px-5 py-10 md:px-10 lg:px-16">
      <section className="mx-auto max-w-7xl rounded-[2.5rem] border border-[#e7dbc9] bg-white/78 p-8 shadow-[0_20px_60px_rgba(70,52,24,0.06)] md:p-12">
        <div className="max-w-3xl">
          <div className="text-[11px] uppercase tracking-[0.32em] text-[#8b7c69]">{eyebrow}</div>
          <h2 className="mt-4 font-display text-[clamp(2.6rem,4vw,4.4rem)] font-semibold leading-[0.92] tracking-[-0.04em] text-[#1f1a15]">
            {title}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[#5f5549]">{description}</p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {items.map((item, index) => (
            <div
              key={`${item.label}-${index}`}
              className="rounded-[2rem] border border-[#ece0ce] bg-[#fcfaf6] p-6 transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="text-[11px] uppercase tracking-[0.28em] text-[#8b7c69]">{item.label}</div>
              <div className="mt-4 font-display text-[2.8rem] font-semibold leading-none tracking-[-0.05em] text-[#1f1a15]">
                {item.value}
              </div>
              <p className="mt-4 text-sm leading-7 text-[#6b5d4d]">{item.note}</p>
            </div>
          ))}
        </div>
      </section>
    </PublicReveal>
  )
}
