import { CalendarDays, Download, MapPin, Sparkles } from 'lucide-react'
import type { AccountEventRecord, AccountTicketRecord } from '@/features/account/types'
import { PremiumBadge, PublicReveal } from '@/features/public'
import { formatCurrency } from '@/shared/lib'
import { TicketQRDisplay } from './TicketQRDisplay'

interface TicketCardProps {
  event: AccountEventRecord
  ticket: AccountTicketRecord
}

function handleDownload(event: AccountEventRecord, ticket: AccountTicketRecord) {
  const content = [
    'ANIMALZ EVENTS',
    '',
    `Evento: ${event.name}`,
    `Ingresso: ${ticket.ticketTypeName}`,
    `Lote: ${ticket.batchName}`,
    `Status: ${ticket.visualStatus}`,
    `Portador: ${ticket.holderName}`,
    `E-mail: ${ticket.holderEmail}`,
    `Codigo: ${ticket.qrToken}`,
    `Numero: ${ticket.ticketNumber}`,
    `Data: ${new Date(event.startsAt).toLocaleString('pt-BR')}`,
    `Local: ${[event.venueName, event.city, event.state].filter(Boolean).join(' / ')}`,
  ].join('\n')

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const downloadUrl = window.URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = downloadUrl
  anchor.download = `${event.slug}-${ticket.ticketNumber}.txt`
  anchor.click()
  window.URL.revokeObjectURL(downloadUrl)
}

export function TicketCard({ event, ticket }: TicketCardProps) {
  return (
    <PublicReveal>
      <div className="grid gap-6 rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(249,242,233,0.84))] p-6 shadow-[0_22px_55px_rgba(48,35,18,0.07)] lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <PremiumBadge tone={ticket.isVip ? 'accent' : 'default'}>
              {ticket.isVip ? 'VIP' : 'Acesso confirmado'}
            </PremiumBadge>
            <PremiumBadge tone="default">{ticket.ticketTypeName}</PremiumBadge>
          </div>

          <div className="mt-5 font-display text-[2.2rem] font-semibold leading-[0.94] tracking-[-0.04em] text-[#1f1a15]">
            {event.name}
          </div>
          <div className="mt-2 text-sm leading-7 text-[#5f5549]">
            {ticket.batchName} · ingresso {ticket.ticketNumber}
          </div>

          <div className="mt-5 grid gap-3 text-sm text-[#5f5549] md:grid-cols-2">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-[#7b6440]" />
              <span>{new Date(event.startsAt).toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#7b6440]" />
              <span>{[event.venueName, event.city].filter(Boolean).join(' / ')}</span>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.25rem] border border-[#eee2cf] bg-white/70 p-4">
              <div className="text-[11px] uppercase tracking-[0.24em] text-[#8e7f68]">Portador</div>
              <div className="mt-2 text-sm font-medium text-[#1f1a15]">{ticket.holderName}</div>
            </div>
            <div className="rounded-[1.25rem] border border-[#eee2cf] bg-white/70 p-4">
              <div className="text-[11px] uppercase tracking-[0.24em] text-[#8e7f68]">Valor</div>
              <div className="mt-2 text-sm font-medium text-[#1f1a15]">
                {ticket.price > 0 ? formatCurrency(ticket.price) : 'Cortesia / inscricao'}
              </div>
            </div>
            <div className="rounded-[1.25rem] border border-[#eee2cf] bg-white/70 p-4">
              <div className="text-[11px] uppercase tracking-[0.24em] text-[#8e7f68]">Status</div>
              <div className="mt-2 text-sm font-medium text-[#1f1a15]">
                {ticket.visualStatus === 'used'
                  ? 'Utilizado no check-in'
                  : ticket.visualStatus === 'cancelled'
                    ? 'Acesso indisponivel'
                    : 'Pronto para entrada'}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => handleDownload(event, ticket)}
              className="inline-flex items-center gap-2 rounded-full bg-[#1f1a15] px-5 py-3 text-sm font-medium text-[#f8f3ea] transition-all duration-300 hover:-translate-y-0.5"
            >
              <Download className="h-4 w-4" />
              Baixar acesso
            </button>
            <a
              href={`/e/${event.slug}`}
              className="inline-flex items-center gap-2 rounded-full border border-[#ddd1bf] bg-white px-5 py-3 text-sm font-medium text-[#1f1a15] transition-colors hover:border-[#b79e74]"
            >
              <Sparkles className="h-4 w-4" />
              Ver pagina do evento
            </a>
          </div>
        </div>

        <TicketQRDisplay value={ticket.qrToken} status={ticket.visualStatus} />
      </div>
    </PublicReveal>
  )
}
