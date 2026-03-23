import { useEffect, useState } from 'react'
import { eventsService } from '@/features/events/services'
import { EMPTY_EVENT_FORM } from '@/features/events/types'
import type { EventFormData } from '@/features/events/types'

interface UseEventFormParams {
  eventId: string | null
  organizationId: string
  onSaved: () => void
}

export function useEventForm({ eventId, organizationId, onSaved }: UseEventFormParams) {
  const [form, setForm] = useState<EventFormData>(EMPTY_EVENT_FORM)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!eventId) {
      setForm(EMPTY_EVENT_FORM)
      setStep(1)
      setLoading(false)
      setSaving(false)
      setUploading(false)
      setError('')
      return
    }

    let active = true
    const currentEventId = eventId

    async function loadEvent() {
      setLoading(true)
      const data = await eventsService.getEventById(currentEventId)

      if (!active) return

      if (data) {
        setForm({
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
        })
      }

      setLoading(false)
    }

    void loadEvent()

    return () => {
      active = false
    }
  }, [eventId])

  function setField<K extends keyof EventFormData>(field: K, value: EventFormData[K]) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleUpload(file: File) {
    setUploading(true)
    const publicUrl = await eventsService.uploadEventCover(organizationId, file)

    if (publicUrl) {
      setField('cover_url', publicUrl)
    }

    setUploading(false)
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setError('Nome do evento Ã© obrigatÃ³rio')
      return
    }

    if (!form.starts_at) {
      setError('Data de inÃ­cio Ã© obrigatÃ³ria')
      return
    }

    setSaving(true)
    setError('')

    try {
      if (eventId) {
        await eventsService.updateEvent(eventId, form)
      } else {
        await eventsService.createEvent(organizationId, form)
      }

      onSaved()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar'
      setError(message)
      setSaving(false)
    }
  }

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
