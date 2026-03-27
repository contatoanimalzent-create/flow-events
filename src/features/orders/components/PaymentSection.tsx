import {
  ArrowRight,
  Check,
  Clock3,
  Info,
  Loader2,
  Lock,
  RefreshCw,
  Smartphone,
  Ticket,
  XCircle,
} from 'lucide-react'
import { PremiumBadge } from '@/features/public'
import { usePublicLocale } from '@/features/public/lib/public-locale'
import { ORDER_PAYMENT_METHOD_CONFIG } from '@/features/orders/types'
import type { OrderPaymentMethod } from '@/features/orders/types'
import { cn } from '@/shared/lib'
import { PublicCheckoutPaymentStep } from './PublicCheckoutPaymentStep'

interface PaymentSectionProps {
  isFreeOrder: boolean
  paymentMethod: OrderPaymentMethod | null
  setPaymentMethod: (method: OrderPaymentMethod | null) => void
  paymentOptions: OrderPaymentMethod[]
  phase: 'review' | 'payment' | 'processing'
  countdown: string | null
  draftOrderId: string | null
  error: string
  draftStatus: 'idle' | 'draft_created' | 'confirmed' | 'cancelled' | 'expired'
  isBusy: boolean
  startingPayment: boolean
  confirmingDraft: boolean
  paymentClientSecret: string | null
  totalAmount: number
  buyerName: string
  buyerEmail: string
  onConfirmDraft: () => Promise<void>
  onCancelDraft: () => Promise<void>
  onPaymentSubmitted: () => void
  onPaymentBack: () => void
  onRefreshStatus: () => Promise<void>
}

export function PaymentSection({
  isFreeOrder,
  paymentMethod,
  setPaymentMethod,
  paymentOptions,
  phase,
  countdown,
  draftOrderId,
  error,
  draftStatus,
  isBusy,
  startingPayment,
  confirmingDraft,
  paymentClientSecret,
  totalAmount,
  buyerName,
  buyerEmail,
  onConfirmDraft,
  onCancelDraft,
  onPaymentSubmitted,
  onPaymentBack,
  onRefreshStatus,
}: PaymentSectionProps) {
  const { isPortuguese } = usePublicLocale()
  return (
    <div className="space-y-5">
      <div className="rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,#0d1117_0%,#121823_100%)] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.24)] md:p-7">
        <div className="text-[11px] uppercase tracking-[0.3em] text-white/46">Payment</div>
        <div className="mt-4 font-display text-[2.4rem] font-semibold uppercase leading-[0.92] tracking-[-0.04em] text-white">
          {phase === 'review'
            ? isPortuguese ? 'Escolha o metodo e confirme a reserva.' : 'Choose your method and confirm the reservation.'
            : phase === 'payment'
              ? isPortuguese ? 'Finalize com seguranca.' : 'Complete your purchase securely.'
              : isPortuguese ? 'Aguardando aprovacao.' : 'Awaiting approval.'}
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/66">
          {phase === 'review'
            ? isPortuguese
              ? 'Seu pedido ja esta reservado temporariamente. Agora e so escolher como deseja concluir.'
              : 'Your order is already temporarily reserved. Now choose how you want to complete it.'
            : phase === 'payment'
              ? isPortuguese
                ? 'A etapa de pagamento foi simplificada para aumentar confianca, reduzir atrito e manter a leitura limpa.'
                : 'The payment step has been simplified to increase trust, reduce friction and keep the reading clean.'
              : isPortuguese
                ? 'O gateway esta processando a transacao. Assim que a aprovacao chegar, o pedido avanca para emissao automatica.'
                : 'The gateway is processing the transaction. As soon as approval arrives, the order moves into automatic issuance.'}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {countdown ? <PremiumBadge tone="accent">Reserva ativa - {countdown}</PremiumBadge> : null}
          {draftOrderId ? <PremiumBadge tone="default">Pedido {draftOrderId.slice(0, 8)}</PremiumBadge> : null}
        </div>
      </div>

      {phase !== 'processing' ? (
          <div className="rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,#0d1117_0%,#121823_100%)] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.24)] md:p-7">
          <div className="text-[11px] uppercase tracking-[0.3em] text-white/46">{isPortuguese ? 'Metodo' : 'Method'}</div>
          <div className={cn('mt-5 grid gap-3', isFreeOrder ? 'grid-cols-1' : 'grid-cols-2 xl:grid-cols-5')}>
            {paymentOptions.map((method) => {
              const config = ORDER_PAYMENT_METHOD_CONFIG[method]
              const selected = (paymentMethod ?? (isFreeOrder ? 'free' : 'pix')) === method

              return (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={cn(
                    'rounded-[1.5rem] border p-4 text-left transition-all duration-300',
                    selected
                      ? 'border-[#ff2d2d]/24 bg-[#ff2d2d]/12 text-white shadow-[0_14px_26px_rgba(0,0,0,0.22)]'
                      : 'border-white/10 bg-white/[0.05] text-white/66 hover:-translate-y-0.5 hover:border-[#ff2d2d]/30',
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    {method === 'pix' ? <Smartphone className="h-4 w-4" /> : <Ticket className="h-4 w-4" />}
                    {selected ? <Check className="h-4 w-4" /> : null}
                  </div>
                  <div className="mt-4 text-sm font-semibold">{config?.label ?? method}</div>
                  <div className={cn('mt-1 text-xs', selected ? 'text-white/70' : 'text-white/46')}>
                    {method === 'free'
                      ? isPortuguese ? 'Sem cobranca nesta etapa' : 'No charge at this stage'
                      : isPortuguese ? 'Pagamento protegido pelo gateway' : 'Gateway-protected payment'}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ) : null}

      {draftStatus === 'expired' ? (
        <div className="flex items-center gap-2 rounded-[1.5rem] border border-[#eadaba] bg-[#faf4e7] px-5 py-4 text-sm text-[#6d5324]">
          <Clock3 className="h-4 w-4 shrink-0" /> {isPortuguese ? 'Sua reserva expirou. Revise a selecao e tente novamente.' : 'Your reservation has expired. Review your selection and try again.'}
        </div>
      ) : null}

      {draftStatus === 'cancelled' ? (
        <div className="flex items-center gap-2 rounded-[1.5rem] border border-[#ddd1bf] bg-white/82 px-5 py-4 text-sm text-[#5f5549]">
          <XCircle className="h-4 w-4 shrink-0" /> {isPortuguese ? 'A reserva foi cancelada e o inventario voltou para o lote.' : 'The reservation was cancelled and inventory returned to the batch.'}
        </div>
      ) : null}

      {error ? (
        <div className="flex items-center gap-2 rounded-[1.5rem] border border-[#f2c7cd] bg-[#fff4f5] px-5 py-4 text-sm text-[#a5505b]">
          <Info className="h-4 w-4 shrink-0" /> {error}
        </div>
      ) : null}

      {phase === 'review' ? (
        <div className="space-y-3">
          <button
            onClick={() => void onConfirmDraft()}
            disabled={isBusy}
            className="flex w-full items-center justify-center gap-3 rounded-full bg-[#1f1a15] px-5 py-4 text-sm font-semibold text-[#f8f3ea] transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {startingPayment || confirmingDraft ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : phase === 'review' && isFreeOrder ? (
              <Check className="h-4 w-4" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
            {isFreeOrder ? (isPortuguese ? 'Confirmar pedido' : 'Confirm order') : isPortuguese ? 'Ir para pagamento' : 'Continue to payment'}
          </button>

          <button
            onClick={() => void onCancelDraft()}
            disabled={isBusy}
            className="flex w-full items-center justify-center gap-3 rounded-full border border-[#ddd1bf] bg-white/82 px-5 py-4 text-sm font-medium text-[#5f5549] transition-colors hover:border-[#b79e74] hover:text-[#1f1a15] disabled:opacity-50"
          >
            {isPortuguese ? 'Cancelar reserva' : 'Cancel reservation'}
          </button>
        </div>
      ) : null}

      {phase === 'payment' && paymentClientSecret ? (
        <PublicCheckoutPaymentStep
          clientSecret={paymentClientSecret}
          totalAmount={totalAmount}
          buyerName={buyerName}
          buyerEmail={buyerEmail}
          onSubmitted={onPaymentSubmitted}
          onBack={onPaymentBack}
        />
      ) : null}

      {phase === 'processing' ? (
        <div className="rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,#0d1117_0%,#121823_100%)] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.24)] md:p-7">
          <div className="flex items-start gap-3">
            <Loader2 className="mt-1 h-5 w-5 animate-spin text-[#ff6a5c]" />
            <div>
              <div className="text-base font-semibold text-white">
                {isPortuguese ? 'Aguardando confirmacao do gateway' : 'Waiting for gateway confirmation'}
              </div>
              <div className="mt-2 text-sm leading-6 text-white/66">
                {isPortuguese
                  ? 'O pagamento ja foi enviado ao provedor. Assim que o webhook confirmar a transacao, o pedido avancara automaticamente.'
                  : 'The payment has already been sent to the provider. As soon as the webhook confirms the transaction, the order will advance automatically.'}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => void onRefreshStatus()}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-white"
            >
              <RefreshCw className="h-4 w-4" />
              {isPortuguese ? 'Atualizar status' : 'Refresh status'}
            </button>
            <button
              onClick={onPaymentBack}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-white"
            >
              <Lock className="h-4 w-4" />
              {isPortuguese ? 'Voltar para a reserva' : 'Back to reservation'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
