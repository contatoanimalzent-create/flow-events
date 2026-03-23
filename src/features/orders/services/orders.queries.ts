import { mutationOptions, queryOptions } from '@tanstack/react-query'
import type { CreateOrderDraftInput, OrderPaymentMethod } from '@/features/orders/types'
import { ordersService } from './orders.service'

interface ConfirmOrderVariables {
  orderId: string
  paymentMethod?: OrderPaymentMethod | null
}

interface CancelOrderVariables {
  orderId: string
}

interface AddOrderItemsVariables {
  orderId: string
  items: CreateOrderDraftInput['items']
}

interface IssueDigitalTicketsVariables {
  orderId: string
}

export const orderKeys = {
  all: ['orders'] as const,
  events: (organizationId: string) => [...orderKeys.all, 'events', organizationId] as const,
  byEvent: (eventId: string) => ['events', eventId, 'orders'] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (orderId: string) => [...orderKeys.details(), orderId] as const,
  items: (orderId: string) => [...orderKeys.detail(orderId), 'items'] as const,
  digitalTickets: (orderId: string) => [...orderKeys.detail(orderId), 'digital-tickets'] as const,
  digitalTicketDetail: (digitalTicketId: string) => [...orderKeys.all, 'digital-ticket', digitalTicketId] as const,
  actions: () => [...orderKeys.all, 'actions'] as const,
}

export const orderQueries = {
  events: (organizationId: string) =>
    queryOptions({
      queryKey: orderKeys.events(organizationId),
      queryFn: () => ordersService.listOrderEvents(organizationId),
    }),
  listByEvent: (eventId: string) =>
    queryOptions({
      queryKey: orderKeys.byEvent(eventId),
      queryFn: () => ordersService.listOrdersByEvent(eventId),
    }),
  detail: (orderId: string) =>
    queryOptions({
      queryKey: orderKeys.detail(orderId),
      queryFn: () => ordersService.getOrderById(orderId),
    }),
  items: (orderId: string) =>
    queryOptions({
      queryKey: orderKeys.items(orderId),
      queryFn: () => ordersService.listOrderItemsByOrder(orderId),
    }),
  digitalTickets: (orderId: string) =>
    queryOptions({
      queryKey: orderKeys.digitalTickets(orderId),
      queryFn: () => ordersService.listDigitalTicketsByOrder(orderId),
    }),
  digitalTicketDetail: (digitalTicketId: string) =>
    queryOptions({
      queryKey: orderKeys.digitalTicketDetail(digitalTicketId),
      queryFn: () => ordersService.getDigitalTicketById(digitalTicketId),
    }),
  detailBundle: (orderId: string) =>
    queryOptions({
      queryKey: [...orderKeys.detail(orderId), 'bundle'] as const,
      queryFn: () => ordersService.getOrderDetailBundle(orderId),
    }),
}

export const orderMutations = {
  createDraft: () =>
    mutationOptions({
      mutationKey: [...orderKeys.actions(), 'create-draft'] as const,
      mutationFn: (input: CreateOrderDraftInput) => ordersService.createOrderDraft(input),
    }),
  addItems: () =>
    mutationOptions({
      mutationKey: [...orderKeys.actions(), 'add-items'] as const,
      mutationFn: ({ orderId, items }: AddOrderItemsVariables) => ordersService.addOrderItems(orderId, items),
    }),
  confirm: () =>
    mutationOptions({
      mutationKey: [...orderKeys.actions(), 'confirm'] as const,
      mutationFn: ({ orderId, paymentMethod }: ConfirmOrderVariables) => ordersService.confirmOrder(orderId, paymentMethod),
    }),
  cancel: () =>
    mutationOptions({
      mutationKey: [...orderKeys.actions(), 'cancel'] as const,
      mutationFn: ({ orderId }: CancelOrderVariables) => ordersService.cancelOrder(orderId),
    }),
  issueDigitalTickets: () =>
    mutationOptions({
      mutationKey: [...orderKeys.actions(), 'issue-digital-tickets'] as const,
      mutationFn: ({ orderId }: IssueDigitalTicketsVariables) => ordersService.issueDigitalTicketsForOrder(orderId),
    }),
}
