import { CalendarDays, MapPin, Ticket } from 'lucide-react'
import type { AccountEventRecord } from '@/features/account/types'
import { PremiumBadge, PublicReveal } from '@/features/public'
import { formatLocaleDate, useAppLocale } from '@/shared/i18n/app-locale'

interface UserEventCardProps {
  event: AccountEventRecord
  active?: boolean
  onSelect: (eventId: string) => void
}

function getEventStatusLabel(event: AccountEventRecord, isPortuguese: boolean) {
  if (event.timeframe === 'past' && event.usedTicketCount > 0) {
    return isPortuguese ? 'Vivido' : 'Experienced'
  }

  if (event.timeframe === 'past') {
    return isPortuguese ? 'Encerrado' : 'Closed'
  }

  return isPortuguese ? 'Proximo acesso' : 'Next access'
}

export function UserEventCard({ event, active = false, onSelect }: UserEventCardProps) {
  const { locale, isPortuguese, t } = useAppLocale()

  return (
    <PublicReveal>
      <button
        type="button"
        onClick={() => onSelect(event.id)}
        className={[
          'group relative min-h-[25rem] overflow-hidden rounded-[2rem] border text-left shadow-[0_24px_70px_rgba(46,34,17,0.12)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_32px_90px_rgba(46,34,17,0.16)]',
          active ? 'border-[#1f1a15] ring-1 ring-[#1f1a15]/12' : 'border-white/70',
        ].join(' ')}
      >
        <img
          src={event.coverImageUrl}
          alt={event.name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(19,14,10,0.06)_0%,rgba(19,14,10,0.16)_28%,rgba(19,14,10,0.84)_100%)]" />

        <div className="relative z-10 flex h-full flex-col justify-between p-5 text-white md:p-6">
          <div className="flex flex-wrap gap-2">
            <PremiumBadge tone="default" className="border-white/20 bg-white/12 text-white">
              {getEventStatusLabel(event, isPortuguese)}
            </PremiumBadge>
            <PremiumBadge tone="default" className="border-white/16 bg-black/15 text-white/78">
              {event.category || t('Experience', 'Experiencia')}
            </PremiumBadge>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-[0.28em] text-white/62">
              {formatLocaleDate(event.startsAt, locale, { day: '2-digit', month: 'long', year: 'numeric' })}
            </div>
            <div className="mt-3 font-display text-[2.2rem] font-semibold leading-[0.92] tracking-[-0.04em] text-white">
              {event.name}
            </div>
            {event.subtitle ? <p className="mt-3 max-w-sm text-sm leading-7 text-white/74">{event.subtitle}</p> : null}

            <div className="mt-5 grid gap-2 text-sm text-white/72">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-white/58" />
                <span>{new Date(event.startsAt).toLocaleString(locale)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-white/58" />
                <span>{[event.venueName, event.city].filter(Boolean).join(' / ')}</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-white/12 pt-5">
              <div className="flex items-center gap-2 text-sm text-white/82">
                <Ticket className="h-4 w-4 text-white/64" />
                {event.ticketsCount} {t(event.ticketsCount > 1 ? 'tickets' : 'ticket', event.ticketsCount > 1 ? 'ingressos' : 'ingresso')}
              </div>
              <span className="text-sm font-medium text-white/78">{t('Open access', 'Abrir acesso')}</span>
            </div>
          </div>
        </div>
      </button>
    </PublicReveal>
  )
}
