import React, { useState } from 'react'
import { ChevronLeft, Search, CheckCircle, XCircle, Loader2, User } from 'lucide-react'
import { useAppContext } from '@/core/context/app-context.store'
import { operatorService } from '@/core/operator/operator.service'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'

interface Attendee {
  ticketId: string
  attendeeId: string
  name: string
  email: string
  ticketType: string
  status: string
}

type CheckResult = { success: true; name: string } | { success: false; message: string }

export default function ManualCheckPage({ onNavigate }: PulsePageProps) {
  const context = useAppContext((s) => s.context)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Attendee[]>([])
  const [loading, setLoading] = useState(false)
  const [searchError, setSearchError] = useState(false)
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null)
  const [checkingId, setCheckingId] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!query.trim() || !context?.eventId) return
    setLoading(true)
    setResults([])
    setCheckResult(null)
    setSearchError(false)
    try {
      const data = await operatorService.searchAttendee(query, context.eventId)
      setResults(data)
    } catch {
      setResults([])
      setSearchError(true)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckin = async (attendee: Attendee) => {
    if (attendee.status === 'used') {
      setCheckResult({ success: false, message: 'Ingresso já utilizado' })
      return
    }
    if (!context?.eventId) {
      setCheckResult({ success: false, message: 'Nenhum evento selecionado' })
      return
    }
    setCheckingId(attendee.ticketId)
    try {
      const res = await operatorService.validateToken(attendee.ticketId, context.eventId, 'manual')
      setCheckResult(
        res.valid
          ? { success: true, name: res.name }
          : { success: false, message: res.message }
      )
    } catch {
      setCheckResult({ success: false, message: 'Erro na validação' })
    } finally {
      setCheckingId(null)
    }
  }

  return (
    <div className="flex flex-col min-h-full bg-[#060d1f] pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>
        <button onClick={() => onNavigate('/pulse/operator')} className="p-2 -ml-2">
          <ChevronLeft size={22} className="text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-white">Busca Manual</h1>
      </div>

      {/* Search bar */}
      <div className="px-4 mb-4">
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-3">
            <Search size={14} className="text-slate-500 shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Nome, e-mail ou CPF…"
              className="flex-1 bg-transparent text-white text-sm placeholder-slate-600 outline-none"
              autoFocus
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={!query.trim() || loading}
            className="px-4 bg-blue-600 rounded-xl text-white text-sm font-semibold disabled:opacity-40"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Buscar'}
          </button>
        </div>
      </div>

      {/* Result feedback */}
      {checkResult && (
        <div className="px-4 mb-4">
          <div
            className="flex items-center gap-3 rounded-xl p-3 border"
            style={{
              backgroundColor: checkResult.success ? '#052e16' : '#450a0a',
              borderColor: checkResult.success ? '#22C55E44' : '#EF444444',
            }}
          >
            {checkResult.success
              ? <CheckCircle size={20} className="text-green-400 shrink-0" />
              : <XCircle size={20} className="text-red-400 shrink-0" />
            }
            <p className={`text-sm font-medium ${checkResult.success ? 'text-green-300' : 'text-red-300'}`}>
              {checkResult.success ? `✓ Check-in de ${checkResult.name} realizado` : checkResult.message}
            </p>
          </div>
        </div>
      )}

      {/* Results list */}
      <div className="px-4 space-y-3">
        {results.length === 0 && !loading && query && (
          <p className="text-slate-600 text-sm text-center py-8">Nenhum participante encontrado</p>
        )}
        {results.map((a) => (
          <div key={a.ticketId} className="bg-white/5 border border-white/8 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                <User size={18} className="text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">{a.name}</p>
                <p className="text-slate-400 text-xs truncate">{a.email}</p>
                <p className="text-slate-500 text-xs mt-0.5">{a.ticketType}</p>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    a.status === 'used' ? 'bg-slate-700 text-slate-400'
                    : a.status === 'active' || a.status === 'paid' ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {a.status === 'used' ? 'Utilizado' : a.status === 'active' || a.status === 'paid' ? 'Válido' : a.status}
                </span>
                {a.status !== 'used' && (
                  <button
                    onClick={() => handleCheckin(a)}
                    disabled={checkingId === a.ticketId}
                    className="px-3 py-1.5 bg-blue-600 rounded-lg text-white text-xs font-semibold disabled:opacity-40 flex items-center gap-1"
                  >
                    {checkingId === a.ticketId ? <Loader2 size={12} className="animate-spin" /> : null}
                    Check-in
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
