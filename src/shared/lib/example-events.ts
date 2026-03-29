type ExampleEventCandidate = {
  id?: string | null
  slug?: string | null
  name?: string | null
  settings?: Record<string, unknown> | null
}

const EXAMPLE_EVENT_IDS = new Set([
  '5d3cf80b-3dd2-4813-91e3-8d019bb3b210',
])

const EXAMPLE_EVENT_SLUGS = new Set([
  'animalz-nocturne-sessions-2026',
  'animalz-summit-2025',
  'capital-strike-a-origem',
])

const EXAMPLE_EVENT_NAMES = new Set([
  'animalz nocturne sessions 2026',
  'animalz summit 2025',
  'capital strike - a origem',
  'capital strike a origem',
])

function normalize(value: string | null | undefined) {
  return (value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

export function isExampleEvent(candidate: ExampleEventCandidate | null | undefined) {
  if (!candidate) {
    return false
  }

  if (candidate.id && EXAMPLE_EVENT_IDS.has(candidate.id)) {
    return true
  }

  const normalizedSlug = normalize(candidate.slug)
  if (normalizedSlug && EXAMPLE_EVENT_SLUGS.has(normalizedSlug)) {
    return true
  }

  const normalizedName = normalize(candidate.name)
  if (normalizedName && EXAMPLE_EVENT_NAMES.has(normalizedName)) {
    return true
  }

  const generatedBy = normalize(String(candidate.settings?.generated_by ?? ''))
  return generatedBy === 'demo-seed'
}

export function filterExampleEvents<T extends ExampleEventCandidate>(items: T[]) {
  return items.filter((item) => !isExampleEvent(item))
}
