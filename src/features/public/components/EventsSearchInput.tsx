import { Loader2, Search } from 'lucide-react'
import { cn } from '@/shared/lib'
import { usePublicLocale } from '../lib/public-locale'

interface EventsSearchInputProps {
  value: string
  onChange: (value: string) => void
  isPending?: boolean
  tone?: 'light' | 'dark'
}

export function EventsSearchInput({ value, onChange, isPending = false, tone = 'light' }: EventsSearchInputProps) {
  const { isPortuguese } = usePublicLocale()
  const isDark = tone === 'dark'

  return (
    <label className="block min-w-[18rem] flex-1">
      <div className={cn(
        'mb-3 text-[11px] uppercase tracking-[0.28em]',
        isDark ? 'text-white/50' : 'text-[#8e7f68]'
      )}>
        {isPortuguese ? 'Buscar experiencias' : 'Search experiences'}
      </div>
      <div className="relative">
        <Search className={cn(
          'pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2',
          isDark ? 'text-white/40' : 'text-[#8e7f68]'
        )} />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={
            isDark
              ? isPortuguese ? 'Buscar eventos...' : 'Search events...'
              : isPortuguese
                ? 'Nome, cidade, venue ou atmosfera'
                : 'Name, city, venue or atmosphere'
          }
          className={cn(
            'w-full rounded-full px-12 py-3.5 text-sm outline-none transition-all duration-300',
            isDark
              ? 'border border-white/12 bg-white/6 text-[#f0ebe2] placeholder:text-white/30 focus:border-white/20 focus:bg-white/10 focus:shadow-[0_12px_24px_rgba(0,0,0,0.3)]'
              : 'border border-[#ddd1bf] bg-white/78 text-[#1f1a15] placeholder:text-[#a2927e] focus:border-[#b79e74] focus:bg-white focus:shadow-[0_12px_24px_rgba(48,35,18,0.08)]'
          )}
        />
        {isPending ? (
          <Loader2 className={cn(
            'absolute right-5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin',
            isDark ? 'text-white/50' : 'text-[#8e7f68]'
          )} />
        ) : null}
      </div>
    </label>
  )
}
