import { ArrowUpRight, Sparkles, Star, Waves } from 'lucide-react'
import { PremiumSection } from './PremiumSection'
import { PublicReveal } from './PublicReveal'

const principles = [
  {
    icon: Sparkles,
    title: 'Curadoria antes de catalogo',
    text: 'A plataforma apresenta experiencias como objetos de desejo, com narrativa, ritmo visual e contexto.',
  },
  {
    icon: Waves,
    title: 'Operacao invisivelmente solida',
    text: 'Por tras da camada editorial, checkout, check-in, CRM e campanhas continuam trabalhando como sistema real.',
  },
  {
    icon: Star,
    title: 'Presenca de marca',
    text: 'Cada superficie foi desenhada para parecer uma marca premium global, nao uma ferramenta improvisada.',
  },
]

export function EditorialIntroSection() {
  return (
    <PremiumSection className="pt-10 lg:pt-14">
      <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
        <PublicReveal>
          <div className="max-w-xl">
            <div className="text-[11px] uppercase tracking-[0.34em] text-[#8e7f68]">Uma camada publica com assinatura</div>
            <h2 className="mt-5 font-display text-[clamp(3rem,5vw,4.8rem)] font-semibold leading-[0.9] tracking-[-0.04em] text-[#1f1a15]">
              O produto deixa de explicar e passa a seduzir.
            </h2>
            <p className="mt-6 max-w-lg text-base leading-8 text-[#5f5549] md:text-lg">
              Animalz Events foi desenhado para posicionar experiencias, nao apenas listar datas. A homepage funciona como convite, manifesto e prova de sofisticacao operacional ao mesmo tempo.
            </p>
            <div className="mt-8 flex items-center gap-3 text-sm font-medium text-[#1f1a15]">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#d9cfbf] bg-white/70 shadow-[0_12px_30px_rgba(48,35,18,0.08)]">
                <ArrowUpRight className="h-4 w-4" />
              </span>
              Experiencias premium merecem uma superficie com presenca propria.
            </div>
          </div>
        </PublicReveal>

        <div className="grid gap-4 md:grid-cols-3 lg:pt-10">
          {principles.map((principle, index) => {
            const Icon = principle.icon

            return (
              <PublicReveal key={principle.title} delayMs={index * 90}>
                <div className="group h-full rounded-[2rem] border border-white/70 bg-white/78 p-6 shadow-[0_18px_55px_rgba(48,35,18,0.06)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_28px_70px_rgba(48,35,18,0.1)]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f3e8d6] text-[#816941] transition-transform duration-500 group-hover:scale-105">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="mt-6 font-display text-[2rem] font-semibold leading-[0.94] tracking-[-0.03em] text-[#1f1a15]">
                    {principle.title}
                  </div>
                  <p className="mt-4 text-sm leading-7 text-[#5f5549]">{principle.text}</p>
                </div>
              </PublicReveal>
            )
          })}
        </div>
      </div>
    </PremiumSection>
  )
}
