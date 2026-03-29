import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Loader2, ShieldCheck } from 'lucide-react'
import { growthService, readStoredReferralCode } from '@/features/growth'
import { usePaymentStatus } from '@/features/payments'
import { usePublicLocale } from '@/features/public/lib/public-locale'
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
  const { isPortuguese, locale } = usePublicLocale()
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
      setError(isPortuguese ? 'Sua reserva expirou e o inventario foi devolvido aos lotes disponiveis.' : 'Your reservation has expired and inventory has been returned to the available batches.')
            setPhase('form')
            setCurrentStep(2)
          })
          .catch((draftError) => {
            setError(draftError instanceof Error ? draftError.message : isPortuguese ? 'Nao foi possivel expirar a reserva.' : 'Unable to expire the reservation.')
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
          locale,
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
      setError(isPortuguese ? 'Pagamento nao aprovado. Revise os dados e tente novamente antes da reserva expirar.' : 'Payment was not approved. Review your details and try again before the reservation expires.')
      setPhase('review')
      setCurrentStep(3)
      return
    }

    if (paymentStatus.isCancelled || paymentStatus.isExpired) {
      markPaymentStatus(paymentStatus.isCancelled ? 'cancelled' : null)
      clearPaymentState()
      setError(isPortuguese ? 'O pagamento nao foi concluido e a reserva nao esta mais ativa.' : 'Payment was not completed and the reservation is no longer active.')
      setPhase('form')
      setCurrentStep(2)
      return
    }

    if (paymentStatus.isRefunded) {
      markPaymentStatus('refunded')
      clearPaymentState()
      setError(isPortuguese ? 'Este pagamento foi reembolsado. Se precisar, inicie uma nova compra.' : 'This payment was refunded. If needed, start a new purchase.')
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
      setError(isPortuguese ? 'Preencha nome e e-mail para reservar o pedido.' : 'Fill in name and email to reserve the order.')
      setCurrentStep(2)
      return
    }

    if (cart.length === 0) {
      setError(isPortuguese ? 'Selecione ao menos um ingresso antes de continuar.' : 'Select at least one ticket before continuing.')
      setCurrentStep(1)
      return
    }

    setError('')

    try {
      await createDraft(isFreeOrder ? 'free' : paymentMethod ?? 'pix')
      setPhase('review')
      setCurrentStep(3)
    } catch (draftError) {
      setError(draftError instanceof Error ? draftError.message : isPortuguese ? 'Nao foi possivel reservar o pedido.' : 'Unable to reserve the order.')
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
            locale,
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
      setError(confirmError instanceof Error ? confirmError.message : isPortuguese ? 'Nao foi possivel iniciar o pagamento.' : 'Unable to start payment.')
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
        setError(cancelError instanceof Error ? cancelError.message : isPortuguese ? 'Nao foi possivel liberar a reserva.' : 'Unable to release the reservation.')
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
      setError(isPortuguese ? 'Selecione ao menos um ingresso para continuar.' : 'Select at least one ticket to continue.')
      return
    }

    setError('')
    setCurrentStep(2)
  }

  const introTitle =
    currentStep === 1
      ? isPortuguese ? 'Escolha seu acesso.' : 'Choose your access.'
      : currentStep === 2
        ? isPortuguese ? 'Confirme quem recebe a experiencia.' : 'Confirm who receives the experience.'
        : currentStep === 3
          ? phase === 'payment'
            ? isPortuguese ? 'Finalize a compra.' : 'Complete your purchase.'
            : phase === 'processing'
              ? isPortuguese ? 'Sua transacao esta em processamento.' : 'Your transaction is being processed.'
              : isPortuguese ? 'Sua reserva esta pronta.' : 'Your reservation is ready.'
          : isPortuguese ? 'Compra concluida.' : 'Purchase completed.'

  const introDescription =
    currentStep === 1
      ? isPortuguese
        ? 'Compare acessos, disponibilidade e valor em um fluxo direto, com inventario validado em tempo real.'
        : 'Compare access options, availability and pricing in a direct flow with real-time validated inventory.'
      : currentStep === 2
        ? isPortuguese
          ? 'Mantivemos apenas os campos essenciais para reservar, pagar e emitir os ingressos com confianca.'
          : 'We kept only the essential fields to reserve, pay and issue tickets with confidence.'
      : phase === 'processing'
          ? isPortuguese
            ? 'O processador esta tratando a transacao. Assim que a confirmacao chegar, os ingressos digitais serao emitidos automaticamente.'
            : 'The gateway is processing the transaction. As soon as confirmation arrives, digital tickets will be issued automatically.'
      : event.absorb_fee
            ? isPortuguese
              ? 'Reserva, pagamento e emissao acontecem sobre a mesma base operacional, com taxa absorvida pelo produtor para manter o total limpo ao comprador.'
              : 'Reservation, payment and issuance happen on the same operational foundation, with fees absorbed by the producer to keep the buyer total clean.'
            : isPortuguese
              ? 'Reserva, pagamento e emissao acontecem sobre a mesma base operacional do produto, agora com apresentacao mais clara e comercial.'
              : 'Reservation, payment and issuance happen on the same operational foundation, now with a clearer and more commercial presentation.'

  return (
    <PublicLayout
      showFooter={false}
      compactHeader
      headerActionSlot={
        phase !== 'form' && countdown ? (
          <PremiumBadge tone="accent">
            {isPortuguese ? 'Reserva ativa' : 'Active reservation'} - {countdown}
          </PremiumBadge>
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
              {isPortuguese ? 'Voltar' : 'Back'}
            </button>

            <div className="flex flex-wrap items-center gap-2">
              <PremiumBadge tone="default">{event.name}</PremiumBadge>
              <PremiumBadge tone="muted">
                {currentStep === 1
                  ? isPortuguese ? 'Selecao' : 'Selection'
                  : currentStep === 2
                    ? isPortuguese ? 'Comprador' : 'Buyer'
                    : currentStep === 3
                      ? isPortuguese ? 'Pagamento' : 'Payment'
                      : isPortuguese ? 'Confirmacao' : 'Confirmation'}
              </PremiumBadge>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_26rem]">
            <div className="space-y-6">
              <PublicReveal>
                <div className="rounded-[2.2rem] border border-white/8 bg-[linear-gradient(135deg,#0d1117_0%,#121823_100%)] p-7 shadow-[0_22px_70px_rgba(0,0,0,0.28)] md:p-9">
                  <div className="text-[11px] uppercase tracking-[0.32em] text-white/48">
                    {isPortuguese ? 'Compra do evento' : 'Event checkout'}
                  </div>
                  <h1 className="mt-4 font-display text-[clamp(3.2rem,5vw,5.4rem)] font-semibold uppercase leading-[0.92] tracking-[-0.05em] text-white">
                    {introTitle}
                  </h1>
                  <p className="mt-5 max-w-3xl text-base leading-7 text-white/66">{introDescription}</p>

                  <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-white/62">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2">
                      <ShieldCheck className="h-4 w-4 text-[#ff6a5c]" />
                      {isPortuguese ? 'Reserva protegida e inventario sincronizado por lote' : 'Protected reservation with batch-synced inventory'}
                    </div>
                    {countdown && phase !== 'form' ? (
                      <div className="inline-flex items-center rounded-full border border-[#ff2d2d]/24 bg-[#ff2d2d]/10 px-4 py-2 text-white">
                        {isPortuguese ? 'Expira em' : 'Expires in'} {countdown}
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
                      {isPortuguese ? 'Voltar para o evento' : 'Back to event'}
                    </button>
                    <button
                      type="button"
                      onClick={handleContinueFromTickets}
                      disabled={cart.length === 0}
                      className="inline-flex items-center gap-2 rounded-full bg-[#ff2d2d] px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.12em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#ff4133] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {isPortuguese ? 'Continuar para dados' : 'Continue to details'}
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
                      {isPortuguese ? 'Ajustar ingressos' : 'Adjust tickets'}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleCreateDraft()}
                      disabled={isBusy || cart.length === 0}
                      className="inline-flex items-center gap-2 rounded-full bg-[#ff2d2d] px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.12em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#ff4133] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {creatingDraft ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                      {isPortuguese ? 'Reservar pedido' : 'Reserve order'}
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
