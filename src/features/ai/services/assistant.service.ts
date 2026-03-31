import { supabase } from '@/lib/supabase'
import { createApiClient } from '@/shared/api'

interface AskAssistantInput {
  message: string
  section: string
  conversationId: string
  organizationId: string
  organizationName?: string | null
  userId?: string | null
  userRole?: string | null
}

interface AskAssistantResult {
  content: string
  learnedFromMemories: number
  conversationId: string
}

const assistantApi = createApiClient('assistant')

export const assistantService = {
  async ask(input: AskAssistantInput): Promise<AskAssistantResult> {
    return assistantApi.request('ask_operational_assistant', async () => {
      const { data, error } = await supabase.functions.invoke('ai-operational-assistant', {
        body: input,
      })

      if (error) {
        throw new Error(error.message)
      }

      if (!data || typeof data !== 'object') {
        throw new Error('Resposta invalida da AI operacional')
      }

      const payload = data as Record<string, unknown>

      if (payload.error) {
        throw new Error(String(payload.error))
      }

      return {
        content: String(payload.content ?? ''),
        learnedFromMemories: Number(payload.learnedFromMemories ?? 0),
        conversationId: String(payload.conversationId ?? input.conversationId),
      }
    }, {
      section: input.section,
      organizationId: input.organizationId,
    })
  },
}
