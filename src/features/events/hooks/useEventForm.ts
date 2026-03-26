import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth'
import { auditService } from '@/features/audit'
import { billingService } from '@/features/billing/services'
import { EMPTY_EVENT_FORM } from '@/features/events/types'
import { eventsKeys, eventsMutations, eventsQueries } from '@/features/events/services'
import type { EventEditorRecord, EventFormData } from '@/features/events/types'

interface UseEventFormParams {
  eventId: string | null
  organizationId: string
  onSaved: () => void
}

function mapEditorRecordToForm(data: EventEditorRecord): EventFormData {
  return {
    name: data.name ?? '',
    subtitle: data.subtitle ?? '',
    category: data.category ?? '',
    short_description: data.short_description ?? '',
    starts_at: data.starts_at ? data.starts_at.slice(0, 16) : '',
    ends_at: data.ends_at ? data.ends_at.slice(0, 16) : '',
    doors_open_at: data.doors_open_at ? data.doors_open_at.slice(0, 16) : '',
    venue_name: data.venue_name ?? '',
    venue_street: data.venue_address?.street ?? '',
    venue_city: data.venue_address?.city ?? '',
    venue_state: data.venue_address?.state ?? '',
    total_capacity: data.total_capacity?.toString() ?? '',
    age_rating: data.age_rating ?? 'livre',
    dress_code: data.dress_code ?? '',
    is_online: data.is_online ?? false,
    online_url: data.online_url ?? '',
    cover_url: data.cover_url ?? '',
    video_url: data.settings?.video_url ?? '',
    fee_type: data.fee_type ?? 'percentage',
    fee_value: String(data.fee_value ?? 10),
    absorb_fee: data.absorb_fee ?? false,
  }
}

export function useEventForm({ eventId, organizationId, onSaved }: UseEventFormParams) {
  const queryClient = useQueryClient()
  const profile = useAuthStore((state) => state.profile)
  const [form, setForm] = useState<EventFormData>(EMPTY_EVENT_FORM)
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')

  const eventDetailQuery = useQuery({
    ...(eventId ? eventsQueries.detail(eventId) : { queryKey: eventsKeys.detail('new'), queryFn: async () => null }),
    enabled: Boolean(eventId),
  })

  const createMutation = useMutation({
    ...eventsMutations.create(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: eventsKeys.list(organizationId) })
    },
  })

  const updateMutation = useMutation({
    ...eventsMutations.update(),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: eventsKeys.list(organizationId) }),
        queryClient.invalidateQueries({ queryKey: eventsKeys.detail(variables.eventId) }),
      ])
    },
  })

  const uploadMutation = useMutation(eventsMutations.uploadCover())

  useEffect(() => {
    setStep(1)
    setError('')

    if (!eventId) {
      setForm(EMPTY_EVENT_FORM)
      return
    }

    setForm(EMPTY_EVENT_FORM)
  }, [eventId])

  useEffect(() => {
    if (!eventDetailQuery.data) {
      return
    }

    setForm(mapEditorRecordToForm(eventDetailQuery.data))
  }, [eventDetailQuery.data])

  function setField<K extends keyof EventFormData>(field: K, value: EventFormData[K]) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleUpload(file: File) {
    setError('')

    try {
      const publicUrl = await uploadMutation.mutateAsync({ organizationId, file })
      setField('cover_url', publicUrl)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao enviar imagem'
      setError(message)
    }
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setError('Nome do evento \u00e9 obrigat\u00f3rio')
      return
    }

    if (!form.starts_at) {
      setError('Data de in\u00edcio \u00e9 obrigat\u00f3ria')
      return
    }

    setError('')

    try {
      if (!eventId) {
        const gate = await billingService.getPlanGateSnapshot(organizationId)

        if (!gate.canCreateEvent) {
          const limitLabel = gate.usage.eventLimit == null ? 'do plano atual' : `de ${gate.usage.eventLimit} eventos`
          setError(`Este plano ja atingiu o limite ${limitLabel}. Ative um plano superior em Billing para criar novos eventos.`)
          return
        }
      }

      if (eventId) {
        await updateMutation.mutateAsync({ eventId, form })
        await auditService.record({
          organization_id: organizationId,
          user_id: profile?.id ?? null,
          user_name: `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || null,
          entity_type: 'event',
          entity_id: eventId,
          action_type: 'update',
          title: 'Evento atualizado',
          description: form.name,
        })
      } else {
        await createMutation.mutateAsync({ organizationId, form })
        await auditService.record({
          organization_id: organizationId,
          user_id: profile?.id ?? null,
          user_name: `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || null,
          entity_type: 'event',
          action_type: 'create',
          title: 'Evento criado',
          description: form.name,
        })
      }

      onSaved()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar'
      setError(message)
    }
  }

  const loading = Boolean(eventId) && eventDetailQuery.isPending
  const saving = createMutation.isPending || updateMutation.isPending
  const uploading = uploadMutation.isPending

  return {
    form,
    step,
    loading,
    saving,
    uploading,
    error,
    setStep,
    setError,
    setField,
    handleUpload,
    handleSave,
  }
}
