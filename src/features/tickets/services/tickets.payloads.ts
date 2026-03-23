import type { TicketBatch, TicketBatchFormData, TicketType, TicketTypeFormData, TicketTypeWithBatches } from '@/features/tickets/types'

function toOptionalString(value: string) {
  return value.trim() || null
}

function parseBenefits(benefits: string) {
  const items = benefits
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)

  return items.length > 0 ? items : null
}

export function formatBenefitsForForm(benefits?: string[] | null) {
  return benefits?.join('\n') ?? ''
}

export function buildTicketTypePayload(form: TicketTypeFormData, eventId: string, position: number) {
  return {
    event_id: eventId,
    name: form.name.trim(),
    description: toOptionalString(form.description),
    sector: toOptionalString(form.sector),
    color: form.color,
    is_nominal: form.is_nominal,
    is_transferable: form.is_transferable,
    max_per_order: parseInt(form.max_per_order, 10) || 5,
    benefits: parseBenefits(form.benefits),
    position,
  }
}

export function buildTicketBatchPayload(form: TicketBatchFormData, eventId: string, ticketTypeId: string, position: number) {
  return {
    event_id: eventId,
    ticket_type_id: ticketTypeId,
    name: form.name.trim(),
    price: parseFloat(form.price) || 0,
    quantity: parseInt(form.quantity, 10) || 0,
    starts_at: toOptionalString(form.starts_at),
    ends_at: toOptionalString(form.ends_at),
    auto_open_next: form.auto_open_next,
    position,
  }
}

export function buildDuplicateTicketTypePayload(ticket: TicketType, position: number) {
  return {
    event_id: ticket.event_id,
    name: `${ticket.name} (c\u00f3pia)`,
    description: ticket.description,
    benefits: ticket.benefits,
    sector: ticket.sector,
    color: ticket.color,
    is_transferable: ticket.is_transferable,
    is_nominal: ticket.is_nominal,
    max_per_order: ticket.max_per_order,
    position,
    is_active: false,
  }
}

export function buildDuplicateBatchPayload(batch: TicketBatch, eventId: string, ticketTypeId: string, position: number) {
  return {
    event_id: eventId,
    ticket_type_id: ticketTypeId,
    name: batch.name,
    price: batch.price,
    quantity: batch.quantity,
    sold_count: 0,
    reserved_count: 0,
    starts_at: batch.starts_at,
    ends_at: batch.ends_at,
    auto_open_next: batch.auto_open_next,
    is_active: false,
    position,
  }
}

export function mapTicketCatalog(ticketTypes: TicketType[], batches: TicketBatch[]): TicketTypeWithBatches[] {
  return ticketTypes.map((ticketType) => ({
    ...ticketType,
    batches: batches.filter((batch) => batch.ticket_type_id === ticketType.id).sort((left, right) => left.position - right.position),
  }))
}
