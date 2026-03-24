import { useMutation, useQueryClient } from '@tanstack/react-query'
import { crmKeys, crmMutations } from '@/features/crm/services'

interface UseCrmMutationsParams {
  organizationId?: string | null
  selectedCustomerId?: string | null
}

export function useCrmMutations({ organizationId, selectedCustomerId }: UseCrmMutationsParams) {
  const queryClient = useQueryClient()

  async function invalidateCrmQueries() {
    if (!organizationId) {
      return
    }

    await queryClient.invalidateQueries({ queryKey: crmKeys.overview(organizationId) })

    if (selectedCustomerId) {
      await queryClient.invalidateQueries({ queryKey: crmKeys.customer(organizationId, selectedCustomerId) })
    }
  }

  const updateTagsMutation = useMutation({
    ...crmMutations.updateTags(),
    onSuccess: invalidateCrmQueries,
  })

  const updateNotesMutation = useMutation({
    ...crmMutations.updateNotes(),
    onSuccess: invalidateCrmQueries,
  })

  return {
    updateTags: updateTagsMutation.mutateAsync,
    updateNotes: updateNotesMutation.mutateAsync,
    savingTags: updateTagsMutation.isPending,
    savingNotes: updateNotesMutation.isPending,
  }
}
