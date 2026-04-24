import { useState } from 'react'
import { ArrowRight, Mail } from 'lucide-react'
import { PublicLayout } from '@/features/public'
import { usePublicLocale } from '@/features/public/lib/public-locale'
import { useSeoMeta } from '@/shared/lib'

const ARTIGOS = [
  {
    categoria: 'Check-in',
    data: '18 Abr 2026',
    titulo: 'Check-in em 3 segundos: como a leitura de QR code transformou nossos eventos',
    resumo:
      'Longas filas de credenciamento são coisa do passado. Veja como o check-in por QR code reduziu o tempo de entrada para menos de 3 segundos por pessoa em eventos com mais de 5 mil participantes.',
    cor: 'bg-[#4285F4]/15 text-[#4285F4]',
  },
  {
    categoria: 'Operação',
    data: '12 Abr 2026',
    titulo: 'Como calcular a capacidade ideal por setor no seu evento',
    resumo:
      'Superlotação em uma área e espaço vazio em outra é sinal de planejamento falho. Aprenda a calcular a capacidade por zona com base em histórico de vendas e fluxo esperado.',
    cor: 'bg-emerald-500/15 text-emerald-400',
  },
  {
    categoria: 'Vendas',
    data: '5 Abr 2026',
    titulo: 'Virada de lote: o momento certo para aumentar o préço e não perder vendas',
    resumo:
      'Mudar o préço cedo demais esfria o interesse. Tarde demais e você deixa dinheiro na mesa. Veja como calibrar a virada de lote para maximizar receita e urgência de compra.',
    cor: 'bg-amber-500/15 text-amber-400',
  },
  {
    categoria: 'Staff',
    data: '28 Mar 2026',
    titulo: 'Staff bem gerenciado = evento que não trava. O guia completo',
    resumo:
      'Da convocação ao encerramento: como montar escalas, distribuir funções, controlar ponto e comunicar mudanças de última hora sem WhatsApp group lotado.',
    cor: 'bg-purple-500/15 text-purple-400',
  },
  {
    categoria: 'Supervisão',
    data: '20 Mar 2026',
    titulo: 'Health Score: a métrica que todo supervisor de evento precisa acompanhar',
    resumo:
      'Um número único que resume o estado operacional do evento em tempo real. Entenda como o Health Score é calculado e por que ele muda tudo na tomada de decisão durante o evento.',
    cor: 'bg-[#4285F4]/15 text-[#4285F4]',
  },
  {
    categoria: 'Financeiro',
    data: '14 Mar 2026',
    titulo: 'Pix, cartão ou boleto: qual meio de pagamento converte mais em eventos?',
    resumo:
      'Dados reais de eventos operados pela Pulse mostram diferenças significativas de conversão por meio de pagamento, e elas variam muito por perfil de público e tipo de evento.',
    cor: 'bg-rose-500/15 text-rose-400',
  },
]

export function BlogPage({ onLogin }: { onLogin: () => void }) {
  const { isPortuguese } = usePublicLocale()
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)

  useSeoMeta({
    title: isPortuguese ? 'Blog | Pulse' : 'Blog | Pulse',
    description: isPortuguese
      ? 'Dicas, tendências e estratégias para produtores de eventos. Conteúdo criado por quem opera eventos de verdade.'
      : 'Tips, trends and strategies for event producers. Content created by people who actually run events.',
  })

  function handleNewsletter(e: React.FormEvent) {
    e.preventDefault()
    if (email) {
      setEnviado(true)
      setEmail('')
    }
  }

  return (
    <PublicLayout onLogin={onLogin}>
      {/* Hero */}
      <section className="px-5 py-20 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-4 py-1.5 text-[11px] uppercase tracking-widest text-[#9a9088] mb-6">
            Blog
          </div>
          <h1 className="text-4xl font-bold text-[#f0ebe2] md:text-5xl lg:text-6xl max-w-3xl leading-tight">
            {isPortuguese
              ? 'Conteúdo para quem leva eventos a sério.'
              : 'Content for those who take events seriously.'}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-[#9a9088]">
            {isPortuguese
              ? 'Estratégias, operação e produto, escritos por quem opera eventos de verdade.'
              : 'Strategy, operations and product, written by people who actually run events.'}
          </p>
        </div>
      </section>

      {/* Grid de artigos */}
      <section className="px-5 py-8 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ARTIGOS.map((artigo) => (
              <a
                key={artigo.titulo}
                href="#"
                className="group rounded-2xl bg-white/5 border border-white/8 p-6 flex flex-col hover:bg-white/8 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${artigo.cor}`}>
                    {artigo.categoria}
                  </span>
                  <span className="text-xs text-[#9a9088]">{artigo.data}</span>
                </div>
                <h2 className="mb-3 text-base font-semibold text-[#f0ebe2] leading-snug group-hover:text-white transition-colors">
                  {artigo.titulo}
                </h2>
                <p className="text-sm text-[#9a9088] leading-relaxed flex-1">{artigo.resumo}</p>
                <div className="mt-5 flex items-center gap-1.5 text-sm text-[#4285F4] font-medium">
                  {isPortuguese ? 'Ler artigo' : 'Read article'}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="px-5 py-20 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-[#0057E7]/30 bg-[#0057E7]/8 p-10 text-center">
            <Mail className="mx-auto mb-4 h-8 w-8 text-[#4285F4]" />
            <h2 className="text-2xl font-bold text-[#f0ebe2] mb-2">
              {isPortuguese ? 'Receba novidades no email' : 'Get updates by email'}
            </h2>
            <p className="text-[#9a9088] mb-8 max-w-md mx-auto">
              {isPortuguese
                ? 'Novos artigos, atualizações do produto e estratégias direto na sua caixa de entrada. Sem spam.'
                : 'New articles, product updates and strategies straight to your inbox. No spam.'}
            </p>
            {enviado ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-6 py-3 text-sm text-emerald-400">
                {isPortuguese ? 'Inscrito com sucesso!' : 'Subscribed successfully!'}
              </div>
            ) : (
              <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isPortuguese ? 'seu@email.com' : 'your@email.com'}
                  className="flex-1 rounded-full border border-white/12 bg-white/5 px-5 py-3 text-sm text-[#f0ebe2] placeholder-[#9a9088] outline-none focus:border-[#4285F4] transition-colors"
                />
                <button
                  type="submit"
                  className="rounded-full bg-[#0057E7] px-6 py-3 text-sm font-bold text-white hover:bg-[#4285F4] transition-colors shrink-0"
                >
                  {isPortuguese ? 'Receber novidades' : 'Subscribe'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
