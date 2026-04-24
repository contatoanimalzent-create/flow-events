import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Bot, Loader2, MessageSquare, Send, Sparkles, X } from 'lucide-react'
import type { NavSection } from '@/app/layout'
import { useAuthStore } from '@/features/auth'
import { assistantService } from '@/features/ai/services/assistant.service'
import { cn } from '@/shared/lib'

interface OperationalAssistantProps {
  activeSection: NavSection
  onNavigate: (section: NavSection) => void
}

interface AssistantMessage {
  id: string
  role: 'assistant' | 'user'
  content: string
  actions?: Array<{ label: string; section: NavSection }>
  meta?: string
}

const SECTION_TITLES: Record<NavSection, string> = {
  dashboard: 'Painel',
  events: 'Eventos',
  tickets: 'Ingressos',
  sales: 'Vendas',
  crm: 'Relacionamento',
  checkin: 'Check-in',
  staff: 'Staff',
  suppliers: 'Fornecedores',
  products: 'PDV',
  inventory: 'Estoque',
  intelligence: 'Inteligência',
  communication: 'Comunicacao',
  financial: 'Financeiro',
  billing: 'Cobranca',
  growth: 'Crescimento',
  help: 'Ajuda',
  settings: 'Configuracoes',
  registrations: 'Credenciamento',
  sponsors: 'Patrocinios',
  coupons: 'Cupons',
  waitlist: 'Lista de Espera',
  map: 'Mapa Operacional',
  organizations: 'Organizacoes',
  community: 'Comunidade',
  monetization: 'Monetizacao',
  audit: 'Auditoria',
}

const SECTION_PROMPTS: Record<NavSection, string[]> = {
  dashboard: ['O que olhar primeiro hoje?', 'Como acompanhar a operação?', 'Quais módulos eu uso agora?'],
  events: ['Como publicar um evento?', 'Onde ajusto agenda e local?', 'Como revisar configuração?'],
  tickets: ['Como montar lotes?', 'Onde mexo em preços?', 'Como abrir novos ingressos?'],
  sales: ['Como acompanhar pagamentos?', 'Onde vejo pedidos?', 'Como agir em venda travada?'],
  crm: ['Como organizar público?', 'Onde encontro recorrência?', 'Como trabalhar relacionamento?'],
  checkin: ['Como acompanhar filas?', 'Onde vejo leituras em tempo real?', 'Como tratar uma exceção no acesso?'],
  staff: ['Como cadastrar a equipe?', 'Onde aloco por turno?', 'Como emitir credencial?'],
  suppliers: ['Como organizar fornecedores?', 'Onde controlar parceiros?', 'Como registrar entregas?'],
  products: ['Como vender no PDV?', 'Onde monto o catálogo?', 'Como separar PDV de estoque?'],
  inventory: ['Como controlar ruptura?', 'Onde vejo reposicao?', 'Como diferenciar estoque de PDV?'],
  intelligence: ['Quais alertas importam?', 'Onde vejo anomalias?', 'Como ler a operação?'],
  communication: ['Como disparar campanhas?', 'Onde vejo jornadas?', 'Como acionar público?'],
  financial: ['Onde fecho caixa?', 'Como acompanhar margem?', 'Como revisar repasses?'],
  billing: ['Como ajustar plano?', 'Onde vejo cobranca?', 'Como entender monetização?'],
  growth: ['Como ativar aquisição?', 'Onde acompanho canais?', 'Como ler retorno?'],
  help: ['Quero ajuda geral', 'Quais módulos devo usar?', 'Como treinar a equipe?'],
  settings: ['Onde ajustar marca?', 'Como trocar domínio?', 'Como rever permissões?'],
  registrations: ['Como emitir credenciais?', 'Onde filtro listas e perfis?', 'Como exportar a base habilitada?'],
  sponsors: ['Como organizar cotas?', 'Onde acompanho patrocinadores ativos?', 'Como registrar entregas de marca?'],
  coupons: ['Como criar um cupom?', 'Onde vejo usos por cupom?', 'Como limitar desconto por pedido?'],
  waitlist: ['Como notificar a lista de espera?', 'Onde vejo posicoes?', 'Como converter espera em venda?'],
  map: ['Como ver a ocupacao ao vivo?', 'Onde monitoro o staff?', 'Como identificar zonas críticas?'],
  organizations: ['Como configurar a organização?', 'Onde gerencio membros?', 'Como rever permissões?'],
  community: ['Como moderar o feed?', 'Onde gerencio anuncios?', 'Como ativar networking?'],
  monetization: ['Como criar uma oferta?', 'Onde vejo receita interna?', 'Como ativar ativacoes de marca?'],
  audit: ['Como exportar logs?', 'Onde vejo eventos de segurança?', 'Como filtrar por severidade?'],
}

function buildSuggestedActions(query: string, section: NavSection) {
  const normalized = query.toLowerCase()

  if (normalized.includes('pdv') || normalized.includes('venda') || normalized.includes('caixa')) {
    return [
      { label: 'Ir para PDV', section: 'products' as const },
      { label: 'Ir para Estoque', section: 'inventory' as const },
    ]
  }

  if (normalized.includes('estoque') || normalized.includes('ruptura') || normalized.includes('repos')) {
    return [
      { label: 'Abrir Estoque', section: 'inventory' as const },
      { label: 'Abrir Financeiro', section: 'financial' as const },
    ]
  }

  if (normalized.includes('staff') || normalized.includes('equipe') || normalized.includes('cadastro') || normalized.includes('credencial')) {
    return [
      { label: 'Abrir Staff', section: 'staff' as const },
      { label: 'Abrir Check-in', section: 'checkin' as const },
    ]
  }

  if (normalized.includes('patrocin') || normalized.includes('cota') || normalized.includes('marca parceira')) {
    return [
      { label: 'Abrir Patrocinios', section: 'sponsors' as const },
      { label: 'Abrir Financeiro', section: 'financial' as const },
    ]
  }

  if (section === 'products') {
    return [
      { label: 'Abrir Estoque', section: 'inventory' as const },
      { label: 'Abrir Staff', section: 'staff' as const },
    ]
  }

  if (section === 'inventory') {
    return [
      { label: 'Abrir PDV', section: 'products' as const },
      { label: 'Abrir Financeiro', section: 'financial' as const },
    ]
  }

  if (section === 'staff') {
    return [
      { label: 'Abrir Check-in', section: 'checkin' as const },
      { label: 'Abrir Ajuda', section: 'help' as const },
    ]
  }

  if (section === 'sponsors') {
    return [
      { label: 'Abrir Financeiro', section: 'financial' as const },
      { label: 'Voltar ao Painel', section: 'dashboard' as const },
    ]
  }

  return [
    { label: 'Abrir Ajuda', section: 'help' as const },
    { label: 'Voltar ao Painel', section: 'dashboard' as const },
  ]
}

function buildFallbackReply(query: string, section: NavSection) {
  const normalized = query.toLowerCase()

  if (normalized.includes('pdv') || normalized.includes('venda') || normalized.includes('caixa')) {
    return 'PDV fica responsável por vender rápido: selecionar item, montar pedido, cobrar e concluir atendimento. Quando a pergunta for saldo disponível, alerta de ruptura ou reposicao, use Estoque.'
  }

  if (normalized.includes('estoque') || normalized.includes('ruptura') || normalized.includes('repos')) {
    return 'Estoque e o centro de controle dos itens. Ele mostra saldo, threshold, itens críticos e risco operacional. O time comercial continua vendendo no PDV, sem misturar a leitura.'
  }

  if (normalized.includes('staff') || normalized.includes('equipe') || normalized.includes('cadastro') || normalized.includes('credencial')) {
    return 'Para staff, pense em tres passos: identificar a pessoa, alocar em área e turno, e liberar acesso operacional. Se a pessoa vai operar o evento, ela nasce em Staff; se vai apenas entrar no evento, a lógica e outra.'
  }

  if (normalized.includes('patrocin') || normalized.includes('cota') || normalized.includes('marca parceira')) {
    return 'Patrocinios concentram cotas comerciais, status de negociacao, entregas prometidas e investimento por marca. Quando a conversa for fornecedor operacional ou terceirizacao da execução, use Fornecedores.'
  }

  return `Estou olhando ${SECTION_TITLES[section]}. Posso te orientar sobre o objetivo desse módulo, o próximo passo operacional e qual outra área usar quando essa não for a tela certa.`
}

function getConversationStorageKey(organizationId?: string | null) {
  return `pulse-operational-ai-thread:${organizationId ?? 'global'}`
}

function createConversationId() {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID()
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (character) => {
    const random = Math.floor(Math.random() * 16)
    const value = character === 'x' ? random : (random & 0x3) | 0x8
    return value.toString(16)
  })
}

export function OperationalAssistant({ activeSection, onNavigate }: OperationalAssistantProps) {
  const organization = useAuthStore((state) => state.organization)
  const profile = useAuthStore((state) => state.profile)
  const user = useAuthStore((state) => state.user)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState('')
  const [messages, setMessages] = useState<AssistantMessage[]>([])

  const promptSuggestions = SECTION_PROMPTS[activeSection]
  const welcomeMessage = useMemo<AssistantMessage>(() => {
    const section = SECTION_TITLES[activeSection]

    return {
      id: `assistant-welcome-${activeSection}`,
      role: 'assistant',
      content: `Estou acompanhando ${section}. Posso te orientar no módulo atual, diferenciar areas parecidas do produto e usar a memoria das dúvidas anteriores da operação para responder melhor.`,
      actions: buildSuggestedActions(section, activeSection),
      meta: 'Memoria operacional ativa',
    }
  }, [activeSection])

  useEffect(() => {
    setMessages((current) => {
      if (!current.length) {
        return [welcomeMessage]
      }

      const first = current[0]
      if (first?.id?.startsWith('assistant-welcome-')) {
        return [welcomeMessage, ...current.slice(1)]
      }

      return [welcomeMessage, ...current]
    })
  }, [welcomeMessage])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const storageKey = getConversationStorageKey(organization?.id)
    const existing = window.localStorage.getItem(storageKey)

    if (existing) {
      setConversationId(existing)
      return
    }

    const nextConversationId = createConversationId()
    window.localStorage.setItem(storageKey, nextConversationId)
    setConversationId(nextConversationId)
  }, [organization?.id])

  async function askAssistant(prompt: string) {
    const trimmedPrompt = prompt.trim()

    if (!trimmedPrompt) {
      return
    }

    const userMessage: AssistantMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmedPrompt,
    }

    setMessages((current) => [...current, userMessage])
    setIsLoading(true)

    try {
      if (!organization?.id || !conversationId) {
        throw new Error('AI ainda sem contexto da organização')
      }

      const result = await assistantService.ask({
        message: trimmedPrompt,
        section: activeSection,
        conversationId,
        organizationId: organization.id,
        organizationName: organization.name,
        userId: user?.id ?? profile?.id ?? null,
        userRole: profile?.role ?? null,
      })

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: result.content,
          actions: buildSuggestedActions(trimmedPrompt, activeSection),
          meta: result.learnedFromMemories > 0 ? `Aprendeu com ${result.learnedFromMemories} memoria(s)` : 'Nova memoria registrada',
        },
      ])
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: `assistant-fallback-${Date.now()}`,
          role: 'assistant',
          content: buildFallbackReply(trimmedPrompt, activeSection),
          actions: buildSuggestedActions(trimmedPrompt, activeSection),
          meta: 'Fallback local enquanto a chave nova não entra',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubmit() {
    if (!query.trim() || isLoading) {
      return
    }

    const prompt = query.trim()
    setQuery('')
    await askAssistant(prompt)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          'fixed bottom-5 right-5 z-40 inline-flex items-center gap-3 rounded-full border px-4 py-3 text-sm font-medium shadow-[0_26px_80px_rgba(0,0,0,0.45)] transition-all duration-300',
          open
            ? 'border-[#4285F4]/30 bg-[#181412] text-[#ebe7e0]'
            : 'border-[#0057E7]/25 bg-[#0057E7] text-[#090807] hover:-translate-y-0.5',
        )}
      >
        {open ? <X className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        {open ? 'Fechar AI' : 'AI Operacional'}
      </button>

      {open ? (
        <div className="fixed bottom-24 right-5 z-40 w-[min(420px,calc(100vw-2rem))] overflow-hidden rounded-[2rem] border border-white/8 bg-[#12100f] shadow-[0_30px_120px_rgba(0,0,0,0.62)]">
          <div className="border-b border-white/6 px-5 py-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.34em] text-[#4285F4]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Assistente operacional
                </div>
                <h3 className="mt-3 font-display text-[2rem] leading-none tracking-[-0.04em] text-[#ebe7e0]">
                  {SECTION_TITLES[activeSection]}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#b8b0a8]/72">
                  Presente no app inteiro, com memoria das dúvidas operacionais da sua equipe.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/8 bg-white/[0.03] text-[#8e847d] transition-all hover:text-[#ebe7e0]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="max-h-[420px] space-y-4 overflow-y-auto px-5 py-5">
            <div className="flex flex-wrap gap-2">
              {promptSuggestions.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => void askAssistant(prompt)}
                  disabled={isLoading}
                  className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-2 text-xs font-medium text-[#b8b0a8] transition-all hover:border-[#4285F4]/25 hover:text-[#ebe7e0] disabled:opacity-45"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'rounded-[1.5rem] border px-4 py-4 text-sm leading-6',
                  message.role === 'assistant'
                    ? 'border-white/8 bg-white/[0.03] text-[#ebe7e0]'
                    : 'ml-8 border-[#0057E7]/18 bg-[#0057E7]/10 text-[#f3dfd8]',
                )}
              >
                <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-[#4285F4]">
                  {message.role === 'assistant' ? <Bot className="h-3.5 w-3.5" /> : <MessageSquare className="h-3.5 w-3.5" />}
                  {message.role === 'assistant' ? 'AI' : 'Você'}
                </div>
                <p>{message.content}</p>

                {message.meta ? <div className="mt-3 text-[11px] uppercase tracking-[0.2em] text-[#8e847d]">{message.meta}</div> : null}

                {message.actions?.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {message.actions.map((action) => (
                      <button
                        key={`${message.id}-${action.section}`}
                        type="button"
                        onClick={() => onNavigate(action.section)}
                        className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-2 text-xs font-medium text-[#ebe7e0] transition-all hover:border-[#4285F4]/25"
                      >
                        {action.label}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}

            {isLoading ? (
              <div className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] px-4 py-4 text-sm text-[#ebe7e0]">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-4 w-4 animate-spin text-[#4285F4]" />
                  Pensando com base no contexto do app e nas memorias anteriores...
                </div>
              </div>
            ) : null}
          </div>

          <div className="border-t border-white/6 px-5 py-4">
            <div className="flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-2">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    void handleSubmit()
                  }
                }}
                placeholder="Pergunte sobre módulo, fluxo ou próximo passo..."
                className="flex-1 bg-transparent text-sm text-[#ebe7e0] outline-none placeholder:text-[#6f6660]"
              />
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={isLoading}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#0057E7] text-[#090807] transition-all hover:-translate-y-0.5 disabled:opacity-45"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
