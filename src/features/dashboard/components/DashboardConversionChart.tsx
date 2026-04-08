import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { DashboardConversionPoint } from '@/features/dashboard/types'

interface DashboardConversionChartProps {
  data: DashboardConversionPoint[]
}

export function DashboardConversionChart({ data }: DashboardConversionChartProps) {
  return (
    <div className="card p-5">
      <div className="mb-4">
        <div className="text-[10px] font-mono uppercase tracking-widest text-text-muted">Conversao por evento</div>
        <div className="mt-1 text-lg font-semibold text-text-primary">Taxa de ocupacao entre capacidade e ingressos vendidos</div>
      </div>
      {data.length === 0 ? (
        <div className="py-16 text-center text-sm text-text-muted">Sem eventos suficientes para gerar a conversao.</div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} interval={0} angle={-15} textAnchor="end" height={60} />
            <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, 'Conversao']} contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#FFFFFF' }} />
            <Bar dataKey="conversionRate" fill="#0057E7" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
