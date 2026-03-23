import type { MouseEvent } from 'react'
import { CalendarDays, Copy, Edit2, ExternalLink, Globe, MapPin, MoreHorizontal, Trash2, Users } from 'lucide-react'
import { cn, formatDate, formatNumber } from '@/lib/utils'
import { EVENT_STATUS_CONFIG } from '@/features/events/types'
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
  'from-purple-900/50 via-indigo-900/30 to-bg-card',
  'from-cyan-900/50 via-teal-900/30 to-bg-card',
  'from-orange-900/50 via-red-900/30 to-bg-card',
  'from-green-900/50 via-emerald-900/30 to-bg-card',
  'from-yellow-900/50 via-amber-900/30 to-bg-card',
  'from-pink-900/50 via-rose-900/30 to-bg-card',
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
    <div className="card group reveal overflow-hidden" style={{ animationDelay: `${index * 60}ms` }}>
      <div className={cn('relative h-36 overflow-hidden bg-gradient-to-br', gradient)}>
        {event.cover_url && (
          <img
            src={event.cover_url}
            alt={event.name}
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
        )}

        <span className="absolute left-3 top-3 rounded-sm border border-brand-acid/30 bg-bg-primary/50 px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-brand-acid backdrop-blur-sm">
          {event.category ?? 'Evento'}
        </span>

        <span
          className={cn(
            'absolute right-3 top-3 flex items-center gap-1.5 rounded-sm bg-bg-primary/60 px-2 py-1 text-[10px] font-medium backdrop-blur-sm',
            statusConfig.text,
          )}
        >
          <span className={cn('h-1.5 w-1.5 rounded-full', statusConfig.dot)} />
          {statusConfig.label}
        </span>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-bg-card via-bg-card/70 to-transparent p-3">
          <h3 className="font-display text-2xl leading-none tracking-wide text-text-primary transition-colors duration-300 group-hover:text-brand-acid">
            {event.name}
          </h3>
        </div>
      </div>

      <div className="space-y-3 p-4">
        {event.subtitle && <p className="truncate text-xs text-text-muted">{event.subtitle}</p>}

        <div className="flex items-center gap-3 text-xs text-text-secondary">
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3 w-3 text-brand-acid" />
            {formatDate(event.starts_at, 'dd/MM/yyyy')}
          </span>
          {(event.venue_address?.city || event.venue_name) && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-brand-acid" />
              {event.venue_address?.city ?? event.venue_name}
            </span>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-text-muted">
              <Users className="h-3 w-3" />
              {formatNumber(event.sold_tickets)}
              {event.total_capacity ? ` / ${formatNumber(event.total_capacity)}` : ''}
            </span>
            <span className={cn('font-mono font-medium', occupancy > 85 ? 'text-status-warning' : 'text-brand-acid')}>
              {occupancy}%
            </span>
          </div>
          <div className="h-px overflow-hidden rounded-full bg-bg-surface">
            <div
              className={cn('h-full rounded-full transition-all duration-700', occupancy > 90 ? 'bg-status-warning' : 'bg-brand-acid')}
              style={{ width: `${occupancy}%` }}
            />
          </div>
        </div>

        <div className="relative flex items-center justify-between border-t border-bg-border pt-1">
          <button
            onClick={onEdit}
            className="flex items-center gap-1 text-xs text-text-muted transition-colors hover:text-brand-acid"
          >
            <Edit2 className="h-3 w-3" /> Editar
          </button>

          <div className="flex items-center gap-1">
            {event.status === 'published' || event.status === 'ongoing' ? (
              <a
                href={`/e/${event.slug}`}
                target="_blank"
                className="rounded-sm p-1.5 text-text-muted transition-all hover:bg-brand-acid/8 hover:text-brand-acid"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : null}
            <button
              onClick={onMenu}
              className="rounded-sm p-1.5 text-text-muted transition-all hover:bg-bg-surface hover:text-text-primary"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
          </div>

          {menuOpen && (
            <div
              className="absolute bottom-8 right-0 z-50 w-44 overflow-hidden rounded-sm border border-bg-border bg-bg-card shadow-card"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                onClick={onEdit}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-xs text-text-secondary transition-all hover:bg-bg-surface hover:text-text-primary"
              >
                <Edit2 className="h-3.5 w-3.5" /> Editar
              </button>
              <button
                onClick={onPublish}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-xs text-text-secondary transition-all hover:bg-bg-surface hover:text-text-primary"
              >
                <Globe className="h-3.5 w-3.5" />
                {event.status === 'published' ? 'Despublicar' : 'Publicar'}
              </button>
              <button
                onClick={onDuplicate}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-xs text-text-secondary transition-all hover:bg-bg-surface hover:text-text-primary"
              >
                <Copy className="h-3.5 w-3.5" /> Duplicar
              </button>
              <div className="border-t border-bg-border" />
              <button
                onClick={onDelete}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-xs text-status-error transition-all hover:bg-status-error/8"
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
