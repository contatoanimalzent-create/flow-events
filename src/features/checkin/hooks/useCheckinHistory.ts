import { useQuery } from '@tanstack/react-query'
import { checkinKeys, checkinQueries } from '@/features/checkin/services'

export function useCheckinHistory(digitalTicketId: string | null) {
  return useQuery({
    ...(digitalTicketId ? checkinQueries.history(digitalTicketId) : { queryKey: checkinKeys.history('empty'), queryFn: async () => [] }),
    enabled: Boolean(digitalTicketId),
  })
}
