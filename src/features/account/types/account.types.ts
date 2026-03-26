export type AccountTicketVisualStatus = 'active' | 'used' | 'cancelled'

export interface AccountTicketRecord {
  id: string
  eventId: string
  orderId: string
  orderStatus: string
  ticketNumber: string
  qrToken: string
  ticketTypeName: string
  batchName: string
  holderName: string
  holderEmail: string
  status: string
  visualStatus: AccountTicketVisualStatus
  checkedInAt?: string | null
  price: number
  isVip: boolean
}

export interface AccountEventRecord {
  id: string
  slug: string
  name: string
  subtitle: string
  category: string
  startsAt: string
  endsAt?: string | null
  venueName: string
  city: string
  state: string
  status: string
  coverImageUrl: string
  ticketsCount: number
  activeTicketCount: number
  usedTicketCount: number
  cancelledTicketCount: number
  ordersCount: number
  totalSpent: number
  timeframe: 'upcoming' | 'past'
  instructions: string[]
  tickets: AccountTicketRecord[]
}

export interface AccountOverview {
  user: {
    name: string
    email: string
    statusLabel: string
    phone?: string | null
    avatarUrl?: string | null
  }
  stats: {
    totalEvents: number
    upcomingEvents: number
    activeTickets: number
    usedTickets: number
    totalSpent: number
  }
  upcomingEvents: AccountEventRecord[]
  pastEvents: AccountEventRecord[]
}
