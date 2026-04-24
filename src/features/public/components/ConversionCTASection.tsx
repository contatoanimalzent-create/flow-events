import { ArrowRight, Sparkles } from 'lucide-react'
import { PublicReveal } from './PublicReveal'

interface ConversionCTASectionProps {
  onLogin?: () => void
}

export function ConversionCTASection({ onLogin }: ConversionCTASectionProps) {
  return (
    <section className="section-ink relative overflow-hidden px-5 pb-24 pt-16 md:px-10 lg:px-16 lg:pb-32 lg:pt-24">
      {/* Deep atmospheric glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[24rem] w-[56rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0057E7]/12 blur-[100px]" />
        <div className="absolute bottom-[-6rem] left-[-4rem] h-[24rem] w-[24rem] rounded-full bg-[#4285F4]/8 blur-[80px]" />
        <div className="absolute bottom-[-4rem] right-[-6rem] h-[20rem] w-[20rem] rounded-full bg-[#8b7aa3]/8 blur-[80px]" />
        <div
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
            backgroundSize: '100px 100px',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <PublicReveal>
          <div className="relative overflow-hidden rounded-[2.4rem] border border-white/10 bg-white/5 px-8 py-12 shadow-float-dark md:px-12 md:py-14 lg:px-16 lg:py-18">
            {/* Inner glow */}
            <div className="absolute right-[-3rem] top-[-3rem] h-40 w-40 rounded-full bg-[#f4ede0]/6 blur-3xl" />
            <div className="absolute bottom-[-3rem] left-[-2rem] h-40 w-40 rounded-full bg-white/4 blur-3xl" />

            <div className="relative z-10 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-white/56">
                  <Sparkles className="h-3.5 w-3.5" />
                  Para criadores de experiências
                </div>
                <h2 className="mt-6 font-display text-[clamp(2.8rem,5vw,5.2rem)] font-semibold leading-[0.88] tracking-[-0.05em] text-white">
                  Seu evento, do primeiro ingresso ao último check-in.
                </h2>
                <p className="mt-6 max-w-2xl text-base leading-8 text-white/72 md:text-lg">
                  Crie sua página, defina ingressos, venda online e opere com QR code. Tudo na mesma plataforma, pronto em minutos.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 lg:flex-col lg:items-stretch">
                <a
                  href="/events"
                  className="inline-flex items-center justify-center gap-3 rounded-full bg-[#f4ede0] px-7 py-3.5 text-sm font-semibold text-[#14110c] transition-all duration-500 hover:-translate-y-1 hover:bg-white hover:shadow-[0_20px_50px_rgba(244,237,224,0.18)]"
                >
                  Explorar experiências
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="/create-event"
                  className="inline-flex items-center justify-center gap-3 rounded-full border border-white/20 bg-white/8 px-7 py-3.5 text-sm font-medium text-white transition-all duration-500 hover:-translate-y-1 hover:bg-white/14 hover:border-white/30"
                >
                  Criar evento
                </a>
                {!onLogin ? (
                  <a
                    href="/contact"
                    className="inline-flex items-center justify-center gap-3 rounded-full border border-white/14 bg-transparent px-7 py-3.5 text-sm font-medium text-white/72 transition-all duration-500 hover:-translate-y-1 hover:text-white hover:border-white/24"
                  >
                    Falar com a equipe
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </PublicReveal>
      </div>
    </section>
  )
}
