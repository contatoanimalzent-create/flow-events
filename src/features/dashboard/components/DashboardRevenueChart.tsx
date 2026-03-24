import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { DashboardRevenuePoint } from '@/features/dashboard/types'
import { formatCurrency } from '@/shared/lib'

interface DashboardRevenueChartProps {
  data: DashboardRevenuePoint[]
}

export function DashboardRevenueChart({ data }: DashboardRevenueChartProps) {
  return (
    <div className="card p-5">
      <div className="mb-4">
        <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted">Receita por periodo</div>
        <div className="mt-1 text-lg font-semibold text-text-primary">Evolucao consolidada de receita bruta e liquida</div>
      </div>
      {data.length === 0 ? (
        <div className="py-16 text-center text-sm text-text-muted">Sem dados suficientes para gerar a serie de receita.</div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="grossRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d4ff00" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#d4ff00" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="netRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#23d2ff" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#23d2ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#202020" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#727272' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#727272' }} axisLine={false} tickLine={false} tickFormatter={(value) => `R$${Math.round(Number(value) / 1000)}k`} />
            <Tooltip
              formatter={(value: number, name: string) => [formatCurrency(value), name === 'grossRevenue' ? 'Receita bruta' : 'Receita liquida']}
              contentStyle={{ backgroundColor: '#111111', border: '1px solid #262626', borderRadius: '8px' }}
            />
            <Area type="monotone" dataKey="grossRevenue" stroke="#d4ff00" fill="url(#grossRevenueGradient)" strokeWidth={2} />
            <Area type="monotone" dataKey="netRevenue" stroke="#23d2ff" fill="url(#netRevenueGradient)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
