import type { EventFormData, EventStatus, EventStatusConfig } from './events.types'

const UNSPLASH_BANK: Record<string, string[]> = {
  'M\u00fasica': ['1459749411175-04bf5292ceea', '1501386761578-eac5c94b800a', '1506157786151-b8491531f063', '1429962714451-bb934ecdc4ec', '1493225457124-a3eb161ffa5f'],
  Festival: ['1459749411175-04bf5292ceea', '1492684223066-81342ee5ff30', '1506157786151-b8491531f063', '1429962714451-bb934ecdc4ec', '1533174072545-7a4b6ad7a6c3'],
  Tech: ['1518770660439-4636190af475', '1488590528505-98d2b5aba04b', '1451187580459-43490279c0fa', '1526374965328-7f61d4dc18c5', '1504384308090-c894fdcc538d'],
  'Neg\u00f3cios': ['1556761175-4b46a572b786', '1515187029135-18ee286d815b', '1542744173-8e7e53415bb0', '1521737711867-e3b97375f902', '1552664730-d307ca884978'],
  Business: ['1556761175-4b46a572b786', '1515187029135-18ee286d815b', '1542744173-8e7e53415bb0', '1521737711867-e3b97375f902', '1552664730-d307ca884978'],
  Esportes: ['1461896836934-ffe607ba8211', '1541534741688-7078b3a9f92a', '1517649763962-0c623066013b', '1571019613454-1cb2f99b2d8b', '1576458088116-29cbb4ba0e04'],
  Gastronomia: ['1414235077428-338989a2e8c0', '1504674900247-0877df9cc836', '1482049016688-2d3e1b311543', '1567620905732-2d1ec7ab7445', '1540189549336-e8d99a6b7f47'],
  Arte: ['1478720568477-152d9b164e26', '1513475382585-d06e58bcb0e0', '1460661419201-fd4cecdf8a8b', '1541961017774-22349e4a1262', '1531913764164-f85c52e6e654'],
  'Educa\u00e7\u00e3o': ['1524178232363-1fb2b075b655', '1503676260728-1c00da094a0b', '1522202176988-66273c2fd55f', '1434030216411-0b793f4b6173', '1509062522246-3755977927d7'],
  Congresso: ['1540575467063-178a50c2df87', '1515187029135-18ee286d815b', '1511578314322-c7e1f6f7e8b6', '1505373877841-8d25f7d46678', '1552664730-d307ca884978'],
  default: ['1492684223066-81342ee5ff30', '1459749411175-04bf5292ceea', '1540575467063-178a50c2df87', '1518770660439-4636190af475', '1556761175-4b46a572b786'],
}

export const EMPTY_EVENT_FORM: EventFormData = {
  name: '',
  subtitle: '',
  category: '',
  short_description: '',
  starts_at: '',
  ends_at: '',
  doors_open_at: '',
  venue_name: '',
  venue_street: '',
  venue_city: '',
  venue_state: '',
  total_capacity: '',
  age_rating: 'livre',
  dress_code: '',
  is_online: false,
  online_url: '',
  cover_url: '',
  video_url: '',
}

export const EVENT_CATEGORIES = ['M\u00fasica', 'Tech', 'Arte', 'Esportes', 'Business', 'Gastronomia', 'Moda', 'Educa\u00e7\u00e3o', 'Outro']

export const EVENT_AGE_RATINGS = ['livre', '10', '12', '14', '16', '18']

export const EVENT_STATUS_CONFIG: Record<EventStatus, EventStatusConfig> = {
  draft: { label: 'Rascunho', dot: 'bg-text-muted', text: 'text-text-muted' },
  review: { label: 'Em revis\u00e3o', dot: 'bg-status-warning', text: 'text-status-warning' },
  published: { label: 'Publicado', dot: 'bg-status-success', text: 'text-status-success' },
  ongoing: { label: 'Ao vivo', dot: 'bg-brand-acid animate-pulse', text: 'text-brand-acid' },
  finished: { label: 'Finalizado', dot: 'bg-brand-blue', text: 'text-brand-blue' },
  archived: { label: 'Arquivado', dot: 'bg-bg-border', text: 'text-text-muted' },
  cancelled: { label: 'Cancelado', dot: 'bg-status-error', text: 'text-status-error' },
}

export function getUnsplashImages(category: string): string[] {
  const images = UNSPLASH_BANK[category] ?? UNSPLASH_BANK.default
  return images.map((id) => `https://images.unsplash.com/photo-${id}?w=600&q=80&fit=crop`)
}
