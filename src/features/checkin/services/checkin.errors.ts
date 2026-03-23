export class CheckinServiceError extends Error {
  code: string

  constructor(message: string, code = 'checkin_service_error') {
    super(message)
    this.name = 'CheckinServiceError'
    this.code = code
  }
}

export function assertCheckinResult(result: { error: { message: string } | null }) {
  if (result.error) {
    throw new CheckinServiceError(result.error.message)
  }
}
