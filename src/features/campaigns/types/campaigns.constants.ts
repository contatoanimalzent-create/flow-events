import type { CampaignChannel } from './campaigns.types'

export const CAMPAIGN_CHANNEL_LABELS: Record<CampaignChannel, string> = {
  email: 'E-mail',
  whatsapp: 'WhatsApp',
  sms: 'SMS',
  push: 'Push',
}
