import { AlertTriangle, CheckCircle2, DoorOpen, ScanLine, ShieldX, XCircle } from 'lucide-react'
import type { CheckinLogResult, CheckinReasonCode, CheckinValidationStatus } from '@/features/checkin/types'
import { CHECKIN_LOG_RESULT_LABELS, CHECKIN_REASON_LABELS, CHECKIN_RESULT_LABELS } from '@/features/checkin/types'

export function getValidationAppearance(status: CheckinValidationStatus, reasonCode?: CheckinReasonCode | null) {
  switch (status) {
    case 'valid':
      return {
        label: CHECKIN_RESULT_LABELS[status],
        description: CHECKIN_REASON_LABELS.ticket_valid,
        color: 'text-status-success',
        bg: 'bg-status-success/10 border-status-success/20',
        icon: CheckCircle2,
      }
    case 'reentry_allowed':
      return {
        label: CHECKIN_RESULT_LABELS[status],
        description: reasonCode ? CHECKIN_REASON_LABELS[reasonCode] : CHECKIN_REASON_LABELS.reentry_allowed,
        color: 'text-brand-blue',
        bg: 'bg-brand-blue/10 border-brand-blue/20',
        icon: DoorOpen,
      }
    case 'already_used':
      return {
        label: CHECKIN_RESULT_LABELS[status],
        description: reasonCode ? CHECKIN_REASON_LABELS[reasonCode] : CHECKIN_REASON_LABELS.already_checked_in,
        color: 'text-status-warning',
        bg: 'bg-status-warning/10 border-status-warning/20',
        icon: AlertTriangle,
      }
    case 'cancelled':
    case 'blocked':
      return {
        label: CHECKIN_RESULT_LABELS[status],
        description:
          reasonCode && CHECKIN_REASON_LABELS[reasonCode]
            ? CHECKIN_REASON_LABELS[reasonCode]
            : status === 'cancelled'
              ? CHECKIN_REASON_LABELS.ticket_cancelled
              : CHECKIN_REASON_LABELS.ticket_blocked,
        color: 'text-status-error',
        bg: 'bg-status-error/10 border-status-error/20',
        icon: ShieldX,
      }
    case 'expired':
      return {
        label: CHECKIN_RESULT_LABELS[status],
        description: reasonCode ? CHECKIN_REASON_LABELS[reasonCode] : CHECKIN_REASON_LABELS.ticket_expired,
        color: 'text-text-muted',
        bg: 'bg-bg-surface border-bg-border',
        icon: XCircle,
      }
    case 'invalid':
    default:
      return {
        label: CHECKIN_RESULT_LABELS.invalid,
        description: reasonCode ? CHECKIN_REASON_LABELS[reasonCode] : CHECKIN_REASON_LABELS.ticket_not_found,
        color: 'text-status-error',
        bg: 'bg-status-error/10 border-status-error/20',
        icon: ScanLine,
      }
  }
}

export function getLogAppearance(result: CheckinLogResult, reasonCode?: CheckinReasonCode | null, isExit?: boolean) {
  if (isExit) {
    return {
      label: 'Saida',
      description: reasonCode ? CHECKIN_REASON_LABELS[reasonCode] : 'Saída registrada',
      color: 'text-brand-blue',
      icon: DoorOpen,
    }
  }

  if (reasonCode === 'ticket_cancelled' || reasonCode === 'ticket_refunded') {
    return {
      label: 'Cancelado',
      description: CHECKIN_REASON_LABELS[reasonCode],
      color: 'text-status-error',
      icon: ShieldX,
    }
  }

  switch (result) {
    case 'success':
      return {
        label: CHECKIN_LOG_RESULT_LABELS.success,
        description: reasonCode ? CHECKIN_REASON_LABELS[reasonCode] : CHECKIN_REASON_LABELS.ticket_valid,
        color: 'text-status-success',
        icon: CheckCircle2,
      }
    case 'already_used':
      return {
        label: CHECKIN_LOG_RESULT_LABELS.already_used,
        description: CHECKIN_REASON_LABELS.already_checked_in,
        color: 'text-status-warning',
        icon: AlertTriangle,
      }
    case 'expired':
      return {
        label: CHECKIN_LOG_RESULT_LABELS.expired,
        description: CHECKIN_REASON_LABELS.ticket_expired,
        color: 'text-text-muted',
        icon: XCircle,
      }
    case 'blocked':
      return {
        label: CHECKIN_LOG_RESULT_LABELS.blocked,
        description: reasonCode ? CHECKIN_REASON_LABELS[reasonCode] : CHECKIN_REASON_LABELS.ticket_blocked,
        color: 'text-status-error',
        icon: ShieldX,
      }
    case 'invalid':
    default:
      return {
        label: CHECKIN_LOG_RESULT_LABELS.invalid,
        description: reasonCode ? CHECKIN_REASON_LABELS[reasonCode] : CHECKIN_REASON_LABELS.ticket_not_found,
        color: 'text-status-error',
        icon: ScanLine,
      }
  }
}
