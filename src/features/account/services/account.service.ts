import { supabase } from '@/lib/supabase'
import { createApiClient } from '@/shared/api'
import type {
  AccountEventRecord,
  AccountOverview,
  AccountTicketRecord,
  AccountTicketVisualStatus,
} from '@/features/account/types'

const accountApi = createApiClient('account')

interface GetAccountOverviewInput {
  email: string
  name?: string | null
  phone?: string | null
  avatarUrl?: string | null
}

function getRelationRecord(value: unknown): Record<string, unknown> | null {
  if (Array.isArray(value)) {
    const [first] = value
    return first && typeof first === 'object' ? (first as Record<string, unknown>) : null
  }

  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null
}

function getRelationList(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
  }

  if (value && typeof value === 'object') {
    return [value as Record<string, unknown>]
  }

  return []
}

function getString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function getNumber(value: unknown, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function getOptionalString(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0 ? value : null
}

function getTicketVisualStatus(status: string, checkedInAt?: string | null): AccountTicketVisualStatus {
  if (checkedInAt || status === 'used') {
    return 'used'
  }

  if (status === 'cancelled' || status === 'refunded' || status === 'expired') {
    return 'cancelled'
  }

  return 'active'
}

function getFallbackImage(category: string) {
  const normalizedCategory = category.toLowerCase()

  if (
    normalizedCategory.includes('festival') ||
    normalizedCategory.includes('show') ||
    normalizedCategory.includes('musica')
  ) {
    return 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1600&q=80&fit=crop'
  }

  if (normalizedCategory.includes('corporativo') || normalizedCategory.includes('summit')) {
    return 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1600&q=80&fit=crop'
  }

  return 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&q=80&fit=crop'
}

function buildInstructions(event: AccountEventRecord) {
  const startsAt = new Date(event.startsAt)
  const dateLabel = startsAt.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  })
  const timeLabel = startsAt.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return [
    `Apresente o QR code na entrada a partir de ${dateLabel}, ${timeLabel}.`,
    `O acesso acontece em ${event.venueName}${event.city ? `, ${event.city}` : ''}.`,
    'Mantenha este ingresso disponivel no celular para uma entrada mais fluida.',
  ]
}

export const accountService = {
  async getOverview(input: GetAccountOverviewInput): Promise<AccountOverview> {
    return accountApi.query(
      'get_overview',
      async () => {
        const ordersResult = await supabase
          .from('orders')
          .select(`
            id,
            event_id,
            buyer_name,
            buyer_email,
            total_amount,
            status,
            created_at,
            paid_at,
            event:events(
              id,
              slug,
              name,
              subtitle,
              category,
              starts_at,
              ends_at,
              venue_name,
              venue_address,
              cover_url,
              status
            ),
            items:order_items(
              id,
              ticket_type_id,
              batch_id,
              unit_price,
              total_price,
              holder_name,
              holder_email,
              ticket_type:ticket_types(name),
              batch:ticket_batches(name)
            ),
            digital_tickets(
              id,
              order_item_id,
              ticket_type_id,
              batch_id,
              event_id,
              ticket_number,
              qr_token,
              holder_name,
              holder_email,
              status,
              checked_in_at,
              is_vip
            )
          `)
          .eq('buyer_email', input.email)
          .order('created_at', { ascending: false })

        if (ordersResult.error) {
          throw ordersResult.error
        }

        const orderRows = getRelationList(ordersResult.data)
        const eventIds = Array.from(
          new Set(orderRows.map((row) => getString(row.event_id)).filter(Boolean)),
        )

        const assetMap = new Map<string, string>()

        if (eventIds.length > 0) {
          const assetsResult = await supabase
            .from('event_assets')
            .select('event_id, usage_type, secure_url, url, thumbnail_url, sort_order, asset_type')
            .in('event_id', eventIds)
            .eq('is_active', true)
            .in('usage_type', ['hero', 'cover', 'thumbnail'])
            .order('sort_order', { ascending: true })

          if (assetsResult.error) {
            throw assetsResult.error
          }

          for (const assetRow of getRelationList(assetsResult.data)) {
            const eventId = getString(assetRow.event_id)

            if (!eventId || assetMap.has(eventId)) {
              continue
            }

            const previewUrl =
              getOptionalString(assetRow.thumbnail_url) ||
              getOptionalString(assetRow.secure_url) ||
              getOptionalString(assetRow.url)

            if (previewUrl) {
              assetMap.set(eventId, previewUrl)
            }
          }
        }

        const eventsMap = new Map<string, AccountEventRecord>()

        for (const orderRow of orderRows) {
          const orderId = getString(orderRow.id)
          const eventRow = getRelationRecord(orderRow.event)

          if (!orderId || !eventRow) {
            continue
          }

          const eventId = getString(eventRow.id)

          if (!eventId) {
            continue
          }

          const venueAddress = getRelationRecord(eventRow.venue_address)
          const startsAt = getString(eventRow.starts_at)
          const endsAt = getOptionalString(eventRow.ends_at)
          const category = getString(eventRow.category, 'Experiencia premium')
          const isPast = new Date(endsAt ?? startsAt).getTime() < Date.now()

          const existingEvent = eventsMap.get(eventId)
          const baseEvent =
            existingEvent ??
            ({
              id: eventId,
              slug: getString(eventRow.slug),
              name: getString(eventRow.name),
              subtitle: getString(eventRow.subtitle),
              category,
              startsAt,
              endsAt,
              venueName: getString(eventRow.venue_name, 'Venue em confirmacao'),
              city: getString(venueAddress?.city),
              state: getString(venueAddress?.state),
              status: getString(eventRow.status, 'published'),
              coverImageUrl:
                assetMap.get(eventId) ||
                getOptionalString(eventRow.cover_url) ||
                getFallbackImage(category),
              ticketsCount: 0,
              activeTicketCount: 0,
              usedTicketCount: 0,
              cancelledTicketCount: 0,
              ordersCount: 0,
              totalSpent: 0,
              timeframe: isPast ? 'past' : 'upcoming',
              instructions: [],
              tickets: [],
            } satisfies AccountEventRecord)

          baseEvent.ordersCount += 1
          baseEvent.totalSpent += getNumber(orderRow.total_amount)

          const itemMap = new Map<
            string,
            {
              ticketTypeName: string
              batchName: string
              holderName: string
              holderEmail: string
              price: number
            }
          >()

          for (const itemRow of getRelationList(orderRow.items)) {
            const itemId = getString(itemRow.id)

            if (!itemId) {
              continue
            }

            const ticketTypeRow = getRelationRecord(itemRow.ticket_type)
            const batchRow = getRelationRecord(itemRow.batch)

            itemMap.set(itemId, {
              ticketTypeName: getString(ticketTypeRow?.name, 'Ingresso digital'),
              batchName: getString(batchRow?.name, 'Lote confirmado'),
              holderName: getString(itemRow.holder_name, getString(orderRow.buyer_name)),
              holderEmail: getString(itemRow.holder_email, getString(orderRow.buyer_email)),
              price: getNumber(itemRow.total_price) || getNumber(itemRow.unit_price),
            })
          }

          const existingTicketIds = new Set(baseEvent.tickets.map((ticket) => ticket.id))

          for (const ticketRow of getRelationList(orderRow.digital_tickets)) {
            const ticketId = getString(ticketRow.id)

            if (!ticketId || existingTicketIds.has(ticketId)) {
              continue
            }

            const itemMatch = itemMap.get(getString(ticketRow.order_item_id))
            const status = getString(ticketRow.status, 'confirmed')
            const checkedInAt = getOptionalString(ticketRow.checked_in_at)

            const ticket: AccountTicketRecord = {
              id: ticketId,
              eventId,
              orderId,
              orderStatus: getString(orderRow.status),
              ticketNumber: getString(ticketRow.ticket_number),
              qrToken: getString(ticketRow.qr_token),
              ticketTypeName: itemMatch?.ticketTypeName ?? 'Ingresso digital',
              batchName: itemMatch?.batchName ?? 'Lote confirmado',
              holderName: getString(
                ticketRow.holder_name,
                itemMatch?.holderName ?? getString(orderRow.buyer_name),
              ),
              holderEmail: getString(
                ticketRow.holder_email,
                itemMatch?.holderEmail ?? getString(orderRow.buyer_email),
              ),
              status,
              visualStatus: getTicketVisualStatus(status, checkedInAt),
              checkedInAt,
              price: itemMatch?.price ?? 0,
              isVip: Boolean(ticketRow.is_vip),
            }

            baseEvent.tickets.push(ticket)
            baseEvent.ticketsCount += 1

            if (ticket.visualStatus === 'used') {
              baseEvent.usedTicketCount += 1
            } else if (ticket.visualStatus === 'cancelled') {
              baseEvent.cancelledTicketCount += 1
            } else {
              baseEvent.activeTicketCount += 1
            }
          }

          eventsMap.set(eventId, baseEvent)
        }

        const events = Array.from(eventsMap.values())
          .map((event) => ({
            ...event,
            instructions: buildInstructions(event),
            tickets: [...event.tickets].sort((left, right) => {
              if (left.visualStatus === right.visualStatus) {
                return left.ticketTypeName.localeCompare(right.ticketTypeName)
              }

              const order = { active: 0, used: 1, cancelled: 2 }
              return order[left.visualStatus] - order[right.visualStatus]
            }),
          }))
          .sort((left, right) => new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime())

        const upcomingEvents = events.filter((event) => event.timeframe === 'upcoming')
        const pastEvents = events
          .filter((event) => event.timeframe === 'past')
          .sort((left, right) => new Date(right.startsAt).getTime() - new Date(left.startsAt).getTime())

        const activeTickets = events.reduce((sum, event) => sum + event.activeTicketCount, 0)
        const usedTickets = events.reduce((sum, event) => sum + event.usedTicketCount, 0)
        const totalSpent = events.reduce((sum, event) => sum + event.totalSpent, 0)
        const fallbackName =
          input.email.split('@')[0]?.replace(/[._-]+/g, ' ') ?? 'Cliente Animalz'
        const normalizedName = (input.name || fallbackName)
          .split(' ')
          .filter(Boolean)
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' ')

        return {
          user: {
            name: normalizedName,
            email: input.email,
            statusLabel:
              activeTickets > 0
                ? 'Acessos ativos na plataforma'
                : 'Conta pronta para novas experiencias',
            phone: input.phone ?? null,
            avatarUrl: input.avatarUrl ?? null,
          },
          stats: {
            totalEvents: events.length,
            upcomingEvents: upcomingEvents.length,
            activeTickets,
            usedTickets,
            totalSpent,
          },
          upcomingEvents,
          pastEvents,
        }
      },
      { email: input.email },
    )
  },
}
