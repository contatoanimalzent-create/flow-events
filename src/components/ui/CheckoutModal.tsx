import { useState } from 'react'
import { X, CreditCard, Zap, Loader2, ShieldCheck, Lock, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  calculateFees,
  createCheckoutSession,
  CARD_RATES,
} from '@/lib/stripe'

interface TicketType {
  id: string
  name: string
  price: number          // in cents (BRL)
  description?: string
}

interface CheckoutModalProps {
  eventId: string
  eventName: string
  ticketType: TicketType
  onClose: () => void
}

const INSTALLMENT_OPTIONS = [
  { value: 0,  label: 'PIX', icon: '⚡', badge: 'Menor preço' },
  { value: 1,  label: 'Cartão 1x', icon: '💳', badge: null },
  { value: 2,  label: 'Cartão 2x', icon: '💳', badge: null },
  { value: 3,  label: 'Cartão 3x', icon: '💳', badge: null },
  { value: 6,  label: 'Cartão 6x', icon: '💳', badge: null },
  { value: 12, label: 'Cartão 12x', icon: '💳', badge: 'Mais parcelas' },
]

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function CheckoutModal({ eventId, eventName, ticketType, onClose }: CheckoutModalProps) {
  const [installments, setInstallments]   = useState(0)
  const [quantity, setQuantity]           = useState(1)
  const [email, setEmail]                 = useState('')
  const [name, setName]                   = useState('')
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState('')
  const [showInstallments, setShowInstallments] = useState(false)

  const fees    = calculateFees(ticketType.price, installments)
  const total   = fees.totalBuyer * quantity
  const parcel  = installments > 1 ? total / installments : null

  const selectedOption = INSTALLMENT_OPTIONS.find(o => o.value === installments)
    ?? INSTALLMENT_OPTIONS[0]

  async function handlePay() {
    if (!email.trim()) { setError('Informe seu e-mail'); return }
    if (!name.trim())  { setError('Informe seu nome'); return }
    setLoading(true); setError('')

    const result = await createCheckoutSession(
      {
        eventId,
        ticketTypeId: ticketType.id,
        quantity,
        installments,
        buyerEmail: email,
        successUrl: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl:  `${window.location.href}`,
      },
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY,
    )

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    if (result.url) {
      window.location.href = result.url
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-bg-card border border-bg-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md shadow-card animate-slide-up overflow-hidden">

        {/* Top accent */}
        <div className="h-px bg-gradient-to-r from-transparent via-brand-acid/50 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-bg-border">
          <div>
            <div className="text-[10px] font-mono tracking-widest text-text-muted uppercase mb-0.5">
              {eventName}
            </div>
            <div className="font-semibold text-text-primary text-sm">{ticketType.name}</div>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">

          {/* All-in price display */}
          <div className="bg-bg-surface border border-bg-border rounded-xl p-4 text-center">
            <div className="text-[10px] font-mono tracking-widest text-text-muted uppercase mb-1">
              Você paga
            </div>
            <div className="font-display text-4xl text-text-primary leading-none">
              {formatBRL(fees.totalBuyer * quantity)}
            </div>
            {parcel && (
              <div className="text-sm text-brand-acid mt-1 font-mono">
                {installments}x de {formatBRL(parcel)} sem juros*
              </div>
            )}
            <div className="text-[10px] text-text-muted mt-2">
              Preço total · sem surpresas no checkout
            </div>

            {/* Fee breakdown toggle */}
            <div className="mt-3 pt-3 border-t border-bg-border space-y-1 text-left">
              <div className="flex justify-between text-[11px]">
                <span className="text-text-muted">
                  {ticketType.name} × {quantity}
                </span>
                <span className="text-text-secondary font-mono">
                  {formatBRL(ticketType.price * quantity)}
                </span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-text-muted">Taxa de serviço (5%)</span>
                <span className="text-text-secondary font-mono">
                  {formatBRL(fees.adminFee * quantity)}
                </span>
              </div>
              {fees.cardFee > 0 && (
                <div className="flex justify-between text-[11px]">
                  <span className="text-text-muted">
                    Parcelamento {installments}x ({(CARD_RATES[installments] * 100).toFixed(1)}%)
                  </span>
                  <span className="text-text-secondary font-mono">
                    {formatBRL(fees.cardFee * quantity)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quantity */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Quantidade</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-sm bg-bg-surface border border-bg-border flex items-center justify-center text-text-primary hover:border-brand-acid/30 transition-all text-lg leading-none"
              >−</button>
              <span className="font-mono font-semibold text-text-primary w-4 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(q => Math.min(10, q + 1))}
                className="w-8 h-8 rounded-sm bg-bg-surface border border-bg-border flex items-center justify-center text-text-primary hover:border-brand-acid/30 transition-all text-lg leading-none"
              >+</button>
            </div>
          </div>

          {/* Payment method */}
          <div>
            <div className="text-[10px] font-mono tracking-widest text-text-muted uppercase mb-2">
              Forma de pagamento
            </div>
            <div className="relative">
              <button
                onClick={() => setShowInstallments(!showInstallments)}
                className="w-full flex items-center justify-between px-4 py-3 bg-bg-surface border border-bg-border rounded-xl hover:border-brand-acid/30 transition-all text-sm"
              >
                <span className="flex items-center gap-2 text-text-primary">
                  <span>{selectedOption.icon}</span>
                  <span>{selectedOption.label}</span>
                  {selectedOption.badge && (
                    <span className="text-[10px] bg-brand-acid/10 text-brand-acid px-1.5 py-0.5 rounded-sm font-mono">
                      {selectedOption.badge}
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-brand-acid font-semibold text-sm">
                    {formatBRL(fees.totalBuyer * quantity)}
                  </span>
                  <ChevronDown className={cn('w-4 h-4 text-text-muted transition-transform', showInstallments && 'rotate-180')} />
                </div>
              </button>

              {showInstallments && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-bg-card border border-bg-border rounded-xl overflow-hidden shadow-card z-10">
                  {INSTALLMENT_OPTIONS.map(opt => {
                    const f     = calculateFees(ticketType.price, opt.value)
                    const tot   = f.totalBuyer * quantity
                    const parc  = opt.value > 1 ? tot / opt.value : null
                    const isSelected = opt.value === installments
                    return (
                      <button
                        key={opt.value}
                        onClick={() => { setInstallments(opt.value); setShowInstallments(false) }}
                        className={cn(
                          'w-full flex items-center justify-between px-4 py-3 text-sm transition-all border-b border-bg-border last:border-0',
                          isSelected
                            ? 'bg-brand-acid/8 text-brand-acid'
                            : 'hover:bg-bg-surface text-text-secondary'
                        )}
                      >
                        <span className="flex items-center gap-2">
                          <span>{opt.icon}</span>
                          <span>{opt.label}</span>
                          {opt.badge && (
                            <span className="text-[9px] bg-brand-acid/10 text-brand-acid px-1 py-0.5 rounded-sm font-mono">
                              {opt.badge}
                            </span>
                          )}
                        </span>
                        <div className="text-right">
                          <div className="font-mono font-semibold">{formatBRL(tot)}</div>
                          {parc && (
                            <div className="text-[10px] text-text-muted">
                              {opt.value}x {formatBRL(parc)}
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Buyer info */}
          <div className="space-y-2">
            <input
              className="input"
              placeholder="Seu nome completo"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <input
              type="email"
              className="input"
              placeholder="Seu e-mail (ingresso será enviado aqui)"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-xs text-status-error bg-status-error/8 border border-status-error/20 rounded-sm px-3 py-2">
              {error}
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handlePay}
            disabled={loading}
            className="w-full btn-primary py-4 text-base flex items-center justify-center gap-2 rounded-xl"
          >
            {loading
              ? <><Loader2 className="w-5 h-5 animate-spin" /> Redirecionando...</>
              : <><Lock className="w-4 h-4" /> Pagar {formatBRL(fees.totalBuyer * quantity)}</>
            }
          </button>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 text-[10px] text-text-muted">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-status-success" /> Pagamento seguro
            </span>
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-brand-blue" /> Stripe SSL
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-brand-acid" /> Ingresso imediato
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
