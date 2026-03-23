import { ArrowUpDown, Loader2, Package, Plus, Ticket, ToggleRight } from 'lucide-react'
import { useAuthStore } from '@/features/auth'
import { useTicketActions, useTicketsList } from '@/features/tickets/hooks'
import { TicketBatchModal, TicketTypeModal } from '@/features/tickets/modals'
import { cn } from '@/shared/lib'
import { TicketTypeCard } from './TicketTypeCard'

export function TicketsPageContent() {
  const organization = useAuthStore((state) => state.organization)
  const {
    events,
    selectedEventId,
    setSelectedEventId,
    ticketTypes,
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
    <div className="mx-auto max-w-[1200px] space-y-5 p-6">
      <div className="reveal flex items-start justify-between">
        <div>
          <h1 className="font-display text-4xl leading-none tracking-wide text-text-primary">
            INGRESSOS<span className="text-brand-acid">.</span>
          </h1>
          <p className="mt-1 text-xs font-mono tracking-wider text-text-muted">Tipos de ingresso e lotes de venda</p>
        </div>
        <button onClick={openCreateTypeModal} disabled={!selectedEventId} className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> Novo tipo
        </button>
      </div>

      {events.length > 1 && (
        <div className="reveal flex items-center gap-3">
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
        <div className="reveal grid grid-cols-2 gap-3 md:grid-cols-4">
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
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-brand-acid" />
        </div>
      )}

      {!loading && error && (
        <div className="card flex flex-col items-center justify-center p-16 text-center">
          <Ticket className="mb-3 h-10 w-10 text-status-error" />
          <div className="mb-1 font-display text-2xl text-text-primary">ERRO AO CARREGAR INGRESSOS</div>
          <p className="mb-5 max-w-md text-sm text-text-muted">{error}</p>
          <button onClick={() => void refreshTickets()} className="btn-primary">
            Tentar novamente
          </button>
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <div className="card flex flex-col items-center justify-center p-16 text-center">
          <Ticket className="mb-3 h-10 w-10 text-text-muted" />
          <div className="mb-1 font-display text-2xl text-text-primary">NENHUM EVENTO</div>
          <p className="text-sm text-text-muted">Crie um evento primeiro para adicionar ingressos</p>
        </div>
      )}

      {!loading && !error && events.length > 0 && ticketTypes.length === 0 && (
        <div className="card flex flex-col items-center justify-center p-16 text-center">
          <Ticket className="mb-3 h-10 w-10 text-text-muted" />
          <div className="mb-1 font-display text-2xl text-text-primary">NENHUM TIPO DE INGRESSO</div>
          <p className="mb-5 text-sm text-text-muted">Adicione tipos de ingresso para come\u00e7ar a vender</p>
          <button onClick={openCreateTypeModal} className="btn-primary">
            + Novo tipo de ingresso
          </button>
        </div>
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
