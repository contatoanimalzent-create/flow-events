export interface BlockedOperationalScan {
  valid: false
  reason: 'offline' | 'missing_event'
  message: string
}

/** Never turns a queued observation into an access authorization. */
export async function validateOperationalScan<T extends { valid: boolean }>(
  input: { isOnline: boolean; eventId: string | null | undefined },
  validate: (eventId: string) => Promise<T>,
): Promise<T | BlockedOperationalScan> {
  if (!input.eventId?.trim()) {
    return { valid: false, reason: 'missing_event', message: 'Selecione um evento antes de validar o ingresso.' }
  }
  if (!input.isOnline) {
    return { valid: false, reason: 'offline', message: 'Sem conexão. Entrada não validada. Reconecte ou chame o supervisor.' }
  }
  return validate(input.eventId)
}
