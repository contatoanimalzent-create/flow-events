import { useEffect, useMemo, useState } from 'react'
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
import { usePaymentStatus } from '@/features/payments'
import { ORDER_PAYMENT_METHOD_CONFIG } from '@/features/orders/types'
import { useCheckoutFlow, useCheckoutStore } from '@/features/orders/hooks'
import { PremiumBadge, PublicLayout } from '@/features/public'
import { cn, formatCurrency } from '@/shared/lib'
import { PublicCheckoutPaymentStep } from './PublicCheckoutPaymentStep'
import type { CheckoutCartItem, OrderPaymentMethod } from '@/features/orders/types'

interface PublicCheckoutContentProps {
  event: {
    id: string
    organization_id: string
    name: string
  }
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
  cart,
  onBack,
  onSuccess,
  onAdd,
  onRemove,
  onInventoryChanged,
}: PublicCheckoutContentProps) {
  const { buyer, setBuyerField, resetCheckout } = useCheckoutStore()
  const [phase, setPhase] = useState<'form' | 'review' | 'payment' | 'processing'>('form')
  const [error, setError] = useState('')

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
            setError('Sua reserva expirou e o inventario foi devolvido ao lote.')
            setPhase('form')
          })
          .catch((draftError) => {
            setError(draftError instanceof Error ? draftError.message : 'Nao foi possivel expirar a reserva.')
            setPhase('form')
          })
      }
    }, 1000)

    return () => window.clearInterval(interval)
  }, [clearPaymentState, draftOrderId, expireDraft, expiresAt, isDraftExpired, paymentStatus.isPaid, phase])

  useEffect(() => {
    if (phase !== 'payment' && phase !== 'processing') {
      return
    }

    if (paymentStatus.isPaid) {
      markPaymentStatus('paid')
      resetCheckout()
      onSuccess()
      return
    }

    if (paymentStatus.isFailed) {
      markPaymentStatus('failed')
      clearPaymentState()
      setError('Pagamento nao aprovado. Revise os dados e tente novamente antes da reserva expirar.')
      setPhase('review')
      return
    }

    if (paymentStatus.isCancelled || paymentStatus.isExpired) {
      markPaymentStatus(paymentStatus.isCancelled ? 'cancelled' : null)
      clearPaymentState()
      setError('O pagamento nao foi concluido e a reserva nao esta mais ativa.')
      setPhase('form')
      return
    }

    if (paymentStatus.isRefunded) {
      markPaymentStatus('refunded')
      clearPaymentState()
      setError('Este pagamento foi reembolsado. Se precisar, inicie uma nova compra.')
      setPhase('form')
    }
  }, [
    clearPaymentState,
    markPaymentStatus,
    onSuccess,
    paymentStatus.isCancelled,
    paymentStatus.isExpired,
    paymentStatus.isFailed,
    paymentStatus.isPaid,
    paymentStatus.isRefunded,
    phase,
    resetCheckout,
  ])

  async function handleCreateDraft() {
    if (!buyer.name.trim() || !buyer.email.trim()) {
      setError('Preencha nome e e-mail para reservar o pedido.')
      return
    }

    if (cart.length === 0) {
      setError('Selecione ao menos um ingresso antes de continuar.')
      return
    }

    setError('')

    try {
      await createDraft(isFreeOrder ? 'free' : paymentMethod ?? 'pix')
      setPhase('review')
    } catch (draftError) {
      setError(draftError instanceof Error ? draftError.message : 'Nao foi possivel reservar o pedido.')
    }
  }

  async function handleConfirmDraft() {
    setError('')

    try {
      if (isFreeOrder) {
        await confirmDraft('free')
        resetCheckout()
        onSuccess()
        return
      }

      await beginPayment(paymentMethod ?? 'pix')
      setPhase('payment')
    } catch (confirmError) {
      setError(confirmError instanceof Error ? confirmError.message : 'Nao foi possivel iniciar o pagamento.')
    }
  }

  async function handleBack() {
    setError('')

    if ((phase === 'payment' || phase === 'processing') && draftOrderId) {
      clearPaymentState()
      setPhase('review')
      return
    }

    if (phase === 'review' && draftOrderId) {
      try {
        await cancelDraft()
      } catch (cancelError) {
        setError(cancelError instanceof Error ? cancelError.message : 'Nao foi possivel liberar a reserva.')
        return
      }
    }

    resetCheckout()
    onBack()
  }

  return (
    <PublicLayout
      showFooter={false}
      compactHeader
      headerActionSlot={
        phase !== 'form' && countdown ? (
          <PremiumBadge tone="accent">Reserva ativa · {countdown}</PremiumBadge>
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
              className="text-sm font-medium text-[#5f5549] transition-colors hover:text-[#1f1a15] disabled:opacity-50"
            >
              ← Voltar
            </button>
            <div className="flex flex-wrap items-center gap-2">
              <PremiumBadge tone="default">{event.name}</PremiumBadge>
              <PremiumBadge tone="muted">
                {phase === 'review' ? 'Reserva' : phase === 'payment' ? 'Pagamento' : phase === 'processing' ? 'Confirmacao' : 'Checkout'}
              </PremiumBadge>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_0.78fr]">
            <div className="space-y-6">
              <div className="rounded-[36px] border border-white/70 bg-white/82 p-7 shadow-[0_16px_60px_rgba(48,35,18,0.05)] md:p-9">
                <div className="text-[11px] uppercase tracking-[0.32em] text-[#8e7f68]">Checkout premium</div>
                <h1 className="mt-4 font-serif text-5xl font-semibold leading-none text-[#1f1a15] md:text-6xl">
                  {phase === 'review'
                    ? 'Confirme sua reserva.'
                    : phase === 'payment'
                      ? 'Pague com seguranca.'
                      : phase === 'processing'
                        ? 'Aguardando aprovacao.'
                        : 'Finalize seu pedido.'}
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-[#5f5549]">
                  {phase === 'review'
                    ? 'O inventario dos lotes selecionados esta reservado temporariamente para este pedido.'
                    : phase === 'payment'
                      ? 'Escolha a melhor forma de pagamento mantendo a experiencia clara e confiavel.'
                      : phase === 'processing'
                        ? 'O gateway esta processando a transacao. Assim que o pagamento for confirmado, os tickets digitais serao emitidos automaticamente.'
                        : 'Preencha seus dados e avance para iniciar a reserva dos lotes escolhidos.'}
                </p>
              </div>

              {phase !== 'form' ? (
                <div className="rounded-[32px] border border-[#eadaba] bg-[#faf4e7] p-5 text-[#6d5324] shadow-[0_12px_40px_rgba(48,35,18,0.04)]">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <Clock3 className="mt-1 h-5 w-5" />
                      <div>
                        <div className="text-sm font-semibold">
                          Reserva ativa {countdown ? `· expira em ${countdown}` : ''}
                        </div>
                        <div className="mt-1 text-sm leading-6 text-[#7a6644]">
                          O inventario fica bloqueado apenas durante esta janela. Os tickets digitais sao emitidos quando o pagamento for confirmado.
                        </div>
                      </div>
                    </div>
                    {draftOrderId ? (
                      <div className="text-xs uppercase tracking-[0.26em] text-[#8e7f68]">
                        Pedido {draftOrderId.slice(0, 8)}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <div className="rounded-[36px] border border-white/70 bg-white/82 p-7 shadow-[0_16px_60px_rgba(48,35,18,0.05)] md:p-9">
                <div className="text-[11px] uppercase tracking-[0.3em] text-[#8e7f68]">Dados do comprador</div>
                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                  {[
                    { label: 'Nome completo *', key: 'name', type: 'text', placeholder: 'Seu nome' },
                    { label: 'E-mail *', key: 'email', type: 'email', placeholder: 'seu@email.com' },
                    { label: 'CPF', key: 'cpf', type: 'text', placeholder: '000.000.000-00' },
                    { label: 'WhatsApp', key: 'phone', type: 'tel', placeholder: '(00) 00000-0000' },
                  ].map((field) => (
                    <div key={field.key}>
                      <label className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-[#8e7f68]">{field.label}</label>
                      <input
                        type={field.type}
                        placeholder={field.placeholder}
                        value={buyer[field.key as keyof typeof buyer]}
                        onChange={(event) => setBuyerField(field.key as keyof typeof buyer, event.target.value)}
                        disabled={phase !== 'form'}
                        className="w-full rounded-[18px] border border-[#ddd1bf] bg-[#fbf7f1] px-4 py-3 text-sm text-[#1f1a15] outline-none transition-colors placeholder:text-[#a2927e] focus:border-[#b79e74] disabled:opacity-60"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[36px] border border-white/70 bg-white/82 p-7 shadow-[0_16px_60px_rgba(48,35,18,0.05)] md:p-9">
                <div className="text-[11px] uppercase tracking-[0.3em] text-[#8e7f68]">Forma de pagamento</div>
                <div className={cn('mt-6 grid gap-3', isFreeOrder ? 'grid-cols-1' : 'grid-cols-2 xl:grid-cols-5')}>
                  {paymentOptions.map((method) => {
                    const config = ORDER_PAYMENT_METHOD_CONFIG[method]
                    const selected = (paymentMethod ?? (isFreeOrder ? 'free' : 'pix')) === method

                    return (
                      <button
                        key={method}
                        type="button"
                        disabled={phase !== 'form'}
                        onClick={() => setPaymentMethod(method)}
                        className={cn(
                          'rounded-[24px] border p-4 text-left transition-all disabled:opacity-60',
                          selected
                            ? 'border-[#1f1a15] bg-[#1f1a15] text-[#f8f3ea]'
                            : 'border-[#ddd1bf] bg-[#fbf7f1] text-[#5f5549] hover:border-[#b79e74]',
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

              {draftStatus === 'expired' ? (
                <div className="flex items-center gap-2 rounded-[24px] border border-[#eadaba] bg-[#faf4e7] px-5 py-4 text-sm text-[#6d5324]">
                  <Clock3 className="h-4 w-4 shrink-0" /> Sua reserva anterior expirou. Revise o carrinho e tente novamente.
                </div>
              ) : null}

              {draftStatus === 'cancelled' ? (
                <div className="flex items-center gap-2 rounded-[24px] border border-[#ddd1bf] bg-white/82 px-5 py-4 text-sm text-[#5f5549]">
                  <XCircle className="h-4 w-4 shrink-0" /> A reserva foi cancelada e o inventario voltou para o lote.
                </div>
              ) : null}

              {error ? (
                <div className="flex items-center gap-2 rounded-[24px] border border-[#f2c7cd] bg-[#fff4f5] px-5 py-4 text-sm text-[#a5505b]">
                  <Info className="h-4 w-4 shrink-0" /> {error}
                </div>
              ) : null}

              {phase === 'form' ? (
                <button
                  onClick={() => void handleCreateDraft()}
                  disabled={isBusy || cart.length === 0}
                  className="flex w-full items-center justify-center gap-3 rounded-full bg-[#1f1a15] px-5 py-4 text-sm font-semibold text-[#f8f3ea] transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {creatingDraft ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                  Reservar pedido
                </button>
              ) : null}

              {phase === 'review' ? (
                <div className="space-y-3">
                  <button
                    onClick={() => void handleConfirmDraft()}
                    disabled={isBusy}
                    className="flex w-full items-center justify-center gap-3 rounded-full bg-[#1f1a15] px-5 py-4 text-sm font-semibold text-[#f8f3ea] transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {startingPayment || confirmingDraft ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Lock className="h-4 w-4" />
                    )}
                    {isFreeOrder ? 'Confirmar pedido' : 'Ir para pagamento'}
                  </button>

                  <button
                    onClick={() => void handleBack()}
                    disabled={isBusy}
                    className="flex w-full items-center justify-center gap-3 rounded-full border border-[#ddd1bf] bg-[#fbf7f1] px-5 py-4 text-sm font-medium text-[#5f5549] transition-colors hover:border-[#b79e74] hover:text-[#1f1a15] disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" />
                    Cancelar reserva
                  </button>
                </div>
              ) : null}

              {phase === 'payment' && paymentClientSecret ? (
                <PublicCheckoutPaymentStep
                  clientSecret={paymentClientSecret}
                  totalAmount={cartSummary.total_amount}
                  buyerName={buyer.name}
                  buyerEmail={buyer.email}
                  onSubmitted={() => setPhase('processing')}
                  onBack={() => {
                    clearPaymentState()
                    setPhase('review')
                  }}
                />
              ) : null}

              {phase === 'processing' ? (
                <div className="rounded-[32px] border border-[#ddd1bf] bg-white/82 p-6 shadow-[0_16px_60px_rgba(48,35,18,0.05)]">
                  <div className="flex items-start gap-3">
                    <Loader2 className="mt-1 h-5 w-5 animate-spin text-[#7b6440]" />
                    <div>
                      <div className="text-base font-semibold text-[#1f1a15]">Aguardando confirmacao do gateway</div>
                      <div className="mt-2 text-sm leading-6 text-[#5f5549]">
                        O pagamento ja foi enviado ao provedor. Assim que o webhook confirmar a transacao, o pedido sera marcado como pago e os ingressos digitais serao emitidos automaticamente.
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => void paymentStatus.refresh()}
                      className="inline-flex items-center gap-2 rounded-full border border-[#ddd1bf] bg-[#fbf7f1] px-4 py-2.5 text-sm font-medium text-[#5f5549]"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Atualizar status
                    </button>
                    <button
                      onClick={() => {
                        clearPaymentState()
                        setPhase('review')
                      }}
                      className="inline-flex items-center gap-2 rounded-full border border-[#ddd1bf] bg-[#fbf7f1] px-4 py-2.5 text-sm font-medium text-[#5f5549]"
                    >
                      Voltar para a reserva
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-[36px] border border-white/70 bg-white/82 p-7 shadow-[0_16px_60px_rgba(48,35,18,0.05)] md:p-9">
                <div className="text-[11px] uppercase tracking-[0.32em] text-[#8e7f68]">Resumo do pedido</div>
                <div className="mt-4 font-serif text-4xl font-semibold leading-none text-[#1f1a15]">
                  {event.name}
                </div>
                <p className="mt-3 text-sm leading-7 text-[#5f5549]">
                  Checkout publico refinado sobre a mesma base de reserva, pagamento e emissao ja existente no produto.
                </p>

                <div className="mt-6 space-y-3">
                  {cart.map((item) => (
                    <div key={item.batch_id} className="rounded-[24px] border border-[#eee2cf] bg-[#fbf7f1] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full" style={{ background: item.color ?? '#b79e74' }} />
                            <div className="text-sm font-semibold text-[#1f1a15]">{item.ticket_name}</div>
                          </div>
                          <div className="mt-1 text-xs text-[#7c6f60]">{item.batch_name}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-[#1f1a15]">{item.quantity}x</div>
                          <div className="mt-1 text-xs text-[#7c6f60]">
                            {item.price === 0 ? 'Gratuito' : formatCurrency(item.price * item.quantity)}
                          </div>
                        </div>
                      </div>

                      {phase === 'form' ? (
                        <div className="mt-4 flex items-center justify-end gap-2">
                          <button
                            onClick={() => onRemove(item.batch_id)}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ddd1bf] text-sm text-[#5f5549]"
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-sm text-[#1f1a15]">{item.quantity}</span>
                          <button
                            onClick={() => onAdd(item.ticket_type_id, item.batch_id)}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1f1a15] text-sm text-[#f8f3ea]"
                          >
                            +
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-[28px] border border-[#eee2cf] bg-[#fbf7f1] p-5">
                  <div className="flex items-center justify-between text-sm text-[#7c6f60]">
                    <span>Subtotal</span>
                    <span>{cartSummary.subtotal === 0 ? 'Gratuito' : formatCurrency(cartSummary.subtotal)}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-[#7c6f60]">
                    <span>Taxas</span>
                    <span>{cartSummary.fee_amount === 0 ? 'Sem taxa nesta etapa' : formatCurrency(cartSummary.fee_amount)}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-[#eee2cf] pt-4">
                    <span className="text-sm font-medium text-[#1f1a15]">Total</span>
                    <span className="font-serif text-3xl leading-none text-[#1f1a15]">
                      {cartSummary.total_amount === 0 ? 'Gratuito' : formatCurrency(cartSummary.total_amount)}
                    </span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {[
                    { icon: Lock, text: 'Reserva com expiracao automatica' },
                    { icon: Ticket, text: 'Inventario controlado por lote' },
                    { icon: Check, text: 'Tickets emitidos apos pagamento confirmado' },
                  ].map((item) => {
                    const Icon = item.icon

                    return (
                      <div key={item.text} className="flex items-start gap-3 text-sm text-[#5f5549]">
                        <Icon className="mt-0.5 h-4 w-4 text-[#7b6440]" />
                        <span>{item.text}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
