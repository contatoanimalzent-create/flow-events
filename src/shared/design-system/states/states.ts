export const stateSystem = {
  success: {
    label: 'Atualizacao concluida',
    tone: 'success',
  },
  error: {
    label: 'Não foi possível concluir a ação',
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
