import { ArrowRight, Check } from 'lucide-react'
import { PublicLayout } from '@/features/public'
import { formatCurrency } from '@/shared/lib'

interface CheckoutSuccessPageProps {
  slug: string
  eventName: string
  cart: Array<{
    batchId: string
    ticketName: string
    qty: number
    price: number
  }>
  total: number
  isFreeOrder: boolean
}

export function CheckoutSuccessPage({
  slug,
  eventName,
  cart,
  total,
  isFreeOrder,
}: CheckoutSuccessPageProps) {
  return (
    <PublicLayout showFooter={false} compactHeader>
      <div className="flex min-h-[74svh] items-center justify-center px-5 py-12 md:px-10 lg:px-16">
        <div className="w-full max-w-3xl rounded-[2.3rem] border border-white/70 bg-white/80 p-8 text-center shadow-[0_18px_55px_rgba(48,35,18,0.06)] md:p-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#eef5ef] text-[#335741]">
            <Check className="h-9 w-9" />
          </div>
          <div className="mt-8 text-[11px] uppercase tracking-[0.3em] text-[#8e7f68]">Pedido confirmado</div>
          <h1 className="mt-4 font-display text-[clamp(3rem,5vw,5rem)] font-semibold leading-[0.9] tracking-[-0.04em] text-[#1f1a15]">
            {isFreeOrder ? 'Sua inscricao foi confirmada.' : 'Sua compra foi concluida.'}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[#5f5549]">
            {isFreeOrder
              ? 'O QR code e a confirmacao chegam por e-mail em instantes. A experiencia ja esta reservada para voce.'
              : 'Os ingressos digitais serao enviados assim que o pagamento for confirmado pelo gateway.'}
          </p>

          <div className="mt-8 rounded-[1.8rem] border border-[#eee2cf] bg-[#fbf7f1] p-6 text-left">
            <div className="text-[11px] uppercase tracking-[0.28em] text-[#8e7f68]">Resumo</div>
            <div className="mt-4 space-y-3">
              {cart.map((item) => (
                <div key={item.batchId} className="flex items-center justify-between gap-4 text-sm text-[#5f5549]">
                  <span>{item.qty}x {item.ticketName}</span>
                  <span>{item.price === 0 ? 'Gratuito' : formatCurrency(item.price * item.qty)}</span>
                </div>
              ))}
            </div>
            {!isFreeOrder ? (
              <div className="mt-5 border-t border-[#eee2cf] pt-4 font-display text-[2.2rem] font-semibold leading-none tracking-[-0.04em] text-[#1f1a15]">
                {formatCurrency(total)}
              </div>
            ) : null}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href={`/e/${slug}`}
              className="inline-flex items-center gap-2 rounded-full border border-[#ddd1bf] px-5 py-3 text-sm font-medium text-[#1f1a15]"
            >
              Voltar para {eventName}
            </a>
            <a
              href="/events"
              className="inline-flex items-center gap-2 rounded-full bg-[#1f1a15] px-5 py-3 text-sm font-medium text-[#f8f3ea]"
            >
              Explorar outros eventos
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
