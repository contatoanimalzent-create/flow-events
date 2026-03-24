import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth'
import { auditService } from '@/features/audit'
import { EMPTY_STAFF_FORM } from '@/features/staff/types'
import { mapStaffToForm, staffKeys, staffMutations, staffQueries } from '@/features/staff/services'
import type { StaffFormData } from '@/features/staff/types'

interface UseStaffFormParams {
  eventId: string
  organizationId: string
  staffId: string | null
  onSaved: () => void
}

export function useStaffForm({ eventId, organizationId, staffId, onSaved }: UseStaffFormParams) {
  const queryClient = useQueryClient()
  const profile = useAuthStore((state) => state.profile)
  const [form, setForm] = useState<StaffFormData>(EMPTY_STAFF_FORM)

  const staffDetailQuery = useQuery({
    ...(staffId ? staffQueries.detail(staffId) : { queryKey: staffKeys.detail('new'), queryFn: async () => null }),
    enabled: Boolean(staffId),
  })

  const gateOptionsQuery = useQuery({
    ...staffQueries.gateOptions(eventId),
    enabled: Boolean(eventId),
  })

  useEffect(() => {
    if (!staffId) {
      setForm(EMPTY_STAFF_FORM)
      return
    }

    if (staffDetailQuery.data) {
      setForm(mapStaffToForm(staffDetailQuery.data))
    }
  }, [staffDetailQuery.data, staffId])

  const createMutation = useMutation({
    ...staffMutations.create(),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: staffKeys.byEvent(eventId, 'all') }),
        queryClient.invalidateQueries({ queryKey: staffKeys.summary(eventId) }),
      ])
      onSaved()
    },
  })

  const updateMutation = useMutation({
    ...staffMutations.update(),
    onSuccess: async (staff) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: staffKeys.byEvent(eventId, 'all') }),
        queryClient.invalidateQueries({ queryKey: staffKeys.summary(eventId) }),
        staff ? queryClient.invalidateQueries({ queryKey: staffKeys.detail(staff.id) }) : Promise.resolve(),
      ])
      onSaved()
    },
  })

  async function save() {
    if (staffId) {
      await updateMutation.mutateAsync({ staffId, eventId, organizationId, form })
      await auditService.record({
        organization_id: organizationId,
        user_id: profile?.id ?? null,
        user_name: `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || null,
        event_id: eventId,
        entity_type: 'staff',
        entity_id: staffId,
        action_type: 'update',
        title: 'Membro de staff atualizado',
        description: `${form.first_name} ${form.last_name}`.trim(),
      })
      return
    }

    await createMutation.mutateAsync({ eventId, organizationId, form })
    await auditService.record({
      organization_id: organizationId,
      user_id: profile?.id ?? null,
      user_name: `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || null,
      event_id: eventId,
      entity_type: 'staff',
      action_type: 'create',
      title: 'Membro de staff criado',
      description: `${form.first_name} ${form.last_name}`.trim(),
    })
  }

  function updateField<TKey extends keyof StaffFormData>(field: TKey, value: StaffFormData[TKey]) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  return {
    form,
    updateField,
    save,
    saving: createMutation.isPending || updateMutation.isPending,
    loading: Boolean(staffId) && staffDetailQuery.isPending,
    error: createMutation.error instanceof Error ? createMutation.error.message : updateMutation.error instanceof Error ? updateMutation.error.message : '',
    gateOptions: gateOptionsQuery.data ?? [],
  }
}
