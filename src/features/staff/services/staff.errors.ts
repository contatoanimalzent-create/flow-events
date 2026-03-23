export class StaffServiceError extends Error {
  code: string

  constructor(message: string, code = 'staff_service_error') {
    super(message)
    this.name = 'StaffServiceError'
    this.code = code
  }
}

export function assertStaffResult(result: { error: { message: string } | null }) {
  if (result.error) {
    throw new StaffServiceError(result.error.message)
  }
}
