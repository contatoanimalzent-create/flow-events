import { useState, useCallback } from 'react'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { X, Loader2, ShieldCheck, Lock, Zap, ChevronDown, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { stripePromise, calculateFees, CARD_RATES } from '@/lib/stripe'

interface TicketType {
  id: string
  name: string
  price: number      // centavos BRL
  description?: string
}

interface CheckoutModalProps {
  eventId: string
  eventName: string
  ticketType: TicketType
  onClose: () => void
}

const INSTALLMENT_OPTIONS = [
  { value: 0,  label: 'PIX',       icon: '⚡', badge: 'Menor préço' },
  { value: 1,  label: 'Cartão 1x', icon: '💳', badge: null },
  { value: 2,  label: 'Cartão 2x', icon: '💳', badge: null },
  { value: 3,  label: 'Cartão 3x', icon: '💳', badge: null },
  { value: 6,  label: 'Cartão 6x', icon: '💳', badge: null },
  { value: 12, label: 'Cartão 12x', icon: '💳', badge: 'Máx. parcelas' },
]

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// ── Inner form (inside Elements provider) ──────────────────────
function PaymentForm({
  eventId, ticketType, quantity, installments,
  buyerName, buyerEmail, totalCents, onSuccess,
}: {
  eventId: string
  ticketType: TicketType
  quantity: number
  installments: number
  buyerName: string
  buyerEmail: string
  totalCents: number
  onSuccess: () => void
}) {
  const stripe   = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true); setError('')

    const { error: submitErr } = await elements.submit()
    if (submitErr) { setError(submitErr.message ?? 'Erro'); setLoading(false); return }

    // Get client_secret from edge function
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-payment-intent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          eventId,
          ticketTypeId: ticketType.id,
          quantity,
          installments,
          buyerEmail,
          buyerName,
        }),
      },
    )

    const data = await res.json()
    if (data.error) { setError(data.error); setLoading(false); return }

    const { error: confirmErr } = await stripe.confirmPayment({
      elements,
      clientSecret: data.clientSecret,
      confirmParams: {
        return_url:     `${window.location.origin}/checkout/success`,
        payment_method_data: {
          billing_details: { name: buyerName, email: buyerEmail },
        },
      },
      redirect: 'if_required',  // ← só redireciona se necessário (ex: 3DS)
    })

    if (confirmErr) {
      setError(confirmErr.message ?? 'Erro no pagamento')
      setLoading(false)
    } else {
      onSuccess()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Stripe Payment Element, parece campo nativo */}
      <div>
        <div className="text-[10px] font-mono tracking-widest text-text-muted uppercase mb-2">
          Dados do pagamento
        </div>
        <PaymentElement
          options={{
            layout: 'tabs',
            paymentMethodOrder: ['card', 'pix'],
            fields: { billingDetails: 'never' },  // já coletamos no form
            terms: { card: 'never' },
          }}
        />
      </div>

      {error && (
        <div className="text-xs text-status-error bg-status-error/8 border border-status-error/20 rounded-sm px-3 py-2.5 flex items-center gap-2">
          <X className="w-3.5 h-3.5 shrink-0" />{error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !stripe}
        className="w-full btn-primary py-4 text-base flex items-center justify-center gap-2 rounded-xl disabled:opacity-50"
      >
        {loading
          ? <><Loader2 className="w-5 h-5 animate-spin" /> Processando...</>
          : <><Lock className="w-4 h-4" /> Pagar {formatBRL(totalCents)}</>
        }
      </button>

      <div className="flex items-center justify-center gap-5 text-[10px] text-text-muted">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-status-success" /> Dados criptografados
        </span>
        <span className="flex items-center gap-1">
          <Lock className="w-3 h-3 text-brand-blue" /> Pagamento seguro
        </span>
        <span className="flex items-center gap-1">
          <Zap className="w-3 h-3 text-brand-acid" /> Ingresso imediato
        </span>
      </div>
    </form>
  )
}

// ── Main modal ────────────────────────────────────────────────
export function CheckoutModal({ eventId, eventName, ticketType, onClose }: CheckoutModalProps) {
  const [step,         setStep]         = useState<'config' | 'payment' | 'success'>('config')
  const [installments, setInstallments] = useState(0)
  const [quantity,     setQuantity]     = useState(1)
  const [buyerEmail,   setBuyerEmail]   = useState('')
  const [buyerName,    setBuyerName]    = useState('')
  const [showOptions,  setShowOptions]  = useState(false)
  const [formError,    setFormError]    = useState('')

  const fees  = calculateFees(ticketType.price, installments)
  const total = fees.totalBuyer * quantity
  const selected = INSTALLMENT_OPTIONS.find(o => o.value === installments) ?? INSTALLMENT_OPTIONS[0]

  function handleContinue() {
    if (!buyerName.trim()) { setFormError('Informe seu nome'); return }
    if (!buyerEmail.trim() || !buyerEmail.includes('@')) { setFormError('Informe um e-mail válido'); return }
    setFormError('')
    setStep('payment')
  }

  // Stripe Elements appearance, matches Pulse light theme
  const appearance: Parameters<typeof Elements>[0]['options'] = {
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary:          '#0057E7',
        colorBackground:       '#FFFFFF',
        colorText:             '#0A0A0A',
        colorTextSecondary:    '#44475A',
        colorTextPlaceholder:  '#9CA3AF',
        colorDanger:           '#EF4444',
        borderRadius:          '8px',
        fontFamily:            'Inter, system-ui, sans-serif',
        fontSizeBase:          '14px',
        spacingUnit:           '4px',
        colorIconTab:          '#9CA3AF',
        colorIconTabSelected:  '#0057E7',
      },
      rules: {
        '.Input': {
          border:          '1px solid #E5E7EB',
          backgroundColor: '#FFFFFF',
          boxShadow:       'none',
          padding:         '10px 14px',
        },
        '.Input:focus': {
          border:    '1px solid rgba(0,87,231,0.5)',
          boxShadow: '0 0 0 3px rgba(0,87,231,0.12)',
        },
        '.Label': {
          fontSize:      '10px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color:         '#9CA3AF',
          marginBottom:  '6px',
        },
        '.Tab': {
          border:          '1px solid #E5E7EB',
          backgroundColor: '#F7F8FA',
        },
        '.Tab--selected': {
          border:          '1px solid rgba(0,87,231,0.4)',
          backgroundColor: 'rgba(0,87,231,0.05)',
        },
        '.Tab:hover': { border: '1px solid rgba(0,87,231,0.2)' },
      },
    },
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={step === 'config' ? onClose : undefined} />

      <div className="relative bg-bg-card border border-bg-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md shadow-card overflow-hidden"
        style={{ animation: 'slideUp 0.3s ease-out' }}>

        <div className="h-px bg-gradient-to-r from-transparent via-brand-acid/50 to-transparent" />

        {/* ── Success state ── */}
        {step === 'success' && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-status-success/10 border border-status-success/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-status-success" />
            </div>
            <div className="font-display text-2xl text-text-primary mb-1">PAGAMENTO CONFIRMADO</div>
            <p className="text-sm text-text-muted mb-1">Seu ingresso foi gerado com sucesso!</p>
            <p className="text-xs text-text-muted mb-6">Enviamos para <span className="text-brand-acid">{buyerEmail}</span></p>
            <button onClick={onClose} className="btn-primary w-full">Ver meu ingresso</button>
          </div>
        )}

        {step !== 'success' && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-bg-border">
              <div>
                <div className="text-[10px] font-mono tracking-widest text-text-muted uppercase mb-0.5">{eventName}</div>
                <div className="font-semibold text-text-primary text-sm">{ticketType.name}</div>
              </div>
              <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">

              {/* Price display */}
              <div className="bg-bg-surface border border-bg-border rounded-xl p-4">
                <div className="flex items-end justify-between mb-3">
                  <div>
                    <div className="text-[10px] font-mono text-text-muted uppercase tracking-widest mb-1">Total</div>
                    <div className="font-display text-3xl text-text-primary leading-none">{formatBRL(total)}</div>
                    {installments > 1 && (
                      <div className="text-xs text-brand-acid mt-1 font-mono">
                        {installments}x de {formatBRL(total / installments)}
                      </div>
                    )}
                  </div>
                  <div className="text-right text-[10px] text-text-muted space-y-0.5">
                    <div>{formatBRL(ticketType.price * quantity)} ingresso</div>
                    <div>{formatBRL(fees.adminFee * quantity)} serviço</div>
                    {fees.cardFee > 0 && <div>{formatBRL(fees.cardFee * quantity)} parcelamento</div>}
                  </div>
                </div>

                {/* Quantity */}
                <div className="flex items-center justify-between pt-3 border-t border-bg-border">
                  <span className="text-xs text-text-muted">Quantidade</span>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="w-7 h-7 rounded-sm bg-bg-card border border-bg-border text-text-primary hover:border-brand-acid/30 transition-all flex items-center justify-center text-base leading-none">
                      −
                    </button>
                    <span className="font-mono font-semibold text-text-primary w-4 text-center">{quantity}</span>
                    <button onClick={() => setQuantity(q => Math.min(10, q + 1))}
                      className="w-7 h-7 rounded-sm bg-bg-card border border-bg-border text-text-primary hover:border-brand-acid/30 transition-all flex items-center justify-center text-base leading-none">
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 1: Config */}
              {step === 'config' && (
                <>
                  {/* Payment method selector */}
                  <div className="relative">
                    <button onClick={() => setShowOptions(!showOptions)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-bg-surface border border-bg-border rounded-xl hover:border-brand-acid/30 transition-all text-sm">
                      <span className="flex items-center gap-2 text-text-primary">
                        <span>{selected.icon}</span>
                        <span>{selected.label}</span>
                        {selected.badge && (
                          <span className="text-[9px] bg-brand-acid/10 text-brand-acid px-1.5 py-0.5 rounded-sm font-mono">
                            {selected.badge}
                          </span>
                        )}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-brand-acid font-semibold">{formatBRL(total)}</span>
                        <ChevronDown className={cn('w-4 h-4 text-text-muted transition-transform', showOptions && 'rotate-180')} />
                      </div>
                    </button>

                    {showOptions && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-bg-card border border-bg-border rounded-xl overflow-hidden shadow-card z-10">
                        {INSTALLMENT_OPTIONS.map(opt => {
                          const f   = calculateFees(ticketType.price, opt.value)
                          const tot = f.totalBuyer * quantity
                          const isSelected = opt.value === installments
                          return (
                            <button key={opt.value}
                              onClick={() => { setInstallments(opt.value); setShowOptions(false) }}
                              className={cn(
                                'w-full flex items-center justify-between px-4 py-3 text-sm transition-all border-b border-bg-border last:border-0',
                                isSelected ? 'bg-brand-acid/8 text-brand-acid' : 'hover:bg-bg-surface text-text-secondary'
                              )}>
                              <span className="flex items-center gap-2">
                                <span>{opt.icon}</span><span>{opt.label}</span>
                                {opt.badge && (
                                  <span className="text-[9px] bg-brand-acid/10 text-brand-acid px-1 py-0.5 rounded-sm font-mono">
                                    {opt.badge}
                                  </span>
                                )}
                              </span>
                              <div className="text-right">
                                <div className="font-mono font-semibold">{formatBRL(tot)}</div>
                                {opt.value > 1 && (
                                  <div className="text-[10px] text-text-muted">
                                    {opt.value}x {formatBRL(tot / opt.value)}
                                  </div>
                                )}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Buyer info */}
                  <div className="space-y-2">
                    <input className="input" placeholder="Seu nome completo"
                      value={buyerName} onChange={e => setBuyerName(e.target.value)} />
                    <input type="email" className="input" placeholder="E-mail (ingresso será enviado aqui)"
                      value={buyerEmail} onChange={e => setBuyerEmail(e.target.value)} />
                  </div>

                  {formError && (
                    <div className="text-xs text-status-error bg-status-error/8 border border-status-error/20 rounded-sm px-3 py-2">
                      {formError}
                    </div>
                  )}

                  <button onClick={handleContinue}
                    className="w-full btn-primary py-4 text-base rounded-xl flex items-center justify-center gap-2">
                    Continuar para pagamento →
                  </button>
                </>
              )}

              {/* Step 2: Payment (Stripe Elements) */}
              {step === 'payment' && stripePromise && (
                <Elements stripe={stripePromise} options={{ mode: 'payment' as any, amount: total, currency: 'brl', ...appearance }}>
                  <PaymentForm
                    eventId={eventId}
                    ticketType={ticketType}
                    quantity={quantity}
                    installments={installments}
                    buyerName={buyerName}
                    buyerEmail={buyerEmail}
                    totalCents={total}
                    onSuccess={() => setStep('success')}
                  />
                </Elements>
              )}

              {step === 'payment' && !stripePromise && (
                <div className="text-center py-6 text-sm text-status-warning">
                  Stripe não configurado. Adicione VITE_STRIPE_PUBLISHABLE_KEY no .env
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
