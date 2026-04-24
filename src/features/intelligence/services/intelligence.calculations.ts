import type { FinancialEventReport } from '@/features/financial/types'
import type {
  IntelligenceAlert,
  IntelligenceAlertSeverity,
  IntelligenceAlertStateRow,
  IntelligenceAlertStatus,
  IntelligenceEventHealth,
  IntelligenceOverview,
  IntelligenceRecommendation,
  IntelligenceRecommendationPriority,
} from '@/features/intelligence/types'

interface IntelligenceEventSource {
  id: string
  name: string
  starts_at: string
  status: string
  sold_tickets: number
  checked_in_count: number
}

interface IntelligenceBatchSource {
  id: string
  event_id: string
  name: string
  quantity: number
  sold_count: number
  reserved_count: number
  is_active: boolean
}

interface IntelligenceGateSource {
  id: string
  event_id: string
  name: string
  is_active: boolean
  device_count: number
  throughput_per_hour: number
}

interface IntelligenceStaffSource {
  id: string
  event_id: string
  gate_id?: string | null
  status: string
  is_active: boolean
}

interface IntelligenceCheckinSource {
  id: string
  event_id: string
  gate_id?: string | null
  result: string
  checked_in_at: string
  is_exit: boolean
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function roundMetric(value: number) {
  return Math.round(value * 10) / 10
}

function buildAlertId(eventId: string, code: string) {
  return `intelligence:${eventId}:${code}`
}

function buildEmptyOverview(): IntelligenceOverview {
  return {
    health_scores: [],
    alerts: [],
    recommendations: [],
    consistency: {
      issues: [],
      summary: {
        total_issues: 0,
        critical_issues: 0,
        warning_issues: 0,
        open_issues: 0,
        resolved_issues: 0,
      },
    },
    summary: {
      average_overall_health: 0,
      active_alerts_count: 0,
      acknowledged_alerts_count: 0,
      critical_alerts_count: 0,
      high_risk_events_count: 0,
      consistency_issues_count: 0,
      critical_consistency_issues_count: 0,
    },
  }
}

function mapStatus(alertId: string, statesByAlertId: Map<string, IntelligenceAlertStateRow>): IntelligenceAlertStatus {
  return statesByAlertId.get(alertId)?.status ?? 'active'
}

function mapAcknowledgedAt(alertId: string, statesByAlertId: Map<string, IntelligenceAlertStateRow>) {
  return statesByAlertId.get(alertId)?.acknowledged_at ?? null
}

function mapNotes(alertId: string, statesByAlertId: Map<string, IntelligenceAlertStateRow>) {
  return statesByAlertId.get(alertId)?.notes ?? null
}

function buildRecommendationFromAlert(eventId: string, eventName: string, code: string, sourceAlertId: string): IntelligenceRecommendation {
  const mapping: Record<string, { title: string; description: string; action_label: string; priority: IntelligenceRecommendationPriority }> = {
    sales_below_forecast: {
      title: 'Reforcar campanha do evento',
      description: 'A receita realizada esta abaixo do forecast e precisa de ação comercial imediata.',
      action_label: 'Priorizar growth',
      priority: 'high',
    },
    low_conversion_batch: {
      title: 'Revisar lote e precificação',
      description: 'Existe lote ativo com baixa conversão e risco de travar a tracao comercial do evento.',
      action_label: 'Revisar lote',
      priority: 'medium',
    },
    margin_critical: {
      title: 'Proteger margem projetada',
      description: 'A margem projetada do evento esta crítica e demanda corte de custo ou aumento de receita.',
      action_label: 'Ajustar operação',
      priority: 'high',
    },
    financial_divergence: {
      title: 'Resolver divergencias financeiras',
      description: 'Existem pedidos ou pagamentos divergentes afetando a confiabilidade do fechamento.',
      action_label: 'Conciliar agora',
      priority: 'high',
    },
    payout_pending: {
      title: 'Revisar repasse do evento',
      description: 'O repasse do evento esta retido, divergente ou sem revisao executiva.',
      action_label: 'Abrir financeiro',
      priority: 'high',
    },
    closure_stuck: {
      title: 'Destravar fechamento operacional',
      description: 'O evento ainda possui pendencias para fechamento operacional-financeiro.',
      action_label: 'Fechar pendencias',
      priority: 'high',
    },
    batch_near_sellout: {
      title: 'Preparar próximo lote',
      description: 'O lote atual esta perto de esgotar e precisa de transicao controlada para não perder venda.',
      action_label: 'Planejar virada',
      priority: 'medium',
    },
    invalid_checkin_rate: {
      title: 'Revisar operação de entrada',
      description: 'A taxa de válidação invalida no check-in esta acima do esperado.',
      action_label: 'Ajustar check-in',
      priority: 'high',
    },
    gate_low_throughput: {
      title: 'Reforcar gate crítico',
      description: 'Existe gate com throughput abaixo do esperado para a operação em tempo real.',
      action_label: 'Realocar equipe',
      priority: 'medium',
    },
    staff_insufficient: {
      title: 'Reforcar staff operacional',
      description: 'A alocacao de staff não cobre a operação prevista nas portarias ativas.',
      action_label: 'Convocar staff',
      priority: 'high',
    },
  }

  const selected = mapping[code] ?? {
    title: 'Priorizar evento em risco',
    description: 'O evento possui sinais criticos e precisa de acompanhamento executivo.',
    action_label: 'Abrir intelligence',
    priority: 'medium' as const,
  }

  return {
    id: `rec:${eventId}:${code}`,
    event_id: eventId,
    event_name: eventName,
    priority: selected.priority,
    title: selected.title,
    description: selected.description,
    action_label: selected.action_label,
    source_alert_ids: [sourceAlertId],
  }
}

export function buildIntelligenceOverview(params: {
  events: IntelligenceEventSource[]
  financialReports: FinancialEventReport[]
  batches: IntelligenceBatchSource[]
  gates: IntelligenceGateSource[]
  staff: IntelligenceStaffSource[]
  checkins: IntelligenceCheckinSource[]
  alertStates: IntelligenceAlertStateRow[]
}): IntelligenceOverview {
  if (params.events.length === 0) {
    return buildEmptyOverview()
  }

  const reportByEventId = new Map(params.financialReports.map((report) => [report.event_id, report]))
  const statesByAlertId = new Map(params.alertStates.map((state) => [state.alert_id, state]))
  const alerts: IntelligenceAlert[] = []
  const recommendationsMap = new Map<string, IntelligenceRecommendation>()

  const pushAlert = (input: {
    eventId: string
    eventName: string
    code: string
    type: IntelligenceAlert['type']
    severity: IntelligenceAlertSeverity
    title: string
    description: string
    recommendation: string
    metricLabel?: string
    metricValue?: string
    createdAt: string
  }) => {
    const id = buildAlertId(input.eventId, input.code)
    const alert: IntelligenceAlert = {
      id,
      event_id: input.eventId,
      event_name: input.eventName,
      type: input.type,
      severity: input.severity,
      status: mapStatus(id, statesByAlertId),
      title: input.title,
      description: input.description,
      recommendation: input.recommendation,
      metric_label: input.metricLabel ?? null,
      metric_value: input.metricValue ?? null,
      created_at: input.createdAt,
      acknowledged_at: mapAcknowledgedAt(id, statesByAlertId),
      notes: mapNotes(id, statesByAlertId),
    }

    alerts.push(alert)

    const recommendation = buildRecommendationFromAlert(input.eventId, input.eventName, input.code, id)
    const existing = recommendationsMap.get(recommendation.id)

    if (existing) {
      existing.source_alert_ids.push(id)
      return
    }

    recommendationsMap.set(recommendation.id, recommendation)
  }

  const healthScores: IntelligenceEventHealth[] = params.events.map((event) => {
    const report = reportByEventId.get(event.id)
    const eventBatches = params.batches.filter((batch) => batch.event_id === event.id)
    const eventGates = params.gates.filter((gate) => gate.event_id === event.id && gate.is_active)
    const eventStaff = params.staff.filter((member) => member.event_id === event.id && member.is_active)
    const eventCheckins = params.checkins.filter((checkin) => checkin.event_id === event.id)
    const recentCheckins = eventCheckins.filter((checkin) => Date.now() - new Date(checkin.checked_in_at).getTime() <= 2 * 60 * 60 * 1000)

    const totalAttempts = eventCheckins.filter((entry) => !entry.is_exit).length
    const invalidAttempts = eventCheckins.filter((entry) => entry.result !== 'success' && !entry.is_exit).length
    const invalidRate = totalAttempts > 0 ? invalidAttempts / totalAttempts : 0
    const attendanceRate = event.sold_tickets > 0 ? event.checked_in_count / event.sold_tickets : 0

    const nearSelloutBatches = eventBatches.filter((batch) => {
      const available = batch.quantity - batch.sold_count - batch.reserved_count
      return batch.is_active && available <= Math.max(5, batch.quantity * 0.1)
    })

    const lowConversionBatches = eventBatches.filter((batch) => {
      const sellThrough = batch.quantity > 0 ? batch.sold_count / batch.quantity : 0
      return batch.is_active && batch.quantity >= 20 && sellThrough <= 0.12
    })

    const lowThroughputGates = eventGates.filter((gate) => {
      if (event.status !== 'ongoing') {
        return false
      }

      const successCount = recentCheckins.filter((entry) => entry.gate_id === gate.id && entry.result === 'success' && !entry.is_exit).length
      const expectedFloor = Math.max(4, Math.round((gate.throughput_per_hour || 40) * 0.25))
      return successCount < expectedFloor
    })

    const insufficientStaffGates = eventGates.filter((gate) => {
      const assigned = eventStaff.filter((member) => member.gate_id === gate.id && ['confirmed', 'active'].includes(member.status)).length
      return assigned < Math.max(1, gate.device_count || 1)
    })

    if (report) {
      if (report.net_sales < report.projected_revenue * 0.75) {
        pushAlert({
          eventId: event.id,
          eventName: event.name,
          code: 'sales_below_forecast',
          type: 'sales',
          severity: 'critical',
          title: 'Vendas abaixo do forecast',
          description: 'A receita liquida realizada esta abaixo do ritmo esperado para o evento.',
          recommendation: 'Reforcar campanha e revisar a estratégia comercial.',
          metricLabel: 'Realizado x projetado',
          metricValue: `${roundMetric((report.net_sales / Math.max(report.projected_revenue, 1)) * 100)}%`,
          createdAt: event.starts_at,
        })
      }

      if (report.projected_margin < 0 || report.projected_margin_percent < 10) {
        pushAlert({
          eventId: event.id,
          eventName: event.name,
          code: 'margin_critical',
          type: 'financial',
          severity: 'critical',
          title: 'Margem projetada crítica',
          description: 'A margem projetada do evento esta pressionada e pode comprometer o resultado final.',
          recommendation: 'Revisar custos, ticket medio e política comercial.',
          metricLabel: 'Margem projetada',
          metricValue: `${report.projected_margin_percent.toFixed(1)}%`,
          createdAt: event.starts_at,
        })
      }

      if (report.reconciliation_divergent_count > 0) {
        pushAlert({
          eventId: event.id,
          eventName: event.name,
          code: 'financial_divergence',
          type: 'financial',
          severity: 'critical',
          title: 'Divergencia financeira detectada',
          description: 'Existem pedidos ou pagamentos sem conciliacao correta no evento.',
          recommendation: 'Conciliar pedidos e pagamentos antes do fechamento.',
          metricLabel: 'Divergencias',
          metricValue: String(report.reconciliation_divergent_count),
          createdAt: event.starts_at,
        })
      }

      if (['held', 'divergent'].includes(report.payout_status) || (report.payout_status === 'draft' && report.net_sales > 0)) {
        pushAlert({
          eventId: event.id,
          eventName: event.name,
          code: 'payout_pending',
          type: 'financial',
          severity: report.payout_status === 'divergent' ? 'critical' : 'warning',
          title: 'Repasse pendente ou retido',
          description: 'O repasse do evento ainda não esta liberado de forma segura para o organizador.',
          recommendation: 'Revisar retencoes, divergencias e agenda de repasse.',
          metricLabel: 'Status do repasse',
          metricValue: report.payout_status,
          createdAt: event.starts_at,
        })
      }

      if (report.closure_pending_count > 0 && ['ongoing', 'finished', 'archived'].includes(event.status)) {
        pushAlert({
          eventId: event.id,
          eventName: event.name,
          code: 'closure_stuck',
          type: 'financial',
          severity: report.closure_pending_count >= 3 ? 'critical' : 'warning',
          title: 'Fechamento travado',
          description: 'O evento ainda possui pendencias financeiras ou operacionais para fechamento.',
          recommendation: 'Priorizar as pendencias antes do encerramento definitivo.',
          metricLabel: 'Pendencias',
          metricValue: String(report.closure_pending_count),
          createdAt: event.starts_at,
        })
      }

      if (report.ticket_emails_sent < report.approved_payments_count) {
        pushAlert({
          eventId: event.id,
          eventName: event.name,
          code: 'audience_delivery_gap',
          type: 'audience',
          severity: 'warning',
          title: 'Entrega de ingressos abaixo do esperado',
          description: 'Nem todos os compradores confirmados receberam os ingressos digitais.',
          recommendation: 'Reenviar os ingressos e revisar a fila transacional.',
          metricLabel: 'Ingressos enviados',
          metricValue: `${report.ticket_emails_sent}/${report.approved_payments_count}`,
          createdAt: event.starts_at,
        })
      }
    }

    if (nearSelloutBatches.length > 0) {
      pushAlert({
        eventId: event.id,
        eventName: event.name,
        code: 'batch_near_sellout',
        type: 'sales',
        severity: 'info',
        title: 'Lote perto de esgotar',
        description: `${nearSelloutBatches[0].name} esta perto de esgotar e precisa de acompanhamento comercial.`,
        recommendation: 'Preparar virada de lote e comunicar urgencia de compra.',
        metricLabel: 'Lotes criticos',
        metricValue: String(nearSelloutBatches.length),
        createdAt: event.starts_at,
      })
    }

    if (lowConversionBatches.length > 0) {
      pushAlert({
        eventId: event.id,
        eventName: event.name,
        code: 'low_conversion_batch',
        type: 'sales',
        severity: 'warning',
        title: 'Lote com baixa conversão',
        description: `${lowConversionBatches[0].name} esta vendendo abaixo do esperado para o volume disponível.`,
        recommendation: 'Revisar oferta, copy e preço do lote.',
        metricLabel: 'Lotes lentos',
        metricValue: String(lowConversionBatches.length),
        createdAt: event.starts_at,
      })
    }

    if (invalidRate > 0.08) {
      pushAlert({
        eventId: event.id,
        eventName: event.name,
        code: 'invalid_checkin_rate',
        type: 'operations',
        severity: invalidRate > 0.15 ? 'critical' : 'warning',
        title: 'Taxa alta de check-in invalido',
        description: 'A operação de entrada esta registrando válidações invalidas acima do esperado.',
        recommendation: 'Revisar scanner, orientacao de fila e treinamento de equipe.',
        metricLabel: 'Taxa invalida',
        metricValue: `${roundMetric(invalidRate * 100)}%`,
        createdAt: event.starts_at,
      })
    }

    if (lowThroughputGates.length > 0) {
      pushAlert({
        eventId: event.id,
        eventName: event.name,
        code: 'gate_low_throughput',
        type: 'operations',
        severity: 'warning',
        title: 'Gate com throughput baixo',
        description: `${lowThroughputGates[0].name} esta abaixo do throughput esperado para a operação ao vivo.`,
        recommendation: 'Reforcar time ou redistribuir fluxo entre as portarias.',
        metricLabel: 'Gates afetados',
        metricValue: String(lowThroughputGates.length),
        createdAt: event.starts_at,
      })
    }

    if (insufficientStaffGates.length > 0) {
      pushAlert({
        eventId: event.id,
        eventName: event.name,
        code: 'staff_insufficient',
        type: 'operations',
        severity: 'critical',
        title: 'Staff insuficiente em gate',
        description: `${insufficientStaffGates[0].name} não possui cobertura operacional suficiente.`,
        recommendation: 'Realocar staff e cobrir o gate crítico imediatamente.',
        metricLabel: 'Gates descobertos',
        metricValue: String(insufficientStaffGates.length),
        createdAt: event.starts_at,
      })
    }

    let salesScore = 100
    if (report && report.net_sales < report.projected_revenue * 0.75) salesScore -= 30
    if (lowConversionBatches.length > 0) salesScore -= 20
    if (report && report.pending_orders_count > 0) salesScore -= 10

    let opsScore = 100
    if (invalidRate > 0.08) opsScore -= invalidRate > 0.15 ? 35 : 20
    if (lowThroughputGates.length > 0) opsScore -= 20
    if (insufficientStaffGates.length > 0) opsScore -= 25

    let financeScore = 100
    if (report && report.reconciliation_divergent_count > 0) financeScore -= 35
    if (report && ['held', 'divergent', 'draft'].includes(report.payout_status) && report.net_sales > 0) financeScore -= 20
    if (report && report.closure_pending_count > 0) financeScore -= 15
    if (report && (report.projected_margin < 0 || report.projected_margin_percent < 10)) financeScore -= 25

    let audienceScore = 100
    if (attendanceRate < 0.5 && ['ongoing', 'finished'].includes(event.status)) audienceScore -= 20
    if (report && report.order_confirmation_emails_sent < report.approved_payments_count) audienceScore -= 10
    if (report && report.ticket_emails_sent < report.approved_payments_count) audienceScore -= 15
    if (lowConversionBatches.length > 0) audienceScore -= 10

    const eventAlerts = alerts.filter((alert) => alert.event_id === event.id)
    const activeAlerts = eventAlerts.filter((alert) => alert.status === 'active')
    const overallHealth = clampScore((clampScore(salesScore) + clampScore(opsScore) + clampScore(financeScore) + clampScore(audienceScore)) / 4)

    return {
      event_id: event.id,
      event_name: event.name,
      starts_at: event.starts_at,
      status: event.status,
      sales_health_score: clampScore(salesScore),
      ops_health_score: clampScore(opsScore),
      finance_health_score: clampScore(financeScore),
      audience_health_score: clampScore(audienceScore),
      overall_health_score: overallHealth,
      active_alert_count: activeAlerts.length,
      critical_alert_count: activeAlerts.filter((alert) => alert.severity === 'critical').length,
      recommendation_count: Array.from(recommendationsMap.values()).filter((recommendation) => recommendation.event_id === event.id).length,
      top_alert_title: activeAlerts[0]?.title ?? null,
    }
  })

  const recommendations = Array.from(recommendationsMap.values()).sort((left, right) => {
    const priorityOrder: Record<IntelligenceRecommendationPriority, number> = { high: 0, medium: 1, low: 2 }
    return priorityOrder[left.priority] - priorityOrder[right.priority]
  })

  const orderedAlerts = alerts.sort((left, right) => {
    const severityOrder: Record<IntelligenceAlertSeverity, number> = { critical: 0, warning: 1, info: 2 }
    return severityOrder[left.severity] - severityOrder[right.severity]
  })

  return {
    health_scores: healthScores.sort((left, right) => right.overall_health_score - left.overall_health_score),
    alerts: orderedAlerts,
    recommendations,
    consistency: {
      issues: [],
      summary: {
        total_issues: 0,
        critical_issues: 0,
        warning_issues: 0,
        open_issues: 0,
        resolved_issues: 0,
      },
    },
    summary: {
      average_overall_health:
        healthScores.length > 0 ? roundMetric(healthScores.reduce((total, item) => total + item.overall_health_score, 0) / healthScores.length) : 0,
      active_alerts_count: orderedAlerts.filter((alert) => alert.status === 'active').length,
      acknowledged_alerts_count: orderedAlerts.filter((alert) => alert.status === 'acknowledged').length,
      critical_alerts_count: orderedAlerts.filter((alert) => alert.severity === 'critical' && alert.status === 'active').length,
      high_risk_events_count: healthScores.filter((score) => score.overall_health_score < 60).length,
      consistency_issues_count: 0,
      critical_consistency_issues_count: 0,
    },
  }
}
