// Funcoes que o colaborador escolhe ao bater a entrada. Agrupadas para a lista
// ficar navegavel no celular; a lista plana continua exportada porque o admin
// do BSB consome ela direto.

export const OPERATIONAL_STAFF_ROLE_GROUPS = [
  {
    label: 'Operação',
    roles: [
      'Produção',
      'Coordenação',
      'Credenciamento',
      'Recepção',
      'Bilheteria',
      'Carregador',
      'Montagem e desmontagem',
      'Almoxarifado',
      'Motorista',
      'Limpeza',
    ],
  },
  {
    label: 'Segurança e saúde',
    roles: [
      'Segurança eventual',
      'Segurança patrimonial',
      'Brigadista',
      'Posto médico',
    ],
  },
  {
    label: 'Imagem e transmissão',
    roles: [
      'Transmissão',
      'Operador de câmera',
      'Videomaker',
      'Fotógrafo',
      'Editor de vídeo',
      'Mídias sociais',
    ],
  },
  {
    label: 'Técnica',
    roles: [
      'Técnico de som',
      'Técnico de iluminação',
      'Operador de telão',
      'DJ',
      'Locutor',
    ],
  },
  {
    label: 'Outros',
    roles: ['Outros'],
  },
] as const

export const OPERATIONAL_STAFF_ROLES = OPERATIONAL_STAFF_ROLE_GROUPS.flatMap(
  (group) => group.roles as readonly string[],
)

export function normalizeOperationalRole(value?: string | null) {
  const role = (value ?? '').trim()
  if (!role) return 'Outros'
  const normalized = role.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

  // Operação
  if (normalized.includes('carreg')) return 'Carregador'
  if (normalized.includes('credenc')) return 'Credenciamento'
  if (normalized.includes('recepc')) return 'Recepção'
  if (normalized.includes('bilhet')) return 'Bilheteria'
  if (normalized.includes('montag') || normalized.includes('desmontag')) return 'Montagem e desmontagem'
  if (normalized.includes('almoxarif')) return 'Almoxarifado'
  if (normalized.includes('motorista')) return 'Motorista'
  if (normalized.includes('limpeza')) return 'Limpeza'
  if (normalized.includes('coordena')) return 'Coordenação'

  // Segurança e saúde
  if (normalized.includes('seguranca patrimonial')) return 'Segurança patrimonial'
  if (normalized.includes('seguranca')) return 'Segurança eventual'
  if (normalized.includes('posto medico') || normalized.includes('ambulancia')) return 'Posto médico'
  if (normalized.includes('brigad')) return 'Brigadista'

  // Imagem e transmissão
  if (normalized.includes('transmiss') || normalized.includes('streaming')) return 'Transmissão'
  if (normalized.includes('camera') || normalized.includes('cinegraf')) return 'Operador de câmera'
  if (normalized.includes('videomaker') || normalized.includes('video maker')) return 'Videomaker'
  if (normalized.includes('fotograf') || normalized.includes('fotog')) return 'Fotógrafo'
  if (normalized.includes('edicao') || normalized.includes('editor')) return 'Editor de vídeo'
  if (normalized.includes('midias sociais') || normalized.includes('social media')) return 'Mídias sociais'

  // Técnica
  if (normalized.includes('som') || normalized.includes('audio')) return 'Técnico de som'
  if (normalized.includes('ilumin') || normalized.includes('luz')) return 'Técnico de iluminação'
  if (normalized.includes('telao') || normalized.includes('painel')) return 'Operador de telão'
  if (normalized === 'dj' || normalized.startsWith('dj ')) return 'DJ'
  if (normalized.includes('locutor') || normalized.includes('apresentad')) return 'Locutor'

  // Producao por ultimo: 'producao executiva' nao pode ganhar de 'som' ou 'camera'
  if (normalized.includes('produc')) return 'Produção'

  return role
}
