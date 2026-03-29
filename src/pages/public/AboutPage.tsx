import { ArrowRight, Globe, Layers3, Sparkles } from 'lucide-react'
import { BrandSection, PublicLayout, PublicReveal, SocialProofSection, usePublicEvents } from '@/features/public'
import { usePublicLocale } from '@/features/public/lib/public-locale'
import { useSeoMeta } from '@/shared/lib'
import { LoadingState } from '@/shared/components'

export function AboutPage({ onLogin }: { onLogin: () => void }) {
  const { isPortuguese, locale } = usePublicLocale()
  const publicEventsQuery = usePublicEvents()
  const events = publicEventsQuery.data ?? []
  const participants = events.reduce((sum, event) => sum + event.sold_tickets, 0)
  const capacity = events.reduce((sum, event) => sum + (event.total_capacity ?? 0), 0)
  const cities = new Set(events.map((event) => event.city).filter(Boolean)).size

  useSeoMeta({
    title: isPortuguese ? 'Sobre | Animalz Events' : 'About | Animalz Events',
    description: isPortuguese
      ? 'Animalz Events conecta compradores a eventos de cultura, gastronomia, musica e lifestyle, com compra simples e acesso garantido.'
      : 'Animalz Events connects buyers to culture, food, music and lifestyle events with simple purchase and guaranteed access.',
    image: events[0]?.mediaPresentation.coverAsset?.secure_url ?? events[0]?.cover_url ?? null,
    url: typeof window !== 'undefined' ? window.location.href : '/about',
  })

  return (
    <PublicLayout onLogin={onLogin}>
      <section className="px-5 pb-12 pt-12 md:px-10 lg:px-16 lg:pt-18">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.92fr] lg:items-end">
          <PublicReveal>
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.06)] px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-[#6a6058]">
                <Sparkles className="h-4 w-4" />
                {isPortuguese ? 'Sobre a Animalz Events' : 'About Animalz Events'}
              </div>
              <h1 className="mt-6 font-display text-[clamp(4rem,7vw,7.2rem)] font-semibold leading-[0.86] tracking-[-0.05em] text-[#f0ebe2]">
                {isPortuguese
                  ? 'Eventos que valem a experiencia. Acesso simples e garantido.'
                  : 'Events worth the experience. Simple and guaranteed access.'}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-[#9a9088] md:text-lg">
                {isPortuguese
                  ? 'Animalz Events conecta compradores aos melhores eventos de cultura, gastronomia, musica e lifestyle. Compre ingressos com facilidade, receba seu QR code e aproveite cada momento.'
                  : 'Animalz Events connects buyers to the best culture, food, music and lifestyle events. Buy tickets easily, receive your QR code and enjoy every moment.'}
              </p>
            </div>
          </PublicReveal>

          <PublicReveal delayMs={100}>
            <div className="rounded-[2.4rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)] p-7 shadow-[0_22px_65px_rgba(0,0,0,0.5)] md:p-9">
              <div className="grid gap-4">
                {[
                  {
                    icon: Layers3,
                    label: isPortuguese ? 'Para compradores' : 'For buyers',
                    text: isPortuguese
                      ? 'Descubra eventos com criterio, compre ingressos em segundos e garanta seu lugar com QR code.'
                      : 'Discover events with curation, buy tickets in seconds and secure your place with a QR code.',
                  },
                  {
                    icon: Globe,
                    label: isPortuguese ? 'Para criadores' : 'For creators',
                    text: isPortuguese
                      ? 'Publique seu evento, venda ingressos, gerencie credenciamento e acompanhe resultados em um unico lugar.'
                      : 'Publish your event, sell tickets, manage check-in and track results in one place.',
                  },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} className="rounded-[1.6rem] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#c49a50]/15 text-[#c49a50]">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="text-[11px] uppercase tracking-[0.28em] text-[#6a6058]">{item.label}</div>
                      </div>
                      <p className="mt-4 text-sm leading-7 text-[#9a9088]">{item.text}</p>
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
              title={isPortuguese ? 'Carregando informacoes' : 'Loading information'}
              description={isPortuguese ? 'Buscando os dados mais recentes da plataforma.' : 'Loading the latest platform data.'}
              className="min-h-[18rem]"
            />
          </div>
        </div>
      ) : (
        <SocialProofSection
          title={isPortuguese ? 'Numeros reais de quem ja escolheu a plataforma.' : 'Real numbers from people already using the platform.'}
          description={isPortuguese ? 'Eventos publicados, ingressos vendidos e cidades alcancadas. Cada numero representa uma experiencia real vivida por pessoas reais.' : 'Published events, sold tickets and reached cities. Each number represents a real experience lived by real people.'}
          metrics={[
            {
              label: isPortuguese ? 'Eventos publicados' : 'Published events',
              value: events.length.toLocaleString(locale),
              note: isPortuguese ? 'Eventos, festivais e experiencias disponiveis para compra na plataforma.' : 'Events, festivals and experiences available for purchase on the platform.',
            },
            {
              label: isPortuguese ? 'Ingressos vendidos' : 'Tickets sold',
              value: participants.toLocaleString(locale),
              note: isPortuguese ? 'Compradores que garantiram seu lugar e viveram suas experiencias.' : 'Buyers who secured their place and lived their experiences.',
            },
            {
              label: isPortuguese ? 'Vagas disponiveis' : 'Available spots',
              value: capacity.toLocaleString(locale),
              note: isPortuguese
                ? `${cities.toLocaleString(locale)} cidades com eventos ativos na plataforma.`
                : `${cities.toLocaleString(locale)} cities with active events on the platform.`,
            },
          ]}
        />
      )}

      <section className="px-5 pb-20 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl rounded-[2.8rem] bg-[#080706] px-8 py-10 text-white md:px-12 md:py-14">
          <PublicReveal>
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <div className="text-[11px] uppercase tracking-[0.3em] text-white/54">{isPortuguese ? 'Comece agora' : 'Start now'}</div>
                <div className="mt-4 font-display text-[clamp(2.8rem,4.5vw,4.8rem)] font-semibold leading-[0.9] tracking-[-0.05em] text-white">
                  {isPortuguese ? 'Encontre seu proximo evento ou publique o seu.' : 'Find your next event or publish your own.'}
                </div>
                <p className="mt-5 max-w-2xl text-base leading-8 text-white/72">
                  {isPortuguese
                    ? 'Compre ingressos com facilidade, garanta seu acesso com QR code, ou crie e gerencie seu proprio evento na plataforma.'
                    : 'Buy tickets easily, secure your access with a QR code, or create and manage your own event on the platform.'}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <a
                  href="/events"
                  className="inline-flex items-center gap-2 rounded-full bg-[#f2e6d6] px-6 py-3 text-sm font-medium text-[#1f1a15] transition-all hover:-translate-y-0.5"
                >
                  {isPortuguese ? 'Ver todos os eventos' : 'View all events'}
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href="/create-event"
                  className="inline-flex items-center gap-2 rounded-full border border-white/18 px-6 py-3 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-white/8"
                >
                  {isPortuguese ? 'Sou criador' : 'I am a creator'}
                </a>
              </div>
            </div>
          </PublicReveal>
        </div>
      </section>
    </PublicLayout>
  )
}
