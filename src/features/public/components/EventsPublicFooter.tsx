import { ArrowRight, Globe, Mail, Phone } from 'lucide-react'
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
    if (!email) return
    setSubscribed(true)
    setEmail('')
    window.setTimeout(() => setSubscribed(false), 3000)
  }

  return (
    <footer className="border-t border-bg-border bg-white">
      {/* Newsletter section */}
      <div className="px-5 py-16 md:px-8 lg:px-10">
        <div className="mx-auto max-w-[1440px]">
          {/* Newsletter card */}
          <div className="rounded-3xl border border-bg-border bg-brand-navy p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.4em] text-white/50">
                  {isPortuguese ? 'Novidades' : 'Newsletter'}
                </div>
                <h3 className="mt-4 font-display text-[clamp(1.8rem,3vw,2.6rem)] font-bold uppercase leading-[0.92] tracking-tight text-white">
                  {isPortuguese
                    ? 'Receba novos eventos antes de todo mundo.'
                    : 'Get new events before everyone else.'}
                </h3>
                <p className="mt-3 max-w-md text-sm text-white/50">
                  {isPortuguese
                    ? 'Entre na lista e saiba primeiro sobre experiencias exclusivas.'
                    : 'Join the list and be the first to know about exclusive experiences.'}
                </p>
              </div>

              <form onSubmit={handleSubscribe} className="flex gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isPortuguese ? 'Seu melhor email' : 'Your best email'}
                  className="flex-1 rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-sm text-white outline-none transition-all placeholder:text-white/30 focus:border-white/30 focus:bg-white/15"
                  required
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-acid px-5 py-3 text-sm font-bold text-white transition-all hover:bg-[#e14425]"
                >
                  {subscribed ? '✓' : <ArrowRight className="h-4 w-4" />}
                </button>
              </form>
            </div>
          </div>

          {/* Categories */}
          {categories.length > 0 ? (
            <div className="mt-10">
              <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-text-muted">
                {isPortuguese ? 'Categorias' : 'Categories'}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => onCategoryClick?.(category)}
                    className="rounded-full border border-bg-border bg-bg-secondary px-4 py-2 text-xs text-text-secondary transition-all hover:border-brand-navy/20 hover:text-text-primary"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* Main footer links */}
          <div className="mt-12 grid gap-8 border-t border-bg-border pt-10 lg:grid-cols-[1fr_0.6fr_0.6fr_0.6fr]">
            <div>
              <a href="/" className="inline-flex items-center gap-3">
                <img src="/logo.png" alt="Animalz Events" className="h-9 w-auto" />
                <span className="text-sm font-bold uppercase tracking-[0.15em] text-brand-navy">
                  Animalz<span className="text-brand-acid">.</span>events
                </span>
              </a>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-text-secondary">
                {isPortuguese
                  ? 'Plataforma premium de eventos. Descoberta, venda e operacao em um so lugar.'
                  : 'Premium events platform. Discovery, sales and operations in one place.'}
              </p>
              <div className="mt-4 space-y-2 text-sm text-text-muted">
                <div className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5" /> events.animalzgroup.com
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5" /> +1 469 862 9040
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" /> contato@animalzevents.com
                </div>
              </div>
            </div>

            {[
              {
                title: isPortuguese ? 'Plataforma' : 'Platform',
                links: [
                  { label: isPortuguese ? 'Inicio' : 'Home', href: '/' },
                  { label: isPortuguese ? 'Eventos' : 'Events', href: '/events' },
                  { label: isPortuguese ? 'Minha conta' : 'My account', href: '/me' },
                ],
              },
              {
                title: isPortuguese ? 'Produtores' : 'Creators',
                links: [
                  { label: isPortuguese ? 'Criar evento' : 'Create event', href: '/create-event' },
                  { label: isPortuguese ? 'Sobre' : 'About', href: '/about' },
                ],
              },
              {
                title: isPortuguese ? 'Juridico' : 'Legal',
                links: [
                  { label: isPortuguese ? 'Privacidade' : 'Privacy', href: '/privacy' },
                  { label: isPortuguese ? 'Termos' : 'Terms', href: '/terms' },
                ],
              },
            ].map((section) => (
              <div key={section.title}>
                <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-text-muted">
                  {section.title}
                </div>
                <div className="mt-4 grid gap-3">
                  {section.links.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      className="text-sm text-text-secondary transition-colors hover:text-brand-navy"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="mt-10 flex flex-col gap-3 border-t border-bg-border pt-6 text-xs text-text-muted md:flex-row md:items-center md:justify-between">
            <p>
              &copy; {new Date().getFullYear()} Animalz Events.{' '}
              {isPortuguese ? 'Todos os direitos reservados.' : 'All rights reserved.'}
            </p>
            <p className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-acid" />
              {isPortuguese ? 'Plataforma premium de eventos' : 'Premium events platform'}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
