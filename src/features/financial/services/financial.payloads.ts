import type {
  FinancialCostEntryFormValues,
  FinancialCostEntryRow,
  OrderFinancialSnapshot,
  PaymentFinancialSnapshot,
  StaffFinancialSnapshot,
  SupplierFinancialSnapshot,
  TransactionalMessageFinancialSnapshot,
} from '@/features/financial/types'

function nowIso() {
  return new Date().toISOString()
}

export function mapFinancialCostEntryRow(row: Record<string, unknown>): FinancialCostEntryRow {
  return {
    id: String(row.id),
    organization_id: String(row.organization_id),
    event_id: (row.event_id as string | null | undefined) ?? null,
    description: String(row.description ?? ''),
    category: (row.category as FinancialCostEntryRow['category']) ?? 'other',
    amount: Number(row.amount ?? 0),
    due_date: (row.due_date as string | null | undefined) ?? null,
    paid_date: (row.paid_date as string | null | undefined) ?? null,
    status: (row.status as FinancialCostEntryRow['status']) ?? 'planned',
    notes: (row.notes as string | null | undefined) ?? null,
    created_at: String(row.created_at ?? nowIso()),
  }
}

export function buildFinancialCostEntryPayload(values: FinancialCostEntryFormValues, organizationId: string, eventId?: string | null) {
  return {
    organization_id: organizationId,
    event_id: eventId ?? null,
    description: values.description.trim(),
    category: values.category,
    amount: Number(values.amount || 0),
    due_date: values.due_date || null,
    paid_date: values.status === 'paid' ? values.paid_date || new Date().toISOString() : null,
    status: values.status,
    notes: values.notes.trim() || null,
  }
}

export function mapOrderFinancialSnapshot(row: Record<string, unknown>): OrderFinancialSnapshot {
  return {
    id: String(row.id),
    event_id: String(row.event_id),
    buyer_name: String(row.buyer_name ?? ''),
    buyer_email: String(row.buyer_email ?? ''),
    status: String(row.status ?? 'pending'),
    payment_method: (row.payment_method as string | null | undefined) ?? null,
    subtotal: Number(row.subtotal ?? 0),
    discount_amount: Number(row.discount_amount ?? 0),
    fee_amount: Number(row.fee_amount ?? 0),
    total_amount: Number(row.total_amount ?? 0),
    created_at: String(row.created_at ?? nowIso()),
  }
}

export function mapPaymentFinancialSnapshot(row: Record<string, unknown>): PaymentFinancialSnapshot {
  return {
    id: String(row.id),
    order_id: String(row.order_id),
    event_id: (row.event_id as string | null | undefined) ?? null,
    status: (row.status as PaymentFinancialSnapshot['status']) ?? 'pending',
    amount: Number(row.amount ?? 0),
    provider: String(row.provider ?? 'stripe'),
    paid_at: (row.paid_at as string | null | undefined) ?? null,
    failed_at: (row.failed_at as string | null | undefined) ?? null,
    refunded_at: (row.refunded_at as string | null | undefined) ?? null,
    created_at: String(row.created_at ?? nowIso()),
  }
}

export function mapSupplierFinancialSnapshot(row: Record<string, unknown>): SupplierFinancialSnapshot {
  return {
    id: String(row.id),
    event_id: (row.event_id as string | null | undefined) ?? null,
    company_name: String(row.company_name ?? ''),
    contract_value: row.contract_value == null ? null : Number(row.contract_value),
    status: String(row.status ?? ''),
  }
}

export function mapStaffFinancialSnapshot(row: Record<string, unknown>): StaffFinancialSnapshot {
  return {
    id: String(row.id),
    event_id: (row.event_id as string | null | undefined) ?? null,
    status: String(row.status ?? ''),
    daily_rate: row.daily_rate == null ? null : Number(row.daily_rate),
    is_active: row.is_active == null ? undefined : Boolean(row.is_active),
    checked_in_at: (row.checked_in_at as string | null | undefined) ?? null,
  }
}

export function mapTransactionalMessageFinancialSnapshot(row: Record<string, unknown>): TransactionalMessageFinancialSnapshot {
  return {
    id: String(row.id),
    order_id: (row.order_id as string | null | undefined) ?? null,
    event_id: (row.event_id as string | null | undefined) ?? null,
    template_key: String(row.template_key ?? ''),
    status: (row.status as TransactionalMessageFinancialSnapshot['status']) ?? 'queued',
  }
}
