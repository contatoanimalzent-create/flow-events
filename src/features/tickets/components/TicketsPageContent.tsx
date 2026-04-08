import { useState } from 'react'
import { ArrowUpDown, Loader2, Package, Plus, Ticket, ToggleRight } from 'lucide-react'
import { useAuthStore } from '@/features/auth'
import { useAccessControl } from '@/features/access-control'
import { useTicketActions, useTicketsList } from '@/features/tickets/hooks'
import { TicketBatchModal, TicketTypeModal } from '@/features/tickets/modals'
import type { TicketBatch, TicketTypeWithBatches } from '@/features/tickets/types'
import { ActionConfirmationDialog, PageEmptyState, PageErrorState, PageLoadingState, PaginationControls } from '@/shared/components'
import { useAppLocale } from '@/shared/i18n/app-locale'
import { cn } from '@/shared/lib'
import { TicketTypeCard } from './TicketTypeCard'

export function TicketsPageContent() {
  const { t } = useAppLocale()
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
  const [pendingDeleteTicket, setPendingDeleteTicket] = useState<TicketTypeWithBatches | null>(null)
  const [pendingDeleteBatch, setPendingDeleteBatch] = useState<TicketBatch | null>(null)

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <div className="admin-eyebrow">Inventory architecture</div>
          <h1 className="admin-title">
            {t('Tickets', 'Ingressos')}<span className="admin-title-accent">.</span>
          </h1>
          <p className="admin-subtitle">{t('Ticket types and sales releases.', 'Tipos de ingresso e lotes de venda.')}</p>
        </div>
        {canManageTickets ? (
          <button onClick={openCreateTypeModal} disabled={!selectedEventId} className="btn-primary flex items-center gap-2">
            <Plus className="h-4 w-4" /> {t('New type', 'Novo tipo')}
          </button>
        ) : null}
      </div>

      {events.length > 1 && (
        <div className="admin-filterbar">
          <span className="text-xs font-mono text-text-muted">{t('EVENT', 'EVENTO')}:</span>
          <div className="flex flex-wrap items-center gap-2">
            {events.map((event) => (
              <button
                key={event.id}
                onClick={() => setSelectedEventId(event.id)}
                className={cn(
                  'rounded-sm px-3 py-1.5 text-xs font-medium transition-all',
                  selectedEventId === event.id
                    ? 'bg-brand-acid text-white'
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
        <PageLoadingState title={t('Loading tickets', 'Carregando ingressos')} description={t('Building ticket types and releases for the selected event.', 'Montando tipos e lotes do evento selecionado.')} />
      )}

      {!loading && error && (
        <PageErrorState
          title={t('Unable to load tickets', 'Erro ao carregar ingressos')}
          description={error}
          icon={<Ticket className="mb-3 h-10 w-10 text-status-error" />}
          action={
            <button onClick={() => void refreshTickets()} className="btn-primary">
              {t('Try again', 'Tentar novamente')}
            </button>
          }
        />
      )}

      {!loading && !error && events.length === 0 && (
        <PageEmptyState title={t('No events', 'Nenhum evento')} description={t('Create an event first to add tickets.', 'Crie um evento primeiro para adicionar ingressos.')} icon={<Ticket className="mb-3 h-10 w-10 text-text-muted" />} />
      )}

      {!loading && !error && events.length > 0 && allTicketTypes.length === 0 && (
        <PageEmptyState
          title={t('No ticket types', 'Nenhum tipo de ingresso')}
          description={t('Add ticket types to start selling.', 'Adicione tipos de ingresso para comecar a vender.')}
          icon={<Ticket className="mb-3 h-10 w-10 text-text-muted" />}
          action={
            canManageTickets ? (
            <button onClick={openCreateTypeModal} className="btn-primary">
              + {t('New ticket type', 'Novo tipo de ingresso')}
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
              onDelete={() => setPendingDeleteTicket(ticketType)}
              onToggleActive={() => void toggleTicketStatus(ticketType.id, ticketType.is_active)}
              onAddBatch={() => openCreateBatchModal(ticketType.id)}
              onEditBatch={(batch) => openEditBatchModal(ticketType.id, batch)}
              onDeleteBatch={(batch) => setPendingDeleteBatch(batch)}
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

      <ActionConfirmationDialog
        open={Boolean(pendingDeleteTicket)}
        title={t('Remove ticket type', 'Remover tipo de ingresso')}
        description={pendingDeleteTicket ? t(`The type "${pendingDeleteTicket.name}" and all linked releases will be removed.`, `O tipo "${pendingDeleteTicket.name}" e todos os lotes vinculados serao removidos.`) : undefined}
        impact={t('This deletion changes the commercial structure of the ticket and removes its setup from the administrative catalog.', 'A exclusao afeta a arquitetura comercial desse ingresso e remove sua configuracao do catalogo administrativo.')}
        confirmLabel={t('Delete type and releases', 'Excluir tipo e lotes')}
        onCancel={() => setPendingDeleteTicket(null)}
        onConfirm={async () => {
          if (!pendingDeleteTicket) {
            return
          }

          await deleteTicket(pendingDeleteTicket.id)
          setPendingDeleteTicket(null)
        }}
      />

      <ActionConfirmationDialog
        open={Boolean(pendingDeleteBatch)}
        title={t('Remove release', 'Remover lote')}
        description={pendingDeleteBatch ? t(`The release "${pendingDeleteBatch.name}" will be removed from the sales structure.`, `O lote "${pendingDeleteBatch.name}" sera retirado da estrutura de vendas.`) : undefined}
        impact={t('Use this action only when the release should no longer exist in the commercial planning of the ticket.', 'Use esta acao apenas quando o lote nao deve mais existir no planejamento comercial do ingresso.')}
        confirmLabel={t('Delete release', 'Excluir lote')}
        onCancel={() => setPendingDeleteBatch(null)}
        onConfirm={async () => {
          if (!pendingDeleteBatch) {
            return
          }

          await deleteBatch(pendingDeleteBatch)
          setPendingDeleteBatch(null)
        }}
      />
    </div>
  )
}
