import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth'
import { auditService } from '@/features/audit'
import { checkinKeys } from '@/features/checkin/services'
import { staffKeys, staffMutations } from '@/features/staff/services'
import type { StaffStatus } from '@/features/staff/types'

export function useStaffActions(eventId?: string) {
  const queryClient = useQueryClient()
  const organizationId = useAuthStore((state) => state.organization?.id)
  const profile = useAuthStore((state) => state.profile)

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
    updateStatus: async (staffId: string, status: StaffStatus) => {
      const result = await updateStatusMutation.mutateAsync({ staffId, status })
      if (organizationId) {
        await auditService.record({
          organization_id: organizationId,
          user_id: profile?.id ?? null,
          user_name: `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || null,
          event_id: eventId ?? null,
          entity_type: 'staff',
          entity_id: staffId,
          action_type: 'status_change',
          title: 'Status de staff alterado',
          description: `Novo status: ${status}`,
        })
      }
      return result
    },
    issueCredential: async (staffId: string) => {
      const result = await issueCredentialMutation.mutateAsync({ staffId })
      if (organizationId) {
        await auditService.record({
          organization_id: organizationId,
          user_id: profile?.id ?? null,
          user_name: `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || null,
          event_id: eventId ?? null,
          entity_type: 'staff',
          entity_id: staffId,
          action_type: 'issue',
          title: 'Credencial emitida',
        })
      }
      return result
    },
    deleteStaff: async (staffId: string) => {
      const result = await deleteMutation.mutateAsync({ staffId })
      if (organizationId) {
        await auditService.record({
          organization_id: organizationId,
          user_id: profile?.id ?? null,
          user_name: `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || null,
          event_id: eventId ?? null,
          entity_type: 'staff',
          entity_id: staffId,
          action_type: 'delete',
          title: 'Membro de staff removido',
        })
      }
      return result
    },
    recordPresence: async (staffId: string, type: 'clock_in' | 'clock_out', gateId?: string | null) => {
      const result = await recordPresenceMutation.mutateAsync({
        staffId,
        eventId: eventId as string,
        type,
        gateId: gateId ?? null,
        deviceId: typeof navigator !== 'undefined' ? navigator.userAgent : 'web-console',
      })
      if (organizationId) {
        await auditService.record({
          organization_id: organizationId,
          user_id: profile?.id ?? null,
          user_name: `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || null,
          event_id: eventId ?? null,
          entity_type: 'staff',
          entity_id: staffId,
          action_type: 'status_change',
          title: type === 'clock_in' ? 'Entrada registrada' : 'Saída registrada',
          description: gateId ? `Gate ${gateId}` : null,
        })
      }
      return result
    },
    updatingStatus: updateStatusMutation.isPending,
    issuingCredential: issueCredentialMutation.isPending,
    deleting: deleteMutation.isPending,
    recordingPresence: recordPresenceMutation.isPending,
  }
}
