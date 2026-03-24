export class CrmServiceError extends Error {
  code: string

  constructor(message: string, code = 'crm_service_error') {
    super(message)
    this.name = 'CrmServiceError'
    this.code = code
  }
}

export function assertCrmResult(result: { error: { message: string } | null }) {
  if (result.error) {
    throw new CrmServiceError(result.error.message)
  }
}
