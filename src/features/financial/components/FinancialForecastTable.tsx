import { cn, formatCurrency, formatDate } from '@/shared/lib'
import { FINANCIAL_FORECAST_RISK_LABELS } from '@/features/financial/types'
import type { FinancialEventReport } from '@/features/financial/types'

interface FinancialForecastTableProps {
  reports: FinancialEventReport[]
  onEditForecast: (report: FinancialEventReport) => void
}

function getRiskColor(risk: FinancialEventReport['risk_status']) {
  if (risk === 'high') {
    return 'text-status-error'
  }

  if (risk === 'medium') {
    return 'text-status-warning'
  }

  return 'text-status-success'
}

export function FinancialForecastTable({ reports, onEditForecast }: FinancialForecastTableProps) {
  if (reports.length === 0) {
    return (
      <div className="card p-16 text-center">
        <div className="font-display text-2xl text-text-primary">NENHUM FORECAST</div>
        <p className="mt-2 text-sm text-text-muted">Selecione um evento ou lance uma previsao para comparar realizado x projetado.</p>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden">
      <table className="w-full">
        <thead className="border-b border-bg-border">
          <tr>
            {['Evento', 'Previsto', 'Realizado', 'Delta', 'Margem proj.', 'Risco', 'Ações'].map((header) => (
              <th key={header} className="table-header">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {reports.map((report) => (
            <tr key={report.event_id} className="table-row">
              <td className="table-cell">
                <div className="text-[13px] font-medium text-text-primary">{report.event_name}</div>
                <div className="text-[11px] font-mono text-text-muted">{formatDate(report.starts_at, 'dd/MM/yyyy')}</div>
              </td>
              <td className="table-cell">
                <div className="font-mono text-text-primary">{formatCurrency(report.projected_revenue)}</div>
                <div className="text-[11px] text-text-muted">Custo {formatCurrency(report.projected_cost)}</div>
              </td>
              <td className="table-cell">
                <div className="font-mono text-status-success">{formatCurrency(report.net_sales)}</div>
                <div className="text-[11px] text-text-muted">Resultado {formatCurrency(report.result)}</div>
              </td>
              <td className="table-cell">
                <div className={cn('font-mono font-semibold', report.realized_vs_projected_revenue >= 0 ? 'text-status-success' : 'text-status-error')}>
                  {formatCurrency(report.realized_vs_projected_revenue)}
                </div>
                <div className="text-[11px] text-text-muted">Resultado {formatCurrency(report.realized_vs_projected_result)}</div>
              </td>
              <td className="table-cell font-mono text-text-primary">{report.projected_margin_percent.toFixed(1)}%</td>
              <td className={`table-cell text-xs font-semibold ${getRiskColor(report.risk_status)}`}>
                {FINANCIAL_FORECAST_RISK_LABELS[report.risk_status]}
              </td>
              <td className="table-cell">
                <button onClick={() => onEditForecast(report)} className="btn-secondary text-xs">
                  Editar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
