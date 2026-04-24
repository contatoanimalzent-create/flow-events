import { ArrowRight, Check } from 'lucide-react'
import { PublicLayout } from '@/features/public'
import { formatPublicCurrency, usePublicLocale } from '@/features/public/lib/public-locale'

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
  const { locale, isPortuguese } = usePublicLocale()
  return (
    <PublicLayout showFooter={false} compactHeader>
      <div className="flex min-h-[74svh] items-center justify-center px-5 py-12 md:px-10 lg:px-16">
        <div className="w-full max-w-3xl rounded-[2.3rem] border border-white/8 bg-[linear-gradient(180deg,#0d1117_0%,#121823_100%)] p-8 text-center shadow-[0_18px_55px_rgba(0,0,0,0.24)] md:p-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#1f3729] text-[#d8ffe2]">
            <Check className="h-9 w-9" />
          </div>
          <div className="mt-8 text-[11px] uppercase tracking-[0.3em] text-white/46">
            {isPortuguese ? 'Pedido confirmado' : 'Order confirmed'}
          </div>
          <h1 className="mt-4 font-display text-[clamp(3rem,5vw,5rem)] font-semibold uppercase leading-[0.9] tracking-[-0.04em] text-white">
            {isFreeOrder
              ? isPortuguese ? 'Sua inscrição foi confirmada.' : 'Your registration is confirmed.'
              : isPortuguese ? 'Sua compra foi concluida.' : 'Your purchase is complete.'}
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/66">
            {isFreeOrder
              ? isPortuguese
                ? 'O QR code e a confirmação chegam por e-mail em instantes. A experiência já está reservada para você.'
                : 'Your QR code and confirmation will arrive by email shortly. The experience is already reserved for you.'
              : isPortuguese
                ? 'Os ingressos digitais serão enviados assim que o pagamento for confirmado pelo gateway.'
                : 'Digital tickets will be sent as soon as the payment is confirmed by the gateway.'}
          </p>

          <div className="mt-8 rounded-[1.8rem] border border-white/8 bg-black/18 p-6 text-left">
            <div className="text-[11px] uppercase tracking-[0.28em] text-white/46">
              {isPortuguese ? 'Resumo' : 'Summary'}
            </div>
            <div className="mt-4 space-y-3">
              {cart.map((item) => (
                <div key={item.batchId} className="flex items-center justify-between gap-4 text-sm text-white/66">
                  <span>{item.qty}x {item.ticketName}</span>
                  <span>{item.price === 0 ? (isPortuguese ? 'Gratuito' : 'Free') : formatPublicCurrency(item.price * item.qty, locale)}</span>
                </div>
              ))}
            </div>
            {!isFreeOrder ? (
              <div className="mt-5 border-t border-white/8 pt-4 font-display text-[2.2rem] font-semibold leading-none tracking-[-0.04em] text-white">
                {formatPublicCurrency(total, locale)}
              </div>
            ) : null}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href={`/e/${slug}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-white"
            >
              {isPortuguese ? 'Voltar para' : 'Back to'} {eventName}
            </a>
            <a
              href="/events"
              className="inline-flex items-center gap-2 rounded-full bg-[#ff2d2d] px-5 py-3 text-sm font-medium uppercase tracking-[0.12em] text-white"
            >
              {isPortuguese ? 'Explorar outros eventos' : 'Explore other events'}
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
