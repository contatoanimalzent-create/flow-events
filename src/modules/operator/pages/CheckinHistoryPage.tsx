import React, { useEffect, useState } from 'react'
import { ChevronLeft, CheckCircle, Search, Loader2, RefreshCw } from 'lucide-react'
import { useAppContext } from '@/core/context/app-context.store'
import { operatorService } from '@/core/operator/operator.service'
import type { PulsePageProps } from '@/features/pulse/pulse.utils'
import type { CheckinRecord } from '@/core/operator/operator.service'

export default function CheckinHistoryPage({ onNavigate }: PulsePageProps) {
  const context = useAppContext((s) => s.context)
  const [records, setRecords] = useState<CheckinRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const loadHistory = async () => {
    if (!context?.eventId) return
    setLoading(true)
    try {
      const data = await operatorService.getCheckinHistory(context.eventId, 100)
      setRecords(data)
    } catch (err) {
      console.error('[history]', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadHistory() }, [context?.eventId])

  const filtered = search
    ? records.filter((r) =>
        r.attendeeName.toLowerCase().includes(search.toLowerCase()) ||
        r.ticketLabel.toLowerCase().includes(search.toLowerCase())
      )
    : records

  return (
    <div className="flex flex-col min-h-full bg-[#060d1f] pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-5 pb-3" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 20px)' }}>
        <button onClick={() => onNavigate('/pulse/operator')} className="p-2 -ml-2">
          <ChevronLeft size={22} className="text-slate-300" />
        </button>
        <h1 className="text-lg font-bold text-white flex-1">Histórico de Check-in</h1>
        <button onClick={loadHistory} className="p-2">
          <RefreshCw size={16} className="text-slate-400" />
        </button>
      </div>

      {/* Search */}
      <div className="px-4 mb-3">
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5">
          <Search size={14} className="text-slate-500 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar nome ou ingresso…"
            className="flex-1 bg-transparent text-white text-sm placeholder-slate-600 outline-none"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="px-4 mb-4">
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2">
          <CheckCircle size={14} className="text-green-400" />
          <p className="text-green-300 text-sm font-medium">
            {records.length} check-in{records.length !== 1 ? 's' : ''} registrado{records.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={24} className="text-blue-400 animate-spin" />
        </div>
      ) : (
        <div className="px-4 space-y-2">
          {filtered.length === 0 && (
            <p className="text-slate-600 text-sm text-center py-10">
              {search ? 'Nenhum resultado encontrado' : 'Nenhum check-in ainda'}
            </p>
          )}
          {filtered.map((r) => (
            <div key={r.id} className="flex items-center gap-3 bg-white/4 border border-white/6 rounded-xl px-4 py-3">
              <CheckCircle size={16} className="text-green-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{r.attendeeName}</p>
                <p className="text-slate-500 text-xs">{r.ticketLabel}{r.gate ? ` · ${r.gate}` : ''}</p>
              </div>
              <span className="text-slate-500 text-xs shrink-0">
                {new Date(r.validAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
