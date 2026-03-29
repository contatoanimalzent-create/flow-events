import { ArrowRight, Globe, Headphones, Mail, Phone } from 'lucide-react'
import { useState } from 'react'
import { usePublicLocale } from '../lib/public-locale'
import { AnimalzBrandMark } from './AnimalzBrandMark'

interface EventsPublicFooterProps {
  categories?: string[]
  onCategoryClick?: (category: string) => void
}

export function EventsPublicFooter({ categories = [], onCategoryClick }: EventsPublicFooterProps) {
  const { isPortuguese } = usePublicLocale()
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  function handleSubscribe(event: React.FormEvent) {
    event.preventDefault()

    if (!email) {
      return
    }

    setSubscribed(true)
    setEmail('')
    window.setTimeout(() => setSubscribed(false), 3000)
  }

  return (
    <footer className="bg-[linear-gradient(180deg,#02050a_0%,#04070d_100%)] text-white">
      <div className="px-4 py-12 md:px-8 lg:px-12 lg:py-16">
        <div className="mx-auto max-w-[1920px]">
          <div className="grid gap-8 border-t border-white/10 pt-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="max-w-xl">
              <div className="text-[11px] uppercase tracking-[0.36em] text-white/38">
                {isPortuguese ? 'Entrar na lista' : 'Join the list'}
              </div>
              <h3 className="mt-5 font-display text-[clamp(2.8rem,4.4vw,5rem)] font-semibold uppercase leading-[0.86] tracking-[-0.05em] text-white">
                {isPortuguese
                  ? 'Receba novas experiencias antes da abertura publica.'
                  : 'Receive new experiences before the public release.'}
              </h3>
              <p className="mt-5 max-w-lg text-base leading-8 text-white/60">
                {isPortuguese
                  ? 'Uma camada de descoberta pensada para quem acompanha cultura, hospitalidade e eventos como lifestyle.'
                  : 'A discovery layer built for people who follow culture, hospitality and events as lifestyle.'}
              </p>
            </div>

            <div className="rounded-[2.1rem] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm">
              <form onSubmit={handleSubscribe} className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto]">
                <label className="relative block">
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={isPortuguese ? 'Seu melhor e-mail' : 'Your best email'}
                    className="w-full rounded-full border border-white/10 bg-white/[0.04] px-5 py-4 pr-12 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/36 focus:border-white/24"
                    required
                  />
                  <Mail className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/38" />
                </label>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#9ec9fb] px-6 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-[#09131c] transition-all duration-300 hover:-translate-y-0.5"
                >
                  {subscribed ? (isPortuguese ? 'Confirmado' : 'Confirmed') : isPortuguese ? 'Receber capitulos' : 'Get chapters'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="tel:+14698629040"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/78 transition-colors hover:text-white"
                >
                  <Headphones className="h-4 w-4" />
                  +1 469 862 9040
                </a>
                <a
                  href="mailto:contato@animalzevents.com"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/78 transition-colors hover:text-white"
                >
                  <Mail className="h-4 w-4" />
                  contato@animalzevents.com
                </a>
              </div>
            </div>
          </div>

          {categories.length > 0 ? (
            <div className="mt-12 border-t border-white/10 pt-8">
              <div className="text-[11px] uppercase tracking-[0.36em] text-white/38">
                {isPortuguese ? 'Curadoria por categoria' : 'Curated by category'}
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => onCategoryClick?.(category)}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/66 transition-all duration-300 hover:border-white/22 hover:text-white"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-12 grid gap-10 border-t border-white/10 pt-8 lg:grid-cols-[0.95fr_0.7fr_0.7fr_0.7fr]">
            <div>
              <AnimalzBrandMark inverse />
              <p className="mt-5 max-w-sm text-sm leading-7 text-white/58">
                {isPortuguese
                  ? 'Animalz Experiences organiza descoberta, compra e operacao em uma linguagem premium inspirada por cultura, velocidade e presenca de marca.'
                  : 'Animalz Experiences organizes discovery, purchase and operations through a premium language inspired by culture, speed and brand presence.'}
              </p>
              <div className="mt-5 space-y-2 text-sm text-white/54">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-white/42" />
                  animalz.events
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-white/42" />
                  +1 469 862 9040
                </div>
              </div>
            </div>

            {[
              {
                title: isPortuguese ? 'Experiencias' : 'Experiences',
                links: [
                  { label: isPortuguese ? 'Home' : 'Home', href: '/' },
                  { label: isPortuguese ? 'Agenda' : 'Calendar', href: '/events' },
                  { label: isPortuguese ? 'Minha conta' : 'My account', href: '/me' },
                ],
              },
              {
                title: isPortuguese ? 'Produtores' : 'Creators',
                links: [
                  { label: isPortuguese ? 'Criar evento' : 'Create event', href: '/create-event' },
                  { label: isPortuguese ? 'Sobre' : 'About', href: '/about' },
                  { label: isPortuguese ? 'Ajuda' : 'Help', href: '/help' },
                ],
              },
              {
                title: isPortuguese ? 'Base legal' : 'Legal',
                links: [
                  { label: isPortuguese ? 'Privacidade' : 'Privacy', href: '/privacy' },
                  { label: isPortuguese ? 'Termos' : 'Terms', href: '/terms' },
                ],
              },
            ].map((section) => (
              <div key={section.title}>
                <div className="text-[11px] uppercase tracking-[0.36em] text-white/38">{section.title}</div>
                <div className="mt-4 grid gap-3">
                  {section.links.map((link) => (
                    <a key={link.label} href={link.href} className="text-sm text-white/62 transition-colors duration-300 hover:text-white">
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/34 md:flex-row md:items-center md:justify-between">
            <p>&copy; {new Date().getFullYear()} Animalz Experiences.</p>
            <p>
              {isPortuguese
                ? 'Descoberta premium, ticketing e operacao real em uma unica camada.'
                : 'Premium discovery, ticketing and real operations in one layer.'}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
