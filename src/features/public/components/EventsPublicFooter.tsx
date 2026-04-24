import { ArrowRight, Globe, Mail, Phone, Instagram, Linkedin, Youtube, Twitter } from 'lucide-react'
import { useState } from 'react'
import { usePublicLocale } from '../lib/public-locale'

interface EventsPublicFooterProps {
  categories?: string[]
  onCategoryClick?: (category: string) => void
}

const WHATSAPP_URL =
  'https://wa.me/14698629040?text=' +
  encodeURIComponent('👋 Olá! Vim pelo site da Pulse e preciso de ajuda.')

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

  const columns = isPortuguese
    ? [
        {
          title: 'Para Produtores',
          links: [
            { label: 'Como funciona', href: '/como-funciona' },
            { label: 'Crie seu evento', href: '/criar-evento' },
            { label: 'Quanto custa', href: '/precos' },
            { label: 'Demonstração', href: '/demo' },
            { label: 'API & Integrações', href: '/api' },
            { label: 'App organizador', href: '/pulse' },
            { label: 'Fale com vendas', href: WHATSAPP_URL },
          ],
        },
        {
          title: 'Funcionalidades',
          links: [
            { label: 'Check-in mobile', href: '/funcionalidades#checkin' },
            { label: 'Credenciamento', href: '/funcionalidades#checkin' },
            { label: 'Gestão de staff', href: '/funcionalidades#staff' },
            { label: 'Controle de fluxo', href: '/funcionalidades#fluxo' },
            { label: 'Relatórios ao vivo', href: '/funcionalidades#relatorios' },
            { label: 'Virada de lote', href: '/funcionalidades#lotes' },
            { label: 'Pagamento antecipado', href: '/funcionalidades#pagamento' },
            { label: 'Ver todas', href: '/funcionalidades' },
          ],
        },
        {
          title: 'Tipos de Evento',
          links: [
            { label: 'Festas e shows', href: '/eventos/festas' },
            { label: 'Corporativos', href: '/eventos/corporativos' },
            { label: 'Eventos esportivos', href: '/eventos/esportivos' },
            { label: 'Gastronômicos', href: '/eventos/gastronomicos' },
            { label: 'Teatros e cultura', href: '/eventos/cultura' },
            { label: 'Eventos infantis', href: '/eventos/infantis' },
            { label: 'Religiosos', href: '/eventos/religiosos' },
            { label: 'Ver todos', href: '/events' },
          ],
        },
        {
          title: 'Empresa',
          links: [
            { label: 'Sobre a Pulse', href: '/sobre' },
            { label: 'Carreiras', href: '/carreiras' },
            { label: 'Blog', href: '/blog' },
            { label: 'Cases de sucesso', href: '/cases' },
            { label: 'Imprensa', href: '/imprensa' },
            { label: 'Contato', href: `mailto:contatopulse@animalzgroup.com` },
          ],
        },
        {
          title: 'Ajuda',
          links: [
            { label: 'Central de Ajuda', href: '/ajuda' },
            { label: 'Para compradores', href: '/ajuda/compradores' },
            { label: 'Para produtores', href: '/ajuda/produtores' },
            { label: 'WhatsApp suporte', href: WHATSAPP_URL },
            { label: 'Status do sistema', href: '/status' },
            { label: 'Privacidade', href: '/privacidade' },
            { label: 'Termos de uso', href: '/termos' },
          ],
        },
      ]
    : [
        {
          title: 'For Producers',
          links: [
            { label: 'How it works', href: '/como-funciona' },
            { label: 'Create event', href: '/create-event' },
            { label: 'Pricing', href: '/precos' },
            { label: 'Demo', href: '/demo' },
            { label: 'API & Integrations', href: '/api' },
            { label: 'Organizer app', href: '/pulse' },
            { label: 'Talk to sales', href: WHATSAPP_URL },
          ],
        },
        {
          title: 'Features',
          links: [
            { label: 'Mobile check-in', href: '/funcionalidades#checkin' },
            { label: 'Accreditation', href: '/funcionalidades#checkin' },
            { label: 'Staff management', href: '/funcionalidades#staff' },
            { label: 'Flow control', href: '/funcionalidades#fluxo' },
            { label: 'Live reports', href: '/funcionalidades#relatorios' },
            { label: 'Ticket phases', href: '/funcionalidades#lotes' },
            { label: 'Early payout', href: '/funcionalidades#pagamento' },
            { label: 'View all', href: '/funcionalidades' },
          ],
        },
        {
          title: 'Event Types',
          links: [
            { label: 'Parties & shows', href: '/eventos/festas' },
            { label: 'Corporate events', href: '/eventos/corporativos' },
            { label: 'Sports events', href: '/eventos/esportivos' },
            { label: 'Food & drink', href: '/eventos/gastronomicos' },
            { label: 'Arts & culture', href: '/eventos/cultura' },
            { label: "Children's events", href: '/eventos/infantis' },
            { label: 'Religious events', href: '/eventos/religiosos' },
            { label: 'View all', href: '/events' },
          ],
        },
        {
          title: 'Company',
          links: [
            { label: 'About Pulse', href: '/about' },
            { label: 'Careers', href: '/carreiras' },
            { label: 'Blog', href: '/blog' },
            { label: 'Success stories', href: '/cases' },
            { label: 'Press', href: '/imprensa' },
            { label: 'Contact', href: `mailto:contatopulse@animalzgroup.com` },
          ],
        },
        {
          title: 'Help',
          links: [
            { label: 'Help center', href: '/ajuda' },
            { label: 'For buyers', href: '/ajuda/compradores' },
            { label: 'For producers', href: '/ajuda/produtores' },
            { label: 'WhatsApp support', href: WHATSAPP_URL },
            { label: 'System status', href: '/status' },
            { label: 'Privacy policy', href: '/privacy' },
            { label: 'Terms of service', href: '/terms' },
          ],
        },
      ]

  return (
    <footer className="border-t border-white/8 bg-[#050505]">
      <div className="px-5 py-16 md:px-8 lg:px-10">
        <div className="mx-auto max-w-[1540px]">

          {/* ── Newsletter banner ── */}
          <div className="rounded-2xl border border-white/8 bg-[linear-gradient(135deg,rgba(0,87,231,0.16)_0%,rgba(10,10,10,0.96)_40%,rgba(10,26,255,0.08)_100%)] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.32)] lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <div className="text-[10px] uppercase tracking-[0.38em] text-[#4285F4]">
                  {isPortuguese ? 'Radar Pulse' : 'Pulse radar'}
                </div>
                <h3 className="mt-4 text-[clamp(2rem,3vw,3rem)] font-bold leading-[0.9] tracking-[-0.03em] text-white">
                  {isPortuguese
                    ? 'Receba próximos eventos e aberturas de acesso.'
                    : 'Get upcoming events and access openings.'}
                </h3>
                <p className="mt-3 max-w-xl text-sm leading-7 text-white/58">
                  {isPortuguese
                    ? 'Novidades públicas, experiências em destaque e avisos de lançamento em uma camada mais seletiva.'
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

          {/* ── Category pills (optional) ── */}
          {categories.length > 0 && (
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
          )}

          {/* ── Main link grid ── */}
          <div className="mt-12 border-t border-white/8 pt-10">
            <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(5,_1fr)]">

              {/* Brand column */}
              <div>
                <a href="/" className="inline-flex items-center">
                  <img src="/logo.png" alt="Pulse" className="h-10 w-auto brightness-0 invert" />
                </a>
                <p className="mt-4 max-w-[200px] text-sm leading-7 text-white/50">
                  {isPortuguese
                    ? 'Plataforma premium para descoberta, venda, operação e governança de eventos.'
                    : 'Premium platform for event discovery, sales, operations and governance.'}
                </p>

                {/* Contact info */}
                <div className="mt-5 space-y-2 text-xs text-white/40">
                  <div className="flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5 shrink-0" />
                    <span>pulse.animalzgroup.com</span>
                  </div>
                  <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white/70 transition-colors">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <span>+1 (469) 862-9040</span>
                  </a>
                  <a href="mailto:contatopulse@animalzgroup.com" className="flex items-center gap-2 hover:text-white/70 transition-colors">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span>contatopulse@animalzgroup.com</span>
                  </a>
                </div>

                {/* Social links */}
                <div className="mt-5 flex gap-3">
                  {[
                    { icon: Instagram, href: 'https://instagram.com/pulseeventsapp', label: 'Instagram' },
                    { icon: Linkedin, href: 'https://linkedin.com/company/pulse-events', label: 'LinkedIn' },
                    { icon: Youtube, href: 'https://youtube.com/@pulseeventsapp', label: 'YouTube' },
                    { icon: Twitter, href: 'https://twitter.com/pulseeventsapp', label: 'X / Twitter' },
                  ].map(({ icon: Icon, href, label }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={label}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/40 transition-all hover:border-[#4285F4]/30 hover:text-white"
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </a>
                  ))}
                </div>

                {/* App badges */}
                <div className="mt-5 flex flex-col gap-2">
                  <a
                    href="https://apps.apple.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs text-white/70 transition-all hover:border-white/20 hover:text-white"
                  >
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                    </svg>
                    {isPortuguese ? 'Disponível na App Store' : 'Download on App Store'}
                  </a>
                  <a
                    href="https://play.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs text-white/70 transition-all hover:border-white/20 hover:text-white"
                  >
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 20.5v-17c0-.83.94-1.3 1.6-.8l14 8.5c.6.37.6 1.23 0 1.6l-14 8.5c-.66.5-1.6.03-1.6-.8z" />
                    </svg>
                    {isPortuguese ? 'Disponível no Google Play' : 'Get it on Google Play'}
                  </a>
                </div>
              </div>

              {/* Link columns */}
              {columns.map((col) => (
                <div key={col.title}>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#4285F4]">
                    {col.title}
                  </div>
                  <div className="mt-4 grid gap-2.5">
                    {col.links.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        target={link.href.startsWith('http') || link.href.startsWith('mailto') ? '_blank' : undefined}
                        rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
                        className="text-sm text-white/50 transition-colors hover:text-white"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Copyright bar ── */}
          <div className="mt-10 flex flex-col gap-3 border-t border-white/8 pt-6 text-xs text-white/30 md:flex-row md:items-center md:justify-between">
            <p>
              &copy; {new Date().getFullYear()} Pulse by Animalz Group.{' '}
              {isPortuguese ? 'Todos os direitos reservados.' : 'All rights reserved.'}
            </p>
            <div className="flex items-center gap-4">
              <a href={isPortuguese ? '/privacidade' : '/privacy'} className="hover:text-white/60 transition-colors">
                {isPortuguese ? 'Privacidade' : 'Privacy'}
              </a>
              <a href={isPortuguese ? '/termos' : '/terms'} className="hover:text-white/60 transition-colors">
                {isPortuguese ? 'Termos' : 'Terms'}
              </a>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#0057E7]" />
                {isPortuguese ? 'Operação premium de eventos' : 'Premium event operations'}
              </span>
            </div>
          </div>

        </div>
      </div>
    </footer>
  )
}
