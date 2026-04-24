import { useMemo } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { calculateFeeBreakdown } from '@/features/billing/services/billing.calculations'
import { ticketKeys } from '@/features/tickets/services/tickets.queries'
import { paymentKeys, paymentMutations } from '@/features/payments/services'
import { orderKeys, orderMutations } from '@/features/orders/services'
import { buildDefaultOrderExpiration, buildOrderDraftTotals } from '@/features/orders/services'
import { useCheckoutStore } from './useCheckoutStore'
import type { CheckoutCartItem, CreateOrderDraftInput, OrderPaymentMethod } from '@/features/orders/types'

interface UseCheckoutFlowParams {
  eventId: string
  organizationId: string
  cartItems: CheckoutCartItem[]
  sourceChannel?: string
  metadata?: Record<string, unknown>
  feeConfig?: {
    fee_type?: 'fixed' | 'percentage' | null
    fee_value?: number | null
    absorb_fee?: boolean | null
  }
  onInventoryChanged?: () => Promise<void> | void
}

function mapCartItemsToDraftItems(cartItems: CheckoutCartItem[]): CreateOrderDraftInput['items'] {
  return cartItems.map((item) => ({
    ticket_type_id: item.ticket_type_id,
    batch_id: item.batch_id,
    unit_price: item.price,
    quantity: item.quantity,
    total_price: item.price * item.quantity,
  }))
}

export function useCheckoutFlow({
  eventId,
  organizationId,
  cartItems,
  sourceChannel,
  metadata,
  feeConfig,
  onInventoryChanged,
}: UseCheckoutFlowParams) {
  const queryClient = useQueryClient()
  const {
    buyer,
    paymentMethod,
    draftOrderId,
    draftStatus,
    expiresAt,
    paymentId,
    paymentIntentId,
    paymentClientSecret,
    paymentStatus,
    setPaymentMethod,
    syncDraft,
    syncPaymentIntent,
    markPaymentStatus,
    markDraftStatus,
    clearDraft,
    clearPayment,
  } = useCheckoutStore()

  const cartSummary = useMemo(() => {
    const items = mapCartItemsToDraftItems(cartItems)
    const feeBreakdown = calculateFeeBreakdown({
      subtotal: items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0),
      quantity: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      feeType: feeConfig?.fee_type ?? 'percentage',
      feeValue: feeConfig?.fee_value ?? 0,
      absorbFee: feeConfig?.absorb_fee ?? false,
    })
    const totals = buildOrderDraftTotals({
      organization_id: organizationId,
      event_id: eventId,
      buyer: {
        name: buyer.name,
        email: buyer.email,
        cpf: buyer.cpf,
        phone: buyer.phone,
      },
      items,
      fee_amount: feeBreakdown.platformFeeAmount,
      platform_fee_amount: feeBreakdown.platformFeeAmount,
      customer_fee_amount: feeBreakdown.customerFeeAmount,
      absorbed_fee_amount: feeBreakdown.absorbedFeeAmount,
      fee_type: feeBreakdown.feeType,
      fee_value: feeBreakdown.feeValue,
      absorb_fee: feeBreakdown.absorbFee,
      payment_method: paymentMethod,
    })

    return {
      items,
      subtotal: totals.subtotal,
      discount_amount: totals.discountAmount,
      fee_amount: totals.feeAmount,
      platform_fee_amount: totals.platformFeeAmount,
      customer_fee_amount: totals.customerFeeAmount,
      absorbed_fee_amount: totals.absorbedFeeAmount,
      fee_type: totals.feeType,
      fee_value: totals.feeValue,
      absorb_fee: totals.absorbFee,
      total_amount: totals.totalAmount,
      quantity: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    }
  }, [buyer.cpf, buyer.email, buyer.name, buyer.phone, cartItems, eventId, feeConfig?.absorb_fee, feeConfig?.fee_type, feeConfig?.fee_value, organizationId, paymentMethod])

  async function invalidateOrderAndInventory(orderId?: string) {
    const tasks: Promise<unknown>[] = [
      queryClient.invalidateQueries({ queryKey: ticketKeys.byEvent(eventId) }),
      queryClient.invalidateQueries({ queryKey: orderKeys.byEvent(eventId) }),
    ]

    if (orderId) {
      tasks.push(queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) }))
      tasks.push(queryClient.invalidateQueries({ queryKey: [...orderKeys.detail(orderId), 'bundle'] as const }))
      tasks.push(queryClient.invalidateQueries({ queryKey: orderKeys.items(orderId) }))
      tasks.push(queryClient.invalidateQueries({ queryKey: orderKeys.digitalTickets(orderId) }))
      tasks.push(queryClient.invalidateQueries({ queryKey: paymentKeys.byOrder(orderId) }))
      tasks.push(queryClient.invalidateQueries({ queryKey: paymentKeys.messages(orderId) }))
    }

    await Promise.all(tasks)
    await onInventoryChanged?.()
  }

  const expireStaleDraftsMutation = useMutation({
    ...orderMutations.expireStaleDrafts(),
    onSuccess: async () => {
      await invalidateOrderAndInventory()
    },
  })

  const createDraftMutation = useMutation({
    ...orderMutations.createDraft(),
    onSuccess: async (order) => {
      syncDraft(order)
      await invalidateOrderAndInventory(order.id)
    },
  })

  const createPaymentIntentMutation = useMutation({
    ...paymentMutations.createIntent(),
    onSuccess: async (paymentIntent) => {
      syncPaymentIntent(paymentIntent)
      await invalidateOrderAndInventory(paymentIntent.orderId)
    },
  })

  const confirmOrderMutation = useMutation({
    ...orderMutations.confirm(),
    onSuccess: async (order) => {
      if (order) {
        syncDraft(order)
        markDraftStatus('confirmed')
        markPaymentStatus('paid')
        await invalidateOrderAndInventory(order.id)
      }
    },
  })

  const cancelOrderMutation = useMutation({
    ...orderMutations.cancel(),
    onSuccess: async (order, variables) => {
      clearDraft()
      markDraftStatus('cancelled')
      await invalidateOrderAndInventory(order?.id ?? variables.orderId)
    },
  })

  const expireOrderMutation = useMutation({
    ...orderMutations.expire(),
    onSuccess: async (order, variables) => {
      clearDraft()
      markDraftStatus('expired')
      await invalidateOrderAndInventory(order?.id ?? variables.orderId)
    },
  })

  const issueDigitalTicketsMutation = useMutation({
    ...orderMutations.issueDigitalTickets(),
    onSuccess: async (_, variables) => {
      await invalidateOrderAndInventory(variables.orderId)
    },
  })

  async function sweepExpiredDrafts() {
    await expireStaleDraftsMutation.mutateAsync({ eventId })
  }

  async function createDraft(selectedPaymentMethod?: OrderPaymentMethod | null) {
    await sweepExpiredDrafts()
    clearPayment()

    const draft = await createDraftMutation.mutateAsync({
      organization_id: organizationId,
      event_id: eventId,
      buyer: {
        name: buyer.name,
        email: buyer.email,
        cpf: buyer.cpf ? buyer.cpf.replace(/\D/g, '') || undefined : undefined,
        phone: buyer.phone || undefined,
      },
      items: cartSummary.items,
      fee_amount: cartSummary.platform_fee_amount,
      platform_fee_amount: cartSummary.platform_fee_amount,
      customer_fee_amount: cartSummary.customer_fee_amount,
      absorbed_fee_amount: cartSummary.absorbed_fee_amount,
      fee_type: cartSummary.fee_type,
      fee_value: cartSummary.fee_value,
      absorb_fee: cartSummary.absorb_fee,
      payment_method: selectedPaymentMethod ?? paymentMethod ?? (cartSummary.total_amount === 0 ? 'free' : 'pix'),
      source_channel: sourceChannel ?? 'public_event_page',
      expires_at: buildDefaultOrderExpiration(),
      metadata,
    })

    if (selectedPaymentMethod) {
      setPaymentMethod(selectedPaymentMethod)
    }

    return draft
  }

  async function beginPayment(selectedPaymentMethod?: OrderPaymentMethod | null) {
    const currentOrderId = draftOrderId

    if (!currentOrderId) {
      throw new Error('Nenhum pedido em rascunho disponível para pagamento.')
    }

    const result = await createPaymentIntentMutation.mutateAsync({
      orderId: currentOrderId,
      paymentMethod: selectedPaymentMethod ?? paymentMethod ?? 'pix',
      buyerEmail: buyer.email,
      buyerName: buyer.name,
    })

    if (selectedPaymentMethod) {
      setPaymentMethod(selectedPaymentMethod)
    }

    return result
  }

  async function confirmDraft(selectedPaymentMethod?: OrderPaymentMethod | null) {
    const currentOrderId = draftOrderId

    if (!currentOrderId) {
      throw new Error('Nenhum pedido em rascunho disponível para confirmação.')
    }

    const order = await confirmOrderMutation.mutateAsync({
      orderId: currentOrderId,
      paymentMethod: selectedPaymentMethod ?? paymentMethod ?? (cartSummary.total_amount === 0 ? 'free' : 'pix'),
    })

    await issueDigitalTicketsMutation.mutateAsync({ orderId: currentOrderId })
    return order
  }

  async function cancelDraft() {
    if (!draftOrderId) {
      return
    }

    await cancelOrderMutation.mutateAsync({ orderId: draftOrderId })
  }

  async function expireDraft() {
    if (!draftOrderId) {
      return
    }

    await expireOrderMutation.mutateAsync({ orderId: draftOrderId })
  }

  function isDraftExpired(referenceTime = Date.now()) {
    if (!expiresAt) {
      return false
    }

    return new Date(expiresAt).getTime() <= referenceTime
  }

  return {
    buyer,
    paymentMethod,
    draftOrderId,
    draftStatus,
    expiresAt,
    paymentId,
    paymentIntentId,
    paymentClientSecret,
    paymentStatus,
    cartSummary,
    createDraft,
    beginPayment,
    confirmDraft,
    cancelDraft,
    expireDraft,
    sweepExpiredDrafts,
    setPaymentMethod,
    clearPaymentState: clearPayment,
    markPaymentStatus,
    isDraftExpired,
    creatingDraft: createDraftMutation.isPending,
    startingPayment: createPaymentIntentMutation.isPending,
    confirmingDraft: confirmOrderMutation.isPending,
    cancellingDraft: cancelOrderMutation.isPending,
    expiringDraft: expireOrderMutation.isPending,
    issuingDigitalTickets: issueDigitalTicketsMutation.isPending,
    expiringStaleDrafts: expireStaleDraftsMutation.isPending,
  }
}
