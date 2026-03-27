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
    <div className="rounded-[2.1rem] border border-white/8 bg-[linear-gradient(180deg,#0d1117_0%,#121823_100%)] p-5 shadow-[0_18px_55px_rgba(0,0,0,0.24)]">
      <div className="grid gap-4 md:grid-cols-4">
        {STEPS.map((step) => {
          const isActive = currentStep === step.key
          const isComplete = currentStep > step.key

          return (
            <div
              key={step.key}
              className={cn(
                'rounded-[1.5rem] border p-4 transition-all duration-300',
                isActive && 'border-[#ff2d2d]/26 bg-[#ff2d2d]/12 text-white',
                isComplete && 'border-white/8 bg-white/[0.06] text-white',
                !isActive && !isComplete && 'border-white/8 bg-white/[0.03] text-white/60',
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-all duration-300',
                    isActive && 'border-[#ff2d2d]/26 bg-[#ff2d2d]/18 text-white',
                    isComplete && 'border-white/12 bg-white/[0.08] text-white',
                    !isActive && !isComplete && 'border-white/10 bg-white/[0.04] text-white/56',
                  )}
                >
                  {isComplete ? <Check className="h-4 w-4" /> : step.key}
                </div>
                <div>
                  <div className={cn('text-[10px] uppercase tracking-[0.24em]', isActive ? 'text-white/56' : 'text-white/40')}>
                    {step.label}
                  </div>
                  <div className={cn('mt-1 text-sm font-medium', isActive || isComplete ? 'text-white' : 'text-white/72')}>
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
