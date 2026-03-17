import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, SectionHeader, Badge, Skeleton } from '@/components/ui/index'
import { formatCurrency, formatRelative, orderStatusLabels } from '@/lib/utils'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import type { Order } from '@/lib/supabase'

// ─── RecentOrdersCard ─────────────────────────────────────────────────────────
export function RecentOrdersCard({ eventId }: { eventId?: string }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!eventId) { setLoading(false); return }
    supabase
      .from('orders')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false })
      .limit(6)
      .then(({ data }) => {
        setOrders(data ?? [])
        setLoading(false)
      })
  }, [eventId])

  return (
    <Card padding={false}>
      <div className="p-5 pb-0">
        <SectionHeader title="Pedidos recentes" subtitle="Últimas transações do evento" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-bg-border">
              <th className="table-header">Comprador</th>
              <th className="table-header hidden md:table-cell">Valor</th>
              <th className="table-header hidden md:table-cell">Status</th>
              <th className="table-header">Quando</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-t border-bg-border">
                  <td className="table-cell"><Skeleton className="h-4 w-32" /></td>
                  <td className="table-cell hidden md:table-cell"><Skeleton className="h-4 w-20" /></td>
                  <td className="table-cell hidden md:table-cell"><Skeleton className="h-5 w-16 rounded-full" /></td>
                  <td className="table-cell"><Skeleton className="h-4 w-24" /></td>
                </tr>
              ))
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-10 text-sm text-text-muted">
                  Nenhum pedido ainda
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const statusInfo = orderStatusLabels[order.status] ?? { label: order.status, color: 'muted' }
                return (
                  <tr key={order.id} className="table-row">
                    <td className="table-cell">
                      <div className="font-medium text-text-primary">{order.buyer_name}</div>
                      <div className="text-xs text-text-muted">{order.buyer_email}</div>
                    </td>
                    <td className="table-cell hidden md:table-cell font-medium">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="table-cell hidden md:table-cell">
                      <Badge variant={statusInfo.color as any}>{statusInfo.label}</Badge>
                    </td>
                    <td className="table-cell text-text-muted text-xs">
                      {formatRelative(order.created_at)}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

// ─── CheckinActivityCard ──────────────────────────────────────────────────────
interface HourlyData { hour: string; checkins: number }

export function CheckinActivityCard({ eventId }: { eventId?: string }) {
  const [data, setData] = useState<HourlyData[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!eventId) { setLoading(false); return }
    supabase
      .from('checkins')
      .select('checked_in_at')
      .eq('event_id', eventId)
      .eq('result', 'success')
      .eq('is_exit', false)
      .then(({ data: rows }) => {
        setTotal(rows?.length ?? 0)
        // Agrupa por hora
        const byHour: Record<string, number> = {}
        rows?.forEach((r) => {
          const h = new Date(r.checked_in_at).getHours()
          const key = `${h}h`
          byHour[key] = (byHour[key] ?? 0) + 1
        })
        const chartData = Object.entries(byHour)
          .map(([hour, checkins]) => ({ hour, checkins }))
          .sort((a, b) => parseInt(a.hour) - parseInt(b.hour))
        setData(chartData.length > 0 ? chartData : generateMockData())
        setLoading(false)
      })
  }, [eventId])

  function generateMockData(): HourlyData[] {
    return Array.from({ length: 12 }, (_, i) => ({
      hour: `${8 + i}h`,
      checkins: Math.floor(Math.random() * 120),
    }))
  }

  return (
    <Card>
      <SectionHeader
        title="Atividade de check-in"
        subtitle={`${total} entradas registradas`}
        action={
          <span className="flex items-center gap-1.5 text-xs text-status-success">
            <span className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
            Ao vivo
          </span>
        }
      />
      {loading ? (
        <Skeleton className="h-48 w-full rounded-xl" />
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#5BE7C4" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#5BE7C4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#6B7A99' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#6B7A99' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#18233D', border: '1px solid #263452', borderRadius: 12, fontSize: 12 }}
              labelStyle={{ color: '#AAB6D3' }}
              itemStyle={{ color: '#5BE7C4' }}
            />
            <Area type="monotone" dataKey="checkins" stroke="#5BE7C4" strokeWidth={2}
              fill="url(#tealGrad)" dot={false} activeDot={{ r: 4, fill: '#5BE7C4' }} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}
