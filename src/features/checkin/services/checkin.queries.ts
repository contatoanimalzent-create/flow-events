import { mutationOptions, queryOptions } from '@tanstack/react-query'
import type { CheckInDigitalTicketInput, ValidateDigitalTicketInput } from '@/features/checkin/types'
import { checkinService } from './checkin.service'

interface ValidateTicketVariables extends ValidateDigitalTicketInput {}
interface ProcessCheckinVariables extends CheckInDigitalTicketInput {}
interface AllowReentryVariables {
  digitalTicketId: string
}

export const checkinKeys = {
  all: ['checkin'] as const,
  events: (organizationId: string) => [...checkinKeys.all, 'events', organizationId] as const,
  gates: (eventId: string) => [...checkinKeys.all, 'gates', eventId] as const,
  stats: (eventId: string) => [...checkinKeys.all, 'stats', eventId] as const,
  recent: (eventId: string, gateId?: string | null) => [...checkinKeys.all, 'recent', eventId, gateId ?? 'all'] as const,
  commandCenter: (eventId: string) => [...checkinKeys.all, 'command-center', eventId] as const,
  history: (digitalTicketId: string) => [...checkinKeys.all, 'history', digitalTicketId] as const,
  actions: () => [...checkinKeys.all, 'actions'] as const,
}

export const checkinQueries = {
  events: (organizationId: string) =>
    queryOptions({
      queryKey: checkinKeys.events(organizationId),
      queryFn: () => checkinService.listCheckinEvents(organizationId),
    }),
  gates: (eventId: string) =>
    queryOptions({
      queryKey: checkinKeys.gates(eventId),
      queryFn: () => checkinService.listGatesByEvent(eventId),
    }),
  stats: (eventId: string) =>
    queryOptions({
      queryKey: checkinKeys.stats(eventId),
      queryFn: () => checkinService.getCheckinStatsByEvent(eventId),
      refetchInterval: 15_000,
    }),
  recent: (eventId: string, gateId?: string | null) =>
    queryOptions({
      queryKey: checkinKeys.recent(eventId, gateId),
      queryFn: () => checkinService.listRecentCheckinsByEvent(eventId, gateId),
      refetchInterval: 15_000,
    }),
  commandCenter: (eventId: string) =>
    queryOptions({
      queryKey: checkinKeys.commandCenter(eventId),
      queryFn: () => checkinService.getCommandCenterSnapshot(eventId),
      refetchInterval: 15_000,
    }),
  history: (digitalTicketId: string) =>
    queryOptions({
      queryKey: checkinKeys.history(digitalTicketId),
      queryFn: () => checkinService.getCheckinHistoryByTicket(digitalTicketId),
    }),
}

export const checkinMutations = {
  validate: () =>
    mutationOptions({
      mutationKey: [...checkinKeys.actions(), 'validate'] as const,
      mutationFn: (input: ValidateTicketVariables) => checkinService.validateDigitalTicket(input),
    }),
  process: () =>
    mutationOptions({
      mutationKey: [...checkinKeys.actions(), 'process'] as const,
      mutationFn: (input: ProcessCheckinVariables) => checkinService.checkInDigitalTicket(input),
    }),
  allowReentry: () =>
    mutationOptions({
      mutationKey: [...checkinKeys.actions(), 'allow-reentry'] as const,
      mutationFn: ({ digitalTicketId }: AllowReentryVariables) => checkinService.allowReentryIfApplicable(digitalTicketId),
    }),
}
