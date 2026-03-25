import { ArrowUpDown, Loader2, Package, Plus, Ticket, ToggleRight } from 'lucide-react'
import { useAuthStore } from '@/features/auth'
import { useAccessControl } from '@/features/access-control'
import { useTicketActions, useTicketsList } from '@/features/tickets/hooks'
import { TicketBatchModal, TicketTypeModal } from '@/features/tickets/modals'
import { PageEmptyState, PageErrorState, PageLoadingState, PaginationControls } from '@/shared/components'
import { cn } from '@/shared/lib'
import { TicketTypeCard } from './TicketTypeCard'

export function TicketsPageContent() {
  const organization = useAuthStore((state) => state.organization)
  const access = useAccessControl()
  const canManageTickets = access.can('tickets', 'manage')
  const {
    events,
    selectedEventId,
    setSelectedEventId,
    ticketTypes,
    allTicketTypes,
    loading,
    error,
    stats,
    expandedType,
    setExpandedType,
    showTypeForm,
    showBatchForm,
    editingTypeId,
    editingBatchId,
    batchParentId,
    pagination,
    setPage,
    refreshTickets,
    openCreateTypeModal,
    openEditTypeModal,
    closeTypeModal,
    openCreateBatchModal,
    openEditBatchModal,
    closeBatchModal,
  } = useTicketsList(organization?.id)
  const { toggleTicketStatus, deleteTicket, toggleBatchStatus, deleteBatch } = useTicketActions({
    selectedEventId,
  })

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <div className="admin-eyebrow">Inventory architecture</div>
          <h1 className="admin-title">
            Ingressos<span className="admin-title-accent">.</span>
          </h1>
          <p className="admin-subtitle">Tipos de ingresso e lotes de venda.</p>
        </div>
        {canManageTickets ? (
          <button onClick={openCreateTypeModal} disabled={!selectedEventId} className="btn-primary flex items-center gap-2">
            <Plus className="h-4 w-4" /> Novo tipo
          </button>
        ) : null}
      </div>

      {events.length > 1 && (
        <div className="admin-filterbar">
          <span className="text-xs font-mono text-text-muted">EVENTO:</span>
          <div className="flex flex-wrap items-center gap-2">
            {events.map((event) => (
              <button
                key={event.id}
                onClick={() => setSelectedEventId(event.id)}
                className={cn(
                  'rounded-sm px-3 py-1.5 text-xs font-medium transition-all',
                  selectedEventId === event.id
                    ? 'bg-brand-acid text-bg-primary'
                    : 'border border-bg-border text-text-muted hover:border-brand-acid/30 hover:text-text-primary',
                )}
              >
                {event.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedEventId && (
        <div className="reveal grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { ...stats[0], icon: Package },
            { ...stats[1], icon: Ticket },
            { ...stats[2], icon: ArrowUpDown },
            { ...stats[3], icon: ToggleRight },
          ].map((stat, index) => {
            const Icon = stat.icon

            return (
              <div key={index} className="card p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-text-muted">{stat.label}</span>
                  <Icon className="h-3.5 w-3.5 text-brand-acid" />
                </div>
                <div className="text-xl font-semibold text-text-primary">{stat.value}</div>
              </div>
            )
          })}
        </div>
      )}

      {loading && (
        <PageLoadingState title="Carregando ingressos" description="Montando tipos e lotes do evento selecionado." />
      )}

      {!loading && error && (
        <PageErrorState
          title="ERRO AO CARREGAR INGRESSOS"
          description={error}
          icon={<Ticket className="mb-3 h-10 w-10 text-status-error" />}
          action={
            <button onClick={() => void refreshTickets()} className="btn-primary">
              Tentar novamente
            </button>
          }
        />
      )}

      {!loading && !error && events.length === 0 && (
        <PageEmptyState title="NENHUM EVENTO" description="Crie um evento primeiro para adicionar ingressos." icon={<Ticket className="mb-3 h-10 w-10 text-text-muted" />} />
      )}

      {!loading && !error && events.length > 0 && allTicketTypes.length === 0 && (
        <PageEmptyState
          title="NENHUM TIPO DE INGRESSO"
          description="Adicione tipos de ingresso para comecar a vender."
          icon={<Ticket className="mb-3 h-10 w-10 text-text-muted" />}
          action={
            canManageTickets ? (
            <button onClick={openCreateTypeModal} className="btn-primary">
              + Novo tipo de ingresso
            </button>
            ) : undefined
          }
        />
      )}

      {!loading && !error && ticketTypes.length > 0 && (
        <div className="space-y-3">
          {ticketTypes.map((ticketType, index) => (
            <TicketTypeCard
              key={ticketType.id}
              ticketType={ticketType}
              index={index}
              expanded={expandedType === ticketType.id}
              onToggleExpand={() => setExpandedType(expandedType === ticketType.id ? null : ticketType.id)}
              onEdit={() => openEditTypeModal(ticketType)}
              onDelete={() => void deleteTicket(ticketType.id)}
              onToggleActive={() => void toggleTicketStatus(ticketType.id, ticketType.is_active)}
              onAddBatch={() => openCreateBatchModal(ticketType.id)}
              onEditBatch={(batch) => openEditBatchModal(ticketType.id, batch)}
              onDeleteBatch={(batch) => void deleteBatch(batch)}
              onToggleBatch={(batch) => void toggleBatchStatus(batch.id, batch.is_active)}
            />
          ))}
          <PaginationControls pagination={pagination} onPageChange={setPage} />
        </div>
      )}

      {showTypeForm && selectedEventId && (
        <TicketTypeModal
          eventId={selectedEventId}
          ticketId={editingTypeId}
          position={ticketTypes.length}
          onClose={closeTypeModal}
          onSaved={closeTypeModal}
        />
      )}

      {showBatchForm && selectedEventId && batchParentId && (
        <TicketBatchModal
          eventId={selectedEventId}
          ticketTypeId={batchParentId}
          batchId={editingBatchId}
          position={ticketTypes.find((ticketType) => ticketType.id === batchParentId)?.batches.length ?? 0}
          onClose={closeBatchModal}
          onSaved={closeBatchModal}
        />
      )}
    </div>
  )
}
