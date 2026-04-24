import { useState } from 'react'
import { ArrowLeft, ChevronDown, ExternalLink, Mail, MessageCircle } from 'lucide-react'
import { PublicLayout } from '@/features/public'
import { usePublicLocale } from '@/features/public/lib/public-locale'
import { useSeoMeta } from '@/shared/lib'

const SECOES = [
  {
    titulo: 'Criar meu primeiro evento',
    tituloEn: 'Create my first event',
    conteudo: (
      <ol className="list-none space-y-3">
        {[
          ['1', 'Acesse pulse.animalzgroup.com e crie sua conta de produtor.'],
          ['2', 'Clique em "Novo evento" e preencha as informações básicas: nome, data, local e capacidade.'],
          ['3', 'Adicione descrição, capa e galeria de mídia para a página pública do evento.'],
          ['4', 'Configure os ingressos e lotes (próxima seção).'],
          ['5', 'Publique o evento e compartilhe o link de venda. Pronto.'],
        ].map(([num, texto]) => (
          <li key={num} className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0057E7]/20 text-xs font-bold text-[#4285F4]">
              {num}
            </span>
            <span className="text-sm text-[#9a9088] leading-relaxed">{texto}</span>
          </li>
        ))}
      </ol>
    ),
    conteudoEn: (
      <ol className="list-none space-y-3">
        {[
          ['1', 'Go to pulse.animalzgroup.com and create your producer account.'],
          ['2', 'Click "New event" and fill in the basic info: name, date, venue and capacity.'],
          ['3', 'Add description, cover image and media gallery for the public event page.'],
          ['4', 'Configure tickets and batches (next section).'],
          ['5', 'Publish the event and share the sales link. Done.'],
        ].map(([num, texto]) => (
          <li key={num} className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0057E7]/20 text-xs font-bold text-[#4285F4]">
              {num}
            </span>
            <span className="text-sm text-[#9a9088] leading-relaxed">{texto}</span>
          </li>
        ))}
      </ol>
    ),
  },
  {
    titulo: 'Configurar ingressos e lotes',
    tituloEn: 'Configure tickets and batches',
    conteudo: (
      <div className="space-y-3 text-sm text-[#9a9088] leading-relaxed">
        <p>Crie múltiplos tipos de ingresso (ex: Pista, VIP, Camarote) com preços e capacidades independentes.</p>
        <p>Para cada tipo, crie lotes com preços diferentes. A virada de lote acontece automaticamente por data ou por quantidade vendida, você define o gatilho.</p>
        <p>Configure cupons de desconto (percentual ou valor fixo) e cortesias (ingressos gratuitos com código).</p>
        <p>Ingressos podem ser nominais (nome do comprador obrigatório) ou não-nominais. Você escolhe.</p>
      </div>
    ),
    conteudoEn: (
      <div className="space-y-3 text-sm text-[#9a9088] leading-relaxed">
        <p>Create multiple ticket types (e.g., Floor, VIP, Box) with independent prices and capacities.</p>
        <p>For each type, create batches with different prices. Batch turnover happens automatically by date or sold quantity, you set the trigger.</p>
        <p>Configure discount coupons (percentage or fixed value) and complimentary tickets (free tickets with code).</p>
        <p>Tickets can be nominal (buyer name required) or non-nominal. You choose.</p>
      </div>
    ),
  },
  {
    titulo: 'Convidar e gerenciar staff',
    tituloEn: 'Invite and manage staff',
    conteudo: (
      <div className="space-y-3 text-sm text-[#9a9088] leading-relaxed">
        <p>Na aba Staff do seu evento, clique em "Convidar" e envie o link de acesso para cada membro da equipe.</p>
        <p>Defina a função de cada pessoa: operador de check-in, supervisor, promoter ou coordenador. Cada função tem permissões específicas.</p>
        <p>Acompanhe quem está de pé, horário de entrada e saída, e registros de ponto em tempo real.</p>
        <p>Comunique mudanças de escala pelo próprio app, sem precisar de grupo de WhatsApp.</p>
      </div>
    ),
    conteudoEn: (
      <div className="space-y-3 text-sm text-[#9a9088] leading-relaxed">
        <p>In the Staff tab of your event, click "Invite" and send the access link to each team member.</p>
        <p>Set each person's role: check-in operator, supervisor, promoter or coordinator. Each role has specific permissions.</p>
        <p>Track who is on duty, entry and exit times, and time records in real time.</p>
        <p>Communicate schedule changes through the app itself, no WhatsApp group needed.</p>
      </div>
    ),
  },
  {
    titulo: 'Operar o check-in',
    tituloEn: 'Operate check-in',
    conteúdo: (
      <div className="space-y-3 text-sm text-[#9a9088] leading-relaxed">
        <p>Baixe o app Pulse (iOS ou Android) e faça login com as credenciais de operador.</p>
        <p>Escaneie o QR code do ingresso com a câmera do celular. O resultado é exibido em menos de 1 segundo.</p>
        <p>O modo kiosk bloqueia o app em tela de check-in, ideal para tablets fixos nas entradas.</p>
        <p>O modo offline sincroniza a lista de ingressos antes do evento. Em caso de queda de internet, o check-in continua funcionando normalmente.</p>
      </div>
    ),
    conteudoEn: (
      <div className="space-y-3 text-sm text-[#9a9088] leading-relaxed">
        <p>Download the Pulse app (iOS or Android) and log in with operator credentials.</p>
        <p>Scan the ticket QR code with your phone camera. Result is displayed in under 1 second.</p>
        <p>Kiosk mode locks the app on the check-in screen, ideal for fixed tablets at entrances.</p>
        <p>Offline mode syncs the ticket list before the event. If internet goes down, check-in continues working normally.</p>
      </div>
    ),
  },
  {
    titulo: 'Relatórios e financeiro',
    tituloEn: 'Reports and financials',
    conteúdo: (
      <div className="space-y-3 text-sm text-[#9a9088] leading-relaxed">
        <p>O dashboard mostra em tempo real: receita total, ticket médio, taxa de conversão, ingressos vendidos por lote e presença por hora.</p>
        <p>Exporte os dados em CSV para análise externa ou integração com planilhas.</p>
        <p>O repasse financeiro é processado automaticamente após o encerramento do evento. O prazo padrão é D+15, verifique as condições do seu plano.</p>
        <p>Você acompanha o status do repasse (pendente, em processamento, concluído) diretamente no painel financeiro.</p>
      </div>
    ),
    conteudoEn: (
      <div className="space-y-3 text-sm text-[#9a9088] leading-relaxed">
        <p>The dashboard shows in real time: total revenue, average ticket, conversion rate, tickets sold per batch and hourly attendance.</p>
        <p>Export data as CSV for external analysis or spreadsheet integration.</p>
        <p>Financial transfer is processed automatically after the event closes. Standard timeframe is D+15, check your plan conditions.</p>
        <p>Track transfer status (pending, processing, completed) directly in the financial panel.</p>
      </div>
    ),
  },
  {
    titulo: 'Configurar o supervisor',
    tituloEn: 'Configure supervisor view',
    conteúdo: (
      <div className="space-y-3 text-sm text-[#9a9088] leading-relaxed">
        <p>O supervisor tem uma visão consolidada do evento em tempo real: health score, ocupação por zona, status da equipe e ocorrências abertas.</p>
        <p>O health score é calculado automaticamente com base em velocidade de check-in, taxa de ocupação, ocorrências ativas e status do staff.</p>
        <p>Configure o mapa de zonas do evento e associe operadores a cada área para controle granular de acesso.</p>
        <p>Registre ocorrências (ocorrência de segurança, problema técnico, etc.) diretamente no app. O supervisor recebe alerta imediato e pode aprovar ações remotamente.</p>
      </div>
    ),
    conteudoEn: (
      <div className="space-y-3 text-sm text-[#9a9088] leading-relaxed">
        <p>The supervisor has a consolidated real-time view: health score, occupancy by zone, team status and open incidents.</p>
        <p>The health score is calculated automatically based on check-in speed, occupancy rate, active incidents and staff status.</p>
        <p>Configure the event zone map and assign operators to each área for granular access control.</p>
        <p>Log incidents (security, technical issue, etc.) directly in the app. The supervisor receives an immediate alert and can approve actions remotely.</p>
      </div>
    ),
  },
]

export function AjudaProdutoresPage({ onLogin }: { onLogin: () => void }) {
  const { isPortuguese } = usePublicLocale()
  const [aberto, setAberto] = useState<number | null>(0)

  useSeoMeta({
    title: isPortuguese ? 'Ajuda para Produtores | Pulse' : 'Producer Help | Pulse',
    description: isPortuguese
      ? 'Como criar eventos, configurar ingressos, gerenciar staff e receber seus repasses na plataforma Pulse.'
      : 'How to create events, configure tickets, manage staff and receive your transfers on the Pulse platform.',
  })

  return (
    <PublicLayout onLogin={onLogin}>
      {/* Hero */}
      <section className="px-5 py-20 md:px-10 lg:px-16">
        <div className="mx-auto max-w-3xl">
          <a
            href="/ajuda"
            className="inline-flex items-center gap-2 text-sm text-[#9a9088] hover:text-[#f0ebe2] transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            {isPortuguese ? 'Central de Ajuda' : 'Help Center'}
          </a>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-4 py-1.5 text-[11px] uppercase tracking-widest text-[#9a9088] mb-6">
            {isPortuguese ? 'Para produtores' : 'For producers'}
          </div>
          <h1 className="text-3xl font-bold text-[#f0ebe2] md:text-4xl leading-tight">
            {isPortuguese
              ? 'Ajuda para produtores de eventos'
              : 'Help for event producers'}
          </h1>
          <p className="mt-4 text-[#9a9088]">
            {isPortuguese
              ? 'Tudo que você precisa para criar, operar e analisar seus eventos na plataforma Pulse.'
              : 'Everything you need to create, operate and analyze your events on the Pulse platform.'}
          </p>
        </div>
      </section>

      {/* Accordion */}
      <section className="px-5 pb-10 md:px-10 lg:px-16">
        <div className="mx-auto max-w-3xl flex flex-col gap-3">
          {SECOES.map((secao, i) => (
            <div key={i} className="rounded-2xl bg-white/5 border border-white/8 overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-white/5 transition-colors"
                onClick={() => setAberto(aberto === i ? null : i)}
              >
                <span className="font-semibold text-[#f0ebe2]">
                  {isPortuguese ? secao.titulo : secao.tituloEn}
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-[#9a9088] shrink-0 transition-transform duration-200 ${aberto === i ? 'rotate-180' : ''}`}
                />
              </button>
              {aberto === i && (
                <div className="px-6 pb-6 border-t border-white/8 pt-5">
                  {isPortuguese ? secao.conteúdo : secao.conteudoEn}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Link API */}
      <section className="px-5 py-8 md:px-10 lg:px-16">
        <div className="mx-auto max-w-3xl">
          <a
            href="/api"
            className="group flex items-center justify-between rounded-2xl bg-white/5 border border-white/8 p-6 hover:bg-white/8 transition-colors"
          >
            <div>
              <h3 className="font-semibold text-[#f0ebe2] mb-1">
                {isPortuguese ? 'Documentação da API' : 'API Documentation'}
              </h3>
              <p className="text-sm text-[#9a9088]">
                {isPortuguese
                  ? 'Integre a Pulse com seus sistemas via API REST.'
                  : 'Integrate Pulse with your systems via REST API.'}
              </p>
            </div>
            <ExternalLink className="h-5 w-5 text-[#4285F4] shrink-0 ml-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      </section>

      {/* Contato prioritário */}
      <section className="px-5 py-16 md:px-10 lg:px-16">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-[#0057E7]/30 bg-[#0057E7]/8 p-8 text-center">
            <h2 className="text-xl font-bold text-[#f0ebe2] mb-2">
              {isPortuguese ? 'Suporte prioritário para produtores' : 'Priority support for producers'}
            </h2>
            <p className="text-[#9a9088] mb-6 text-sm">
              {isPortuguese
                ? 'Produtores com eventos ativos têm atendimento imediato pelo WhatsApp durante a operação.'
                : 'Producers with active events get immediate support on WhatsApp during operations.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://wa.me/14698629040"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0057E7] px-6 py-3 text-sm font-bold text-white hover:bg-[#4285F4] transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
              <a
                href="mailto:contatopulse@animalzgroup.com"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/18 px-6 py-3 text-sm text-white hover:bg-white/8 transition-colors"
              >
                <Mail className="h-4 w-4" />
                Email
              </a>
            </div>
            <p className="mt-4 text-xs text-[#9a9088]">+1 (469) 862-9040</p>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
