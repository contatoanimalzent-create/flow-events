import type { Locale } from './locale.store'

export type LocaleStrings = Record<string, { 'pt-BR': string; 'en-US': string }>

const STRINGS: LocaleStrings = {
  // ── Common ──────────────────────────────────────────────────────────────────
  loading:   { 'pt-BR': 'Carregando...',          'en-US': 'Loading...' },
  back:      { 'pt-BR': 'Voltar',                 'en-US': 'Back' },
  save:      { 'pt-BR': 'Salvar',                 'en-US': 'Save' },
  cancel:    { 'pt-BR': 'Cancelar',               'en-US': 'Cancel' },
  error:     { 'pt-BR': 'Erro',                   'en-US': 'Error' },
  retry:     { 'pt-BR': 'Tentar novamente',       'en-US': 'Try again' },
  noData:    { 'pt-BR': 'Nenhum dado encontrado', 'en-US': 'No data found' },

  // ── Operator ─────────────────────────────────────────────────────────────────
  scanner:          { 'pt-BR': 'Scanner QR',                 'en-US': 'QR Scanner' },
  manualCheck:      { 'pt-BR': 'Busca manual',               'en-US': 'Manual check' },
  history:          { 'pt-BR': 'Histórico',                  'en-US': 'History' },
  flow:             { 'pt-BR': 'Fluxo',                      'en-US': 'Flow' },
  alerts:           { 'pt-BR': 'Alertas',                    'en-US': 'Alerts' },
  checkinSuccess:   { 'pt-BR': 'Acesso liberado',            'en-US': 'Access granted' },
  checkinError:     { 'pt-BR': 'Acesso negado',              'en-US': 'Access denied' },
  duplicateTicket:  { 'pt-BR': 'Ingresso já utilizado',      'en-US': 'Ticket already used' },
  wrongEvent:       { 'pt-BR': 'Ingresso de outro evento',   'en-US': 'Ticket for another event' },

  // ── Staff ─────────────────────────────────────────────────────────────────
  presence:       { 'pt-BR': 'Presença',          'en-US': 'Presence' },
  startShift:     { 'pt-BR': 'Iniciar turno',     'en-US': 'Start shift' },
  endShift:       { 'pt-BR': 'Encerrar turno',    'en-US': 'End shift' },
  occurrences:    { 'pt-BR': 'Ocorrências',       'en-US': 'Occurrences' },
  instructions:   { 'pt-BR': 'Instruções',        'en-US': 'Instructions' },

  // ── Supervisor ────────────────────────────────────────────────────────────
  teamLive:     { 'pt-BR': 'Equipe ao vivo',     'en-US': 'Team live' },
  approvals:    { 'pt-BR': 'Aprovações',          'en-US': 'Approvals' },
  map:          { 'pt-BR': 'Mapa',               'en-US': 'Map' },
  healthScore:  { 'pt-BR': 'Saúde da operação',  'en-US': 'Health score' },

  // ── Attendee ──────────────────────────────────────────────────────────────
  myTickets:    { 'pt-BR': 'Meus ingressos', 'en-US': 'My tickets' },
  agenda:       { 'pt-BR': 'Programação',    'en-US': 'Agenda' },
  feed:         { 'pt-BR': 'Feed',           'en-US': 'Feed' },
  networking:   { 'pt-BR': 'Networking',     'en-US': 'Networking' },
  upgrades:     { 'pt-BR': 'Upgrades',       'en-US': 'Upgrades' },

  // ── Promoter ──────────────────────────────────────────────────────────────
  sales:       { 'pt-BR': 'Vendas',     'en-US': 'Sales' },
  commission:  { 'pt-BR': 'Comissão',   'en-US': 'Commission' },
  ranking:     { 'pt-BR': 'Ranking',    'en-US': 'Ranking' },
  goals:       { 'pt-BR': 'Metas',      'en-US': 'Goals' },

  // ── Profile ───────────────────────────────────────────────────────────────
  profile:        { 'pt-BR': 'Perfil',                     'en-US': 'Profile' },
  logout:         { 'pt-BR': 'Sair da conta',              'en-US': 'Log out' },
  switchMode:     { 'pt-BR': 'Trocar modo',                'en-US': 'Switch mode' },
  switchOrg:      { 'pt-BR': 'Trocar organização',         'en-US': 'Switch organization' },
  switchEvent:    { 'pt-BR': 'Trocar evento',              'en-US': 'Switch event' },
}

export function t(key: string, locale: Locale = 'pt-BR'): string {
  return STRINGS[key]?.[locale] ?? key
}
