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
    <footer className="border-t border-white/8 bg-[#050505]">
      <div className="px-5 py-16 md:px-8 lg:px-10">
        <div className="mx-auto max-w-[1540px]">
          <div className="rounded-2xl border border-white/8 bg-[linear-gradient(135deg,rgba(0,87,231,0.16)_0%,rgba(10,10,10,0.96)_40%,rgba(10,26,255,0.08)_100%)] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.32)] lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <div className="text-[10px] uppercase tracking-[0.38em] text-[#4285F4]">
                  {isPortuguese ? 'Radar Pulse' : 'Pulse radar'}
                </div>
                <h3 className="mt-4 text-[clamp(2rem,3vw,3rem)] font-bold leading-[0.9] tracking-[-0.03em] text-white">
                  {isPortuguese
                    ? 'Receba proximos eventos e aberturas de acesso.'
                    : 'Get upcoming events and access openings.'}
                </h3>
                <p className="mt-3 max-w-xl text-sm leading-7 text-white/58">
                  {isPortuguese
                    ? 'Novidades publicas, experiencias em destaque e avisos de lancamento em uma camada mais seletiva.'
                    : 'Public launches, featured experiences and release alerts in a more selective layer.'}
                </p>
              </div>

              <form onSubmit={handleSubscribe} className="flex gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isPortuguese ? 'Seu melhor email' : 'Your best email'}
                  className="flex-1 rounded-full border border-white/12 bg-white/[0.06] px-5 py-3 text-sm text-white outline-none transition-all placeholder:text-white/30 focus:border-[#4285F4]/35 focus:bg-white/[0.08]"
                  required
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full bg-[#0057E7] px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition-all hover:bg-[#4285F4]"
                >
                  {subscribed ? 'OK' : <ArrowRight className="h-4 w-4" />}
                </button>
              </form>
            </div>
          </div>

          {categories.length > 0 ? (
            <div className="mt-10">
              <div className="text-[10px] uppercase tracking-[0.3em] text-[#4285F4]">
                {isPortuguese ? 'Categorias' : 'Categories'}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => onCategoryClick?.(category)}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-white/64 transition-all hover:border-[#4285F4]/25 hover:text-white"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-12 grid gap-8 border-t border-white/8 pt-10 lg:grid-cols-[1fr_0.6fr_0.6fr_0.6fr]">
            <div>
              <a href="/" className="inline-flex items-center">
                {/* footer é sempre escuro → inverte a logo preta para branca */}
                <img src="/logo.png" alt="Pulse" className="h-12 w-auto brightness-0 invert" />
              </a>
              <p className="mt-4 max-w-sm text-sm leading-7 text-white/56">
                {isPortuguese
                  ? 'Plataforma premium para descoberta, venda, operacao e governanca de eventos.'
                  : 'Premium platform for discovery, sales, operations and governance in events.'}
              </p>
              <div className="mt-5 space-y-2 text-sm text-white/44">
                <div className="flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5" /> pulse.events
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5" /> +55 11 99999-0000
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" /> contato@pulse.events
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
                title: isPortuguese ? 'Produtor' : 'Producer',
                links: [
                  { label: isPortuguese ? 'Beneficios' : 'Benefits', href: '/producer' },
                  { label: isPortuguese ? 'Login' : 'Login', href: '/login' },
                  { label: isPortuguese ? 'Criar evento' : 'Create event', href: '/create-event' },
                ],
              },
              {
                title: isPortuguese ? 'Legal' : 'Legal',
                links: [
                  { label: isPortuguese ? 'Privacidade' : 'Privacy', href: '/privacy' },
                  { label: isPortuguese ? 'Termos' : 'Terms', href: '/terms' },
                ],
              },
            ].map((section) => (
              <div key={section.title}>
                <div className="text-[10px] uppercase tracking-[0.3em] text-[#4285F4]">{section.title}</div>
                <div className="mt-4 grid gap-3">
                  {section.links.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      className="text-sm text-white/56 transition-colors hover:text-white"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-white/8 pt-6 text-xs text-white/38 md:flex-row md:items-center md:justify-between">
            <p>
              &copy; {new Date().getFullYear()} Pulse.{' '}
              {isPortuguese ? 'Todos os direitos reservados.' : 'All rights reserved.'}
            </p>
            <p className="flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#0057E7]" />
              {isPortuguese ? 'Operacao premium de eventos' : 'Premium event operations'}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
