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
      <section className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-[#dfd3bf] p-8 md:p-12"
        style={{
          background: 'linear-gradient(150deg, rgba(255,255,255,0.96) 0%, rgba(248,242,232,0.94) 50%, rgba(244,236,222,0.92) 100%)',
          boxShadow: '0 28px 80px rgba(63,46,26,0.10), inset 0 1px 0 rgba(255,255,255,0.9)',
        }}
      >
        {/* Subtle depth accents */}
        <div className="pointer-events-none absolute right-[-4rem] top-[-4rem] h-48 w-48 rounded-full bg-[#f0dfbf]/40 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[-4rem] left-[-3rem] h-44 w-44 rounded-full bg-[#e8d9c0]/36 blur-3xl" />

        <div className="relative max-w-3xl">
          <div className="text-[11px] uppercase tracking-[0.32em] text-[#8b7c69]">{eyebrow}</div>
          <h2 className="mt-4 font-display text-[clamp(2.6rem,4vw,4.4rem)] font-semibold leading-[0.92] tracking-[-0.04em] text-[#1f1a15]">
            {title}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[#5f5549]">{description}</p>
        </div>

        <div className="relative mt-10 grid gap-5 md:grid-cols-3">
          {items.map((item, index) => (
            <div
              key={`${item.label}-${index}`}
              className="rounded-[2rem] border border-[#e5d9c7] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(63,46,26,0.10)]"
              style={{
                background: 'linear-gradient(160deg, rgba(255,255,255,0.92) 0%, rgba(249,242,232,0.86) 100%)',
                boxShadow: '0 12px 36px rgba(63,46,26,0.07), inset 0 1px 0 rgba(255,255,255,0.8)',
              }}
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
