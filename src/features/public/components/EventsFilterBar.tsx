import { RotateCcw } from 'lucide-react'
import { PremiumBadge } from './PremiumBadge'
import { EventsSearchInput } from './EventsSearchInput'
import { PublicReveal } from './PublicReveal'

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
}

const DATE_OPTIONS = [
  { label: 'Qualquer data', value: 'all' },
  { label: 'Proximos 30 dias', value: '30d' },
  { label: 'Proximos 90 dias', value: '90d' },
  { label: 'Mais adiante', value: 'later' },
] as const

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: Array<{ label: string; value: string }>
}) {
  return (
    <label className="block min-w-[11rem]">
      <div className="mb-3 text-[11px] uppercase tracking-[0.28em] text-[#8e7f68]">{label}</div>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-full border border-[#ddd1bf] bg-white/78 px-4 py-3.5 text-sm text-[#1f1a15] outline-none transition-all duration-300 focus:border-[#b79e74] focus:bg-white focus:shadow-[0_12px_24px_rgba(48,35,18,0.08)]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
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
}: EventsFilterBarProps) {
  const hasActiveFilters = Boolean(search) || city !== 'all' || dateRange !== 'all' || category !== 'all'

  return (
    <PublicReveal delayMs={80}>
      <div className="rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(250,244,236,0.78))] p-5 shadow-[0_18px_55px_rgba(48,35,18,0.06)] md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <PremiumBadge tone="default" className="border-[#ddd1bf] bg-white/82 text-[#5f5549]">
              {resultCount} experiencias
            </PremiumBadge>
            {isPending ? (
              <PremiumBadge tone="accent" className="border-[#e1d0ab] bg-[#f7edd1] text-[#6d5324]">
                Atualizando selecao
              </PremiumBadge>
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
              className="inline-flex items-center gap-2 rounded-full border border-[#ddd1bf] bg-white/72 px-4 py-2 text-sm font-medium text-[#5f5549] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white"
            >
              <RotateCcw className="h-4 w-4" />
              Limpar filtros
            </button>
          ) : null}
        </div>

        <div className="mt-5 flex flex-wrap gap-4">
          <EventsSearchInput value={search} onChange={onSearchChange} isPending={isPending} />
          <FilterSelect
            label="Cidade"
            value={city}
            onChange={onCityChange}
            options={[{ label: 'Todas as cidades', value: 'all' }, ...cityOptions.map((item) => ({ label: item, value: item }))]}
          />
          <FilterSelect
            label="Data"
            value={dateRange}
            onChange={onDateRangeChange}
            options={[...DATE_OPTIONS]}
          />
          <FilterSelect
            label="Categoria"
            value={category}
            onChange={onCategoryChange}
            options={[{ label: 'Todas as categorias', value: 'all' }, ...categoryOptions.map((item) => ({ label: item, value: item }))]}
          />
        </div>
      </div>
    </PublicReveal>
  )
}
