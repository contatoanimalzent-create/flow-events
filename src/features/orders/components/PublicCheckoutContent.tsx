import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Loader2, ShieldCheck } from 'lucide-react'
import { growthService, readStoredReferralCode } from '@/features/growth'
import { usePaymentStatus } from '@/features/payments'
import { useCheckoutFlow, useCheckoutStore } from '@/features/orders/hooks'
import type { CheckoutCartItem, OrderPaymentMethod } from '@/features/orders/types'
import { PublicLayout, PremiumBadge, PublicReveal } from '@/features/public'
import type { PublicTicketType } from '@/features/public/types/public.types'
import { CheckoutForm } from './CheckoutForm'
import { CheckoutStepper } from './CheckoutStepper'
import { OrderSummaryPanel } from './OrderSummaryPanel'
import { PaymentSection } from './PaymentSection'
import { TicketSelector } from './TicketSelector'

interface PublicCheckoutContentProps {
  event: {
    id: string
    organization_id: string
    name: string
    fee_type?: 'fixed' | 'percentage'
    fee_value?: number
    absorb_fee?: boolean
  }
  ticketTypes: PublicTicketType[]
  cart: CheckoutCartItem[]
  onBack: () => void
  onSuccess: () => void
  onAdd: (ticketTypeId: string, batchId: string) => void
  onRemove: (batchId: string) => void
  onInventoryChanged?: () => Promise<void> | void
}

const PAID_PAYMENT_METHODS: OrderPaymentMethod[] = ['pix', 'card_1x', 'card_2x', 'card_3x', 'card_6x']

function formatRemainingTime(expiresAt: string | null) {
  if (!expiresAt) {
    return null
  }

  const remainingMs = new Date(expiresAt).getTime() - Date.now()

  if (remainingMs <= 0) {
    return '00:00'
  }

  const totalSeconds = Math.floor(remainingMs / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function PublicCheckoutContent({
  event,
  ticketTypes,
  cart,
  onBack,
  onSuccess,
  onAdd,
  onRemove,
  onInventoryChanged,
}: PublicCheckoutContentProps) {
  const { buyer, setBuyerField, resetCheckout } = useCheckoutStore()
  const [phase, setPhase] = useState<'form' | 'review' | 'payment' | 'processing'>('form')
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1)
  const [error, setError] = useState('')
  const processedConversionOrderRef = useRef<string | null>(null)
  const referralCode = useMemo(() => readStoredReferralCode(event.id), [event.id])

  const {
    paymentMethod,
    expiresAt,
    draftOrderId,
    draftStatus,
    paymentClientSecret,
    cartSummary,
    createDraft,
    beginPayment,
    confirmDraft,
    cancelDraft,
    expireDraft,
    setPaymentMethod,
    clearPaymentState,
    markPaymentStatus,
    isDraftExpired,
    creatingDraft,
    startingPayment,
    confirmingDraft,
    cancellingDraft,
    expiringDraft,
  } = useCheckoutFlow({
    eventId: event.id,
    organizationId: event.organization_id,
    cartItems: cart,
    sourceChannel: referralCode ? 'public_referral' : 'public_event_page',
    metadata: {
      landing_path: typeof window !== 'undefined' ? window.location.pathname : '',
      referral_code: referralCode ?? null,
    },
    feeConfig: {
      fee_type: event.fee_type,
      fee_value: event.fee_value,
      absorb_fee: event.absorb_fee,
    },
    onInventoryChanged,
  })

  const paymentStatus = usePaymentStatus({
    orderId: draftOrderId,
    enabled: phase === 'payment' || phase === 'processing',
    refetchIntervalMs: 2500,
  })

  const isFreeOrder = cartSummary.total_amount === 0
  const isBusy = creatingDraft || startingPayment || confirmingDraft || cancellingDraft || expiringDraft
  const countdown = formatRemainingTime(expiresAt)
  const paymentOptions = useMemo(
    () => (isFreeOrder ? (['free'] as OrderPaymentMethod[]) : PAID_PAYMENT_METHODS),
    [isFreeOrder],
  )

  useEffect(() => {
    if (phase === 'form' || !expiresAt || !draftOrderId || paymentStatus.isPaid) {
      return
    }

    const interval = window.setInterval(() => {
      if (isDraftExpired()) {
        window.clearInterval(interval)
        void expireDraft()
          .then(() => {
            clearPaymentState()
            setError('Sua reserva expirou e o inventario foi devolvido aos lotes disponiveis.')
            setPhase('form')
            setCurrentStep(2)
          })
          .catch((draftError) => {
            setError(draftError instanceof Error ? draftError.message : 'Nao foi possivel expirar a reserva.')
            setPhase('form')
            setCurrentStep(2)
          })
      }
    }, 1000)

    return () => window.clearInterval(interval)
  }, [clearPaymentState, draftOrderId, expireDraft, expiresAt, isDraftExpired, paymentStatus.isPaid, phase])

  useEffect(() => {
    if (cart.length > 0 || phase !== 'form') {
      return
    }

    setCurrentStep(1)
  }, [cart.length, phase])

  useEffect(() => {
    if (phase !== 'payment' && phase !== 'processing') {
      return
    }

    if (paymentStatus.isPaid) {
      if (draftOrderId && processedConversionOrderRef.current !== draftOrderId) {
        processedConversionOrderRef.current = draftOrderId
        void growthService.registerReferralConversion({
          organizationId: event.organization_id,
          eventId: event.id,
          orderId: draftOrderId,
          buyerEmail: buyer.email,
          grossAmount: cartSummary.total_amount,
          referralCode,
          source: 'public_checkout',
        })
      }

      markPaymentStatus('paid')
      setCurrentStep(4)
      resetCheckout()
      onSuccess()
      return
    }

    if (paymentStatus.isFailed) {
      markPaymentStatus('failed')
      clearPaymentState()
      setError('Pagamento nao aprovado. Revise os dados e tente novamente antes da reserva expirar.')
      setPhase('review')
      setCurrentStep(3)
      return
    }

    if (paymentStatus.isCancelled || paymentStatus.isExpired) {
      markPaymentStatus(paymentStatus.isCancelled ? 'cancelled' : null)
      clearPaymentState()
      setError('O pagamento nao foi concluido e a reserva nao esta mais ativa.')
      setPhase('form')
      setCurrentStep(2)
      return
    }

    if (paymentStatus.isRefunded) {
      markPaymentStatus('refunded')
      clearPaymentState()
      setError('Este pagamento foi reembolsado. Se precisar, inicie uma nova compra.')
      setPhase('form')
      setCurrentStep(2)
    }
  }, [
    clearPaymentState,
    buyer.email,
    cartSummary.total_amount,
    draftOrderId,
    event.id,
    event.organization_id,
    markPaymentStatus,
    onSuccess,
    paymentStatus.isCancelled,
    paymentStatus.isExpired,
    paymentStatus.isFailed,
    paymentStatus.isPaid,
    paymentStatus.isRefunded,
    phase,
    referralCode,
    resetCheckout,
  ])

  async function handleCreateDraft() {
    if (!buyer.name.trim() || !buyer.email.trim()) {
      setError('Preencha nome e e-mail para reservar o pedido.')
      setCurrentStep(2)
      return
    }

    if (cart.length === 0) {
      setError('Selecione ao menos um ingresso antes de continuar.')
      setCurrentStep(1)
      return
    }

    setError('')

    try {
      await createDraft(isFreeOrder ? 'free' : paymentMethod ?? 'pix')
      setPhase('review')
      setCurrentStep(3)
    } catch (draftError) {
      setError(draftError instanceof Error ? draftError.message : 'Nao foi possivel reservar o pedido.')
      setCurrentStep(2)
    }
  }

  async function handleConfirmDraft() {
    setError('')

    try {
      if (isFreeOrder) {
        await confirmDraft('free')

        if (draftOrderId && processedConversionOrderRef.current !== draftOrderId) {
          processedConversionOrderRef.current = draftOrderId
          void growthService.registerReferralConversion({
            organizationId: event.organization_id,
            eventId: event.id,
            orderId: draftOrderId,
            buyerEmail: buyer.email,
            grossAmount: cartSummary.total_amount,
            referralCode,
            source: 'free_checkout',
          })
        }

        setCurrentStep(4)
        resetCheckout()
        onSuccess()
        return
      }

      await beginPayment(paymentMethod ?? 'pix')
      setPhase('payment')
      setCurrentStep(3)
    } catch (confirmError) {
      setError(confirmError instanceof Error ? confirmError.message : 'Nao foi possivel iniciar o pagamento.')
      setCurrentStep(3)
    }
  }

  async function handleBack() {
    setError('')

    if (phase === 'processing') {
      clearPaymentState()
      setPhase('review')
      setCurrentStep(3)
      return
    }

    if (phase === 'payment' && draftOrderId) {
      clearPaymentState()
      setPhase('review')
      setCurrentStep(3)
      return
    }

    if (phase === 'review' && draftOrderId) {
      try {
        await cancelDraft()
        setPhase('form')
        setCurrentStep(2)
        return
      } catch (cancelError) {
        setError(cancelError instanceof Error ? cancelError.message : 'Nao foi possivel liberar a reserva.')
        return
      }
    }

    if (currentStep === 2) {
      setCurrentStep(1)
      return
    }

    resetCheckout()
    onBack()
  }

  function handleContinueFromTickets() {
    if (cart.length === 0) {
      setError('Selecione ao menos um ingresso para continuar.')
      return
    }

    setError('')
    setCurrentStep(2)
  }

  const introTitle =
    currentStep === 1
      ? 'Escolha seu acesso.'
      : currentStep === 2
        ? 'Confirme quem recebe a experiencia.'
        : currentStep === 3
          ? phase === 'payment'
            ? 'Finalize a compra.'
            : phase === 'processing'
              ? 'Sua transacao esta em processamento.'
              : 'Sua reserva esta pronta.'
          : 'Compra concluida.'

  const introDescription =
    currentStep === 1
      ? 'Compare acessos, disponibilidade e valor em um fluxo direto, com inventario validado em tempo real.'
      : currentStep === 2
        ? 'Mantivemos apenas os campos essenciais para reservar, pagar e emitir os ingressos com confianca.'
      : phase === 'processing'
          ? 'O gateway esta processando a transacao. Assim que a confirmacao chegar, os ingressos digitais serao emitidos automaticamente.'
      : event.absorb_fee
            ? 'Reserva, pagamento e emissao acontecem sobre a mesma base operacional, com fee absorvida pelo produtor para manter o total limpo ao comprador.'
            : 'Reserva, pagamento e emissao acontecem sobre a mesma base operacional do produto, agora com apresentacao mais clara e comercial.'

  return (
    <PublicLayout
      showFooter={false}
      compactHeader
      headerActionSlot={
        phase !== 'form' && countdown ? (
          <PremiumBadge tone="accent">Reserva ativa - {countdown}</PremiumBadge>
        ) : null
      }
    >
      <div className="px-5 py-8 md:px-10 lg:px-16 lg:py-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => void handleBack()}
              disabled={isBusy}
              className="inline-flex items-center gap-2 text-sm font-medium text-white/64 transition-colors hover:text-white disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </button>

            <div className="flex flex-wrap items-center gap-2">
              <PremiumBadge tone="default">{event.name}</PremiumBadge>
              <PremiumBadge tone="muted">
                {currentStep === 1
                  ? 'Selecao'
                  : currentStep === 2
                    ? 'Comprador'
                    : currentStep === 3
                      ? 'Pagamento'
                      : 'Confirmacao'}
              </PremiumBadge>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_26rem]">
            <div className="space-y-6">
              <PublicReveal>
                <div className="rounded-[2.2rem] border border-white/8 bg-[linear-gradient(135deg,#0d1117_0%,#121823_100%)] p-7 shadow-[0_22px_70px_rgba(0,0,0,0.28)] md:p-9">
                  <div className="text-[11px] uppercase tracking-[0.32em] text-white/48">Event checkout</div>
                  <h1 className="mt-4 font-display text-[clamp(3.2rem,5vw,5.4rem)] font-semibold uppercase leading-[0.92] tracking-[-0.05em] text-white">
                    {introTitle}
                  </h1>
                  <p className="mt-5 max-w-3xl text-base leading-7 text-white/66">{introDescription}</p>

                  <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-white/62">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2">
                      <ShieldCheck className="h-4 w-4 text-[#ff6a5c]" />
                      Reserva protegida e inventario sincronizado por lote
                    </div>
                    {countdown && phase !== 'form' ? (
                      <div className="inline-flex items-center rounded-full border border-[#ff2d2d]/24 bg-[#ff2d2d]/10 px-4 py-2 text-white">
                        Expira em {countdown}
                      </div>
                    ) : null}
                  </div>
                </div>
              </PublicReveal>

              <CheckoutStepper currentStep={currentStep} />

              {currentStep === 1 ? (
                <>
                  <TicketSelector ticketTypes={ticketTypes} cart={cart} onAdd={onAdd} onRemove={onRemove} />

                  {error ? (
                    <div className="rounded-[1.5rem] border border-[#ff2d2d]/24 bg-[#ff2d2d]/10 px-5 py-4 text-sm text-white">
                      {error}
                    </div>
                  ) : null}

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => void handleBack()}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-medium text-white/76 transition-colors hover:border-[#ff2d2d]/36 hover:text-white"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Voltar para o evento
                    </button>
                    <button
                      type="button"
                      onClick={handleContinueFromTickets}
                      disabled={cart.length === 0}
                      className="inline-flex items-center gap-2 rounded-full bg-[#ff2d2d] px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.12em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#ff4133] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Continuar para dados
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </>
              ) : null}

              {currentStep === 2 ? (
                <>
                  <CheckoutForm buyer={buyer} setBuyerField={setBuyerField} />

                  {error ? (
                    <div className="rounded-[1.5rem] border border-[#ff2d2d]/24 bg-[#ff2d2d]/10 px-5 py-4 text-sm text-white">
                      {error}
                    </div>
                  ) : null}

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-medium text-white/76 transition-colors hover:border-[#ff2d2d]/36 hover:text-white"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Ajustar ingressos
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleCreateDraft()}
                      disabled={isBusy || cart.length === 0}
                      className="inline-flex items-center gap-2 rounded-full bg-[#ff2d2d] px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.12em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#ff4133] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {creatingDraft ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                      Reservar pedido
                    </button>
                  </div>
                </>
              ) : null}

              {currentStep >= 3 ? (
                <PaymentSection
                  isFreeOrder={isFreeOrder}
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                  paymentOptions={paymentOptions}
                  phase={phase === 'review' || phase === 'payment' || phase === 'processing' ? phase : 'review'}
                  countdown={countdown}
                  draftOrderId={draftOrderId}
                  error={error}
                  draftStatus={draftStatus}
                  isBusy={isBusy}
                  startingPayment={startingPayment}
                  confirmingDraft={confirmingDraft}
                  paymentClientSecret={paymentClientSecret}
                  totalAmount={cartSummary.total_amount}
                  buyerName={buyer.name}
                  buyerEmail={buyer.email}
                  onConfirmDraft={handleConfirmDraft}
                  onCancelDraft={async () => {
                    await handleBack()
                  }}
                  onPaymentSubmitted={() => {
                    setPhase('processing')
                    setCurrentStep(4)
                  }}
                  onPaymentBack={() => {
                    clearPaymentState()
                    setPhase('review')
                    setCurrentStep(3)
                  }}
                  onRefreshStatus={async () => {
                    await paymentStatus.refresh()
                  }}
                />
              ) : null}
            </div>

            <OrderSummaryPanel
              eventName={event.name}
              cart={cart}
              summary={cartSummary}
              editable={phase === 'form'}
              onAdd={onAdd}
              onRemove={onRemove}
              reserveCountdown={phase !== 'form' ? countdown : null}
            />
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
