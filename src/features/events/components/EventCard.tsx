import type { MouseEvent } from 'react'
import { CalendarDays, Copy, Edit2, ExternalLink, Globe, MapPin, MoreHorizontal, ScanLine, Trash2, Users } from 'lucide-react'
import { EVENT_STATUS_CONFIG } from '@/features/events/types'
import { cn, formatDate, formatNumber } from '@/shared/lib'
import type { EventRow } from '@/features/events/types'

interface EventCardProps {
  event: EventRow
  index: number
  menuOpen: boolean
  onMenu: (event: MouseEvent) => void
  onEdit: () => void
  onPublish: () => void
  onDuplicate: () => void
  onDelete: () => void
}

const COVER_GRADIENTS = [
  'from-[#f5ecde] via-[#f8f4ee] to-[#ffffff]',
  'from-[#ebe6da] via-[#f7f2e8] to-[#ffffff]',
  'from-[#efe2d4] via-[#faf4ea] to-[#ffffff]',
  'from-[#e7eadf] via-[#f8f5ee] to-[#ffffff]',
  'from-[#ede4d6] via-[#faf5ef] to-[#ffffff]',
  'from-[#efe7e0] via-[#fbf6f2] to-[#ffffff]',
]

export function EventCard({
  event,
  index,
  menuOpen,
  onMenu,
  onEdit,
  onPublish,
  onDuplicate,
  onDelete,
}: EventCardProps) {
  const statusConfig = EVENT_STATUS_CONFIG[event.status]
  const occupancy = event.total_capacity
    ? Math.round((event.sold_tickets / event.total_capacity) * 100)
    : 0
  const gradient = COVER_GRADIENTS[index % COVER_GRADIENTS.length]

  return (
    <div className="card-hover group reveal overflow-hidden" style={{ animationDelay: `${index * 60}ms` }}>
      <div className={cn('relative h-48 overflow-hidden bg-gradient-to-br', gradient)}>
        {event.cover_url && (
          <img
            src={event.cover_url}
            alt={event.name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-white/5" />

        <span className="absolute left-4 top-4 rounded-full border border-white/80 bg-white/85 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.26em] text-text-secondary backdrop-blur-sm">
          {event.category ?? 'Evento'}
        </span>

        <span
          className={cn(
            'absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-white/80 bg-white/85 px-3 py-1 text-[10px] font-medium backdrop-blur-sm',
            statusConfig.text,
          )}
        >
          <span className={cn('h-1.5 w-1.5 rounded-full', statusConfig.dot)} />
          {statusConfig.label}
        </span>

        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3 className="font-display text-[2rem] leading-none tracking-[-0.04em] text-text-primary transition-colors duration-300 group-hover:text-brand-acid">
            {event.name}
          </h3>
          {event.subtitle && <p className="mt-2 max-w-md text-sm leading-6 text-text-secondary">{event.subtitle}</p>}
        </div>
      </div>

      <div className="space-y-5 p-5">
        <div className="grid grid-cols-1 gap-3 text-sm text-text-secondary md:grid-cols-2">
          <span className="flex items-center gap-2">
            <CalendarDays className="h-3.5 w-3.5 text-brand-acid" />
            {formatDate(event.starts_at, 'dd/MM/yyyy')}
          </span>
          {(event.venue_address?.city || event.venue_name) && (
            <span className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-brand-acid" />
              {event.venue_address?.city ?? event.venue_name}
            </span>
          )}
        </div>

        <div className="rounded-2xl border border-bg-border bg-bg-secondary/80 p-4">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-text-muted">
              <Users className="h-3.5 w-3.5" />
              {formatNumber(event.sold_tickets)}
              {event.total_capacity ? ` / ${formatNumber(event.total_capacity)}` : ''}
            </span>
            <span className={cn('font-mono text-[11px] font-medium uppercase tracking-[0.22em]', occupancy > 85 ? 'text-status-warning' : 'text-brand-acid')}>
              {occupancy}%
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white">
            <div
              className={cn('h-full rounded-full transition-all duration-700', occupancy > 90 ? 'bg-status-warning' : 'bg-brand-acid')}
              style={{ width: `${occupancy}%` }}
            />
          </div>
          <div className="mt-3 text-[11px] leading-5 text-text-muted">
            Ocupacao atual e disponibilidade projetada para este evento.
          </div>
        </div>

        {/* Event code badge */}
        {event.event_code && (
          <button
            type="button"
            title="Código do scanner — clique para copiar"
            onClick={(e) => {
              e.stopPropagation()
              void navigator.clipboard.writeText(event.event_code!)
            }}
            className="flex w-full items-center justify-between rounded-sm border border-brand-acid/20 bg-brand-acid/5 px-3 py-2 transition-colors hover:bg-brand-acid/10 group"
          >
            <span className="flex items-center gap-2 font-mono text-[11px] text-text-muted">
              <ScanLine className="h-3.5 w-3.5 text-brand-acid" />
              Código do scanner
            </span>
            <span className="flex items-center gap-2 font-mono text-sm font-bold tracking-[0.2em] text-brand-acid">
              {event.event_code}
              <Copy className="h-3 w-3 opacity-0 group-hover:opacity-70 transition-opacity" />
            </span>
          </button>
        )}

        <div className="relative flex items-center justify-between border-t border-bg-border pt-3">
          <button
            onClick={onEdit}
            className="flex items-center gap-2 text-xs font-medium text-text-muted transition-colors hover:text-brand-acid"
          >
            <Edit2 className="h-3.5 w-3.5" /> Editar evento
          </button>

          <div className="flex items-center gap-1.5">
            {event.status === 'published' || event.status === 'ongoing' ? (
              <a
                href={`/e/${event.slug}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-transparent p-2 text-text-muted transition-all hover:border-brand-acid/15 hover:bg-brand-acid/8 hover:text-brand-acid"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : null}
            <button
              onClick={onMenu}
              className="rounded-full border border-transparent p-2 text-text-muted transition-all hover:border-bg-border hover:bg-bg-surface hover:text-text-primary"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
          </div>

          {menuOpen && (
            <div
              className="absolute bottom-10 right-0 z-50 w-48 overflow-hidden rounded-2xl border border-bg-border bg-white shadow-card"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                onClick={onEdit}
                className="flex w-full items-center gap-2 px-4 py-3 text-xs text-text-secondary transition-all hover:bg-bg-surface hover:text-text-primary"
              >
                <Edit2 className="h-3.5 w-3.5" /> Editar
              </button>
              <button
                onClick={onPublish}
                className="flex w-full items-center gap-2 px-4 py-3 text-xs text-text-secondary transition-all hover:bg-bg-surface hover:text-text-primary"
              >
                <Globe className="h-3.5 w-3.5" />
                {event.status === 'published' ? 'Despublicar' : 'Publicar'}
              </button>
              <button
                onClick={onDuplicate}
                className="flex w-full items-center gap-2 px-4 py-3 text-xs text-text-secondary transition-all hover:bg-bg-surface hover:text-text-primary"
              >
                <Copy className="h-3.5 w-3.5" /> Duplicar
              </button>
              <div className="border-t border-bg-border" />
              <button
                onClick={onDelete}
                className="flex w-full items-center gap-2 px-4 py-3 text-xs text-status-error transition-all hover:bg-status-error/8"
              >
                <Trash2 className="h-3.5 w-3.5" /> Excluir
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
