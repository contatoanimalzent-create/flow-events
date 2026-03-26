import { Compass, Gem, Orbit, Sparkles } from 'lucide-react'
import { PublicReveal } from './PublicReveal'

const pillars = [
  {
    icon: Compass,
    title: 'Eventos com criterio',
    description: 'Curadoria de eventos de cultura, gastronomia, musica e lifestyle. So o que vale a sua presenca.',
  },
  {
    icon: Orbit,
    title: 'Compra em segundos',
    description: 'Da descoberta ao QR code em poucos cliques. Sem burocracia, sem complicacao.',
  },
  {
    icon: Gem,
    title: 'Controle para produtores',
    description: 'Venda ingressos, gerencie check-in, acompanhe receita e entenda seu publico em um unico lugar.',
  },
]

export function BrandSection() {
  return (
    <section className="px-5 py-14 md:px-10 lg:px-16 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <PublicReveal>
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#ddd0bc] bg-white/82 px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-[#8b7c69]">
                <Sparkles className="h-4 w-4" />
                Como funciona
              </div>
              <h2 className="mt-6 font-display text-[clamp(3rem,5vw,5rem)] font-semibold leading-[0.9] tracking-[-0.05em] text-[#1f1a15]">
                Para quem curte bons eventos. E para quem os cria.
              </h2>
              <p className="mt-6 max-w-lg text-base leading-8 text-[#5f5549] md:text-lg">
                Animalz Events conecta compradores e produtores numa plataforma simples de usar, bonita de ver e confiavel na hora do acesso.
              </p>
            </div>
          </PublicReveal>

          <div className="grid gap-4 md:grid-cols-3">
            {pillars.map((pillar, index) => {
              const Icon = pillar.icon

              return (
                <PublicReveal key={pillar.title} delayMs={index * 90}>
                  <article className="h-full rounded-[2rem] border border-[#e8dccb] bg-white/85 p-6 shadow-[0_18px_55px_rgba(48,35,18,0.06)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(48,35,18,0.1)]">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f3e8d6] text-[#816941]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="mt-6 font-display text-[2rem] font-semibold leading-[0.94] tracking-[-0.03em] text-[#1f1a15]">
                      {pillar.title}
                    </div>
                    <p className="mt-4 text-sm leading-7 text-[#5f5549]">{pillar.description}</p>
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
