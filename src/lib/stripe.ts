import { loadStripe } from '@stripe/stripe-js'

// Publishable key — safe to expose in frontend
const STRIPE_PK = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

if (!STRIPE_PK) {
  console.warn('[Stripe] VITE_STRIPE_PUBLISHABLE_KEY not set — payments disabled')
}

// Singleton promise so Stripe loads once
export const stripePromise = STRIPE_PK ? loadStripe(STRIPE_PK) : null

// ── Fee calculation (all-in pricing) ─────────────────────────
// Everything passed to buyer — producer always gets net amount

export interface FeeBreakdown {
  faceValue: number         // what producer wants to receive
  adminFee: number          // 5% — Pulse revenue
  processingFee: number     // 1.8% — Pulse revenue (from producer's net)
  cardFee: number           // 0% PIX | card % — passed to buyer
  totalBuyer: number        // what buyer pays
  producerNet: number       // what producer receives after processing fee
  flowRevenue: number       // total Pulse earns
}

// Pagar.me/Stripe card rates by installments
export const CARD_RATES: Record<number, number> = {
  1:  0.0299,  // Stripe ~2.9% + $0.30 (absorbed in flat)
  2:  0.0520,
  3:  0.0620,
  4:  0.0720,
  5:  0.0820,
  6:  0.0920,
  7:  0.1120,
  8:  0.1220,
  9:  0.1320,
  10: 0.1420,
  11: 0.1520,
  12: 0.1620,
}

export const ADMIN_FEE_RATE   = 0.05   // 5% from buyer
export const PROCESSING_RATE  = 0.018  // 1.8% from producer
export const PIX_RATE         = 0.0    // passed as 0 — Stripe PIX is low flat fee absorbed in admin

export function calculateFees(faceValue: number, installments: number = 0): FeeBreakdown {
  // installments = 0 means PIX
  const adminFee      = faceValue * ADMIN_FEE_RATE
  const cardRate      = installments > 1 ? CARD_RATES[installments] ?? CARD_RATES[12] : 0
  const cardFee       = faceValue * cardRate
  const totalBuyer    = faceValue + adminFee + cardFee
  const processingFee = faceValue * PROCESSING_RATE
  const producerNet   = faceValue - processingFee
  const flowRevenue   = adminFee + processingFee

  return {
    faceValue,
    adminFee,
    processingFee,
    cardFee,
    totalBuyer,
    producerNet,
    flowRevenue,
  }
}

export function formatInstallment(total: number, installments: number): string {
  if (installments <= 1) return `R$ ${total.toFixed(2).replace('.', ',')} à vista`
  const parcel = total / installments
  return `${installments}x R$ ${parcel.toFixed(2).replace('.', ',')} sem juros*`
}

// ── Checkout session request ──────────────────────────────────
export interface CheckoutRequest {
  eventId: string
  ticketTypeId: string
  quantity: number
  installments: number   // 0 = PIX, 1-12 = card
  buyerEmail?: string
  successUrl: string
  cancelUrl: string
}

export interface CheckoutResponse {
  sessionId?: string
  url?: string
  error?: string
}

export async function createCheckoutSession(
  req: CheckoutRequest,
  supabaseUrl: string,
  anonKey: string,
): Promise<CheckoutResponse> {
  const res = await fetch(`${supabaseUrl}/functions/v1/stripe-checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${anonKey}`,
    },
    body: JSON.stringify(req),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Erro desconhecido' }))
    return { error: err.error ?? 'Erro ao criar sessão de pagamento' }
  }

  return res.json()
}
