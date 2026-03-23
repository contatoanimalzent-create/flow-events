import { useMutation, useQueryClient } from '@tanstack/react-query'
import { checkinKeys } from '@/features/checkin/services'
import { staffKeys, staffMutations } from '@/features/staff/services'
import type { StaffStatus } from '@/features/staff/types'

export function useStaffActions(eventId?: string) {
  const queryClient = useQueryClient()

  async function invalidateEventState(staffId?: string) {
    if (!eventId) {
      return
    }

    const tasks = [
      queryClient.invalidateQueries({ queryKey: staffKeys.byEvent(eventId, 'all') }),
      queryClient.invalidateQueries({ queryKey: staffKeys.byEvent(eventId, 'invited') }),
      queryClient.invalidateQueries({ queryKey: staffKeys.byEvent(eventId, 'confirmed') }),
      queryClient.invalidateQueries({ queryKey: staffKeys.byEvent(eventId, 'active') }),
      queryClient.invalidateQueries({ queryKey: staffKeys.byEvent(eventId, 'no_show') }),
      queryClient.invalidateQueries({ queryKey: staffKeys.byEvent(eventId, 'cancelled') }),
      queryClient.invalidateQueries({ queryKey: staffKeys.summary(eventId) }),
      queryClient.invalidateQueries({ queryKey: staffKeys.gateOptions(eventId) }),
      queryClient.invalidateQueries({ queryKey: checkinKeys.commandCenter(eventId) }),
      queryClient.invalidateQueries({ queryKey: checkinKeys.gates(eventId) }),
    ]

    if (staffId) {
      tasks.push(queryClient.invalidateQueries({ queryKey: staffKeys.detail(staffId) }))
      tasks.push(queryClient.invalidateQueries({ queryKey: staffKeys.timeEntries(staffId, eventId) }))
    }

    await Promise.all(tasks)
  }

  const updateStatusMutation = useMutation({
    ...staffMutations.updateStatus(),
    onSuccess: async (staff) => {
      await invalidateEventState(staff?.id)
    },
  })

  const issueCredentialMutation = useMutation({
    ...staffMutations.issueCredential(),
    onSuccess: async (staff) => {
      await invalidateEventState(staff?.id)
    },
  })

  const deleteMutation = useMutation({
    ...staffMutations.remove(),
    onSuccess: async () => {
      await invalidateEventState()
    },
  })

  const recordPresenceMutation = useMutation({
    ...staffMutations.recordPresence(),
    onSuccess: async (_, variables) => {
      await invalidateEventState(variables.staffId)
    },
  })

  return {
    updateStatus: async (staffId: string, status: StaffStatus) => updateStatusMutation.mutateAsync({ staffId, status }),
    issueCredential: async (staffId: string) => issueCredentialMutation.mutateAsync({ staffId }),
    deleteStaff: async (staffId: string) => deleteMutation.mutateAsync({ staffId }),
    recordPresence: async (staffId: string, type: 'clock_in' | 'clock_out', gateId?: string | null) =>
      recordPresenceMutation.mutateAsync({
        staffId,
        eventId: eventId as string,
        type,
        gateId: gateId ?? null,
        deviceId: typeof navigator !== 'undefined' ? navigator.userAgent : 'web-console',
      }),
    updatingStatus: updateStatusMutation.isPending,
    issuingCredential: issueCredentialMutation.isPending,
    deleting: deleteMutation.isPending,
    recordingPresence: recordPresenceMutation.isPending,
  }
}
