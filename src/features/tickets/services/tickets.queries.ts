import { mutationOptions, queryOptions } from '@tanstack/react-query'
import type { TicketBatchFormData, TicketTypeFormData, TicketTypeWithBatches } from '@/features/tickets/types'
import { ticketsService } from './tickets.service'

interface CreateTicketVariables {
  eventId: string
  form: TicketTypeFormData
  position: number
}

interface UpdateTicketVariables {
  ticketId: string
  eventId: string
  form: TicketTypeFormData
  position: number
}

interface DeleteTicketVariables {
  ticketId: string
}

interface ToggleTicketStatusVariables {
  ticketId: string
  currentStatus: boolean
}

interface DuplicateTicketVariables {
  ticket: TicketTypeWithBatches
}

interface CreateBatchVariables {
  eventId: string
  ticketTypeId: string
  form: TicketBatchFormData
  position: number
}

interface UpdateBatchVariables {
  batchId: string
  eventId: string
  ticketTypeId: string
  form: TicketBatchFormData
  position: number
}

interface DeleteBatchVariables {
  batchId: string
}

interface ToggleBatchStatusVariables {
  batchId: string
  currentStatus: boolean
}

export const ticketKeys = {
  all: ['tickets'] as const,
  events: (organizationId: string) => [...ticketKeys.all, 'events', organizationId] as const,
  byEvent: (eventId: string) => ['events', eventId, 'tickets'] as const,
  details: () => [...ticketKeys.all, 'detail'] as const,
  detail: (ticketId: string) => [...ticketKeys.details(), ticketId] as const,
  batchDetails: () => [...ticketKeys.all, 'batch-detail'] as const,
  batchDetail: (batchId: string) => [...ticketKeys.batchDetails(), batchId] as const,
  actions: () => [...ticketKeys.all, 'actions'] as const,
}

export const ticketQueries = {
  saleEvents: (organizationId: string) =>
    queryOptions({
      queryKey: ticketKeys.events(organizationId),
      queryFn: () => ticketsService.listSaleEvents(organizationId),
    }),
  listByEvent: (eventId: string) =>
    queryOptions({
      queryKey: ticketKeys.byEvent(eventId),
      queryFn: () => ticketsService.listTicketsByEvent(eventId),
    }),
  detail: (ticketId: string) =>
    queryOptions({
      queryKey: ticketKeys.detail(ticketId),
      queryFn: () => ticketsService.getTicketById(ticketId),
    }),
  batchDetail: (batchId: string) =>
    queryOptions({
      queryKey: ticketKeys.batchDetail(batchId),
      queryFn: () => ticketsService.getBatchById(batchId),
    }),
}

export const ticketMutations = {
  create: () =>
    mutationOptions({
      mutationKey: [...ticketKeys.actions(), 'create'] as const,
      mutationFn: ({ eventId, form, position }: CreateTicketVariables) => ticketsService.createTicket(eventId, form, position),
    }),
  update: () =>
    mutationOptions({
      mutationKey: [...ticketKeys.actions(), 'update'] as const,
      mutationFn: ({ ticketId, eventId, form, position }: UpdateTicketVariables) =>
        ticketsService.updateTicket(ticketId, form, eventId, position),
    }),
  remove: () =>
    mutationOptions({
      mutationKey: [...ticketKeys.actions(), 'delete'] as const,
      mutationFn: ({ ticketId }: DeleteTicketVariables) => ticketsService.deleteTicket(ticketId),
    }),
  toggleStatus: () =>
    mutationOptions({
      mutationKey: [...ticketKeys.actions(), 'toggle-status'] as const,
      mutationFn: ({ ticketId, currentStatus }: ToggleTicketStatusVariables) =>
        ticketsService.toggleTicketStatus(ticketId, currentStatus),
    }),
  duplicate: () =>
    mutationOptions({
      mutationKey: [...ticketKeys.actions(), 'duplicate'] as const,
      mutationFn: ({ ticket }: DuplicateTicketVariables) => ticketsService.duplicateTicket(ticket),
    }),
  createBatch: () =>
    mutationOptions({
      mutationKey: [...ticketKeys.actions(), 'create-batch'] as const,
      mutationFn: ({ eventId, ticketTypeId, form, position }: CreateBatchVariables) =>
        ticketsService.createBatch(eventId, ticketTypeId, form, position),
    }),
  updateBatch: () =>
    mutationOptions({
      mutationKey: [...ticketKeys.actions(), 'update-batch'] as const,
      mutationFn: ({ batchId, eventId, ticketTypeId, form, position }: UpdateBatchVariables) =>
        ticketsService.updateBatch(batchId, eventId, ticketTypeId, form, position),
    }),
  removeBatch: () =>
    mutationOptions({
      mutationKey: [...ticketKeys.actions(), 'delete-batch'] as const,
      mutationFn: ({ batchId }: DeleteBatchVariables) => ticketsService.deleteBatch(batchId),
    }),
  toggleBatchStatus: () =>
    mutationOptions({
      mutationKey: [...ticketKeys.actions(), 'toggle-batch-status'] as const,
      mutationFn: ({ batchId, currentStatus }: ToggleBatchStatusVariables) =>
        ticketsService.toggleBatchStatus(batchId, currentStatus),
    }),
}
