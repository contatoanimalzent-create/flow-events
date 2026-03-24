export class CampaignsServiceError extends Error {
  code: string

  constructor(message: string, code = 'campaigns_service_error') {
    super(message)
    this.name = 'CampaignsServiceError'
    this.code = code
  }
}

export function assertCampaignsResult(result: { error: { message: string } | null }) {
  if (result.error) {
    throw new CampaignsServiceError(result.error.message)
  }
}
