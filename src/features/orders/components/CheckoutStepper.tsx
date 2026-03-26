import { Check } from 'lucide-react'
import { cn } from '@/shared/lib'

interface CheckoutStepperProps {
  currentStep: 1 | 2 | 3 | 4
}

const STEPS = [
  { key: 1, label: 'Selecao', description: 'Ingressos' },
  { key: 2, label: 'Comprador', description: 'Dados' },
  { key: 3, label: 'Pagamento', description: 'Metodo e reserva' },
  { key: 4, label: 'Confirmacao', description: 'Aprovacao' },
] as const

export function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
  return (
    <div className="rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(250,244,236,0.78))] p-5 shadow-[0_18px_55px_rgba(48,35,18,0.06)]">
      <div className="grid gap-4 md:grid-cols-4">
        {STEPS.map((step) => {
          const isActive = currentStep === step.key
          const isComplete = currentStep > step.key

          return (
            <div key={step.key} className="flex items-center gap-3">
              <div
                className={cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-all duration-300',
                  isActive && 'border-[#1f1a15] bg-[#1f1a15] text-[#f8f3ea]',
                  isComplete && 'border-[#d7c8ae] bg-[#f5ebda] text-[#6d5324]',
                  !isActive && !isComplete && 'border-[#ddd1bf] bg-white text-[#8e7f68]',
                )}
              >
                {isComplete ? <Check className="h-4 w-4" /> : step.key}
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.24em] text-[#8e7f68]">{step.label}</div>
                <div className="mt-1 text-sm font-medium text-[#1f1a15]">{step.description}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
