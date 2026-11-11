import { MessageCircle } from 'lucide-react'
import { PublicLayout } from '@/features/public'
import { usePublicLocale } from '@/features/public/lib/public-locale'
import { useSeoMeta } from '@/shared/lib'
import { TRACK_RECORD_AS_OF, TRACK_RECORD_EVENTS, TRACK_RECORD_TOTALS } from '@/shared/lib/public-track-record'

const CASES = [...TRACK_RECORD_EVENTS].reverse().map((event) => ({
  nome: event.name,
  tipo: event.date.split('-').reverse().join('/'),
  resumo: 'Evento realizado. Histórico cadastrado na Pulse.',
  metricas: [
    ...(event.tickets > 0 ? [{ valor: event.tickets.toLocaleString('pt-BR'), label: 'credenciais digitais' }] : []),
    ...(event.staff > 0 ? [{ valor: event.staff.toLocaleString('pt-BR'), label: 'registros de equipe' }] : []),
    ...(event.entries > 0 ? [{ valor: event.entries.toLocaleString('pt-BR'), label: 'entradas registradas' }] : []),
  ],
  cor: 'border-[#4285F4]/30',
  badge: 'bg-[#4285F4]/15 text-[#4285F4]',
}))

const METRICAS_GERAIS = [
  { valor: String(TRACK_RECORD_TOTALS.events), label: 'eventos realizados' },
  { valor: TRACK_RECORD_TOTALS.tickets.toLocaleString('pt-BR'), label: 'credenciais digitais registradas' },
  { valor: TRACK_RECORD_TOTALS.staff.toLocaleString('pt-BR'), label: 'vínculos de equipe nos eventos' },
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
              ? 'Eventos reais e registros de operação da Pulse. Sem estimativas de público ou depoimentos ilustrativos.'
              : 'Real events and Pulse operational records. No estimated attendance or illustrative testimonials.'}
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

      <p className="mx-auto max-w-7xl px-5 text-sm leading-relaxed text-[#9a9088] md:px-10 lg:px-16">
        Base conferida em {TRACK_RECORD_AS_OF}. Credenciais não equivalem a presenças; vínculos de equipe não são pessoas únicas. Eventos futuros não entram nesses totais.
      </p>

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
                    
                    <p className="text-[#9a9088] leading-relaxed">{caso.resumo}</p>
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
              href="https://wa.me/5561992946515"
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
