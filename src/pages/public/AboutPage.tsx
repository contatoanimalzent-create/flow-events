import { ArrowRight, Globe, Layers3, Sparkles } from 'lucide-react'
import { BrandSection, PublicLayout, PublicReveal, SocialProofSection, usePublicEvents } from '@/features/public'
import { useSeoMeta } from '@/shared/lib'
import { LoadingState } from '@/shared/components'

export function AboutPage({ onLogin }: { onLogin: () => void }) {
  const publicEventsQuery = usePublicEvents()
  const events = publicEventsQuery.data ?? []
  const participants = events.reduce((sum, event) => sum + event.sold_tickets, 0)
  const capacity = events.reduce((sum, event) => sum + (event.total_capacity ?? 0), 0)
  const cities = new Set(events.map((event) => event.city).filter(Boolean)).size

  useSeoMeta({
    title: 'Sobre | Animalz Events',
    description: 'Animalz Events conecta compradores a eventos de cultura, gastronomia, musica e lifestyle, com compra simples e acesso garantido.',
    image: events[0]?.mediaPresentation.coverAsset?.secure_url ?? events[0]?.cover_url ?? null,
    url: typeof window !== 'undefined' ? window.location.href : '/about',
  })

  return (
    <PublicLayout onLogin={onLogin}>
      <section className="px-5 pb-12 pt-12 md:px-10 lg:px-16 lg:pt-18">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.92fr] lg:items-end">
          <PublicReveal>
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#ddd0bc] bg-white/82 px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-[#8b7c69]">
                <Sparkles className="h-4 w-4" />
                About Animalz Events
              </div>
              <h1 className="mt-6 font-display text-[clamp(4rem,7vw,7.2rem)] font-semibold leading-[0.86] tracking-[-0.05em] text-[#1f1a15]">
                Eventos que valem a experiencia. Acesso simples e garantido.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[#5f5549] md:text-lg">
                Animalz Events conecta compradores aos melhores eventos de cultura, gastronomia, musica e lifestyle. Compre ingressos com facilidade, receba seu QR code e aproveite cada momento.
              </p>
            </div>
          </PublicReveal>

          <PublicReveal delayMs={100}>
            <div className="rounded-[2.4rem] border border-[#e5d8c7] bg-white/88 p-7 shadow-[0_22px_65px_rgba(66,48,24,0.08)] md:p-9">
              <div className="grid gap-4">
                {[
                  {
                    icon: Layers3,
                    label: 'Para compradores',
                    text: 'Descubra eventos com criterio, compre ingressos em segundos e garanta seu lugar com QR code.',
                  },
                  {
                    icon: Globe,
                    label: 'Para produtores',
                    text: 'Publique seu evento, venda ingressos, gerencie check-in e acompanhe resultados em um unico lugar.',
                  },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} className="rounded-[1.6rem] border border-[#ece1d1] bg-[#fbf7f1] p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#efe3d2] text-[#816941]">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="text-[11px] uppercase tracking-[0.28em] text-[#8b7c69]">{item.label}</div>
                      </div>
                      <p className="mt-4 text-sm leading-7 text-[#5f5549]">{item.text}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </PublicReveal>
        </div>
      </section>

      <BrandSection />

      {publicEventsQuery.isPending ? (
        <div className="px-5 pb-16 md:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <LoadingState
              title="Carregando informacoes"
              description="Buscando os dados mais recentes da plataforma."
              className="min-h-[18rem]"
            />
          </div>
        </div>
      ) : (
        <SocialProofSection
          title="Numeros reais de quem ja escolheu a plataforma."
          description="Eventos publicados, ingressos vendidos e cidades alcancadas. Cada numero representa uma experiencia real vivida por pessoas reais."
          metrics={[
            {
              label: 'Eventos publicados',
              value: events.length.toLocaleString('pt-BR'),
              note: 'Eventos, festivais e experiencias disponiveis para compra na plataforma.',
            },
            {
              label: 'Ingressos vendidos',
              value: participants.toLocaleString('pt-BR'),
              note: 'Compradores que garantiram seu lugar e viveram suas experiencias.',
            },
            {
              label: 'Vagas disponiveis',
              value: capacity.toLocaleString('pt-BR'),
              note: `${cities.toLocaleString('pt-BR')} cidades com eventos ativos na plataforma.`,
            },
          ]}
        />
      )}

      <section className="px-5 pb-20 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl rounded-[2.8rem] bg-[#1f1a15] px-8 py-10 text-white md:px-12 md:py-14">
          <PublicReveal>
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <div className="text-[11px] uppercase tracking-[0.3em] text-white/54">Comece agora</div>
                <div className="mt-4 font-display text-[clamp(2.8rem,4.5vw,4.8rem)] font-semibold leading-[0.9] tracking-[-0.05em] text-white">
                  Encontre seu proximo evento ou publique o seu.
                </div>
                <p className="mt-5 max-w-2xl text-base leading-8 text-white/72">
                  Compre ingressos com facilidade, garanta seu acesso com QR code, ou crie e gerencie seu proprio evento na plataforma.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <a
                  href="/events"
                  className="inline-flex items-center gap-2 rounded-full bg-[#f2e6d6] px-6 py-3 text-sm font-medium text-[#1f1a15] transition-all hover:-translate-y-0.5"
                >
                  Ver todos os eventos
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="/create-event"
                  className="inline-flex items-center gap-2 rounded-full border border-white/18 px-6 py-3 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-white/8"
                >
                  Sou produtor
                </a>
              </div>
            </div>
          </PublicReveal>
        </div>
      </section>
    </PublicLayout>
  )
}
