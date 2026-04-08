import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/features/auth'
import { auditService } from '@/features/audit'
import { billingService } from '@/features/billing/services'
import { EMPTY_TICKET_TYPE_FORM } from '@/features/tickets/types'
import { ticketKeys, ticketMutations, ticketQueries } from '@/features/tickets/services'
import { formatBenefitsForForm } from '@/features/tickets/services'
import type { TicketType, TicketTypeFormData } from '@/features/tickets/types'

interface UseTicketFormParams {
  eventId: string
  ticketId: string | null
  position: number
  onSaved: () => void
}

function mapTicketTypeToForm(ticketType: TicketType): TicketTypeFormData {
  return {
    name: ticketType.name ?? '',
    description: ticketType.description ?? '',
    sector: ticketType.sector ?? '',
    color: ticketType.color ?? '#0057E7',
    is_nominal: ticketType.is_nominal ?? true,
    is_transferable: ticketType.is_transferable ?? false,
    max_per_order: String(ticketType.max_per_order ?? 5),
    benefits: formatBenefitsForForm(ticketType.benefits),
  }
}

export function useTicketForm({ eventId, ticketId, position, onSaved }: UseTicketFormParams) {
  const queryClient = useQueryClient()
  const organizationId = useAuthStore((state) => state.organization?.id)
  const profile = useAuthStore((state) => state.profile)
  const [form, setForm] = useState<TicketTypeFormData>(EMPTY_TICKET_TYPE_FORM)
  const [error, setError] = useState('')

  const ticketDetailQuery = useQuery({
    ...(ticketId ? ticketQueries.detail(ticketId) : { queryKey: ticketKeys.detail('new'), queryFn: async () => null }),
    enabled: Boolean(ticketId),
  })

  const createMutation = useMutation({
    ...ticketMutations.create(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ticketKeys.byEvent(eventId) })
    },
  })

  const updateMutation = useMutation({
    ...ticketMutations.update(),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ticketKeys.byEvent(eventId) }),
        queryClient.invalidateQueries({ queryKey: ticketKeys.detail(variables.ticketId) }),
      ])
    },
  })

  useEffect(() => {
    setError('')

    if (!ticketId) {
      setForm(EMPTY_TICKET_TYPE_FORM)
      return
    }

    setForm(EMPTY_TICKET_TYPE_FORM)
  }, [ticketId])

  useEffect(() => {
    if (!ticketDetailQuery.data) {
      return
    }

    setForm(mapTicketTypeToForm(ticketDetailQuery.data))
  }, [ticketDetailQuery.data])

  function setField<K extends keyof TicketTypeFormData>(field: K, value: TicketTypeFormData[K]) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setError('Nome \u00e9 obrigat\u00f3rio')
      return
    }

    setError('')

    try {
      if (!ticketId && organizationId) {
        const gate = await billingService.getPlanGateSnapshot(organizationId, eventId)

        if (!gate.canCreateTicketType) {
          const limitLabel =
            gate.usage.ticketsPerEventLimit == null
              ? 'do plano atual'
              : `de ${gate.usage.ticketsPerEventLimit} tipos por evento`
          setError(`Este evento ja alcançou o limite ${limitLabel}. Ajuste o plano em Billing para liberar novos tipos de ingresso.`)
          return
        }
      }

      if (ticketId) {
        await updateMutation.mutateAsync({ ticketId, eventId, form, position })
        if (organizationId) {
          await auditService.record({
            organization_id: organizationId,
            user_id: profile?.id ?? null,
            user_name: `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || null,
            event_id: eventId,
            entity_type: 'ticket',
            entity_id: ticketId,
            action_type: 'update',
            title: 'Tipo de ingresso atualizado',
            description: form.name,
          })
        }
      } else {
        await createMutation.mutateAsync({ eventId, form, position })
        if (organizationId) {
          await auditService.record({
            organization_id: organizationId,
            user_id: profile?.id ?? null,
            user_name: `${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`.trim() || null,
            event_id: eventId,
            entity_type: 'ticket',
            action_type: 'create',
            title: 'Tipo de ingresso criado',
            description: form.name,
          })
        }
      }

      onSaved()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar tipo de ingresso'
      setError(message)
    }
  }

  return {
    form,
    loading: Boolean(ticketId) && ticketDetailQuery.isPending,
    saving: createMutation.isPending || updateMutation.isPending,
    error,
    setError,
    setField,
    handleSave,
  }
}
