import { ArrowRight, Check, HelpCircle } from 'lucide-react'
import { PublicLayout } from '@/features/public'
import { usePublicLocale } from '@/features/public/lib/public-locale'
import { useSeoMeta } from '@/shared/lib'
import { useState } from 'react'

const FAQS = [
  {
    questionPt: 'A taxa e cobrada sobre o valor bruto?',
    questionEn: 'Is the fee charged on the gross amount?',
    answerPt: 'Sim. A taxa de 2,9% e calculada sobre o valor bruto de cada ingresso vendido. Não há taxas ocultas ou encargos adicionais.',
    answerEn: 'Yes. The 2.9% fee is calculated on the gross value of each ticket sold. There are no hidden fees or additional charges.',
  },
  {
    questionPt: 'Posso absorver a taxa no preço do ingresso?',
    questionEn: 'Can I absorb the fee into the ticket price?',
    answerPt: 'Sim. Durante a configuração do evento você pode ativar o repasse de taxa para o comprador, mantendo o valor liquido para você.',
    answerEn: 'Yes. During event setup you can activate fee transfer to the buyer, keeping the net amount for yourself.',
  },
  {
    questionPt: 'Há taxa para ingressos gratuitos?',
    questionEn: 'Is there a fee for free tickets?',
    answerPt: 'Não. Ingressos com valor zero não geram nenhuma taxa. Você pode usar a plataforma para eventos gratuitos sem custo.',
    answerEn: 'No. Zero-value tickets generate no fee. You can use the platform for free events at no cost.',
  },
  {
    questionPt: 'Quando recebo o repasse?',
    questionEn: 'When do I receive the transfer?',
    answerPt: 'O repasse financeiro é processado automaticamente em D+2 após o encerramento do evento, direto para a conta cadastrada.',
    answerEn: 'The financial transfer is processed automatically D+2 after the event closes, directly to the registered account.',
  },
  {
    questionPt: 'Posso cancelar a qualquer momento?',
    questionEn: 'Can I cancel at any time?',
    answerPt: 'Sim. Não há contrato de fidelidade ou multa de cancelamento. Você pode encerrar sua conta quando quiser.',
    answerEn: 'Yes. There is no loyalty contract or cancellation fee. You can close your account whenever you want.',
  },
]

export function PrecosPage({ onLogin }: { onLogin: () => void }) {
  const { isPortuguese } = usePublicLocale()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useSeoMeta({
    title: isPortuguese ? 'Planos e Preços | Pulse' : 'Plans & Pricing | Pulse',
    description: isPortuguese
      ? 'Comece gratis. Pague so quando vender. Planos flexiveis para eventos de todos os tamanhos.'
      : 'Start free. Pay only when you sell. Flexible plans for events of all sizes.',
  })

  return (
    <PublicLayout onLogin={onLogin}>
      {/* Hero */}
      <section className="relative overflow-hidden px-5 pb-16 pt-12 md:px-8 md:pb-20 md:pt-16 lg:px-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,87,231,0.18),transparent_50%),radial-gradient(circle_at_80%_60%,rgba(66,133,244,0.10),transparent_40%)]" />
        <div className="relative z-10 mx-auto max-w-[1540px] text-center">
          <div className="text-[10px] uppercase tracking-[0.38em] text-[#4285F4]">
            {isPortuguese ? 'Precos' : 'Pricing'}
          </div>
          <h1 className="mx-auto mt-6 max-w-3xl text-[clamp(3rem,7vw,6rem)] font-bold leading-[0.88] tracking-[-0.04em] text-white">
            {isPortuguese ? 'Simples. Transparente. Sem surpresas.' : 'Simple. Transparent. No surprises.'}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-white/58">
            {isPortuguese
              ? 'Comece gratis. Escale conforme seu evento cresce. So paga quando vender.'
              : 'Start free. Scale as your event grows. Pay only when you sell.'}
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="px-5 pb-20 md:px-8 lg:px-10">
        <div className="mx-auto max-w-[1540px]">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Free plan */}
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-8 transition-all hover:border-white/14 hover:bg-white/[0.05]">
              <div className="text-[10px] uppercase tracking-[0.32em] text-white/40">
                {isPortuguese ? 'Gratuito' : 'Free'}
              </div>
              <div className="mt-4 text-[clamp(2.8rem,4vw,3.8rem)] font-bold leading-none tracking-[-0.03em] text-white">
                R$ 0
              </div>
              <div className="mt-1 text-sm text-white/40">{isPortuguese ? 'por mes' : 'per month'}</div>
              <p className="mt-5 text-sm leading-7 text-white/50">
                {isPortuguese
                  ? 'Para quem esta comecando e quer testar a plataforma sem compromisso.'
                  : 'For those just starting out who want to test the platform without commitment.'}
              </p>
              <ul className="mt-7 space-y-3">
                {(isPortuguese
                  ? [
                      'Até 3 eventos ativos',
                      'Até 200 ingressos por evento',
                      'Check-in mobile por QR code',
                      '1 operador por evento',
                    ]
                  : [
                      'Up to 3 active events',
                      'Up to 200 tickets per event',
                      'Mobile QR code check-in',
                      '1 operator per event',
                    ]
                ).map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-white/60">
                    <Check className="h-4 w-4 shrink-0 text-[#4285F4]" />
                    {item}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={onLogin}
                className="mt-8 w-full rounded-full border border-white/18 py-3 text-sm font-medium text-white transition-all hover:bg-white/8"
              >
                {isPortuguese ? 'Comecar gratis' : 'Start for free'}
              </button>
            </div>

            {/* Pro plan */}
            <div className="relative rounded-2xl border border-[#0057E7]/40 bg-[linear-gradient(135deg,rgba(0,87,231,0.18)_0%,rgba(10,10,10,0.96)_60%)] p-8 shadow-[0_0_60px_rgba(0,87,231,0.18)]">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <div className="rounded-full bg-[#0057E7] px-4 py-1 text-[10px] font-bold uppercase tracking-[0.26em] text-white">
                  {isPortuguese ? 'Mais popular' : 'Most popular'}
                </div>
              </div>
              <div className="text-[10px] uppercase tracking-[0.32em] text-[#4285F4]">Pro</div>
              <div className="mt-4 text-[clamp(2rem,3vw,2.6rem)] font-bold leading-none tracking-[-0.03em] text-white">
                2,9%
              </div>
              <div className="mt-1 text-sm text-white/40">
                {isPortuguese ? 'por ingresso vendido' : 'per ticket sold'}
              </div>
              <p className="mt-5 text-sm leading-7 text-white/50">
                {isPortuguese
                  ? 'Para produtores que operam com frequencia e precisam de controle total.'
                  : 'For producers who operate frequently and need full control.'}
              </p>
              <ul className="mt-7 space-y-3">
                {(isPortuguese
                  ? [
                      'Eventos ilimitados',
                      'Ingressos ilimitados',
                      'Staff ilimitado',
                      'Supervisor em tempo real',
                      'Relatórios avancados',
                      'Suporte prioritario',
                    ]
                  : [
                      'Unlimited events',
                      'Unlimited tickets',
                      'Unlimited staff',
                      'Real-time supervisor',
                      'Advanced reports',
                      'Priority support',
                    ]
                ).map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-white/60">
                    <Check className="h-4 w-4 shrink-0 text-[#4285F4]" />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href="/create-event"
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-[#0057E7] py-3 text-sm font-bold text-white shadow-[0_10px_30px_rgba(0,87,231,0.35)] transition-all hover:-translate-y-0.5 hover:bg-[#4285F4]"
              >
                {isPortuguese ? 'Comecar gratis' : 'Start for free'}
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            {/* Enterprise plan */}
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-8 transition-all hover:border-white/14 hover:bg-white/[0.05]">
              <div className="text-[10px] uppercase tracking-[0.32em] text-white/40">Enterprise</div>
              <div className="mt-4 text-[clamp(2rem,3vw,2.6rem)] font-bold leading-none tracking-[-0.03em] text-white">
                {isPortuguese ? 'Sob consulta' : 'Custom'}
              </div>
              <div className="mt-1 text-sm text-white/40">
                {isPortuguese ? 'plano personalizado' : 'custom plan'}
              </div>
              <p className="mt-5 text-sm leading-7 text-white/50">
                {isPortuguese
                  ? 'Para organizações com operações de grande escala e necessidades especificas.'
                  : 'For organizations with large-scale operations and specific needs.'}
              </p>
              <ul className="mt-7 space-y-3">
                {(isPortuguese
                  ? [
                      'Tudo do plano Pro',
                      'Integração via API',
                      'White-label',
                      'SLA dedicado',
                      'Gerente de conta',
                      'Onboarding personalizado',
                    ]
                  : [
                      'Everything in Pro',
                      'API integration',
                      'White-label',
                      'Dedicated SLA',
                      'Account manager',
                      'Custom onboarding',
                    ]
                ).map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-white/60">
                    <Check className="h-4 w-4 shrink-0 text-[#4285F4]" />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href="https://wa.me/14698629040"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-full border border-white/18 py-3 text-sm font-medium text-white transition-all hover:bg-white/8"
              >
                {isPortuguese ? 'Falar com vendas' : 'Talk to sales'}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Banner */}
      <section className="px-5 pb-12 md:px-8 lg:px-10">
        <div className="mx-auto max-w-[1540px]">
          <div className="flex flex-wrap items-center justify-center gap-8 rounded-2xl border border-[#d4ff00]/20 bg-[#d4ff00]/[0.04] px-8 py-6 text-center">
            {(isPortuguese
              ? [
                  'Não cobra taxa de setup.',
                  'Não cobra mensalidade fixa no Pro.',
                  'So paga quando vender.',
                ]
              : [
                  'No setup fee.',
                  'No fixed monthly fee in Pro.',
                  'Pay only when you sell.',
                ]
            ).map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="h-1.5 w-1.5 rounded-full bg-[#d4ff00]" />
                <span className="text-sm font-medium text-[#d4ff00]">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-5 pb-20 md:px-8 lg:px-10">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 text-center">
            <div className="text-[10px] uppercase tracking-[0.38em] text-[#4285F4]">FAQ</div>
            <h2 className="mt-5 text-[clamp(2rem,4vw,3.2rem)] font-bold leading-[0.9] tracking-[-0.03em] text-white">
              {isPortuguese ? 'Perguntas frequentes' : 'Frequently asked questions'}
            </h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/8 bg-white/[0.03] transition-all hover:border-white/14"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="text-sm font-medium text-white">
                    {isPortuguese ? faq.questionPt : faq.questionEn}
                  </span>
                  <HelpCircle className={`h-4 w-4 shrink-0 transition-colors ${openFaq === i ? 'text-[#4285F4]' : 'text-white/30'}`} />
                </button>
                {openFaq === i && (
                  <div className="border-t border-white/6 px-6 pb-5 pt-4">
                    <p className="text-sm leading-7 text-white/50">
                      {isPortuguese ? faq.answerPt : faq.answerEn}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
