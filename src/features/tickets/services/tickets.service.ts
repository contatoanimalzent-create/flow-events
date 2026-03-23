import { supabase } from '@/lib/supabase'
import type { TicketBatch, TicketBatchFormData, TicketSalesEvent, TicketType, TicketTypeFormData, TicketTypeWithBatches } from '@/features/tickets/types'
import { assertTicketsResult, TicketsServiceError } from './tickets.errors'
import { buildDuplicateBatchPayload, buildDuplicateTicketTypePayload, buildTicketBatchPayload, buildTicketTypePayload, mapTicketCatalog } from './tickets.payloads'

export const ticketsService = {
  async listSaleEvents(organizationId: string): Promise<TicketSalesEvent[]> {
    const result = await supabase
      .from('events')
      .select('id,name,status')
      .eq('organization_id', organizationId)
      .in('status', ['draft', 'published', 'ongoing'])
      .order('starts_at', { ascending: true })

    assertTicketsResult(result)
    return (result.data as TicketSalesEvent[] | null) ?? []
  },

  async listTicketsByEvent(eventId: string): Promise<TicketTypeWithBatches[]> {
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
  },

  async getTicketById(ticketId: string): Promise<TicketType | null> {
    const result = await supabase.from('ticket_types').select('*').eq('id', ticketId).single()
    assertTicketsResult(result)
    return (result.data as TicketType | null) ?? null
  },

  async getBatchById(batchId: string): Promise<TicketBatch | null> {
    const result = await supabase.from('ticket_batches').select('*').eq('id', batchId).single()
    assertTicketsResult(result)
    return (result.data as TicketBatch | null) ?? null
  },

  async createTicket(eventId: string, form: TicketTypeFormData, position: number) {
    const result = await supabase.from('ticket_types').insert(buildTicketTypePayload(form, eventId, position))
    assertTicketsResult(result)
  },

  async updateTicket(ticketId: string, form: TicketTypeFormData, eventId: string, position: number) {
    const result = await supabase.from('ticket_types').update(buildTicketTypePayload(form, eventId, position)).eq('id', ticketId)
    assertTicketsResult(result)
  },

  async deleteTicket(ticketId: string) {
    const deleteBatchesResult = await supabase.from('ticket_batches').delete().eq('ticket_type_id', ticketId)
    assertTicketsResult(deleteBatchesResult)

    const deleteTypeResult = await supabase.from('ticket_types').delete().eq('id', ticketId)
    assertTicketsResult(deleteTypeResult)
  },

  async toggleTicketStatus(ticketId: string, currentStatus: boolean) {
    const result = await supabase.from('ticket_types').update({ is_active: !currentStatus }).eq('id', ticketId)
    assertTicketsResult(result)
  },

  async duplicateTicket(ticket: TicketTypeWithBatches) {
    const newPosition = ticket.position + 1
    const duplicateTypeResult = await supabase
      .from('ticket_types')
      .insert(buildDuplicateTicketTypePayload(ticket, newPosition))
      .select()
      .single()

    assertTicketsResult(duplicateTypeResult)

    const duplicatedType = duplicateTypeResult.data as TicketType | null

    if (!duplicatedType) {
      throw new TicketsServiceError('N\u00e3o foi poss\u00edvel duplicar o tipo de ingresso', 'ticket_duplicate_failed')
    }

    if (ticket.batches.length === 0) {
      return
    }

    const duplicateBatchesResult = await supabase
      .from('ticket_batches')
      .insert(ticket.batches.map((batch, index) => buildDuplicateBatchPayload(batch, ticket.event_id, duplicatedType.id, index)))

    assertTicketsResult(duplicateBatchesResult)
  },

  async createBatch(eventId: string, ticketTypeId: string, form: TicketBatchFormData, position: number) {
    const result = await supabase.from('ticket_batches').insert(buildTicketBatchPayload(form, eventId, ticketTypeId, position))
    assertTicketsResult(result)
  },

  async updateBatch(batchId: string, eventId: string, ticketTypeId: string, form: TicketBatchFormData, position: number) {
    const result = await supabase
      .from('ticket_batches')
      .update(buildTicketBatchPayload(form, eventId, ticketTypeId, position))
      .eq('id', batchId)

    assertTicketsResult(result)
  },

  async deleteBatch(batchId: string) {
    const result = await supabase.from('ticket_batches').delete().eq('id', batchId)
    assertTicketsResult(result)
  },

  async toggleBatchStatus(batchId: string, currentStatus: boolean) {
    const result = await supabase.from('ticket_batches').update({ is_active: !currentStatus }).eq('id', batchId)
    assertTicketsResult(result)
  },
}
