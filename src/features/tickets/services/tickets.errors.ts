export class TicketsServiceError extends Error {
  code: string

  constructor(message: string, code = 'tickets_service_error') {
    super(message)
    this.name = 'TicketsServiceError'
    this.code = code
  }
}

export function assertTicketsResult(result: { error: { message: string } | null }) {
  if (result.error) {
    throw new TicketsServiceError(result.error.message)
  }
}
