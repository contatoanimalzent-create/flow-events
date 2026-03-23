export class OrdersServiceError extends Error {
  code: string

  constructor(message: string, code = 'orders_service_error') {
    super(message)
    this.name = 'OrdersServiceError'
    this.code = code
  }
}

export function assertOrdersResult(result: { error: { message: string } | null }) {
  if (result.error) {
    throw new OrdersServiceError(result.error.message)
  }
}
