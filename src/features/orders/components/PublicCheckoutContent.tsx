import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, Loader2, ShieldCheck, Tag, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { growthService, readStoredReferralCode } from '@/features/growth'
import { usePaymentStatus } from '@/features/payments'
import { usePublicLocale } from '@/features/public/lib/public-locale'
import { useCheckoutFlow, useCheckoutStore } from '@/features/orders/hooks'
import { sendPaymentConfirmationEmail } from '@/features/orders/services/email.service'
import type { CheckoutCartItem, OrderPaymentMethod } from '@/features/orders/types'
import { PublicLayout, PremiumBadge, PublicReveal } from '@/features/public'
import type { PublicTicketType } from '@/features/public/types/public.types'
import { CheckoutForm } from './CheckoutForm'
import { CheckoutStepper } from './CheckoutStepper'
import { OrderSummaryPanel } from './OrderSummaryPanel'
import { PaymentSection } from './PaymentSection'
import { TicketSelector } from './TicketSelector'

// ─── Coupon Input ─────────────────────────────────────────────────────────────

interface CouponState {
  code: string
  type: 'percentage' | 'fixed'
  value: number
  discount: number // pré-computed discount in R$
}

function CouponInput({
  subtotal,
  eventId,
  onApply,
  onRemove,
  appliedCoupon,
  isPortuguese,
}: {
  subtotal: number
  eventId: string
  onApply: (coupon: CouponState) => void
  onRemove: () => void
  appliedCoupon: CouponState | null
  isPortuguese: boolean
}) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleApply() {
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) return
    setLoading(true); setError('')

    const { data, error: dbErr } = await supabase
      .from('discount_coupons')
      .select('id, code, type, value, max_uses, uses_count, valid_until, min_order_amount, is_active')
      .eq('code', trimmed)
      .eq('is_active', true)
      .maybeSingle()

    setLoading(false)

    if (dbErr || !data) {
      setError(isPortuguese ? 'Cupom inválido ou inexistente.' : 'Invalid or non-existent coupon.')
      return
    }
    if (data.valid_until && new Date(data.valid_until) < new Date()) {
      setError(isPortuguese ? 'Este cupom expirou.' : 'This coupon has expired.')
      return
    }
    if (data.max_uses != null && data.uses_count >= data.max_uses) {
      setError(isPortuguese ? 'Este cupom atingiu o limite de usos.' : 'This coupon has reached its usage limit.')
      return
    }
    if (data.min_order_amount != null && subtotal < data.min_order_amount) {
      setError(
        isPortuguese
          ? `Pedido mínimo de R$ ${data.min_order_amount.toFixed(2)} para este cupom.`
          : `Minimum order of R$ ${data.min_order_amount.toFixed(2)} required for this coupon.`,
      )
      return
    }

    // Also check event scope (if coupon is for a specific event, validate)
    const { data: couponFull } = await supabase
      .from('discount_coupons')
      .select('event_id')
      .eq('id', data.id)
      .single()

    if (couponFull?.event_id && couponFull.event_id !== eventId) {
      setError(isPortuguese ? 'Este cupom não é válido para este evento.' : 'This coupon is not valid for this event.')
      return
    }

    const discount = data.type === 'percentage'
      ? Math.min(subtotal, subtotal * (data.value / 100))
      : Math.min(subtotal, data.value)

    onApply({ code: data.code, type: data.type, value: data.value, discount })
    setCode('')
  }

  if (appliedCoupon) {
    return (
      <div className="flex items-center justify-between rounded-[1.4rem] border border-[#22c55e]/30 bg-[#22c55e]/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-[#22c55e]" />
          <div>
            <span className="font-mono text-sm font-bold text-[#22c55e]">{appliedCoupon.code}</span>
            <span className="ml-2 text-xs text-white/60">
              {appliedCoupon.type === 'percentage'
                ? `${appliedCoupon.value}% OFF`
                : `R$ ${appliedCoupon.value.toFixed(2)} OFF`}
              {' · '}
              {isPortuguese ? 'Desconto:' : 'Discount:'}{' '}
              -R$ {appliedCoupon.discount.toFixed(2)}
            </span>
          </div>
        </div>
        <button onClick={onRemove} className="p-1 text-white/50 hover:text-white transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && void handleApply()}
            placeholder={isPortuguese ? 'Código de desconto' : 'Discount code'}
            className="w-full rounded-full border border-white/10 bg-white/[0.05] py-3 pl-10 pr-4 font-mono text-sm uppercase tracking-widest text-white placeholder-white/30 focus:border-white/30 focus:outline-none transition-colors"
            maxLength={20}
          />
        </div>
        <button
          onClick={() => void handleApply()}
          disabled={loading || !code.trim()}
          className="rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-white/20 disabled:opacity-40"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : isPortuguese ? 'Aplicar' : 'Apply'}
        </button>
      </div>
      {error && <p className="pl-1 text-xs text-[#ff6a5c]">{error}</p>}
    </div>
  )
}

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
  const [appliedCoupon, setAppliedCoupon] = useState<CouponState | null>(null)
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
      setError(isPortuguese ? 'Sua reserva expirou e o inventário foi devolvido aos lotes disponíveis.' : 'Your reservation has expired and inventory has been returned to the available batches.')
            setPhase('form')
            setCurrentStep(2)
          })
          .catch((draftError) => {
            setError(draftError instanceof Error ? draftError.message : isPortuguese ? 'Não foi possível expirar a reserva.' : 'Unable to expire the reservation.')
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
      setError(isPortuguese ? 'Pagamento não aprovado. Revise os dados e tente novamente antes da reserva expirar.' : 'Payment was not approved. Review your details and try again before the reservation expires.')
      setPhase('review')
      setCurrentStep(3)
      return
    }

    if (paymentStatus.isCancelled || paymentStatus.isExpired) {
      markPaymentStatus(paymentStatus.isCancelled ? 'cancelled' : null)
      clearPaymentState()
      setError(isPortuguese ? 'O pagamento não foi concluido e a reserva não está mais ativa.' : 'Payment was not completed and the reservation is no longer active.')
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
      setError(draftError instanceof Error ? draftError.message : isPortuguese ? 'Não foi possível reservar o pedido.' : 'Unable to reserve the order.')
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

        // Send confirmation email with QR code for free orders
        if (draftOrderId) {
          void sendPaymentConfirmationEmail(draftOrderId)
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
      setError(confirmError instanceof Error ? confirmError.message : isPortuguese ? 'Não foi possível iniciar o pagamento.' : 'Unable to start payment.')
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
        setError(cancelError instanceof Error ? cancelError.message : isPortuguese ? 'Não foi possível liberar a reserva.' : 'Unable to release the reservation.')
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
        ? isPortuguese ? 'Confirme quem recebe a experiência.' : 'Confirm who receives the experience.'
        : currentStep === 3
          ? phase === 'payment'
            ? isPortuguese ? 'Finalize a compra.' : 'Complete your purchase.'
            : phase === 'processing'
              ? isPortuguese ? 'Sua transação está em processamento.' : 'Your transaction is being processed.'
              : isPortuguese ? 'Sua reserva está pronta.' : 'Your reservation is ready.'
          : isPortuguese ? 'Compra concluida.' : 'Purchase completed.'

  const introDescription =
    currentStep === 1
      ? isPortuguese
        ? 'Compare acessos, disponibilidade e valor em um fluxo direto, com inventário validado em tempo real.'
        : 'Compare access options, availability and pricing in a direct flow with real-time validated inventory.'
      : currentStep === 2
        ? isPortuguese
          ? 'Mantivemos apenas os campos essenciais para reservar, pagar e emitir os ingressos com confiança.'
          : 'We kept only the essential fields to reserve, pay and issue tickets with confidence.'
      : phase === 'processing'
          ? isPortuguese
            ? 'O processador está tratando a transação. Assim que a confirmação chegar, os ingressos digitais serão emitidos automaticamente.'
            : 'The gateway is processing the transaction. As soon as confirmation arrives, digital tickets will be issued automatically.'
      : event.absorb_fee
            ? isPortuguese
              ? 'Reserva, pagamento e emissão acontecem sobre a mesma base operacional, com taxa absorvida pelo produtor para manter o total limpo ao comprador.'
              : 'Reservation, payment and issuance happen on the same operational foundation, with fees absorbed by the producer to keep the buyer total clean.'
            : isPortuguese
              ? 'Reserva, pagamento e emissão acontecem sobre a mesma base operacional do produto, agora com apresentacao mais clara e comercial.'
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
                      {isPortuguese ? 'Reserva protegida e inventário sincronizado por lote' : 'Protected reservation with batch-synced inventory'}
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

                  {/* Coupon input */}
                  {cartSummary.subtotal > 0 && (
                    <CouponInput
                      subtotal={cartSummary.subtotal}
                      eventId={event.id}
                      appliedCoupon={appliedCoupon}
                      onApply={setAppliedCoupon}
                      onRemove={() => setAppliedCoupon(null)}
                      isPortuguese={isPortuguese}
                    />
                  )}

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
              summary={{
                ...cartSummary,
                total_amount: Math.max(0, cartSummary.total_amount - (appliedCoupon?.discount ?? 0)),
              }}
              editable={phase === 'form'}
              onAdd={onAdd}
              onRemove={onRemove}
              reserveCountdown={phase !== 'form' ? countdown : null}
              couponCode={appliedCoupon?.code}
              couponDiscount={appliedCoupon?.discount}
            />
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
