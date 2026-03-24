import { useMutation, useQueryClient } from '@tanstack/react-query'
import { intelligenceKeys, intelligenceMutations } from '@/features/intelligence/services'

interface UseIntelligenceMutationsParams {
  organizationId?: string | null
}

export function useIntelligenceMutations({ organizationId }: UseIntelligenceMutationsParams) {
  const queryClient = useQueryClient()

  async function invalidateIntelligenceQueries() {
    if (!organizationId) {
      return
    }

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: intelligenceKeys.overview(organizationId) }),
      queryClient.invalidateQueries({ queryKey: intelligenceKeys.alertStates(organizationId) }),
    ])
  }

  const acknowledgeAlertMutation = useMutation({
    ...intelligenceMutations.acknowledgeAlert(),
    onSuccess: invalidateIntelligenceQueries,
  })

  return {
    acknowledgeAlert: acknowledgeAlertMutation.mutateAsync,
    acknowledgingAlert: acknowledgeAlertMutation.isPending,
  }
}
