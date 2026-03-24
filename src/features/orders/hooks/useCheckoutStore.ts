import { create } from 'zustand'
import type { PaymentIntentResult, PaymentStatus } from '@/features/payments/types'
import { DEFAULT_CHECKOUT_BUYER } from '@/features/orders/types'
import type { CheckoutBuyerForm, CheckoutDraftStatus, OrderPaymentMethod, OrderRow } from '@/features/orders/types'

interface CheckoutStoreState {
  buyer: CheckoutBuyerForm
  paymentMethod: OrderPaymentMethod | null
  draftOrderId: string | null
  draftStatus: CheckoutDraftStatus
  expiresAt: string | null
  paymentId: string | null
  paymentIntentId: string | null
  paymentClientSecret: string | null
  paymentStatus: PaymentStatus | null
  setBuyerField: <TKey extends keyof CheckoutBuyerForm>(field: TKey, value: CheckoutBuyerForm[TKey]) => void
  setBuyer: (buyer: Partial<CheckoutBuyerForm>) => void
  setPaymentMethod: (method: OrderPaymentMethod | null) => void
  syncDraft: (order: OrderRow) => void
  syncPaymentIntent: (paymentIntent: PaymentIntentResult) => void
  markPaymentStatus: (status: PaymentStatus | null) => void
  markDraftStatus: (status: CheckoutDraftStatus) => void
  clearPayment: () => void
  clearDraft: () => void
  resetCheckout: () => void
}

export const useCheckoutStore = create<CheckoutStoreState>((set) => ({
  buyer: { ...DEFAULT_CHECKOUT_BUYER },
  paymentMethod: null,
  draftOrderId: null,
  draftStatus: 'idle',
  expiresAt: null,
  paymentId: null,
  paymentIntentId: null,
  paymentClientSecret: null,
  paymentStatus: null,
  setBuyerField: (field, value) =>
    set((state) => ({
      buyer: {
        ...state.buyer,
        [field]: value,
      },
    })),
  setBuyer: (buyer) =>
    set((state) => ({
      buyer: {
        ...state.buyer,
        ...buyer,
      },
    })),
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  syncDraft: (order) =>
    set({
      draftOrderId: order.id,
      draftStatus: order.status === 'paid' ? 'confirmed' : 'draft_created',
      expiresAt: order.expires_at ?? null,
      paymentMethod: order.payment_method ?? null,
      paymentStatus: order.status === 'paid' ? 'paid' : null,
    }),
  syncPaymentIntent: (paymentIntent) =>
    set({
      paymentId: paymentIntent.paymentId ?? null,
      paymentIntentId: paymentIntent.paymentIntentId ?? null,
      paymentClientSecret: paymentIntent.clientSecret,
      paymentStatus: 'pending',
    }),
  markPaymentStatus: (status) => set({ paymentStatus: status }),
  markDraftStatus: (status) => set({ draftStatus: status }),
  clearPayment: () =>
    set({
      paymentId: null,
      paymentIntentId: null,
      paymentClientSecret: null,
      paymentStatus: null,
    }),
  clearDraft: () =>
    set({
      draftOrderId: null,
      draftStatus: 'idle',
      expiresAt: null,
      paymentId: null,
      paymentIntentId: null,
      paymentClientSecret: null,
      paymentStatus: null,
    }),
  resetCheckout: () =>
    set({
      buyer: { ...DEFAULT_CHECKOUT_BUYER },
      paymentMethod: null,
      draftOrderId: null,
      draftStatus: 'idle',
      expiresAt: null,
      paymentId: null,
      paymentIntentId: null,
      paymentClientSecret: null,
      paymentStatus: null,
    }),
}))
