import type {
  EventFinancialClosureRow,
  EventPayoutRow,
  FinancialClosureStatus,
  FinancialCostEntryRow,
  FinancialEventOption,
  FinancialEventReport,
  FinancialForecastRow,
  FinancialOverview,
  FinancialReconciliationRow,
  ForecastRiskStatus,
  OrderFinancialSnapshot,
  PaymentFinancialSnapshot,
  StaffFinancialSnapshot,
  SupplierFinancialSnapshot,
  TransactionalMessageFinancialSnapshot,
} from '@/features/financial/types'

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0)
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100
}

export function buildEmptyFinancialOverview(): FinancialOverview {
  return {
    events: [],
    reports: [],
    reconciliation_rows: [],
    unallocated_costs: 0,
    gross_sales: 0,
    net_sales: 0,
    approved_payments_amount: 0,
    approved_payments_count: 0,
    failed_payments_amount: 0,
    refunded_amount: 0,
    chargeback_amount: 0,
    operational_costs: 0,
    result: 0,
    margin_percent: 0,
    divergence_count: 0,
    pending_reconciliation_count: 0,
    total_projected_revenue: 0,
    total_projected_cost: 0,
    total_projected_margin: 0,
    total_payable_amount: 0,
    total_retained_amount: 0,
    total_event_organizer_net: 0,
    scheduled_payouts_count: 0,
    paid_payouts_count: 0,
    events_at_risk_count: 0,
    events_ready_to_close_count: 0,
  }
}

function buildReconciliationRow(
  order: OrderFinancialSnapshot,
  event: FinancialEventOption,
  payment: PaymentFinancialSnapshot | null,
): FinancialReconciliationRow {
  const nonFreeOrder = order.total_amount > 0 && order.payment_method !== 'free'

  if (nonFreeOrder && !payment && ['draft', 'pending', 'processing'].includes(order.status)) {
    return {
      order_id: order.id,
      event_id: event.id,
      event_name: event.name,
      buyer_name: order.buyer_name,
      buyer_email: order.buyer_email,
      amount: order.total_amount,
      order_status: order.status,
      payment_status: null,
      payment_provider: null,
      reconciliation_status: 'pending',
      issue_label: 'Pedido aguardando pagamento',
      created_at: order.created_at,
    }
  }

  if (!nonFreeOrder && order.status === 'paid') {
    return {
      order_id: order.id,
      event_id: event.id,
      event_name: event.name,
      buyer_name: order.buyer_name,
      buyer_email: order.buyer_email,
      amount: order.total_amount,
      order_status: order.status,
      payment_status: payment?.status ?? null,
      payment_provider: payment?.provider ?? null,
      reconciliation_status: 'matched',
      issue_label: 'Pedido gratuito confirmado',
      created_at: order.created_at,
    }
  }

  if (nonFreeOrder && !payment) {
    return {
      order_id: order.id,
      event_id: event.id,
      event_name: event.name,
      buyer_name: order.buyer_name,
      buyer_email: order.buyer_email,
      amount: order.total_amount,
      order_status: order.status,
      payment_status: null,
      payment_provider: null,
      reconciliation_status: 'divergent',
      issue_label: 'Pedido sem pagamento vinculado',
      created_at: order.created_at,
    }
  }

  if (payment?.status === 'pending' || ['draft', 'pending', 'processing'].includes(order.status)) {
    return {
      order_id: order.id,
      event_id: event.id,
      event_name: event.name,
      buyer_name: order.buyer_name,
      buyer_email: order.buyer_email,
      amount: order.total_amount,
      order_status: order.status,
      payment_status: payment?.status ?? null,
      payment_provider: payment?.provider ?? null,
      reconciliation_status: 'pending',
      issue_label: 'Aguardando confirmação do pagamento',
      created_at: order.created_at,
    }
  }

  if (
    (order.status === 'paid' && payment?.status === 'paid') ||
    (order.status === 'failed' && payment?.status === 'failed') ||
    (order.status === 'refunded' && payment?.status === 'refunded') ||
    (order.status === 'cancelled' && payment?.status === 'cancelled')
  ) {
    return {
      order_id: order.id,
      event_id: event.id,
      event_name: event.name,
      buyer_name: order.buyer_name,
      buyer_email: order.buyer_email,
      amount: order.total_amount,
      order_status: order.status,
      payment_status: payment?.status ?? null,
      payment_provider: payment?.provider ?? null,
      reconciliation_status: 'matched',
      issue_label: 'Pedido conciliado',
      created_at: order.created_at,
    }
  }

  return {
    order_id: order.id,
    event_id: event.id,
    event_name: event.name,
    buyer_name: order.buyer_name,
    buyer_email: order.buyer_email,
    amount: order.total_amount,
    order_status: order.status,
    payment_status: payment?.status ?? null,
    payment_provider: payment?.provider ?? null,
    reconciliation_status: 'divergent',
    issue_label: 'Status de pedido e pagamento divergentes',
    created_at: order.created_at,
  }
}

function getFallbackProjectedRevenue(event: FinancialEventOption, grossSales: number, netSales: number) {
  const soldTickets = Number(event.sold_tickets ?? 0)
  const totalCapacity = Number(event.total_capacity ?? 0)

  if (totalCapacity > 0 && soldTickets > 0 && soldTickets < totalCapacity) {
    const averageNetPerTicket = netSales > 0 ? netSales / soldTickets : grossSales / soldTickets
    return roundCurrency(averageNetPerTicket * totalCapacity)
  }

  if (event.status === 'finished' || event.status === 'archived') {
    return roundCurrency(Math.max(netSales, grossSales))
  }

  return roundCurrency(Math.max(netSales, grossSales) * 1.12)
}

function getRiskStatus(params: {
  report: Pick<FinancialEventReport, 'result' | 'pending_orders_count' | 'reconciliation_pending_count' | 'reconciliation_divergent_count'>
  projectedMarginPercent: number
  projectedMargin: number
  explicitRisk?: ForecastRiskStatus
}): ForecastRiskStatus {
  if (params.explicitRisk) {
    return params.explicitRisk
  }

  if (params.report.result < 0 || params.projectedMargin < 0 || params.report.reconciliation_divergent_count > 0) {
    return 'high'
  }

  if (params.projectedMarginPercent < 15 || params.report.pending_orders_count > 0 || params.report.reconciliation_pending_count > 0) {
    return 'medium'
  }

  return 'low'
}

function buildClosureStatus(pendingItems: string[], explicitStatus?: FinancialClosureStatus): FinancialClosureStatus {
  if (explicitStatus) {
    return explicitStatus
  }

  if (pendingItems.length === 0) {
    return 'closed'
  }

  if (pendingItems.length <= 4) {
    return 'in_closure'
  }

  return 'open'
}

function hasMeaningfulPayoutDivergence(payout: EventPayoutRow | undefined, derivedNet: number, derivedPayable: number, derivedRetained: number) {
  if (!payout) {
    return false
  }

  return (
    Math.abs(payout.event_organizer_net - derivedNet) > 0.01 ||
    Math.abs(payout.payable_amount - derivedPayable) > 0.01 ||
    Math.abs(payout.retained_amount - derivedRetained) > 0.01
  )
}

export function buildFinancialOverview(params: {
  events: FinancialEventOption[]
  orders: OrderFinancialSnapshot[]
  payments: PaymentFinancialSnapshot[]
  costs: FinancialCostEntryRow[]
  suppliers: SupplierFinancialSnapshot[]
  staff: StaffFinancialSnapshot[]
  transactionalMessages: TransactionalMessageFinancialSnapshot[]
  payouts: EventPayoutRow[]
  forecasts: FinancialForecastRow[]
  closures: EventFinancialClosureRow[]
}): FinancialOverview {
  const paymentsByOrderId = new Map(params.payments.map((payment) => [payment.order_id, payment]))
  const payoutsByEventId = new Map(params.payouts.map((payout) => [payout.event_id, payout]))
  const forecastsByEventId = new Map(params.forecasts.map((forecast) => [forecast.event_id, forecast]))
  const closuresByEventId = new Map(params.closures.map((closure) => [closure.event_id, closure]))
  const transactionalMessagesByEventId = new Map<string, TransactionalMessageFinancialSnapshot[]>()

  for (const message of params.transactionalMessages) {
    if (!message.event_id) {
      continue
    }

    const current = transactionalMessagesByEventId.get(message.event_id) ?? []
    current.push(message)
    transactionalMessagesByEventId.set(message.event_id, current)
  }

  const reports = params.events.map((event) => {
    const eventOrders = params.orders.filter((order) => order.event_id === event.id)
    const eventOrderIds = new Set(eventOrders.map((order) => order.id))
    const eventPayments = params.payments.filter((payment) => (payment.event_id ?? '') === event.id || eventOrderIds.has(payment.order_id))
    const eventCosts = params.costs.filter((cost) => cost.event_id === event.id && cost.status !== 'cancelled')
    const eventSuppliers = params.suppliers.filter((supplier) => supplier.event_id === event.id && supplier.status !== 'cancelled')
    const eventStaff = params.staff.filter((member) => member.event_id === event.id && member.status !== 'inactive' && member.is_active !== false)
    const eventMessages = transactionalMessagesByEventId.get(event.id) ?? []
    const payout = payoutsByEventId.get(event.id)
    const forecast = forecastsByEventId.get(event.id)
    const closure = closuresByEventId.get(event.id)

    const revenueOrders = eventOrders.filter((order) => ['paid', 'refunded', 'chargeback'].includes(order.status))
    const approvedPayments = eventPayments.filter((payment) => payment.status === 'paid')
    const failedPayments = eventPayments.filter((payment) => payment.status === 'failed')
    const refundedPayments = eventPayments.filter((payment) => payment.status === 'refunded')

    const supplierContractCosts = sum(eventSuppliers.map((supplier) => Number(supplier.contract_value ?? 0)))
    const supplierLedgerCosts = sum(eventCosts.filter((cost) => cost.category === 'suppliers').map((cost) => cost.amount))
    const derivedSupplierCosts = supplierContractCosts > 0 ? supplierContractCosts : supplierLedgerCosts

    const derivedStaffCostsRaw = sum(
      eventStaff
        .filter((member) => member.daily_rate != null && (member.checked_in_at != null || member.status === 'confirmed' || member.status === 'active'))
        .map((member) => Number(member.daily_rate ?? 0)),
    )
    const staffLedgerCosts = sum(eventCosts.filter((cost) => cost.category === 'staff').map((cost) => cost.amount))
    const derivedStaffCosts = derivedStaffCostsRaw > 0 ? derivedStaffCostsRaw : staffLedgerCosts

    const manualCosts = sum(
      eventCosts
        .filter((cost) => !['staff', 'suppliers'].includes(cost.category))
        .map((cost) => cost.amount),
    )

    const reconciliationRows = eventOrders.map((order) => buildReconciliationRow(order, event, paymentsByOrderId.get(order.id) ?? null))
    const reconciliationPendingCount = reconciliationRows.filter((row) => row.reconciliation_status === 'pending').length
    const reconciliationDivergentCount = reconciliationRows.filter((row) => row.reconciliation_status === 'divergent').length

    const approvedPaymentsAmount = sum(
      approvedPayments.length > 0
        ? approvedPayments.map((payment) => payment.amount)
        : eventOrders.filter((order) => order.status === 'paid' && order.payment_method === 'free').map((order) => order.total_amount),
    )
    const refundedAmount =
      sum(refundedPayments.map((payment) => payment.amount)) || sum(eventOrders.filter((order) => order.status === 'refunded').map((order) => order.total_amount))
    const chargebackAmount = sum(eventOrders.filter((order) => order.status === 'chargeback').map((order) => order.total_amount))
    const netSales = approvedPaymentsAmount - refundedAmount - chargebackAmount
    const operationalCosts = manualCosts + derivedSupplierCosts + derivedStaffCosts
    const result = netSales - operationalCosts
    const marginPercent = netSales > 0 ? Number(((result / netSales) * 100).toFixed(1)) : 0

    const derivedRetainedAmount = roundCurrency(refundedAmount + chargebackAmount)
    const derivedPlatformFees = roundCurrency(sum(revenueOrders.map((order) => order.fee_amount)))
    const derivedPayableAmount = roundCurrency(Math.max(approvedPaymentsAmount - derivedRetainedAmount, 0))
    const derivedOrganizerNet = roundCurrency(Math.max(derivedPayableAmount - derivedPlatformFees, 0))

    const projectedRevenue = roundCurrency(forecast?.projected_revenue ?? getFallbackProjectedRevenue(event, sum(revenueOrders.map((order) => order.subtotal)), netSales))
    const projectedCost = roundCurrency(forecast?.projected_cost ?? operationalCosts)
    const projectedMargin = roundCurrency(forecast?.projected_margin ?? projectedRevenue - projectedCost)
    const projectedMarginPercent =
      forecast?.projected_margin_percent ?? (projectedRevenue > 0 ? Number(((projectedMargin / projectedRevenue) * 100).toFixed(1)) : 0)

    const report: FinancialEventReport = {
      event_id: event.id,
      event_name: event.name,
      starts_at: event.starts_at,
      gross_sales: roundCurrency(sum(revenueOrders.map((order) => order.subtotal))),
      discounts: roundCurrency(sum(revenueOrders.map((order) => order.discount_amount))),
      fees: roundCurrency(derivedPlatformFees),
      approved_payments_amount: roundCurrency(approvedPaymentsAmount),
      approved_payments_count: approvedPayments.length + eventOrders.filter((order) => order.status === 'paid' && order.payment_method === 'free').length,
      failed_payments_amount: roundCurrency(sum(failedPayments.map((payment) => payment.amount))),
      failed_payments_count: failedPayments.length,
      refunded_amount: roundCurrency(refundedAmount),
      refunded_count: refundedPayments.length || eventOrders.filter((order) => order.status === 'refunded').length,
      chargeback_amount: roundCurrency(chargebackAmount),
      net_sales: roundCurrency(netSales),
      manual_costs: roundCurrency(manualCosts),
      supplier_costs: roundCurrency(derivedSupplierCosts),
      staff_costs: roundCurrency(derivedStaffCosts),
      operational_costs: roundCurrency(operationalCosts),
      result: roundCurrency(result),
      margin_percent: marginPercent,
      pending_orders_count: eventOrders.filter((order) => ['draft', 'pending', 'processing'].includes(order.status)).length,
      reconciliation_pending_count: reconciliationPendingCount,
      reconciliation_divergent_count: reconciliationDivergentCount,
      order_confirmation_emails_sent: eventMessages.filter((message) => message.template_key === 'order-confirmation' && message.status === 'sent').length,
      ticket_emails_sent: eventMessages.filter((message) => message.template_key === 'tickets-issued' && message.status === 'sent').length,
      payout_id: payout?.id ?? null,
      payout_status: payout?.status ?? (reconciliationDivergentCount > 0 ? 'divergent' : reconciliationPendingCount > 0 ? 'held' : 'draft'),
      payout_scheduled_at: payout?.scheduled_at ?? null,
      payout_paid_out_at: payout?.paid_out_at ?? null,
      payout_notes: payout?.notes ?? null,
      platform_fees: roundCurrency(payout?.platform_fees ?? derivedPlatformFees),
      retained_amount: roundCurrency(payout?.retained_amount ?? derivedRetainedAmount),
      payable_amount: roundCurrency(payout?.payable_amount ?? derivedPayableAmount),
      event_organizer_net: roundCurrency(payout?.event_organizer_net ?? derivedOrganizerNet),
      payout_divergent:
        reconciliationDivergentCount > 0 || hasMeaningfulPayoutDivergence(payout, derivedOrganizerNet, derivedPayableAmount, derivedRetainedAmount),
      forecast_id: forecast?.id ?? null,
      forecast_notes: forecast?.notes ?? null,
      projected_revenue: projectedRevenue,
      projected_cost: projectedCost,
      projected_margin: projectedMargin,
      projected_margin_percent: projectedMarginPercent,
      realized_vs_projected_revenue: roundCurrency(netSales - projectedRevenue),
      realized_vs_projected_cost: roundCurrency(operationalCosts - projectedCost),
      realized_vs_projected_result: roundCurrency(result - projectedMargin),
      risk_status: getRiskStatus({
        report: {
          result: roundCurrency(result),
          pending_orders_count: eventOrders.filter((order) => ['draft', 'pending', 'processing'].includes(order.status)).length,
          reconciliation_pending_count: reconciliationPendingCount,
          reconciliation_divergent_count: reconciliationDivergentCount,
        },
        projectedMarginPercent,
        projectedMargin,
        explicitRisk: forecast?.risk_status,
      }),
      closure_id: closure?.id ?? null,
      closure_status: 'open',
      closure_closed_at: closure?.closed_at ?? null,
      closure_notes: closure?.notes ?? null,
      payments_reconciled: closure?.payments_reconciled ?? (reconciliationPendingCount === 0 && reconciliationDivergentCount === 0),
      costs_recorded: closure?.costs_recorded ?? (eventCosts.length > 0 || operationalCosts > 0 || approvedPaymentsAmount === 0),
      payouts_reviewed: closure?.payouts_reviewed ?? Boolean(payout && payout.status !== 'divergent'),
      divergences_resolved: closure?.divergences_resolved ?? reconciliationDivergentCount === 0,
      result_validated: closure?.result_validated ?? false,
      closure_pending_items: [],
      closure_pending_count: 0,
    }

    const pendingItems: string[] = []

    if (!report.payments_reconciled) {
      pendingItems.push('Pagamentos ainda não conciliados')
    }
    if (!report.costs_recorded) {
      pendingItems.push('Custos operacionais ainda não consolidados')
    }
    if (!report.payouts_reviewed) {
      pendingItems.push('Repasse ainda não revisado')
    }
    if (!report.divergences_resolved) {
      pendingItems.push('Divergencias financeiras em aberto')
    }
    if (!report.result_validated) {
      pendingItems.push('Resultado final ainda não validado')
    }

    report.closure_pending_items = pendingItems
    report.closure_pending_count = pendingItems.length
    report.closure_status = buildClosureStatus(pendingItems, closure?.status)

    return report
  })

  const unallocatedCosts = roundCurrency(sum(params.costs.filter((cost) => !cost.event_id && cost.status !== 'cancelled').map((cost) => cost.amount)))
  const grossSales = roundCurrency(sum(reports.map((report) => report.gross_sales)))
  const netSales = roundCurrency(sum(reports.map((report) => report.net_sales)))
  const approvedPaymentsAmount = roundCurrency(sum(reports.map((report) => report.approved_payments_amount)))
  const approvedPaymentsCount = reports.reduce((total, report) => total + report.approved_payments_count, 0)
  const failedPaymentsAmount = roundCurrency(sum(reports.map((report) => report.failed_payments_amount)))
  const refundedAmount = roundCurrency(sum(reports.map((report) => report.refunded_amount)))
  const chargebackAmount = roundCurrency(sum(reports.map((report) => report.chargeback_amount)))
  const operationalCosts = roundCurrency(sum(reports.map((report) => report.operational_costs)) + unallocatedCosts)
  const result = roundCurrency(netSales - operationalCosts)

  const reconciliationRows = params.events
    .flatMap((event) =>
      params.orders
        .filter((order) => order.event_id === event.id)
        .map((order) => buildReconciliationRow(order, event, paymentsByOrderId.get(order.id) ?? null)),
    )
    .sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime())

  return {
    events: params.events,
    reports: reports.sort((left, right) => new Date(right.starts_at).getTime() - new Date(left.starts_at).getTime()),
    reconciliation_rows: reconciliationRows,
    unallocated_costs: unallocatedCosts,
    gross_sales: grossSales,
    net_sales: netSales,
    approved_payments_amount: approvedPaymentsAmount,
    approved_payments_count: approvedPaymentsCount,
    failed_payments_amount: failedPaymentsAmount,
    refunded_amount: refundedAmount,
    chargeback_amount: chargebackAmount,
    operational_costs: operationalCosts,
    result,
    margin_percent: netSales > 0 ? Number(((result / netSales) * 100).toFixed(1)) : 0,
    divergence_count: reconciliationRows.filter((row) => row.reconciliation_status === 'divergent').length,
    pending_reconciliation_count: reconciliationRows.filter((row) => row.reconciliation_status === 'pending').length,
    total_projected_revenue: roundCurrency(sum(reports.map((report) => report.projected_revenue))),
    total_projected_cost: roundCurrency(sum(reports.map((report) => report.projected_cost))),
    total_projected_margin: roundCurrency(sum(reports.map((report) => report.projected_margin))),
    total_payable_amount: roundCurrency(sum(reports.map((report) => report.payable_amount))),
    total_retained_amount: roundCurrency(sum(reports.map((report) => report.retained_amount))),
    total_event_organizer_net: roundCurrency(sum(reports.map((report) => report.event_organizer_net))),
    scheduled_payouts_count: reports.filter((report) => report.payout_status === 'scheduled').length,
    paid_payouts_count: reports.filter((report) => report.payout_status === 'paid').length,
    events_at_risk_count: reports.filter((report) => report.risk_status === 'high').length,
    events_ready_to_close_count: reports.filter((report) => report.closure_pending_count === 0).length,
  }
}
