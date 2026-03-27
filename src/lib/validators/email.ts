/**
 * Email Validator
 */

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEmail(email: string): boolean {
  if (!email) return false
  return emailRegex.test(email)
}
