import type {
  FinancialCostEntryRow,
  FinancialEventOption,
  FinancialEventReport,
  FinancialOverview,
  FinancialReconciliationRow,
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
      issue_label: 'Aguardando confirmacao do pagamento',
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

export function buildFinancialOverview(params: {
  events: FinancialEventOption[]
  orders: OrderFinancialSnapshot[]
  payments: PaymentFinancialSnapshot[]
  costs: FinancialCostEntryRow[]
  suppliers: SupplierFinancialSnapshot[]
  staff: StaffFinancialSnapshot[]
  transactionalMessages: TransactionalMessageFinancialSnapshot[]
}): FinancialOverview {
  const paymentsByOrderId = new Map(params.payments.map((payment) => [payment.order_id, payment]))
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
    const refundedAmount = sum(refundedPayments.map((payment) => payment.amount)) || sum(eventOrders.filter((order) => order.status === 'refunded').map((order) => order.total_amount))
    const chargebackAmount = sum(eventOrders.filter((order) => order.status === 'chargeback').map((order) => order.total_amount))
    const netSales = approvedPaymentsAmount - refundedAmount - chargebackAmount

    const report: FinancialEventReport = {
      event_id: event.id,
      event_name: event.name,
      starts_at: event.starts_at,
      gross_sales: roundCurrency(sum(revenueOrders.map((order) => order.subtotal))),
      discounts: roundCurrency(sum(revenueOrders.map((order) => order.discount_amount))),
      fees: roundCurrency(sum(revenueOrders.map((order) => order.fee_amount))),
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
      operational_costs: roundCurrency(manualCosts + derivedSupplierCosts + derivedStaffCosts),
      result: 0,
      margin_percent: 0,
      pending_orders_count: eventOrders.filter((order) => ['draft', 'pending', 'processing'].includes(order.status)).length,
      reconciliation_pending_count: reconciliationPendingCount,
      reconciliation_divergent_count: reconciliationDivergentCount,
      order_confirmation_emails_sent: eventMessages.filter((message) => message.template_key === 'order-confirmation' && message.status === 'sent').length,
      ticket_emails_sent: eventMessages.filter((message) => message.template_key === 'tickets-issued' && message.status === 'sent').length,
    }

    report.result = roundCurrency(report.net_sales - report.operational_costs)
    report.margin_percent = report.net_sales > 0 ? Number(((report.result / report.net_sales) * 100).toFixed(1)) : 0

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
  }
}
