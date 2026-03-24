import type {
  EventFinancialClosureRow,
  EventPayoutRow,
  FinancialClosureFormValues,
  FinancialCostEntryFormValues,
  FinancialCostEntryRow,
  FinancialForecastFormValues,
  FinancialForecastRow,
  FinancialPayoutFormValues,
  OrderFinancialSnapshot,
  PaymentFinancialSnapshot,
  StaffFinancialSnapshot,
  SupplierFinancialSnapshot,
  TransactionalMessageFinancialSnapshot,
} from '@/features/financial/types'

function nowIso() {
  return new Date().toISOString()
}

function toCurrencyNumber(value: string | number | null | undefined) {
  return Number(value ?? 0)
}

function buildProjectedMargin(projectedRevenue: number, projectedCost: number) {
  return projectedRevenue - projectedCost
}

function buildProjectedMarginPercent(projectedRevenue: number, projectedMargin: number) {
  return projectedRevenue > 0 ? Number(((projectedMargin / projectedRevenue) * 100).toFixed(1)) : 0
}

function buildOrganizerNet(payableAmount: number, platformFees: number) {
  return Number((payableAmount - platformFees).toFixed(2))
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
    amount: toCurrencyNumber(values.amount),
    due_date: values.due_date || null,
    paid_date: values.status === 'paid' ? values.paid_date || new Date().toISOString() : null,
    status: values.status,
    notes: values.notes.trim() || null,
  }
}

export function mapEventPayoutRow(row: Record<string, unknown>): EventPayoutRow {
  return {
    id: String(row.id),
    organization_id: String(row.organization_id),
    event_id: String(row.event_id),
    gross_sales: Number(row.gross_sales ?? 0),
    refunds_amount: Number(row.refunds_amount ?? 0),
    chargeback_amount: Number(row.chargeback_amount ?? 0),
    platform_fees: Number(row.platform_fees ?? 0),
    retained_amount: Number(row.retained_amount ?? 0),
    payable_amount: Number(row.payable_amount ?? 0),
    event_organizer_net: Number(row.event_organizer_net ?? 0),
    status: (row.status as EventPayoutRow['status']) ?? 'draft',
    scheduled_at: (row.scheduled_at as string | null | undefined) ?? null,
    paid_out_at: (row.paid_out_at as string | null | undefined) ?? null,
    notes: (row.notes as string | null | undefined) ?? null,
    created_at: String(row.created_at ?? nowIso()),
    updated_at: String(row.updated_at ?? nowIso()),
  }
}

export function buildEventPayoutPayload(values: FinancialPayoutFormValues, organizationId: string) {
  const grossSales = toCurrencyNumber(values.gross_sales)
  const platformFees = toCurrencyNumber(values.platform_fees)
  const retainedAmount = toCurrencyNumber(values.retained_amount)
  const payableAmount = toCurrencyNumber(values.payable_amount)

  return {
    organization_id: organizationId,
    event_id: values.event_id,
    gross_sales: grossSales,
    refunds_amount: retainedAmount,
    chargeback_amount: 0,
    platform_fees: platformFees,
    retained_amount: retainedAmount,
    payable_amount: payableAmount,
    event_organizer_net: buildOrganizerNet(payableAmount, platformFees),
    status: values.status,
    scheduled_at: values.scheduled_at || null,
    paid_out_at: values.status === 'paid' ? values.paid_out_at || new Date().toISOString() : values.paid_out_at || null,
    notes: values.notes.trim() || null,
  }
}

export function mapFinancialForecastRow(row: Record<string, unknown>): FinancialForecastRow {
  return {
    id: String(row.id),
    organization_id: String(row.organization_id),
    event_id: String(row.event_id),
    projected_revenue: Number(row.projected_revenue ?? 0),
    projected_cost: Number(row.projected_cost ?? 0),
    projected_margin: Number(row.projected_margin ?? 0),
    projected_margin_percent: Number(row.projected_margin_percent ?? 0),
    risk_status: (row.risk_status as FinancialForecastRow['risk_status']) ?? 'medium',
    assumptions: (row.assumptions as Record<string, unknown> | null | undefined) ?? null,
    notes: (row.notes as string | null | undefined) ?? null,
    created_at: String(row.created_at ?? nowIso()),
    updated_at: String(row.updated_at ?? nowIso()),
  }
}

export function buildFinancialForecastPayload(values: FinancialForecastFormValues, organizationId: string) {
  const projectedRevenue = toCurrencyNumber(values.projected_revenue)
  const projectedCost = toCurrencyNumber(values.projected_cost)
  const projectedMargin = buildProjectedMargin(projectedRevenue, projectedCost)

  return {
    organization_id: organizationId,
    event_id: values.event_id,
    projected_revenue: projectedRevenue,
    projected_cost: projectedCost,
    projected_margin: projectedMargin,
    projected_margin_percent: buildProjectedMarginPercent(projectedRevenue, projectedMargin),
    risk_status: values.risk_status,
    assumptions: {} as Record<string, unknown>,
    notes: values.notes.trim() || null,
  }
}

export function mapEventFinancialClosureRow(row: Record<string, unknown>): EventFinancialClosureRow {
  return {
    id: String(row.id),
    organization_id: String(row.organization_id),
    event_id: String(row.event_id),
    status: (row.status as EventFinancialClosureRow['status']) ?? 'open',
    payments_reconciled: Boolean(row.payments_reconciled),
    costs_recorded: Boolean(row.costs_recorded),
    payouts_reviewed: Boolean(row.payouts_reviewed),
    divergences_resolved: Boolean(row.divergences_resolved),
    result_validated: Boolean(row.result_validated),
    closed_at: (row.closed_at as string | null | undefined) ?? null,
    notes: (row.notes as string | null | undefined) ?? null,
    created_at: String(row.created_at ?? nowIso()),
    updated_at: String(row.updated_at ?? nowIso()),
  }
}

export function buildEventFinancialClosurePayload(values: FinancialClosureFormValues, organizationId: string) {
  return {
    organization_id: organizationId,
    event_id: values.event_id,
    status: values.status,
    payments_reconciled: values.payments_reconciled,
    costs_recorded: values.costs_recorded,
    payouts_reviewed: values.payouts_reviewed,
    divergences_resolved: values.divergences_resolved,
    result_validated: values.result_validated,
    closed_at: values.status === 'closed' ? values.closed_at || new Date().toISOString() : values.closed_at || null,
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
