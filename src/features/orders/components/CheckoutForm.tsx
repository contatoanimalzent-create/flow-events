import { PublicReveal } from '@/features/public/components/PublicReveal'
import type { CheckoutBuyerForm } from '@/features/orders/types'
import { usePublicLocale } from '@/features/public/lib/public-locale'

interface CheckoutFormProps {
  buyer: CheckoutBuyerForm
  setBuyerField: <TKey extends keyof CheckoutBuyerForm>(field: TKey, value: CheckoutBuyerForm[TKey]) => void
}

export function CheckoutForm({ buyer, setBuyerField }: CheckoutFormProps) {
  const { isPortuguese } = usePublicLocale()
  const fields = [
    {
      key: 'name',
      label: isPortuguese ? 'Nome completo *' : 'Full name *',
      type: 'text',
      placeholder: isPortuguese ? 'Seu nome como deseja receber a confirmação' : 'Your name as it should appear on the confirmation',
    },
    {
      key: 'email',
      label: 'E-mail *',
      type: 'email',
      placeholder: isPortuguese ? 'seu@email.com' : 'you@email.com',
      helper: isPortuguese ? 'Enviaremos confirmação e ticket digital para este endereço.' : 'We will send confirmation and digital ticket details to this address.',
    },
    {
      key: 'phone',
      label: isPortuguese ? 'WhatsApp' : 'Phone',
      type: 'tel',
      placeholder: isPortuguese ? '(00) 00000-0000' : '+1 (000) 000-0000',
      helper: isPortuguese ? 'Usado apenas para atualizações relevantes da compra.' : 'Used only for relevant purchase updates.',
    },
    {
      key: 'cpf',
      label: isPortuguese ? 'Documento' : 'Document',
      type: 'text',
      placeholder: isPortuguese ? 'CPF ou documento exigido pelo evento' : 'ID or document required by the event',
      helper: isPortuguese ? 'Preencha se a experiência exigir identificacao nominal.' : 'Fill this in if the experience requires named identification.',
    },
  ] as Array<{
    key: keyof CheckoutBuyerForm
    label: string
    type: string
    placeholder: string
    helper?: string
  }>

  return (
    <PublicReveal>
      <div className="rounded-[2rem] border border-white/8 bg-[linear-gradient(180deg,#0d1117_0%,#121823_100%)] p-6 shadow-[0_18px_55px_rgba(0,0,0,0.24)] md:p-7">
        <div className="text-[11px] uppercase tracking-[0.3em] text-white/46">
          {isPortuguese ? 'Dados do comprador' : 'Buyer details'}
        </div>
        <div className="mt-4 font-display text-[2.4rem] font-semibold uppercase leading-[0.92] tracking-[-0.04em] text-white">
          {isPortuguese ? 'Quem recebe esta experiência?' : 'Who receives this experience?'}
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/66">
          {isPortuguese
            ? 'Um formulário curto, claro e sem friccao. Apenas o necessário para reservar, pagar e emitir os ingressos com segurança.'
            : 'A short, clear and low-friction form. Only what is needed to reserve, pay and issue tickets with confidence.'}
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {fields.map((field) => (
            <div key={field.key} className={field.key === 'email' ? 'md:col-span-2' : ''}>
              <label className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-white/46">{field.label}</label>
              <input
                type={field.type}
                placeholder={field.placeholder}
                value={buyer[field.key]}
                onChange={(event) => setBuyerField(field.key, event.target.value)}
                className="w-full rounded-[1.3rem] border border-white/10 bg-white/[0.05] px-4 py-3.5 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/28 focus:border-[#ff2d2d]/34 focus:bg-white/[0.08] focus:shadow-[0_12px_24px_rgba(0,0,0,0.2)]"
              />
              {field.helper ? <div className="mt-2 text-xs leading-6 text-white/46">{field.helper}</div> : null}
            </div>
          ))}
        </div>
      </div>
    </PublicReveal>
  )
}
