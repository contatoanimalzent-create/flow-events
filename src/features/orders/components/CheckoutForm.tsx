import type { CheckoutBuyerForm } from '@/features/orders/types'
import { PublicReveal } from '@/features/public/components/PublicReveal'

interface CheckoutFormProps {
  buyer: CheckoutBuyerForm
  setBuyerField: <TKey extends keyof CheckoutBuyerForm>(field: TKey, value: CheckoutBuyerForm[TKey]) => void
}

const FIELDS: Array<{
  key: keyof CheckoutBuyerForm
  label: string
  type: string
  placeholder: string
  helper?: string
}> = [
  { key: 'name', label: 'Nome completo *', type: 'text', placeholder: 'Seu nome como deseja receber a confirmacao' },
  { key: 'email', label: 'E-mail *', type: 'email', placeholder: 'seu@email.com', helper: 'Enviaremos confirmacao e ticket digital para este endereco.' },
  { key: 'phone', label: 'WhatsApp', type: 'tel', placeholder: '(00) 00000-0000', helper: 'Usado apenas para atualizacoes importantes da compra.' },
  { key: 'cpf', label: 'Documento', type: 'text', placeholder: 'CPF ou documento exigido pelo evento', helper: 'Preencha se esta experiencia exigir identificacao nominal.' },
]

export function CheckoutForm({ buyer, setBuyerField }: CheckoutFormProps) {
  return (
    <PublicReveal>
      <div className="rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(250,244,236,0.78))] p-6 shadow-[0_18px_55px_rgba(48,35,18,0.06)] md:p-7">
        <div className="text-[11px] uppercase tracking-[0.3em] text-[#8e7f68]">Dados do comprador</div>
        <div className="mt-4 font-display text-[2.4rem] font-semibold leading-[0.92] tracking-[-0.04em] text-[#1f1a15]">
          Quem recebe esta experiencia?
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5f5549]">
          Um formulario curto, claro e sem friccao. Apenas o necessario para reservar, pagar e emitir os ingressos com seguranca.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {FIELDS.map((field) => (
            <div key={field.key} className={field.key === 'email' ? 'md:col-span-2' : ''}>
              <label className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-[#8e7f68]">{field.label}</label>
              <input
                type={field.type}
                placeholder={field.placeholder}
                value={buyer[field.key]}
                onChange={(event) => setBuyerField(field.key, event.target.value)}
                className="w-full rounded-[1.2rem] border border-[#ddd1bf] bg-white px-4 py-3.5 text-sm text-[#1f1a15] outline-none transition-all duration-300 placeholder:text-[#a2927e] focus:border-[#b79e74] focus:shadow-[0_12px_24px_rgba(48,35,18,0.08)]"
              />
              {field.helper ? <div className="mt-2 text-xs leading-6 text-[#8e7f68]">{field.helper}</div> : null}
            </div>
          ))}
        </div>
      </div>
    </PublicReveal>
  )
}
