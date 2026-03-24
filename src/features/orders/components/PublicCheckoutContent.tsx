import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Check, Clock3, Info, Loader2, Lock, RefreshCw, Smartphone, Ticket, XCircle } from 'lucide-react'
import { usePaymentStatus } from '@/features/payments'
import { ORDER_PAYMENT_METHOD_CONFIG } from '@/features/orders/types'
import { useCheckoutFlow, useCheckoutStore } from '@/features/orders/hooks'
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
    <div className="min-h-screen bg-[#080808] text-[#f5f5f0]">
      <nav className="sticky top-0 z-50 flex items-center gap-4 border-b border-[#1a1a1a] bg-[#080808]/95 px-6 py-4 backdrop-blur-sm">
        <button
          onClick={() => void handleBack()}
          disabled={isBusy}
          className="text-xs font-mono text-[#6b6b6b] transition-colors hover:text-[#f5f5f0] disabled:opacity-50"
        >
          ← VOLTAR
        </button>
        <div className="flex-1" />
        <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 16, letterSpacing: 2 }}>
          ANIMALZ<span style={{ color: '#d4ff00' }}>.</span>
        </span>
      </nav>

      <div className="mx-auto max-w-2xl space-y-8 px-6 py-12">
        <div>
          <div className="mb-2 text-[10px] font-mono uppercase tracking-[0.3em] text-[#d4ff00]">
            CHECKOUT · {phase === 'review' ? 'RESERVA' : phase === 'payment' ? 'PAGAMENTO' : phase === 'processing' ? 'CONFIRMACAO' : 'DADOS'}
          </div>
          <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 40, letterSpacing: '-0.01em', lineHeight: 1 }}>
            {phase === 'review' ? 'CONFIRME SUA' : phase === 'payment' ? 'PAGUE SUA' : phase === 'processing' ? 'PROCESSANDO SUA' : 'FINALIZE SEU'}
            <br />
            <span>
              {phase === 'processing' ? 'COMPRA' : 'PEDIDO'}
              <span style={{ color: '#d4ff00' }}>.</span>
            </span>
          </h1>
        </div>

        <div className="overflow-hidden rounded-sm border border-[#1a1a1a]">
          <div className="border-b border-[#1a1a1a] bg-[#0e0e0e] px-5 py-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#6b6b6b]">Resumo do pedido</span>
          </div>

          {cart.map((item) => (
            <div key={item.batch_id} className="flex items-center justify-between border-b border-[#1a1a1a] px-5 py-3.5 last:border-0">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 shrink-0 rounded-full" style={{ background: item.color ?? '#d4ff00' }} />
                <div>
                  <div className="text-sm font-medium">{item.ticket_name}</div>
                  <div className="text-[11px] font-mono text-[#6b6b6b]">
                    {item.batch_name} · {item.quantity}x
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono text-[#d4ff00]">
                  {item.price === 0 ? 'Gratuito' : formatCurrency(item.price * item.quantity)}
                </span>

                {phase === 'form' && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onRemove(item.batch_id)}
                      className="flex h-6 w-6 items-center justify-center rounded-sm border border-[#242424] text-sm text-[#9a9a9a] hover:text-[#f5f5f0]"
                    >
                      −
                    </button>
                    <span className="w-5 text-center text-xs font-mono">{item.quantity}</span>
                    <button
                      onClick={() => onAdd(item.ticket_type_id, item.batch_id)}
                      className="flex h-6 w-6 items-center justify-center rounded-sm border border-[#242424] text-sm text-[#9a9a9a] hover:text-[#f5f5f0]"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          <div className="space-y-2 bg-[#0e0e0e] px-5 py-4">
            <div className="flex items-center justify-between text-xs text-[#9a9a9a]">
              <span>Subtotal</span>
              <span>{cartSummary.subtotal === 0 ? 'Gratuito' : formatCurrency(cartSummary.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-[#9a9a9a]">
              <span>Taxas</span>
              <span>{cartSummary.fee_amount === 0 ? 'Sem taxa nesta etapa' : formatCurrency(cartSummary.fee_amount)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-[#1a1a1a] pt-2">
              <span className="text-sm font-semibold">Total</span>
              <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 24, color: '#d4ff00' }}>
                {cartSummary.total_amount === 0 ? 'GRATUITO' : formatCurrency(cartSummary.total_amount)}
              </span>
            </div>
          </div>
        </div>

        {phase !== 'form' && (
          <div className="flex items-start gap-3 rounded-sm border border-[#d4ff00]/20 bg-[#d4ff00]/5 p-4">
            <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-[#d4ff00]" />
            <div>
              <div className="text-sm font-semibold text-[#d4ff00]">
                Reserva ativa {countdown ? `· expira em ${countdown}` : ''}
              </div>
              <div className="mt-1 text-xs text-[#9a9a9a]">
                O inventario dos lotes selecionados esta reservado para este pedido. Os tickets digitais serao emitidos somente depois da confirmacao do pagamento.
              </div>
              {draftOrderId && <div className="mt-2 text-[11px] font-mono text-[#6b6b6b]">Pedido {draftOrderId.slice(0, 8).toUpperCase()}</div>}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#6b6b6b]">Dados do comprador</div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {[
              { label: 'Nome completo *', key: 'name', type: 'text', placeholder: 'Seu nome' },
              { label: 'E-mail *', key: 'email', type: 'email', placeholder: 'seu@email.com' },
              { label: 'CPF', key: 'cpf', type: 'text', placeholder: '000.000.000-00' },
              { label: 'WhatsApp', key: 'phone', type: 'tel', placeholder: '(00) 00000-0000' },
            ].map((field) => (
              <div key={field.key}>
                <label className="mb-1.5 block text-[10px] font-mono uppercase tracking-wider text-[#6b6b6b]">{field.label}</label>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={buyer[field.key as keyof typeof buyer]}
                  onChange={(event) => setBuyerField(field.key as keyof typeof buyer, event.target.value)}
                  disabled={phase !== 'form'}
                  className="w-full rounded-sm border border-[#242424] bg-[#0e0e0e] px-4 py-3 text-sm text-[#f5f5f0] placeholder-[#4b4b4b] transition-colors focus:border-[#d4ff00]/40 focus:outline-none disabled:opacity-60"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#6b6b6b]">Forma de pagamento</div>
          <div className={cn('grid gap-2', isFreeOrder ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-5')}>
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
                    'relative flex flex-col items-center gap-1.5 rounded-sm border p-3 text-center transition-all disabled:opacity-60',
                    selected ? 'border-[#d4ff00]/40 bg-[#d4ff00]/5 text-[#d4ff00]' : 'border-[#242424] text-[#9a9a9a] hover:border-[#d4ff00]/20',
                  )}
                >
                  {method === 'pix' ? <Smartphone className="h-4 w-4" /> : <Ticket className="h-4 w-4" />}
                  <span className="text-[10px] font-mono">{config?.label ?? method}</span>
                </button>
              )
            })}
          </div>
        </div>

        {draftStatus === 'expired' && (
          <div className="flex items-center gap-2 rounded-sm border border-[#FFB020]/20 bg-[#FFB020]/8 px-4 py-3 text-xs text-[#FFB020]">
            <Clock3 className="h-3.5 w-3.5 shrink-0" /> Sua reserva anterior expirou. Revise o carrinho e tente novamente.
          </div>
        )}

        {draftStatus === 'cancelled' && (
          <div className="flex items-center gap-2 rounded-sm border border-[#242424] bg-[#0e0e0e] px-4 py-3 text-xs text-[#9a9a9a]">
            <XCircle className="h-3.5 w-3.5 shrink-0" /> A reserva foi cancelada e o inventario voltou para o lote.
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-sm border border-[#FF5A6B]/20 bg-[#FF5A6B]/8 px-4 py-3 text-xs text-[#FF5A6B]">
            <Info className="h-3.5 w-3.5 shrink-0" /> {error}
          </div>
        )}

        {phase === 'form' && (
          <button
            onClick={() => void handleCreateDraft()}
            disabled={isBusy || cart.length === 0}
            className="flex w-full items-center justify-center gap-3 rounded-sm bg-[#d4ff00] py-5 text-sm font-bold tracking-wider text-[#080808] transition-all hover:shadow-[0_0_40px_rgba(212,255,0,0.4)] disabled:opacity-50 active:scale-95"
          >
            {creatingDraft ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                RESERVAR PEDIDO
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        )}

        {phase === 'review' && (
          <div className="space-y-3">
            <button
              onClick={() => void handleConfirmDraft()}
              disabled={isBusy}
              className="flex w-full items-center justify-center gap-3 rounded-sm bg-[#d4ff00] py-5 text-sm font-bold tracking-wider text-[#080808] transition-all hover:shadow-[0_0_40px_rgba(212,255,0,0.4)] disabled:opacity-50 active:scale-95"
            >
              {startingPayment || confirmingDraft ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  {isFreeOrder ? 'CONFIRMAR PEDIDO' : 'IR PARA PAGAMENTO'}
                </>
              )}
            </button>

            <button
              onClick={() => void handleBack()}
              disabled={isBusy}
              className="flex w-full items-center justify-center gap-3 rounded-sm border border-[#242424] py-4 text-xs font-mono tracking-wider text-[#9a9a9a] transition-colors hover:border-[#3a3a3a] hover:text-[#f5f5f0] disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              CANCELAR RESERVA
            </button>
          </div>
        )}

        {phase === 'payment' && paymentClientSecret && (
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
        )}

        {phase === 'processing' && (
          <div className="space-y-4 rounded-sm border border-[#242424] bg-[#0e0e0e] p-5">
            <div className="flex items-start gap-3">
              <Loader2 className="mt-0.5 h-5 w-5 animate-spin text-[#d4ff00]" />
              <div>
                <div className="text-sm font-semibold text-[#f5f5f0]">Aguardando confirmacao do gateway</div>
                <div className="mt-1 text-xs text-[#9a9a9a]">
                  O pagamento ja foi enviado ao provedor. Assim que o webhook confirmar a transacao, o pedido sera marcado como pago e os ingressos digitais serao emitidos automaticamente.
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => void paymentStatus.refresh()}
                className="flex items-center gap-2 rounded-sm border border-[#242424] px-3 py-2 text-xs font-mono text-[#9a9a9a] transition-colors hover:border-[#3a3a3a] hover:text-[#f5f5f0]"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                ATUALIZAR STATUS
              </button>
              <button
                onClick={() => {
                  clearPaymentState()
                  setPhase('review')
                }}
                className="rounded-sm border border-[#242424] px-3 py-2 text-xs font-mono text-[#9a9a9a] transition-colors hover:border-[#3a3a3a] hover:text-[#f5f5f0]"
              >
                VOLTAR PARA A RESERVA
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-6 pt-2">
          {[
            { icon: Lock, text: 'Reserva com expiracao automatica' },
            { icon: Ticket, text: 'Inventario controlado por lote' },
            { icon: Check, text: 'Tickets emitidos apos pagamento confirmado' },
          ].map((item) => {
            const Icon = item.icon

            return (
              <span key={item.text} className="flex items-center gap-1.5 text-[11px] text-[#6b6b6b]">
                <Icon className="h-3.5 w-3.5 text-[#d4ff00]" />
                {item.text}
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}
