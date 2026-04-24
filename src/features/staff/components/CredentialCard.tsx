import { useRef } from 'react'
import { Printer, Download, Calendar, MapPin, Clock, ShieldCheck } from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────

export interface CredentialData {
  id:              string
  name:            string
  role_label:      string
  credential_type: 'staff' | 'vip' | 'media' | 'vendor' | 'speaker' | string
  photo_url?:      string | null
  color_hex?:      string | null
  access_zones:    string[]
  valid_from:      string
  valid_until:     string
  qr_code_value:   string
  event?: {
    name:       string
    starts_at:  string
    ends_at:    string
    venue_name: string
  }
}

interface CredentialCardProps {
  credential: CredentialData
}

// ─── Config ─────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<string, { bg: string; text: string; badge: string; label: string }> = {
  staff:   { bg: '#0d1b35', text: '#f5f0e8', badge: '#3a6fb2',  label: 'STAFF'       },
  vip:     { bg: '#1a1200', text: '#f5f0e8', badge: '#d4a017',  label: 'VIP'         },
  media:   { bg: '#011a1a', text: '#f5f0e8', badge: '#0e9488',  label: 'IMPRENSA'    },
  vendor:  { bg: '#181c20', text: '#f5f0e8', badge: '#6b7280',  label: 'FORNECEDOR'  },
  speaker: { bg: '#160d2a', text: '#f5f0e8', badge: '#7c3aed',  label: 'PALESTRANTE' },
}

const DEFAULT_CONFIG = { bg: '#12161f', text: '#f5f0e8', badge: '#5c1eb2', label: 'CREDENCIAL' }

function getConfig(type: string, colorHex?: string | null) {
  const base = TYPE_CONFIG[type] ?? DEFAULT_CONFIG
  return colorHex ? { ...base, badge: colorHex } : base
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function getInitials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

// ─── Component ──────────────────────────────────────────────────────────────

export function CredentialCard({ credential }: CredentialCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const cfg     = getConfig(credential.credential_type, credential.color_hex)

  // ── Print ──────────────────────────────────────────────────────────────
  const handlePrint = () => {
    const printContent = cardRef.current?.outerHTML
    if (!printContent) return
    const win = window.open('', '_blank', 'width=800,height=600')
    if (!win) return
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Credencial, ${credential.name}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&display=swap');
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { background: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: Manrope, system-ui, sans-serif; }
            @media print {
              body { margin: 0; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 500)
  }

  // ── Download QR as PNG ─────────────────────────────────────────────────
  const handleDownloadQR = async () => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(credential.qr_code_value)}&ecc=H`
    try {
      const response = await fetch(qrUrl)
      const blob     = await response.blob()
      const url      = URL.createObjectURL(blob)
      const a        = document.createElement('a')
      a.href         = url
      a.download     = `qr-${credential.id}.png`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // Fallback: open in new tab
      window.open(qrUrl, '_blank')
    }
  }

  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(credential.qr_code_value)}&ecc=H&bgcolor=ffffff&color=000000`

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col items-center gap-5 p-6">

      {/* ── Card (85mm × 54mm ≈ 3.35in × 2.13in → 336px × 213px at 100dpi) */}
      <div
        ref={cardRef}
        style={{
          width:        '336px',
          height:       '213px',
          background:   cfg.bg,
          color:        cfg.text,
          borderRadius: '12px',
          overflow:     'hidden',
          position:     'relative',
          fontFamily:   'Manrope, system-ui, sans-serif',
          boxShadow:    '0 8px 40px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.25)',
          display:      'flex',
          flexDirection:'row',
        }}
      >
        {/* Left stripe */}
        <div style={{ width: '8px', background: cfg.badge, flexShrink: 0 }} />

        {/* Left panel, photo + type badge */}
        <div style={{ width: '96px', padding: '14px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', borderRight: `1px solid ${cfg.badge}22`, flexShrink: 0 }}>
          {/* Photo / initials */}
          {credential.photo_url ? (
            <img
              src={credential.photo_url}
              alt={credential.name}
              style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${cfg.badge}` }}
            />
          ) : (
            <div style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: cfg.badge,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px', fontWeight: 800, color: '#fff',
            }}>
              {getInitials(credential.name)}
            </div>
          )}

          {/* Type badge */}
          <div style={{
            background:   cfg.badge,
            color:        '#fff',
            fontSize:     '9px',
            fontWeight:   800,
            letterSpacing:'1.5px',
            padding:      '3px 6px',
            borderRadius: '4px',
            textAlign:    'center',
          }}>
            {cfg.label}
          </div>

          {/* ID short */}
          <div style={{ fontSize: '8px', color: `${cfg.text}60`, letterSpacing: '0.5px', textAlign: 'center', marginTop: 'auto' }}>
            #{credential.id.slice(-6).toUpperCase()}
          </div>
        </div>

        {/* Center panel, info */}
        <div style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden' }}>
          {/* Event name */}
          {credential.event && (
            <div style={{ fontSize: '8px', fontWeight: 700, color: cfg.badge, letterSpacing: '1px', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {credential.event.name}
            </div>
          )}

          {/* Person name */}
          <div style={{ fontSize: '14px', fontWeight: 800, lineHeight: 1.2, color: cfg.text, marginTop: '2px' }}>
            {credential.name}
          </div>

          {/* Role */}
          <div style={{ fontSize: '10px', fontWeight: 600, color: `${cfg.text}aa` }}>
            {credential.role_label}
          </div>

          {/* Zones */}
          {credential.access_zones.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginTop: '4px' }}>
              {credential.access_zones.slice(0, 4).map(zone => (
                <span key={zone} style={{
                  background:   `${cfg.badge}33`,
                  border:       `1px solid ${cfg.badge}66`,
                  color:        cfg.text,
                  fontSize:     '8px',
                  fontWeight:   600,
                  padding:      '1px 5px',
                  borderRadius: '3px',
                }}>
                  {zone}
                </span>
              ))}
              {credential.access_zones.length > 4 && (
                <span style={{ fontSize: '8px', color: `${cfg.text}70` }}>+{credential.access_zones.length - 4}</span>
              )}
            </div>
          )}

          {/* Dates */}
          <div style={{ marginTop: 'auto', fontSize: '8px', color: `${cfg.text}70`, display: 'flex', gap: '6px' }}>
            <span>{formatDate(credential.valid_from)}</span>
            <span>→</span>
            <span>{formatDate(credential.valid_until)}</span>
          </div>

          {/* Venue */}
          {credential.event?.venue_name && (
            <div style={{ fontSize: '8px', color: `${cfg.text}55`, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {credential.event.venue_name}
            </div>
          )}
        </div>

        {/* Right panel, QR code */}
        <div style={{ width: '80px', padding: '10px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', background: '#fff', flexShrink: 0 }}>
          <img
            src={qrSrc}
            alt="QR Code"
            width={64}
            height={64}
            style={{ display: 'block' }}
          />
          <div style={{ fontSize: '7px', color: '#666', textAlign: 'center', letterSpacing: '0.3px' }}>
            Scan para validar
          </div>
          <ShieldCheck style={{ width: '12px', height: '12px', color: cfg.badge }} />
        </div>

        {/* Decorative dots top-right */}
        <div style={{
          position: 'absolute', top: 6, right: 88,
          width: 6, height: 6, borderRadius: '50%',
          background: `${cfg.badge}40`,
        }} />
        <div style={{
          position: 'absolute', top: 14, right: 92,
          width: 4, height: 4, borderRadius: '50%',
          background: `${cfg.badge}25`,
        }} />
      </div>

      {/* ── Event meta (outside card, visible in UI) ─────────────────── */}
      {credential.event && (
        <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(credential.event.starts_at)}, {formatDate(credential.event.ends_at)}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {credential.event.venue_name}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            Válido até {formatDate(credential.valid_until)}
          </span>
        </div>
      )}

      {/* ── Action buttons ────────────────────────────────────────────── */}
      <div className="flex gap-3">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 rounded-sm bg-bg-card border border-bg-border px-4 py-2 text-sm font-semibold text-text-primary hover:bg-bg-elevated transition-colors"
        >
          <Printer className="h-4 w-4" />
          Imprimir
        </button>
        <button
          onClick={handleDownloadQR}
          className="flex items-center gap-2 rounded-sm bg-brand-yellow px-4 py-2 text-sm font-bold text-brand-navy hover:opacity-90 transition-opacity"
        >
          <Download className="h-4 w-4" />
          Baixar QR
        </button>
      </div>
    </div>
  )
}
