import type { CheckinLogResult, CheckinReasonCode, CheckinValidationStatus } from './checkin.types'

export const CHECKIN_RESULT_LABELS: Record<CheckinValidationStatus, string> = {
  valid: 'Valido',
  already_used: 'Já usado',
  cancelled: 'Cancelado',
  expired: 'Expirado',
  invalid: 'Inválido',
  blocked: 'Bloqueado',
  reentry_allowed: 'Reentrada liberada',
}

export const CHECKIN_LOG_RESULT_LABELS: Record<CheckinLogResult, string> = {
  success: 'Entrada OK',
  already_used: 'Já usado',
  invalid: 'Token inválido',
  expired: 'Expirado',
  blocked: 'Bloqueado',
}

export const CHECKIN_REASON_LABELS: Record<CheckinReasonCode, string> = {
  ticket_valid: 'Ingresso válido para acesso',
  ticket_not_found: 'Token não encontrado',
  ticket_cancelled: 'Ingresso cancelado',
  ticket_refunded: 'Ingresso reembolsado',
  ticket_expired: 'Ingresso expirado',
  ticket_blocked: 'Ingresso bloqueado',
  already_checked_in: 'Ingresso já utilizado',
  duplicate_exit: 'Saída já registrada',
  exit_without_entry: 'Saída sem entrada anterior',
  reentry_allowed: 'Reentrada liberada por saída anterior',
}
