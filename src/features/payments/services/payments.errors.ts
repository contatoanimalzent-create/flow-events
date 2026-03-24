export class PaymentServiceError extends Error {
  code: string

  constructor(message: string, code = 'payment_service_error') {
    super(message)
    this.name = 'PaymentServiceError'
    this.code = code
  }
}

export function assertPaymentsResult(result: { error: { message: string } | null }) {
  if (result.error) {
    throw new PaymentServiceError(result.error.message)
  }
}
