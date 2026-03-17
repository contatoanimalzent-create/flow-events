import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/store/auth'
import { StatCard, Card, SectionHeader, Badge, EmptyState, SkeletonCard } from '@/components/ui/index'
import { GrowthInsightCard } from '@/components/dashboard/GrowthInsightCard'
import { RecentOrdersCard, CheckinActivityCard } from '@/components/dashboard/RecentOrdersCard'
import {
  Ticket, DollarSign, Users, ScanLine, TrendingUp,
  AlertTriangle, CalendarDays, Package, Truck, Zap
} from 'lucide-react'
import { formatCurrency, formatNumber, formatDaysUntil, formatDate } from '@/lib/utils'
import type { Event } from '@/lib/supabase'

interface DashboardStats {
  ticketsSold: number
  grossRevenue: number
  netRevenue: number
  checkinsTotal: number
  attendanceRate: number
  staffConfirmed: number
  suppliersConfirmed: number
  productsSold: number
  pendingAlerts: number
}

export function DashboardPage() {
  const { organization } = useAuthStore()
  const [mainEvent, setMainEvent] = useState<Event | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [insights, setInsights] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (organization) fetchDashboard()
  }, [organization])

  async function fetchDashboard() {
    setLoading(true)
    try {
      // Busca evento principal (próximo publicado)
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .eq('organization_id', organization!.id)
        .in('status', ['published', 'ongoing'])
        .order('starts_at', { ascending: true })
        .limit(1)

      if (events?.[0]) {
        setMainEvent(events[0])
        const event = events[0]

        // Busca stats do evento
        const [ordersRes, checkinsRes, staffRes, suppliersRes] = await Promise.all([
          supabase.from('orders').select('total_amount, status').eq('event_id', event.id).eq('status', 'paid'),
          supabase.from('checkins').select('id').eq('event_id', event.id).eq('result', 'success').eq('is_exit', false),
          supabase.from('staff_members').select('status').eq('event_id', event.id).in('status', ['confirmed', 'active']),
          supabase.from('suppliers').select('status').eq('event_id', event.id).eq('status', 'confirmed'),
        ])

        const gross = ordersRes.data?.reduce((s, o) => s + (o.total_amount || 0), 0) ?? 0
        const checkins = checkinsRes.data?.length ?? 0
        const capacity = event.total_capacity ?? 1

        setStats({
          ticketsSold: event.sold_tickets,
          grossRevenue: gross,
          netRevenue: gross * 0.95,
          checkinsTotal: checkins,
          attendanceRate: event.sold_tickets > 0 ? (checkins / event.sold_tickets) * 100 : 0,
          staffConfirmed: staffRes.data?.length ?? 0,
          suppliersConfirmed: suppliersRes.data?.length ?? 0,
          productsSold: 0,
          pendingAlerts: 2,
        })
      }

      // Busca growth insights
      const { data: insightsData } = await supabase
        .from('growth_insights')
        .select('*')
        .eq('organization_id', organization!.id)
        .eq('is_dismissed', false)
        .order('priority', { ascending: false })
        .limit(3)

      setInsights(insightsData ?? [])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">

      {/* Evento principal */}
      {mainEvent ? (
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-teal/5 via-transparent to-brand-purple/5 pointer-events-none" />
          <div className="relative flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="success">● Publicado</Badge>
                <span className="text-xs text-text-muted">{formatDaysUntil(mainEvent.starts_at)}</span>
              </div>
              <h2 className="text-xl font-bold text-text-primary">{mainEvent.name}</h2>
              {mainEvent.subtitle && <p className="text-sm text-text-secondary mt-0.5">{mainEvent.subtitle}</p>}
              <div className="flex items-center gap-4 mt-3 text-xs text-text-muted">
                <span className="flex items-center gap-1">
                  <CalendarDays className="w-3.5 h-3.5" />
                  {formatDate(mainEvent.starts_at, "dd 'de' MMMM 'de' yyyy")}
                </span>
                {mainEvent.venue_name && (
                  <span>📍 {mainEvent.venue_name}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-6 shrink-0">
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-teal">{formatNumber(mainEvent.sold_tickets)}</div>
                <div className="text-xs text-text-muted">ingressos</div>
              </div>
              {mainEvent.total_capacity && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-text-primary">
                    {Math.round((mainEvent.sold_tickets / mainEvent.total_capacity) * 100)}%
                  </div>
                  <div className="text-xs text-text-muted">ocupação</div>
                </div>
              )}
            </div>
          </div>

          {/* Progress bar de ocupação */}
          {mainEvent.total_capacity && (
            <div className="relative mt-4">
              <div className="h-1.5 bg-bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-teal rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min((mainEvent.sold_tickets / mainEvent.total_capacity) * 100, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-text-muted mt-1">
                <span>{formatNumber(mainEvent.sold_tickets)} vendidos</span>
                <span>{formatNumber(mainEvent.total_capacity)} capacidade</span>
              </div>
            </div>
          )}
        </Card>
      ) : (
        <Card>
          <EmptyState
            icon={CalendarDays}
            title="Nenhum evento ativo"
            description="Crie seu primeiro evento para começar a ver as métricas aqui."
            action={
              <button className="btn-primary">Criar evento</button>
            }
          />
        </Card>
      )}

      {/* Métricas principais */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Ingressos vendidos"
            value={formatNumber(stats.ticketsSold)}
            icon={Ticket}
            iconColor="bg-brand-teal/10"
          />
          <StatCard
            label="Receita bruta"
            value={formatCurrency(stats.grossRevenue)}
            icon={DollarSign}
            iconColor="bg-status-success/10"
          />
          <StatCard
            label="Check-ins"
            value={formatNumber(stats.checkinsTotal)}
            change={`${stats.attendanceRate.toFixed(1)}% de comparecimento`}
            changeType="neutral"
            icon={ScanLine}
            iconColor="bg-brand-blue/10"
          />
          <StatCard
            label="Staff confirmado"
            value={formatNumber(stats.staffConfirmed)}
            icon={Users}
            iconColor="bg-brand-purple/10"
          />
        </div>
      )}

      {/* Grid de conteúdo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Atividade de check-in */}
        <div className="lg:col-span-2">
          <CheckinActivityCard eventId={mainEvent?.id} />
        </div>

        {/* Alertas operacionais */}
        <div>
          <Card>
            <SectionHeader
              title="Alertas"
              subtitle="Itens que precisam de atenção"
              action={<Badge variant="warning">{stats?.pendingAlerts ?? 0}</Badge>}
            />
            <div className="space-y-3">
              {[
                { msg: 'QR não enviado para 12 compradores', type: 'warning' as const },
                { msg: '3 fornecedores sem documentação', type: 'error' as const },
              ].map((alert, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-xl text-sm
                  ${alert.type === 'warning' ? 'bg-status-warning/5 text-status-warning' : 'bg-status-error/5 text-status-error'}`}>
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{alert.msg}</span>
                </div>
              ))}
              <div className="text-xs text-text-muted text-center pt-2">Tudo certo! Nenhum outro alerta.</div>
            </div>
          </Card>
        </div>
      </div>

      {/* Pedidos recentes + Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentOrdersCard eventId={mainEvent?.id} />
        </div>
        <div className="space-y-4">
          <SectionHeader
            title="Growth Services"
            action={<Zap className="w-4 h-4 text-brand-purple" />}
          />
          {insights.length > 0 ? (
            insights.map((insight) => (
              <GrowthInsightCard key={insight.id} insight={insight} />
            ))
          ) : (
            <Card>
              <EmptyState
                icon={TrendingUp}
                title="Tudo otimizado!"
                description="Nenhuma sugestão no momento."
              />
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}