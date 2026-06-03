export const OPERATIONAL_STAFF_ROLES = [
  'Carregador',
  'Segurança eventual',
  'Segurança patrimonial',
  'Produção',
  'Brigadista',
  'Posto médico',
  'Credenciamento',
  'Limpeza',
  'Transmissão',
  'Outros',
] as const

export function normalizeOperationalRole(value?: string | null) {
  const role = (value ?? '').trim()
  if (!role) return 'Outros'
  const normalized = role.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  if (normalized.includes('carreg')) return 'Carregador'
  if (normalized.includes('seguranca patrimonial')) return 'Segurança patrimonial'
  if (normalized.includes('seguranca')) return 'Segurança eventual'
  if (normalized.includes('posto medico') || normalized.includes('ambulancia')) return 'Posto médico'
  if (normalized.includes('brigad')) return 'Brigadista'
  if (normalized.includes('credenc')) return 'Credenciamento'
  if (normalized.includes('limpeza')) return 'Limpeza'
  if (normalized.includes('transmiss')) return 'Transmissão'
  if (normalized.includes('produc')) return 'Produção'
  return role
}
