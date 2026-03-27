import { ArrowRight, Mail, MapPin, Phone } from 'lucide-react'
import { useState } from 'react'

interface EventsPublicFooterProps {
  categories?: string[]
  onCategoryClick?: (category: string) => void
}

export function EventsPublicFooter({ categories = [], onCategoryClick }: EventsPublicFooterProps) {
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
    <footer className="border-t border-[rgba(120,98,68,0.08)] bg-[linear-gradient(180deg,#f6f1e8_0%,#efe6d8_100%)]">
      <div className="px-5 py-14 md:px-10 lg:px-16 lg:py-18">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2.4rem] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(247,239,228,0.82))] p-8 shadow-[0_24px_70px_rgba(48,35,18,0.08)] md:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-end">
              <div>
                <div className="text-[11px] uppercase tracking-[0.34em] text-[#8e7f68]">Stay close</div>
                <h3 className="mt-4 max-w-xl font-display text-[clamp(2.4rem,4vw,4rem)] font-semibold leading-[0.92] tracking-[-0.04em] text-[#1f1a15]">
                  Receba as proximas experiencias antes do restante do publico.
                </h3>
                <p className="mt-4 max-w-xl text-sm leading-7 text-[#5f5549] md:text-base">
                  Convites, aberturas prioritarias e eventos em destaque enviados com o mesmo cuidado da plataforma.
                </p>
              </div>

              <form onSubmit={handleSubscribe} className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                <label className="relative block">
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="seu@email.com"
                    className="w-full rounded-full border border-[#d9ccb8] bg-white px-5 py-4 pr-12 text-sm text-[#1f1a15] outline-none transition-all duration-300 placeholder:text-[#9f907d] focus:border-[#bda17a] focus:shadow-[0_14px_28px_rgba(48,35,18,0.08)]"
                    required
                  />
                  <Mail className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8e7f68]" />
                </label>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1f1a15] px-6 py-4 text-sm font-semibold text-[#f8f3ea] transition-all duration-300 hover:-translate-y-0.5"
                >
                  {subscribed ? 'Inscricao confirmada' : 'Receber convites'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>

          {categories.length > 0 ? (
            <div className="mt-10">
              <div className="text-[11px] uppercase tracking-[0.32em] text-[#8e7f68]">Explorar categorias</div>
              <div className="mt-4 flex flex-wrap gap-3">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => onCategoryClick?.(category)}
                    className="rounded-full border border-[#d9ccb8] bg-white/78 px-4 py-2 text-sm text-[#5f5549] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#bda17a] hover:text-[#1f1a15]"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-12 grid gap-10 border-t border-[rgba(120,98,68,0.08)] pt-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
            <div>
              <img src="/logo.png" alt="Animalz Events" className="h-16 w-auto object-contain" />
              <p className="mt-5 max-w-sm text-sm leading-7 text-[#5f5549]">
                Animalz Events conecta descoberta, compra e operacao em uma camada pensada para experiencias premium.
              </p>
              <div className="mt-5 space-y-2 text-sm text-[#5f5549]">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#8e7f68]" />
                  Sao Paulo, Brasil
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[#8e7f68]" />
                  atendimento@animalzevents.com
                </div>
              </div>
            </div>

            {[
              {
                title: 'Experiencias',
                links: [
                  { label: 'Eventos em destaque', href: '/events' },
                  { label: 'Minha conta', href: '/me' },
                  { label: 'Sobre a plataforma', href: '/about' },
                ],
              },
              {
                title: 'Produtores',
                links: [
                  { label: 'Criar evento', href: '/create-event' },
                  { label: 'Monetizacao', href: '/billing' },
                  { label: 'Growth cockpit', href: '/growth' },
                ],
              },
              {
                title: 'Institucional',
                links: [
                  { label: 'Ajuda', href: '/help' },
                  { label: 'Privacidade', href: '/privacy' },
                  { label: 'Termos', href: '/terms' },
                ],
              },
            ].map((section) => (
              <div key={section.title}>
                <div className="text-[11px] uppercase tracking-[0.32em] text-[#8e7f68]">{section.title}</div>
                <div className="mt-4 grid gap-3">
                  {section.links.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      className="text-sm text-[#5f5549] transition-colors duration-300 hover:text-[#1f1a15]"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-[rgba(120,98,68,0.08)] pt-6 text-xs text-[#7f7264] md:flex-row md:items-center md:justify-between">
            <p>&copy; {new Date().getFullYear()} Animalz Events. All rights reserved.</p>
            <p>Premium experiences platform for discovery, ticketing and real operations.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
