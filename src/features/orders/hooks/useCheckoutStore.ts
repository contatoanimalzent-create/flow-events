import { create } from 'zustand'
import { DEFAULT_CHECKOUT_BUYER } from '@/features/orders/types'
import type { CheckoutBuyerForm, CheckoutDraftStatus, OrderPaymentMethod, OrderRow } from '@/features/orders/types'

interface CheckoutStoreState {
  buyer: CheckoutBuyerForm
  paymentMethod: OrderPaymentMethod | null
  draftOrderId: string | null
  draftStatus: CheckoutDraftStatus
  expiresAt: string | null
  setBuyerField: <TKey extends keyof CheckoutBuyerForm>(field: TKey, value: CheckoutBuyerForm[TKey]) => void
  setBuyer: (buyer: Partial<CheckoutBuyerForm>) => void
  setPaymentMethod: (method: OrderPaymentMethod | null) => void
  syncDraft: (order: OrderRow) => void
  markDraftStatus: (status: CheckoutDraftStatus) => void
  clearDraft: () => void
  resetCheckout: () => void
}

export const useCheckoutStore = create<CheckoutStoreState>((set) => ({
  buyer: { ...DEFAULT_CHECKOUT_BUYER },
  paymentMethod: null,
  draftOrderId: null,
  draftStatus: 'idle',
  expiresAt: null,
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
    }),
  markDraftStatus: (status) => set({ draftStatus: status }),
  clearDraft: () => set({ draftOrderId: null, draftStatus: 'idle', expiresAt: null }),
  resetCheckout: () =>
    set({
      buyer: { ...DEFAULT_CHECKOUT_BUYER },
      paymentMethod: null,
      draftOrderId: null,
      draftStatus: 'idle',
      expiresAt: null,
    }),
}))
