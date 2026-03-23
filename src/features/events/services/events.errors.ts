export class EventsServiceError extends Error {
  code: string

  constructor(message: string, code = 'events_service_error') {
    super(message)
    this.name = 'EventsServiceError'
    this.code = code
  }
}

export function assertEventsResult(result: { error: { message: string } | null }) {
  if (result.error) {
    throw new EventsServiceError(result.error.message)
  }
}
