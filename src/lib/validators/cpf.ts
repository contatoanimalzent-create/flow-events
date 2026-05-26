/**
 * CPF Validator
 * Validates Brazilian CPF numbers
 */

export function validateCPF(cpf: string): boolean {
  if (!cpf) return false

  const cleanCPF = cpf.replace(/\D/g, '')

  if (cleanCPF.length !== 11) return false

  // Reject known invalid CPFs
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false

  // Validate first check digit
  let sum = 0
  let multiplier = 10

  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF[i]) * multiplier
    multiplier--
  }

  let remainder = sum % 11
  const firstDigit = remainder < 2 ? 0 : 11 - remainder

  if (parseInt(cleanCPF[9]) !== firstDigit) return false

  // Validate second check digit
  sum = 0
  multiplier = 11

  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF[i]) * multiplier
    multiplier--
  }

  remainder = sum % 11
  const secondDigit = remainder < 2 ? 0 : 11 - remainder

  if (parseInt(cleanCPF[10]) !== secondDigit) return false

  return true
}

export function formatCPF(cpf: string): string {
  const clean = cpf.replace(/\D/g, '')
  if (clean.length <= 3) return clean
  if (clean.length <= 6) return `${clean.slice(0, 3)}.${clean.slice(3)}`
  if (clean.length <= 9) return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6)}`
  return `${clean.slice(0, 3)}.${clean.slice(3, 6)}.${clean.slice(6, 9)}-${clean.slice(9, 11)}`
}

export function unformatCPF(cpf: string): string {
  return cpf.replace(/\D/g, '')
}

export function normalizeCPF(cpf?: string | null): string | null {
  const clean = (cpf ?? '').replace(/\D/g, '')
  return clean || null
}

export function normalizeCPFForStorage(cpf?: string | null): string | null {
  const clean = normalizeCPF(cpf)
  return clean ? formatCPF(clean) : null
}
