import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Check, Clock3, Info, Loader2, Lock, Smartphone, Ticket, XCircle } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { ORDER_PAYMENT_METHOD_CONFIG } from '@/features/orders/types'
import { useCheckoutFlow, useCheckoutStore } from '@/features/orders/hooks'
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
  const [phase, setPhase] = useState<'form' | 'review'>('form')
  const [error, setError] = useState('')

  const {
    paymentMethod,
    expiresAt,
    draftOrderId,
    draftStatus,
    cartSummary,
    createDraft,
    confirmDraft,
    cancelDraft,
    expireDraft,
    setPaymentMethod,
    isDraftExpired,
    creatingDraft,
    confirmingDraft,
    cancellingDraft,
    expiringDraft,
  } = useCheckoutFlow({
    eventId: event.id,
    organizationId: event.organization_id,
    cartItems: cart,
    onInventoryChanged,
  })

  const isFreeOrder = cartSummary.total_amount === 0
  const isBusy = creatingDraft || confirmingDraft || cancellingDraft || expiringDraft
  const countdown = formatRemainingTime(expiresAt)

  const paymentOptions = useMemo(
    () => (isFreeOrder ? (['free'] as OrderPaymentMethod[]) : PAID_PAYMENT_METHODS),
    [isFreeOrder],
  )

  useEffect(() => {
    if (phase !== 'review' || !expiresAt || !draftOrderId) {
      return
    }

    const interval = window.setInterval(() => {
      if (isDraftExpired()) {
        window.clearInterval(interval)
        void expireDraft()
          .then(() => {
            setError('Sua reserva expirou e o inventário foi devolvido ao lote.')
            setPhase('form')
          })
          .catch((draftError) => {
            setError(draftError instanceof Error ? draftError.message : 'Não foi possível expirar a reserva.')
            setPhase('form')
          })
      }
    }, 1000)

    return () => window.clearInterval(interval)
  }, [draftOrderId, expireDraft, expiresAt, isDraftExpired, phase])

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
      setError(draftError instanceof Error ? draftError.message : 'Não foi possível reservar o pedido.')
    }
  }

  async function handleConfirmDraft() {
    setError('')

    try {
      await confirmDraft(isFreeOrder ? 'free' : paymentMethod ?? 'pix')
      resetCheckout()
      onSuccess()
    } catch (confirmError) {
      setError(confirmError instanceof Error ? confirmError.message : 'Não foi possível confirmar o pedido.')
    }
  }

  async function handleBack() {
    setError('')

    if (phase === 'review' && draftOrderId) {
      try {
        await cancelDraft()
      } catch (cancelError) {
        setError(cancelError instanceof Error ? cancelError.message : 'Não foi possível liberar a reserva.')
        return
      }
    }

    resetCheckout()
    onBack()
  }

  return (
    <div className="min-h-screen bg-[#080808] text-[#f5f5f0]">
      <nav className="sticky top-0 z-50 flex items-center gap-4 px-6 py-4 bg-[#080808]/95 border-b border-[#1a1a1a] backdrop-blur-sm">
        <button
          onClick={() => void handleBack()}
          disabled={isBusy}
          className="text-[#6b6b6b] hover:text-[#f5f5f0] text-xs font-mono transition-colors disabled:opacity-50"
        >
          ← VOLTAR
        </button>
        <div className="flex-1" />
        <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 16, letterSpacing: 2 }}>
          ANIMALZ<span style={{ color: '#d4ff00' }}>.</span>
        </span>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12 space-y-8">
        <div>
          <div className="text-[10px] font-mono tracking-[0.3em] text-[#d4ff00] mb-2 uppercase">
            CHECKOUT · {phase === 'review' ? 'RESERVA' : 'DADOS'}
          </div>
          <h1 style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 40, letterSpacing: '-0.01em', lineHeight: 1 }}>
            {phase === 'review' ? 'CONFIRME SUA' : 'FINALIZE SEU'}
            <br />
            <span>
              {phase === 'review' ? 'COMPRA' : 'PEDIDO'}
              <span style={{ color: '#d4ff00' }}>.</span>
            </span>
          </h1>
        </div>

        <div className="border border-[#1a1a1a] rounded-sm overflow-hidden">
          <div className="px-5 py-3 bg-[#0e0e0e] border-b border-[#1a1a1a]">
            <span className="text-[10px] font-mono tracking-widest text-[#6b6b6b] uppercase">Resumo do pedido</span>
          </div>

          {cart.map((item) => (
            <div key={item.batch_id} className="flex items-center justify-between px-5 py-3.5 border-b border-[#1a1a1a] last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color ?? '#d4ff00' }} />
                <div>
                  <div className="text-sm font-medium">{item.ticket_name}</div>
                  <div className="text-[11px] text-[#6b6b6b] font-mono">
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
                      className="w-6 h-6 border border-[#242424] rounded-sm text-[#9a9a9a] hover:text-[#f5f5f0] flex items-center justify-center text-sm"
                    >
                      −
                    </button>
                    <span className="w-5 text-center text-xs font-mono">{item.quantity}</span>
                    <button
                      onClick={() => onAdd(item.ticket_type_id, item.batch_id)}
                      className="w-6 h-6 border border-[#242424] rounded-sm text-[#9a9a9a] hover:text-[#f5f5f0] flex items-center justify-center text-sm"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          <div className="px-5 py-4 bg-[#0e0e0e] space-y-2">
            <div className="flex items-center justify-between text-xs text-[#9a9a9a]">
              <span>Subtotal</span>
              <span>{cartSummary.subtotal === 0 ? 'Gratuito' : formatCurrency(cartSummary.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-[#9a9a9a]">
              <span>Taxas</span>
              <span>{cartSummary.fee_amount === 0 ? 'Sem taxa nesta etapa' : formatCurrency(cartSummary.fee_amount)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-[#1a1a1a]">
              <span className="text-sm font-semibold">Total</span>
              <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 24, color: '#d4ff00' }}>
                {cartSummary.total_amount === 0 ? 'GRATUITO' : formatCurrency(cartSummary.total_amount)}
              </span>
            </div>
          </div>
        </div>

        {phase === 'review' && (
          <div className="p-4 bg-[#d4ff00]/5 border border-[#d4ff00]/20 rounded-sm flex items-start gap-3">
            <Clock3 className="w-5 h-5 text-[#d4ff00] shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-[#d4ff00]">
                Reserva ativa {countdown ? `· expira em ${countdown}` : ''}
              </div>
              <div className="text-xs text-[#9a9a9a] mt-1">
                Seu pedido já reservou inventário nos lotes selecionados. Ao confirmar, o sistema baixa a reserva e emite os ingressos digitais.
              </div>
              {draftOrderId && <div className="text-[11px] font-mono text-[#6b6b6b] mt-2">Pedido {draftOrderId.slice(0, 8).toUpperCase()}</div>}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="text-[10px] font-mono tracking-[0.3em] text-[#6b6b6b] uppercase">Dados do comprador</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { label: 'Nome completo *', key: 'name', type: 'text', placeholder: 'Seu nome' },
              { label: 'E-mail *', key: 'email', type: 'email', placeholder: 'seu@email.com' },
              { label: 'CPF', key: 'cpf', type: 'text', placeholder: '000.000.000-00' },
              { label: 'WhatsApp', key: 'phone', type: 'tel', placeholder: '(00) 00000-0000' },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-[10px] font-mono tracking-wider text-[#6b6b6b] uppercase mb-1.5">{field.label}</label>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={buyer[field.key as keyof typeof buyer]}
                  onChange={(event) => setBuyerField(field.key as keyof typeof buyer, event.target.value)}
                  disabled={phase === 'review'}
                  className="w-full bg-[#0e0e0e] border border-[#242424] text-[#f5f5f0] placeholder-[#4b4b4b] rounded-sm px-4 py-3 text-sm focus:outline-none focus:border-[#d4ff00]/40 transition-colors disabled:opacity-60"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-[10px] font-mono tracking-[0.3em] text-[#6b6b6b] uppercase">Forma de pagamento</div>
          <div className={cn('grid gap-2', isFreeOrder ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-5')}>
            {paymentOptions.map((method) => {
              const config = ORDER_PAYMENT_METHOD_CONFIG[method]
              const selected = (paymentMethod ?? (isFreeOrder ? 'free' : 'pix')) === method

              return (
                <button
                  key={method}
                  type="button"
                  disabled={phase === 'review'}
                  onClick={() => setPaymentMethod(method)}
                  className={cn(
                    'relative flex flex-col items-center gap-1.5 p-3 rounded-sm border text-center transition-all disabled:opacity-60',
                    selected ? 'border-[#d4ff00]/40 bg-[#d4ff00]/5 text-[#d4ff00]' : 'border-[#242424] text-[#9a9a9a] hover:border-[#d4ff00]/20',
                  )}
                >
                  {method === 'pix' ? <Smartphone className="w-4 h-4" /> : <Ticket className="w-4 h-4" />}
                  <span className="text-[10px] font-mono">{config?.label ?? method}</span>
                </button>
              )
            })}
          </div>
        </div>

        {draftStatus === 'expired' && (
          <div className="flex items-center gap-2 text-xs text-[#FFB020] bg-[#FFB020]/8 border border-[#FFB020]/20 rounded-sm px-4 py-3">
            <Clock3 className="w-3.5 h-3.5 shrink-0" /> Sua reserva anterior expirou. Revise o carrinho e tente novamente.
          </div>
        )}

        {draftStatus === 'cancelled' && (
          <div className="flex items-center gap-2 text-xs text-[#9a9a9a] bg-[#0e0e0e] border border-[#242424] rounded-sm px-4 py-3">
            <XCircle className="w-3.5 h-3.5 shrink-0" /> A reserva foi cancelada e o inventário voltou para o lote.
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-xs text-[#FF5A6B] bg-[#FF5A6B]/8 border border-[#FF5A6B]/20 rounded-sm px-4 py-3">
            <Info className="w-3.5 h-3.5 shrink-0" /> {error}
          </div>
        )}

        {phase === 'form' ? (
          <button
            onClick={() => void handleCreateDraft()}
            disabled={isBusy || cart.length === 0}
            className="w-full flex items-center justify-center gap-3 bg-[#d4ff00] text-[#080808] py-5 rounded-sm text-sm font-bold tracking-wider hover:shadow-[0_0_40px_rgba(212,255,0,0.4)] transition-all disabled:opacity-50 active:scale-95"
          >
            {creatingDraft ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                RESERVAR PEDIDO
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        ) : (
          <div className="space-y-3">
            <button
              onClick={() => void handleConfirmDraft()}
              disabled={isBusy}
              className="w-full flex items-center justify-center gap-3 bg-[#d4ff00] text-[#080808] py-5 rounded-sm text-sm font-bold tracking-wider hover:shadow-[0_0_40px_rgba(212,255,0,0.4)] transition-all disabled:opacity-50 active:scale-95"
            >
              {confirmingDraft ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  CONFIRMAR PEDIDO
                </>
              )}
            </button>

            <button
              onClick={() => void handleBack()}
              disabled={isBusy}
              className="w-full flex items-center justify-center gap-3 border border-[#242424] text-[#9a9a9a] py-4 rounded-sm text-xs font-mono tracking-wider hover:text-[#f5f5f0] hover:border-[#3a3a3a] transition-colors disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              CANCELAR RESERVA
            </button>
          </div>
        )}

        <div className="flex items-center justify-center gap-6 flex-wrap pt-2">
          {[
            { icon: Lock, text: 'Reserva com expiração automática' },
            { icon: Ticket, text: 'Inventário controlado por lote' },
            { icon: Check, text: 'Ingressos emitidos após confirmação' },
          ].map((item) => {
            const Icon = item.icon

            return (
              <span key={item.text} className="flex items-center gap-1.5 text-[11px] text-[#6b6b6b]">
                <Icon className="w-3.5 h-3.5 text-[#d4ff00]" />
                {item.text}
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}
