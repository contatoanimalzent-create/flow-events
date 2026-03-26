import { useState } from 'react'
import { ArrowLeft, Mail, Phone, Send } from 'lucide-react'
import { PublicLayout } from '@/features/public'
import { PublicReveal } from '@/features/public/components/PublicReveal'
import { useSeoMeta } from '@/shared/lib'

export function ContactPage({ onLogin }: { onLogin?: () => void }) {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  useSeoMeta({
    title: 'Contato | Animalz Events',
    description: 'Entre em contato com a equipe Animalz Events. Tire duvidas, fale sobre parcerias ou solicite suporte.',
    url: typeof window !== 'undefined' ? window.location.href : '/contact',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Contact form submitted:', formData)
    setSubmitted(true)
    setTimeout(() => {
      setFormData({ name: '', email: '', message: '' })
      setSubmitted(false)
    }, 3000)
  }

  return (
    <PublicLayout onLogin={onLogin}>
      <section className="px-5 pb-20 pt-12 md:px-10 lg:px-16 lg:pt-18">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-start">
            <PublicReveal>
              <div>
                <a
                  href="/"
                  className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-[#8b7c69] transition-colors hover:text-[#1f1a15]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Voltar
                </a>
                <h1 className="mt-8 font-display text-[clamp(3.2rem,6vw,5.8rem)] font-semibold leading-[0.88] tracking-[-0.05em] text-[#1f1a15]">
                  Fale com a gente.
                </h1>
                <p className="mt-6 max-w-lg text-base leading-8 text-[#5f5549] md:text-lg">
                  Tem duvidas, quer saber mais sobre a plataforma ou precisa de ajuda? Envie uma mensagem e responderemos em breve.
                </p>

                <div className="mt-10 grid gap-4">
                  {[
                    {
                      icon: Mail,
                      label: 'Suporte',
                      value: 'support@animalz.events',
                    },
                    {
                      icon: Mail,
                      label: 'Parcerias',
                      value: 'business@animalz.events',
                    },
                    {
                      icon: Phone,
                      label: 'Telefone',
                      value: '+55 (11) 9999-9999',
                    },
                  ].map((item) => {
                    const Icon = item.icon
                    return (
                      <div
                        key={item.label}
                        className="flex items-center gap-4 rounded-[1.6rem] border border-[#e8dccb] bg-white/85 p-5"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f3e8d6] text-[#816941]">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-[0.24em] text-[#8b7c69]">{item.label}</div>
                          <div className="mt-0.5 text-sm font-medium text-[#1f1a15]">{item.value}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </PublicReveal>

            <PublicReveal delayMs={100}>
              <div className="rounded-[2.4rem] border border-[#e5d8c7] bg-white/88 p-7 shadow-[0_22px_65px_rgba(66,48,24,0.08)] md:p-9">
                {submitted ? (
                  <div className="flex min-h-[20rem] flex-col items-center justify-center gap-4 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f3e8d6] text-[#4e6d4f]">
                      <Send className="h-6 w-6" />
                    </div>
                    <h3 className="font-display text-[2rem] font-semibold leading-[0.94] tracking-[-0.03em] text-[#1f1a15]">
                      Mensagem enviada!
                    </h3>
                    <p className="max-w-sm text-sm leading-7 text-[#5f5549]">
                      Recebemos sua mensagem e entraremos em contato em breve.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="grid gap-5">
                    <div className="text-[11px] uppercase tracking-[0.28em] text-[#8b7c69]">Enviar mensagem</div>

                    <div>
                      <label className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-[#8b7c69]">Nome</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        placeholder="Seu nome"
                        className="w-full rounded-[1.2rem] border border-[#e5d8c7] bg-[#fbf7f1] px-4 py-3 text-sm text-[#1f1a15] outline-none placeholder:text-[#b0a090] focus:border-[#c9b08a] focus:ring-0"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-[#8b7c69]">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        placeholder="seu@email.com"
                        className="w-full rounded-[1.2rem] border border-[#e5d8c7] bg-[#fbf7f1] px-4 py-3 text-sm text-[#1f1a15] outline-none placeholder:text-[#b0a090] focus:border-[#c9b08a] focus:ring-0"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-[#8b7c69]">Mensagem</label>
                      <textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                        rows={5}
                        placeholder="Como podemos ajudar?"
                        className="w-full resize-none rounded-[1.2rem] border border-[#e5d8c7] bg-[#fbf7f1] px-4 py-3 text-sm text-[#1f1a15] outline-none placeholder:text-[#b0a090] focus:border-[#c9b08a] focus:ring-0"
                      />
                    </div>

                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1f1a15] px-6 py-3 text-sm font-medium text-[#f8f3ea] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(31,26,21,0.22)]"
                    >
                      Enviar mensagem
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                )}
              </div>
            </PublicReveal>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
