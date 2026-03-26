const REFERRAL_STORAGE_PREFIX = 'animalz:referral'
const LEAD_CAPTURE_DISMISS_KEY = 'animalz:growth:lead-dismissed'

function isBrowser() {
  return typeof window !== 'undefined'
}

export function readStoredReferralCode(eventId: string) {
  if (!isBrowser()) {
    return null
  }

  return window.localStorage.getItem(`${REFERRAL_STORAGE_PREFIX}:${eventId}`)
}

export function storeReferralCode(eventId: string, code: string) {
  if (!isBrowser()) {
    return
  }

  window.localStorage.setItem(`${REFERRAL_STORAGE_PREFIX}:${eventId}`, code)
}

export function clearReferralCode(eventId: string) {
  if (!isBrowser()) {
    return
  }

  window.localStorage.removeItem(`${REFERRAL_STORAGE_PREFIX}:${eventId}`)
}

export function wasLeadCaptureDismissed() {
  if (!isBrowser()) {
    return false
  }

  return window.sessionStorage.getItem(LEAD_CAPTURE_DISMISS_KEY) === '1'
}

export function dismissLeadCapture() {
  if (!isBrowser()) {
    return
  }

  window.sessionStorage.setItem(LEAD_CAPTURE_DISMISS_KEY, '1')
}
