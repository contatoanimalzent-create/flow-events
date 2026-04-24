import { Download, FileImage, FileText, Image, Mail } from 'lucide-react'
import { PublicLayout } from '@/features/public'
import { usePublicLocale } from '@/features/public/lib/public-locale'
import { useSeoMeta } from '@/shared/lib'

const KIT_MIDIA = [
  {
    icon: FileImage,
    titulo: 'Logo em PNG',
    desc: 'Fundo escuro, alta resolução',
    href: '#',
  },
  {
    icon: FileText,
    titulo: 'Logo em SVG',
    desc: 'Vetor escalável, todos os fundos',
    href: '#',
  },
  {
    icon: FileText,
    titulo: 'Manual de marca PDF',
    desc: 'Tipografia, cores, uso correto',
    href: '#',
  },
  {
    icon: Image,
    titulo: 'Fotos do produto',
    desc: 'Screenshots em alta resolução',
    href: '#',
  },
]

const FATOS = [
  { label: 'Fundação', valor: '2024' },
  { label: 'HQ', valor: 'Brasil — operação 100% remota' },
  { label: 'Foco', valor: 'Plataforma B2B para produtores de eventos' },
  { label: 'Tecnologia', valor: 'React, TypeScript, Supabase' },
]

export function ImprensaPage({ onLogin }: { onLogin: () => void }) {
  const { isPortuguese } = usePublicLocale()

  useSeoMeta({
    title: isPortuguese ? 'Imprensa | Pulse' : 'Press | Pulse',
    description: isPortuguese
      ? 'Materiais para imprensa, kit de marca e contato para jornalistas e veículos de comunicação.'
      : 'Press materials, brand kit and contact for journalists and media outlets.',
  })

  return (
    <PublicLayout onLogin={onLogin}>
      {/* Hero */}
      <section className="px-5 py-20 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-4 py-1.5 text-[11px] uppercase tracking-widest text-[#9a9088] mb-6">
            {isPortuguese ? 'Imprensa' : 'Press'}
          </div>
          <h1 className="text-4xl font-bold text-[#f0ebe2] md:text-5xl lg:text-6xl max-w-3xl leading-tight">
            {isPortuguese ? 'Pulse na mídia.' : 'Pulse in the media.'}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-[#9a9088]">
            {isPortuguese
              ? 'Materiais, fatos e contato para jornalistas e veículos de comunicação.'
              : 'Materials, facts and contact for journalists and media outlets.'}
          </p>
        </div>
      </section>

      {/* Sobre a Pulse */}
      <section className="px-5 py-8 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl bg-white/5 border border-white/8 p-8 md:p-10">
            <h2 className="text-xl font-bold text-[#f0ebe2] mb-4">
              {isPortuguese ? 'Sobre a Pulse' : 'About Pulse'}
            </h2>
            <p className="text-[#9a9088] leading-relaxed max-w-3xl">
              {isPortuguese
                ? 'Pulse é uma plataforma SaaS brasileira para gestão completa de eventos. Fundada em 2024, conecta produtores, staff e participantes em um único ecossistema digital — do ingresso ao encerramento. A plataforma cobre todo o ciclo operacional: venda de ingressos, controle de lotes, check-in por QR code, gestão de staff, supervisão em tempo real e repasse financeiro automático.'
                : 'Pulse is a Brazilian SaaS platform for complete event management. Founded in 2024, it connects producers, staff and attendees in a single digital ecosystem — from ticketing to closing. The platform covers the full operational cycle: ticket sales, batch control, QR code check-in, staff management, real-time supervision and automatic financial transfer.'}
            </p>
          </div>
        </div>
      </section>

      {/* Kit de mídia */}
      <section className="px-5 py-10 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-xl font-bold text-[#f0ebe2] mb-2">
            {isPortuguese ? 'Kit de mídia' : 'Media kit'}
          </h2>
          <p className="text-[#9a9088] mb-8 text-sm">
            {isPortuguese
              ? 'Materiais oficiais para uso editorial.'
              : 'Official materials for editorial use.'}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {KIT_MIDIA.map((item) => {
              const Icon = item.icon
              return (
                <a
                  key={item.titulo}
                  href={item.href}
                  className="group rounded-2xl bg-white/5 border border-white/8 p-6 flex flex-col items-start hover:bg-white/8 transition-colors"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#0057E7]/15">
                    <Icon className="h-5 w-5 text-[#4285F4]" />
                  </div>
                  <h3 className="font-semibold text-[#f0ebe2] mb-1">{item.titulo}</h3>
                  <p className="text-xs text-[#9a9088] mb-4 flex-1">{item.desc}</p>
                  <div className="flex items-center gap-1.5 text-xs text-[#4285F4] font-medium">
                    <Download className="h-3.5 w-3.5" />
                    {isPortuguese ? 'Baixar' : 'Download'}
                  </div>
                </a>
              )
            })}
          </div>
        </div>
      </section>

      {/* Fatos rápidos */}
      <section className="px-5 py-10 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-xl font-bold text-[#f0ebe2] mb-8">
            {isPortuguese ? 'Fatos rápidos' : 'Quick facts'}
          </h2>
          <div className="rounded-2xl bg-white/5 border border-white/8 divide-y divide-white/8">
            {FATOS.map((fato) => (
              <div key={fato.label} className="flex flex-col gap-1 p-5 sm:flex-row sm:items-center sm:gap-6">
                <span className="shrink-0 text-sm font-medium text-[#9a9088] sm:w-44">{fato.label}</span>
                <span className="text-sm text-[#f0ebe2]">{fato.valor}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contato imprensa */}
      <section className="px-5 py-16 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-[#0057E7]/30 bg-[#0057E7]/8 p-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#f0ebe2] mb-1">
                  {isPortuguese ? 'Contato para imprensa' : 'Press contact'}
                </h2>
                <p className="text-[#9a9088] text-sm">
                  {isPortuguese
                    ? 'Respondemos em até 24h úteis.'
                    : 'We respond within 24 business hours.'}
                </p>
              </div>
              <a
                href="mailto:contatopulse@animalzgroup.com"
                className="inline-flex items-center gap-2 rounded-full bg-[#0057E7] px-6 py-3 text-sm font-bold text-white hover:bg-[#4285F4] transition-colors shrink-0"
              >
                <Mail className="h-4 w-4" />
                contatopulse@animalzgroup.com
              </a>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
