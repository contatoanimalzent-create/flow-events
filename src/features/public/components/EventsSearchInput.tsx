import { Loader2, Search } from 'lucide-react'

interface EventsSearchInputProps {
  value: string
  onChange: (value: string) => void
  isPending?: boolean
}

export function EventsSearchInput({ value, onChange, isPending = false }: EventsSearchInputProps) {
  return (
    <label className="block min-w-[18rem] flex-1">
      <div className="mb-3 text-[11px] uppercase tracking-[0.28em] text-[#8e7f68]">Buscar experiencias</div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8e7f68]" />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Nome, cidade, venue ou atmosfera"
          className="w-full rounded-full border border-[#ddd1bf] bg-white/78 px-12 py-3.5 text-sm text-[#1f1a15] outline-none transition-all duration-300 placeholder:text-[#a2927e] focus:border-[#b79e74] focus:bg-white focus:shadow-[0_12px_24px_rgba(48,35,18,0.08)]"
        />
        {isPending ? <Loader2 className="absolute right-5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[#8e7f68]" /> : null}
      </div>
    </label>
  )
}
