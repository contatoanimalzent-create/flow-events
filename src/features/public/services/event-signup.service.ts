import { supabase } from '@/lib/supabase'

export interface EventSignupInput {
  eventId: string
  name: string
  email: string
  phone: string
  ticketTypeId: string
  ticketTypeLabel: string
}

export interface EventSignupResult {
  id: string
  code: string
  qrValue: string
}

export const eventSignupService = {
  async submit(input: EventSignupInput): Promise<EventSignupResult> {
    const eventResult = await supabase
      .from('events')
      .select('id, organization_id')
      .eq('id', input.eventId)
      .single()

    if (eventResult.error || !eventResult.data) {
      throw new Error('Nao foi possivel localizar o evento para concluir a inscricao.')
    }

    const insertResult = await supabase
      .from('person_event_profiles')
      .insert({
        organization_id: eventResult.data.organization_id,
        event_id: input.eventId,
        email: input.email.trim().toLowerCase(),
        full_name: input.name.trim(),
        phone: input.phone,
        role: 'attendee',
        metadata: {
          source: 'event-signup-form',
          ticketTypeId: input.ticketTypeId,
          ticketTypeLabel: input.ticketTypeLabel,
          confirmationChannel: 'frontend-direct',
        },
      })
      .select('id')
      .single()

    if (insertResult.error || !insertResult.data) {
      if (insertResult.error?.code === '23505') {
        throw new Error('Ja existe uma inscricao com este e-mail para este evento.')
      }

      throw new Error(insertResult.error?.message || 'Nao foi possivel salvar a inscricao.')
    }

    const code = `PULSE-${insertResult.data.id.slice(0, 8).toUpperCase()}`

    return {
      id: insertResult.data.id,
      code,
      qrValue: `${window.location.origin}/signup/${insertResult.data.id}`,
    }
  },
}
