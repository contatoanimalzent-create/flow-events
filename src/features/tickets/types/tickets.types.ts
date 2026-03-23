export interface TicketSalesEvent {
  id: string
  name: string
  status: string
}

export interface TicketBatch {
  id: string
  ticket_type_id: string
  event_id: string
  name: string
  price: number
  quantity: number
  sold_count: number
  reserved_count: number
  starts_at?: string | null
  ends_at?: string | null
  auto_open_next: boolean
  is_active: boolean
  position: number
}

export interface TicketType {
  id: string
  event_id: string
  name: string
  description?: string | null
  benefits?: string[] | null
  sector?: string | null
  color?: string | null
  is_transferable: boolean
  is_nominal: boolean
  max_per_order: number
  position: number
  is_active: boolean
}

export interface TicketTypeWithBatches extends TicketType {
  batches: TicketBatch[]
}

export interface TicketTypeFormData {
  name: string
  description: string
  sector: string
  color: string
  is_nominal: boolean
  is_transferable: boolean
  max_per_order: string
  benefits: string
}

export interface TicketBatchFormData {
  name: string
  price: string
  quantity: string
  starts_at: string
  ends_at: string
  auto_open_next: boolean
}
