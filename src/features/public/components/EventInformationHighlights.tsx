import { CalendarDays, Clock3, MapPin, ShieldCheck, Sparkles, Users } from 'lucide-react'
import type { PublicEventRecord } from '@/features/public/types/public.types'
import { PublicReveal } from './PublicReveal'

interface EventInformationHighlightsProps {
  event: PublicEventRecord
  isFreeMode: boolean
}

export function EventInformationHighlights({ event, isFreeMode }: EventInformationHighlightsProps) {
  const highlights = [
    {
      icon: CalendarDays,
      label: 'Data',
      value: new Date(event.starts_at).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      note: 'Agenda principal da experiencia',
    },
    {
      icon: Clock3,
      label: 'Horario',
      value: event.doors_open_at ? `Portoes as ${new Date(event.doors_open_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` : new Date(event.starts_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      note: 'Chegada recomendada com antecedencia',
    },
    {
      icon: MapPin,
      label: 'Local',
      value: [event.venue_name, event.venue_address?.city, event.venue_address?.state].filter(Boolean).join(' / '),
      note: 'Venue selecionado para a experiencia',
    },
    {
      icon: Users,
      label: 'Capacidade',
      value: `${event.total_capacity.toLocaleString('pt-BR')} pessoas`,
      note: `${event.sold_tickets.toLocaleString('pt-BR')} acessos ja vendidos`,
    },
    {
      icon: Sparkles,
      label: 'Categoria',
      value: event.category || 'Experiencia premium',
      note: event.age_rating ? `Classificacao ${event.age_rating}` : 'Curadoria de atmosfera premium',
    },
    {
      icon: ShieldCheck,
      label: 'Acesso',
      value: isFreeMode ? 'Inscricao com QR code digital' : 'Ingresso digital com validacao antifraude',
      note: 'Fluxo de entrada sustentado pelo sistema real',
    },
  ]

  return (
    <section className="px-5 py-8 md:px-10 lg:px-16 lg:py-10">
      <div className="mx-auto max-w-7xl">
        <PublicReveal>
          <div className="max-w-2xl">
            <div className="text-[11px] uppercase tracking-[0.32em] text-[#8e7f68]">Informacoes essenciais</div>
            <h2 className="mt-4 font-display text-[clamp(2.6rem,4vw,4rem)] font-semibold leading-[0.92] tracking-[-0.04em] text-[#1f1a15]">
              Tudo o que importa, organizado com clareza e presenca.
            </h2>
          </div>
        </PublicReveal>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {highlights.map((item, index) => {
            const Icon = item.icon

            return (
              <PublicReveal key={item.label} delayMs={index * 70}>
                <div className="h-full rounded-[1.8rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.8),rgba(250,244,236,0.78))] p-6 shadow-[0_18px_55px_rgba(48,35,18,0.06)]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f2e6d5] text-[#7b6440]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-[11px] uppercase tracking-[0.26em] text-[#8e7f68]">{item.label}</div>
                  </div>
                  <div className="mt-5 font-display text-[2rem] font-semibold leading-[0.94] tracking-[-0.03em] text-[#1f1a15]">
                    {item.value}
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[#5f5549]">{item.note}</p>
                </div>
              </PublicReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
