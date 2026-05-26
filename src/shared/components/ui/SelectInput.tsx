import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/shared/lib'

export interface SelectOption {
  value: string
  label: string
}

interface SelectInputProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  className?: string
  triggerClassName?: string
  disabled?: boolean
}

export function SelectInput({ value, onChange, options, placeholder = 'Selecione...', className, triggerClassName, disabled }: SelectInputProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [])

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex w-full items-center justify-between gap-2 truncate text-left transition-all',
          'input h-9 pr-3 text-xs',
          open && 'border-[#0057E7] shadow-[0_0_0_3px_rgba(0,87,231,0.18)]',
          disabled && 'cursor-not-allowed opacity-50',
          triggerClassName,
        )}
      >
        <span className={cn('truncate', !selected && 'text-white/30')}>{selected?.label ?? placeholder}</span>
        <ChevronDown className={cn('h-3.5 w-3.5 shrink-0 text-white/40 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-[200] mt-1 overflow-hidden rounded-xl border border-white/10 bg-[#0e1420] shadow-2xl">
          <ul className="max-h-60 overflow-y-auto py-1">
            {options.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt.value)
                    setOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center px-4 py-2.5 text-left text-xs transition-colors',
                    opt.value === value
                      ? 'bg-[#0057E7]/20 text-[#4285F4]'
                      : 'text-white/70 hover:bg-white/[0.06] hover:text-white',
                  )}
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
