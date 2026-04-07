import { cn } from '@/shared/lib'

interface AnimalzBrandMarkProps {
  inverse?: boolean
  compact?: boolean
  className?: string
}

export function AnimalzBrandMark({ inverse = false, compact = false, className }: AnimalzBrandMarkProps) {
  return (
    <a
      href="/"
      className={cn(
        'group inline-flex items-center gap-3 no-underline',
        inverse ? 'text-white' : 'text-[#0A0A0A]',
        className,
      )}
      aria-label="Pulse"
    >
      <img
        src="/logo.png"
        alt="Pulse"
        className={cn(
          'w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]',
          compact ? 'h-10 md:h-12' : 'h-12 md:h-14',
        )}
      />

      <div className="min-w-0">
        <div
          className={cn(
            'text-[10px] font-semibold uppercase tracking-[0.42em]',
            inverse ? 'text-white/62' : 'text-[#0057E7]',
          )}
        >
          Pulse
        </div>
        <div
          className={cn(
            'mt-1 text-base font-bold uppercase tracking-[0.04em] md:text-lg',
            inverse ? 'text-white' : 'text-[#0A0A0A]',
          )}
        >
          Events
        </div>
      </div>
    </a>
  )
}
