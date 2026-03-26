import { ArrowRight } from 'lucide-react'
import { PremiumSection } from './PremiumSection'
import { PublicReveal } from './PublicReveal'

interface ConversionCTASectionProps {
  onLogin?: () => void
}

export function ConversionCTASection({ onLogin }: ConversionCTASectionProps) {
  return (
    <PremiumSection className="pb-24 pt-8 lg:pb-28">
      <PublicReveal>
        <div className="relative overflow-hidden rounded-[2.4rem] border border-[#eadfce] bg-[linear-gradient(135deg,#f8f3ea_0%,#efe4d2_48%,#f6efe4_100%)] px-7 py-10 shadow-[0_26px_90px_rgba(48,35,18,0.08)] md:px-10 md:py-12 lg:px-14 lg:py-16">
          <div className="absolute right-[-5rem] top-[-4rem] h-52 w-52 rounded-full bg-[#e6cfaa]/34 blur-3xl" />
          <div className="absolute bottom-[-4rem] left-[-4rem] h-56 w-56 rounded-full bg-white/60 blur-3xl" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              <div className="text-[11px] uppercase tracking-[0.34em] text-[#8e7f68]">Pronto para a proxima camada</div>
              <h2 className="mt-5 font-display text-[clamp(2.8rem,5vw,4.8rem)] font-semibold leading-[0.9] tracking-[-0.04em] text-[#1f1a15]">
                Descubra, publique e sustente experiencias com linguagem de marca global.
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[#5f5549] md:text-lg">
                A mesma camada que posiciona experiencias com sofisticacao tambem sustenta vendas, CRM, campanhas, check-in, monetizacao e growth com profundidade real.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="/events"
                className="inline-flex items-center gap-3 rounded-full bg-[#1f1a15] px-6 py-3 text-sm font-semibold text-[#f8f3ea] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(31,26,21,0.22)]"
              >
                Explorar experiencias
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="/create-event"
                className="inline-flex items-center gap-3 rounded-full border border-[#cdbfa9] bg-white/75 px-6 py-3 text-sm font-medium text-[#1f1a15] transition-all duration-500 hover:-translate-y-1 hover:bg-white"
              >
                Criar evento
              </a>
              {!onLogin ? (
                <a
                  href="/contact"
                  className="inline-flex items-center gap-3 rounded-full border border-[#cdbfa9] bg-white/75 px-6 py-3 text-sm font-medium text-[#1f1a15] transition-all duration-500 hover:-translate-y-1 hover:bg-white"
                >
                  Falar com a equipe
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </PublicReveal>
    </PremiumSection>
  )
}
