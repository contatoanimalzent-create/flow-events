import { MessageCircle, Quote } from 'lucide-react'
import { PublicLayout } from '@/features/public'
import { usePublicLocale } from '@/features/public/lib/public-locale'
import { useSeoMeta } from '@/shared/lib'

const CASES = [
  {
    nome: 'Festival Circuito',
    tipo: 'Festival de música',
    depoimento:
      'Credenciamos 4.800 pessoas em 45 minutos com zero filas usando o check-in do Pulse. O supervisor acompanhou tudo pelo app em tempo real, sem precisar sair da cabine de produção.',
    metricas: [
      { valor: '4.800', label: 'credenciados' },
      { valor: '0', label: 'fraudes' },
      { valor: '45 min', label: 'para lotação completa' },
    ],
    cor: 'border-[#4285F4]/30',
    badge: 'bg-[#4285F4]/15 text-[#4285F4]',
  },
  {
    nome: 'Corporativo Tech Summit',
    tipo: 'Evento corporativo',
    depoimento:
      'Gerenciamos 12 palestrantes, 3 salas simultâneas e 600 inscritos com aprovação manual de credenciais. Nenhum acesso não autorizado, nenhuma sala superlotada.',
    metricas: [
      { valor: '600', label: 'inscritos' },
      { valor: '3', label: 'zonas de acesso' },
      { valor: '100%', label: 'presença confirmada' },
    ],
    cor: 'border-emerald-500/30',
    badge: 'bg-emerald-500/15 text-emerald-400',
  },
  {
    nome: 'Noite Gastronômica SP',
    tipo: 'Evento gastronômico',
    depoimento:
      'Vendemos 300 ingressos em 48h com virada de lote automática. Não precisei monitorar nada, o sistema fez tudo. O repasse chegou em D+2 sem burocracia.',
    metricas: [
      { valor: '300', label: 'ingressos vendidos' },
      { valor: 'R$ 42k', label: 'em vendas' },
      { valor: 'D+2', label: 'repasse' },
    ],
    cor: 'border-amber-500/30',
    badge: 'bg-amber-500/15 text-amber-400',
  },
]

const METRICAS_GERAIS = [
  { valor: '150+', label: 'eventos operados' },
  { valor: '50k+', label: 'ingressos processados' },
  { valor: '98%', label: 'taxa de satisfação' },
]

export function CasesPage({ onLogin }: { onLogin: () => void }) {
  const { isPortuguese } = usePublicLocale()

  useSeoMeta({
    title: isPortuguese ? 'Cases de Sucesso | Pulse' : 'Success Stories | Pulse',
    description: isPortuguese
      ? 'Veja como produtores reais usam a Pulse para operar eventos maiores com menos esforço e mais controle.'
      : 'See how real producers use Pulse to run bigger events with less effort and more control.',
  })

  return (
    <PublicLayout onLogin={onLogin}>
      {/* Hero */}
      <section className="px-5 py-20 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-4 py-1.5 text-[11px] uppercase tracking-widest text-[#9a9088] mb-6">
            {isPortuguese ? 'Cases' : 'Success Stories'}
          </div>
          <h1 className="text-4xl font-bold text-[#f0ebe2] md:text-5xl lg:text-6xl max-w-3xl leading-tight">
            {isPortuguese
              ? 'Resultados reais. Eventos reais.'
              : 'Real results. Real events.'}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-[#9a9088]">
            {isPortuguese
              ? 'Produtores que usam a Pulse operam com mais controle, menos imprevisto e melhores resultados financeiros.'
              : 'Producers using Pulse operate with more control, fewer surprises and better financial results.'}
          </p>
        </div>
      </section>

      {/* Métricas gerais */}
      <section className="px-5 pb-10 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-4 sm:grid-cols-3">
            {METRICAS_GERAIS.map((m) => (
              <div key={m.label} className="rounded-2xl bg-white/5 border border-white/8 p-6 text-center">
                <div className="text-4xl font-bold text-[#4285F4]">{m.valor}</div>
                <div className="mt-1 text-sm text-[#9a9088]">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cases */}
      <section className="px-5 py-10 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl flex flex-col gap-6">
          {CASES.map((caso) => (
            <div
              key={caso.nome}
              className={`rounded-2xl bg-white/5 border p-8 md:p-10 ${caso.cor}`}
            >
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-10">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${caso.badge}`}>
                      {caso.tipo}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-[#f0ebe2] mb-4">{caso.nome}</h2>
                  <div className="relative">
                    <Quote className="absolute -top-1 -left-1 h-5 w-5 text-[#9a9088] opacity-50" />
                    <p className="pl-6 text-[#9a9088] leading-relaxed italic">{caso.depoimento}</p>
                  </div>
                </div>
                <div className="shrink-0 grid grid-cols-3 gap-4 md:grid-cols-1 md:w-40">
                  {caso.metricas.map((m) => (
                    <div key={m.label} className="text-center md:text-right">
                      <div className="text-2xl font-bold text-[#f0ebe2]">{m.valor}</div>
                      <div className="text-xs text-[#9a9088] mt-0.5">{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 py-20 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-[#0057E7]/30 bg-[#0057E7]/8 p-10 text-center">
            <h2 className="text-2xl font-bold text-[#f0ebe2] mb-3">
              {isPortuguese ? 'Quero ser o próximo case.' : 'I want to be the next case.'}
            </h2>
            <p className="text-[#9a9088] mb-8 max-w-md mx-auto">
              {isPortuguese
                ? 'Fale com a gente e veja como a Pulse pode transformar a operação dos seus eventos.'
                : 'Talk to us and see how Pulse can transform your event operations.'}
            </p>
            <a
              href="https://wa.me/14698629040"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#0057E7] px-6 py-3 text-sm font-bold text-white hover:bg-[#4285F4] transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              {isPortuguese ? 'Falar no WhatsApp' : 'Talk on WhatsApp'}
            </a>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
