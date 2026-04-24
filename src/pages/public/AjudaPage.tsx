import { useState } from 'react'
import { ChevronDown, ChevronRight, Mail, MessageCircle, ShoppingBag, Users } from 'lucide-react'
import { PublicLayout } from '@/features/public'
import { usePublicLocale } from '@/features/public/lib/public-locale'
import { useSeoMeta } from '@/shared/lib'

const FAQ = [
  {
    pergunta: 'O que é a Pulse?',
    perguntaEn: 'What is Pulse?',
    resposta:
      'Pulse é uma plataforma SaaS para gestão completa de eventos. Ela centraliza venda de ingressos, check-in por QR code, gestão de staff, supervisão em tempo real e repasse financeiro em um único sistema.',
    respostaEn:
      'Pulse is a SaaS platform for complete event management. It centralizes ticket sales, QR code check-in, staff management, real-time supervision and financial transfer in a single system.',
  },
  {
    pergunta: 'A plataforma funciona para qualquer tipo de evento?',
    perguntaEn: 'Does the platform work for any type of event?',
    resposta:
      'Sim. A Pulse é usada em festas, shows, eventos corporativos, conferências, eventos esportivos, jantares gastronômicos e muito mais. Se tem ingressos e equipe, a Pulse gerencia.',
    respostaEn:
      'Yes. Pulse is used at parties, concerts, corporate events, conferences, sports events, gastronomic dinners and much more. If it has tickets and a team, Pulse manages it.',
  },
  {
    pergunta: 'O check-in funciona sem internet?',
    perguntaEn: 'Does check-in work without internet?',
    resposta:
      'Sim. O app de check-in da Pulse tem modo offline completo. Ele sincroniza os dados quando a conexão é retomada. Eventos em locais com sinal fraco funcionam normalmente.',
    respostaEn:
      'Yes. The Pulse check-in app has full offline mode. It syncs data when connection is restored. Events in locations with weak signal work normally.',
  },
  {
    pergunta: 'Como faço para criar minha conta?',
    perguntaEn: 'How do I create my account?',
    resposta:
      'Acesse pulse.animalzgroup.com/create-event, preencha seus dados e crie seu primeiro evento em menos de 5 minutos. Não há taxa de setup.',
    respostaEn:
      'Go to pulse.animalzgroup.com/create-event, fill in your details and create your first event in less than 5 minutes. No setup fee.',
  },
  {
    pergunta: 'Há suporte em tempo real?',
    perguntaEn: 'Is there real-time support?',
    resposta:
      'Sim. Nossa equipe está disponível pelo WhatsApp +1 (469) 862-9040. Produtores com eventos ativos têm atendimento prioritário durante a operação.',
    respostaEn:
      'Yes. Our team is available on WhatsApp +1 (469) 862-9040. Producers with active events get priority support during operations.',
  },
  {
    pergunta: 'Em quais dispositivos funciona?',
    perguntaEn: 'What devices does it work on?',
    resposta:
      'A plataforma de gestão funciona em qualquer navegador web (desktop e mobile). O app de check-in e operação está disponível para iOS e Android.',
    respostaEn:
      'The management platform works in any web browser (desktop and mobile). The check-in and operations app is available for iOS and Android.',
  },
]

export function AjudaPage({ onLogin }: { onLogin: () => void }) {
  const { isPortuguese } = usePublicLocale()
  const [aberto, setAberto] = useState<number | null>(null)

  useSeoMeta({
    title: isPortuguese ? 'Central de Ajuda | Pulse' : 'Help Center | Pulse',
    description: isPortuguese
      ? 'Encontre respostas para as dúvidas mais comuns sobre a plataforma Pulse. Suporte para compradores e produtores.'
      : 'Find answers to the most common questions about the Pulse platform. Support for buyers and producers.',
  })

  return (
    <PublicLayout onLogin={onLogin}>
      {/* Hero */}
      <section className="px-5 py-20 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-4 py-1.5 text-[11px] uppercase tracking-widest text-[#9a9088] mb-6">
            {isPortuguese ? 'Ajuda' : 'Help'}
          </div>
          <h1 className="text-4xl font-bold text-[#f0ebe2] md:text-5xl max-w-2xl mx-auto leading-tight">
            {isPortuguese ? 'Como podemos ajudar?' : 'How can we help?'}
          </h1>
          <p className="mt-5 max-w-md mx-auto text-lg text-[#9a9088]">
            {isPortuguese
              ? 'Encontre respostas rápidas ou fale diretamente com a nossa equipe.'
              : 'Find quick answers or talk directly to our team.'}
          </p>
        </div>
      </section>

      {/* Cards de acesso rápido */}
      <section className="px-5 pb-16 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-5 sm:grid-cols-2 max-w-2xl mx-auto">
            <a
              href="/ajuda/compradores"
              className="group rounded-2xl bg-white/5 border border-white/8 p-8 flex flex-col items-center text-center hover:bg-white/8 transition-colors"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0057E7]/15">
                <ShoppingBag className="h-7 w-7 text-[#4285F4]" />
              </div>
              <h2 className="text-lg font-bold text-[#f0ebe2] mb-2">
                {isPortuguese ? 'Sou comprador' : "I'm a buyer"}
              </h2>
              <p className="text-sm text-[#9a9088] mb-4">
                {isPortuguese
                  ? 'Ingressos, QR code, pagamento, cancelamento.'
                  : 'Tickets, QR code, payment, cancellation.'}
              </p>
              <div className="flex items-center gap-1.5 text-sm text-[#4285F4] font-medium">
                {isPortuguese ? 'Ver ajuda' : 'See help'}
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </a>
            <a
              href="/ajuda/produtores"
              className="group rounded-2xl bg-white/5 border border-white/8 p-8 flex flex-col items-center text-center hover:bg-white/8 transition-colors"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0057E7]/15">
                <Users className="h-7 w-7 text-[#4285F4]" />
              </div>
              <h2 className="text-lg font-bold text-[#f0ebe2] mb-2">
                {isPortuguese ? 'Sou produtor' : "I'm a producer"}
              </h2>
              <p className="text-sm text-[#9a9088] mb-4">
                {isPortuguese
                  ? 'Criar evento, ingressos, staff, check-in, repasse.'
                  : 'Create event, tickets, staff, check-in, transfer.'}
              </p>
              <div className="flex items-center gap-1.5 text-sm text-[#4285F4] font-medium">
                {isPortuguese ? 'Ver ajuda' : 'See help'}
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-5 py-10 md:px-10 lg:px-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-[#f0ebe2] mb-8">
            {isPortuguese ? 'Perguntas frequentes' : 'Frequently asked questions'}
          </h2>
          <div className="flex flex-col gap-3">
            {FAQ.map((item, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white/5 border border-white/8 overflow-hidden"
              >
                <button
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/5 transition-colors"
                  onClick={() => setAberto(aberto === i ? null : i)}
                >
                  <span className="font-medium text-[#f0ebe2] pr-4">
                    {isPortuguese ? item.pergunta : item.perguntaEn}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-[#9a9088] shrink-0 transition-transform duration-200 ${aberto === i ? 'rotate-180' : ''}`}
                  />
                </button>
                {aberto === i && (
                  <div className="px-6 pb-5">
                    <p className="text-sm text-[#9a9088] leading-relaxed border-t border-white/8 pt-4">
                      {isPortuguese ? item.resposta : item.respostaEn}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contato direto */}
      <section className="px-5 py-16 md:px-10 lg:px-16">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-[#0057E7]/30 bg-[#0057E7]/8 p-8 text-center">
            <h2 className="text-xl font-bold text-[#f0ebe2] mb-2">
              {isPortuguese ? 'Ainda com dúvidas?' : 'Still have questions?'}
            </h2>
            <p className="text-[#9a9088] mb-6 text-sm">
              {isPortuguese
                ? 'Nossa equipe responde rápido, pelo WhatsApp ou email.'
                : 'Our team responds quickly, via WhatsApp or email.'}
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
                {isPortuguese ? 'Enviar email' : 'Send email'}
              </a>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
