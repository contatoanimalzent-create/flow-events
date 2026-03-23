import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { EMPTY_TICKET_BATCH_FORM } from '@/features/tickets/types'
import { ticketKeys, ticketMutations, ticketQueries } from '@/features/tickets/services'
import type { TicketBatch, TicketBatchFormData } from '@/features/tickets/types'

interface UseTicketBatchFormParams {
  eventId: string
  ticketTypeId: string
  batchId: string | null
  position: number
  onSaved: () => void
}

function mapBatchToForm(batch: TicketBatch): TicketBatchFormData {
  return {
    name: batch.name ?? '',
    price: String(batch.price ?? ''),
    quantity: String(batch.quantity ?? ''),
    starts_at: batch.starts_at ? batch.starts_at.slice(0, 16) : '',
    ends_at: batch.ends_at ? batch.ends_at.slice(0, 16) : '',
    auto_open_next: batch.auto_open_next ?? true,
  }
}

export function useTicketBatchForm({ eventId, ticketTypeId, batchId, position, onSaved }: UseTicketBatchFormParams) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<TicketBatchFormData>(EMPTY_TICKET_BATCH_FORM)
  const [error, setError] = useState('')

  const batchDetailQuery = useQuery({
    ...(batchId ? ticketQueries.batchDetail(batchId) : { queryKey: ticketKeys.batchDetail('new'), queryFn: async () => null }),
    enabled: Boolean(batchId),
  })

  const createBatchMutation = useMutation({
    ...ticketMutations.createBatch(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ticketKeys.byEvent(eventId) })
    },
  })

  const updateBatchMutation = useMutation({
    ...ticketMutations.updateBatch(),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ticketKeys.byEvent(eventId) }),
        queryClient.invalidateQueries({ queryKey: ticketKeys.batchDetail(variables.batchId) }),
      ])
    },
  })

  useEffect(() => {
    setError('')

    if (!batchId) {
      setForm({
        ...EMPTY_TICKET_BATCH_FORM,
        name: `Lote ${position + 1}`,
      })
      return
    }

    setForm(EMPTY_TICKET_BATCH_FORM)
  }, [batchId, position])

  useEffect(() => {
    if (!batchDetailQuery.data) {
      return
    }

    setForm(mapBatchToForm(batchDetailQuery.data))
  }, [batchDetailQuery.data])

  function setField<K extends keyof TicketBatchFormData>(field: K, value: TicketBatchFormData[K]) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setError('Nome \u00e9 obrigat\u00f3rio')
      return
    }

    if (!form.price || Number.isNaN(Number(form.price))) {
      setError('Pre\u00e7o inv\u00e1lido')
      return
    }

    if (!form.quantity || Number.isNaN(Number(form.quantity))) {
      setError('Quantidade inv\u00e1lida')
      return
    }

    setError('')

    try {
      if (batchId) {
        await updateBatchMutation.mutateAsync({ batchId, eventId, ticketTypeId, form, position })
      } else {
        await createBatchMutation.mutateAsync({ eventId, ticketTypeId, form, position })
      }

      onSaved()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar lote'
      setError(message)
    }
  }

  return {
    form,
    loading: batchDetailQuery.isPending,
    saving: createBatchMutation.isPending || updateBatchMutation.isPending,
    error,
    setField,
    handleSave,
  }
}
