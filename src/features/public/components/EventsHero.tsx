import { ArrowRight, CalendarDays, MapPin, Sparkles } from 'lucide-react'
import { PublicReveal } from './PublicReveal'

interface EventsHeroProps {
  eventCount: number
  cityCount: number
  categories: string[]
  onCategorySelect?: (category: string) => void
}

export function EventsHero({ eventCount, cityCount, categories, onCategorySelect }: EventsHeroProps) {
  return (
    <section className="px-5 pb-8 pt-8 md:px-10 lg:px-16 lg:pb-10 lg:pt-10">
      <div className="relative mx-auto overflow-hidden rounded-[2.7rem] border border-white/8 bg-[linear-gradient(135deg,#0d1117_0%,#0a0d12_55%,#141923_100%)] shadow-[0_28px_90px_rgba(0,0,0,0.26)]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-6rem] top-[-7rem] h-[26rem] w-[26rem] rounded-full bg-[#ff2d2d]/18 blur-3xl" />
          <div className="absolute bottom-[-8rem] right-[-5rem] h-[24rem] w-[24rem] rounded-full bg-[#445066]/18 blur-3xl" />
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
              backgroundSize: '88px 88px',
            }}
          />
        </div>

        <div className="relative z-10 grid gap-10 px-8 py-12 md:px-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:px-16 lg:py-16">
          <div>
            <PublicReveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-white/62">
                <Sparkles className="h-3.5 w-3.5" />
                Premium event discovery
              </div>
            </PublicReveal>

            <PublicReveal delayMs={80}>
              <h1 className="mt-6 max-w-4xl font-display text-[clamp(3.8rem,8vw,7rem)] font-semibold uppercase leading-[0.84] tracking-[-0.04em] text-white">
                Premium access to the experiences shaping the season.
              </h1>
            </PublicReveal>

            <PublicReveal delayMs={140}>
              <p className="mt-6 max-w-2xl text-base leading-8 text-white/70 md:text-lg">
                Uma camada publica mais direta, mais comercial e muito mais forte para descobrir datas, venues, acessos e proximos eventos.
              </p>
            </PublicReveal>

            <PublicReveal delayMs={180}>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="/events"
                  className="inline-flex items-center gap-2 rounded-full bg-[#ff2d2d] px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.12em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#ff4133]"
                >
                  Ver agenda completa
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="/create-event"
                  className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-6 py-3.5 text-sm font-medium uppercase tracking-[0.12em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-[#ff2d2d]/36 hover:bg-white/[0.08]"
                >
                  Publicar um evento premium
                </a>
              </div>
            </PublicReveal>

            {categories.length > 0 ? (
              <PublicReveal delayMs={220}>
                <div className="mt-8 flex flex-wrap gap-3">
                  {categories.slice(0, 6).map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => onCategorySelect?.(category)}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/72 transition-all duration-300 hover:border-[#ff2d2d]/34 hover:text-white"
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </PublicReveal>
            ) : null}
          </div>

          <PublicReveal delayMs={240}>
            <div className="grid gap-4 self-end">
              {[
                { label: 'Eventos publicados', value: eventCount.toString(), icon: CalendarDays },
                { label: 'Cidades ativas', value: cityCount.toString(), icon: MapPin },
                { label: 'Categorias em curadoria', value: categories.length.toString(), icon: Sparkles },
              ].map((stat) => {
                const Icon = stat.icon

                return (
                  <div
                    key={stat.label}
                    className="rounded-[1.7rem] border border-white/10 bg-white/[0.05] p-5 shadow-[0_14px_34px_rgba(0,0,0,0.16)]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#ff2d2d]/16 text-[#ff6a5c]">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="text-[11px] uppercase tracking-[0.28em] text-white/48">{stat.label}</div>
                    </div>
                    <div className="mt-4 font-display text-[2.8rem] font-semibold leading-none tracking-[-0.04em] text-white">
                      {stat.value}
                    </div>
                  </div>
                )
              })}
            </div>
          </PublicReveal>
        </div>
      </div>
    </section>
  )
}
