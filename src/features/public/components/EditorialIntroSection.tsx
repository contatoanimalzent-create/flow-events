import { ArrowUpRight, Sparkles, Star, Waves } from 'lucide-react'
import { PublicReveal } from './PublicReveal'

const principles = [
  {
    icon: Sparkles,
    title: 'Curadoria antes de volume',
    text: 'A plataforma apresenta experiencias como objetos culturais com narrativa, ritmo visual e contexto, em vez de apenas empilhar datas.',
  },
  {
    icon: Waves,
    title: 'Operacao invisivelmente solida',
    text: 'Por tras da superficie editorial, checkout, check-in, CRM, monetizacao e growth continuam operando como sistema real.',
  },
  {
    icon: Star,
    title: 'Presenca de marca',
    text: 'Cada superficie foi desenhada para parecer uma marca premium global de experiencias, nao uma ferramenta generica.',
  },
]

export function EditorialIntroSection() {
  return (
    <section className="section-dark relative overflow-hidden px-5 py-20 md:px-10 lg:px-16 lg:py-28">
      {/* Atmospheric depth */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-6rem] top-[-6rem] h-[30rem] w-[30rem] rounded-full bg-[#7d6d52]/10 blur-[80px]" />
        <div className="absolute bottom-[-8rem] right-[-4rem] h-[28rem] w-[28rem] rounded-full bg-[#6a86ad]/8 blur-[80px]" />
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
            maskImage: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.7) 25%, rgba(0,0,0,0.7) 75%, transparent 100%)',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
          <PublicReveal>
            <div className="max-w-xl">
              <div className="text-[11px] uppercase tracking-[0.34em] text-white/42">Uma camada publica com assinatura</div>
              <h2 className="mt-5 font-display text-[clamp(3rem,5vw,4.8rem)] font-semibold leading-[0.9] tracking-[-0.04em] text-white">
                O produto deixa de parecer sistema e passa a soar como ecossistema.
              </h2>
              <p className="mt-6 max-w-lg text-base leading-8 text-white/64 md:text-lg">
                Animalz Events foi desenhado para posicionar experiencias premium, cultura e lifestyle com a mesma forca com que sustenta checkout, CRM, operacao e crescimento.
              </p>
              <div className="mt-8 flex items-center gap-3 text-sm font-medium text-white/78">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/14 bg-white/8 shadow-[0_12px_30px_rgba(0,0,0,0.3)]">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
                Experiencias premium merecem uma linguagem propria, nao um template de software.
              </div>
            </div>
          </PublicReveal>

          <div className="grid gap-4 md:grid-cols-3 lg:pt-10">
            {principles.map((principle, index) => {
              const Icon = principle.icon

              return (
                <PublicReveal key={principle.title} delayMs={index * 90}>
                  <div className="card-dark-hover group h-full p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/12 bg-white/8 text-white/80 transition-transform duration-500 group-hover:scale-105 group-hover:bg-white/12">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="mt-6 font-display text-[2rem] font-semibold leading-[0.94] tracking-[-0.03em] text-white">
                      {principle.title}
                    </div>
                    <p className="mt-4 text-sm leading-7 text-white/58">{principle.text}</p>
                  </div>
                </PublicReveal>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
