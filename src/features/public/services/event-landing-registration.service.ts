import { supabase } from '@/lib/supabase'

export interface EventLandingRegistrationInput {
  organizationId: string
  eventId: string
  fullName: string
  email: string
  phone: string
  ticketOptionId: string
  ticketOptionLabel: string
  cpf?: string
  additionalInfo?: string
}

export const eventLandingRegistrationService = {
  async submit(input: EventLandingRegistrationInput) {
    const { data, error } = await supabase
      .from('person_event_profiles')
      .insert({
        organization_id: input.organizationId,
        event_id: input.eventId,
        email: input.email.trim().toLowerCase(),
        full_name: input.fullName.trim(),
        phone: input.phone || null,
        role: 'attendee',
        metadata: {
          source: 'event-landing-page',
          ticketOptionId: input.ticketOptionId,
          ticketOptionLabel: input.ticketOptionLabel,
          cpf: input.cpf || null,
          additionalInfo: input.additionalInfo?.trim() || null,
        },
      })
      .select('id')
      .single()

    if (error) {
      if (error.code === '23505') {
        throw new Error('Ja existe uma inscricao com este e-mail para este evento.')
      }

      throw new Error(error.message || 'Nao foi possivel salvar a inscricao.')
    }

    return data
  },
}
