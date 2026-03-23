import { supabase } from './supabase'

export async function seedTestEventIfNeeded() {
  try {
    // Verificar se já existe evento
    const { data: existingEvents, error: checkError } = await supabase
      .from('events')
      .select('id')
      .limit(1)

    if (checkError) {
      console.error('Error checking events:', checkError)
      return
    }

    // Se já existe evento, não fazer nada
    if (existingEvents && existingEvents.length > 0) {
      console.log('✓ Events already exist, skipping seed')
      return
    }

    console.log('🌱 No events found, creating test event...')

    // Verificar se existe organização
    const { data: organizations, error: orgError } = await supabase
      .from('organizations')
      .select('id')
      .limit(1)

    if (orgError || !organizations || organizations.length === 0) {
      console.error('No organization found, cannot seed event')
      return
    }

    const orgId = organizations[0].id

    // Criar evento
    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert([
        {
          organization_id: orgId,
          name: 'ANIMALZ Summit 2025',
          slug: 'animalz-summit-2025',
          subtitle: 'O maior evento de tecnologia e inovação para gestão de eventos',
          short_description: 'Descubra as melhores práticas, tendências e ferramentas para transformar seu evento em uma experiência inesquecível.',
          full_description: 'ANIMALZ Summit 2025 é o evento definitivo para profissionais de gestão de eventos, produtores e empreendedores. Durante 3 dias intensos, você terá a oportunidade de aprender com os maiores especialistas da indústria, conhecer novas tecnologias e fazer networking com centenas de profissionais.',
          category: 'Tech',
          status: 'published',
          starts_at: '2025-06-15T09:00:00Z',
          ends_at: '2025-06-17T18:00:00Z',
          doors_open_at: '2025-06-15T08:30:00Z',
          venue_name: 'São Paulo Convention Center',
          venue_address: {
            street: 'Av. Brig. Faria Lima, 1000',
            city: 'São Paulo',
            state: 'SP',
            country: 'Brazil',
            zip: '01452-000',
          },
          total_capacity: 5000,
          sold_tickets: 0,
          age_rating: '18',
          is_free: false,
          registration_mode: 'both',
          cover_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&q=85&fit=crop',
          settings: {
            video_url: null,
            networking_enabled: true,
          },
        },
      ])
      .select()

    if (eventError) {
      console.error('Error creating event:', eventError)
      return
    }

    if (!event || event.length === 0) {
      console.error('No event returned after insert')
      return
    }

    const eventId = event[0].id
    console.log('✓ Event created:', eventId)

    // Criar tipos de ingressos
    const { data: ticketTypes, error: typesError } = await supabase
      .from('ticket_types')
      .insert([
        {
          event_id: eventId,
          name: 'Early Bird',
          description: 'Ingresso com preço especial para os primeiros compradores',
          color: '#d4ff00',
          sector: 'Geral',
          is_nominal: false,
          position: 1,
          is_active: true,
        },
        {
          event_id: eventId,
          name: 'VIP Pass',
          description: 'Acesso VIP com open bar e lounge premium',
          color: '#FF5A6B',
          sector: 'VIP',
          is_nominal: true,
          position: 2,
          is_active: true,
        },
        {
          event_id: eventId,
          name: 'Startup Pass',
          description: 'Desconto especial para startups e empreendedores',
          color: '#00D9FF',
          sector: 'Geral',
          is_nominal: false,
          position: 3,
          is_active: true,
        },
      ])
      .select()

    if (typesError) {
      console.error('Error creating ticket types:', typesError)
      return
    }

    if (!ticketTypes) {
      console.error('No ticket types returned')
      return
    }

    console.log('✓ Ticket types created:', ticketTypes.length)

    // Criar lotes de ingressos
    const batches = [
      {
        event_id: eventId,
        ticket_type_id: ticketTypes[0].id, // Early Bird
        name: 'Lote 1 - Early Bird',
        price: 99.90,
        quantity: 500,
        sold_count: 0,
        ends_at: '2025-04-15T23:59:59Z',
        position: 1,
        is_active: true,
      },
      {
        event_id: eventId,
        ticket_type_id: ticketTypes[0].id, // Early Bird
        name: 'Lote 2 - Early Bird',
        price: 149.90,
        quantity: 1000,
        sold_count: 0,
        ends_at: '2025-05-15T23:59:59Z',
        position: 2,
        is_active: true,
      },
      {
        event_id: eventId,
        ticket_type_id: ticketTypes[1].id, // VIP Pass
        name: 'VIP Pass',
        price: 499.90,
        quantity: 200,
        sold_count: 0,
        ends_at: '2025-06-01T23:59:59Z',
        position: 3,
        is_active: true,
      },
      {
        event_id: eventId,
        ticket_type_id: ticketTypes[2].id, // Startup Pass
        name: 'Startup Especial',
        price: 49.90,
        quantity: 300,
        sold_count: 0,
        ends_at: '2025-05-30T23:59:59Z',
        position: 4,
        is_active: true,
      },
    ]

    const { data: batchData, error: batchError } = await supabase
      .from('ticket_batches')
      .insert(batches)
      .select()

    if (batchError) {
      console.error('Error creating ticket batches:', batchError)
      return
    }

    console.log('✓ Ticket batches created:', batchData?.length)
    console.log('✅ Test event seed completed successfully!')
  } catch (error) {
    console.error('Unexpected error during seed:', error)
  }
}
