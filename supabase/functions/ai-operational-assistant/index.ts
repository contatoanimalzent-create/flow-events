import { corsHeaders } from '../_shared/cors.ts'
import { createSupabaseAdminClient } from '../_shared/supabase-admin.ts'

type AssistantRole = 'user' | 'assistant' | 'system'

interface AssistantRequest {
  message: string
  section: string
  conversationId: string
  organizationId: string
  organizationName?: string | null
  userId?: string | null
  userRole?: string | null
}

interface StoredConversationRow {
  id: string
  role: AssistantRole
  content: string
  section: string
  created_at: string
}

interface StoredMemoryRow {
  id: string
  section?: string | null
  question: string
  answer: string
  keywords: string[]
  usage_count: number
}

const OPENAI_MODEL = Deno.env.get('OPENAI_MODEL') ?? 'gpt-5.2'

const SECTION_GUIDES: Record<string, string> = {
  dashboard: 'Painel executivo para ler gargalos, receita, operacao e proximos riscos.',
  events: 'Modulo de eventos para agenda, portfolio, publicacao e configuracao geral do evento.',
  tickets: 'Modulo de ingressos para lotes, precos, ocupacao e configuracao comercial do acesso.',
  sales: 'Modulo de vendas para pedidos, pagamentos, emissao e acompanhamento do caixa comercial.',
  crm: 'Modulo de relacionamento para publico, recorrencia, audiencia, historico e acionamento.',
  checkin: 'Modulo de credenciamento e acesso. Aqui entram filas, leitura de ingresso, validacao e excecoes.',
  staff: 'Modulo de equipe operacional. Aqui entram cadastro, escala, turno, area, credencial e permissoes.',
  suppliers: 'Modulo de fornecedores e parceiros externos da operacao.',
  products: 'PDV e modulo de venda rapida. Serve para catalogo comercial, caixa e fechamento de pedido.',
  inventory: 'Estoque e modulo de saldo, ruptura, reposicao e controle de disponibilidade.',
  intelligence: 'Modulo de inteligencia para alertas, leitura executiva e recomendacoes.',
  communication: 'Modulo de comunicacao para campanhas, jornadas e disparos.',
  financial: 'Modulo financeiro para margem, repasse, custos e fechamento.',
  billing: 'Modulo de cobranca e monetizacao da plataforma.',
  growth: 'Modulo de crescimento para aquisicao, canais, referral e retorno.',
  help: 'Modulo de ajuda e orientacao operacional.',
  settings: 'Modulo de configuracoes, marca, dominio e permissoes.',
}

function tokenize(text: string) {
  return Array.from(
    new Set(
      text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((token) => token.length >= 4 && !['para', 'como', 'onde', 'qual', 'quais', 'isso', 'essa', 'esse', 'com', 'sobre', 'modulo'].includes(token)),
    ),
  ).slice(0, 12)
}

function scoreMemory(memory: StoredMemoryRow, queryTokens: string[], section: string) {
  const overlap = memory.keywords.filter((keyword) => queryTokens.includes(keyword)).length
  const sectionBonus = memory.section === section ? 3 : memory.section ? 0 : 1
  return overlap * 4 + sectionBonus + Math.min(memory.usage_count, 3)
}

function extractOutputText(payload: Record<string, unknown>) {
  if (typeof payload.output_text === 'string' && payload.output_text.trim()) {
    return payload.output_text.trim()
  }

  const output = Array.isArray(payload.output) ? payload.output : []

  for (const item of output) {
    if (!item || typeof item !== 'object') {
      continue
    }

    const content = Array.isArray((item as Record<string, unknown>).content)
      ? ((item as Record<string, unknown>).content as Array<Record<string, unknown>>)
      : []

    for (const entry of content) {
      if (entry?.type === 'output_text' && typeof entry.text === 'string' && entry.text.trim()) {
        return entry.text.trim()
      }
    }
  }

  return ''
}

function buildInstructions(section: string) {
  return [
    'Voce e a AI operacional da Animalz Events.',
    'Responda sempre em portugues do Brasil.',
    'Seja direta, clara, pratica e orientada para uso real diario do produto.',
    'Quando houver confusao entre modulos, explique a diferenca de forma objetiva.',
    'Nao invente funcionalidades inexistentes. Quando algo nao estiver confirmado, diga que e uma recomendacao operacional.',
    'Priorize orientar o usuario dentro do app: qual modulo usar, o proximo passo e o que evitar.',
    `Modulo atual: ${section}. Guia do modulo atual: ${SECTION_GUIDES[section] ?? 'Ajuda operacional geral do produto.'}`,
    'Diferencas criticas do produto: PDV vende; Estoque controla saldo e ruptura; Staff cuida da equipe operacional; Credenciamento cuida do acesso do publico.',
    'Se o usuario parecer irritado, mantenha calma e seja ainda mais objetiva.',
    'Responda em no maximo 6 frases curtas.',
  ].join('\n')
}

function buildInput({
  message,
  section,
  organizationName,
  userRole,
  recentMessages,
  memories,
}: {
  message: string
  section: string
  organizationName?: string | null
  userRole?: string | null
  recentMessages: StoredConversationRow[]
  memories: StoredMemoryRow[]
}) {
  const memoryBlock = memories.length
    ? memories
        .map((memory, index) => `Memoria ${index + 1}: pergunta "${memory.question}" | resposta "${memory.answer}"`)
        .join('\n')
    : 'Nenhuma memoria relevante encontrada.'

  const recentBlock = recentMessages.length
    ? recentMessages
        .map((item) => `${item.role === 'assistant' ? 'AI' : 'Usuario'}: ${item.content}`)
        .join('\n')
    : 'Sem historico anterior nesta conversa.'

  return [
    `Organizacao: ${organizationName ?? 'Operacao principal'}`,
    `Perfil de quem perguntou: ${userRole ?? 'usuario interno'}`,
    `Modulo atual: ${section}`,
    `Guia do modulo: ${SECTION_GUIDES[section] ?? 'Ajuda operacional geral.'}`,
    `Historico recente:\n${recentBlock}`,
    `Memorias operacionais recuperadas:\n${memoryBlock}`,
    `Pergunta atual:\n${message}`,
  ].join('\n\n')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('OPENAI_API_KEY')

    if (!apiKey) {
      return Response.json({ error: 'OPENAI_API_KEY nao configurada' }, { status: 500, headers: corsHeaders })
    }

    const body = (await req.json()) as AssistantRequest
    const message = body.message?.trim()

    if (!message || !body.section || !body.organizationId || !body.conversationId) {
      return Response.json({ error: 'Campos obrigatorios ausentes' }, { status: 400, headers: corsHeaders })
    }

    const supabase = createSupabaseAdminClient()
    const queryTokens = tokenize(message)

    const [recentConversationResult, memoriesResult] = await Promise.all([
      supabase
        .from('ai_assistant_conversations')
        .select('id,role,content,section,created_at')
        .eq('organization_id', body.organizationId)
        .eq('conversation_id', body.conversationId)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('ai_assistant_memories')
        .select('id,section,question,answer,keywords,usage_count')
        .eq('organization_id', body.organizationId)
        .order('last_used_at', { ascending: false })
        .limit(80),
    ])

    const recentMessages = (((recentConversationResult.data as StoredConversationRow[] | null) ?? []).slice().reverse())
    const memoriesPool = (memoriesResult.data as StoredMemoryRow[] | null) ?? []
    const relevantMemories = memoriesPool
      .map((memory) => ({ memory, score: scoreMemory(memory, queryTokens, body.section) }))
      .filter((item) => item.score > 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, 5)
      .map((item) => item.memory)

    const userMessageInsert = await supabase
      .from('ai_assistant_conversations')
      .insert({
        conversation_id: body.conversationId,
        organization_id: body.organizationId,
        user_id: body.userId ?? null,
        section: body.section,
        role: 'user',
        content: message,
        metadata: {
          user_role: body.userRole ?? null,
          organization_name: body.organizationName ?? null,
          query_tokens: queryTokens,
        },
      })
      .select('id')
      .single()

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        instructions: buildInstructions(body.section),
        input: buildInput({
          message,
          section: body.section,
          organizationName: body.organizationName,
          userRole: body.userRole,
          recentMessages,
          memories: relevantMemories,
        }),
        max_output_tokens: 420,
      }),
    })

    const payload = (await response.json()) as Record<string, unknown>

    if (!response.ok) {
      const message = typeof payload.error === 'object' && payload.error && 'message' in payload.error
        ? String((payload.error as Record<string, unknown>).message)
        : 'Falha ao consultar OpenAI'

      return Response.json({ error: message }, { status: 500, headers: corsHeaders })
    }

    const answer = extractOutputText(payload)

    if (!answer) {
      return Response.json({ error: 'Resposta vazia da OpenAI' }, { status: 500, headers: corsHeaders })
    }

    await supabase.from('ai_assistant_conversations').insert({
      conversation_id: body.conversationId,
      organization_id: body.organizationId,
      user_id: body.userId ?? null,
      section: body.section,
      role: 'assistant',
      content: answer,
      metadata: {
        learned_from_memories: relevantMemories.length,
        model: OPENAI_MODEL,
      },
    })

    await supabase.from('ai_assistant_memories').insert({
      organization_id: body.organizationId,
      section: body.section,
      source_conversation_id: userMessageInsert.data?.id ?? null,
      created_by: body.userId ?? null,
      question: message,
      answer,
      keywords: queryTokens,
      usage_count: 1,
      last_used_at: new Date().toISOString(),
    })

    if (relevantMemories.length) {
      await Promise.all(
        relevantMemories.map((memory) =>
          supabase
            .from('ai_assistant_memories')
            .update({
              usage_count: memory.usage_count + 1,
              last_used_at: new Date().toISOString(),
            })
            .eq('id', memory.id),
        ),
      )
    }

    return Response.json(
      {
        content: answer,
        learnedFromMemories: relevantMemories.length,
        conversationId: body.conversationId,
      },
      { headers: corsHeaders },
    )
  } catch (error) {
    console.error('[ai-operational-assistant]', error)
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Falha inesperada ao processar assistente',
      },
      { status: 500, headers: corsHeaders },
    )
  }
})
