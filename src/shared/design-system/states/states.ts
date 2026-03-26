export const stateSystem = {
  success: {
    label: 'Atualizacao concluida',
    tone: 'success',
  },
  error: {
    label: 'Nao foi possivel concluir a acao',
    tone: 'error',
  },
  info: {
    label: 'Contexto util',
    tone: 'info',
  },
  blocked: {
    label: 'Acesso restrito',
    tone: 'blocked',
  },
} as const

export type StateSystem = typeof stateSystem
