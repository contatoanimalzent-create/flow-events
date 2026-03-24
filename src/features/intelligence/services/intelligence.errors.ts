export class IntelligenceServiceError extends Error {
  code: string

  constructor(message: string, code = 'intelligence_service_error') {
    super(message)
    this.name = 'IntelligenceServiceError'
    this.code = code
  }
}

export function assertIntelligenceResult<T extends { error: { message?: string } | null }>(result: T) {
  if (result.error) {
    throw new IntelligenceServiceError(result.error.message ?? 'Nao foi possivel carregar intelligence.', 'intelligence_query_failed')
  }
}
