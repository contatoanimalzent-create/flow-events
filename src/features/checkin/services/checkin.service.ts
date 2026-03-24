import { supabase } from '@/lib/supabase'
import type { Checkin as CheckinRecord } from '@/lib/supabase'
import { createApiClient } from '@/shared/api'
import type {
  CheckInDigitalTicketInput,
  CheckinEventScope,
  CheckinGateRow,
  CheckinHistoryRow,
  CheckinLogResult,
  CheckinReasonCode,
  CheckinStats,
  CheckinSubmissionResult,
  CheckinTicketSnapshot,
  CheckinValidationResult,
  CommandCenterSnapshot,
  ValidateDigitalTicketInput,
} from '@/features/checkin/types'
import { assertCheckinResult, CheckinServiceError } from './checkin.errors'
import {
  buildGateCommandCenterSnapshot,
  buildCheckinStats,
  mapCheckinEventScope,
  mapCheckinGateRow,
  mapCheckinHistoryRow,
  mapCheckinTicketSnapshot,
  mapSubmissionResult,
  mapValidationResult,
} from './checkin.payloads'

const checkinApi = createApiClient('checkin')

const RPC_VALIDATE_ACCESS = 'validate_digital_ticket_access'
const RPC_PROCESS_CHECKIN = 'process_digital_ticket_checkin'

function isMissingRpc(error: { message?: string; code?: string } | null | undefined) {
  if (!error) {
    return false
  }

  return error.code === 'PGRST202' || error.message?.toLowerCase().includes('function') || error.message?.toLowerCase().includes('could not find')
}

function mapKnownBlockedState(status?: string | null): Pick<CheckinValidationResult, 'validation_status' | 'result' | 'reason_code' | 'can_check_in' | 'can_reenter' | 'already_checked_in'> {
  switch (status) {
    case 'cancelled':
      return { validation_status: 'cancelled', result: 'blocked', reason_code: 'ticket_cancelled', can_check_in: false, can_reenter: false, already_checked_in: false }
    case 'refunded':
      return { validation_status: 'cancelled', result: 'blocked', reason_code: 'ticket_refunded', can_check_in: false, can_reenter: false, already_checked_in: false }
    case 'expired':
      return { validation_status: 'expired', result: 'expired', reason_code: 'ticket_expired', can_check_in: false, can_reenter: false, already_checked_in: false }
    default:
      return { validation_status: 'blocked', result: 'blocked', reason_code: 'ticket_blocked', can_check_in: false, can_reenter: false, already_checked_in: false }
  }
}

function buildInvalidValidation(input: ValidateDigitalTicketInput): CheckinValidationResult {
  return {
    validation_status: 'invalid',
    result: 'invalid',
    reason_code: 'ticket_not_found',
    digital_ticket: null,
    gate_id: input.gateId ?? null,
    is_exit: Boolean(input.isExit),
    can_check_in: false,
    can_reenter: false,
    already_checked_in: false,
  }
}

async function getTicketByToken(eventId: string, qrToken: string): Promise<CheckinTicketSnapshot | null> {
  return checkinApi.query('get_ticket_by_token', async () => {
    const result = await supabase
      .from('digital_tickets')
      .select('id,order_id,order_item_id,event_id,ticket_number,qr_token,holder_name,holder_email,status,checked_in_at,is_vip,ticket_type:ticket_types(name)')
      .eq('event_id', eventId)
      .eq('qr_token', qrToken)
      .single()

    if (result.error && (result.error as { code?: string }).code === 'PGRST116') {
      return null
    }

    assertCheckinResult(result)
    return result.data ? mapCheckinTicketSnapshot(result.data as Record<string, unknown>) : null
  }, { eventId, qrToken })
}

async function insertCheckinAttempt(params: {
  eventId: string
  gateId?: string | null
  digitalTicketId?: string | null
  result: CheckinLogResult
  reasonCode?: CheckinReasonCode | null
  isExit?: boolean
  operatorId?: string | null
  deviceId?: string | null
}) {
  return checkinApi.mutation('insert_checkin_attempt', async () => {
    const payload: Partial<CheckinRecord> = {
      event_id: params.eventId,
      gate_id: params.gateId ?? null,
      digital_ticket_id: params.digitalTicketId ?? null,
      result: params.result,
      reason_code: params.reasonCode ?? null,
      is_exit: Boolean(params.isExit),
      checked_in_at: new Date().toISOString(),
      operator_id: params.operatorId ?? null,
      device_id: params.deviceId ?? null,
    }

    const resultInsert = await supabase.from('checkins').insert(payload).select('id,checked_in_at').single()
    assertCheckinResult(resultInsert)

    return {
      id: String((resultInsert.data as Record<string, unknown> | null)?.id ?? ''),
      checked_in_at: String((resultInsert.data as Record<string, unknown> | null)?.checked_in_at ?? new Date().toISOString()),
    }
  }, {
    eventId: params.eventId,
    gateId: params.gateId ?? null,
    digitalTicketId: params.digitalTicketId ?? null,
    result: params.result,
  })
}

async function updateTicketAfterCheckin(ticketId: string) {
  return checkinApi.mutation('update_ticket_after_checkin', async () => {
    const result = await supabase
      .from('digital_tickets')
      .update({
        status: 'used',
        checked_in_at: new Date().toISOString(),
      })
      .eq('id', ticketId)
      .select('id')

    assertCheckinResult(result)
  }, { ticketId })
}

async function getLatestHistoryByTicket(digitalTicketId: string) {
  return checkinApi.query('get_latest_history_by_ticket', async () => {
    const result = await supabase
      .from('checkins')
      .select('id,is_exit,result,checked_in_at')
      .eq('digital_ticket_id', digitalTicketId)
      .eq('result', 'success')
      .order('checked_in_at', { ascending: false })
      .limit(1)

    assertCheckinResult(result)
    return ((result.data as Array<Record<string, unknown>> | null) ?? [])[0] ?? null
  }, { digitalTicketId })
}

async function validateDigitalTicketFallback(input: ValidateDigitalTicketInput): Promise<CheckinValidationResult> {
  return checkinApi.query('validate_digital_ticket_fallback', async () => {
    const ticket = await getTicketByToken(input.eventId, input.qrToken.trim())

    if (!ticket) {
      return buildInvalidValidation(input)
    }

    if (input.isExit) {
      if (ticket.status === 'used') {
        const latestHistory = await getLatestHistoryByTicket(ticket.id)

        if (latestHistory && Boolean(latestHistory.is_exit)) {
          return {
            validation_status: 'already_used',
            result: 'already_used',
            reason_code: 'duplicate_exit',
            digital_ticket: ticket,
            gate_id: input.gateId ?? null,
            is_exit: true,
            can_check_in: false,
            can_reenter: false,
            already_checked_in: true,
          }
        }

        return {
          validation_status: 'valid',
          result: 'success',
          reason_code: 'ticket_valid',
          digital_ticket: ticket,
          gate_id: input.gateId ?? null,
          is_exit: true,
          can_check_in: true,
          can_reenter: false,
          already_checked_in: true,
        }
      }

      if (ticket.status === 'confirmed') {
        return {
          validation_status: 'blocked',
          result: 'blocked',
          reason_code: 'exit_without_entry',
          digital_ticket: ticket,
          gate_id: input.gateId ?? null,
          is_exit: true,
          can_check_in: false,
          can_reenter: false,
          already_checked_in: false,
        }
      }

      return {
        ...mapKnownBlockedState(ticket.status),
        digital_ticket: ticket,
        gate_id: input.gateId ?? null,
        is_exit: true,
      }
    }

    if (ticket.status === 'confirmed') {
      return {
        validation_status: 'valid',
        result: 'success',
        reason_code: 'ticket_valid',
        digital_ticket: ticket,
        gate_id: input.gateId ?? null,
        is_exit: false,
        can_check_in: true,
        can_reenter: false,
        already_checked_in: false,
      }
    }

    if (ticket.status === 'used') {
      const latestHistory = await getLatestHistoryByTicket(ticket.id)

      if (latestHistory && Boolean(latestHistory.is_exit)) {
        return {
          validation_status: 'reentry_allowed',
          result: 'success',
          reason_code: 'reentry_allowed',
          digital_ticket: ticket,
          gate_id: input.gateId ?? null,
          is_exit: false,
          can_check_in: true,
          can_reenter: true,
          already_checked_in: true,
        }
      }

      return {
        validation_status: 'already_used',
        result: 'already_used',
        reason_code: 'already_checked_in',
        digital_ticket: ticket,
        gate_id: input.gateId ?? null,
        is_exit: false,
        can_check_in: false,
        can_reenter: false,
        already_checked_in: true,
      }
    }

    return {
      ...mapKnownBlockedState(ticket.status),
      digital_ticket: ticket,
      gate_id: input.gateId ?? null,
      is_exit: false,
    }
  }, { eventId: input.eventId, gateId: input.gateId ?? null, isExit: Boolean(input.isExit) })
}

async function checkInDigitalTicketFallback(input: CheckInDigitalTicketInput): Promise<CheckinSubmissionResult> {
  return checkinApi.mutation('checkin_digital_ticket_fallback', async () => {
    const validation = await validateDigitalTicketFallback(input)
    const attempt = await insertCheckinAttempt({
      eventId: input.eventId,
      gateId: input.gateId,
      digitalTicketId: validation.digital_ticket?.id ?? null,
      result: validation.can_check_in ? 'success' : validation.result,
      reasonCode: validation.reason_code ?? null,
      isExit: input.isExit,
      operatorId: input.operatorId,
      deviceId: input.deviceId,
    })

    if (validation.can_check_in && validation.digital_ticket && !input.isExit) {
      await updateTicketAfterCheckin(validation.digital_ticket.id)
    }

    return {
      ...validation,
      checkin_id: attempt.id,
      checked_in_at: attempt.checked_in_at,
    }
  }, { eventId: input.eventId, gateId: input.gateId ?? null, isExit: Boolean(input.isExit) })
}

export const checkinService = {
  async listCheckinEvents(organizationId: string): Promise<CheckinEventScope[]> {
    return checkinApi.query('list_checkin_events', async () => {
      const result = await supabase
        .from('events')
        .select('id,name,total_capacity,sold_tickets')
        .eq('organization_id', organizationId)
        .in('status', ['published', 'ongoing'])
        .order('starts_at', { ascending: true })

      assertCheckinResult(result)
      return ((result.data as Array<Record<string, unknown>> | null) ?? []).map(mapCheckinEventScope)
    }, { organizationId })
  },

  async listGatesByEvent(eventId: string): Promise<CheckinGateRow[]> {
    return checkinApi.query('list_gates_by_event', async () => {
      const result = await supabase.from('gates').select('*').eq('event_id', eventId).order('name')
      assertCheckinResult(result)
      return ((result.data as Array<Record<string, unknown>> | null) ?? []).map(mapCheckinGateRow)
    }, { eventId })
  },

  async getCommandCenterSnapshot(eventId: string): Promise<CommandCenterSnapshot> {
    return checkinApi.query('get_command_center_snapshot', async () => {
      const [gates, checkinsResult, staffResult] = await Promise.all([
        this.listGatesByEvent(eventId),
        supabase
          .from('checkins')
          .select(
            'id,event_id,digital_ticket_id,result,reason_code,checked_in_at,is_exit,was_offline,gate_id,operator_id,device_id,digital_ticket:digital_tickets(ticket_number,holder_name,holder_email,is_vip,ticket_type:ticket_types(name)),gate:gates(name)',
          )
          .eq('event_id', eventId)
          .order('checked_in_at', { ascending: false })
          .limit(500),
        supabase
          .from('staff_members')
          .select('id,first_name,last_name,role_title,status,gate_id')
          .eq('event_id', eventId)
          .eq('is_active', true),
      ])

      assertCheckinResult(checkinsResult)
      assertCheckinResult(staffResult)

      return buildGateCommandCenterSnapshot({
        gates,
        checkins: ((checkinsResult.data as Array<Record<string, unknown>> | null) ?? []).map(mapCheckinHistoryRow),
        staff: (staffResult.data as Array<Record<string, unknown>> | null) ?? [],
      })
    }, { eventId })
  },

  async listRecentCheckinsByEvent(eventId: string, gateId?: string | null, limit = 100): Promise<CheckinHistoryRow[]> {
    return checkinApi.query('list_recent_checkins_by_event', async () => {
      let query = supabase
        .from('checkins')
        .select(
          'id,event_id,digital_ticket_id,result,reason_code,checked_in_at,is_exit,was_offline,gate_id,operator_id,device_id,digital_ticket:digital_tickets(ticket_number,holder_name,holder_email,is_vip,ticket_type:ticket_types(name)),gate:gates(name)',
        )
        .eq('event_id', eventId)
        .order('checked_in_at', { ascending: false })
        .limit(limit)

      if (gateId && gateId !== 'all') {
        query = query.eq('gate_id', gateId)
      }

      const result = await query
      assertCheckinResult(result)
      return ((result.data as Array<Record<string, unknown>> | null) ?? []).map(mapCheckinHistoryRow)
    }, { eventId, gateId: gateId ?? null, limit })
  },

  async getCheckinStatsByEvent(eventId: string): Promise<CheckinStats> {
    return checkinApi.query('get_checkin_stats_by_event', async () => {
      const result = await supabase.from('checkins').select('result,is_exit').eq('event_id', eventId)
      assertCheckinResult(result)
      return buildCheckinStats(((result.data as Array<{ result?: string; is_exit?: boolean }> | null) ?? []))
    }, { eventId })
  },

  async getCheckinHistoryByTicket(digitalTicketId: string): Promise<CheckinHistoryRow[]> {
    return checkinApi.query('get_checkin_history_by_ticket', async () => {
      const result = await supabase
        .from('checkins')
        .select(
          'id,event_id,digital_ticket_id,result,reason_code,checked_in_at,is_exit,was_offline,gate_id,operator_id,device_id,digital_ticket:digital_tickets(ticket_number,holder_name,holder_email,is_vip,ticket_type:ticket_types(name)),gate:gates(name)',
        )
        .eq('digital_ticket_id', digitalTicketId)
        .order('checked_in_at', { ascending: false })
        .limit(50)

      assertCheckinResult(result)
      return ((result.data as Array<Record<string, unknown>> | null) ?? []).map(mapCheckinHistoryRow)
    }, { digitalTicketId })
  },

  async allowReentryIfApplicable(digitalTicketId: string) {
    return checkinApi.query('allow_reentry_if_applicable', async () => {
      const latestHistory = await getLatestHistoryByTicket(digitalTicketId)
      return Boolean(latestHistory?.is_exit)
    }, { digitalTicketId })
  },

  async validateDigitalTicket(input: ValidateDigitalTicketInput): Promise<CheckinValidationResult> {
    return checkinApi.query('validate_digital_ticket', async () => {
      const rpcResult = await supabase.rpc(RPC_VALIDATE_ACCESS, {
        p_event_id: input.eventId,
        p_qr_token: input.qrToken.trim(),
        p_gate_id: input.gateId ?? null,
        p_is_exit: Boolean(input.isExit),
      })

      if (!rpcResult.error) {
        return mapValidationResult((rpcResult.data as Record<string, unknown> | null) ?? {})
      }

      if (!isMissingRpc(rpcResult.error)) {
        throw new CheckinServiceError(rpcResult.error.message, 'ticket_validation_failed')
      }

      return validateDigitalTicketFallback(input)
    }, { eventId: input.eventId, gateId: input.gateId ?? null, isExit: Boolean(input.isExit) })
  },

  async checkInDigitalTicket(input: CheckInDigitalTicketInput): Promise<CheckinSubmissionResult> {
    return checkinApi.mutation('checkin_digital_ticket', async () => {
      const rpcResult = await supabase.rpc(RPC_PROCESS_CHECKIN, {
        p_event_id: input.eventId,
        p_qr_token: input.qrToken.trim(),
        p_gate_id: input.gateId ?? null,
        p_operator_id: input.operatorId ?? null,
        p_device_id: input.deviceId ?? null,
        p_is_exit: Boolean(input.isExit),
      })

      if (!rpcResult.error) {
        return mapSubmissionResult((rpcResult.data as Record<string, unknown> | null) ?? {})
      }

      if (!isMissingRpc(rpcResult.error)) {
        throw new CheckinServiceError(rpcResult.error.message, 'checkin_processing_failed')
      }

      return checkInDigitalTicketFallback(input)
    }, { eventId: input.eventId, gateId: input.gateId ?? null, operatorId: input.operatorId ?? null, isExit: Boolean(input.isExit) })
  },
}
