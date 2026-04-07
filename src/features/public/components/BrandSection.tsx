import { Compass, Gem, Orbit, Sparkles } from 'lucide-react'
import { usePublicLocale } from '../lib/public-locale'
import { PublicReveal } from './PublicReveal'

export function BrandSection() {
  const { isPortuguese } = usePublicLocale()

  const pillars = [
    {
      icon: Compass,
      title: isPortuguese ? 'Eventos com criterio' : 'Events with intent',
      description: isPortuguese
        ? 'Eventos de cultura, gastronomia, musica e lifestyle com curadoria. So entra o que merece a sua presenca.'
        : 'Curated events across culture, gastronomy, music and lifestyle. Only what deserves your presence.',
    },
    {
      icon: Orbit,
      title: isPortuguese ? 'Compra em segundos' : 'Purchase in seconds',
      description: isPortuguese
        ? 'Da descoberta ao QR code em poucos cliques. Sem burocracia. Sem atrito desnecessario.'
        : 'From discovery to QR code in a few clicks. No bureaucracy. No unnecessary friction.',
    },
    {
      icon: Gem,
      title: isPortuguese ? 'Controle para produtores' : 'Control for producers',
      description: isPortuguese
        ? 'Venda ingressos, gerencie credenciamento, acompanhe receita e entenda seu publico em um unico lugar.'
        : 'Sell tickets, manage check-in, track revenue and understand your audience in one place.',
    },
  ]

  return (
    <section className="px-5 py-14 md:px-10 lg:px-16 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <PublicReveal>
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.06] px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-white/50">
                <Sparkles className="h-4 w-4" />
                {isPortuguese ? 'Como funciona' : 'How it works'}
              </div>
              <h2 className="mt-6 text-[clamp(3rem,5vw,5rem)] font-bold leading-[0.9] tracking-[-0.04em] text-white">
                {isPortuguese
                  ? 'Para quem corre atras de grandes eventos. E para os times que constroem tudo isso.'
                  : 'For people who chase great events. And for the teams who build them.'}
              </h2>
              <p className="mt-6 max-w-lg text-base leading-8 text-white/50 md:text-lg">
                {isPortuguese
                  ? 'Pulse conecta compradores e produtores por uma plataforma facil de usar, forte na apresentacao e confiavel quando o acesso importa.'
                  : 'Pulse connects buyers and producers through a platform that is easy to use, strong to present and reliable when access matters.'}
              </p>
            </div>
          </PublicReveal>

          <div className="grid gap-4 md:grid-cols-3">
            {pillars.map((pillar, index) => {
              const Icon = pillar.icon

              return (
                <PublicReveal key={pillar.title} delayMs={index * 90}>
                  <article className="h-full rounded-2xl border border-white/8 bg-white/[0.05] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.5)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(0,0,0,0.6)]">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(0,87,231,0.12)] text-[#4285F4]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="mt-6 text-xl font-bold leading-[0.94] tracking-[-0.02em] text-white">
                      {pillar.title}
                    </div>
                    <p className="mt-4 text-sm leading-7 text-white/50">{pillar.description}</p>
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
