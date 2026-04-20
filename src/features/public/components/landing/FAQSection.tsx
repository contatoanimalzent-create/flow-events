import { useState } from 'react'
import { ChevronDown, Mail, MessageCircleMore } from 'lucide-react'
import { motion } from 'framer-motion'
import { usePublicLocale } from '@/features/public/lib/public-locale'
import { useAnimationPreset } from '@/shared/motion'
import { cn } from '@/shared/lib'

export interface FAQItem {
  question: string
  answer: string
}

interface FAQSectionProps {
  items: FAQItem[]
  supportEmail: string
  supportWhatsapp: string
}

export function FAQSection({ items, supportEmail, supportWhatsapp }: FAQSectionProps) {
  const { isPortuguese } = usePublicLocale()
  const [openIndex, setOpenIndex] = useState(0)
  const sectionAnimation = useAnimationPreset('fadeIn', { durationMs: 420, amount: 0.05 })
  const blockAnimation = useAnimationPreset('slideUp', { durationMs: 460, distance: 18, amount: 0.1 })

  return (
    <motion.section
      id="faq"
      className="bg-[var(--pulse-color-background)] py-20 md:py-28"
      initial={sectionAnimation.initial}
      whileInView={sectionAnimation.whileInView}
      viewport={sectionAnimation.viewport}
      variants={sectionAnimation.variants}
    >
      <div className="mx-auto grid max-w-[1280px] gap-8 px-6 md:px-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(26rem,0.88fr)] lg:px-10">
        <motion.div
          initial={blockAnimation.initial}
          whileInView={blockAnimation.whileInView}
          viewport={blockAnimation.viewport}
          variants={blockAnimation.variants}
        >
          <div className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--pulse-color-primary)]">
            {isPortuguese ? 'FAQ e contato' : 'FAQ and contact'}
          </div>
          <h2 className="mt-4 text-[clamp(2rem,4vw,3.2rem)] font-semibold leading-[1.04] tracking-[-0.05em] text-[var(--pulse-color-primary)]">
            {isPortuguese ? 'Respostas claras antes do clique final.' : 'Clear answers before the final click.'}
          </h2>

          <div className="mt-8 grid gap-4">
            <a
              href={`mailto:${supportEmail}`}
              className="flex items-center gap-3 rounded-[var(--pulse-radius-lg)] border border-[var(--pulse-color-border)] bg-[var(--pulse-color-surface)] p-5 text-[var(--pulse-color-text-primary)] shadow-[var(--pulse-shadow-soft)]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-[var(--pulse-radius-md)] bg-[color-mix(in_srgb,var(--pulse-color-primary)_12%,transparent)] text-[var(--pulse-color-primary)]">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">{isPortuguese ? 'Suporte por e-mail' : 'Email support'}</div>
                <div className="text-sm text-[var(--pulse-color-text-secondary)]">{supportEmail}</div>
              </div>
            </a>

            <a
              href={`https://wa.me/${supportWhatsapp.replace(/\D/g, '')}`}
              className="flex items-center gap-3 rounded-[var(--pulse-radius-lg)] border border-[var(--pulse-color-border)] bg-[var(--pulse-color-surface)] p-5 text-[var(--pulse-color-text-primary)] shadow-[var(--pulse-shadow-soft)]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-[var(--pulse-radius-md)] bg-[color-mix(in_srgb,var(--pulse-color-primary)_12%,transparent)] text-[var(--pulse-color-primary)]">
                <MessageCircleMore className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold">{isPortuguese ? 'WhatsApp' : 'WhatsApp'}</div>
                <div className="text-sm text-[var(--pulse-color-text-secondary)]">{supportWhatsapp}</div>
              </div>
            </a>
          </div>
        </motion.div>

        <motion.div
          className="space-y-3"
          initial={blockAnimation.initial}
          whileInView={blockAnimation.whileInView}
          viewport={blockAnimation.viewport}
          variants={blockAnimation.variants}
        >
          {items.map((item, index) => {
            const isOpen = index === openIndex

            return (
              <div
                key={item.question}
                className="overflow-hidden rounded-[var(--pulse-radius-lg)] border border-[rgba(255,255,255,0.10)] bg-[var(--pulse-surface-elevated)] shadow-[var(--pulse-shadow-soft)]"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-base font-semibold text-[var(--pulse-color-text-primary)]">{item.question}</span>
                  <ChevronDown
                    className={cn(
                      'h-5 w-5 shrink-0 text-[var(--pulse-color-primary)] transition-transform duration-200',
                      isOpen && 'rotate-180',
                    )}
                  />
                </button>

                {isOpen ? (
                  <div className="border-t border-[var(--pulse-color-border)] px-5 py-4 text-sm leading-7 text-[var(--pulse-color-text-secondary)]">
                    {item.answer}
                  </div>
                ) : null}
              </div>
            )
          })}
        </motion.div>
      </div>
    </motion.section>
  )
}
