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
import { ORDER_PAYMENT_METHOD_CONFIG } from '@/features/orders/types'
import type { OrderPaymentMethod } from '@/features/orders/types'
import { PremiumBadge } from '@/features/public'
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
  return (
    <div className="space-y-5">
      <div className="rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(250,244,236,0.78))] p-6 shadow-[0_18px_55px_rgba(48,35,18,0.06)] md:p-7">
        <div className="text-[11px] uppercase tracking-[0.3em] text-[#8e7f68]">Pagamento</div>
        <div className="mt-4 font-display text-[2.4rem] font-semibold leading-[0.92] tracking-[-0.04em] text-[#1f1a15]">
          {phase === 'review' ? 'Escolha o metodo e confirme a reserva.' : phase === 'payment' ? 'Finalize com seguranca.' : 'Aguardando aprovacao.'}
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5f5549]">
          {phase === 'review'
            ? 'Seu pedido ja esta reservado temporariamente. Agora e so escolher como deseja concluir.'
            : phase === 'payment'
              ? 'A camada de pagamento foi refinada para ficar mais limpa e confiavel, sem alterar a integracao existente.'
              : 'O gateway esta processando a transacao. Assim que a aprovacao chegar, o pedido avanca para emissao.'}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {countdown ? <PremiumBadge tone="accent">Reserva ativa · {countdown}</PremiumBadge> : null}
          {draftOrderId ? <PremiumBadge tone="default">Pedido {draftOrderId.slice(0, 8)}</PremiumBadge> : null}
        </div>
      </div>

      {phase !== 'processing' ? (
        <div className="rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(250,244,236,0.78))] p-6 shadow-[0_18px_55px_rgba(48,35,18,0.06)] md:p-7">
          <div className="text-[11px] uppercase tracking-[0.3em] text-[#8e7f68]">Metodo</div>
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
                      ? 'border-[#1f1a15] bg-[#1f1a15] text-[#f8f3ea] shadow-[0_14px_26px_rgba(31,26,21,0.12)]'
                      : 'border-[#ddd1bf] bg-[#fbf7f1] text-[#5f5549] hover:-translate-y-0.5 hover:border-[#b79e74]',
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    {method === 'pix' ? <Smartphone className="h-4 w-4" /> : <Ticket className="h-4 w-4" />}
                    {selected ? <Check className="h-4 w-4" /> : null}
                  </div>
                  <div className="mt-4 text-sm font-semibold">{config?.label ?? method}</div>
                  <div className={cn('mt-1 text-xs', selected ? 'text-[#f8f3ea]/70' : 'text-[#8e7f68]')}>
                    {method === 'free' ? 'Sem cobranca nesta etapa' : 'Pagamento protegido pelo gateway'}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ) : null}

      {draftStatus === 'expired' ? (
        <div className="flex items-center gap-2 rounded-[1.5rem] border border-[#eadaba] bg-[#faf4e7] px-5 py-4 text-sm text-[#6d5324]">
          <Clock3 className="h-4 w-4 shrink-0" /> Sua reserva expirou. Revise a selecao e tente novamente.
        </div>
      ) : null}

      {draftStatus === 'cancelled' ? (
        <div className="flex items-center gap-2 rounded-[1.5rem] border border-[#ddd1bf] bg-white/82 px-5 py-4 text-sm text-[#5f5549]">
          <XCircle className="h-4 w-4 shrink-0" /> A reserva foi cancelada e o inventario voltou para o lote.
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
            {startingPayment || confirmingDraft ? <Loader2 className="h-4 w-4 animate-spin" /> : phase === 'review' && isFreeOrder ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            {isFreeOrder ? 'Confirmar pedido' : 'Ir para pagamento'}
          </button>

          <button
            onClick={() => void onCancelDraft()}
            disabled={isBusy}
            className="flex w-full items-center justify-center gap-3 rounded-full border border-[#ddd1bf] bg-[#fbf7f1] px-5 py-4 text-sm font-medium text-[#5f5549] transition-colors hover:border-[#b79e74] hover:text-[#1f1a15] disabled:opacity-50"
          >
            Cancelar reserva
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
        <div className="rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(250,244,236,0.78))] p-6 shadow-[0_18px_55px_rgba(48,35,18,0.06)] md:p-7">
          <div className="flex items-start gap-3">
            <Loader2 className="mt-1 h-5 w-5 animate-spin text-[#7b6440]" />
            <div>
              <div className="text-base font-semibold text-[#1f1a15]">Aguardando confirmacao do gateway</div>
              <div className="mt-2 text-sm leading-6 text-[#5f5549]">
                O pagamento ja foi enviado ao provedor. Assim que o webhook confirmar a transacao, o pedido avancara automaticamente.
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => void onRefreshStatus()}
              className="inline-flex items-center gap-2 rounded-full border border-[#ddd1bf] bg-[#fbf7f1] px-4 py-2.5 text-sm font-medium text-[#5f5549]"
            >
              <RefreshCw className="h-4 w-4" />
              Atualizar status
            </button>
            <button
              onClick={onPaymentBack}
              className="inline-flex items-center gap-2 rounded-full border border-[#ddd1bf] bg-[#fbf7f1] px-4 py-2.5 text-sm font-medium text-[#5f5549]"
            >
              <Lock className="h-4 w-4" />
              Voltar para a reserva
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
