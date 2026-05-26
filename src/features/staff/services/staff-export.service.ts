import { supabase } from '@/lib/supabase'
import type { StaffMemberRow } from '@/features/staff/types'

export interface ArrivalProofRow {
  id: string
  event_id: string
  staff_id: string | null
  profile_id: string | null
  photo_url: string
  latitude: number
  longitude: number
  accuracy_meters: number | null
  distance_meters: number | null
  inside_geofence: boolean
  captured_at: string
  status: string
}

function formatDate(value?: string | null): string {
  if (!value) return ''
  try {
    return new Date(value).toLocaleString('pt-BR')
  } catch {
    return value
  }
}

function csvEscape(value: unknown): string {
  const s = value == null ? '' : String(value)
  if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes(';')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function triggerDownload(content: string | Blob, filename: string, mime: string) {
  const blob = content instanceof Blob ? content : new Blob(['﻿' + content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** Busca as provas de chegada de um evento */
export async function fetchArrivalProofs(eventId: string): Promise<ArrivalProofRow[]> {
  const { data, error } = await supabase
    .from('staff_arrival_proofs')
    .select('id, event_id, staff_id, profile_id, photo_url, latitude, longitude, accuracy_meters, distance_meters, inside_geofence, captured_at, status')
    .eq('event_id', eventId)
    .order('captured_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as ArrivalProofRow[]
}

/** Exporta a lista de staff em CSV (planilha) */
export function exportStaffCsv(staff: StaffMemberRow[], eventName: string) {
  const headers = [
    'Nome', 'Sobrenome', 'E-mail', 'Telefone', 'CPF', 'Função', 'Área', 'Empresa',
    'Turno', 'Início turno', 'Fim turno', 'Status', 'Check-in', 'Check-out', 'Cadastrado em',
  ]
  const rows = staff.map((s) => [
    s.first_name,
    s.last_name ?? '',
    s.email ?? '',
    s.phone ?? '',
    s.cpf ?? '',
    s.role_title ?? '',
    s.area ?? s.department ?? '',
    s.company ?? '',
    s.shift_label ?? '',
    formatDate(s.shift_starts_at),
    formatDate(s.shift_ends_at),
    s.status,
    formatDate(s.checked_in_at),
    formatDate(s.checked_out_at),
    formatDate(s.created_at),
  ])

  const csv = [headers, ...rows].map((r) => r.map(csvEscape).join(',')).join('\n')
  const safe = eventName.replace(/[^a-z0-9]+/gi, '-').toLowerCase()
  triggerDownload(csv, `staff-${safe}-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8')
}

/** Exporta as provas de chegada em CSV */
export function exportArrivalProofsCsv(proofs: ArrivalProofRow[], staffMap: Record<string, StaffMemberRow>, eventName: string) {
  const headers = ['Nome', 'E-mail', 'Telefone', 'Horário', 'Latitude', 'Longitude', 'Distância (m)', 'Dentro do raio', 'Precisão (m)', 'Status', 'Foto (URL)']
  const rows = proofs.map((p) => {
    const s = p.staff_id ? staffMap[p.staff_id] : undefined
    return [
      s ? `${s.first_name} ${s.last_name ?? ''}`.trim() : 'Desconhecido',
      s?.email ?? '',
      s?.phone ?? '',
      formatDate(p.captured_at),
      p.latitude,
      p.longitude,
      p.distance_meters != null ? Math.round(p.distance_meters) : '',
      p.inside_geofence ? 'Sim' : 'Não',
      p.accuracy_meters != null ? Math.round(p.accuracy_meters) : '',
      p.status,
      p.photo_url,
    ]
  })
  const csv = [headers, ...rows].map((r) => r.map(csvEscape).join(',')).join('\n')
  const safe = eventName.replace(/[^a-z0-9]+/gi, '-').toLowerCase()
  triggerDownload(csv, `presencas-${safe}-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8')
}

/** Gera um relatório PDF (via janela de impressão do navegador) com staff + provas de chegada */
export function exportEventReportPdf(params: {
  eventName: string
  staff: StaffMemberRow[]
  proofs: ArrivalProofRow[]
}) {
  const { eventName, staff, proofs } = params
  const staffMap: Record<string, StaffMemberRow> = {}
  staff.forEach((s) => { staffMap[s.id] = s })

  const now = new Date().toLocaleString('pt-BR')
  const confirmed = proofs.filter((p) => p.inside_geofence).length

  const staffRows = staff.map((s) => `
    <tr>
      <td>${s.first_name} ${s.last_name ?? ''}</td>
      <td>${s.email ?? '-'}</td>
      <td>${s.phone ?? '-'}</td>
      <td>${s.role_title ?? '-'}</td>
      <td>${s.area ?? s.department ?? '-'}</td>
      <td>${s.status}</td>
      <td>${s.checked_in_at ? formatDate(s.checked_in_at) : '-'}</td>
    </tr>`).join('')

  const proofRows = proofs.map((p) => {
    const s = p.staff_id ? staffMap[p.staff_id] : undefined
    return `
      <tr>
        <td>${s ? `${s.first_name} ${s.last_name ?? ''}`.trim() : 'Desconhecido'}</td>
        <td>${formatDate(p.captured_at)}</td>
        <td>${p.distance_meters != null ? Math.round(p.distance_meters) + 'm' : '-'}</td>
        <td style="color:${p.inside_geofence ? '#16a34a' : '#dc2626'}">${p.inside_geofence ? 'Confirmado' : 'Fora do raio'}</td>
        <td><a href="${p.photo_url}">Ver foto</a></td>
      </tr>`
  }).join('')

  const html = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="utf-8"><title>Relatório — ${eventName}</title>
<style>
  * { font-family: -apple-system, Segoe UI, Roboto, sans-serif; }
  body { padding: 32px; color: #111; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  .sub { color: #666; font-size: 13px; margin-bottom: 24px; }
  .kpis { display: flex; gap: 24px; margin-bottom: 28px; }
  .kpi { border: 1px solid #e5e5e5; border-radius: 12px; padding: 14px 18px; }
  .kpi .v { font-size: 26px; font-weight: 700; }
  .kpi .l { font-size: 11px; color: #777; text-transform: uppercase; letter-spacing: .05em; }
  h2 { font-size: 15px; margin: 28px 0 10px; border-bottom: 2px solid #0A1AFF; padding-bottom: 6px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { text-align: left; background: #f5f5f7; padding: 8px; border-bottom: 1px solid #ddd; }
  td { padding: 7px 8px; border-bottom: 1px solid #eee; }
  @media print { body { padding: 0; } a { color: #0A1AFF; text-decoration: none; } }
</style></head>
<body>
  <h1>Relatório do Evento — ${eventName}</h1>
  <div class="sub">Gerado em ${now} · Pulse — Gestão de Eventos</div>
  <div class="kpis">
    <div class="kpi"><div class="v">${staff.length}</div><div class="l">Staff cadastrado</div></div>
    <div class="kpi"><div class="v">${proofs.length}</div><div class="l">Provas de chegada</div></div>
    <div class="kpi"><div class="v">${confirmed}</div><div class="l">Presenças confirmadas</div></div>
  </div>

  <h2>Equipe cadastrada (${staff.length})</h2>
  <table>
    <thead><tr><th>Nome</th><th>E-mail</th><th>Telefone</th><th>Função</th><th>Área</th><th>Status</th><th>Check-in</th></tr></thead>
    <tbody>${staffRows || '<tr><td colspan="7">Nenhum cadastro.</td></tr>'}</tbody>
  </table>

  <h2>Provas de chegada — foto + GPS + horário (${proofs.length})</h2>
  <table>
    <thead><tr><th>Nome</th><th>Horário</th><th>Distância</th><th>Presença</th><th>Foto</th></tr></thead>
    <tbody>${proofRows || '<tr><td colspan="5">Nenhuma prova registrada.</td></tr>'}</tbody>
  </table>

  <script>window.onload = () => { window.print(); }</script>
</body></html>`

  const win = window.open('', '_blank')
  if (win) {
    win.document.write(html)
    win.document.close()
  } else {
    // Fallback: baixa o HTML se popup bloqueado
    triggerDownload(html, `relatorio-${eventName.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.html`, 'text/html')
  }
}
