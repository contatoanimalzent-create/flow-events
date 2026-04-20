import { CheckCircle2, Ticket } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatPublicCurrency, usePublicLocale } from '@/features/public/lib/public-locale'
import { useAnimationPreset } from '@/shared/motion'
import { cn } from '@/shared/lib'

export interface TicketOptionCard {
  id: string
  name: string
  description: string
  price: number
  isFree: boolean
  badge: string
  availability?: string
}

interface TicketsSectionProps {
  tickets: TicketOptionCard[]
  selectedTicketId?: string
  onSelect: (ticketId: string) => void
}

export function TicketsSection({ tickets, selectedTicketId, onSelect }: TicketsSectionProps) {
  const { locale, isPortuguese } = usePublicLocale()
  const sectionAnimation = useAnimationPreset('fadeIn', { durationMs: 420, amount: 0.05 })
  const cardAnimation = useAnimationPreset('scaleIn', { durationMs: 420, amount: 0.1 })

  return (
    <motion.section
      id="ingressos"
      className="bg-[var(--pulse-color-background)] py-20 md:py-28"
      initial={sectionAnimation.initial}
      whileInView={sectionAnimation.whileInView}
      viewport={sectionAnimation.viewport}
      variants={sectionAnimation.variants}
    >
      <div className="mx-auto max-w-[1280px] px-6 md:px-8 lg:px-10">
        <div className="max-w-3xl">
          <div className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--pulse-color-primary)]">
            {isPortuguese ? 'Opcoes de ingresso' : 'Ticket options'}
          </div>
          <h2 className="mt-4 text-[clamp(2rem,4vw,3.2rem)] font-semibold leading-[1.04] tracking-[-0.05em] text-[var(--pulse-color-primary)]">
            {isPortuguese ? 'Escolha o acesso ideal e avance sem friccao.' : 'Choose the right access and move forward without friction.'}
          </h2>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {tickets.map((ticketItem, index) => {
            const isSelected = ticketItem.id === selectedTicketId

            return (
              <motion.article
                key={ticketItem.id}
                className={cn(
                  'flex h-full flex-col rounded-[calc(var(--pulse-radius-lg)+0.25rem)] border bg-[var(--pulse-surface-elevated)] p-6 transition-all duration-200',
                  isSelected
                    ? 'border-[var(--pulse-color-primary)] shadow-[0_0_20px_rgba(0,87,231,0.15)]'
                    : 'border-[rgba(255,255,255,0.10)] shadow-[var(--pulse-shadow-soft)] hover:-translate-y-0.5 hover:border-[rgba(255,255,255,0.18)] hover:shadow-[var(--pulse-shadow-medium)]',
                )}
                initial={cardAnimation.initial}
                whileInView={cardAnimation.whileInView}
                viewport={cardAnimation.viewport}
                variants={cardAnimation.variants}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[var(--pulse-radius-md)] bg-[color-mix(in_srgb,var(--pulse-color-primary)_12%,transparent)] text-[var(--pulse-color-primary)]">
                    <Ticket className="h-5 w-5" />
                  </div>
                  <span
                    className={cn(
                      'inline-flex rounded-full border px-3 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.16em]',
                      ticketItem.isFree
                        ? 'border-[var(--pulse-status-success-border)] bg-[var(--pulse-status-success-surface)] text-[var(--pulse-status-success)]'
                        : 'border-[var(--pulse-color-border)] bg-[var(--pulse-color-surface)] text-[var(--pulse-color-primary)]',
                    )}
                  >
                    {ticketItem.badge}
                  </span>
                </div>

                <h3 className="mt-6 text-xl font-semibold text-[var(--pulse-color-text-primary)]">{ticketItem.name}</h3>
                <p className="mt-3 min-h-[4.5rem] text-sm leading-7 text-[var(--pulse-color-text-secondary)]">{ticketItem.description}</p>

                <div className="mt-6 flex items-end justify-between gap-4 border-t border-[var(--pulse-color-border)] pt-5">
                  <div>
                    <div className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-[var(--pulse-color-text-secondary)]">
                      {isPortuguese ? 'Preco' : 'Price'}
                    </div>
                    <div className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[var(--pulse-color-text-primary)]">
                      {ticketItem.isFree ? (isPortuguese ? 'Gratuito' : 'Free') : formatPublicCurrency(ticketItem.price, locale)}
                    </div>
                    {ticketItem.availability ? (
                      <div className="mt-2 inline-flex items-center gap-2 text-sm text-[var(--pulse-color-text-secondary)]">
                        <CheckCircle2 className="h-4 w-4 text-[var(--pulse-color-primary)]" />
                        {ticketItem.availability}
                      </div>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelect(ticketItem.id)}
                    className={cn(
                      'inline-flex min-h-[3rem] items-center justify-center rounded-full px-5 text-sm font-semibold transition-all duration-200',
                      isSelected
                        ? 'bg-[var(--pulse-color-primary)] text-[var(--pulse-color-text-inverse)] shadow-[var(--pulse-shadow-medium)]'
                        : 'border border-[var(--pulse-color-border)] bg-[var(--pulse-color-surface)] text-[var(--pulse-color-text-primary)] hover:border-[var(--pulse-color-primary)] hover:text-[var(--pulse-color-primary)]',
                    )}
                  >
                    {isSelected ? (isPortuguese ? 'Selecionado' : 'Selected') : isPortuguese ? 'Selecionar' : 'Select'}
                  </button>
                </div>
              </motion.article>
            )
          })}
        </div>
      </div>
    </motion.section>
  )
}
