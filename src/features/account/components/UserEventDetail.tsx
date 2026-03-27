import { CalendarDays, Clock3, MapPin, Ticket } from 'lucide-react'
import type { AccountEventRecord } from '@/features/account/types'
import { PublicReveal } from '@/features/public'
import { EmptyState, MediaFrame, PremiumBadge, SectionHeader, SurfacePanel } from '@/shared/components'
import { formatLocaleDate, formatLocaleTime, useAppLocale } from '@/shared/i18n/app-locale'
import { TicketCard } from './TicketCard'

interface UserEventDetailProps {
  event: AccountEventRecord | null
}

export function UserEventDetail({ event }: UserEventDetailProps) {
  const { locale, isPortuguese, t } = useAppLocale()

  if (!event) {
    return (
      <EmptyState
        title={t('Choose an event to open your access', 'Escolha um evento para abrir seus acessos')}
        description={t(
          'As soon as you select a card, we show the tickets, QR code and the main instructions for the experience day.',
          'Assim que voce selecionar um card, mostramos os ingressos, o QR code e as instrucoes principais para o dia da experiencia.',
        )}
      />
    )
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow={t('Your access', 'Seu acesso')}
        title={event.name}
        description={t(
          'Everything you need to arrive with clarity: tickets, QR codes and operational instructions.',
          'Tudo o que voce precisa para chegar ao evento com clareza: ingressos, QR codes e instrucoes operacionais.',
        )}
      />

      <PublicReveal>
        <div className="grid gap-6 rounded-[2.2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(249,242,233,0.84))] p-6 shadow-[0_22px_55px_rgba(48,35,18,0.07)] lg:grid-cols-[22rem_minmax(0,1fr)]">
          <MediaFrame ratio="portrait" className="overflow-hidden rounded-[1.7rem] border border-[#eadcc6]">
            <img src={event.coverImageUrl} alt={event.name} className="h-full w-full object-cover" />
          </MediaFrame>

          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <PremiumBadge tone="accent">{event.category || t('Premium experience', 'Experiencia premium')}</PremiumBadge>
              <PremiumBadge tone={event.timeframe === 'upcoming' ? 'success' : 'info'}>
                {event.timeframe === 'upcoming' ? t('Next event', 'Proximo evento') : t('Past event', 'Evento passado')}
              </PremiumBadge>
            </div>

            <div className="font-display text-[clamp(2.5rem,4vw,4.2rem)] font-semibold leading-[0.94] tracking-[-0.05em] text-[#1f1a15]">
              {event.name}
            </div>
            {event.subtitle ? <p className="max-w-2xl text-base leading-7 text-[#5f5549]">{event.subtitle}</p> : null}

            <div className="grid gap-3 text-sm text-[#5f5549] md:grid-cols-2">
              <div className="flex items-center gap-2 rounded-[1.2rem] border border-[#eee2cf] bg-white/80 px-4 py-3">
                <CalendarDays className="h-4 w-4 text-[#7b6440]" />
                <span>{formatLocaleDate(event.startsAt, locale, { day: '2-digit', month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2 rounded-[1.2rem] border border-[#eee2cf] bg-white/80 px-4 py-3">
                <Clock3 className="h-4 w-4 text-[#7b6440]" />
                <span>{formatLocaleTime(event.startsAt, locale)}</span>
              </div>
              <div className="flex items-center gap-2 rounded-[1.2rem] border border-[#eee2cf] bg-white/80 px-4 py-3 md:col-span-2">
                <MapPin className="h-4 w-4 text-[#7b6440]" />
                <span>{[event.venueName, event.city, event.state].filter(Boolean).join(' / ')}</span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <SurfacePanel className="rounded-[1.35rem] p-4">
                <div className="text-[11px] uppercase tracking-[0.24em] text-[#8e7f68]">{t('Tickets', 'Ingressos')}</div>
                <div className="mt-2 text-2xl font-semibold text-[#1f1a15]">{event.ticketsCount}</div>
              </SurfacePanel>
              <SurfacePanel className="rounded-[1.35rem] p-4">
                <div className="text-[11px] uppercase tracking-[0.24em] text-[#8e7f68]">{t('Active', 'Ativos')}</div>
                <div className="mt-2 text-2xl font-semibold text-[#1f1a15]">{event.activeTicketCount}</div>
              </SurfacePanel>
              <SurfacePanel className="rounded-[1.35rem] p-4">
                <div className="text-[11px] uppercase tracking-[0.24em] text-[#8e7f68]">{t('Used', 'Usados')}</div>
                <div className="mt-2 text-2xl font-semibold text-[#1f1a15]">{event.usedTicketCount}</div>
              </SurfacePanel>
            </div>

            <div className="rounded-[1.5rem] border border-[#eadcc6] bg-[#faf4e8] p-5">
              <div className="text-[11px] uppercase tracking-[0.24em] text-[#8e7f68]">{t('Key instructions', 'Instrucoes principais')}</div>
              <div className="mt-3 space-y-2 text-sm leading-7 text-[#5f5549]">
                {event.instructions.map((instruction) => (
                  <div key={instruction} className="flex items-start gap-3">
                    <Ticket className="mt-1 h-4 w-4 text-[#7b6440]" />
                    <span>{instruction}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PublicReveal>

      {event.tickets.length === 0 ? (
        <EmptyState
          title={t('Your tickets are still being issued', 'Seus ingressos ainda estao em emissao')}
          description={t(
            'As soon as payment is confirmed by the gateway, your digital tickets appear here automatically.',
            'Assim que o pagamento for confirmado pelo gateway, os ingressos digitais aparecem aqui automaticamente.',
          )}
        />
      ) : (
        <div className="space-y-5">
          {event.tickets.map((ticket) => (
            <TicketCard key={ticket.id} event={event} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  )
}
