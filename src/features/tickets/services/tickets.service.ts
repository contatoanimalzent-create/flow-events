import { supabase } from '@/lib/supabase'
import { createApiClient } from '@/shared/api'
import type { TicketBatch, TicketBatchFormData, TicketSalesEvent, TicketType, TicketTypeFormData, TicketTypeWithBatches } from '@/features/tickets/types'
import { assertTicketsResult, TicketsServiceError } from './tickets.errors'
import { buildDuplicateBatchPayload, buildDuplicateTicketTypePayload, buildTicketBatchPayload, buildTicketTypePayload, mapTicketCatalog } from './tickets.payloads'

const ticketsApi = createApiClient('tickets')

export const ticketsService = {
  async listSaleEvents(organizationId: string): Promise<TicketSalesEvent[]> {
    return ticketsApi.request('list_sale_events', async () => {
      const result = await supabase
        .from('events')
        .select('id,name,status')
        .eq('organization_id', organizationId)
        .in('status', ['draft', 'published', 'ongoing'])
        .order('starts_at', { ascending: true })

      assertTicketsResult(result)
      return (result.data as TicketSalesEvent[] | null) ?? []
    }, { organizationId })
  },

  async listTicketsByEvent(eventId: string): Promise<TicketTypeWithBatches[]> {
    return ticketsApi.request('list_tickets_by_event', async () => {
      const [ticketTypesResult, batchesResult] = await Promise.all([
        supabase.from('ticket_types').select('*').eq('event_id', eventId).order('position'),
        supabase.from('ticket_batches').select('*').eq('event_id', eventId).order('position'),
      ])

      assertTicketsResult(ticketTypesResult)
      assertTicketsResult(batchesResult)

      return mapTicketCatalog(
        (ticketTypesResult.data as TicketType[] | null) ?? [],
        (batchesResult.data as TicketBatch[] | null) ?? [],
      )
    }, { eventId })
  },

  async getTicketById(ticketId: string): Promise<TicketType | null> {
    return ticketsApi.request('get_ticket_by_id', async () => {
      const result = await supabase.from('ticket_types').select('*').eq('id', ticketId).single()
      assertTicketsResult(result)
      return (result.data as TicketType | null) ?? null
    }, { ticketId })
  },

  async getBatchById(batchId: string): Promise<TicketBatch | null> {
    return ticketsApi.request('get_batch_by_id', async () => {
      const result = await supabase.from('ticket_batches').select('*').eq('id', batchId).single()
      assertTicketsResult(result)
      return (result.data as TicketBatch | null) ?? null
    }, { batchId })
  },

  async createTicket(eventId: string, form: TicketTypeFormData, position: number) {
    return ticketsApi.request('create_ticket', async () => {
      const result = await supabase.from('ticket_types').insert(buildTicketTypePayload(form, eventId, position))
      assertTicketsResult(result)
    }, { eventId, position })
  },

  async updateTicket(ticketId: string, form: TicketTypeFormData, eventId: string, position: number) {
    return ticketsApi.request('update_ticket', async () => {
      const result = await supabase.from('ticket_types').update(buildTicketTypePayload(form, eventId, position)).eq('id', ticketId)
      assertTicketsResult(result)
    }, { ticketId, eventId, position })
  },

  async deleteTicket(ticketId: string) {
    return ticketsApi.request('delete_ticket', async () => {
      const deleteBatchesResult = await supabase.from('ticket_batches').delete().eq('ticket_type_id', ticketId)
      assertTicketsResult(deleteBatchesResult)

      const deleteTypeResult = await supabase.from('ticket_types').delete().eq('id', ticketId)
      assertTicketsResult(deleteTypeResult)
    }, { ticketId })
  },

  async toggleTicketStatus(ticketId: string, currentStatus: boolean) {
    return ticketsApi.request('toggle_ticket_status', async () => {
      const result = await supabase.from('ticket_types').update({ is_active: !currentStatus }).eq('id', ticketId)
      assertTicketsResult(result)
    }, { ticketId, currentStatus })
  },

  async duplicateTicket(ticket: TicketTypeWithBatches) {
    return ticketsApi.request('duplicate_ticket', async () => {
      const newPosition = ticket.position + 1
      const duplicateTypeResult = await supabase
        .from('ticket_types')
        .insert(buildDuplicateTicketTypePayload(ticket, newPosition))
        .select()
        .single()

      assertTicketsResult(duplicateTypeResult)

      const duplicatedType = duplicateTypeResult.data as TicketType | null

      if (!duplicatedType) {
        throw new TicketsServiceError('Nao foi possivel duplicar o tipo de ingresso', 'ticket_duplicate_failed')
      }

      if (ticket.batches.length === 0) {
        return
      }

      const duplicateBatchesResult = await supabase
        .from('ticket_batches')
        .insert(ticket.batches.map((batch, index) => buildDuplicateBatchPayload(batch, ticket.event_id, duplicatedType.id, index)))

      assertTicketsResult(duplicateBatchesResult)
    }, { ticketId: ticket.id, eventId: ticket.event_id })
  },

  async createBatch(eventId: string, ticketTypeId: string, form: TicketBatchFormData, position: number) {
    return ticketsApi.request('create_batch', async () => {
      const result = await supabase.from('ticket_batches').insert(buildTicketBatchPayload(form, eventId, ticketTypeId, position))
      assertTicketsResult(result)
    }, { eventId, ticketTypeId, position })
  },

  async updateBatch(batchId: string, eventId: string, ticketTypeId: string, form: TicketBatchFormData, position: number) {
    return ticketsApi.request('update_batch', async () => {
      const result = await supabase
        .from('ticket_batches')
        .update(buildTicketBatchPayload(form, eventId, ticketTypeId, position))
        .eq('id', batchId)

      assertTicketsResult(result)
    }, { batchId, eventId, ticketTypeId, position })
  },

  async deleteBatch(batchId: string) {
    return ticketsApi.request('delete_batch', async () => {
      const result = await supabase.from('ticket_batches').delete().eq('id', batchId)
      assertTicketsResult(result)
    }, { batchId })
  },

  async toggleBatchStatus(batchId: string, currentStatus: boolean) {
    return ticketsApi.request('toggle_batch_status', async () => {
      const result = await supabase.from('ticket_batches').update({ is_active: !currentStatus }).eq('id', batchId)
      assertTicketsResult(result)
    }, { batchId, currentStatus })
  },
}
