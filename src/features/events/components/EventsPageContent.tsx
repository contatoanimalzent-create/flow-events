import { CalendarDays, Copy, Edit2, Plus, Search, Trash2 } from 'lucide-react'
import { useAuthStore } from '@/features/auth'
import { useAccessControl } from '@/features/access-control'
import { useEventActions, useEventsList } from '@/features/events/hooks'
import { EventFormModal } from '@/features/events/modals'
import { EVENT_STATUS_CONFIG } from '@/features/events/types'
import { PageEmptyState, PageErrorState, PageLoadingState } from '@/shared/components'
import { cn, formatDate } from '@/shared/lib'
import { EventCard } from './EventCard'

export function EventsPageContent() {
  const organization = useAuthStore((state) => state.organization)
  const access = useAccessControl()
  const canManageEvents = access.can('events', 'manage')
  const {
    events,
    filteredEvents,
    loading,
    error,
    search,
    setSearch,
    filter,
    setFilter,
    view,
    setView,
    showForm,
    editingId,
    menuId,
    statsBar,
    refreshEvents,
    openCreateForm,
    openEditForm,
    closeForm,
    closeMenu,
    toggleMenu,
  } = useEventsList(organization?.id)
  const { publishEvent, deleteEvent, duplicateEvent } = useEventActions({ organizationId: organization?.id })

  return (
    <div className="admin-page" onClick={closeMenu}>
      <div className="admin-header">
        <div>
          <div className="admin-eyebrow">Portfolio & agenda</div>
          <h1 className="admin-title">
            Eventos<span className="admin-title-accent">.</span>
          </h1>
          <p className="admin-subtitle">
            {events.length} evento{events.length !== 1 ? 's' : ''} cadastrado{events.length !== 1 ? 's' : ''}
          </p>
        </div>
        {canManageEvents ? (
          <button onClick={openCreateForm} className="btn-primary flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo evento
          </button>
        ) : null}
      </div>

      <div className="reveal grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4" style={{ animationDelay: '40ms' }}>
        {statsBar.map((stat, index) => (
          <div key={index} className="card p-4">
            <div className="text-[10px] uppercase tracking-widest text-text-muted">{stat.label}</div>
            <div className="mt-1 text-2xl font-semibold text-text-primary">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="admin-filterbar" style={{ animationDelay: '80ms' }}>
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
          <input
            className="input h-9 pl-9 text-sm"
            placeholder="Buscar evento..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-1">
          {(['all', 'published', 'ongoing', 'draft', 'finished'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={cn(
                'rounded-sm px-3 py-1.5 text-xs font-medium transition-all',
                filter === status
                  ? 'bg-brand-acid text-bg-primary'
                  : 'border border-transparent text-text-muted hover:border-bg-border hover:bg-bg-surface hover:text-text-primary',
              )}
            >
              {status === 'all' ? 'Todos' : EVENT_STATUS_CONFIG[status].label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        <div className="flex items-center overflow-hidden rounded-sm border border-bg-border">
          {(['grid', 'list'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setView(mode)}
              className={cn(
                'px-3 py-1.5 text-xs transition-all',
                view === mode ? 'bg-brand-acid/15 text-brand-acid' : 'text-text-muted hover:text-text-primary',
              )}
            >
              {mode === 'grid' ? 'Grid' : 'Lista'}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <PageLoadingState title="Carregando eventos" description="Buscando o portfolio e os indicadores da organizacao." />
      )}

      {!loading && error && (
        <PageErrorState
          title="ERRO AO CARREGAR EVENTOS"
          description={error}
          icon={<CalendarDays className="mb-3 h-10 w-10 text-status-error" />}
          action={
            <button onClick={() => void refreshEvents()} className="btn-primary">
              Tentar novamente
            </button>
          }
        />
      )}

      {!loading && !error && filteredEvents.length === 0 && (
        <PageEmptyState
          title={search || filter !== 'all' ? 'NENHUM RESULTADO' : 'NENHUM EVENTO'}
          description={search || filter !== 'all' ? 'Tente outros filtros.' : 'Crie seu primeiro evento para comecar.'}
          icon={<CalendarDays className="mb-3 h-10 w-10 text-text-muted" />}
          action={
            !search && filter === 'all' && canManageEvents ? (
              <button onClick={openCreateForm} className="btn-primary">
                + Criar evento
              </button>
            ) : undefined
          }
        />
      )}

      {!loading && !error && filteredEvents.length > 0 && view === 'grid' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredEvents.map((event, index) => (
            <EventCard
              key={event.id}
              event={event}
              index={index}
              menuOpen={menuId === event.id}
              onMenu={(mouseEvent) => {
                mouseEvent.stopPropagation()
                toggleMenu(event.id)
              }}
              onEdit={() => openEditForm(event.id)}
              onPublish={async () => {
                await publishEvent(event.id, event.status)
                closeMenu()
              }}
              onDuplicate={async () => {
                await duplicateEvent(event)
                closeMenu()
              }}
              onDelete={async () => {
                await deleteEvent(event.id)
                closeMenu()
              }}
            />
          ))}
        </div>
      )}

      {!loading && !error && filteredEvents.length > 0 && view === 'list' && (
        <div className="card reveal overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-bg-border">
              <tr>
                {['Evento', 'Status', 'Data', 'Local', 'Ocupa\u00e7\u00e3o', 'A\u00e7\u00f5es'].map((header) => (
                  <th key={header} className="table-header">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((event) => {
                const statusConfig = EVENT_STATUS_CONFIG[event.status]
                const occupancy = event.total_capacity
                  ? Math.round((event.sold_tickets / event.total_capacity) * 100)
                  : 0

                return (
                  <tr key={event.id} className="table-row">
                    <td className="table-cell">
                      <div className="font-display text-sm tracking-wide">{event.name}</div>
                      <div className="text-[11px] text-text-muted">{event.category}</div>
                    </td>
                    <td className="table-cell">
                      <span className={cn('flex items-center gap-1.5 text-xs', statusConfig.text)}>
                        <span className={cn('h-1.5 w-1.5 rounded-full', statusConfig.dot)} />
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="table-cell font-mono text-xs text-text-secondary">
                      {formatDate(event.starts_at, 'dd/MM/yyyy')}
                    </td>
                    <td className="table-cell text-xs text-text-secondary">
                      {event.venue_address?.city ?? event.venue_name ?? '\u2014'}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <div className="h-1 w-16 overflow-hidden rounded-full bg-bg-surface">
                          <div className="h-full rounded-full bg-brand-acid" style={{ width: `${occupancy}%` }} />
                        </div>
                        <span className="text-[11px] font-mono text-text-muted">{occupancy}%</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditForm(event.id)}
                          className="rounded-sm p-1.5 text-text-muted transition-all hover:bg-brand-acid/8 hover:text-brand-acid"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => void duplicateEvent(event)}
                          className="rounded-sm p-1.5 text-text-muted transition-all hover:bg-bg-surface hover:text-text-primary"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => void deleteEvent(event.id)}
                          className="rounded-sm p-1.5 text-text-muted transition-all hover:bg-status-error/8 hover:text-status-error"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {showForm && organization && (
        <EventFormModal
          eventId={editingId}
          organizationId={organization.id}
          onClose={closeForm}
          onSaved={closeForm}
        />
      )}
    </div>
  )
}
