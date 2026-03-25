const DEMO_ORGANIZATION_ID = 'f0b5a5d8-6586-44cb-8e0e-6d0f8c7ea100'
const DEMO_EVENT_ID = '5d3cf80b-3dd2-4813-91e3-8d019bb3b210'
const DEMO_ORGANIZATION_SLUG = 'animalz-grand-experiences'
const DEMO_EVENT_SLUG = 'animalz-nocturne-sessions-2026'

type JsonRecord = Record<string, unknown>
type TableRow = Record<string, unknown>

interface DemoSeedParams {
  attachProfileId?: string | null
}

interface SeedCollection {
  organization: TableRow
  event: TableRow
  eventAssets: TableRow[]
  gates: TableRow[]
  ticketTypes: TableRow[]
  ticketBatches: TableRow[]
  orders: TableRow[]
  orderItems: TableRow[]
  payments: TableRow[]
  digitalTickets: TableRow[]
  transactionalMessages: TableRow[]
  checkins: TableRow[]
  staffMembers: TableRow[]
  timeEntries: TableRow[]
  suppliers: TableRow[]
  products: TableRow[]
  costEntries: TableRow[]
  eventPayouts: TableRow[]
  financialForecasts: TableRow[]
  eventFinancialClosures: TableRow[]
  eventHealthSnapshots: TableRow[]
  operationalAlerts: TableRow[]
  recommendationLogs: TableRow[]
  intelligenceAlertStates: TableRow[]
  customers: TableRow[]
  customerEventProfiles: TableRow[]
  audienceSegments: TableRow[]
  campaignDrafts: TableRow[]
  campaignRuns: TableRow[]
  campaignRunRecipients: TableRow[]
  audienceResolutionJobs: TableRow[]
  campaigns: TableRow[]
  auditLogs: TableRow[]
  internalNotifications: TableRow[]
  executiveDashboardSnapshots: TableRow[]
  summary: JsonRecord
}

interface TicketTypePlan {
  key: string
  id: string
  name: string
  description: string
  benefits: string[]
  sector: string
  color: string
  soldTarget: number
  isTransferable: boolean
  isNominal: boolean
  maxPerOrder: number
  vip: boolean
  basePrice: number
  batches: Array<{
    id: string
    name: string
    price: number
    quantity: number
    soldCount: number
    reservedCount: number
    startOffsetDays: number
    endOffsetDays: number
    position: number
  }>
}

interface CustomerAggregate {
  id: string
  fullName: string
  email: string
  phone: string
  document: string
  city: string
  state: string
  tags: string[]
  notes: string | null
  firstOrderAt: string | null
  lastOrderAt: string | null
  totalOrders: number
  totalSpent: number
  ticketsPurchased: number
  attendedCount: number
  noShowCount: number
  grossRevenue: number
  netRevenue: number
}

const DAY = 86_400_000

const demoImages = {
  cover:
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1800&q=80',
  gallery: [
    'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1800&q=80',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1800&q=80',
    'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1800&q=80',
    'https://images.unsplash.com/photo-1499364615650-ec38552f4f34?auto=format&fit=crop&w=1800&q=80',
  ],
  thumbnail:
    'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1600&q=80',
  heroVideo:
    'https://res.cloudinary.com/demo/video/upload/v1690371307/samples/sea-turtle.mp4',
  galleryVideo:
    'https://res.cloudinary.com/demo/video/upload/v1690371307/samples/cld-sample-video.mp4',
}

const cityMatrix = [
  { city: 'Sao Paulo', state: 'SP' },
  { city: 'Rio de Janeiro', state: 'RJ' },
  { city: 'Belo Horizonte', state: 'MG' },
  { city: 'Curitiba', state: 'PR' },
  { city: 'Porto Alegre', state: 'RS' },
  { city: 'Brasilia', state: 'DF' },
  { city: 'Goiania', state: 'GO' },
  { city: 'Campinas', state: 'SP' },
  { city: 'Recife', state: 'PE' },
  { city: 'Salvador', state: 'BA' },
  { city: 'Florianopolis', state: 'SC' },
  { city: 'Fortaleza', state: 'CE' },
]

const firstNames = [
  'Ana', 'Lucas', 'Marina', 'Joao', 'Sofia', 'Mateus', 'Julia', 'Bruno', 'Camila', 'Rafael',
  'Larissa', 'Caio', 'Helena', 'Thiago', 'Valentina', 'Pedro', 'Isabela', 'Enzo', 'Giovanna', 'Murilo',
  'Beatriz', 'Felipe', 'Alice', 'Diego', 'Livia', 'Gustavo', 'Nina', 'Eduardo', 'Bianca', 'Vicente',
]

const lastNames = [
  'Almeida', 'Barros', 'Cardoso', 'Dias', 'Esteves', 'Ferreira', 'Gomes', 'Henrique', 'Ibrahim', 'Junqueira',
  'Klein', 'Lacerda', 'Moraes', 'Nascimento', 'Oliveira', 'Pacheco', 'Queiroz', 'Ribeiro', 'Silva', 'Teixeira',
  'Uchoa', 'Vasconcelos', 'Werneck', 'Xavier', 'Yamamoto', 'Zanetti',
]

const staffDepartments: Array<{ department: string; area: string; role: string; count: number; dailyRate: number; gateKey?: string }> = [
  { department: 'Coordenacao geral', area: 'War room', role: 'Coordenador operacional', count: 8, dailyRate: 780 },
  { department: 'Producao', area: 'Backoffice', role: 'Produtor de pista', count: 26, dailyRate: 520 },
  { department: 'Credenciamento', area: 'Front of house', role: 'Agente de credenciamento', count: 20, dailyRate: 280, gateKey: 'main' },
  { department: 'Bilheteria', area: 'Front of house', role: 'Operador de bilheteria', count: 16, dailyRate: 290, gateKey: 'main' },
  { department: 'Check-in', area: 'Operacao de acesso', role: 'Scanner lead', count: 54, dailyRate: 260, gateKey: 'main' },
  { department: 'Seguranca', area: 'Perimetro', role: 'Agente de seguranca', count: 58, dailyRate: 300, gateKey: 'vip' },
  { department: 'Brigada', area: 'Safety', role: 'Brigadista', count: 12, dailyRate: 340 },
  { department: 'Limpeza', area: 'Venue care', role: 'Auxiliar de limpeza', count: 22, dailyRate: 210 },
  { department: 'Logistica', area: 'Doca', role: 'Assistente logistico', count: 14, dailyRate: 260, gateKey: 'service' },
  { department: 'Runners', area: 'Operacao interna', role: 'Runner', count: 10, dailyRate: 220 },
  { department: 'Bar', area: 'Bebidas', role: 'Bartender', count: 20, dailyRate: 250 },
  { department: 'Catering', area: 'Hospitality', role: 'Catering attendant', count: 12, dailyRate: 240 },
  { department: 'Backstage', area: 'Artist services', role: 'Backstage concierge', count: 8, dailyRate: 420, gateKey: 'backstage' },
  { department: 'Hospitality', area: 'VIP', role: 'Hospitality host', count: 8, dailyRate: 380, gateKey: 'hospitality' },
  { department: 'Caixa', area: 'PDV', role: 'Cashless operator', count: 6, dailyRate: 260 },
  { department: 'Operacao tecnica', area: 'FOH tech', role: 'Tecnico de palco', count: 4, dailyRate: 580 },
  { department: 'Audiovisual', area: 'Show control', role: 'Operador de video', count: 6, dailyRate: 600 },
  { department: 'Suporte ao cliente', area: 'CX', role: 'Guest experience analyst', count: 8, dailyRate: 260 },
  { department: 'Ambulancia', area: 'Saude', role: 'Socorrista', count: 6, dailyRate: 420 },
  { department: 'Supervisao de gate', area: 'Acesso', role: 'Gate supervisor', count: 6, dailyRate: 360, gateKey: 'main' },
]

const supplierSeeds = [
  ['Nebula Drinks', 'Bebidas', 184000, 'active', 'signed', 'Portfolio premium de destilados e mixers'],
  ['Maison Hospitality', 'Catering & Alimentacao', 226000, 'active', 'signed', 'Menu VIP e camarotes corporativos'],
  ['Alpha Shield Security', 'Seguranca', 312000, 'active', 'signed', 'Operacao de perimetro e backstage'],
  ['Pure Venue Services', 'Limpeza', 86000, 'active', 'signed', 'Turnos completos pre, live e pos-evento'],
  ['Aurora Visual Works', 'Video & Projecao', 174000, 'contracted', 'signed', 'Painel de LED, IMAG e conteudo'],
  ['Kinetic Structures', 'Palco & Estrutura', 498000, 'active', 'signed', 'Estrutura principal e lounges'],
  ['Pulse Staffing', 'Staff terceirizado', 142000, 'contracted', 'sent', 'Reforco de credenciamento e runners'],
  ['Vital Rescue', 'Ambulancia', 49000, 'active', 'signed', 'UTI movel e time medico'],
  ['Volt Prime Energy', 'Gerador de Energia', 128000, 'contracted', 'signed', 'Backup energetico dedicado'],
  ['Velvet Furnishing', 'Mobiliario', 96000, 'active', 'signed', 'Hospitality, camarotes e FOH'],
  ['Nocturne Decor Lab', 'Decoracao & Cenografia', 117000, 'active', 'signed', 'Editorial look and feel da edicao'],
  ['Access Flow Systems', 'Credenciamento', 56000, 'active', 'signed', 'Pulseiras RFID e totems premium'],
]

const productCatalog = [
  ['Heineken Long Neck 330ml', 'bar', 24, 9.8, 820, 'Cervejas premium de pista'],
  ['Corona Extra 330ml', 'bar', 28, 11.2, 640, 'Cervejas premium de pista'],
  ['Chope Pilsen 400ml', 'bar', 22, 7.6, 1400, 'Chope de alta rotatividade'],
  ['Chope IPA 400ml', 'bar', 26, 8.9, 860, 'Chope artesanal linha especial'],
  ['Vodka Tonica Signature', 'bar', 42, 17.6, 560, 'Drink pronto com garnish'],
  ['Gin Tonica Botanical', 'bar', 44, 18.1, 510, 'Drink premium gin + tonic'],
  ['Whisky Cola Reserve', 'bar', 48, 21.7, 430, 'Whisky blended e mixer premium'],
  ['Rum Citrus Highball', 'bar', 39, 15.4, 340, 'Highball refresh'],
  ['Tequila Sunrise', 'bar', 46, 19.2, 280, 'Cocktail hero do rooftop'],
  ['Espumante Brut Taca', 'bar', 38, 15.3, 370, 'Espumante por taca'],
  ['Champagne Bottle Service', 'vip', 690, 402, 48, 'Bottle service hospitality'],
  ['Energético 250ml', 'bar', 18, 7.1, 920, 'Single can energy'],
  ['Agua sem gas 500ml', 'bar', 9, 2.4, 1800, 'Hidratacao geral'],
  ['Agua com gas 500ml', 'bar', 10, 2.7, 820, 'Hidratacao premium'],
  ['Tonica Premium 220ml', 'bar', 14, 4.8, 610, 'Mixer para bares satelite'],
  ['Refrigerante Lata 350ml', 'bar', 12, 3.7, 960, 'Soft drinks variados'],
  ['Suco Verde Fresh', 'food', 19, 7.5, 150, 'Cold pressed hospitality'],
  ['Burger Angus Prime', 'food', 38, 15.2, 520, 'Burger assinatura do evento'],
  ['Hot Dog Gourmet Trufado', 'food', 32, 11.4, 360, 'Hot dog premium com crispy onions'],
  ['Pizza Slice Pepperoni', 'food', 26, 8.2, 430, 'Slice rapido de pista'],
  ['Wrap de Frango Caesar', 'food', 27, 9.4, 260, 'Opcao leve premium'],
  ['Salada Burrata Garden', 'food', 36, 14.1, 120, 'Camarote e backstage'],
  ['Pasta Pomodoro Artisan', 'food', 42, 16.9, 90, 'Hospitality lounge'],
  ['Churrasco Sandwich Fire', 'food', 34, 12.6, 210, 'Grill station'],
  ['Bowl Veggie Protein', 'food', 31, 10.8, 140, 'Opcao wellness'],
  ['Brownie Double Chocolate', 'food', 16, 5.1, 320, 'Sobremesa de alta saida'],
  ['Cafeteria Espresso', 'food', 11, 2.3, 420, 'Cafe premium'],
  ['Croissant Butter Bakery', 'food', 14, 4.7, 180, 'Breakfast hospitality'],
  ['Fruit Cup Seasonal', 'food', 18, 6.1, 160, 'Hospitality breakfast'],
  ['Snack Mix Nuts', 'food', 15, 4.4, 280, 'Conveniencia camarote'],
  ['VIP Sushi Selection', 'vip', 74, 30.2, 110, 'Menu hospitality assinatura'],
  ['Hospitality Table Styling', 'service', 980, 520, 18, 'Ambientacao adicional para mesas'],
  ['Backstage Amenity Kit', 'vip', 260, 128, 24, 'Kit exclusivo para convidados'],
  ['Merch Tee Nocturne Black', 'merch', 90, 32, 160, 'Camiseta oficial limited'],
  ['Merch Cap Reflective', 'merch', 72, 24, 110, 'Bone oficial'],
  ['Merch Poster Signed', 'merch', 140, 41, 42, 'Poster edicao colecionavel'],
  ['Ice Premium Sack 10kg', 'service', 34, 12, 95, 'Reposicao operacional do bar'],
  ['Mixer Citrus Pack', 'service', 76, 33, 58, 'Pack de mixers para bares'],
  ['Vodka Bottle Grey Goose', 'vip', 640, 380, 22, 'Bottle service VIP'],
  ['Gin Bottle Tanqueray No.10', 'vip', 580, 332, 20, 'Bottle service VIP'],
  ['Whisky Bottle Black Label', 'vip', 620, 355, 24, 'Bottle service VIP'],
  ['Combo Friends 4 Drinks', 'bar', 148, 58, 120, 'Combo acelerador de fila'],
  ['Combo Hospitality Wine Pairing', 'vip', 420, 214, 16, 'Experiencia harmonizada'],
  ['Mocktail Botanical Zero', 'bar', 28, 9.2, 140, 'Drink zero alcool'],
]

function hashSegment(input: string, salt: number) {
  let hash = 2166136261 ^ salt

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return (hash >>> 0).toString(16).padStart(8, '0')
}

function stableUuid(input: string) {
  const a = hashSegment(input, 0)
  const b = hashSegment(input, 1)
  const c = hashSegment(input, 2)
  const d = hashSegment(input, 3)
  return `${a}-${b.slice(0, 4)}-${b.slice(4, 8)}-${c.slice(0, 4)}-${c.slice(4, 8)}${d}`
}

function roundCurrency(value: number) {
  return Number(value.toFixed(2))
}

function isoFromNow(daysOffset: number, hour = 12, minute = 0) {
  const date = new Date(Date.now() + daysOffset * DAY)
  date.setUTCHours(hour + 3, minute, 0, 0)
  return date.toISOString()
}

function phoneFor(index: number) {
  return `+55 11 9${String(1000_0000 + index).slice(-8)}`
}

function cpfFor(index: number) {
  return String(100_000_000 + index).padStart(11, '0')
}

function pick<T>(items: T[], index: number) {
  return items[index % items.length]
}

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = []

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size))
  }

  return chunks
}

function shuffleDeterministic<T>(items: T[]) {
  const output = [...items]

  for (let index = output.length - 1; index > 0; index -= 1) {
    const target = Number.parseInt(hashSegment(`shuffle-${index}`, index % 11), 16) % (index + 1)
    const current = output[index]
    output[index] = output[target]
    output[target] = current
  }

  return output
}

function buildTicketTypePlans() {
  const planSeeds = [
    {
      key: 'arena',
      name: 'Arena',
      description: 'Acesso geral com energia total de pista e ativações centrais.',
      benefits: ['Pista principal', 'Praça gastronômica', 'Instalações imersivas'],
      sector: 'Arena',
      color: '#D4FF00',
      soldTarget: 3400,
      isTransferable: true,
      isNominal: false,
      maxPerOrder: 6,
      vip: false,
      prices: [180, 220, 260, 320, 380],
      quantities: [900, 1000, 1000, 1100, 1200],
      soldCounts: [900, 980, 940, 360, 220],
      reservedCounts: [16, 24, 36, 48, 54],
    },
    {
      key: 'frontstage',
      name: 'Frontstage',
      description: 'Acesso com proximidade máxima do palco e bares dedicados.',
      benefits: ['Acesso frontal', 'Bar dedicado', 'Banheiros premium'],
      sector: 'Frontstage',
      color: '#57B8FF',
      soldTarget: 1700,
      isTransferable: true,
      isNominal: true,
      maxPerOrder: 4,
      vip: true,
      prices: [420, 490, 560, 640, 710],
      quantities: [280, 360, 420, 460, 500],
      soldCounts: [280, 350, 410, 390, 270],
      reservedCounts: [8, 10, 14, 18, 24],
    },
    {
      key: 'vip-lounge',
      name: 'VIP Lounge',
      description: 'Lounge com open snacks, mixologia assinada e concierge dedicado.',
      benefits: ['Lounge premium', 'Open snacks', 'Acesso lateral rapido'],
      sector: 'VIP Lounge',
      color: '#FFC857',
      soldTarget: 1100,
      isTransferable: false,
      isNominal: true,
      maxPerOrder: 4,
      vip: true,
      prices: [780, 920, 1060, 1240, 1420],
      quantities: [120, 180, 240, 320, 360],
      soldCounts: [120, 175, 235, 300, 270],
      reservedCounts: [4, 6, 10, 12, 18],
    },
    {
      key: 'backstage',
      name: 'Backstage Experience',
      description: 'Experiencia backstage com hostess dedicada e viewing deck.',
      benefits: ['Backstage access', 'Guest host', 'Viewing deck'],
      sector: 'Backstage',
      color: '#F76E6E',
      soldTarget: 500,
      isTransferable: false,
      isNominal: true,
      maxPerOrder: 2,
      vip: true,
      prices: [1680, 1820, 1960, 2180, 2420],
      quantities: [50, 90, 100, 120, 150],
      soldCounts: [48, 84, 96, 132, 140],
      reservedCounts: [2, 4, 4, 6, 8],
    },
    {
      key: 'hospitality',
      name: 'Hospitality Table',
      description: 'Mesas corporativas e hospitalidade com atendimento dedicado.',
      benefits: ['Mesa reservada', 'Bottle service', 'Host dedicado'],
      sector: 'Hospitality',
      color: '#9E7CFF',
      soldTarget: 300,
      isTransferable: false,
      isNominal: true,
      maxPerOrder: 12,
      vip: true,
      prices: [4200, 4600, 5100, 5600, 6200],
      quantities: [10, 14, 16, 18, 24],
      soldCounts: [10, 14, 16, 18, 18],
      reservedCounts: [0, 1, 1, 2, 2],
    },
  ]

  return planSeeds.map((seed, seedIndex) => {
    const id = stableUuid(`ticket-type-${seed.key}`)
    return {
      key: seed.key,
      id,
      name: seed.name,
      description: seed.description,
      benefits: seed.benefits,
      sector: seed.sector,
      color: seed.color,
      soldTarget: seed.soldTarget,
      isTransferable: seed.isTransferable,
      isNominal: seed.isNominal,
      maxPerOrder: seed.maxPerOrder,
      vip: seed.vip,
      basePrice: seed.prices[0],
      batches: seed.prices.map((price, batchIndex) => ({
        id: stableUuid(`ticket-batch-${seed.key}-${batchIndex + 1}`),
        name: ['Early Bird', 'First Release', 'Second Release', 'Final Release', 'Last Call'][batchIndex],
        price,
        quantity: seed.quantities[batchIndex],
        soldCount: seed.soldCounts[batchIndex],
        reservedCount: seed.reservedCounts[batchIndex],
        startOffsetDays: -84 + batchIndex * 14 + seedIndex,
        endOffsetDays: -70 + batchIndex * 14 + seedIndex,
        position: batchIndex,
      })),
    } satisfies TicketTypePlan
  })
}

function buildCustomerBase() {
  const customers: CustomerAggregate[] = []

  for (let index = 0; index < 2400; index += 1) {
    const firstName = pick(firstNames, index)
    const lastName = `${pick(lastNames, index * 2)} ${pick(lastNames, index * 5 + 3)}`
    const city = pick(cityMatrix, index)
    customers.push({
      id: stableUuid(`customer-${index}`),
      fullName: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/\s+/g, '.')}.${index}@demo.animalz.events`,
      phone: phoneFor(index),
      document: cpfFor(index),
      city: city.city,
      state: city.state,
      tags: [],
      notes: null,
      firstOrderAt: null,
      lastOrderAt: null,
      totalOrders: 0,
      totalSpent: 0,
      ticketsPurchased: 0,
      attendedCount: 0,
      noShowCount: 0,
      grossRevenue: 0,
      netRevenue: 0,
    })
  }

  return customers
}

function batchCategory(productName: string) {
  if (productName.includes('VIP') || productName.includes('Bottle') || productName.includes('Hospitality')) {
    return 'vip'
  }
  if (productName.includes('Merch')) {
    return 'merch'
  }
  return 'service'
}

export function buildDemoSeedData(params: DemoSeedParams = {}): SeedCollection {
  const now = new Date()
  const attachProfileId = params.attachProfileId ?? null
  const ticketPlans = buildTicketTypePlans()
  const customers = buildCustomerBase()
  const customerById = new Map(customers.map((customer) => [customer.id, customer]))

  const organization = {
    id: DEMO_ORGANIZATION_ID,
    name: 'Animalz Grand Experiences',
    slug: DEMO_ORGANIZATION_SLUG,
    document: '12.345.678/0001-99',
    email: 'concierge@animalzgrand.experiences',
    phone: '+55 11 4000-2026',
    logo_url: 'https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=600&q=80',
    cover_url: demoImages.cover,
    plan: 'enterprise',
    is_active: true,
    updated_at: now.toISOString(),
  }

  const gates = [
    ['main', 'Entrada Principal', true, false, 'active', 12, 1800, 'Corredor com 12 lanes e controle RFID'],
    ['vip', 'Entrada VIP', true, false, 'warning', 4, 420, 'Equipe premium com atendimento prioritario'],
    ['backstage', 'Entrada Backstage', true, false, 'active', 2, 120, 'Controle nominal e lista quente'],
    ['hospitality', 'Entrada Hospitality', true, false, 'active', 3, 220, 'Mesa corporativa e camarotes'],
    ['exit', 'Saida Operacional', false, true, 'active', 4, 900, 'Fluxo de dispersao controlada'],
    ['service', 'Servico / Staff', true, true, 'active', 3, 320, 'Acesso de doca, staff e fornecedores'],
  ].map(([key, name, isEntrance, isExit, status, deviceCount, throughputTarget, description], index) => ({
    id: stableUuid(`gate-${key}`),
    organization_id: DEMO_ORGANIZATION_ID,
    event_id: DEMO_EVENT_ID,
    name,
    description,
    is_entrance: isEntrance,
    is_exit: isExit,
    is_active: true,
    device_count: deviceCount,
    status,
    throughput_target: throughputTarget,
    notes: index === 1 ? 'Gate VIP com sensor de fila mostrando saturacao entre 20h e 21h.' : null,
  }))
  const gateByKey = new Map(gates.map((gate, index) => [['main', 'vip', 'backstage', 'hospitality', 'exit', 'service'][index], gate]))
  const gateFallbackIds = gates.map((gate) => String(gate.id))

  const eventSettings = {
    mood: 'editorial-night-festival',
    city: 'Sao Paulo',
    state: 'SP',
    video_url: demoImages.heroVideo,
    hero_video_url: demoImages.heroVideo,
    show_remaining_tickets: true,
    highlight_badges: ['Festival urbano premium', '10.000 pessoas', 'Experiencia cashless + command center'],
    public_visibility: 'public',
  }

  const event = {
    id: DEMO_EVENT_ID,
    organization_id: DEMO_ORGANIZATION_ID,
    name: 'Animalz Nocturne Sessions 2026',
    slug: DEMO_EVENT_SLUG,
    subtitle: 'Uma experiencia urbana premium com musica, gastronomia, hospitalidade e operacao em escala.',
    short_description:
      'Um megaevento urbano de alta energia que combina show principal, arte imersiva, lounges premium, gastronomia curada e uma operacao enterprise pensada para milhares de convidados.',
    full_description:
      'Nocturne Sessions e o flagship demo da Animalz Grand Experiences: um festival de alto padrao desenhado para demonstrar vendas, hospitalidade, CRM, campanhas, command center, financeiro e intelligence funcionando de forma integrada em um unico sistema.',
    category: 'Festival premium',
    starts_at: isoFromNow(178, 19, 0),
    ends_at: isoFromNow(179, 6, 0),
    doors_open_at: isoFromNow(178, 17, 30),
    venue_name: 'Distrito Anhembi Hall',
    venue_address: {
      street: 'Av. Olavo Fontoura, 1209',
      district: 'Santana',
      city: 'Sao Paulo',
      state: 'SP',
      zip_code: '02012-021',
      country: 'Brasil',
    },
    total_capacity: 10000,
    sold_tickets: 7000,
    checked_in_count: 4318,
    age_rating: '18',
    logo_url: organization.logo_url,
    cover_url: demoImages.cover,
    status: 'published',
    published_at: now.toISOString(),
    settings: eventSettings,
    is_free: false,
    registration_mode: 'tickets',
    updated_at: now.toISOString(),
  }

  const eventAssets = [
    {
      id: stableUuid('event-asset-cover'),
      organization_id: DEMO_ORGANIZATION_ID,
      event_id: DEMO_EVENT_ID,
      asset_type: 'image',
      usage_type: 'cover',
      provider: 'url',
      provider_asset_id: 'cover-editorial-nocturne',
      url: demoImages.cover,
      secure_url: demoImages.cover,
      thumbnail_url: demoImages.cover,
      width: 1800,
      height: 1200,
      duration: null,
      mime_type: 'image/jpeg',
      alt_text: 'Vista premium do palco principal com publico e lasers',
      caption: 'Capa principal da landing editorial do evento',
      sort_order: 0,
      is_active: true,
      created_by: attachProfileId,
    },
    {
      id: stableUuid('event-asset-hero-video'),
      organization_id: DEMO_ORGANIZATION_ID,
      event_id: DEMO_EVENT_ID,
      asset_type: 'video',
      usage_type: 'hero',
      provider: 'url',
      provider_asset_id: 'hero-nocturne-video',
      url: demoImages.heroVideo,
      secure_url: demoImages.heroVideo,
      thumbnail_url: demoImages.thumbnail,
      width: 1920,
      height: 1080,
      duration: 45,
      mime_type: 'video/mp4',
      alt_text: 'Hero video com crowd premium e atmosfera neon',
      caption: 'Hero video do flagship demo',
      sort_order: 1,
      is_active: true,
      created_by: attachProfileId,
    },
    {
      id: stableUuid('event-asset-hero-thumb'),
      organization_id: DEMO_ORGANIZATION_ID,
      event_id: DEMO_EVENT_ID,
      asset_type: 'image',
      usage_type: 'thumbnail',
      provider: 'url',
      provider_asset_id: 'hero-thumb-nocturne',
      url: demoImages.thumbnail,
      secure_url: demoImages.thumbnail,
      thumbnail_url: demoImages.thumbnail,
      width: 1600,
      height: 900,
      duration: null,
      mime_type: 'image/jpeg',
      alt_text: 'Thumbnail do hero video do evento demo',
      caption: 'Preview do video principal',
      sort_order: 2,
      is_active: true,
      created_by: attachProfileId,
    },
    ...demoImages.gallery.map((imageUrl, index) => ({
      id: stableUuid(`event-asset-gallery-image-${index}`),
      organization_id: DEMO_ORGANIZATION_ID,
      event_id: DEMO_EVENT_ID,
      asset_type: 'image',
      usage_type: 'gallery',
      provider: 'url',
      provider_asset_id: `gallery-image-${index}`,
      url: imageUrl,
      secure_url: imageUrl,
      thumbnail_url: imageUrl,
      width: 1800,
      height: 1200,
      duration: null,
      mime_type: 'image/jpeg',
      alt_text: `Galeria premium ${index + 1} do festival demo`,
      caption: [
        'Main stage com visual editorial de alto impacto',
        'Hospitality lounge e circulacao premium',
        'Crowd energy no pico do headline show',
        'Area de experiencias e ativacoes da marca',
      ][index],
      sort_order: 3 + index,
      is_active: true,
      created_by: attachProfileId,
    })),
    {
      id: stableUuid('event-asset-gallery-video'),
      organization_id: DEMO_ORGANIZATION_ID,
      event_id: DEMO_EVENT_ID,
      asset_type: 'video',
      usage_type: 'gallery',
      provider: 'url',
      provider_asset_id: 'gallery-video-nocturne',
      url: demoImages.galleryVideo,
      secure_url: demoImages.galleryVideo,
      thumbnail_url: demoImages.thumbnail,
      width: 1920,
      height: 1080,
      duration: 32,
      mime_type: 'video/mp4',
      alt_text: 'Clip de atmosfera premium da experience area',
      caption: 'Momento de atmosfera premium para a galeria publica',
      sort_order: 8,
      is_active: true,
      created_by: attachProfileId,
    },
  ]

  const ticketTypes = ticketPlans.map((plan, index) => ({
    id: plan.id,
    event_id: DEMO_EVENT_ID,
    organization_id: DEMO_ORGANIZATION_ID,
    name: plan.name,
    description: plan.description,
    benefits: plan.benefits,
    sector: plan.sector,
    color: plan.color,
    is_transferable: plan.isTransferable,
    is_nominal: plan.isNominal,
    max_per_order: plan.maxPerOrder,
    is_active: true,
    currency: 'BRL',
    position: index,
  }))

  const ticketBatches = ticketPlans.flatMap((plan) =>
    plan.batches.map((batch) => ({
      id: batch.id,
      ticket_type_id: plan.id,
      event_id: DEMO_EVENT_ID,
      name: batch.name,
      price: batch.price,
      quantity: batch.quantity,
      sold_count: batch.soldCount,
      reserved_count: batch.reservedCount,
      starts_at: isoFromNow(batch.startOffsetDays, 15, 0),
      ends_at: isoFromNow(batch.endOffsetDays, 23, 59),
      is_active: batch.name === 'Last Call',
      is_visible: true,
      max_per_order: plan.maxPerOrder,
      auto_open_next: true,
      position: batch.position,
    })),
  )

  const batchInventory = ticketPlans.map((plan) => ({
    ...plan,
    remaining: plan.soldTarget,
    batches: plan.batches.map((batch) => ({ ...batch, remaining: batch.soldCount })),
  }))

  const orders: TableRow[] = []
  const orderItems: TableRow[] = []
  const payments: TableRow[] = []
  const digitalTickets: TableRow[] = []
  const transactionalMessages: TableRow[] = []

  let soldTickets = 0
  let orderIndex = 0

  while (soldTickets < 7000) {
    const candidateTypes = batchInventory.filter((plan) => plan.remaining > 0)
    const typePlan = candidateTypes[orderIndex % candidateTypes.length]
    const batchPlan = typePlan.batches.find((batch) => batch.remaining > 0) ?? typePlan.batches[typePlan.batches.length - 1]
    const buyer = customers[(orderIndex * 7) % customers.length]
    const rawQuantity =
      typePlan.key === 'hospitality'
        ? 8
        : typePlan.key === 'backstage'
          ? 1
          : [1, 2, 2, 3, 2, 1, 4][orderIndex % 7]
    const quantity = Math.min(rawQuantity, typePlan.maxPerOrder, typePlan.remaining, batchPlan.remaining, 7000 - soldTickets)
    const gross = roundCurrency(batchPlan.price * quantity)
    const discountRate = orderIndex % 13 === 0 ? 0.08 : orderIndex % 7 === 0 ? 0.05 : 0
    const discountAmount = roundCurrency(gross * discountRate)
    const subtotal = roundCurrency(gross - discountAmount)
    const feeAmount = roundCurrency(subtotal * (typePlan.key === 'hospitality' ? 0.03 : 0.12))
    const totalAmount = roundCurrency(subtotal + feeAmount)
    const orderCreatedAt = isoFromNow(-82 + (orderIndex % 67), 10 + (orderIndex % 9), (orderIndex * 7) % 60)
    const orderId = stableUuid(`order-success-${orderIndex}`)
    const orderItemId = stableUuid(`order-item-success-${orderIndex}`)
    const isRefunded = orderIndex % 89 === 0 && typePlan.key !== 'hospitality' && orderIndex > 40
    const sourceChannel = pick(['site', 'campaign', 'concierge', 'corporate', 'vip_host'], orderIndex)
    const paymentMethod = typePlan.key === 'hospitality'
      ? 'corporate_invoice'
      : pick(['pix', 'card_1x', 'card_3x', 'card_6x', 'card_12x'], orderIndex)

    orders.push({
      id: orderId,
      event_id: DEMO_EVENT_ID,
      organization_id: DEMO_ORGANIZATION_ID,
      buyer_name: buyer.fullName,
      buyer_email: buyer.email,
      buyer_phone: buyer.phone,
      buyer_cpf: buyer.document,
      subtotal,
      discount_amount: discountAmount,
      fee_amount: feeAmount,
      total_amount: totalAmount,
      status: isRefunded ? 'refunded' : 'paid',
      payment_method: paymentMethod,
      source_channel: sourceChannel,
      confirmed_at: orderCreatedAt,
      paid_at: isRefunded ? null : orderCreatedAt,
      cancelled_at: isRefunded ? isoFromNow(-10 + (orderIndex % 8), 13, 20) : null,
      notes: sourceChannel === 'corporate' ? 'Conta corporativa integrada ao hospitality desk.' : null,
      customer_id: buyer.id,
      stripe_payment_intent: paymentMethod.startsWith('card_') ? `pi_demo_${orderIndex}` : null,
      metadata: {
        demo: true,
        acquisition_stage: orderIndex < 700 ? 'launch' : orderIndex < 1800 ? 'growth' : 'last_call',
      },
      created_at: orderCreatedAt,
      updated_at: orderCreatedAt,
    })

    orderItems.push({
      id: orderItemId,
      order_id: orderId,
      event_id: DEMO_EVENT_ID,
      ticket_type_id: typePlan.id,
      batch_id: batchPlan.id,
      holder_name: buyer.fullName,
      holder_email: buyer.email,
      holder_cpf: buyer.document,
      unit_price: batchPlan.price,
      quantity,
      subtotal,
      discount_amount: discountAmount,
      fee_amount: feeAmount,
      total_amount: totalAmount,
      total_price: totalAmount,
      created_at: orderCreatedAt,
      updated_at: orderCreatedAt,
    })

    payments.push({
      id: stableUuid(`payment-success-${orderIndex}`),
      order_id: orderId,
      organization_id: DEMO_ORGANIZATION_ID,
      event_id: DEMO_EVENT_ID,
      provider: paymentMethod === 'pix' ? 'pix' : 'stripe',
      payment_intent_id: paymentMethod.startsWith('card_') ? `pi_demo_${orderIndex}` : null,
      charge_id: paymentMethod.startsWith('card_') ? `ch_demo_${orderIndex}` : null,
      status: isRefunded ? 'refunded' : 'paid',
      amount: totalAmount,
      currency: 'BRL',
      metadata: { source_channel: sourceChannel, demo: true },
      paid_at: orderCreatedAt,
      refunded_at: isRefunded ? isoFromNow(-6 + (orderIndex % 5), 12, 0) : null,
      created_at: orderCreatedAt,
      updated_at: orderCreatedAt,
    })

    transactionalMessages.push({
      id: stableUuid(`message-success-${orderIndex}`),
      order_id: orderId,
      event_id: DEMO_EVENT_ID,
      channel: 'email',
      template_key: isRefunded ? 'ticket-refund-notice' : 'ticket-confirmation',
      provider: 'resend',
      provider_message_id: `msg_demo_${orderIndex}`,
      recipient: buyer.email,
      status: 'sent',
      metadata: { demo: true, source_channel: sourceChannel },
      sent_at: orderCreatedAt,
      created_at: orderCreatedAt,
    })

    for (let ticketPosition = 0; ticketPosition < quantity; ticketPosition += 1) {
      const ticketId = stableUuid(`digital-ticket-success-${orderIndex}-${ticketPosition}`)
      const ticketNumber = `ANZ-${String(orderIndex + 1).padStart(4, '0')}-${String(ticketPosition + 1).padStart(2, '0')}`
      digitalTickets.push({
        id: ticketId,
        order_id: orderId,
        order_item_id: orderItemId,
        ticket_type_id: typePlan.id,
        batch_id: batchPlan.id,
        event_id: DEMO_EVENT_ID,
        ticket_number: ticketNumber,
        qr_token: `QR-${ticketNumber}`,
        holder_name: quantity > 1 && ticketPosition > 0 ? `${buyer.fullName} +${ticketPosition}` : buyer.fullName,
        holder_email: buyer.email,
        holder_cpf: buyer.document,
        status: isRefunded ? 'refunded' : 'confirmed',
        is_vip: typePlan.vip,
        checked_in_at: null,
        checked_out_at: null,
        transferred_to_name: null,
        transferred_to_email: null,
        transfer_requested_at: null,
        email_sent_at: orderCreatedAt,
        created_at: orderCreatedAt,
        updated_at: orderCreatedAt,
      })
    }

    buyer.totalOrders += 1
    if (!isRefunded) {
      buyer.totalSpent = roundCurrency(buyer.totalSpent + totalAmount)
      buyer.grossRevenue = roundCurrency(buyer.grossRevenue + subtotal)
      buyer.netRevenue = roundCurrency(buyer.netRevenue + totalAmount)
      buyer.ticketsPurchased += quantity
    }
    buyer.firstOrderAt = buyer.firstOrderAt ?? orderCreatedAt
    buyer.lastOrderAt = orderCreatedAt
    typePlan.remaining -= quantity
    batchPlan.remaining -= quantity
    soldTickets += quantity
    orderIndex += 1
  }

  for (let failedIndex = 0; failedIndex < 140; failedIndex += 1) {
    const buyer = customers[(failedIndex * 11 + 5) % customers.length]
    const createdAt = isoFromNow(-34 + (failedIndex % 20), 16, (failedIndex * 13) % 60)
    const failedTotal = roundCurrency(220 + (failedIndex % 6) * 47.5)
    const failedStatus = failedIndex % 5 === 0 ? 'pending' : failedIndex % 7 === 0 ? 'expired' : 'failed'
    const orderId = stableUuid(`order-failed-${failedIndex}`)

    orders.push({
      id: orderId,
      event_id: DEMO_EVENT_ID,
      organization_id: DEMO_ORGANIZATION_ID,
      buyer_name: buyer.fullName,
      buyer_email: buyer.email,
      buyer_phone: buyer.phone,
      buyer_cpf: buyer.document,
      subtotal: failedTotal,
      discount_amount: 0,
      fee_amount: roundCurrency(failedTotal * 0.1),
      total_amount: roundCurrency(failedTotal * 1.1),
      status: failedStatus,
      payment_method: pick(['pix', 'card_1x', 'card_3x'], failedIndex),
      source_channel: pick(['site', 'campaign', 'retargeting'], failedIndex),
      expires_at: failedStatus === 'pending' || failedStatus === 'expired' ? isoFromNow(-2 + (failedIndex % 3), 18, 0) : null,
      notes: failedStatus === 'failed' ? 'Tentativa recusada pelo emissor' : 'Reserva demo sem conversao final',
      customer_id: buyer.id,
      metadata: { demo: true, abandoned: true },
      created_at: createdAt,
      updated_at: createdAt,
    })

    payments.push({
      id: stableUuid(`payment-failed-${failedIndex}`),
      order_id: orderId,
      organization_id: DEMO_ORGANIZATION_ID,
      event_id: DEMO_EVENT_ID,
      provider: 'stripe',
      payment_intent_id: `pi_failed_${failedIndex}`,
      charge_id: null,
      status: failedStatus === 'pending' ? 'pending' : 'failed',
      amount: roundCurrency(failedTotal * 1.1),
      currency: 'BRL',
      metadata: { demo: true, abandoned: true },
      paid_at: null,
      failed_at: failedStatus === 'failed' ? createdAt : null,
      created_at: createdAt,
      updated_at: createdAt,
    })
  }

  const successfulTickets = digitalTickets.filter((ticket) => ticket.status === 'confirmed')
  const usedTicketIds = new Set<string>()
  const checkins: TableRow[] = []
  const usedTicketsTarget = 4318
  const reentryTarget = 126
  const invalidAttemptsTarget = 46

  for (let index = 0; index < successfulTickets.length && usedTicketIds.size < usedTicketsTarget; index += 1) {
    const ticket = successfulTickets[index]
    const gate = gates[index % 4]
    const checkedInAt = isoFromNow(177, 18 + (index % 5), index % 60)
    ticket.status = 'used'
    ticket.checked_in_at = checkedInAt
    ticket.updated_at = checkedInAt
    usedTicketIds.add(String(ticket.id))

    checkins.push({
      id: stableUuid(`checkin-success-${index}`),
      event_id: DEMO_EVENT_ID,
      digital_ticket_id: ticket.id,
      gate_id: gate.id,
      operator_id: attachProfileId,
      device_id: `scanner-${(index % 12) + 1}`,
      reason_code: 'ticket_valid',
      was_offline: index % 29 === 0,
      notes: null,
      metadata: { demo: true, lane: (index % 6) + 1 },
      result: 'success',
      checked_in_at: checkedInAt,
      is_exit: false,
    })

    const buyer = customerById.get(String((orders.find((order) => order.id === ticket.order_id) as TableRow | undefined)?.customer_id ?? ''))
    if (buyer) {
      buyer.attendedCount += 1
    }
  }

  const usedTicketList = successfulTickets.filter((ticket) => usedTicketIds.has(String(ticket.id)))

  for (let index = 0; index < reentryTarget; index += 1) {
    const ticket = usedTicketList[index]
    const gate = gates[(index % 2) + 4]
    const exitAt = isoFromNow(177, 22, index % 60)
    const reenterAt = isoFromNow(177, 22, (index % 60) + 8)

    checkins.push(
      {
        id: stableUuid(`checkin-exit-${index}`),
        event_id: DEMO_EVENT_ID,
        digital_ticket_id: ticket.id,
        gate_id: gate.id,
        operator_id: attachProfileId,
        device_id: `scanner-exit-${(index % 4) + 1}`,
        reason_code: 'ticket_valid',
        was_offline: false,
        notes: 'Saida temporaria liberada',
        metadata: { demo: true, flow: 'exit' },
        result: 'success',
        checked_in_at: exitAt,
        is_exit: true,
      },
      {
        id: stableUuid(`checkin-reentry-${index}`),
        event_id: DEMO_EVENT_ID,
        digital_ticket_id: ticket.id,
        gate_id: gates[index % 2].id,
        operator_id: attachProfileId,
        device_id: `scanner-reentry-${(index % 3) + 1}`,
        reason_code: 'reentry_allowed',
        was_offline: false,
        notes: 'Reentrada validada pelo command center',
        metadata: { demo: true, flow: 'reentry' },
        result: 'success',
        checked_in_at: reenterAt,
        is_exit: false,
      },
    )
  }

  for (let index = 0; index < invalidAttemptsTarget; index += 1) {
    checkins.push({
      id: stableUuid(`checkin-invalid-${index}`),
      event_id: DEMO_EVENT_ID,
      digital_ticket_id: index % 3 === 0 ? usedTicketList[index]?.id ?? null : null,
      gate_id: gates[index % 3].id,
      operator_id: attachProfileId,
      device_id: `scanner-invalid-${(index % 5) + 1}`,
      reason_code: pick(['already_checked_in', 'ticket_not_found', 'ticket_blocked', 'duplicate_exit'], index),
      was_offline: false,
      notes: 'Tentativa invalida registrada para o demo',
      metadata: { demo: true, lane: (index % 4) + 1 },
      result: pick(['invalid', 'blocked', 'already_used'], index),
      checked_in_at: isoFromNow(177, 19 + (index % 4), (index * 9) % 60),
      is_exit: index % 4 === 0,
    })
  }

  for (const customer of customers) {
    customer.noShowCount = Math.max(customer.ticketsPurchased - customer.attendedCount, 0)
    const baseTags = new Set<string>()
    if (customer.totalSpent >= 1800) {
      baseTags.add('high-spender')
    }
    if (customer.attendedCount > 0 && customer.totalOrders > 1) {
      baseTags.add('repeat-customer')
    }
    if (customer.noShowCount > 0) {
      baseTags.add('no-show')
    }
    if (customer.ticketsPurchased > 0 && customer.totalSpent / Math.max(customer.ticketsPurchased, 1) >= 700) {
      baseTags.add('vip-buyer')
    }
    if (customer.totalOrders >= 3) {
      baseTags.add('loyal')
    }
    customer.tags = Array.from(baseTags)
    if (customer.tags.includes('high-spender')) {
      customer.notes = 'Cliente com alto potencial para hospitality e early access.'
    } else if (customer.tags.includes('no-show')) {
      customer.notes = 'Historico pede campanha de reengajamento e incentivos.'
    } else {
      customer.notes = 'Perfil demo gerado para validacao comercial do produto.'
    }
  }

  const customersRows = customers
    .filter((customer) => customer.totalOrders > 0)
    .map((customer) => ({
      id: customer.id,
      organization_id: DEMO_ORGANIZATION_ID,
      full_name: customer.fullName,
      email: customer.email,
      phone: customer.phone,
      document: customer.document,
      birth_date: null,
      city: customer.city,
      state: customer.state,
      tags: customer.tags,
      notes: customer.notes,
      first_order_at: customer.firstOrderAt,
      last_order_at: customer.lastOrderAt,
      total_orders: customer.totalOrders,
      total_spent: customer.totalSpent,
    }))

  const customerEventProfiles = customersRows.map((customerRow) => {
    const aggregate = customerById.get(String(customerRow.id))!
    return {
      id: stableUuid(`customer-event-profile-${customerRow.id}`),
      organization_id: DEMO_ORGANIZATION_ID,
      customer_id: customerRow.id,
      event_id: DEMO_EVENT_ID,
      orders_count: aggregate.totalOrders,
      tickets_count: aggregate.ticketsPurchased,
      attended_count: aggregate.attendedCount,
      no_show_count: aggregate.noShowCount,
      gross_revenue: aggregate.grossRevenue,
      net_revenue: aggregate.netRevenue,
      first_interaction_at: aggregate.firstOrderAt,
      last_interaction_at: aggregate.lastOrderAt,
    }
  })

  const staffMembers: TableRow[] = []
  const timeEntries: TableRow[] = []
  let staffCursor = 0

  for (const departmentSeed of staffDepartments) {
    for (let index = 0; index < departmentSeed.count; index += 1) {
      const firstName = pick(firstNames, staffCursor + index * 3)
      const lastName = pick(lastNames, staffCursor + index * 5)
      const staffId = stableUuid(`staff-${departmentSeed.department}-${index}`)
      const status = index % 9 === 0 ? 'invited' : index % 4 === 0 ? 'confirmed' : 'active'
      const checkedInAt = status === 'active' ? isoFromNow(177, 15 + (index % 4), (index * 6) % 60) : null
      const checkedOutAt = status === 'confirmed' && index % 6 === 0 ? isoFromNow(177, 23, (index * 7) % 60) : null
      const gateId = departmentSeed.gateKey ? String((gateByKey.get(departmentSeed.gateKey) ?? gates[index % gates.length]).id) : index % 5 === 0 ? gateFallbackIds[index % 4] : null

      staffMembers.push({
        id: staffId,
        organization_id: DEMO_ORGANIZATION_ID,
        event_id: DEMO_EVENT_ID,
        first_name: firstName,
        last_name: lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${staffCursor + index}@ops.animalz.events`,
        phone: phoneFor(5000 + staffCursor + index),
        cpf: cpfFor(9000 + staffCursor + index),
        role_title: departmentSeed.role,
        department: departmentSeed.department,
        area: departmentSeed.area,
        company: departmentSeed.department === 'Seguranca' ? 'Alpha Shield Security' : 'Animalz Grand Experiences',
        gate_id: gateId,
        permissions: departmentSeed.department === 'Coordenacao geral' ? ['events.manage', 'financial.read', 'checkin.manage'] : ['checkin.scan'],
        shift_label: index % 2 === 0 ? 'Opening shift' : 'Peak shift',
        shift_starts_at: isoFromNow(177, index % 2 === 0 ? 14 : 18, 0),
        shift_ends_at: isoFromNow(178, index % 2 === 0 ? 0 : 4, 0),
        linked_device_id: gateId ? `device-${staffCursor + index}` : null,
        daily_rate: departmentSeed.dailyRate,
        credential_issued_at: isoFromNow(165, 11, 0),
        checked_in_at: checkedInAt,
        checked_out_at: checkedOutAt,
        notes: index % 8 === 0 ? 'Staff demo priorizado para apresentacao comercial do produto.' : null,
        is_active: true,
        status,
        qr_token: `STAFF-${staffId.slice(0, 8)}`,
      })

      if (status === 'active' || status === 'confirmed') {
        timeEntries.push({
          id: stableUuid(`time-entry-in-${staffId}`),
          staff_id: staffId,
          event_id: DEMO_EVENT_ID,
          gate_id: gateId,
          type: 'clock_in',
          recorded_at: checkedInAt ?? isoFromNow(177, 15, 0),
          method: 'manual',
          is_valid: true,
          device_id: gateId ? `device-${staffCursor + index}` : null,
          notes: null,
          metadata: { demo: true },
        })
      }

      if (checkedOutAt) {
        timeEntries.push({
          id: stableUuid(`time-entry-out-${staffId}`),
          staff_id: staffId,
          event_id: DEMO_EVENT_ID,
          gate_id: gateId,
          type: 'clock_out',
          recorded_at: checkedOutAt,
          method: 'manual',
          is_valid: true,
          device_id: gateId ? `device-${staffCursor + index}` : null,
          notes: null,
          metadata: { demo: true },
        })
      }
    }

    staffCursor += departmentSeed.count
  }

  const suppliers = supplierSeeds.map(([companyName, serviceType, contractValue, status, docStatus, notes], index) => ({
    id: stableUuid(`supplier-${index}`),
    organization_id: DEMO_ORGANIZATION_ID,
    event_id: DEMO_EVENT_ID,
    company_name: companyName,
    contact_name: `${pick(firstNames, index)} ${pick(lastNames, index + 9)}`,
    email: `hello@${String(companyName).toLowerCase().replace(/[^a-z0-9]+/g, '')}.demo`,
    phone: phoneFor(7000 + index),
    service_type: serviceType,
    contract_value: contractValue,
    payment_terms: index % 3 === 0 ? '40% assinatura, 60% D+5' : '50% entrada, 50% no evento',
    status,
    doc_status: docStatus,
    notes,
    rating: 4 + (index % 2),
  }))

  const products = productCatalog.map(([name, category, price, costPrice, stockQuantity, description], index) => ({
    id: stableUuid(`product-${index}`),
    organization_id: DEMO_ORGANIZATION_ID,
    event_id: DEMO_EVENT_ID,
    name,
    sku: `DEMO-${String(index + 1).padStart(4, '0')}`,
    description,
    category: ['bar', 'food', 'vip', 'merch'].includes(String(category)) ? category : batchCategory(String(name)),
    price,
    cost_price: costPrice,
    stock_quantity: stockQuantity,
    stock_alert_threshold: Math.max(12, Math.round(Number(stockQuantity) * 0.12)),
    is_active: true,
    image_url: demoImages.gallery[index % demoImages.gallery.length],
  }))

  const grossSales = roundCurrency(orders.filter((order) => order.status === 'paid' || order.status === 'refunded').reduce((sum, order) => sum + Number(order.subtotal ?? 0), 0))
  const totalFees = roundCurrency(orders.filter((order) => order.status === 'paid').reduce((sum, order) => sum + Number(order.fee_amount ?? 0), 0))
  const refundAmount = roundCurrency(payments.filter((payment) => payment.status === 'refunded').reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0))

  const costEntries = [
    ...suppliers.map((supplier, index) => ({
      id: stableUuid(`cost-entry-supplier-${index}`),
      organization_id: DEMO_ORGANIZATION_ID,
      event_id: DEMO_EVENT_ID,
      description: `Fornecedor - ${supplier.company_name}`,
      category: supplier.service_type,
      amount: supplier.contract_value,
      due_date: isoFromNow(120 + index, 12, 0),
      paid_date: index % 3 === 0 ? isoFromNow(80 + index, 10, 0) : null,
      status: index % 3 === 0 ? 'paid' : index % 2 === 0 ? 'scheduled' : 'pending',
      notes: supplier.notes,
    })),
    {
      id: stableUuid('cost-entry-bar-stock'),
      organization_id: DEMO_ORGANIZATION_ID,
      event_id: DEMO_EVENT_ID,
      description: 'Reposicao de bar e gelo operacional',
      category: 'bar',
      amount: 184500,
      due_date: isoFromNow(150, 9, 0),
      paid_date: null,
      status: 'pending',
      notes: 'Custo pressionando margem pela ativacao extra do lounge.',
    },
    {
      id: stableUuid('cost-entry-catering'),
      organization_id: DEMO_ORGANIZATION_ID,
      event_id: DEMO_EVENT_ID,
      description: 'Hospitality menu e kitchen pass',
      category: 'catering',
      amount: 128900,
      due_date: isoFromNow(151, 9, 0),
      paid_date: null,
      status: 'pending',
      notes: 'Forecast acima do baseline previsto.',
    },
    {
      id: stableUuid('cost-entry-marketing'),
      organization_id: DEMO_ORGANIZATION_ID,
      event_id: DEMO_EVENT_ID,
      description: 'Midia performance, creators e OOH premium',
      category: 'marketing',
      amount: 236400,
      due_date: isoFromNow(120, 13, 0),
      paid_date: isoFromNow(102, 10, 0),
      status: 'paid',
      notes: 'Campanha final lote com ROAS acima da meta.',
    },
  ]

  const committedCosts = roundCurrency(costEntries.reduce((sum, entry) => sum + Number(entry.amount ?? 0), 0))
  const netSales = roundCurrency(grossSales + totalFees - refundAmount)
  const eventPayouts = [
    {
      id: stableUuid('event-payout-main'),
      organization_id: DEMO_ORGANIZATION_ID,
      event_id: DEMO_EVENT_ID,
      gross_sales: grossSales,
      refunds_amount: refundAmount,
      chargeback_amount: 18420,
      platform_fees: totalFees,
      retained_amount: 94800,
      payable_amount: roundCurrency(netSales - 94800),
      event_organizer_net: roundCurrency(netSales - totalFees - 94800),
      status: 'scheduled',
      scheduled_at: isoFromNow(185, 12, 0),
      paid_out_at: null,
      notes: 'Repasse principal agendado apos fechamento de divergencias menores.',
    },
  ]

  const financialForecasts = [
    {
      id: stableUuid('financial-forecast-main'),
      organization_id: DEMO_ORGANIZATION_ID,
      event_id: DEMO_EVENT_ID,
      projected_revenue: 4520000,
      projected_cost: 2710000,
      projected_margin: 1810000,
      projected_margin_percent: 40.04,
      risk_status: 'medium',
      assumptions: {
        expected_sellout: false,
        bar_capture_per_capita: 148,
        hospitality_upsell: 'above_target',
      },
      notes: 'Forecast ainda saudavel, mas catering e staffing pressionam margem em D-14.',
    },
  ]

  const eventFinancialClosures = [
    {
      id: stableUuid('financial-closure-main'),
      organization_id: DEMO_ORGANIZATION_ID,
      event_id: DEMO_EVENT_ID,
      status: 'in_closure',
      payments_reconciled: true,
      costs_recorded: false,
      payouts_reviewed: true,
      divergences_resolved: false,
      result_validated: false,
      closed_at: null,
      notes: 'Fechamento aguardando reconciliacao final do bar e catering.',
    },
  ]

  const eventHealthSnapshots = [0, 1, 2, 3, 4, 5].map((offset) => ({
    id: stableUuid(`health-snapshot-${offset}`),
    organization_id: DEMO_ORGANIZATION_ID,
    event_id: DEMO_EVENT_ID,
    snapshot_at: isoFromNow(-35 + offset * 7, 8, 0),
    sales_health_score: 78 + offset * 3,
    ops_health_score: 84 - offset,
    finance_health_score: 76 + offset * 2,
    audience_health_score: 80 + offset * 2,
    overall_health_score: 79 + offset * 2,
    metadata: {
      gross_sales: grossSales,
      checkins_simulated: 4318,
      open_alerts: 4,
    },
  }))

  const operationalAlerts = [
    {
      id: stableUuid('operational-alert-vip-gate'),
      organization_id: DEMO_ORGANIZATION_ID,
      event_id: DEMO_EVENT_ID,
      gate_id: gates[1].id,
      staff_member_id: null,
      type: 'throughput',
      category: 'checkin',
      severity: 'critical',
      status: 'active',
      title: 'Gate VIP abaixo da meta de throughput',
      description: 'Fila do acesso VIP projetando espera acima de 11 minutos entre 20h15 e 20h45.',
      recommendation_summary: 'Realocar 4 scanners e 1 supervisor senior da entrada principal.',
      source_context: { throughput_target: 420, current_estimate: 286 },
      first_detected_at: isoFromNow(177, 20, 10),
      last_detected_at: isoFromNow(177, 20, 38),
    },
    {
      id: stableUuid('operational-alert-catering-cost'),
      organization_id: DEMO_ORGANIZATION_ID,
      event_id: DEMO_EVENT_ID,
      gate_id: null,
      staff_member_id: null,
      type: 'margin-pressure',
      category: 'financial',
      severity: 'warning',
      status: 'active',
      title: 'Margem pressionada por catering premium',
      description: 'Hospitality menu acima do baseline em 14%.',
      recommendation_summary: 'Revisar mix final e reduzir desperdicio na madrugada.',
      source_context: { expected_cost: 113000, actual_cost: 128900 },
      first_detected_at: isoFromNow(172, 9, 0),
      last_detected_at: isoFromNow(172, 16, 0),
    },
    {
      id: stableUuid('operational-alert-final-release'),
      organization_id: DEMO_ORGANIZATION_ID,
      event_id: DEMO_EVENT_ID,
      gate_id: null,
      staff_member_id: null,
      type: 'inventory',
      category: 'tickets',
      severity: 'info',
      status: 'active',
      title: 'Final release de Frontstage acelerando',
      description: 'Conversao do ultimo lote 22% acima da semana anterior.',
      recommendation_summary: 'Disparar campanha de urgencia para capitais premium.',
      source_context: { batch_name: 'Last Call', sold_count: 270, available: 230 },
      first_detected_at: isoFromNow(170, 14, 0),
      last_detected_at: isoFromNow(170, 14, 0),
    },
    {
      id: stableUuid('operational-alert-staff-gap'),
      organization_id: DEMO_ORGANIZATION_ID,
      event_id: DEMO_EVENT_ID,
      gate_id: gates[5].id,
      staff_member_id: null,
      type: 'staffing',
      category: 'operations',
      severity: 'warning',
      status: 'acknowledged',
      title: 'Janela critica de staff na doca de servico',
      description: 'Escala com gap de 3 pessoas entre 17h30 e 18h15 para reposicao de bar.',
      recommendation_summary: 'Confirmar runners extra com Pulse Staffing.',
      source_context: { planned_staff: 12, confirmed_staff: 9 },
      first_detected_at: isoFromNow(176, 11, 0),
      last_detected_at: isoFromNow(176, 11, 20),
      resolved_at: null,
    },
  ]

  const recommendationLogs = [
    {
      id: stableUuid('recommendation-vip-queue'),
      organization_id: DEMO_ORGANIZATION_ID,
      event_id: DEMO_EVENT_ID,
      alert_id: operationalAlerts[0].id,
      recommendation_type: 'reallocate_staff',
      priority: 'high',
      title: 'Realocar scanners para o acesso VIP',
      description: 'Mover dois scanners do gate principal e reforcar hospitality host no lane 2.',
      action_payload: { from_gate: gates[0].id, to_gate: gates[1].id, scanners: 2 },
      status: 'pending',
    },
    {
      id: stableUuid('recommendation-catering-margin'),
      organization_id: DEMO_ORGANIZATION_ID,
      event_id: DEMO_EVENT_ID,
      alert_id: operationalAlerts[1].id,
      recommendation_type: 'cost_control',
      priority: 'medium',
      title: 'Ajustar menu hospitality e porcionamento',
      description: 'Reduzir itens de baixissima saida e reforcar tracking de desperdicio.',
      action_payload: { supplier: 'Maison Hospitality', expected_saving: 18400 },
      status: 'in_review',
    },
    {
      id: stableUuid('recommendation-campaign-urgency'),
      organization_id: DEMO_ORGANIZATION_ID,
      event_id: DEMO_EVENT_ID,
      alert_id: operationalAlerts[2].id,
      recommendation_type: 'launch_campaign',
      priority: 'medium',
      title: 'Disparar campanha de final lote',
      description: 'Usar segmento de high spenders e capitais premium para puxar o ultimo lote.',
      action_payload: { draft_name: 'Final lote urgency' },
      status: 'executed',
    },
  ]

  const intelligenceAlertStates = [
    {
      id: stableUuid('intelligence-alert-state-vip'),
      organization_id: DEMO_ORGANIZATION_ID,
      event_id: DEMO_EVENT_ID,
      alert_id: operationalAlerts[0].id,
      status: 'active',
      acknowledged_at: null,
      acknowledged_by: null,
      notes: 'Mantido aberto para demonstracao do command center.',
    },
    {
      id: stableUuid('intelligence-alert-state-catering'),
      organization_id: DEMO_ORGANIZATION_ID,
      event_id: DEMO_EVENT_ID,
      alert_id: operationalAlerts[1].id,
      status: 'active',
      acknowledged_at: null,
      acknowledged_by: null,
      notes: null,
    },
    {
      id: stableUuid('intelligence-alert-state-staff'),
      organization_id: DEMO_ORGANIZATION_ID,
      event_id: DEMO_EVENT_ID,
      alert_id: operationalAlerts[3].id,
      status: 'acknowledged',
      acknowledged_at: isoFromNow(176, 12, 0),
      acknowledged_by: attachProfileId,
      notes: 'Equipe de producao acionada para cobertura.',
    },
  ]

  const activeCustomerProfiles = shuffleDeterministic(customerEventProfiles)
  const selectedCustomerProfiles = activeCustomerProfiles.slice(0, 640)

  const audienceSegments = [
    ['High Spenders', 'Clientes com maior potencial de receita', { min_total_revenue: 1800 }],
    ['No-Show Recovery', 'Compraram mas nao compareceram', { bought_not_attended_event_id: DEMO_EVENT_ID }],
    ['VIP Buyers', 'Compradores premium e hospitalidade', { min_average_ticket: 700 }],
    ['Capitais Prioritarias', 'Base de Sao Paulo e Rio para urgency', { city: 'Sao Paulo' }],
    ['Inactive Customers', 'Sem compra recente e com historico anterior', { inactive_days: 45, min_orders: 1 }],
    ['Repeat Customers', 'Clientes com 3 ou mais pedidos', { min_orders: 3 }],
  ].map(([name, description, filterDefinition], index) => ({
    id: stableUuid(`audience-segment-${index}`),
    organization_id: DEMO_ORGANIZATION_ID,
    name,
    description,
    filter_definition: filterDefinition,
    audience_count: index === 0 ? customersRows.filter((row) => Number(row.total_spent) >= 1800).length
      : index === 1 ? customerEventProfiles.filter((row) => Number(row.no_show_count) > 0).length
        : index === 2 ? customerEventProfiles.filter((row) => Number(row.net_revenue) / Math.max(Number(row.tickets_count), 1) >= 700).length
          : index === 3 ? customersRows.filter((row) => row.city === 'Sao Paulo').length
            : index === 4 ? customersRows.filter((row) => row.total_orders >= 1).length
              : customersRows.filter((row) => Number(row.total_orders) >= 3).length,
    last_previewed_at: isoFromNow(-3 + index, 11, 0),
    created_by: attachProfileId,
  }))

  const campaignDrafts = [
    ['Early Access VIP', 0, 'email', 'Abertura antecipada para o lounge premium', 'Liberamos uma janela privada para upgrade VIP antes do proximo drop.'],
    ['Final lote urgency', 3, 'email', 'Ultimas unidades premium do lineup', 'O ultimo lote esta acelerando e a disponibilidade mudou nas ultimas horas.'],
    ['Post-event reengagement', 5, 'email', 'Priority list para a proxima experience', 'Queremos te colocar no topo da lista da proxima flagship.'],
    ['No-show recovery', 1, 'email', 'Sua energia merece uma nova chance', 'Preparamos uma oferta de retorno para reduzir friccao e reativar sua jornada.'],
    ['Hospitality offer', 2, 'email', 'Hospitality tables para convidados chave', 'Abrimos novas mesas corporativas com concierge e bottle service.'],
  ].map(([name, segmentIndex, channel, subject, messageBody], index) => ({
    id: stableUuid(`campaign-draft-${index}`),
    organization_id: DEMO_ORGANIZATION_ID,
    segment_id: audienceSegments[Number(segmentIndex)].id,
    event_id: DEMO_EVENT_ID,
    name,
    channel,
    status: 'draft',
    subject,
    message_body: messageBody,
    audience_count: Number(audienceSegments[Number(segmentIndex)].audience_count),
    scheduled_at: isoFromNow(150 + index, 11 + index, 0),
    created_by: attachProfileId,
  }))

  const campaignRuns = campaignDrafts.slice(0, 4).map((draft, index) => {
    const status = pick(['completed', 'completed', 'sending', 'failed'], index)
    const audienceCount = [120, 180, 96, 72][index]
    const deliveredCount = status === 'failed' ? 32 : status === 'sending' ? 44 : audienceCount - 8
    const sentCount = status === 'sending' ? 18 : 0
    const failedCount = status === 'failed' ? 18 : 4
    const skippedCount = status === 'completed' ? 4 : 6

    return {
      id: stableUuid(`campaign-run-${index}`),
      organization_id: DEMO_ORGANIZATION_ID,
      campaign_draft_id: draft.id,
      segment_id: draft.segment_id,
      event_id: DEMO_EVENT_ID,
      name: draft.name,
      channel: draft.channel,
      status,
      audience_count: audienceCount,
      sent_count: sentCount,
      delivered_count: deliveredCount,
      failed_count: failedCount,
      skipped_count: skippedCount,
      started_at: isoFromNow(-9 + index, 14, 0),
      completed_at: status === 'completed' || status === 'failed' ? isoFromNow(-9 + index, 14, 40) : null,
      created_by: attachProfileId,
    }
  })

  const campaignRunRecipients = campaignRuns.flatMap((run, runIndex) => {
    const baseProfiles = selectedCustomerProfiles.slice(runIndex * 90, runIndex * 90 + run.audience_count)
    return baseProfiles.map((profile, index) => {
      const customer = customersRows.find((row) => row.id === profile.customer_id)!
      const status = run.status === 'failed'
        ? pick(['delivered', 'failed', 'skipped'], index)
        : run.status === 'sending'
          ? pick(['delivered', 'sent', 'pending', 'skipped'], index)
          : pick(['delivered', 'delivered', 'failed', 'skipped'], index)
      const sentAt = status === 'pending' ? null : isoFromNow(-8 + runIndex, 14, index % 60)
      return {
        id: stableUuid(`campaign-recipient-${run.id}-${index}`),
        organization_id: DEMO_ORGANIZATION_ID,
        campaign_run_id: run.id,
        customer_id: customer.id,
        recipient_email: customer.email,
        recipient_phone: customer.phone,
        status,
        error_message: status === 'failed' ? 'Bounce simulado para o ambiente demo.' : status === 'skipped' ? 'Cliente sem canal priorizado para esta etapa.' : null,
        provider_message_id: status === 'pending' ? null : `mail_demo_${runIndex}_${index}`,
        payload_snapshot: {
          demo: true,
          customer_name: customer.full_name,
          segment: audienceSegments[runIndex].name,
        },
        sent_at: sentAt,
        delivered_at: status === 'delivered' ? isoFromNow(-8 + runIndex, 14, (index % 60) + 2) : null,
        failed_at: status === 'failed' ? isoFromNow(-8 + runIndex, 14, (index % 60) + 1) : null,
      }
    })
  })

  const audienceResolutionJobs = campaignRuns.map((run, index) => ({
    id: stableUuid(`audience-job-${index}`),
    organization_id: DEMO_ORGANIZATION_ID,
    segment_id: run.segment_id,
    campaign_run_id: run.id,
    status: 'completed',
    input_snapshot: {
      run_name: run.name,
      event_id: DEMO_EVENT_ID,
      demo: true,
    },
    result_count: run.audience_count,
    started_at: run.started_at,
    completed_at: run.completed_at ?? isoFromNow(-8 + index, 14, 12),
    error_message: null,
  }))

  const campaigns = campaignDrafts.slice(0, 3).map((draft, index) => ({
    id: stableUuid(`campaign-${index}`),
    organization_id: DEMO_ORGANIZATION_ID,
    event_id: DEMO_EVENT_ID,
    segment_id: draft.segment_id,
    name: draft.name,
    channel: draft.channel,
    status: pick(['sending', 'sent', 'draft'], index),
    subject: draft.subject,
    body: draft.message_body,
    message_body: draft.message_body,
    audience_filter: audienceSegments[index].filter_definition,
    audience_count: audienceSegments[index].audience_count,
    scheduled_at: draft.scheduled_at,
    started_at: index < 2 ? isoFromNow(-9 + index, 14, 0) : null,
    finished_at: index === 1 ? isoFromNow(-8, 14, 42) : null,
    sent_count: index === 0 ? 44 : index === 1 ? 176 : 0,
    delivered_count: index === 0 ? 38 : index === 1 ? 168 : 0,
    opened_count: index === 1 ? 92 : 24,
    clicked_count: index === 1 ? 28 : 9,
    failed_count: index === 0 ? 6 : 8,
    created_by: attachProfileId,
  }))

  const auditLogs = [
    ['event.published', 'event', DEMO_EVENT_ID, 'Evento publicado para a area publica', 'critical'],
    ['tickets.release_opened', 'ticket', ticketTypes[1].id, 'Lote final de Frontstage habilitado', 'info'],
    ['order.paid', 'order', orders[12].id, 'Venda premium confirmada via PIX', 'info'],
    ['payment.refund', 'payment', payments.find((payment) => payment.status === 'refunded')?.id, 'Reembolso parcial processado no lote de Arena', 'warning'],
    ['staff.credentials_issued', 'staff', staffMembers[4].id, 'Credenciais emitidas para time de acessos', 'info'],
    ['campaign.launched', 'campaign', campaignRuns[1].id, 'Campanha Final lote urgency colocada em execucao', 'info'],
    ['financial.forecast_updated', 'financial', financialForecasts[0].id, 'Forecast ajustado apos revisao de catering', 'warning'],
    ['event_media.updated', 'event_media_asset', eventAssets[1].id, 'Hero video atualizado para a landing publica', 'info'],
  ].map(([action, entityType, entityId, description, severity], index) => ({
    id: stableUuid(`audit-log-${index}`),
    organization_id: DEMO_ORGANIZATION_ID,
    user_id: attachProfileId,
    event_id: DEMO_EVENT_ID,
    action,
    entity_type: entityType,
    entity_id: entityId,
    old_data: null,
    new_data: {
      title: [
        'Evento pronto para apresentacao',
        'Lote premium em destaque',
        'Venda high value registrada',
        'Reembolso monitorado',
        'Operacao de acesso equipada',
        'Campanha de urgencia disparada',
        'Forecast financeiro revisado',
        'Midia hero sincronizada',
      ][index],
      description,
    },
    ip_address: null,
    user_agent: 'demo-seed',
    device_id: 'demo-seed',
    session_id: null,
    metadata: { demo: true },
    severity,
    source: 'system',
    created_at: isoFromNow(-5 + index, 13 + (index % 4), 10),
  }))

  const systemNotificationUserId = attachProfileId ?? stableUuid('demo-system-user')
  const internalNotifications = [
    ['operational', 'critical', 'Gate VIP precisa de reforco', 'Fila prevista acima da meta nas proximas janelas.', '/checkin'],
    ['financial', 'warning', 'Fechamento financeiro ainda nao concluido', 'Custos de catering pendentes de consolidacao.', '/financial'],
    ['sales', 'info', 'Frontstage em aceleracao', 'Ultimo lote converteu acima do baseline nas ultimas 24h.', '/tickets'],
    ['campaign', 'info', 'Campanha Final lote urgency em execucao', 'Open rate inicial acima da media da base.', '/communication'],
    ['operational', 'warning', 'Pulse Staffing com gap de reposicao', 'Reforco adicional precisa ser confirmado para a doca.', '/staff'],
  ].map(([type, severity, title, body, actionUrl], index) => ({
    id: stableUuid(`internal-notification-${index}`),
    organization_id: DEMO_ORGANIZATION_ID,
    user_id: systemNotificationUserId,
    type,
    severity,
    title,
    body,
    action_url: actionUrl,
    reference_type: 'event',
    reference_id: DEMO_EVENT_ID,
    is_read: index === 4,
    read_at: index === 4 ? isoFromNow(-1, 10, 0) : null,
    created_at: isoFromNow(-2 + index, 9 + index, 0),
  }))

  const executiveDashboardSnapshots = [0, 1, 2].map((index) => ({
    id: stableUuid(`dashboard-snapshot-${index}`),
    organization_id: DEMO_ORGANIZATION_ID,
    snapshot_period: pick(['daily', 'weekly', 'monthly'], index),
    snapshot_date: isoFromNow(-index * 7, 6, 0).slice(0, 10),
    total_events: 1,
    active_events: 1,
    upcoming_events: 1,
    gross_revenue: grossSales,
    net_revenue: netSales,
    platform_fees: totalFees,
    tickets_sold: 7000,
    tickets_checked_in: 4318,
    total_customers: customersRows.length,
    new_customers: 320 - index * 24,
    returning_customers: 148 + index * 12,
    campaigns_sent: 4,
    emails_delivered: campaignRunRecipients.filter((recipient) => recipient.status === 'delivered').length,
    campaign_open_rate: 0.41 + index * 0.02,
    revenue_by_event: [{ event_id: DEMO_EVENT_ID, name: event.name, net_revenue: netSales }],
    revenue_by_day: Array.from({ length: 7 }).map((_, dayIndex) => ({
      date: isoFromNow(-7 + dayIndex, 0, 0).slice(0, 10),
      revenue: roundCurrency(netSales / 7 + dayIndex * 1280),
    })),
    top_ticket_types: ticketTypes.map((ticketType, ticketIndex) => ({
      ticket_type_id: ticketType.id,
      name: ticketType.name,
      revenue: roundCurrency((ticketPlans[ticketIndex]?.soldTarget ?? 0) * (ticketPlans[ticketIndex]?.basePrice ?? 0)),
    })),
    metadata: { demo: true, hero_event: DEMO_EVENT_ID },
    generated_by: 'demo-seed',
  }))

  return {
    organization,
    event,
    eventAssets,
    gates,
    ticketTypes,
    ticketBatches,
    orders,
    orderItems,
    payments,
    digitalTickets,
    transactionalMessages,
    checkins,
    staffMembers,
    timeEntries,
    suppliers,
    products,
    costEntries,
    eventPayouts,
    financialForecasts,
    eventFinancialClosures,
    eventHealthSnapshots,
    operationalAlerts,
    recommendationLogs,
    intelligenceAlertStates,
    customers: customersRows,
    customerEventProfiles,
    audienceSegments,
    campaignDrafts,
    campaignRuns,
    campaignRunRecipients,
    audienceResolutionJobs,
    campaigns,
    auditLogs,
    internalNotifications,
    executiveDashboardSnapshots,
    summary: {
      organizationId: DEMO_ORGANIZATION_ID,
      organizationSlug: DEMO_ORGANIZATION_SLUG,
      eventId: DEMO_EVENT_ID,
      eventSlug: DEMO_EVENT_SLUG,
      ticketsSold: 7000,
      checkins: 4318,
      orders: orders.length,
      customers: customersRows.length,
      staffMembers: staffMembers.length,
      products: products.length,
      suppliers: suppliers.length,
      campaignRuns: campaignRuns.length,
      mediaAssets: eventAssets.length,
      committedCosts,
      chunks: {
        orders: chunk(orders, 500).length,
        recipients: chunk(campaignRunRecipients, 500).length,
      },
    },
  }
}

export const demoSeedConstants = {
  organizationId: DEMO_ORGANIZATION_ID,
  organizationSlug: DEMO_ORGANIZATION_SLUG,
  eventId: DEMO_EVENT_ID,
  eventSlug: DEMO_EVENT_SLUG,
}
