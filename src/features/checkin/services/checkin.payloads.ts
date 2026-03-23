import type {
  CheckinEventScope,
  CheckinGateRow,
  CheckinHistoryRow,
  CheckinLogResult,
  CheckinReasonCode,
  CheckinStats,
  CheckinSubmissionResult,
  CheckinTicketSnapshot,
  CheckinValidationResult,
  CheckinValidationStatus,
  DigitalTicketAccessStatus,
} from '@/features/checkin/types'

function nowIso() {
  return new Date().toISOString()
}

function mapTicketTypeName(row: Record<string, unknown>) {
  const ticketType = row.ticket_type as { name?: string } | null | undefined
  return ticketType?.name ? { name: ticketType.name } : undefined
}

export function mapCheckinEventScope(row: Record<string, unknown>): CheckinEventScope {
  return {
    id: String(row.id),
    name: String(row.name ?? ''),
    total_capacity: Number(row.total_capacity ?? 0),
    sold_tickets: Number(row.sold_tickets ?? 0),
  }
}

export function mapCheckinGateRow(row: Record<string, unknown>): CheckinGateRow {
  return {
    id: String(row.id),
    event_id: (row.event_id as string | null | undefined) ?? null,
    name: String(row.name ?? ''),
    is_entrance: Boolean(row.is_entrance),
    is_exit: Boolean(row.is_exit),
    is_active: Boolean(row.is_active),
    device_count: Number(row.device_count ?? 0),
  }
}

export function mapCheckinTicketSnapshot(row: Record<string, unknown>): CheckinTicketSnapshot {
  return {
    id: String(row.id),
    order_id: String(row.order_id ?? ''),
    order_item_id: (row.order_item_id as string | null | undefined) ?? null,
    event_id: String(row.event_id),
    ticket_number: String(row.ticket_number ?? ''),
    qr_token: String(row.qr_token ?? ''),
    holder_name: (row.holder_name as string | null | undefined) ?? null,
    holder_email: (row.holder_email as string | null | undefined) ?? null,
    status: ((row.status as DigitalTicketAccessStatus | undefined) ?? 'confirmed'),
    checked_in_at: (row.checked_in_at as string | null | undefined) ?? null,
    is_vip: Boolean(row.is_vip),
    ticket_type: mapTicketTypeName(row),
  }
}

export function mapCheckinHistoryRow(row: Record<string, unknown>): CheckinHistoryRow {
  const digitalTicket = row.digital_ticket as Record<string, unknown> | null | undefined
  const gate = row.gate as { name?: string } | null | undefined
  const nestedTicketType = digitalTicket?.ticket_type as { name?: string } | null | undefined

  return {
    id: String(row.id),
    event_id: String(row.event_id ?? ''),
    digital_ticket_id: (row.digital_ticket_id as string | null | undefined) ?? null,
    gate_id: (row.gate_id as string | null | undefined) ?? null,
    result: ((row.result as CheckinLogResult | undefined) ?? 'invalid'),
    reason_code: (row.reason_code as CheckinReasonCode | null | undefined) ?? null,
    checked_in_at: String(row.checked_in_at ?? nowIso()),
    is_exit: Boolean(row.is_exit),
    was_offline: Boolean(row.was_offline),
    operator_id: (row.operator_id as string | null | undefined) ?? null,
    device_id: (row.device_id as string | null | undefined) ?? null,
    gate: gate?.name ? { name: gate.name } : undefined,
    digital_ticket: digitalTicket
      ? {
          ticket_number: String(digitalTicket.ticket_number ?? ''),
          holder_name: (digitalTicket.holder_name as string | null | undefined) ?? null,
          holder_email: (digitalTicket.holder_email as string | null | undefined) ?? null,
          is_vip: Boolean(digitalTicket.is_vip),
          ticket_type: nestedTicketType?.name ? { name: nestedTicketType.name } : undefined,
        }
      : undefined,
  }
}

export function buildCheckinStats(rows: Array<{ result?: string; is_exit?: boolean }>): CheckinStats {
  const totalIn = rows.filter((row) => row.result === 'success' && !row.is_exit).length
  const totalOut = rows.filter((row) => row.result === 'success' && row.is_exit).length
  const totalAttempts = rows.length
  const successCount = rows.filter((row) => row.result === 'success').length
  const invalidAttempts = rows.filter((row) => row.result !== 'success').length

  return {
    totalIn,
    totalOut,
    currentOccupancy: Math.max(0, totalIn - totalOut),
    successRate: totalAttempts > 0 ? Math.round((successCount / totalAttempts) * 100) : 0,
    invalidAttempts,
  }
}

export function mapValidationResult(raw: Record<string, unknown>): CheckinValidationResult {
  const digitalTicket = raw.digital_ticket as Record<string, unknown> | null | undefined

  return {
    validation_status: ((raw.validation_status as CheckinValidationStatus | undefined) ?? 'invalid'),
    result: ((raw.result as CheckinLogResult | undefined) ?? 'invalid'),
    reason_code: (raw.reason_code as CheckinReasonCode | null | undefined) ?? null,
    digital_ticket: digitalTicket ? mapCheckinTicketSnapshot(digitalTicket) : null,
    gate_id: (raw.gate_id as string | null | undefined) ?? null,
    is_exit: Boolean(raw.is_exit),
    can_check_in: Boolean(raw.can_check_in),
    can_reenter: Boolean(raw.can_reenter),
    already_checked_in: Boolean(raw.already_checked_in),
  }
}

export function mapSubmissionResult(raw: Record<string, unknown>): CheckinSubmissionResult {
  return {
    ...mapValidationResult(raw),
    checkin_id: (raw.checkin_id as string | null | undefined) ?? null,
    checked_in_at: (raw.checked_in_at as string | null | undefined) ?? null,
  }
}
