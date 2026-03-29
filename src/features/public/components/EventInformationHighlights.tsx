import { CalendarDays, Clock3, MapPin, ShieldCheck, Sparkles, Users } from 'lucide-react'
import type { PublicEventRecord } from '@/features/public/types/public.types'
import { PublicReveal } from './PublicReveal'
import { formatPublicDate, formatPublicNumber, formatPublicTime, usePublicLocale } from '../lib/public-locale'

interface EventInformationHighlightsProps {
  event: PublicEventRecord
  isFreeMode: boolean
}

export function EventInformationHighlights({ event, isFreeMode }: EventInformationHighlightsProps) {
  const { locale, isPortuguese } = usePublicLocale()
  const highlights = [
    {
      icon: CalendarDays,
      label: isPortuguese ? 'Data' : 'Date',
      value: formatPublicDate(event.starts_at, locale, {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      note: isPortuguese ? 'Agenda principal da experiencia' : 'Primary date for the experience',
    },
    {
      icon: Clock3,
      label: isPortuguese ? 'Horario' : 'Time',
      value: event.doors_open_at
        ? isPortuguese
          ? `Portoes as ${formatPublicTime(event.doors_open_at, locale)}`
          : `Doors at ${formatPublicTime(event.doors_open_at, locale)}`
        : formatPublicTime(event.starts_at, locale),
      note: isPortuguese ? 'Chegada recomendada com antecedencia' : 'Early arrival is recommended',
    },
    {
      icon: MapPin,
      label: isPortuguese ? 'Local' : 'Location',
      value: [event.venue_name, event.venue_address?.city, event.venue_address?.state].filter(Boolean).join(' / '),
      note: isPortuguese ? 'Local preparado para a operacao do evento' : 'Venue prepared for live event operations',
    },
    {
      icon: Users,
      label: isPortuguese ? 'Capacidade' : 'Capacity',
      value: `${formatPublicNumber(event.total_capacity, locale)} ${isPortuguese ? 'pessoas' : 'people'}`,
      note: `${formatPublicNumber(event.sold_tickets, locale)} ${isPortuguese ? 'acessos ja vendidos' : 'accesses already sold'}`,
    },
    {
      icon: Sparkles,
      label: isPortuguese ? 'Categoria' : 'Category',
      value: event.category || (isPortuguese ? 'Experiencia premium' : 'Premium experience'),
      note: event.age_rating ? (isPortuguese ? `Classificacao ${event.age_rating}` : `Age rating ${event.age_rating}`) : (isPortuguese ? 'Curadoria de atmosfera premium' : 'Curated premium atmosphere'),
    },
    {
      icon: ShieldCheck,
      label: isPortuguese ? 'Acesso' : 'Access',
      value: isFreeMode ? (isPortuguese ? 'Inscricao com QR code digital' : 'Registration with digital QR code') : (isPortuguese ? 'Ingresso digital com validacao antifraude' : 'Digital ticket with anti-fraud validation'),
      note: isPortuguese ? 'Compra, emissao e credenciamento ligados ao mesmo produto' : 'Purchase, issuance and check-in connected to the same product',
    },
  ]

  return (
    <section className="px-5 py-10 md:px-10 lg:px-16 lg:py-14">
      <div className="mx-auto max-w-7xl">
        <PublicReveal>
          <div className="max-w-3xl">
            <div className="text-[11px] uppercase tracking-[0.32em] text-white/48">
              {isPortuguese ? 'Informacoes do evento' : 'Event information'}
            </div>
            <h2 className="mt-4 font-display text-[clamp(2.8rem,4vw,4.3rem)] font-semibold uppercase leading-[0.92] tracking-[-0.04em] text-white">
              {isPortuguese
                ? 'Informacoes essenciais, apresentadas como parte da experiencia.'
                : 'Essential information, presented as part of the experience.'}
            </h2>
          </div>
        </PublicReveal>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {highlights.map((item, index) => {
            const Icon = item.icon

            return (
              <PublicReveal key={item.label} delayMs={index * 70}>
                <div className="h-full rounded-[1.8rem] border border-white/8 bg-[linear-gradient(180deg,#0d1117_0%,#121823_100%)] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.24)]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ff2d2d]/12 text-[#ff6a5c]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-[11px] uppercase tracking-[0.26em] text-white/46">{item.label}</div>
                  </div>
                  <div className="mt-5 font-display text-[2rem] font-semibold uppercase leading-[0.94] tracking-[-0.03em] text-white">
                    {item.value}
                  </div>
                  <p className="mt-3 text-sm leading-7 text-white/66">{item.note}</p>
                </div>
              </PublicReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
