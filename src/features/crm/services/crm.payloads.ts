function nowIso() {
  return new Date().toISOString()
}

export interface PersistedCustomerSnapshot {
  email: string
  full_name: string
  phone?: string | null
  document?: string | null
  tags: string[]
  notes?: string | null
  first_order_at?: string | null
  last_order_at?: string | null
  total_orders: number
  total_spent: number
}

export interface PersistedCustomerEventProfileSnapshot {
  customer_email: string
  event_id: string
  orders_count: number
  tickets_count: number
  attended_count: number
  no_show_count: number
  gross_revenue: number
  net_revenue: number
  first_interaction_at?: string | null
  last_interaction_at?: string | null
}

export interface StoredCustomerRecord {
  id: string
  email: string
  full_name: string
  phone?: string | null
  document?: string | null
  tags: string[]
  notes?: string | null
  first_order_at?: string | null
  last_order_at?: string | null
  total_orders: number
  total_spent: number
}

export function normalizeCustomerId(value: string) {
  return value.trim().toLowerCase()
}

export function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item ?? '').trim())
      .filter(Boolean)
  }

  return []
}

export function mapStoredCustomerRecord(row: Record<string, unknown>): StoredCustomerRecord {
  return {
    id: String(row.id),
    email: normalizeCustomerId(String(row.email ?? '')),
    full_name: String(row.full_name ?? ''),
    phone: (row.phone as string | null | undefined) ?? null,
    document: (row.document as string | null | undefined) ?? null,
    tags: parseStringArray(row.tags),
    notes: (row.notes as string | null | undefined) ?? null,
    first_order_at: (row.first_order_at as string | null | undefined) ?? null,
    last_order_at: (row.last_order_at as string | null | undefined) ?? null,
    total_orders: Number(row.total_orders ?? 0),
    total_spent: Number(row.total_spent ?? 0),
  }
}

export function buildCustomerUpsertPayload(snapshot: PersistedCustomerSnapshot, organizationId: string) {
  return {
    organization_id: organizationId,
    email: normalizeCustomerId(snapshot.email),
    full_name: snapshot.full_name.trim(),
    phone: snapshot.phone ?? null,
    document: snapshot.document ?? null,
    tags: snapshot.tags,
    notes: snapshot.notes ?? null,
    first_order_at: snapshot.first_order_at ?? null,
    last_order_at: snapshot.last_order_at ?? null,
    total_orders: snapshot.total_orders,
    total_spent: snapshot.total_spent,
    updated_at: nowIso(),
  }
}

export function buildCustomerEventProfileUpsertPayload(
  snapshot: PersistedCustomerEventProfileSnapshot,
  organizationId: string,
  customerId: string,
) {
  return {
    organization_id: organizationId,
    customer_id: customerId,
    event_id: snapshot.event_id,
    orders_count: snapshot.orders_count,
    tickets_count: snapshot.tickets_count,
    attended_count: snapshot.attended_count,
    no_show_count: snapshot.no_show_count,
    gross_revenue: snapshot.gross_revenue,
    net_revenue: snapshot.net_revenue,
    first_interaction_at: snapshot.first_interaction_at ?? null,
    last_interaction_at: snapshot.last_interaction_at ?? null,
    updated_at: nowIso(),
  }
}
