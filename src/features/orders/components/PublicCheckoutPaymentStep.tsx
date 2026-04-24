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
      setError(submitError.message ?? 'Não foi possível validar os dados do pagamento.')
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
      setError(confirmError.message ?? 'Não foi possível iniciar o pagamento.')
      setSubmitting(false)
      return
    }

    setSubmitting(false)
    onSubmitted()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-[32px] border border-white/70 bg-white/82 p-6 shadow-[0_16px_60px_rgba(48,35,18,0.05)]">
        <div className="mb-3 text-[11px] uppercase tracking-[0.28em] text-[#8e7f68]">Pagamento</div>
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-[24px] border border-[#f2c7cd] bg-[#fff4f5] px-5 py-4 text-sm text-[#a5505b]">
          <Info className="h-4 w-4 shrink-0" />
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={submitting || !stripe}
        className="flex w-full items-center justify-center gap-3 rounded-full bg-[#1f1a15] px-5 py-4 text-sm font-semibold text-[#f8f3ea] transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            <Lock className="h-4 w-4" />
            Pagar {formatCurrency(totalAmount)}
          </>
        )}
      </button>

      <button
        type="button"
        onClick={onBack}
        disabled={submitting}
        className="w-full rounded-full border border-[#ddd1bf] bg-[#fbf7f1] px-5 py-4 text-sm font-medium text-[#5f5549] transition-colors hover:border-[#b79e74] hover:text-[#1f1a15] disabled:opacity-50"
      >
        Voltar para a reserva
      </button>
    </form>
  )
}

export function PublicCheckoutPaymentStep(props: PublicCheckoutPaymentStepProps) {
  if (!stripePromise) {
    return (
      <div className="rounded-[24px] border border-[#eadaba] bg-[#faf4e7] px-5 py-4 text-sm text-[#6d5324]">
        A chave pública do Stripe não está configurada neste ambiente.
      </div>
    )
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret: props.clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#1f1a15',
            colorBackground: '#fbf7f1',
            colorText: '#1f1a15',
            colorDanger: '#a5505b',
            colorTextPlaceholder: '#8e7f68',
            borderRadius: '18px',
            fontFamily: 'DM Sans, system-ui, sans-serif',
          },
          rules: {
            '.Input': {
              border: '1px solid #ddd1bf',
              boxShadow: 'none',
            },
            '.Input:focus': {
              border: '1px solid #b79e74',
              boxShadow: 'none',
            },
            '.Tab': {
              border: '1px solid #ddd1bf',
              backgroundColor: '#fbf7f1',
            },
            '.Tab--selected': {
              border: '1px solid #1f1a15',
              backgroundColor: '#fff',
            },
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
