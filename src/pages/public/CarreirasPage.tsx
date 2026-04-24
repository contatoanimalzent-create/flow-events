import { useState } from 'react'
import {
  Briefcase,
  Clock,
  ExternalLink,
  Globe,
  Laptop,
  Mail,
  MessageCircle,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import { PublicLayout } from '@/features/public'
import { usePublicLocale } from '@/features/public/lib/public-locale'
import { useSeoMeta } from '@/shared/lib'

const VALORES = [
  {
    icon: Zap,
    titulo: 'Autonomia',
    desc: 'Você decide como fazer. Confiamos na sua expertise e não microgerenciamos o processo, só o resultado.',
  },
  {
    icon: TrendingUp,
    titulo: 'Impacto real',
    desc: 'Cada linha de código vai para eventos reais. Seu trabalho é sentido por milhares de pessoas no dia do evento.',
  },
  {
    icon: Briefcase,
    titulo: 'Produto obsessivo',
    desc: 'Detalhes importam. Construímos com cuidado, iteramos rápido e nunca entregamos algo que nos envergonharia.',
  },
  {
    icon: TrendingUp,
    titulo: 'Crescimento rápido',
    desc: 'Startup early-stage com tração real. Quem entra agora cresce junto com o produto, e tem equity na mesa.',
  },
]

const BENEFICIOS = [
  { icon: Globe, texto: 'Trabalho 100% remoto' },
  { icon: Clock, texto: 'Horário flexível' },
  { icon: Laptop, texto: 'Equipamento fornecido' },
  { icon: TrendingUp, texto: 'Participação nos resultados' },
  { icon: Users, texto: 'Acesso a todos os eventos da plataforma' },
]

const VAGAS = [
  {
    titulo: 'Desenvolvedor Full-Stack Sênior',
    stack: 'React + TypeScript + Supabase',
    modelo: 'Remoto, PJ',
    desc: 'Construa os pilares do produto: API, dashboard de gestão, app de check-in e integrações de pagamento. Você terá autonomia total sobre as decisões técnicas da sua stack.',
  },
  {
    titulo: 'Designer de Produto',
    stack: 'Figma, design systems, mobile-first',
    modelo: 'Remoto, PJ',
    desc: 'Defina como a Pulse parece e se comporta. Do fluxo de compra do ingresso ao painel do supervisor em tempo real, cada pixel importa.',
  },
  {
    titulo: 'Especialista em Sucesso do Cliente',
    stack: 'Onboarding de produtores, suporte',
    modelo: 'Remoto, CLT/PJ',
    desc: 'Seja a ponte entre produtores e o produto. Você garante que novos clientes entrem com sucesso e extraiam o máximo da plataforma desde o primeiro evento.',
  },
]

export function CarreirasPage({ onLogin }: { onLogin: () => void }) {
  const { isPortuguese } = usePublicLocale()
  const [vagaAberta, setVagaAberta] = useState<number | null>(null)

  useSeoMeta({
    title: isPortuguese ? 'Carreiras | Pulse' : 'Careers | Pulse',
    description: isPortuguese
      ? 'Junte-se ao time que está reinventando a gestão de eventos no Brasil. Veja as oportunidades abertas.'
      : 'Join the team reinventing event management in Brazil. See open opportunities.',
  })

  return (
    <PublicLayout onLogin={onLogin}>
      {/* Hero */}
      <section className="px-5 py-20 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-4 py-1.5 text-[11px] uppercase tracking-widest text-[#9a9088] mb-6">
            {isPortuguese ? 'Carreiras' : 'Careers'}
          </div>
          <h1 className="text-4xl font-bold text-[#f0ebe2] md:text-5xl lg:text-6xl max-w-3xl leading-tight">
            {isPortuguese
              ? 'Construa o futuro dos eventos com a gente.'
              : 'Build the future of events with us.'}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-[#9a9088]">
            {isPortuguese
              ? 'A Pulse é pequena, rápida e obcecada com qualidade. Se você quer ter impacto real e crescer numa empresa que está criando algo novo, este é o lugar.'
              : 'Pulse is small, fast and obsessed with quality. If you want real impact and growth, this is the place.'}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="mailto:contatopulse@animalzgroup.com"
              className="rounded-full bg-[#0057E7] px-6 py-3 text-sm font-bold text-white hover:bg-[#4285F4] transition-colors inline-flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              {isPortuguese ? 'Enviar currículo' : 'Send resume'}
            </a>
            <a
              href="https://wa.me/14698629040"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/18 px-6 py-3 text-sm text-white hover:bg-white/8 transition-colors inline-flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Nossa Cultura */}
      <section className="px-5 py-16 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold text-[#f0ebe2] mb-2">
            {isPortuguese ? 'Nossa cultura' : 'Our culture'}
          </h2>
          <p className="text-[#9a9088] mb-10">
            {isPortuguese
              ? 'O que guia as decisões do dia a dia.'
              : 'What guides our day-to-day decisions.'}
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALORES.map((v) => {
              const Icon = v.icon
              return (
                <div key={v.titulo} className="rounded-2xl bg-white/5 border border-white/8 p-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#0057E7]/15">
                    <Icon className="h-5 w-5 text-[#4285F4]" />
                  </div>
                  <h3 className="mb-2 font-semibold text-[#f0ebe2]">{v.titulo}</h3>
                  <p className="text-sm text-[#9a9088] leading-relaxed">{v.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="px-5 py-16 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl bg-white/5 border border-white/8 p-8 md:p-10">
            <h2 className="text-2xl font-bold text-[#f0ebe2] mb-2">
              {isPortuguese ? 'Benefícios' : 'Benefits'}
            </h2>
            <p className="text-[#9a9088] mb-8">
              {isPortuguese
                ? 'O que você tem desde o primeiro dia.'
                : 'What you get from day one.'}
            </p>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {BENEFICIOS.map((b) => {
                const Icon = b.icon
                return (
                  <li key={b.texto} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0057E7]/15 shrink-0">
                      <Icon className="h-4 w-4 text-[#4285F4]" />
                    </div>
                    <span className="text-[#f0ebe2] text-sm">{b.texto}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* Vagas abertas */}
      <section className="px-5 py-16 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold text-[#f0ebe2] mb-2">
            {isPortuguese ? 'Vagas abertas' : 'Open positions'}
          </h2>
          <p className="text-[#9a9088] mb-10">
            {isPortuguese ? '3 posições disponíveis agora.' : '3 positions available now.'}
          </p>
          <div className="flex flex-col gap-4">
            {VAGAS.map((vaga, i) => (
              <div
                key={vaga.titulo}
                className="rounded-2xl bg-white/5 border border-white/8 p-6 cursor-pointer transition-colors hover:bg-white/8"
                onClick={() => setVagaAberta(vagaAberta === i ? null : i)}
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-[#f0ebe2] text-lg">{vaga.titulo}</h3>
                    <p className="text-sm text-[#4285F4] mt-0.5">{vaga.stack}</p>
                  </div>
                  <span className="mt-2 sm:mt-0 inline-flex items-center rounded-full border border-white/12 px-3 py-1 text-xs text-[#9a9088] shrink-0">
                    {vaga.modelo}
                  </span>
                </div>
                {vagaAberta === i && (
                  <div className="mt-4 pt-4 border-t border-white/8">
                    <p className="text-sm text-[#9a9088] leading-relaxed mb-4">{vaga.desc}</p>
                    <a
                      href="mailto:contatopulse@animalzgroup.com"
                      className="inline-flex items-center gap-2 rounded-full bg-[#0057E7] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#4285F4] transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Mail className="h-4 w-4" />
                      {isPortuguese ? 'Candidatar-se' : 'Apply now'}
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="px-5 py-20 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-[#0057E7]/30 bg-[#0057E7]/8 p-10 text-center">
            <h2 className="text-2xl font-bold text-[#f0ebe2] mb-3">
              {isPortuguese ? 'Não encontrou sua vaga?' : "Didn't find your role?"}
            </h2>
            <p className="text-[#9a9088] mb-8 max-w-md mx-auto">
              {isPortuguese
                ? 'Manda seu currículo mesmo assim. Se você for bom, criamos uma posição para você.'
                : 'Send your resume anyway. If you are great, we create a position for you.'}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="mailto:contatopulse@animalzgroup.com"
                className="rounded-full bg-[#0057E7] px-6 py-3 text-sm font-bold text-white hover:bg-[#4285F4] transition-colors inline-flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                {isPortuguese ? 'Enviar currículo' : 'Send resume'}
              </a>
              <a
                href="https://wa.me/14698629040"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-white/18 px-6 py-3 text-sm text-white hover:bg-white/8 transition-colors inline-flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                {isPortuguese ? 'Falar no WhatsApp' : 'WhatsApp'}
              </a>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
