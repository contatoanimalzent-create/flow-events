import { useEffect, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { checkinKeys, checkinMutations } from '@/features/checkin/services'
import type { CheckinSubmissionResult } from '@/features/checkin/types'

interface UseCheckinScannerParams {
  eventId?: string
  gateId?: string | null
  operatorId?: string | null
  deviceId?: string | null
}

export function useCheckinScanner({ eventId, gateId, operatorId, deviceId }: UseCheckinScannerParams) {
  const queryClient = useQueryClient()
  const [scanInput, setScanInput] = useState('')
  const [scanResult, setScanResult] = useState<CheckinSubmissionResult | null>(null)
  const clearTimerRef = useRef<number | null>(null)
  const normalizedGateId = gateId && gateId !== 'all' ? gateId : null

  useEffect(() => {
    return () => {
      if (clearTimerRef.current) {
        window.clearTimeout(clearTimerRef.current)
      }
    }
  }, [])

  const processScanMutation = useMutation({
    ...checkinMutations.process(),
    onSuccess: async (result) => {
      if (!eventId) {
        return
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: checkinKeys.recent(eventId, null) }),
        queryClient.invalidateQueries({ queryKey: checkinKeys.recent(eventId, normalizedGateId) }),
        queryClient.invalidateQueries({ queryKey: checkinKeys.stats(eventId) }),
      ])

      if (result.digital_ticket?.id) {
        await queryClient.invalidateQueries({ queryKey: checkinKeys.history(result.digital_ticket.id) })
      }
    },
  })

  async function handleScan(token: string, isExit = false) {
    if (!eventId || !token.trim() || processScanMutation.isPending) {
      return
    }

    const result = await processScanMutation.mutateAsync({
      eventId,
      qrToken: token.trim(),
      gateId: normalizedGateId,
      operatorId: operatorId ?? null,
      deviceId: deviceId ?? null,
      isExit,
    })

    setScanResult(result)
    setScanInput('')

    if (clearTimerRef.current) {
      window.clearTimeout(clearTimerRef.current)
    }

    clearTimerRef.current = window.setTimeout(() => setScanResult(null), 4000)
  }

  return {
    scanInput,
    setScanInput,
    scanResult,
    clearScanResult: () => setScanResult(null),
    handleScan,
    processing: processScanMutation.isPending,
  }
}
