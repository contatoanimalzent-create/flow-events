import { Check } from 'lucide-react'
import { cn } from '@/shared/lib'

interface CheckoutStepperProps {
  currentStep: 1 | 2 | 3 | 4
}

const STEPS = [
  { key: 1, label: 'Selecao', description: 'Ingressos' },
  { key: 2, label: 'Comprador', description: 'Dados essenciais' },
  { key: 3, label: 'Pagamento', description: 'Reserva e conclusao' },
  { key: 4, label: 'Confirmacao', description: 'Acesso emitido' },
] as const

export function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
  return (
    <div className="rounded-[2.1rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(248,242,234,0.8))] p-5 shadow-[0_18px_55px_rgba(48,35,18,0.06)]">
      <div className="grid gap-4 md:grid-cols-4">
        {STEPS.map((step) => {
          const isActive = currentStep === step.key
          const isComplete = currentStep > step.key

          return (
            <div
              key={step.key}
              className={cn(
                'rounded-[1.5rem] border p-4 transition-all duration-300',
                isActive && 'border-[#1f1a15] bg-[#1f1a15] text-[#f8f3ea]',
                isComplete && 'border-[#eadcc8] bg-white/84 text-[#1f1a15]',
                !isActive && !isComplete && 'border-[#eadcc8] bg-white/72 text-[#5f5549]',
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-all duration-300',
                    isActive && 'border-white/18 bg-white/12 text-[#f8f3ea]',
                    isComplete && 'border-[#eadcc8] bg-[#f5ecdd] text-[#6d5324]',
                    !isActive && !isComplete && 'border-[#ddd1bf] bg-white text-[#8e7f68]',
                  )}
                >
                  {isComplete ? <Check className="h-4 w-4" /> : step.key}
                </div>
                <div>
                  <div className={cn('text-[10px] uppercase tracking-[0.24em]', isActive ? 'text-[#f8f3ea]/64' : 'text-[#8e7f68]')}>
                    {step.label}
                  </div>
                  <div className={cn('mt-1 text-sm font-medium', isActive ? 'text-[#f8f3ea]' : 'text-[#1f1a15]')}>
                    {step.description}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
