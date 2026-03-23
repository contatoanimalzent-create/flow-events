import type { CheckinLogResult, CheckinReasonCode, CheckinValidationStatus } from './checkin.types'

export const CHECKIN_RESULT_LABELS: Record<CheckinValidationStatus, string> = {
  valid: 'Valido',
  already_used: 'Ja usado',
  cancelled: 'Cancelado',
  expired: 'Expirado',
  invalid: 'Invalido',
  blocked: 'Bloqueado',
  reentry_allowed: 'Reentrada liberada',
}

export const CHECKIN_LOG_RESULT_LABELS: Record<CheckinLogResult, string> = {
  success: 'Entrada OK',
  already_used: 'Ja usado',
  invalid: 'Token invalido',
  expired: 'Expirado',
  blocked: 'Bloqueado',
}

export const CHECKIN_REASON_LABELS: Record<CheckinReasonCode, string> = {
  ticket_valid: 'Ingresso valido para acesso',
  ticket_not_found: 'Token nao encontrado',
  ticket_cancelled: 'Ingresso cancelado',
  ticket_refunded: 'Ingresso reembolsado',
  ticket_expired: 'Ingresso expirado',
  ticket_blocked: 'Ingresso bloqueado',
  already_checked_in: 'Ingresso ja utilizado',
  duplicate_exit: 'Saida ja registrada',
  exit_without_entry: 'Saida sem entrada anterior',
  reentry_allowed: 'Reentrada liberada por saida anterior',
}
