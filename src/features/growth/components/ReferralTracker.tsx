import { useEffect } from 'react'
import { storeReferralCode } from '@/features/growth/services/growth.storage'

interface ReferralTrackerProps {
  eventId: string
}

export function ReferralTracker({ eventId }: ReferralTrackerProps) {
  useEffect(() => {
    const url = new URL(window.location.href)
    const referralCode = url.searchParams.get('ref')

    if (!referralCode) {
      return
    }

    storeReferralCode(eventId, referralCode)
    url.searchParams.delete('ref')
    window.history.replaceState({}, document.title, url.toString())
  }, [eventId])

  return null
}
