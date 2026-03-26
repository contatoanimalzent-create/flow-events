import { ArrowRight } from 'lucide-react'
import type { PublicEventRecord } from '@/features/public/types/public.types'
import { PublicReveal } from './PublicReveal'

interface EventFinalCTAProps {
  event: PublicEventRecord
  isFreeMode: boolean
}

export function EventFinalCTA({ event, isFreeMode }: EventFinalCTAProps) {
  return (
    <section className="px-5 pb-20 pt-6 md:px-10 lg:px-16 lg:pb-24">
      <div className="mx-auto max-w-7xl">
        <PublicReveal>
          <div className="relative overflow-hidden rounded-[2.4rem] border border-white/10 bg-[linear-gradient(135deg,#1f1a15_0%,#2d241d_100%)] px-8 py-10 text-white shadow-[0_26px_90px_rgba(20,12,3,0.18)] md:px-12 md:py-14">
            <div className="absolute right-[-4rem] top-[-4rem] h-44 w-44 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-[-5rem] left-[-3rem] h-52 w-52 rounded-full bg-[#d4b98e]/12 blur-3xl" />
            <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="max-w-3xl">
                <div className="text-[11px] uppercase tracking-[0.34em] text-white/52">Ultimo convite</div>
                <h2 className="mt-5 font-display text-[clamp(2.8rem,4.5vw,4.8rem)] font-semibold leading-[0.9] tracking-[-0.04em] text-white">
                  Faça parte de {event.name} e entre na experiencia pela camada certa.
                </h2>
                <p className="mt-6 text-base leading-8 text-white/72 md:text-lg">
                  Presenca, narrativa e operacao real trabalhando juntas para transformar a decisao de compra em desejo imediato.
                </p>
              </div>

              <a
                href="#tickets"
                className="inline-flex items-center gap-3 rounded-full bg-[#f8f3ea] px-6 py-3 text-sm font-semibold text-[#1f1a15] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_44px_rgba(21,14,8,0.24)]"
              >
                {isFreeMode ? 'Garantir inscricao' : 'Selecionar ingresso'}
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </PublicReveal>
      </div>
    </section>
  )
}
