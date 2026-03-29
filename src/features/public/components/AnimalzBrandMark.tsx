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
        inverse ? 'text-white' : 'text-[#0b1016]',
        className,
      )}
      aria-label="Animalz Events"
    >
      <img
        src="/logo.png"
        alt="Animalz Events"
        className={cn(
          'w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]',
          compact ? 'h-10 md:h-12' : 'h-12 md:h-14',
        )}
      />

      <div className="min-w-0">
        <div
          className={cn(
            'text-[10px] font-semibold uppercase tracking-[0.42em]',
            inverse ? 'text-white/62' : 'text-[#6d727a]',
          )}
        >
          Animalz Events
        </div>
        <div
          className={cn(
            'mt-1 font-display text-[1.1rem] font-semibold uppercase tracking-[0.14em] md:text-[1.28rem]',
            inverse ? 'text-white' : 'text-[#0b1016]',
          )}
        >
          Experiences
        </div>
      </div>
    </a>
  )
}
