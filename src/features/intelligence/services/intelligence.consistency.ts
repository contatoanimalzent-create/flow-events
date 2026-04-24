import type { FinancialOverview } from '@/features/financial/types'
import type { IntelligenceConsistencyIssue, IntelligenceConsistencySummary } from '@/features/intelligence/types'

interface ConsistencyEventRow {
  id: string
  name: string
}

interface ConsistencyOrderRow {
  id: string
  event_id: string
  status: string
  total_amount: number
  created_at: string
}

interface ConsistencyPaymentRow {
  id: string
  order_id: string
  event_id?: string | null
  status: string
}

interface ConsistencyDigitalTicketRow {
  id: string
  event_id?: string | null
  order_item_id?: string | null
  created_at: string
}

interface ConsistencyCheckinRow {
  id: string
  event_id: string
  digital_ticket_id?: string | null
  result: string
  is_exit: boolean
  checked_in_at: string
}

interface ConsistencyCampaignRunRow {
  id: string
  event_id?: string | null
  name: string
  audience_count: number
  created_at: string
}

interface ConsistencyCampaignRecipientRow {
  id: string
  campaign_run_id: string
}

interface ConsistencyCustomerRow {
  id: string
  full_name: string
  total_orders: number
  created_at: string
}

interface ConsistencyCustomerProfileRow {
  customer_id: string
}

interface BuildConsistencyIssuesParams {
  events: ConsistencyEventRow[]
  orders: ConsistencyOrderRow[]
  payments: ConsistencyPaymentRow[]
  digitalTickets: ConsistencyDigitalTicketRow[]
  orderItemIds: string[]
  checkins: ConsistencyCheckinRow[]
  campaignRuns: ConsistencyCampaignRunRow[]
  campaignRecipients: ConsistencyCampaignRecipientRow[]
  customers: ConsistencyCustomerRow[]
  customerProfiles: ConsistencyCustomerProfileRow[]
  financialOverview: FinancialOverview
}

function eventNameById(events: ConsistencyEventRow[], eventId?: string | null) {
  if (!eventId) {
    return null
  }

  return events.find((event) => event.id === eventId)?.name ?? null
}

export function buildConsistencyIssues(params: BuildConsistencyIssuesParams): {
  issues: IntelligenceConsistencyIssue[]
  summary: IntelligenceConsistencySummary
} {
  const paymentOrderIds = new Set(params.payments.map((payment) => payment.order_id))
  const orderItemIds = new Set(params.orderItemIds)
  const recipientRunIds = new Set(params.campaignRecipients.map((recipient) => recipient.campaign_run_id))
  const customerProfileIds = new Set(params.customerProfiles.map((profile) => profile.customer_id))

  const issues: IntelligenceConsistencyIssue[] = []

  for (const order of params.orders) {
    if (order.total_amount <= 0) {
      continue
    }

    if (!['paid', 'pending', 'processing'].includes(order.status)) {
      continue
    }

    if (paymentOrderIds.has(order.id)) {
      continue
    }

    issues.push({
      id: `order-payment-${order.id}`,
      type: 'order_payment',
      severity: order.status === 'paid' ? 'critical' : 'warning',
      status: 'open',
      title: 'Pedido sem pagamento associado',
      description: `Pedido ${order.id.slice(0, 8).toUpperCase()} esta em ${order.status} sem registro de pagamento.`,
      event_id: order.event_id,
      event_name: eventNameById(params.events, order.event_id),
      entity_id: order.id,
      created_at: order.created_at,
    })
  }

  for (const ticket of params.digitalTickets) {
    if (ticket.order_item_id && orderItemIds.has(ticket.order_item_id)) {
      continue
    }

    issues.push({
      id: `ticket-link-${ticket.id}`,
      type: 'ticket_link',
      severity: 'critical',
      status: 'open',
      title: 'Ticket digital sem item de pedido valido',
      description: `Ticket ${ticket.id.slice(0, 8).toUpperCase()} não aponta para um order_item existente.`,
      event_id: ticket.event_id ?? null,
      event_name: eventNameById(params.events, ticket.event_id ?? null),
      entity_id: ticket.id,
      created_at: ticket.created_at,
    })
  }

  for (const checkin of params.checkins) {
    if (checkin.result !== 'success') {
      continue
    }

    if (checkin.digital_ticket_id) {
      continue
    }

    issues.push({
      id: `checkin-${checkin.id}`,
      type: 'checkin',
      severity: checkin.is_exit ? 'warning' : 'critical',
      status: 'open',
      title: 'Check-in sem ticket associado',
      description: `Registro ${checkin.id.slice(0, 8).toUpperCase()} foi processado com sucesso sem digital_ticket_id.`,
      event_id: checkin.event_id,
      event_name: eventNameById(params.events, checkin.event_id),
      entity_id: checkin.id,
      created_at: checkin.checked_in_at,
    })
  }

  for (const run of params.campaignRuns) {
    if (run.audience_count <= 0 || recipientRunIds.has(run.id)) {
      continue
    }

    issues.push({
      id: `campaign-${run.id}`,
      type: 'campaign',
      severity: 'warning',
      status: 'open',
      title: 'Execução de campanha sem destinatarios',
      description: `Run ${run.name} foi criada com audiencia > 0 mas ainda não possui recipients.`,
      event_id: run.event_id ?? null,
      event_name: eventNameById(params.events, run.event_id ?? null),
      entity_id: run.id,
      created_at: run.created_at,
    })
  }

  for (const customer of params.customers) {
    if (customer.total_orders <= 0 || customerProfileIds.has(customer.id)) {
      continue
    }

    issues.push({
      id: `crm-${customer.id}`,
      type: 'crm',
      severity: 'warning',
      status: 'open',
      title: 'Customer sem vinculo de evento',
      description: `${customer.full_name} possui pedidos consolidados sem perfil em customer_event_profiles.`,
      entity_id: customer.id,
      created_at: customer.created_at,
    })
  }

  for (const row of params.financialOverview.reconciliation_rows) {
    if (row.reconciliation_status === 'matched') {
      continue
    }

    issues.push({
      id: `financial-${row.order_id}`,
      type: 'financial',
      severity: row.reconciliation_status === 'divergent' ? 'critical' : 'warning',
      status: 'open',
      title: 'Divergencia financeira detectada',
      description: row.issue_label,
      event_id: row.event_id,
      event_name: row.event_name,
      entity_id: row.order_id,
      created_at: row.created_at,
    })
  }

  const summary: IntelligenceConsistencySummary = {
    total_issues: issues.length,
    critical_issues: issues.filter((issue) => issue.severity === 'critical').length,
    warning_issues: issues.filter((issue) => issue.severity === 'warning').length,
    open_issues: issues.filter((issue) => issue.status === 'open').length,
    resolved_issues: issues.filter((issue) => issue.status === 'resolved').length,
  }

  return {
    issues: issues.sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime()),
    summary,
  }
}
