import type { LucideIcon } from 'lucide-react'

interface EventInfoBlockProps {
  icon: LucideIcon
  label: string
  value: string
}

export function EventInfoBlock({ icon: Icon, label, value }: EventInfoBlockProps) {
  return (
    <div className="rounded-[26px] border border-white/65 bg-white/75 p-5 shadow-[0_16px_60px_rgba(48,35,18,0.06)]">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f2e6d5] text-[#7b6440]">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-[0.26em] text-[#8e7f68]">{label}</div>
          <div className="mt-1 text-sm font-medium leading-6 text-[#1f1a15]">{value}</div>
        </div>
      </div>
    </div>
  )
}
