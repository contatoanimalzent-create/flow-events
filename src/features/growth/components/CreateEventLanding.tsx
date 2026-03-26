import { ArrowRight, Check, Sparkles, Zap } from 'lucide-react'
import { PublicLayout, PublicReveal } from '@/features/public'
import type { PublicEventSummary } from '@/features/public/types/public.types'
import { ExitLeadCaptureDialog } from '@/features/growth/components/ExitLeadCaptureDialog'
import { SocialProofBlock } from '@/features/growth/components/SocialProofBlock'
import { useSeoMeta } from '@/shared/lib'

interface CreateEventLandingProps {
  onLogin?: () => void
  events: PublicEventSummary[]
}

export function CreateEventLanding({ onLogin, events }: CreateEventLandingProps) {
  const ticketsSold = events.reduce((sum, event) => sum + event.sold_tickets, 0)
  const totalCapacity = events.reduce((sum, event) => sum + (event.total_capacity ?? 0), 0)

  useSeoMeta({
    title: 'Criar evento | Animalz Events',
    description: 'Publique seu evento, venda ingressos e gerencie tudo em um lugar so. Checkout, check-in, financeiro e dados do seu publico.',
    image: events[0]?.mediaPresentation.coverAsset?.secure_url ?? events[0]?.cover_url ?? null,
    url: typeof window !== 'undefined' ? window.location.href : '/create-event',
  })

  return (
    <PublicLayout onLogin={onLogin}>
      <section className="px-5 pb-16 pt-12 md:px-10 lg:px-16 lg:pt-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <PublicReveal>
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.06)] px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-[#6a6058]">
                <Sparkles className="h-4 w-4" />
                Para produtores
              </div>
              <h1 className="mt-6 font-display text-[clamp(4rem,7vw,7rem)] font-semibold leading-[0.86] tracking-[-0.05em] text-[#f0ebe2]">
                Crie seu evento, venda ingressos e gerencie tudo em um lugar.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[#9a9088] md:text-lg">
                Da pagina do evento ao check-in no dia, passando pela venda de ingressos e pelo controle financeiro. Tudo na mesma plataforma, simples de configurar e facil de acompanhar.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-full bg-[#c49a50] px-6 py-3 text-sm font-semibold text-[#0a0908] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(196,154,80,0.35)]"
                >
                  Entrar e criar evento
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.12)] px-6 py-3 text-sm font-medium text-[#f0ebe2] transition-all hover:-translate-y-0.5 hover:border-[rgba(255,255,255,0.22)]"
                >
                  Falar com o time
                </a>
              </div>
            </div>
          </PublicReveal>

          <PublicReveal>
            <div className="rounded-[2.6rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-7 shadow-[0_22px_65px_rgba(0,0,0,0.5)] md:p-9">
              <div className="text-[11px] uppercase tracking-[0.28em] text-[#6a6058]">O que voce ganha</div>
              <div className="mt-4 font-display text-[3rem] font-semibold leading-[0.92] tracking-[-0.05em] text-[#f0ebe2]">
                Venda mais, trabalhe menos e entenda seu publico.
              </div>
              <div className="mt-8 space-y-4">
                {[
                  'Pagina do evento com visual profissional, ingressos configurados e compra em segundos.',
                  'Controle de vendas, receita e check-in em tempo real, sem planilhas nem ferramentas separadas.',
                  'Dados do seu publico para planejar melhor o proximo evento e fidelizar quem ja veio.',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-[1.5rem] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-4">
                    <Check className="mt-1 h-4 w-4 text-[#4a9b7f]" />
                    <div className="text-sm leading-7 text-[#9a9088]">{item}</div>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.6rem] border border-[#c49a50]/25 bg-[#c49a50]/10 p-5">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-[#c49a50]/70">Tickets vendidos</div>
                  <div className="mt-3 font-display text-[2.5rem] font-semibold leading-none tracking-[-0.05em] text-[#c49a50]">
                    {ticketsSold.toLocaleString('pt-BR')}
                  </div>
                </div>
                <div className="rounded-[1.6rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] p-5">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-[#6a6058]">Capacidade mapeada</div>
                  <div className="mt-3 font-display text-[2.5rem] font-semibold leading-none tracking-[-0.05em] text-[#f0ebe2]">
                    {totalCapacity.toLocaleString('pt-BR')}
                  </div>
                </div>
              </div>
            </div>
          </PublicReveal>
        </div>
      </section>

      <SocialProofBlock
        title="Produtores que ja escolheram a plataforma estao vendendo."
        description="Eventos publicados, ingressos vendidos, publico fidelizado. Resultados reais de quem ja usa."
        items={[
          {
            label: 'Eventos publicados',
            value: events.length.toLocaleString('pt-BR'),
            note: 'Eventos ativos com pagina, ingressos e compra habilitados na plataforma.',
          },
          {
            label: 'Ingressos vendidos',
            value: ticketsSold.toLocaleString('pt-BR'),
            note: 'Compradores que garantiram seu lugar atraves da plataforma.',
          },
          {
            label: 'Eventos com venda',
            value: Math.max(events.filter((event) => event.minPrice !== null).length, 1).toLocaleString('pt-BR'),
            note: 'Eventos com ingressos pagos configurados e vendendo ativamente.',
          },
        ]}
      />

      <section className="px-5 pb-20 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl rounded-[2.8rem] bg-[#1f1a15] px-8 py-10 text-white md:px-12 md:py-14">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="text-[11px] uppercase tracking-[0.3em] text-white/54">Pronto para comecar?</div>
              <div className="mt-4 font-display text-[clamp(2.8rem,4.5vw,4.6rem)] font-semibold leading-[0.9] tracking-[-0.05em] text-white">
                Publique seu proximo evento em minutos.
              </div>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/72">
                Crie sua conta, configure os ingressos, publique a pagina e comece a vender. Sem burocracia, sem integracao complicada.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="/login"
                className="inline-flex items-center gap-2 rounded-full bg-[#f2e6d6] px-6 py-3 text-sm font-medium text-[#1f1a15] transition-all hover:-translate-y-0.5"
              >
                Criar meu evento
                <Zap className="h-4 w-4" />
              </a>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-white/18 px-6 py-3 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-white/8"
              >
                Conversar com especialista
              </a>
            </div>
          </div>
        </div>
      </section>
      <ExitLeadCaptureDialog source="create_event_exit" />
    </PublicLayout>
  )
}
