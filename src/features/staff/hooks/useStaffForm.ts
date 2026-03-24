import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
      return
    }

    await createMutation.mutateAsync({ eventId, organizationId, form })
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
