import { useMemo, useState } from 'react'
import { ArrowRight, Bot, MessageSquare, Send, Sparkles, X } from 'lucide-react'
import type { NavSection } from '@/app/layout'
import { cn } from '@/shared/lib'

interface OperationalAssistantProps {
  activeSection: NavSection
  onNavigate: (section: NavSection) => void
}

interface AssistantReply {
  content: string
  actions?: Array<{ label: string; section: NavSection }>
}

interface AssistantMessage {
  id: string
  role: 'assistant' | 'user'
  content: string
  actions?: Array<{ label: string; section: NavSection }>
}

const SECTION_TITLES: Record<NavSection, string> = {
  dashboard: 'Painel',
  events: 'Eventos',
  tickets: 'Ingressos',
  sales: 'Vendas',
  crm: 'Relacionamento',
  checkin: 'Credenciamento',
  staff: 'Staff',
  suppliers: 'Fornecedores',
  products: 'PDV',
  inventory: 'Estoque',
  intelligence: 'Inteligencia',
  communication: 'Comunicacao',
  financial: 'Financeiro',
  billing: 'Cobranca',
  growth: 'Crescimento',
  help: 'Ajuda',
  settings: 'Configuracoes',
}

const SECTION_PROMPTS: Record<NavSection, string[]> = {
  dashboard: ['O que olhar primeiro hoje?', 'Como acompanhar a operacao?', 'Quais modulos eu uso agora?'],
  events: ['Como publicar um evento?', 'Onde ajusto agenda e local?', 'Como revisar configuracao?'],
  tickets: ['Como montar lotes?', 'Onde mexo em precos?', 'Como abrir novos ingressos?'],
  sales: ['Como acompanhar pagamentos?', 'Onde vejo pedidos?', 'Como agir em venda travada?'],
  crm: ['Como organizar publico?', 'Onde encontro recorrencia?', 'Como trabalhar relacionamento?'],
  checkin: ['Como configurar acesso?', 'Onde vejo filas e entradas?', 'Como liberar excecao?'],
  staff: ['Como cadastrar a equipe?', 'Onde aloco por turno?', 'Como emitir credencial?'],
  suppliers: ['Como organizar fornecedores?', 'Onde controlar parceiros?', 'Como registrar entregas?'],
  products: ['Como vender no PDV?', 'Onde monto o catalogo?', 'Como separar PDV de estoque?'],
  inventory: ['Como controlar ruptura?', 'Onde vejo reposicao?', 'Como diferenciar estoque de PDV?'],
  intelligence: ['Quais alertas importam?', 'Onde vejo anomalias?', 'Como ler a operacao?'],
  communication: ['Como disparar campanhas?', 'Onde vejo jornadas?', 'Como acionar publico?'],
  financial: ['Onde fecho caixa?', 'Como acompanhar margem?', 'Como revisar repasses?'],
  billing: ['Como ajustar plano?', 'Onde vejo cobranca?', 'Como entender monetizacao?'],
  growth: ['Como ativar aquisicao?', 'Onde acompanho canais?', 'Como ler retorno?'],
  help: ['Quero ajuda geral', 'Quais modulos devo usar?', 'Como treinar a equipe?'],
  settings: ['Onde ajustar marca?', 'Como trocar dominio?', 'Como rever permissoes?'],
}

function createDefaultReply(section: NavSection): AssistantReply {
  const title = SECTION_TITLES[section]

  switch (section) {
    case 'products':
      return {
        content:
          'Aqui voce vende. Use PDV para montar o catalogo comercial, abrir pedido rapido e treinar a equipe de caixa. Se a sua duvida for saldo, ruptura ou reposicao, a area certa e Estoque.',
        actions: [
          { label: 'Abrir Estoque', section: 'inventory' },
          { label: 'Abrir Staff', section: 'staff' },
        ],
      }
    case 'inventory':
      return {
        content:
          'Aqui voce controla disponibilidade. Estoque serve para entender saldo, ruptura, prioridade de reposicao e valor parado. Venda rapida e operacao de caixa continuam no PDV.',
        actions: [
          { label: 'Abrir PDV', section: 'products' },
          { label: 'Abrir Financeiro', section: 'financial' },
        ],
      }
    case 'staff':
      return {
        content:
          'Staff e o modulo de pessoas da operacao. Cadastre dados basicos, defina area e turno, depois libere permissoes e credencial. Publico entra por Credenciamento; equipe opera por Staff.',
        actions: [
          { label: 'Abrir Credenciamento', section: 'checkin' },
          { label: 'Abrir Ajuda', section: 'help' },
        ],
      }
    default:
      return {
        content: `Estou olhando ${title}. Posso te orientar sobre o objetivo desse modulo, o proximo passo operacional e qual outra area usar quando essa nao for a tela certa.`,
        actions: [
          { label: 'Abrir Ajuda', section: 'help' },
          { label: 'Voltar ao Painel', section: 'dashboard' },
        ],
      }
  }
}

function generateReply(query: string, section: NavSection): AssistantReply {
  const normalized = query.toLowerCase()

  if (normalized.includes('pdv') || normalized.includes('venda') || normalized.includes('caixa')) {
    return {
      content:
        'PDV fica responsavel por vender rapido: selecionar item, montar pedido, cobrar e concluir atendimento. Quando a pergunta for saldo disponivel, alerta de ruptura ou reposicao, use Estoque.',
      actions: [{ label: 'Ir para PDV', section: 'products' }, { label: 'Ir para Estoque', section: 'inventory' }],
    }
  }

  if (normalized.includes('estoque') || normalized.includes('ruptura') || normalized.includes('repos')) {
    return {
      content:
        'Estoque e o centro de controle dos itens. Ele mostra saldo, threshold, itens criticos e risco operacional. O time comercial continua vendendo no PDV, sem misturar a leitura.',
      actions: [{ label: 'Abrir Estoque', section: 'inventory' }, { label: 'Abrir Financeiro', section: 'financial' }],
    }
  }

  if (normalized.includes('staff') || normalized.includes('equipe') || normalized.includes('cadastro') || normalized.includes('credencial')) {
    return {
      content:
        'Para staff, pense em tres passos: identificar a pessoa, alocar em area e turno, e liberar acesso operacional. Se a pessoa vai operar o evento, ela nasce em Staff; se vai apenas entrar no evento, a logica e outra.',
      actions: [{ label: 'Abrir Staff', section: 'staff' }, { label: 'Abrir Credenciamento', section: 'checkin' }],
    }
  }

  if (normalized.includes('financeiro') || normalized.includes('margem') || normalized.includes('repasse')) {
    return {
      content:
        'Financeiro concentra margem, repasse e fechamento. Use esta area para leitura de resultado; PDV e Estoque alimentam a operacao, mas o fechamento acontece no Financeiro.',
      actions: [{ label: 'Abrir Financeiro', section: 'financial' }, { label: 'Abrir PDV', section: 'products' }],
    }
  }

  if (normalized.includes('onde') || normalized.includes('qual') || normalized.includes('usar')) {
    return createDefaultReply(section)
  }

  return {
    content:
      'Posso te orientar com proximo passo, diferenca entre modulos e fluxo operacional. Se quiser ir direto ao ponto, pergunte por cadastro de staff, venda no PDV, ruptura de estoque ou leitura financeira.',
    actions: createDefaultReply(section).actions,
  }
}

export function OperationalAssistant({ activeSection, onNavigate }: OperationalAssistantProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const defaultReply = useMemo(() => createDefaultReply(activeSection), [activeSection])
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'assistant-welcome',
      role: 'assistant',
      content: defaultReply.content,
      actions: defaultReply.actions,
    },
  ])

  const promptSuggestions = SECTION_PROMPTS[activeSection]

  function pushAssistantReply(reply: AssistantReply) {
    setMessages((current) => [
      ...current,
      {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: reply.content,
        actions: reply.actions,
      },
    ])
  }

  function handlePrompt(prompt: string) {
    const userMessage: AssistantMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt,
    }

    setMessages((current) => [...current, userMessage])
    pushAssistantReply(generateReply(prompt, activeSection))
  }

  function handleSubmit() {
    if (!query.trim()) {
      return
    }

    handlePrompt(query.trim())
    setQuery('')
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={cn(
          'fixed bottom-5 right-5 z-40 inline-flex items-center gap-3 rounded-full border px-4 py-3 text-sm font-medium shadow-[0_26px_80px_rgba(0,0,0,0.45)] transition-all duration-300',
          open
            ? 'border-[#ae936f]/30 bg-[#181412] text-[#ebe7e0]'
            : 'border-[#d62a0b]/25 bg-[#d62a0b] text-[#090807] hover:-translate-y-0.5',
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
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.34em] text-[#ae936f]">
                  <Sparkles className="h-3.5 w-3.5" />
                  Assistente operacional
                </div>
                <h3 className="mt-3 font-display text-[2rem] leading-none tracking-[-0.04em] text-[#ebe7e0]">
                  {SECTION_TITLES[activeSection]}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#b8b0a8]/72">
                  Responde duvidas rapidas e te aponta o modulo certo da operacao.
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
                  onClick={() => handlePrompt(prompt)}
                  className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-2 text-xs font-medium text-[#b8b0a8] transition-all hover:border-[#ae936f]/25 hover:text-[#ebe7e0]"
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
                    : 'ml-8 border-[#d62a0b]/18 bg-[#d62a0b]/10 text-[#f3dfd8]',
                )}
              >
                <div className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-[#ae936f]">
                  {message.role === 'assistant' ? <Bot className="h-3.5 w-3.5" /> : <MessageSquare className="h-3.5 w-3.5" />}
                  {message.role === 'assistant' ? 'AI' : 'Voce'}
                </div>
                <p>{message.content}</p>

                {message.actions?.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {message.actions.map((action) => (
                      <button
                        key={`${message.id}-${action.section}`}
                        type="button"
                        onClick={() => onNavigate(action.section)}
                        className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-2 text-xs font-medium text-[#ebe7e0] transition-all hover:border-[#ae936f]/25"
                      >
                        {action.label}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <div className="border-t border-white/6 px-5 py-4">
            <div className="flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3 py-2">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleSubmit()
                  }
                }}
                placeholder="Pergunte sobre modulo, fluxo ou proximo passo..."
                className="flex-1 bg-transparent text-sm text-[#ebe7e0] outline-none placeholder:text-[#6f6660]"
              />
              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#d62a0b] text-[#090807] transition-all hover:-translate-y-0.5"
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
