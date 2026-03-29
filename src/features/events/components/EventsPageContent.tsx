import { useState } from 'react'
import { CalendarDays, Copy, Edit2, Plus, Search, Trash2 } from 'lucide-react'
import { useAuthStore } from '@/features/auth'
import { useAccessControl } from '@/features/access-control'
import { useEventActions, useEventsList } from '@/features/events/hooks'
import { EventFormModal } from '@/features/events/modals'
import { EVENT_STATUS_CONFIG } from '@/features/events/types'
import type { EventRow } from '@/features/events/types'
import { ActionConfirmationDialog, PageEmptyState, PageErrorState, PageLoadingState } from '@/shared/components'
import { useAppLocale } from '@/shared/i18n/app-locale'
import { cn, formatDate } from '@/shared/lib'
import { EventCard } from './EventCard'

export function EventsPageContent() {
  const { t } = useAppLocale()
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
  const [pendingDeleteEvent, setPendingDeleteEvent] = useState<EventRow | null>(null)

  return (
    <div className="admin-page" onClick={closeMenu}>
      <div className="admin-header">
        <div>
          <div className="admin-eyebrow">{t('Portfolio & schedule', 'Portfolio e agenda')}</div>
          <h1 className="admin-title">
            {t('Events', 'Eventos')}<span className="admin-title-accent">.</span>
          </h1>
          <p className="admin-subtitle">
            {events.length} {t(events.length !== 1 ? 'events registered' : 'event registered', events.length !== 1 ? 'eventos cadastrados' : 'evento cadastrado')}
          </p>
        </div>
        <div className="novare-stage-panel-dark">
          <div className="novare-stage-label">{t('Live catalog', 'Catalogo ao vivo')}</div>
          <div className="novare-stage-title">
            {t('The event portfolio now behaves like an editorial operating layer.', 'O portfolio de eventos agora se comporta como uma camada editorial de operacao.')}
          </div>
          <div className="novare-stage-copy">
            {t(
              'Every launch, draft and published event stays inside the same visual system used by the public layer and the back office.',
              'Cada lancamento, rascunho e evento publicado permanece dentro do mesmo sistema visual usado na camada publica e no backoffice.',
            )}
          </div>
          {canManageEvents ? (
            <div className="mt-6">
              <button onClick={openCreateForm} className="btn-primary flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {t('New event', 'Novo evento')}
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="novare-stage-stack">
        {statsBar.map((stat, index) => (
          <article key={index} className="novare-stage-metric">
            <div className="novare-stage-label">{stat.label}</div>
            <div className="novare-stage-metric-value">{stat.value}</div>
            <div className="novare-stage-metric-copy">
              {t('Signal extracted from the current event catalog.', 'Sinal extraido do catalogo atual de eventos.')}
            </div>
          </article>
        ))}
      </div>

      <div className="admin-filterbar" style={{ animationDelay: '80ms' }}>
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
          <input
            className="input h-9 pl-9 text-sm"
            placeholder={t('Search event...', 'Buscar evento...')}
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
              {status === 'all' ? t('All', 'Todos') : EVENT_STATUS_CONFIG[status].label}
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
              {mode === 'grid' ? t('Grid', 'Grade') : t('List', 'Lista')}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <PageLoadingState title={t('Loading events', 'Carregando eventos')} description={t('Fetching the portfolio and organization indicators.', 'Buscando o portfolio e os indicadores da organizacao.')} />
      )}

      {!loading && error && (
        <PageErrorState
          title={t('Unable to load events', 'Erro ao carregar eventos')}
          description={error}
          icon={<CalendarDays className="mb-3 h-10 w-10 text-status-error" />}
          action={
            <button onClick={() => void refreshEvents()} className="btn-primary">
              {t('Try again', 'Tentar novamente')}
            </button>
          }
        />
      )}

      {!loading && !error && filteredEvents.length === 0 && (
        <PageEmptyState
          title={search || filter !== 'all' ? t('No results', 'Nenhum resultado') : t('No events', 'Nenhum evento')}
          description={search || filter !== 'all' ? t('Try different filters.', 'Tente outros filtros.') : t('Create your first event to get started.', 'Crie seu primeiro evento para comecar.')}
          icon={<CalendarDays className="mb-3 h-10 w-10 text-text-muted" />}
          action={
            !search && filter === 'all' && canManageEvents ? (
              <button onClick={openCreateForm} className="btn-primary">
                + {t('Create event', 'Criar evento')}
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
                setPendingDeleteEvent(event)
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
                {[t('Event', 'Evento'), t('Status', 'Status'), t('Date', 'Data'), t('Venue', 'Local'), t('Occupancy', 'Ocupacao'), t('Actions', 'Acoes')].map((header) => (
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
                          onClick={() => setPendingDeleteEvent(event)}
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

      <ActionConfirmationDialog
        open={Boolean(pendingDeleteEvent)}
        title={t('Remove event', 'Remover evento')}
        description={pendingDeleteEvent ? t(`The event "${pendingDeleteEvent.name}" will be removed from the admin portfolio.`, `O evento "${pendingDeleteEvent.name}" sera removido do portfolio administrativo.`) : undefined}
        impact={t('This removal takes the event out of the administrative portfolio and can affect operations, future sales and historical visibility in the back office.', 'A exclusao remove a configuracao principal do evento e pode afetar operacao, vendas futuras e historico associado no painel administrativo.')}
        confirmLabel={t('Delete event', 'Excluir evento')}
        confirming={false}
        onCancel={() => setPendingDeleteEvent(null)}
        onConfirm={async () => {
          if (!pendingDeleteEvent) {
            return
          }

          await deleteEvent(pendingDeleteEvent.id)
          setPendingDeleteEvent(null)
        }}
      />
    </div>
  )
}
