export const queryKeys = {
  session: (organizationId?: string) => ['session', organizationId ?? 'anonymous'] as const,
  events: {
    all: ['events'] as const,
    byOrganization: (organizationId: string) => ['events', organizationId] as const,
    detail: (eventId: string) => ['events', eventId] as const,
  },
  tickets: {
    byEvent: (eventId: string) => ['events', eventId, 'tickets'] as const,
  },
  checkin: {
    byEvent: (eventId: string) => ['events', eventId, 'checkin'] as const,
  },
  financial: {
    summary: (organizationId: string, period: string) =>
      ['financial', organizationId, 'summary', period] as const,
  },
  growth: {
    byEvent: (eventId: string) => ['growth', eventId] as const,
  },
}
