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
    description: 'Traga sua operacao para uma camada premium com checkout, growth loops, CRM e inteligencia em um unico fluxo.',
    image: events[0]?.mediaPresentation.coverAsset?.secure_url ?? events[0]?.cover_url ?? null,
    url: typeof window !== 'undefined' ? window.location.href : '/create-event',
  })

  return (
    <PublicLayout onLogin={onLogin}>
      <section className="px-5 pb-16 pt-12 md:px-10 lg:px-16 lg:pt-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <PublicReveal>
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#ddd0bc] bg-white/82 px-4 py-2 text-[11px] uppercase tracking-[0.28em] text-[#8b7c69]">
                <Sparkles className="h-4 w-4" />
                Producer positioning
              </div>
              <h1 className="mt-6 font-display text-[clamp(4rem,7vw,7rem)] font-semibold leading-[0.86] tracking-[-0.05em] text-[#1f1a15]">
                Traga sua marca para uma camada onde experiencia, desejo e receita se reforcam.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[#5f5549] md:text-lg">
                A Animalz Events reposiciona a sua operacao como ecossistema premium de experiencias. A marca ganha presenca publica, o publico percebe valor antes da compra e a operacao mantem controle de ponta a ponta.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-full bg-[#1f1a15] px-6 py-3 text-sm font-medium text-[#f8f3ea] transition-all hover:-translate-y-0.5"
                >
                  Entrar e criar evento
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full border border-[#cbb89f] px-6 py-3 text-sm font-medium text-[#1f1a15] transition-all hover:-translate-y-0.5 hover:border-[#9d8668]"
                >
                  Falar com o time
                </a>
              </div>
            </div>
          </PublicReveal>

          <PublicReveal>
            <div className="rounded-[2.6rem] border border-[#e3d6c3] bg-white/88 p-7 shadow-[0_22px_65px_rgba(66,48,24,0.08)] md:p-9">
              <div className="text-[11px] uppercase tracking-[0.28em] text-[#8b7c69]">Potencial de ganho</div>
              <div className="mt-4 font-display text-[3rem] font-semibold leading-[0.92] tracking-[-0.05em] text-[#1f1a15]">
                Revenue, posicionamento e retencao sob a mesma assinatura.
              </div>
              <div className="mt-8 space-y-4">
                {[
                  'Checkout premium com percepcao de marca e preview de receita em tempo real.',
                  'Growth loops com sharing, referral, campanhas e remarketing sem depender de ferramentas espalhadas.',
                  'CRM, check-in, financeiro e operacao conectados a mesma base para sustentar recorrencia e escala.',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-[1.5rem] border border-[#eee2cf] bg-[#fbf7f1] p-4">
                    <Check className="mt-1 h-4 w-4 text-[#4e6d4f]" />
                    <div className="text-sm leading-7 text-[#5f5549]">{item}</div>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.6rem] bg-[#1f1a15] p-5 text-white">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-white/58">Tickets vendidos</div>
                  <div className="mt-3 font-display text-[2.5rem] font-semibold leading-none tracking-[-0.05em] text-white">
                    {ticketsSold.toLocaleString('pt-BR')}
                  </div>
                </div>
                <div className="rounded-[1.6rem] bg-[#efe4d2] p-5 text-[#1f1a15]">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-[#7a6b58]">Capacidade mapeada</div>
                  <div className="mt-3 font-display text-[2.5rem] font-semibold leading-none tracking-[-0.05em] text-[#1f1a15]">
                    {totalCapacity.toLocaleString('pt-BR')}
                  </div>
                </div>
              </div>
            </div>
          </PublicReveal>
        </div>
      </section>

      <SocialProofBlock
        title="A prova social nao fica em depoimento. Ela aparece nos sinais reais do produto."
        description="O produtor percebe valor mais rapido quando ve demanda, escala e sofisticacao operacional ja materializadas na mesma plataforma."
        items={[
          {
            label: 'Experiencias ativas',
            value: events.length.toLocaleString('pt-BR'),
            note: 'Experiencias publicadas e prontas para captar audiencia com midia real e descoberta editorial.',
          },
          {
            label: 'Participantes',
            value: ticketsSold.toLocaleString('pt-BR'),
            note: 'Base viva que alimenta CRM, remarketing e novos ciclos de relacionamento.',
          },
          {
            label: 'Curadoria viva',
            value: Math.max(events.filter((event) => event.minPrice !== null).length, 1).toLocaleString('pt-BR'),
            note: 'Operacoes com venda, fee, campanhas e dados fluindo na mesma camada premium.',
          },
        ]}
      />

      <section className="px-5 pb-20 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl rounded-[2.8rem] bg-[#1f1a15] px-8 py-10 text-white md:px-12 md:py-14">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="text-[11px] uppercase tracking-[0.3em] text-white/54">Launch path</div>
              <div className="mt-4 font-display text-[clamp(2.8rem,4.5vw,4.6rem)] font-semibold leading-[0.9] tracking-[-0.05em] text-white">
                O proximo capitulo da sua marca pode nascer aqui com mais margem e mais presenca.
              </div>
              <p className="mt-5 max-w-2xl text-base leading-8 text-white/72">
                Entre na plataforma, publique uma experiencia com presenca de marca, ative monetizacao e growth, e acompanhe vendas, CRM e operacao no mesmo fluxo.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="/login"
                className="inline-flex items-center gap-2 rounded-full bg-[#f2e6d6] px-6 py-3 text-sm font-medium text-[#1f1a15] transition-all hover:-translate-y-0.5"
              >
                Abrir workspace
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
