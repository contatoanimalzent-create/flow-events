import { RotateCcw } from 'lucide-react'
import { cn } from '@/shared/lib'
import { PremiumBadge } from './PremiumBadge'
import { EventsSearchInput } from './EventsSearchInput'
import { PublicReveal } from './PublicReveal'
import { usePublicLocale } from '../lib/public-locale'

interface EventsFilterBarProps {
  search: string
  onSearchChange: (value: string) => void
  city: string
  onCityChange: (value: string) => void
  dateRange: string
  onDateRangeChange: (value: string) => void
  category: string
  onCategoryChange: (value: string) => void
  cityOptions: string[]
  categoryOptions: string[]
  resultCount: number
  isPending?: boolean
  tone?: 'light' | 'dark'
}

const DATE_OPTIONS = [
  { label: 'Qualquer data', value: 'all' },
  { label: 'Proximos 30 dias', value: '30d' },
  { label: 'Proximos 90 dias', value: '90d' },
  { label: 'Mais adiante', value: 'later' },
] as const

interface FilterSelectProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: Array<{ label: string; value: string }>
  tone?: 'light' | 'dark'
}

function FilterSelect({ label, value, onChange, options, tone = 'light' }: FilterSelectProps) {
  const isDark = tone === 'dark'

  return (
    <label className="block min-w-[11rem]">
      <div
        className={cn(
          'mb-3 text-[10px] font-semibold uppercase tracking-[0.28em]',
          isDark ? 'text-white/50' : 'text-text-muted',
        )}
      >
        {label}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'w-full rounded-full px-4 py-3.5 text-sm outline-none transition-all duration-300',
          isDark
            ? 'border border-white/12 bg-white/6 text-white focus:border-white/20 focus:bg-white/10'
            : 'border border-bg-border bg-white text-text-primary shadow-sm focus:border-brand-navy/30 focus:shadow-[0_0_0_3px_rgba(13,27,53,0.06)]',
        )}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function EventsFilterBar({
  search,
  onSearchChange,
  city,
  onCityChange,
  dateRange,
  onDateRangeChange,
  category,
  onCategoryChange,
  cityOptions,
  categoryOptions,
  resultCount,
  isPending = false,
  tone = 'light',
}: EventsFilterBarProps) {
  const { isPortuguese } = usePublicLocale()
  const isDark = tone === 'dark'
  const hasActiveFilters =
    Boolean(search) || city !== 'all' || dateRange !== 'all' || category !== 'all'

  return (
    <PublicReveal delayMs={80}>
      <div
        className={cn(
          'rounded-[2rem] border p-5 md:p-6',
          isDark
            ? 'border-white/10 bg-white/5'
            : 'border-bg-border bg-white shadow-card',
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={cn(
                'inline-flex rounded-full px-4 py-2 text-sm font-medium',
                isDark
                  ? 'border border-white/12 bg-white/8 text-white/70'
                  : 'border border-bg-border bg-bg-secondary text-text-secondary',
              )}
            >
              {resultCount} {isPortuguese ? 'experiencias' : 'experiences'}
            </span>
            {isPending ? (
              <span
                className={cn(
                  'inline-flex rounded-full px-4 py-2 text-sm font-medium',
                  isDark
                    ? 'border border-white/12 bg-white/10 text-white/70'
                    : 'border border-brand-navy/15 bg-brand-navy/8 text-brand-navy',
                )}
              >
                {isPortuguese ? 'Atualizando selecao' : 'Updating selection'}
              </span>
            ) : null}
          </div>

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={() => {
                onSearchChange('')
                onCityChange('all')
                onDateRangeChange('all')
                onCategoryChange('all')
              }}
              className={cn(
                'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300',
                isDark
                  ? 'border border-white/12 bg-white/8 text-white/70 hover:bg-white/12 hover:text-white'
                  : 'border border-bg-border bg-bg-secondary text-text-secondary hover:border-brand-navy/20 hover:text-text-primary',
              )}
            >
              <RotateCcw className="h-4 w-4" />
              {isPortuguese ? 'Limpar filtros' : 'Clear filters'}
            </button>
          ) : null}
        </div>

        <div className="mt-5 flex flex-wrap gap-4">
          <EventsSearchInput value={search} onChange={onSearchChange} isPending={isPending} tone={tone} />
          <FilterSelect
            label={isPortuguese ? 'Cidade' : 'City'}
            value={city}
            onChange={onCityChange}
            options={[
              { label: isPortuguese ? 'Todas as cidades' : 'All cities', value: 'all' },
              ...cityOptions.map((item) => ({ label: item, value: item })),
            ]}
            tone={tone}
          />
          <FilterSelect
            label={isPortuguese ? 'Data' : 'Date'}
            value={dateRange}
            onChange={onDateRangeChange}
            options={
              isPortuguese
                ? [...DATE_OPTIONS]
                : [
                    { label: 'Any date', value: 'all' },
                    { label: 'Next 30 days', value: '30d' },
                    { label: 'Next 90 days', value: '90d' },
                    { label: 'Later on', value: 'later' },
                  ]
            }
            tone={tone}
          />
          <FilterSelect
            label={isPortuguese ? 'Categoria' : 'Category'}
            value={category}
            onChange={onCategoryChange}
            options={[
              { label: isPortuguese ? 'Todas as categorias' : 'All categories', value: 'all' },
              ...categoryOptions.map((item) => ({ label: item, value: item })),
            ]}
            tone={tone}
          />
        </div>
      </div>
    </PublicReveal>
  )
}
