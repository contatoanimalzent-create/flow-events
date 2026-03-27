/**
 * Phone Validator
 * Validates Brazilian and international phone numbers
 */

export function validatePhone(phone: string): boolean {
  if (!phone) return false

  const cleanPhone = phone.replace(/\D/g, '')

  // Brazilian phone: 11 digits (2 area code + 9 digits)
  if (cleanPhone.startsWith('55')) {
    return cleanPhone.length === 13
  }

  // Brazilian phone without country code: 10-11 digits
  if (cleanPhone.length >= 10 && cleanPhone.length <= 11) {
    return true
  }

  // International: at least 7 digits (minimum for most countries)
  return cleanPhone.length >= 7
}

export function formatPhoneBR(phone: string): string {
  const clean = phone.replace(/\D/g, '')

  // Remove country code if present
  let number = clean
  if (number.startsWith('55')) {
    number = number.slice(2)
  }

  if (number.length === 10) {
    // Fixed line: (00) 0000-0000
    return `(${number.slice(0, 2)}) ${number.slice(2, 6)}-${number.slice(6)}`
  }

  if (number.length === 11) {
    // Mobile: (00) 00000-0000
    return `(${number.slice(0, 2)}) ${number.slice(2, 7)}-${number.slice(7)}`
  }

  return clean
}

export function formatPhoneInternational(phone: string): string {
  const clean = phone.replace(/\D/g, '')

  if (clean.startsWith('55')) {
    // Brazilian with country code
    return `+55 ${formatPhoneBR(clean).replace(/[()]/g, '').trim()}`
  }

  // Generic international format: +00 000 000 0000
  if (clean.length > 3) {
    return `+${clean.slice(0, 2)} ${clean.slice(2, 5)} ${clean.slice(5)}`
  }

  return clean
}

export function unformatPhone(phone: string): string {
  return phone.replace(/\D/g, '')
}
