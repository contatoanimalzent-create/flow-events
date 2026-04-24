import { useState } from 'react'
import { ArrowLeft, ChevronDown, Mail, MessageCircle } from 'lucide-react'
import { PublicLayout } from '@/features/public'
import { usePublicLocale } from '@/features/public/lib/public-locale'
import { useSeoMeta } from '@/shared/lib'

const SECOES = [
  {
    titulo: 'Como comprar',
    tituloEn: 'How to buy',
    conteudo: (
      <ol className="list-none space-y-3">
        {[
          ['1', 'Escolha o evento na página pública ou link compartilhado pelo produtor.'],
          ['2', 'Selecione o tipo e a quantidade de ingressos desejados.'],
          ['3', 'Preencha seus dados (nome, email e CPF).'],
          ['4', 'Escolha a forma de pagamento e finalize a compra.'],
          ['5', 'Receba seu QR code por email imediatamente após a confirmação do pagamento.'],
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
          ['1', 'Choose the event on the public page or link shared by the producer.'],
          ['2', 'Select the type and quantity of tickets.'],
          ['3', 'Fill in your details (name, email and ID).'],
          ['4', 'Choose your payment method and complete the purchase.'],
          ['5', 'Receive your QR code by email immediately after payment confirmation.'],
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
    titulo: 'Formas de pagamento',
    tituloEn: 'Payment methods',
    conteudo: (
      <div className="space-y-3">
        {[
          { metodo: 'Pix', desc: 'Aprovação imediata. QR code gerado na hora.' },
          { metodo: 'Cartão de crédito', desc: 'Parcelado em até 12x. Aprovação em segundos.' },
          { metodo: 'Boleto bancário', desc: 'Aprovação em até 3 dias úteis após o pagamento.' },
        ].map((p) => (
          <div key={p.metodo} className="flex items-start gap-3 rounded-xl bg-white/5 border border-white/8 p-4">
            <div className="h-2 w-2 rounded-full bg-[#4285F4] mt-1.5 shrink-0" />
            <div>
              <span className="text-sm font-semibold text-[#f0ebe2]">{p.metodo}: </span>
              <span className="text-sm text-[#9a9088]">{p.desc}</span>
            </div>
          </div>
        ))}
      </div>
    ),
    conteudoEn: (
      <div className="space-y-3">
        {[
          { metodo: 'Pix', desc: 'Instant approval. QR code generated immediately.' },
          { metodo: 'Credit card', desc: 'Installments up to 12x. Approval in seconds.' },
          { metodo: 'Bank slip', desc: 'Approval within 3 business days after payment.' },
        ].map((p) => (
          <div key={p.metodo} className="flex items-start gap-3 rounded-xl bg-white/5 border border-white/8 p-4">
            <div className="h-2 w-2 rounded-full bg-[#4285F4] mt-1.5 shrink-0" />
            <div>
              <span className="text-sm font-semibold text-[#f0ebe2]">{p.metodo}: </span>
              <span className="text-sm text-[#9a9088]">{p.desc}</span>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    titulo: 'Meu QR code',
    tituloEn: 'My QR code',
    conteudo: (
      <div className="space-y-3 text-sm text-[#9a9088] leading-relaxed">
        <p>Seu QR code é enviado por email assim que o pagamento é confirmado. Salve o email ou faça uma captura de tela.</p>
        <p>No dia do evento, apresente o QR code na tela do seu celular ao operador de check-in, não é necessário imprimir.</p>
        <p>Perdeu o email? Acesse o link de reenvio que está na confirmação de compra, ou entre em contato pelo WhatsApp informando seu CPF e email de cadastro.</p>
      </div>
    ),
    conteudoEn: (
      <div className="space-y-3 text-sm text-[#9a9088] leading-relaxed">
        <p>Your QR code is sent by email as soon as payment is confirmed. Save the email or take a screenshot.</p>
        <p>On the day of the event, show the QR code on your phone screen to the check-in operator, no printing needed.</p>
        <p>Lost the email? Use the resend link in your purchase confirmation, or contact us on WhatsApp with your ID and registered email.</p>
      </div>
    ),
  },
  {
    titulo: 'Transferência de ingresso',
    tituloEn: 'Ticket transfer',
    conteudo: (
      <div className="space-y-3 text-sm text-[#9a9088] leading-relaxed">
        <p>Você pode transferir seu ingresso para outra pessoa diretamente pelo app da Pulse ou pelo link de gerenciamento enviado no email de confirmação.</p>
        <p>A transferência é gratuita e instantânea. O QR code antigo é invalidado e o novo é enviado para o email da pessoa indicada.</p>
        <p>A transferência está disponível até a abertura do check-in no evento.</p>
      </div>
    ),
    conteudoEn: (
      <div className="space-y-3 text-sm text-[#9a9088] leading-relaxed">
        <p>You can transfer your ticket to another person directly through the Pulse app or the management link sent in the confirmation email.</p>
        <p>Transfer is free and instant. The old QR code is invalidated and a new one is sent to the indicated email.</p>
        <p>Transfer is available until check-in opens at the event.</p>
      </div>
    ),
  },
  {
    titulo: 'Reembolso e cancelamento',
    tituloEn: 'Refund and cancellation',
    conteudo: (
      <div className="space-y-3 text-sm text-[#9a9088] leading-relaxed">
        <p>A política de reembolso segue as regras definidas pelo produtor do evento. Verifique as condições na página do evento antes de finalizar a compra.</p>
        <p>Em caso de cancelamento do evento pelo produtor, o reembolso total é garantido em até 7 dias úteis no mesmo meio de pagamento utilizado.</p>
        <p>Para solicitar reembolso, entre em contato pelo WhatsApp ou email informando seu número de pedido.</p>
      </div>
    ),
    conteudoEn: (
      <div className="space-y-3 text-sm text-[#9a9088] leading-relaxed">
        <p>The refund policy follows the rules set by the event producer. Check the conditions on the event page before completing your purchase.</p>
        <p>If the event is cancelled by the producer, a full refund is guaranteed within 7 business days to the original payment method.</p>
        <p>To request a refund, contact us on WhatsApp or email with your order number.</p>
      </div>
    ),
  },
]

export function AjudaCompradoresPage({ onLogin }: { onLogin: () => void }) {
  const { isPortuguese } = usePublicLocale()
  const [aberto, setAberto] = useState<number | null>(0)

  useSeoMeta({
    title: isPortuguese ? 'Ajuda para Compradores | Pulse' : 'Buyer Help | Pulse',
    description: isPortuguese
      ? 'Como comprar ingressos, receber seu QR code, fazer transferência e tirar dúvidas sobre seu pedido.'
      : 'How to buy tickets, receive your QR code, transfer tickets and get answers about your order.',
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
            {isPortuguese ? 'Para compradores' : 'For buyers'}
          </div>
          <h1 className="text-3xl font-bold text-[#f0ebe2] md:text-4xl leading-tight">
            {isPortuguese
              ? 'Ajuda para quem compra ingressos'
              : 'Help for ticket buyers'}
          </h1>
          <p className="mt-4 text-[#9a9088]">
            {isPortuguese
              ? 'Tudo que você precisa saber sobre compra, pagamento, QR code e muito mais.'
              : 'Everything you need to know about buying, payment, QR code and more.'}
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
                  {isPortuguese ? secao.conteudo : secao.conteudoEn}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contato */}
      <section className="px-5 py-16 md:px-10 lg:px-16">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-[#0057E7]/30 bg-[#0057E7]/8 p-8 text-center">
            <h2 className="text-xl font-bold text-[#f0ebe2] mb-2">
              {isPortuguese ? 'Precisa de ajuda específica?' : 'Need specific help?'}
            </h2>
            <p className="text-[#9a9088] mb-6 text-sm">
              {isPortuguese
                ? 'Fale com a gente pelo WhatsApp, resposta em minutos.'
                : 'Talk to us on WhatsApp, response in minutes.'}
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
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
