import { cn } from '@/shared/lib'

interface AnimalzBrandMarkProps {
  inverse?: boolean
  compact?: boolean
  className?: string
}

/**
 * PulseBrandMark — Logo principal da Pulse.
 * inverse=false → logo preta (para fundos claros)
 * inverse=true  → logo invertida via CSS filter (para fundos escuros)
 */
export function AnimalzBrandMark({ inverse = false, compact = false, className }: AnimalzBrandMarkProps) {
  return (
    <a
      href="/"
      className={cn('group inline-flex items-center no-underline', className)}
      aria-label="Pulse"
    >
      <img
        src="/logo.png"
        alt="Pulse"
        className={cn(
          'w-auto object-contain transition-all duration-300 group-hover:scale-[1.02]',
          compact ? 'h-8 md:h-10' : 'h-10 md:h-12',
          inverse && 'brightness-0 invert',
        )}
      />
    </a>
  )
}

// Alias para facilitar futuras migrações
export { AnimalzBrandMark as PulseBrandMark }
