import { Activity, AlertTriangle, CreditCard, DollarSign, Megaphone, Percent, QrCode, Users } from 'lucide-react'
import type { DashboardExecutiveSummary } from '@/features/dashboard/types'
import { formatCurrency, formatNumber } from '@/shared/lib'

interface DashboardExecutiveCardsProps {
  summary: DashboardExecutiveSummary
}

export function DashboardExecutiveCards({ summary }: DashboardExecutiveCardsProps) {
  const cards = [
    {
      label: 'Receita bruta',
      value: formatCurrency(summary.grossRevenue),
      icon: DollarSign,
      accent: '#4285F4',
      bg: 'rgba(0,87,231,0.08)',
      border: 'rgba(0,87,231,0.18)',
    },
    {
      label: 'Receita líquida',
      value: formatCurrency(summary.netRevenue),
      icon: CreditCard,
      accent: '#22C55E',
      bg: 'rgba(34,197,94,0.08)',
      border: 'rgba(34,197,94,0.18)',
    },
    {
      label: 'Margem',
      value: `${summary.marginPercent.toFixed(1)}%`,
      icon: Percent,
      accent: summary.marginPercent >= 0 ? '#4285F4' : '#EF4444',
      bg: summary.marginPercent >= 0 ? 'rgba(0,87,231,0.08)' : 'rgba(239,68,68,0.08)',
      border: summary.marginPercent >= 0 ? 'rgba(0,87,231,0.18)' : 'rgba(239,68,68,0.18)',
    },
    {
      label: 'Eventos ativos',
      value: formatNumber(summary.activeEvents),
      icon: Activity,
      accent: '#C9A84C',
      bg: 'rgba(201,168,76,0.08)',
      border: 'rgba(201,168,76,0.18)',
    },
    {
      label: 'Campanhas',
      value: formatNumber(summary.runningCampaigns),
      icon: Megaphone,
      accent: '#4285F4',
      bg: 'rgba(0,87,231,0.08)',
      border: 'rgba(0,87,231,0.18)',
    },
    {
      label: 'Alertas críticos',
      value: formatNumber(summary.criticalAlerts),
      icon: AlertTriangle,
      accent: summary.criticalAlerts > 0 ? '#EF4444' : '#22C55E',
      bg: summary.criticalAlerts > 0 ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)',
      border: summary.criticalAlerts > 0 ? 'rgba(239,68,68,0.18)' : 'rgba(34,197,94,0.18)',
    },
    {
      label: 'Check-ins',
      value: formatNumber(summary.totalCheckins),
      icon: QrCode,
      accent: '#4285F4',
      bg: 'rgba(66,133,244,0.08)',
      border: 'rgba(66,133,244,0.18)',
    },
    {
      label: 'Clientes',
      value: formatNumber(summary.totalCustomers),
      icon: Users,
      accent: '#F0E8D6',
      bg: 'rgba(240,232,214,0.05)',
      border: 'rgba(240,232,214,0.10)',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.label}
            className="reveal group flex flex-col gap-3 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5"
            style={{
              background: 'linear-gradient(160deg, #0D1525 0%, #111A2E 100%)',
              border: '1px solid rgba(240,232,214,0.07)',
            }}
          >
            {/* Ícone + label */}
            <div className="flex items-center justify-between">
              <span
                className="text-[10px] font-medium uppercase tracking-[0.22em]"
                style={{ color: 'rgba(240,232,214,0.42)' }}
              >
                {card.label}
              </span>
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-300 group-hover:scale-110"
                style={{ background: card.bg, border: `1px solid ${card.border}` }}
              >
                <Icon className="h-3.5 w-3.5" style={{ color: card.accent }} />
              </div>
            </div>

            {/* Valor */}
            <div
              className="text-[1.6rem] font-black leading-none tracking-[-0.04em]"
              style={{ color: '#F0E8D6' }}
            >
              {card.value}
            </div>

            {/* Footer */}
            <div
              className="mt-auto flex items-center justify-between text-[10px]"
              style={{ color: 'rgba(240,232,214,0.30)' }}
            >
              <span>Consolidado</span>
              <span
                className="rounded-full px-2 py-0.5 font-mono uppercase tracking-[0.18em]"
                style={{ background: card.bg, color: card.accent }}
              >
                Live
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
