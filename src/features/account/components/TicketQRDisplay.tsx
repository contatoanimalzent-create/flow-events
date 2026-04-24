import { QrCode, ShieldCheck } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { PremiumBadge } from '@/features/public'
import { cn } from '@/shared/lib'

interface TicketQRDisplayProps {
  value: string
  status: 'active' | 'used' | 'cancelled'
  className?: string
}

const STATUS_TONE = {
  active: 'success',
  used: 'accent',
  cancelled: 'default',
} as const

const STATUS_LABEL = {
  active: 'Ativo',
  used: 'Utilizado',
  cancelled: 'Cancelado',
} as const

export function TicketQRDisplay({ value, status, className }: TicketQRDisplayProps) {
  return (
    <div
      className={cn(
        'rounded-[1.8rem] border border-[#eadcc6] bg-[linear-gradient(180deg,#fffdfa,#f6efe4)] p-5 shadow-[0_18px_45px_rgba(48,35,18,0.07)]',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="text-[11px] uppercase tracking-[0.28em] text-[#8e7f68]">Seu acesso</div>
        <PremiumBadge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</PremiumBadge>
      </div>

      <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-[#eadcc6] bg-white p-4">
        <div className="mx-auto flex w-full max-w-[18rem] items-center justify-center rounded-[1.2rem] border border-[#f0e7db] bg-white p-4">
          <QRCodeSVG
            value={value}
            size={220}
            bgColor="#FFFFFF"
            fgColor="#171310"
            level="M"
            includeMargin
          />
        </div>
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-[1.25rem] border border-[#eee2cf] bg-white/80 px-4 py-3 text-sm text-[#5f5549]">
        <ShieldCheck className="mt-0.5 h-4 w-4 text-[#7b6440]" />
        <div>
          <div className="font-medium text-[#1f1a15]">Apresente este QR na entrada</div>
          <div className="mt-1 text-xs leading-6 text-[#7c6f60]">
            O código e único para este ingresso e fica disponível offline após o carregamento.
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-full border border-[#eadcc6] bg-[#faf4e8] px-4 py-2 text-xs text-[#7b6440]">
        <QrCode className="h-3.5 w-3.5" />
        {value}
      </div>
    </div>
  )
}
