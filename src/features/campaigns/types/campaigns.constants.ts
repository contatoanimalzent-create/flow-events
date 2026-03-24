import type { CampaignChannel, CampaignDeliveryStatus, CampaignRunStatus } from './campaigns.types'

export const CAMPAIGN_CHANNEL_LABELS: Record<CampaignChannel, string> = {
  email: 'E-mail',
  whatsapp: 'WhatsApp',
  sms: 'SMS',
  push: 'Push',
}

export const CAMPAIGN_RUN_STATUS_LABELS: Record<CampaignRunStatus, string> = {
  pending: 'Pendente',
  resolving: 'Resolvendo audiencia',
  sending: 'Enviando',
  paused: 'Pausada',
  completed: 'Concluida',
  failed: 'Falhou',
  cancelled: 'Cancelada',
}

export const CAMPAIGN_DELIVERY_STATUS_LABELS: Record<CampaignDeliveryStatus, string> = {
  pending: 'Pendente',
  sent: 'Enviado',
  delivered: 'Entregue',
  failed: 'Falhou',
  skipped: 'Ignorado',
  cancelled: 'Cancelado',
}

export const CAMPAIGN_SEND_BATCH_LIMIT = 50
