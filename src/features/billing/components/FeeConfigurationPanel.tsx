import { Percent, Receipt, Ticket } from 'lucide-react'
import {
  FormField,
  FormGrid,
  FormHint,
  PremiumBadge,
  PremiumInput,
  PremiumSelect,
  SurfacePanel,
} from '@/shared/components'
import { formatLocaleCurrency, useAppLocale } from '@/shared/i18n/app-locale'
import { calculateFeeBreakdown } from '@/features/billing/services/billing.calculations'
import type { BillingFeeType } from '@/features/billing/types'

interface FeeConfigurationPanelProps {
  feeType: BillingFeeType
  feeValue: string | number
  absorbFee: boolean
  onFeeTypeChange?: (value: BillingFeeType) => void
  onFeeValueChange?: (value: string) => void
  onAbsorbFeeChange?: (value: boolean) => void
  editable?: boolean
  sampleSubtotal?: number
  sampleQuantity?: number
}

export function FeeConfigurationPanel({
  feeType,
  feeValue,
  absorbFee,
  onFeeTypeChange,
  onFeeValueChange,
  onAbsorbFeeChange,
  editable = true,
  sampleSubtotal = 840,
  sampleQuantity = 2,
}: FeeConfigurationPanelProps) {
  const { locale, t } = useAppLocale()
  const preview = calculateFeeBreakdown({
    subtotal: sampleSubtotal,
    quantity: sampleQuantity,
    feeType,
    feeValue: Number(feeValue || 0),
    absorbFee,
  })

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <PremiumBadge tone="accent">
          {feeType === 'fixed'
            ? t('Fixed fee per ticket', 'Taxa fixa por ingresso')
            : t('Percentage fee on subtotal', 'Taxa percentual sobre subtotal')}
        </PremiumBadge>
        <PremiumBadge tone={absorbFee ? 'warning' : 'info'}>
          {absorbFee
            ? t('Absorbed by the producer', 'Absorvida pelo produtor')
            : t('Passed to the buyer', 'Repassada ao comprador')}
        </PremiumBadge>
      </div>

      {editable ? (
        <FormGrid>
          <FormField label={t('Fee model', 'Modelo de taxa')}>
            <PremiumSelect value={feeType} onChange={(event) => onFeeTypeChange?.(event.target.value as BillingFeeType)}>
              <option value="percentage">{t('Percentage', 'Percentual')}</option>
              <option value="fixed">{t('Fixed per ticket', 'Fixa por ingresso')}</option>
            </PremiumSelect>
            <FormHint>
              {t(
                'Use percentage for varied prices or a fixed fee when you want linear pricing per access.',
                'Use percentual para preços variados ou taxa fixa quando quiser linearidade por acesso.',
              )}
            </FormHint>
          </FormField>

          <FormField label={feeType === 'fixed' ? t('Amount per ticket', 'Valor por ingresso') : t('Fee percentage', 'Percentual da taxa')}>
            <PremiumInput
              type="number"
              min={0}
              step={feeType === 'fixed' ? 0.01 : 0.1}
              value={String(feeValue)}
              onChange={(event) => onFeeValueChange?.(event.target.value)}
              placeholder={feeType === 'fixed' ? '8.00' : '10'}
            />
            <FormHint>
              {feeType === 'fixed'
                ? t('Amount in reais for each ticket sold.', 'Valor em reais por ingresso vendido.')
                : t('Percentage applied on the order subtotal.', 'Percentual aplicado sobre o subtotal do pedido.')}
            </FormHint>
          </FormField>
        </FormGrid>
      ) : null}

      {editable ? (
        <SurfacePanel tone="muted" className="flex flex-wrap items-center justify-between gap-4 p-4">
          <div>
            <div className="text-sm font-medium text-text-primary">{t('Absorb fee', 'Absorver taxa')}</div>
            <p className="mt-1 text-sm leading-6 text-text-muted">
              {t(
                'When enabled, the buyer sees a clean total and the organization absorbs the fee in the payout without losing platform revenue.',
                'Quando ativado, o comprador ve o total limpo e a organização absorve a taxa no repasse, sem perder a receita gerada para a plataforma.',
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onAbsorbFeeChange?.(!absorbFee)}
            className={`relative inline-flex h-11 w-20 items-center rounded-full border px-1 transition-all ${absorbFee ? 'border-brand-acid/35 bg-brand-acid/12' : 'border-bg-border bg-white'}`}
          >
            <span className={`inline-block h-9 w-9 rounded-full bg-[#1f1a15] transition-transform ${absorbFee ? 'translate-x-9' : 'translate-x-0'}`} />
          </button>
        </SurfacePanel>
      ) : null}

      <SurfacePanel className="grid gap-4 p-5 lg:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-text-muted">
            <Ticket className="h-3.5 w-3.5" />
            {t('Simulation', 'Simulacao')}
          </div>
          <div className="mt-3 text-sm leading-6 text-text-muted">
            {t(
              `Preview for ${sampleQuantity} tickets with subtotal of ${formatLocaleCurrency(sampleSubtotal, locale)}.`,
              `Simulacao para ${sampleQuantity} ingressos com subtotal de ${formatLocaleCurrency(sampleSubtotal, locale)}.`,
            )}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-text-muted">
            <Percent className="h-3.5 w-3.5" />
            {t('Platform fee', 'Taxa da plataforma')}
          </div>
          <div className="mt-3 font-display text-3xl leading-none tracking-[-0.04em] text-text-primary">
            {formatLocaleCurrency(preview.platformFeeAmount, locale)}
          </div>
          <div className="mt-2 text-sm text-text-muted">
            {t('Revenue generated for Pulse on this order.', 'Valor gerado para a Pulse neste pedido.')}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-text-muted">
            <Receipt className="h-3.5 w-3.5" />
            {t('Buyer total', 'Total do comprador')}
          </div>
          <div className="mt-3 font-display text-3xl leading-none tracking-[-0.04em] text-text-primary">
            {formatLocaleCurrency(preview.totalAmount, locale)}
          </div>
          <div className="mt-2 text-sm text-text-muted">
            {preview.customerFeeAmount > 0
              ? t(
                  `${formatLocaleCurrency(preview.customerFeeAmount, locale)} appears in the purchase flow.`,
                  `${formatLocaleCurrency(preview.customerFeeAmount, locale)} aparece na compra.`,
                )
              : t(
                  `${formatLocaleCurrency(preview.absorbedFeeAmount, locale)} stays absorbed in the payout.`,
                  `${formatLocaleCurrency(preview.absorbedFeeAmount, locale)} fica absorvido no repasse.`,
                )}
          </div>
        </div>
      </SurfacePanel>
    </div>
  )
}
