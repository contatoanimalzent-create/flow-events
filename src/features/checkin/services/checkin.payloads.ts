import type {
  CommandCenterAlert,
  CommandCenterSnapshot,
  CheckinEventScope,
  CheckinGateRow,
  CheckinHistoryRow,
  GateCommandCenterSummary,
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
    gate_type: ((row.gate_type as CheckinGateRow['gate_type'] | undefined) ?? 'mixed'),
    throughput_per_hour: Number(row.throughput_per_hour ?? 0),
    operational_status: ((row.operational_status as CheckinGateRow['operational_status'] | undefined) ?? 'ready'),
    supervisor_staff_id: (row.supervisor_staff_id as string | null | undefined) ?? null,
    notes: (row.notes as string | null | undefined) ?? null,
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

export function buildGateCommandCenterSnapshot(params: {
  gates: CheckinGateRow[]
  checkins: CheckinHistoryRow[]
  staff: Array<Record<string, unknown>>
}): CommandCenterSnapshot {
  const { gates, checkins, staff } = params
  const fifteenMinutesAgo = Date.now() - 15 * 60_000
  const oneHourAgo = Date.now() - 60 * 60_000

  const gateSummaries: GateCommandCenterSummary[] = gates.map((gate) => {
    const gateStaff = staff.filter((member) => (member.gate_id as string | null | undefined) === gate.id)
    const recentGateCheckins = checkins.filter((checkin) => checkin.gate_id === gate.id)
    const lastHourCheckins = recentGateCheckins.filter((checkin) => new Date(checkin.checked_in_at).getTime() >= oneHourAgo)
    const lastFifteenMinutes = recentGateCheckins.filter((checkin) => new Date(checkin.checked_in_at).getTime() >= fifteenMinutesAgo)
    const recentSuccessCount = lastHourCheckins.filter((checkin) => checkin.result === 'success' && !checkin.is_exit).length
    const recentInvalidAttempts = lastFifteenMinutes.filter((checkin) => checkin.result !== 'success').length
    const activeStaffCount = gateStaff.filter((member) => String(member.status ?? '') === 'active').length
    const lastActivityAt = recentGateCheckins[0]?.checked_in_at ?? null

    const alertLevel: GateCommandCenterSummary['alert_level'] =
      !gate.is_active || gate.operational_status === 'offline'
        ? 'critical'
        : recentInvalidAttempts >= 3 || activeStaffCount === 0
          ? 'warning'
          : 'normal'

    return {
      gate,
      assigned_staff_count: gateStaff.length,
      active_staff_count: activeStaffCount,
      recent_success_count: recentSuccessCount,
      recent_invalid_attempts: recentInvalidAttempts,
      last_activity_at: lastActivityAt,
      alert_level: alertLevel,
      assigned_staff: gateStaff.map((member) => ({
        id: String(member.id),
        name: `${String(member.first_name ?? '')} ${String(member.last_name ?? '')}`.trim(),
        role_title: (member.role_title as string | null | undefined) ?? null,
        status: String(member.status ?? 'invited'),
      })),
    }
  })

  const alerts: CommandCenterAlert[] = gateSummaries.flatMap((summary) => {
    const result: CommandCenterAlert[] = []

    if (!summary.gate.is_active || summary.gate.operational_status === 'offline') {
      result.push({
        id: `gate-offline-${summary.gate.id}`,
        severity: 'critical',
        title: `Portaria ${summary.gate.name} indisponível`,
        description: 'A portaria está inativa ou offline e precisa de atenção imediata.',
        gate_id: summary.gate.id,
      })
    }

    if (summary.active_staff_count === 0) {
      result.push({
        id: `gate-staff-${summary.gate.id}`,
        severity: 'warning',
        title: `Sem operador em ${summary.gate.name}`,
        description: 'Não há membro de equipe em campo vinculado a está portaria.',
        gate_id: summary.gate.id,
      })
    }

    if (summary.recent_invalid_attempts >= 3) {
      result.push({
        id: `gate-invalid-${summary.gate.id}`,
        severity: 'warning',
        title: `Tentativas invalidas em ${summary.gate.name}`,
        description: `${summary.recent_invalid_attempts} tentativas invalidas nos últimos 15 minutos.`,
        gate_id: summary.gate.id,
      })
    }

    return result
  })

  return {
    gateSummaries,
    alerts,
  }
}
