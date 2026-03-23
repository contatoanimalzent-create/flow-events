export type CheckinLogResult = 'success' | 'already_used' | 'invalid' | 'expired' | 'blocked'
export type GateType = 'entry' | 'exit' | 'mixed'
export type GateOperationalStatus = 'ready' | 'attention' | 'paused' | 'offline'

export type CheckinValidationStatus =
  | 'valid'
  | 'already_used'
  | 'cancelled'
  | 'expired'
  | 'invalid'
  | 'blocked'
  | 'reentry_allowed'

export type CheckinReasonCode =
  | 'ticket_valid'
  | 'ticket_not_found'
  | 'ticket_cancelled'
  | 'ticket_refunded'
  | 'ticket_expired'
  | 'ticket_blocked'
  | 'already_checked_in'
  | 'duplicate_exit'
  | 'exit_without_entry'
  | 'reentry_allowed'

export type DigitalTicketAccessStatus = 'pending' | 'confirmed' | 'cancelled' | 'refunded' | 'used' | 'transferred' | 'expired'

export interface CheckinEventScope {
  id: string
  name: string
  total_capacity: number
  sold_tickets: number
}

export interface CheckinGateRow {
  id: string
  event_id?: string | null
  name: string
  is_entrance: boolean
  is_exit: boolean
  is_active: boolean
  device_count: number
  gate_type: GateType
  throughput_per_hour: number
  operational_status: GateOperationalStatus
  supervisor_staff_id?: string | null
  notes?: string | null
}

export interface CheckinTicketSnapshot {
  id: string
  order_id: string
  order_item_id?: string | null
  event_id: string
  ticket_number: string
  qr_token: string
  holder_name?: string | null
  holder_email?: string | null
  status: DigitalTicketAccessStatus
  checked_in_at?: string | null
  is_vip: boolean
  ticket_type?: {
    name: string
  }
}

export interface CheckinHistoryRow {
  id: string
  event_id: string
  digital_ticket_id?: string | null
  gate_id?: string | null
  result: CheckinLogResult
  reason_code?: CheckinReasonCode | null
  checked_in_at: string
  is_exit: boolean
  was_offline: boolean
  operator_id?: string | null
  device_id?: string | null
  gate?: {
    name: string
  }
  digital_ticket?: {
    ticket_number: string
    holder_name?: string | null
    holder_email?: string | null
    is_vip: boolean
    ticket_type?: {
      name: string
    }
  }
}

export interface CheckinStats {
  totalIn: number
  totalOut: number
  currentOccupancy: number
  successRate: number
  invalidAttempts: number
}

export interface GateCommandCenterSummary {
  gate: CheckinGateRow
  assigned_staff_count: number
  active_staff_count: number
  recent_success_count: number
  recent_invalid_attempts: number
  last_activity_at?: string | null
  alert_level: 'normal' | 'warning' | 'critical'
  assigned_staff: Array<{
    id: string
    name: string
    role_title?: string | null
    status: string
  }>
}

export interface CommandCenterAlert {
  id: string
  severity: 'warning' | 'critical'
  title: string
  description: string
  gate_id?: string | null
}

export interface CommandCenterSnapshot {
  gateSummaries: GateCommandCenterSummary[]
  alerts: CommandCenterAlert[]
}

export interface ValidateDigitalTicketInput {
  eventId: string
  qrToken: string
  gateId?: string | null
  isExit?: boolean
}

export interface CheckInDigitalTicketInput extends ValidateDigitalTicketInput {
  operatorId?: string | null
  deviceId?: string | null
}

export interface CheckinValidationResult {
  validation_status: CheckinValidationStatus
  result: CheckinLogResult
  reason_code?: CheckinReasonCode | null
  digital_ticket: CheckinTicketSnapshot | null
  gate_id?: string | null
  is_exit: boolean
  can_check_in: boolean
  can_reenter: boolean
  already_checked_in: boolean
}

export interface CheckinSubmissionResult extends CheckinValidationResult {
  checkin_id?: string | null
  checked_in_at?: string | null
}
