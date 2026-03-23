import type { DigitalTicketStatus, OrderPaymentMethod, OrderPaymentStatus, OrderStatus } from './orders.types'

export const ORDER_STATUS_CONFIG: Record<OrderStatus, { label: string; badge: string; dot: string }> = {
  draft: { label: 'Rascunho', badge: 'badge-muted', dot: 'bg-text-muted' },
  pending: { label: 'Pendente', badge: 'badge-warning', dot: 'bg-status-warning' },
  processing: { label: 'Processando', badge: 'badge-blue', dot: 'bg-brand-blue' },
  paid: { label: 'Pago', badge: 'badge-success', dot: 'bg-status-success' },
  failed: { label: 'Falhou', badge: 'badge-error', dot: 'bg-status-error' },
  cancelled: { label: 'Cancelado', badge: 'badge-error', dot: 'bg-status-error' },
  refunded: { label: 'Reembolsado', badge: 'badge-purple', dot: 'bg-brand-purple' },
  chargeback: { label: 'Chargeback', badge: 'badge-error', dot: 'bg-status-error' },
  expired: { label: 'Expirado', badge: 'badge-muted', dot: 'bg-text-muted' },
}

export const ORDER_PAYMENT_STATUS_LABELS: Record<OrderPaymentStatus, string> = {
  unpaid: 'N\u00e3o pago',
  pending: 'Pendente',
  authorized: 'Autorizado',
  paid: 'Pago',
  failed: 'Falhou',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
  chargeback: 'Chargeback',
  expired: 'Expirado',
}

export const DIGITAL_TICKET_STATUS_LABELS: Record<DigitalTicketStatus, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
  used: 'Utilizado',
  transferred: 'Transferido',
  expired: 'Expirado',
}

export const ORDER_PAYMENT_METHOD_CONFIG: Partial<Record<OrderPaymentMethod, { label: string; icon: 'card' | 'pix' | 'boleto' | 'free' }>> = {
  credit_card: { label: 'Cart\u00e3o de Cr\u00e9dito', icon: 'card' },
  debit_card: { label: 'Cart\u00e3o de D\u00e9bito', icon: 'card' },
  pix: { label: 'PIX', icon: 'pix' },
  boleto: { label: 'Boleto', icon: 'boleto' },
  free: { label: 'Gratuito', icon: 'free' },
  card_1x: { label: 'Cart\u00e3o 1x', icon: 'card' },
  card_2x: { label: 'Cart\u00e3o 2x', icon: 'card' },
  card_3x: { label: 'Cart\u00e3o 3x', icon: 'card' },
  card_4x: { label: 'Cart\u00e3o 4x', icon: 'card' },
  card_5x: { label: 'Cart\u00e3o 5x', icon: 'card' },
  card_6x: { label: 'Cart\u00e3o 6x', icon: 'card' },
  card_7x: { label: 'Cart\u00e3o 7x', icon: 'card' },
  card_8x: { label: 'Cart\u00e3o 8x', icon: 'card' },
  card_9x: { label: 'Cart\u00e3o 9x', icon: 'card' },
  card_10x: { label: 'Cart\u00e3o 10x', icon: 'card' },
  card_11x: { label: 'Cart\u00e3o 11x', icon: 'card' },
  card_12x: { label: 'Cart\u00e3o 12x', icon: 'card' },
}

export const EMPTY_ORDER_DRAFT = {
  buyer: {
    name: '',
    email: '',
    phone: '',
    cpf: '',
  },
  items: [],
}
