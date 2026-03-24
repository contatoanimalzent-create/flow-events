export class FinancialServiceError extends Error {
  code: string

  constructor(message: string, code = 'financial_service_error') {
    super(message)
    this.name = 'FinancialServiceError'
    this.code = code
  }
}

export function assertFinancialResult(result: { error: { message: string } | null }) {
  if (result.error) {
    throw new FinancialServiceError(result.error.message)
  }
}
