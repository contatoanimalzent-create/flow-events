import type { FormEvent } from 'react'
import { useState } from 'react'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { Info, Loader2, Lock } from 'lucide-react'
import { stripePromise } from '@/lib/stripe'
import { formatCurrency } from '@/shared/lib'

interface PublicCheckoutPaymentStepProps {
  clientSecret: string
  totalAmount: number
  buyerName: string
  buyerEmail: string
  onSubmitted: () => void
  onBack: () => void
}

function EmbeddedPaymentForm({
  totalAmount,
  buyerName,
  buyerEmail,
  onSubmitted,
  onBack,
}: Omit<PublicCheckoutPaymentStepProps, 'clientSecret'>) {
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setSubmitting(true)
    setError('')

    const { error: submitError } = await elements.submit()

    if (submitError) {
      setError(submitError.message ?? 'Nao foi possivel validar os dados do pagamento.')
      setSubmitting(false)
      return
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        payment_method_data: {
          billing_details: {
            name: buyerName,
            email: buyerEmail,
          },
        },
      },
      redirect: 'if_required',
    })

    if (confirmError) {
      setError(confirmError.message ?? 'Nao foi possivel iniciar o pagamento.')
      setSubmitting(false)
      return
    }

    setSubmitting(false)
    onSubmitted()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-sm border border-[#242424] bg-[#0e0e0e] p-4">
        <div className="mb-3 text-[10px] font-mono uppercase tracking-[0.3em] text-[#6b6b6b]">Pagamento</div>
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-sm border border-[#FF5A6B]/20 bg-[#FF5A6B]/8 px-4 py-3 text-xs text-[#FF5A6B]">
          <Info className="h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || !stripe}
        className="flex w-full items-center justify-center gap-3 rounded-sm bg-[#d4ff00] py-5 text-sm font-bold tracking-wider text-[#080808] transition-all hover:shadow-[0_0_40px_rgba(212,255,0,0.4)] disabled:opacity-50 active:scale-95"
      >
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Lock className="h-4 w-4" />
            PAGAR {formatCurrency(totalAmount)}
          </>
        )}
      </button>

      <button
        type="button"
        onClick={onBack}
        disabled={submitting}
        className="w-full rounded-sm border border-[#242424] py-4 text-xs font-mono tracking-wider text-[#9a9a9a] transition-colors hover:border-[#3a3a3a] hover:text-[#f5f5f0] disabled:opacity-50"
      >
        VOLTAR PARA A RESERVA
      </button>
    </form>
  )
}

export function PublicCheckoutPaymentStep(props: PublicCheckoutPaymentStepProps) {
  if (!stripePromise) {
    return (
      <div className="rounded-sm border border-[#FFB020]/20 bg-[#FFB020]/8 px-4 py-4 text-sm text-[#FFB020]">
        A chave publica do Stripe nao esta configurada neste ambiente.
      </div>
    )
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret: props.clientSecret,
        appearance: {
          theme: 'night',
          variables: {
            colorPrimary: '#d4ff00',
            colorBackground: '#0e0e0e',
            colorText: '#f5f5f0',
            colorDanger: '#FF5A6B',
            borderRadius: '2px',
          },
        },
      }}
    >
      <EmbeddedPaymentForm
        totalAmount={props.totalAmount}
        buyerName={props.buyerName}
        buyerEmail={props.buyerEmail}
        onSubmitted={props.onSubmitted}
        onBack={props.onBack}
      />
    </Elements>
  )
}
