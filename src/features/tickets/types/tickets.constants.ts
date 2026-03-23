import type { TicketBatchFormData, TicketTypeFormData } from './tickets.types'

export const TICKET_COLOR_OPTIONS = [
  { value: '#d4ff00', label: 'Acid' },
  { value: '#5BE7C4', label: 'Teal' },
  { value: '#4BA3FF', label: 'Blue' },
  { value: '#8B7CFF', label: 'Purple' },
  { value: '#FF5A6B', label: 'Red' },
  { value: '#FFB020', label: 'Orange' },
  { value: '#f5f5f0', label: 'White' },
]

export const EMPTY_TICKET_TYPE_FORM: TicketTypeFormData = {
  name: '',
  description: '',
  sector: '',
  color: '#d4ff00',
  is_nominal: true,
  is_transferable: false,
  max_per_order: '5',
  benefits: '',
}

export const EMPTY_TICKET_BATCH_FORM: TicketBatchFormData = {
  name: '',
  price: '',
  quantity: '',
  starts_at: '',
  ends_at: '',
  auto_open_next: true,
}
