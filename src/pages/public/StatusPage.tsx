import { Info, Mail } from 'lucide-react'
import { PublicLayout } from '@/features/public'
import { usePublicLocale } from '@/features/public/lib/public-locale'
import { useSeoMeta } from '@/shared/lib'

const SERVICOS = [
  { nome: 'API principal', nomeEn: 'Main API' },
  { nome: 'Check-in mobile', nomeEn: 'Mobile check-in' },
  { nome: 'Processamento de pagamentos', nomeEn: 'Payment processing' },
  { nome: 'Autenticação', nomeEn: 'Authentication' },
  { nome: 'Notificações push', nomeEn: 'Push notifications' },
  { nome: 'Banco de dados', nomeEn: 'Database' },
  { nome: 'CDN & Assets', nomeEn: 'CDN & Assets' },
  { nome: 'Dashboard web', nomeEn: 'Web dashboard' },
]

export function StatusPage({ onLogin }: { onLogin: () => void }) {
  const { isPortuguese } = usePublicLocale()

  useSeoMeta({
    title: isPortuguese ? 'Status do Sistema | Pulse' : 'System Status | Pulse',
    description: isPortuguese
      ? 'Consulte os canais de acompanhamento e suporte da Pulse.'
      : 'Find Pulse service information and support channels.',
  })

  return (
    <PublicLayout onLogin={onLogin}>
      {/* Hero */}
      <section className="px-5 py-20 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-4 py-1.5 text-[11px] uppercase tracking-widest text-[#9a9088] mb-6">
            Status
          </div>
          <h1 className="text-4xl font-bold text-[#f0ebe2] md:text-5xl max-w-2xl leading-tight mb-8">
            {isPortuguese ? 'Status dos Serviços' : 'Service Status'}
          </h1>

          {/* Badge status geral */}
          <div className="inline-flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-6 py-4">
            <div className="relative flex h-4 w-4 shrink-0">
              
              <span className="relative inline-flex h-4 w-4 rounded-full bg-amber-500" />
            </div>
            <span className="text-base font-semibold text-amber-400">
              {isPortuguese ? 'Acompanhamento pelo suporte' : 'Support-assisted service updates'}
            </span>
          </div>
        </div>
      </section>

      {/* Serviços */}
      <section className="px-5 py-8 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-lg font-semibold text-[#f0ebe2] mb-5">
            {isPortuguese ? 'Serviços' : 'Services'}
          </h2>
          <div className="rounded-2xl bg-white/5 border border-white/8 divide-y divide-white/8">
            {SERVICOS.map((servico) => (
              <div key={servico.nome} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shrink-0" />
                  <span className="text-sm text-[#f0ebe2]">
                    {isPortuguese ? servico.nome : servico.nomeEn}
                  </span>
                </div>
                <span className="text-xs font-medium text-amber-400">
                  {isPortuguese ? 'Consultar suporte' : 'Contact support'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Histórico de incidentes */}
      <section className="px-5 py-10 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-lg font-semibold text-[#f0ebe2] mb-5">
            {isPortuguese ? 'Histórico de incidentes' : 'Incident history'}
          </h2>
          <div className="rounded-2xl bg-white/5 border border-white/8 p-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/15 shrink-0">
              <Info className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="font-medium text-[#f0ebe2]">
                {isPortuguese
                  ? 'Histórico público de incidentes ainda não disponível.'
                  : 'Public incident history is not yet available.'}
              </p>
              <p className="text-sm text-[#9a9088] mt-0.5">
                {isPortuguese
                  ? 'Não publicamos percentuais de disponibilidade sem medições verificadas.'
                  : 'Availability percentages require verified measurements.'}
              </p>
            </div>
            <span className="sm:ml-auto inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
              {isPortuguese ? 'Sem histórico publicado' : 'No published history'}
            </span>
          </div>
        </div>
      </section>

      {/* Nota */}
      <section className="px-5 py-10 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-white/8 bg-white/3 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Mail className="h-4 w-4 text-[#9a9088] shrink-0 mt-0.5 sm:mt-0" />
            <p className="text-sm text-[#9a9088]">
              {isPortuguese
                ? 'Para confirmar a situação de um serviço ou relatar problemas, contate '
                : 'For a service update or to report an issue, contact '}
              <a
                href="mailto:contatopulse@animalzgroup.com"
                className="text-[#4285F4] hover:underline"
              >
                contatopulse@animalzgroup.com
              </a>
            </p>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
