import { ArrowRight, Mail, MapPin, Phone } from 'lucide-react'
import { useState } from 'react'
import { usePublicLocale } from '../lib/public-locale'

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
    <footer className="border-t border-[rgba(255,255,255,0.06)] bg-[linear-gradient(180deg,#090c11_0%,#05070a_100%)]">
      <div className="px-5 py-14 md:px-10 lg:px-16 lg:py-18">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2.4rem] border border-[rgba(255,255,255,0.06)] bg-[linear-gradient(135deg,rgba(17,20,26,0.96),rgba(11,14,19,0.92))] p-8 shadow-[0_24px_70px_rgba(0,0,0,0.34)] md:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-end">
              <div>
                <div className="text-[11px] uppercase tracking-[0.34em] text-[#ff6a5c]">
                  {isPortuguese ? 'Acesso prioritario' : 'Priority access'}
                </div>
                <h3 className="mt-4 max-w-xl font-display text-[clamp(2.4rem,4vw,4rem)] font-semibold leading-[0.92] tracking-[-0.04em] text-[#f5f7fa]">
                  {isPortuguese
                    ? 'Receba novas experiencias, aberturas e acessos antes do restante do publico.'
                    : 'Receive new experiences, launches and access windows before the wider public.'}
                </h3>
                <p className="mt-4 max-w-xl text-sm leading-7 text-[#a9b0bc] md:text-base">
                  {isPortuguese
                    ? 'Uma camada editorial para quem quer descobrir experiencias com mais contexto, mais clareza e melhor timing.'
                    : 'An editorial layer for people who want to discover experiences with better context, clarity and timing.'}
                </p>
              </div>

              <form onSubmit={handleSubscribe} className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                <label className="relative block">
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={isPortuguese ? 'Seu melhor e-mail' : 'Your best email'}
                    className="w-full rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-5 py-4 pr-12 text-sm text-[#f5f7fa] outline-none transition-all duration-300 placeholder:text-[#6f7785] focus:border-[#ff2d2d]/40 focus:shadow-[0_14px_28px_rgba(0,0,0,0.16)]"
                    required
                  />
                  <Mail className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b8390]" />
                </label>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#ff2d2d] px-6 py-4 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(255,45,45,0.32)]"
                >
                  {subscribed
                    ? isPortuguese
                      ? 'Acesso confirmado'
                      : 'Access confirmed'
                    : isPortuguese
                      ? 'Receber novidades'
                      : 'Get updates'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>

          {categories.length > 0 ? (
            <div className="mt-10">
              <div className="text-[11px] uppercase tracking-[0.32em] text-[#7b8390]">
                {isPortuguese ? 'Explore por categoria' : 'Explore by category'}
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => onCategoryClick?.(category)}
                    className="rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-4 py-2 text-sm text-[#a9b0bc] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#ff2d2d]/30 hover:text-[#f5f7fa]"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-12 grid gap-10 border-t border-[rgba(255,255,255,0.06)] pt-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
            <div>
              <img src="/logo.png" alt="Animalz Events" className="h-16 w-auto object-contain" />
              <p className="mt-5 max-w-sm text-sm leading-7 text-[#a9b0bc]">
                {isPortuguese
                  ? 'Animalz Events organiza descoberta, conversao e operacao em uma camada de experiencias com ambicao global.'
                  : 'Animalz Events organizes discovery, conversion and operations in a global premium experiences layer.'}
              </p>
              <div className="mt-5 space-y-2 text-sm text-[#a9b0bc]">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#ff6a5c]" />
                  {isPortuguese ? 'Sao Paulo, Brasil' : 'Sao Paulo, Brazil'}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[#ff6a5c]" />
                  contato@animalzevents.com
                </div>
              </div>
            </div>

            {[
              {
                title: isPortuguese ? 'Experiencias' : 'Experiences',
                links: [
                  { label: isPortuguese ? 'Agenda completa' : 'Full calendar', href: '/events' },
                  { label: isPortuguese ? 'Minha conta' : 'My account', href: '/me' },
                  { label: isPortuguese ? 'Sobre a plataforma' : 'About the platform', href: '/about' },
                ],
              },
              {
                title: isPortuguese ? 'Produtores' : 'Producers',
                links: [
                  { label: isPortuguese ? 'Publicar experiencia' : 'Publish experience', href: '/create-event' },
                  { label: isPortuguese ? 'Monetizacao' : 'Monetization', href: '/billing' },
                  { label: isPortuguese ? 'Crescimento' : 'Growth', href: '/growth' },
                ],
              },
              {
                title: isPortuguese ? 'Institucional' : 'Company',
                links: [
                  { label: isPortuguese ? 'Ajuda' : 'Help', href: '/help' },
                  { label: isPortuguese ? 'Privacidade' : 'Privacy', href: '/privacy' },
                  { label: isPortuguese ? 'Termos' : 'Terms', href: '/terms' },
                ],
              },
            ].map((section) => (
              <div key={section.title}>
                <div className="text-[11px] uppercase tracking-[0.32em] text-[#7b8390]">{section.title}</div>
                <div className="mt-4 grid gap-3">
                  {section.links.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      className="text-sm text-[#a9b0bc] transition-colors duration-300 hover:text-[#f5f7fa]"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-[rgba(255,255,255,0.06)] pt-6 text-xs text-[#6f7785] md:flex-row md:items-center md:justify-between">
            <p>&copy; {new Date().getFullYear()} Animalz Events. All rights reserved.</p>
            <p>
              {isPortuguese
                ? 'Plataforma premium de experiencias para descoberta, ticketing e operacao real.'
                : 'Premium experiences platform for discovery, ticketing and real operations.'}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
